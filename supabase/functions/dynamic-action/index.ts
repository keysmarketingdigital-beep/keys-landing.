// Supabase Edge Function: send-campaigns (VERSIÓN CON LOGS DE DEPURACIÓN)
// Igual que la v4, pero con console.log en cada paso clave para diagnosticar
// por qué una campaña no genera destinatarios.
// v6: la llave de Brevo de cada negocio ahora se lee de tenant_secrets
//     (ya no queda visible en tenants).

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "jsr:@supabase/server@^1";

const PLATFORM_BREVO_KEY = Deno.env.get("BREVO_API_KEY")!;
const BREVO_DAILY_LIMIT = 300;

export default {
  fetch: withSupabase({ auth: "secret" }, async (_req, ctx) => {
    const supabase = ctx.supabaseAdmin;

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const nowTime = now.toTimeString().slice(0, 8);

    console.log(`[INVOKE] today=${today} nowTime=${nowTime}`);

    const { data: dueCampaigns, error: campErr } = await supabase
      .from("campaigns")
      .select("*, tenants(*)")
      .eq("status", "programada")
      .lte("scheduled_date", today);

    if (campErr) {
      console.log(`[ERROR] al buscar campañas: ${campErr.message}`);
      return Response.json({ error: campErr.message }, { status: 500 });
    }

    console.log(`[INFO] campañas con status=programada encontradas: ${dueCampaigns?.length ?? 0}`);

    const readyCampaigns = (dueCampaigns ?? []).filter((c) => {
      if (c.scheduled_date < today) return true;
      return c.scheduled_time <= nowTime;
    });

    console.log(`[INFO] campañas que ya cumplieron fecha/hora: ${readyCampaigns.length}`);
    for (const c of readyCampaigns) {
      console.log(`[INFO]   -> campaña "${c.name}" (id=${c.id}, tenant_id=${c.tenant_id})`);
    }

    const results: Record<string, unknown>[] = [];

    for (const campaign of readyCampaigns) {
      const tenant = campaign.tenants;
      const { data: secrets, error: secretsErr } = await supabase
        .from("tenant_secrets")
        .select("brevo_api_key")
        .eq("tenant_id", campaign.tenant_id)
        .maybeSingle();
      if (secretsErr) console.log(`[WARN] no se pudo leer tenant_secrets: ${secretsErr.message}`);
      const brevoKey = secrets?.brevo_api_key || tenant?.brevo_api_key || PLATFORM_BREVO_KEY;

      console.log(`[CAMPAIGN ${campaign.id}] procesando "${campaign.name}" | tenant=${tenant?.name ?? "SIN TENANT"} | channel_email=${campaign.channel_email} | llave=${secrets?.brevo_api_key ? "propia" : "plataforma"}`);

      if (campaign.channel_email) {
        const createdCount = await ensureRecipients(supabase, campaign, "email", "email_opt_in");
        console.log(`[CAMPAIGN ${campaign.id}] ensureRecipients(email) creó ${createdCount} filas`);
      }

      let product = null;
      if (campaign.product_id) {
        const { data: p } = await supabase
          .from("products")
          .select("name, price, img")
          .eq("id", campaign.product_id)
          .single();
        product = p;
      }

      if (campaign.channel_email) {
        const { count: sentTodayForTenant } = await supabase
          .from("campaign_recipients")
          .select("*, campaigns!inner(tenant_id)", { count: "exact", head: true })
          .eq("channel", "email")
          .eq("status", "enviado")
          .eq("campaigns.tenant_id", campaign.tenant_id)
          .gte("sent_at", `${today}T00:00:00`);

        let emailQuota = BREVO_DAILY_LIMIT - (sentTodayForTenant ?? 0);
        console.log(`[CAMPAIGN ${campaign.id}] emailQuota disponible: ${emailQuota}`);

        if (emailQuota > 0) {
          const { data: pending, error: pendingErr } = await supabase
            .from("campaign_recipients")
            .select("id, contact_id, contacts(name, email)")
            .eq("campaign_id", campaign.id)
            .eq("channel", "email")
            .eq("status", "pendiente")
            .limit(emailQuota);

          if (pendingErr) console.log(`[ERROR] al buscar pendientes: ${pendingErr.message}`);
          console.log(`[CAMPAIGN ${campaign.id}] destinatarios pendientes encontrados: ${pending?.length ?? 0}`);

          for (const recipient of pending ?? []) {
            const contact = (recipient as any).contacts;
            if (!contact?.email) {
              console.log(`[CAMPAIGN ${campaign.id}] destinatario ${recipient.id} sin email, se salta`);
              continue;
            }

            const ok = await sendEmail(brevoKey, campaign, tenant, product, contact);
            console.log(`[CAMPAIGN ${campaign.id}] envío a ${contact.email}: ${ok.success ? "OK" : "FALLÓ - " + ok.error}`);

            await supabase
              .from("campaign_recipients")
              .update(
                ok.success
                  ? { status: "enviado", provider_id: ok.id, sent_at: new Date().toISOString() }
                  : { status: "fallido", error_message: ok.error },
              )
              .eq("id", recipient.id);

            if (ok.success) emailQuota--;
            if (emailQuota <= 0) break;
          }
        }
      }

      const { count: stillPendingEmail } = await supabase
        .from("campaign_recipients")
        .select("*", { count: "exact", head: true })
        .eq("campaign_id", campaign.id)
        .eq("channel", "email")
        .eq("status", "pendiente");

      console.log(`[CAMPAIGN ${campaign.id}] pendientes restantes de email: ${stillPendingEmail}`);

      if ((stillPendingEmail ?? 0) === 0) {
        console.log(`[CAMPAIGN ${campaign.id}] marcando como REALIZADA`);
        await supabase.from("campaigns").update({ status: "realizada" }).eq("id", campaign.id);
      }

      results.push({ campaign_id: campaign.id, tenant_id: campaign.tenant_id });
    }

    return Response.json({ processed: results });
  }),
};

async function ensureRecipients(
  supabase: any,
  campaign: any,
  channel: "email" | "whatsapp",
  optInField: "email_opt_in" | "whatsapp_opt_in",
) {
  const { data: existing } = await supabase
    .from("campaign_recipients")
    .select("id")
    .eq("campaign_id", campaign.id)
    .eq("channel", channel)
    .limit(1);

  if (existing && existing.length > 0) {
    console.log(`[ensureRecipients ${campaign.id}] ya existen destinatarios de ${channel}, no se crean más`);
    return 0;
  }

  const contactField = channel === "email" ? "email" : "phone";
  const { data: contacts, error } = await supabase
    .from("contacts")
    .select("id")
    .eq("tenant_id", campaign.tenant_id)
    .not(contactField, "is", null)
    .eq(optInField, true);

  if (error) {
    console.log(`[ensureRecipients ${campaign.id}] ERROR buscando contactos: ${error.message}`);
    return 0;
  }

  console.log(`[ensureRecipients ${campaign.id}] contactos encontrados para tenant_id=${campaign.tenant_id}: ${contacts?.length ?? 0}`);

  if (contacts && contacts.length > 0) {
    const rows = contacts.map((c: any) => ({
      campaign_id: campaign.id,
      contact_id: c.id,
      channel,
      status: "pendiente",
    }));
    const { error: insertErr } = await supabase.from("campaign_recipients").insert(rows);
    if (insertErr) {
      console.log(`[ensureRecipients ${campaign.id}] ERROR insertando: ${insertErr.message}`);
      return 0;
    }
    return rows.length;
  }
  return 0;
}

async function sendEmail(brevoKey: string, campaign: any, tenant: any, product: any, contact: any) {
  const html = buildEmailHtml(campaign, product, contact.name);
  try {
    const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": brevoKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: {
          name: tenant?.name ?? "Tienda",
          email: tenant?.contact_email ?? "no-reply@example.com",
        },
        to: [{ email: contact.email, name: contact.name ?? "" }],
        subject: campaign.name,
        htmlContent: html,
      }),
    });
    if (resp.ok) {
      const body = await resp.json();
      return { success: true, id: body.messageId ?? null };
    }
    return { success: false, error: await resp.text() };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

function buildEmailHtml(campaign: any, product: any, contactName: string | null) {
  const greeting = contactName ? `Hola ${contactName},` : "Hola,";
  const link = campaign.landing_url ?? "#";
  const productBlock = product
    ? `<p><strong>${product.name}</strong> — $${Number(product.price).toLocaleString("es-CO")}</p>
       ${product.img ? `<img src="${product.img}" style="max-width:300px" />` : ""}`
    : "";

  return `
    <div style="font-family:sans-serif;max-width:500px;margin:auto">
      <p>${greeting}</p>
      <p>${campaign.message ?? ""}</p>
      ${productBlock}
      <p><a href="${link}" style="background:#3D2B1F;color:#fff;padding:10px 20px;
        text-decoration:none;border-radius:6px;display:inline-block">Ver más</a></p>
    </div>
  `;
}
