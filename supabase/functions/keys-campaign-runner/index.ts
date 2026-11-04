import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Envío de campañas de KEYS (solo tenant vitrina-demo), con hora de Colombia,
// estado automático, correo de confirmación y reporte de rebotes (Brevo).
// NO toca ni reemplaza a dynamic-action (el despachador compartido): las
// campañas de KEYS se "programan" con campaigns.auto_send = true y status
// 'pendiente', así que dynamic-action (que solo mira status 'programada') nunca
// las ve. Usa el secreto exclusivo KEYS_BREVO_API_KEY.
//
// Modos (POST, JSON):
//   {}                                          -> cron cada 5 min: envía lo vencido + reporta rebotes
//   {action:"send_now", campaign_id}            -> envío manual (requiere sesión del panel)
//   {action:"check_bounces", campaign_id}       -> re-verifica entrega/rebotes (requiere sesión)

const TENANT_ID = "b0595b11-afa2-41de-8296-51ead8b14ecf";
const SENDER_EMAIL = "keysmarketingdigital@gmail.com";
const SENDER_NAME = "KEYS Marketing Digital";
const REPORT_TO = "keysmarketingdigital@gmail.com";
const MAX_RECIPIENTS = 200;
const BOUNCE_WAIT_MIN = 20;

const BREVO = Deno.env.get("KEYS_BREVO_API_KEY") ?? "";
const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SB_ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const admin = createClient(SB_URL, SB_SERVICE);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { ...cors, "Content-Type": "application/json" } });

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

// Hora actual en Colombia (UTC-5, sin horario de verano).
function bogotaNow() {
  const d = new Date(Date.now() - 5 * 3600 * 1000).toISOString();
  return { date: d.slice(0, 10), time: d.slice(11, 19) };
}

function unpackMessage(m: string | null) {
  const r = /^Producto\/servicio:\s*([^\n]*)\n?([\s\S]*)$/.exec(m ?? "");
  return r ? r[2] : (m ?? "");
}

function buildHtml(name: string, message: string, landingUrl: string, toName: string) {
  const greeting = toName ? `Hola ${esc(toName)},` : "Hola,";
  return `
    <html><body style="font-family:Arial,sans-serif;color:#111;max-width:600px;margin:0 auto;padding:24px">
      <p>${greeting}</p>
      <h1 style="color:#0f172a;font-size:20px">${esc(name)}</h1>
      <p style="white-space:pre-wrap">${esc(message)}</p>
      ${landingUrl ? `<p><a href="${esc(landingUrl)}" style="background:#0f172a;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;display:inline-block">Ver más</a></p>` : ""}
      <p style="font-size:12px;color:#666">KEYS Marketing Digital · keysmarketingdigital.com</p>
    </body></html>`;
}

async function brevoSend(to: string, toName: string, subject: string, html: string) {
  try {
    const r = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": BREVO, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ sender: { email: SENDER_EMAIL, name: SENDER_NAME }, to: [{ email: to, name: toName || "" }], subject, htmlContent: html }),
    });
    if (r.ok) {
      const b = await r.json().catch(() => ({}));
      return { ok: true as const, id: (b.messageId as string) ?? null };
    }
    return { ok: false as const, error: (await r.text()).slice(0, 300) };
  } catch (e) {
    return { ok: false as const, error: String(e).slice(0, 300) };
  }
}

async function notify(subject: string, bodyHtml: string) {
  const html = `<html><body style="font-family:Arial,sans-serif;color:#111;max-width:640px;margin:0 auto;padding:24px">${bodyHtml}
    <p style="font-size:12px;color:#666;margin-top:24px">Aviso automático del panel de campañas de KEYS.</p></body></html>`;
  const r = await brevoSend(REPORT_TO, SENDER_NAME, subject, html);
  if (!r.ok) console.log("[notify] falló:", r.error);
}

const li = (items: string[]) => (items.length ? `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>` : "");

// ---------------------------------------------------------------- envío
async function sendCampaign(id: string, force: boolean) {
  // Reclamo atómico: evita doble envío si coinciden el cron y el botón manual.
  const staleIso = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  let claimed = await admin.from("campaigns")
    .update({ status: "enviando", sent_at: new Date().toISOString(), run_note: null })
    .eq("id", id).eq("tenant_id", TENANT_ID).eq("status", "pendiente").select("*").maybeSingle();
  if (!claimed.data) {
    // Recupera un envío que quedó trabado hace más de 15 min (los ya enviados no se repiten).
    claimed = await admin.from("campaigns")
      .update({ sent_at: new Date().toISOString() })
      .eq("id", id).eq("tenant_id", TENANT_ID).eq("status", "enviando").lt("sent_at", staleIso).select("*").maybeSingle();
  }
  const c = claimed.data;
  if (!c) return { skipped: true, reason: "La campaña ya se está enviando o ya fue realizada." };

  const finishFail = async (note: string) => {
    await admin.from("campaigns").update({ status: "pendiente", auto_send: false, run_note: note }).eq("id", id);
    await notify(`⚠️ Campaña NO enviada: ${esc(c.name)}`,
      `<h2>La campaña "${esc(c.name)}" no se envió</h2><p>${esc(note)}</p><p>Ábrela en el panel, corrige y vuelve a programarla.</p>`);
    return { sent: 0, failed: 0, error: note };
  };

  if (!c.channel_email) return await finishFail("La campaña no tiene el canal Correo activo.");

  const { data: rows } = await admin.from("campaign_recipients")
    .select("id, contact_id, status, contacts(name, email, folder_id)")
    .eq("campaign_id", id).eq("channel", "email");
  const all = rows ?? [];
  if (!all.length) return await finishFail("No tiene destinatarios guardados (se evita enviarla a todos tus contactos).");

  // Solo los pendientes (no repite a los ya enviados) y solo leads de la carpeta de la campaña.
  const pending = all.filter((r: any) => r.status === "pendiente").slice(0, MAX_RECIPIENTS);
  const message = unpackMessage(c.message);
  const failures: string[] = [];
  let sentNow = 0;

  for (let i = 0; i < pending.length; i += 10) {
    const batch = pending.slice(i, i + 10);
    await Promise.all(batch.map(async (r: any) => {
      const ct = r.contacts;
      const sameFolder = String(ct?.folder_id ?? "") === String(c.folder_id ?? "");
      if (!ct?.email || !String(ct.email).includes("@")) {
        await admin.from("campaign_recipients").update({ status: "fallido", error_message: "Sin correo válido" }).eq("id", r.id);
        failures.push(`${esc(ct?.name ?? "(sin nombre)")} — sin correo válido`);
        return;
      }
      if (!sameFolder) {
        await admin.from("campaign_recipients").update({ status: "fallido", error_message: "No pertenece a la carpeta de la campaña" }).eq("id", r.id);
        failures.push(`${esc(ct.name)} (${esc(ct.email)}) — no pertenece a la carpeta de la campaña`);
        return;
      }
      const res = await brevoSend(ct.email, ct.name ?? "", c.name, buildHtml(c.name, message, c.landing_url ?? "", ct.name ?? ""));
      if (res.ok) {
        sentNow++;
        await admin.from("campaign_recipients").update({ status: "enviado", provider_id: res.id, sent_at: new Date().toISOString(), error_message: null }).eq("id", r.id);
      } else {
        await admin.from("campaign_recipients").update({ status: "fallido", error_message: res.error }).eq("id", r.id);
        failures.push(`${esc(ct.name)} (${esc(ct.email)}) — ${esc(res.error)}`);
      }
    }));
  }

  const { count: totalSent } = await admin.from("campaign_recipients").select("id", { count: "exact", head: true })
    .eq("campaign_id", id).eq("channel", "email").in("status", ["enviado", "rebotado"]);
  const { count: totalFailed } = await admin.from("campaign_recipients").select("id", { count: "exact", head: true })
    .eq("campaign_id", id).eq("channel", "email").eq("status", "fallido");

  if (!totalSent) {
    return await finishFail(`Ningún correo salió. ${failures[0] ? "Primer error: " + failures[0].replace(/<[^>]+>/g, "") : ""}`.trim());
  }

  await admin.from("campaigns").update({
    status: "realizada", auto_send: false, sent_count: totalSent, failed_count: totalFailed ?? 0,
    bounced_count: null, bounce_report_at: null,
    run_note: force ? "Enviada manualmente desde el panel." : "Enviada automáticamente a la hora programada.",
  }).eq("id", id);

  await notify(`✅ Campaña enviada: ${esc(c.name)}`,
    `<h2>Campaña enviada ✅</h2>
     <p><strong>${esc(c.name)}</strong></p>
     <p>Correos enviados: <strong>${totalSent}</strong><br>Con error de envío: <strong>${totalFailed ?? 0}</strong></p>
     ${failures.length ? `<p>Detalle de errores:</p>${li(failures)}` : ""}
     <p>En unos ${BOUNCE_WAIT_MIN} minutos te llegará otro correo con el reporte de rebotes (correos que no pudieron entregarse).</p>`);
  return { sent: totalSent, failed: totalFailed ?? 0 };
}

// -------------------------------------------------------------- rebotes
const BAD_EVENTS = new Set(["hardBounces", "softBounces", "blocked", "invalid", "spam", "error"]);
const EVENT_LABEL: Record<string, string> = {
  hardBounces: "rebote definitivo (el correo no existe o no acepta mensajes)",
  softBounces: "rebote temporal (buzón lleno o servidor no disponible)",
  blocked: "bloqueado por el servidor receptor",
  invalid: "correo inválido",
  spam: "marcado como spam",
  error: "error de entrega",
};

async function checkBounces(id: string, sendEmail: boolean) {
  const { data: c } = await admin.from("campaigns").select("*").eq("id", id).eq("tenant_id", TENANT_ID).maybeSingle();
  if (!c) return { error: "Campaña no encontrada" };
  const { data: rows } = await admin.from("campaign_recipients")
    .select("id, status, provider_id, contacts(name, email)")
    .eq("campaign_id", id).eq("channel", "email").in("status", ["enviado", "rebotado"]);
  const list = rows ?? [];
  const bounced: string[] = [];
  let delivered = 0, unknown = 0;

  for (let i = 0; i < list.length; i += 5) {
    await Promise.all(list.slice(i, i + 5).map(async (r: any) => {
      const email = r.contacts?.email ?? "";
      if (!r.provider_id) { unknown++; return; }
      try {
        const u = `https://api.brevo.com/v3/smtp/statistics/events?messageId=${encodeURIComponent(r.provider_id)}&days=7&limit=50`;
        const resp = await fetch(u, { headers: { "api-key": BREVO, Accept: "application/json" } });
        if (!resp.ok) { unknown++; return; }
        const body = await resp.json();
        const events: any[] = body.events ?? [];
        const bad = events.find((e) => BAD_EVENTS.has(e.event));
        if (bad) {
          const why = `${EVENT_LABEL[bad.event] ?? bad.event}${bad.reason ? ": " + bad.reason : ""}`;
          bounced.push(`${esc(r.contacts?.name ?? "")} (${esc(email)}) — ${esc(why)}`);
          await admin.from("campaign_recipients").update({ status: "rebotado", error_message: String(why).slice(0, 300) }).eq("id", r.id);
        } else {
          if (events.some((e) => e.event === "delivered")) delivered++; else unknown++;
          if (r.status === "rebotado") await admin.from("campaign_recipients").update({ status: "enviado", error_message: null }).eq("id", r.id);
        }
      } catch { unknown++; }
    }));
  }

  await admin.from("campaigns").update({ bounced_count: bounced.length, bounce_report_at: new Date().toISOString() }).eq("id", id);

  if (sendEmail) {
    await notify(
      bounced.length ? `⚠️ Rebotes en la campaña: ${esc(c.name)}` : `📬 Campaña entregada sin rebotes: ${esc(c.name)}`,
      `<h2>Reporte de entrega</h2><p><strong>${esc(c.name)}</strong></p>
       <p>Enviados: <strong>${list.length}</strong><br>Entregados confirmados: <strong>${delivered}</strong><br>
       Rebotados: <strong>${bounced.length}</strong><br>Aún sin confirmar: <strong>${unknown}</strong></p>
       ${bounced.length ? `<p>Estos correos NO se entregaron (revísalos o quítalos de tus leads):</p>${li(bounced)}` : "<p>Ningún correo rebotó. 🎉</p>"}
       ${unknown ? "<p>Los \"sin confirmar\" todavía pueden estar en camino; en el panel puedes pulsar \"Verificar entrega\" más tarde.</p>" : ""}`);
  }
  return { sent: list.length, delivered, bounced: bounced.length, unknown };
}

// ----------------------------------------------------------------- cron
async function runCron() {
  const now = bogotaNow();
  const out: Record<string, unknown> = { due: [], bounce: [] };

  const { data: due } = await admin.from("campaigns").select("id, name, scheduled_date, scheduled_time, status, sent_at")
    .eq("tenant_id", TENANT_ID).eq("auto_send", true).in("status", ["pendiente", "enviando"]);
  for (const c of due ?? []) {
    const ready = c.scheduled_date < now.date || (c.scheduled_date === now.date && String(c.scheduled_time ?? "00:00:00") <= now.time);
    if (!ready) continue;
    (out.due as unknown[]).push({ id: c.id, ...(await sendCampaign(c.id, false)) });
  }

  const cutoff = new Date(Date.now() - BOUNCE_WAIT_MIN * 60 * 1000).toISOString();
  const since = new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString();
  const { data: toCheck } = await admin.from("campaigns").select("id")
    .eq("tenant_id", TENANT_ID).eq("status", "realizada").is("bounce_report_at", null)
    .not("sent_at", "is", null).lte("sent_at", cutoff).gte("sent_at", since);
  for (const c of toCheck ?? []) (out.bounce as unknown[]).push({ id: c.id, ...(await checkBounces(c.id, true)) });
  return out;
}

// ----------------------------------------------- autorización del panel
async function panelCanSee(req: Request, campaignId: string) {
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return false;
  const userClient = createClient(SB_URL, SB_ANON, { global: { headers: { Authorization: auth } } });
  const { data } = await userClient.from("campaigns").select("id, tenant_id").eq("id", campaignId).maybeSingle();
  return !!data && data.tenant_id === TENANT_ID;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!BREVO) return json({ error: "missing_brevo_api_key" }, 500);

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* cron manda {} */ }
  const action = String(body.action ?? "");
  const campaignId = String(body.campaign_id ?? "");

  try {
    if (!action) return json(await runCron());
    if (!campaignId || !(await panelCanSee(req, campaignId))) return json({ error: "no_autorizado" }, 403);
    if (action === "send_now") return json(await sendCampaign(campaignId, true));
    if (action === "check_bounces") return json(await checkBounces(campaignId, false));
    return json({ error: "accion_desconocida" }, 400);
  } catch (e) {
    console.log("[runner] error:", String(e));
    return json({ error: String(e).slice(0, 300) }, 500);
  }
});
