(() => {
  'use strict';

  // ---------- Configuración ----------
  const CFG = window.KEYS_CONFIG || {};
  const MAX_PHOTOS = 12;              // máximo de fotos por cliente
  const MAX_BYTES = 10 * 1024 * 1024; // 10 MB por archivo (debe coincidir con el bucket)
  const MAX_SIDE = 1920;              // se reduce el lado mayor para subir rápido desde el celular
  const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  const DRAFT_KEY = 'keys-intake-draft-v1';
  const TEXT_FIELDS = ['full_name', 'phone', 'email', 'business_name', 'business_address', 'service_needed', 'business_description'];

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const form = $('#form');
  const params = new URLSearchParams(location.search);
  const sourceRef = (params.get('ref') || params.get('cliente') || '').trim().slice(0, 80) || null;

  const uid = () => (crypto.randomUUID ? crypto.randomUUID() :
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16);
    }));

  const state = { step: 1, leadId: uid(), leadSaved: false, filesSaved: false, sending: false, logo: null, photos: [] };

  // ---------- Borrador local (no se pierde el texto si falla la red o se recarga) ----------
  const saveDraft = () => {
    try {
      const d = { leadId: state.leadId, leadSaved: state.leadSaved };
      TEXT_FIELDS.forEach(n => d[n] = form.elements[n].value);
      localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    } catch (_) {}
  };
  const loadDraft = () => {
    try {
      const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
      if (!d) return;
      state.leadId = d.leadId || state.leadId;
      state.leadSaved = !!d.leadSaved;
      TEXT_FIELDS.forEach(n => { if (d[n]) form.elements[n].value = d[n]; });
    } catch (_) {}
  };
  const clearDraft = () => { try { localStorage.removeItem(DRAFT_KEY); } catch (_) {} };

  loadDraft();
  // Prefill desde el enlace que le envías al cliente: ?ref=barberia-juan&nombre=Juan&negocio=...
  const prefill = { nombre: 'full_name', telefono: 'phone', correo: 'email', negocio: 'business_name', direccion: 'business_address', servicio: 'service_needed' };
  Object.entries(prefill).forEach(([q, n]) => { const v = params.get(q); if (v && !form.elements[n].value) form.elements[n].value = v.slice(0, 250); });
  $('#maxPhotos').textContent = MAX_PHOTOS;

  if (!CFG.supabaseUrl || !CFG.supabaseAnonKey) {
    showBanner('El formulario no está configurado todavía (faltan las variables de Supabase). Avísale a KEYS por WhatsApp.');
  }

  // ---------- UI helpers ----------
  function showBanner(msg, info) {
    const b = $('#banner'); b.textContent = msg; b.hidden = !msg; b.classList.toggle('info', !!info);
    if (msg) b.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  const setErr = (name, msg) => {
    const p = $(`[data-err="${name}"]`); if (p) p.textContent = msg || '';
    const el = form.elements[name]; if (el && el.classList) el.classList.toggle('invalid', !!msg);
  };
  const fmtMB = b => b < 1048576 ? Math.max(1, Math.round(b / 1024)) + ' KB' : (b / 1048576).toFixed(1).replace('.', ',') + ' MB';

  function goStep(n) {
    state.step = n;
    $$('fieldset.step').forEach(f => f.hidden = +f.dataset.step !== n);
    $$('#progress li').forEach(li => {
      const s = +li.dataset.step; li.classList.toggle('active', s === n); li.classList.toggle('done', s < n);
    });
    $('#barFill').style.width = (n / 3 * 100) + '%';
    $('#progressText').textContent = `Paso ${n} de 3`;
    $('#backBtn').hidden = n === 1;
    $('#nextBtn').hidden = n === 3;
    $('#submitBtn').hidden = n !== 3;
    showBanner('');
    window.scrollTo({ top: $('#progress').offsetTop - 12, behavior: 'smooth' });
    const first = $(`fieldset[data-step="${n}"] input:not([type=file]):not([type=checkbox]), fieldset[data-step="${n}"] select`);
    if (first && n !== 3) setTimeout(() => first.focus({ preventScroll: true }), 250);
  }

  // ---------- Validación ----------
  const V = {
    full_name: v => v.trim().length < 2 ? 'Escribe tu nombre completo.' : (!/\s/.test(v.trim()) ? 'Incluye nombre y apellido.' : ''),
    phone: v => {
      const d = v.replace(/[\s().-]/g, '');
      if (!d) return 'Escribe tu número de teléfono o WhatsApp.';
      if (!/^\+?\d{7,15}$/.test(d)) return 'Revisa el teléfono: usa solo números (ej: 304 555 0119 o +57 304 555 0119).';
      return '';
    },
    email: v => !v.trim() ? 'Escribe tu correo electrónico.' : (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'Ese correo no parece válido. Ejemplo: nombre@correo.com' : ''),
    business_name: v => v.trim().length < 2 ? 'Escribe el nombre de tu negocio.' : '',
    business_address: v => v.trim().length < 3 ? 'Escribe la dirección (o la ciudad y país si es solo en línea).' : '',
    service_needed: v => !v ? 'Elige qué necesitas.' : '',
    business_description: v => v.trim().length < 10 ? 'Cuéntanos un poco más (mínimo 10 caracteres).' : ''
  };
  const STEP_FIELDS = { 1: ['full_name', 'phone', 'email'], 2: ['business_name', 'business_address', 'service_needed', 'business_description'] };

  function validateStep(n) {
    let firstBad = null;
    (STEP_FIELDS[n] || []).forEach(name => {
      const msg = V[name](form.elements[name].value); setErr(name, msg);
      if (msg && !firstBad) firstBad = form.elements[name];
    });
    if (n === 3) {
      if (!form.elements.consent.checked) { setErr('consent', 'Necesitamos tu autorización para continuar.'); firstBad = firstBad || form.elements.consent; }
      else setErr('consent', '');
    }
    if (firstBad) { firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' }); if (firstBad.focus) firstBad.focus({ preventScroll: true }); }
    return !firstBad;
  }

  TEXT_FIELDS.forEach(n => {
    const el = form.elements[n];
    el.addEventListener('input', () => { if (el.classList.contains('invalid')) setErr(n, V[n](el.value)); saveDraft(); });
    el.addEventListener('change', saveDraft);
  });
  const countDesc = () => $('#descCount').textContent = form.elements.business_description.value.length;
  form.elements.business_description.addEventListener('input', countDesc); countDesc();

  $('#nextBtn').addEventListener('click', () => { if (validateStep(state.step)) goStep(state.step + 1); });
  $('#backBtn').addEventListener('click', () => goStep(state.step - 1));
  form.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && state.step < 3) { e.preventDefault(); $('#nextBtn').click(); }
  });

  // ---------- Archivos ----------
  function checkFile(file) {
    const t = (file.type || '').toLowerCase();
    const okByName = /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name);
    if (!OK_TYPES.includes(t) && !(t === '' && okByName)) return `“${file.name}” no es una imagen válida. Usa JPG, PNG, WebP o HEIC.`;
    if (file.size > MAX_BYTES * 3) return `“${file.name}” es demasiado pesada (${fmtMB(file.size)}). El máximo es 10 MB.`;
    return '';
  }

  function toImage(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file); const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); res(img); };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('decode')); };
      img.src = url;
    });
  }

  // Reduce fotos grandes del celular (ahorra datos y evita pasar el límite de 10 MB)
  async function prepare(file) {
    let type = (file.type || '').toLowerCase();
    if (!type) type = /\.png$/i.test(file.name) ? 'image/png' : /\.webp$/i.test(file.name) ? 'image/webp' : /\.hei[cf]$/i.test(file.name) ? 'image/heic' : 'image/jpeg';
    try {
      const img = await toImage(file);
      const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
      if (scale === 1 && file.size <= MAX_BYTES) return { blob: file, type, canPreview: true };
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * scale); c.height = Math.round(img.naturalHeight * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      const outType = type === 'image/png' ? 'image/png' : 'image/jpeg';
      const blob = await new Promise(r => c.toBlob(r, outType, 0.85));
      if (blob && (blob.size < file.size || file.size > MAX_BYTES)) return { blob, type: outType, canPreview: true };
      return { blob: file, type, canPreview: true };
    } catch (_) {
      // Formato que el navegador no puede leer (p. ej. HEIC en Chrome): se sube tal cual
      return { blob: file, type, canPreview: false };
    }
  }

  async function makeItem(file, kind) {
    const msg = checkFile(file); if (msg) return { error: msg };
    const p = await prepare(file);
    if (p.blob.size > MAX_BYTES) return { error: `“${file.name}” pesa ${fmtMB(p.blob.size)}; el máximo es 10 MB.` };
    const id = uid().slice(0, 8);
    const ext = ({ 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic', 'image/heif': 'heif' })[p.type] || 'jpg';
    return {
      item: {
        id, kind, name: file.name, blob: p.blob, type: p.type, size: p.blob.size,
        path: `${state.leadId}/${kind}-${id}.${ext}`, uploaded: false, error: false,
        preview: p.canPreview ? URL.createObjectURL(p.blob) : null
      }
    };
  }

  function renderList(ul, items) {
    ul.innerHTML = '';
    items.forEach(it => {
      const li = document.createElement('li'); li.className = it.uploaded ? 'ok' : it.error ? 'fail' : '';
      if (it.preview) { const im = document.createElement('img'); im.src = it.preview; im.alt = it.name; li.appendChild(im); }
      else { const d = document.createElement('div'); d.className = 'noprev'; d.textContent = it.name; li.appendChild(d); }
      const rm = document.createElement('button'); rm.type = 'button'; rm.className = 'rm'; rm.textContent = '×';
      rm.setAttribute('aria-label', `Quitar ${it.name}`); rm.disabled = state.sending;
      rm.addEventListener('click', () => removeItem(it)); li.appendChild(rm);
      const st = document.createElement('div'); st.className = 'st';
      st.textContent = it.uploaded ? 'Subida ✓' : it.error ? 'Error: reintenta' : it.uploading ? 'Subiendo…' : fmtMB(it.size);
      li.appendChild(st); ul.appendChild(li); it.li = li;
    });
  }
  function refreshFiles() {
    renderList($('#logoList'), state.logo ? [state.logo] : []);
    renderList($('#photoList'), state.photos);
    $('#photoCount').textContent = state.photos.length;
    $('#camBtn').disabled = $('#photoBtn').disabled = state.photos.length >= MAX_PHOTOS;
  }
  function removeItem(it) {
    if (it.preview) URL.revokeObjectURL(it.preview);
    if (state.logo === it) state.logo = null; else state.photos = state.photos.filter(p => p !== it);
    state.filesSaved = false; refreshFiles();
  }

  async function addFiles(fileList, kind) {
    const files = [...fileList]; if (!files.length) return;
    setErr(kind === 'logo' ? 'logo' : 'photos', '');
    const errors = [];
    if (kind === 'logo') {
      const r = await makeItem(files[0], 'logo');
      if (r.error) errors.push(r.error); else { if (state.logo?.preview) URL.revokeObjectURL(state.logo.preview); state.logo = r.item; }
    } else {
      for (const f of files) {
        if (state.photos.length >= MAX_PHOTOS) { errors.push(`Máximo ${MAX_PHOTOS} fotos: las demás no se agregaron.`); break; }
        const r = await makeItem(f, 'foto');
        if (r.error) errors.push(r.error); else state.photos.push(r.item);
      }
    }
    state.filesSaved = false; refreshFiles();
    if (errors.length) setErr(kind === 'logo' ? 'logo' : 'photos', errors.join(' '));
  }

  const bind = (btn, input, kind) => {
    $(btn).addEventListener('click', () => $(input).click());
    $(input).addEventListener('change', e => { addFiles(e.target.files, kind); e.target.value = ''; });
  };
  bind('#logoBtn', '#logoInput', 'logo');
  bind('#camBtn', '#camInput', 'foto');
  bind('#photoBtn', '#photoInput', 'foto');

  // ---------- Supabase (REST, solo con la clave pública + RLS de solo-inserción) ----------
  async function sb(path, opts = {}) {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), opts.timeout || 60000);
    try {
      return await fetch(CFG.supabaseUrl + path, {
        ...opts, signal: ctl.signal,
        headers: { apikey: CFG.supabaseAnonKey, Authorization: 'Bearer ' + CFG.supabaseAnonKey, ...(opts.headers || {}) }
      });
    } finally { clearTimeout(t); }
  }

  async function saveLead() {
    if (state.leadSaved) return;
    const f = form.elements;
    const body = {
      id: state.leadId, source_ref: sourceRef,
      full_name: f.full_name.value.trim(), phone: f.phone.value.trim(), email: f.email.value.trim(),
      business_name: f.business_name.value.trim(), business_address: f.business_address.value.trim(),
      service_needed: f.service_needed.value, business_description: f.business_description.value.trim(),
      consent_at: new Date().toISOString()
    };
    const res = await sb('/rest/v1/client_leads', {
      method: 'POST', body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' }
    });
    // 409 = ya se había guardado en un intento anterior cuya respuesta se perdió
    if (res.ok || res.status === 409) { state.leadSaved = true; saveDraft(); return; }
    throw new Error('lead:' + res.status);
  }

  async function uploadItem(it) {
    if (it.uploaded) return;
    it.uploading = true; it.error = false; refreshFiles();
    try {
      const res = await sb(`/storage/v1/object/${CFG.bucket}/${it.path}`, {
        method: 'POST', body: it.blob, timeout: 120000,
        headers: { 'Content-Type': it.type, 'x-upsert': 'false', 'cache-control': '3600' }
      });
      let dup = false;
      if (!res.ok) { const t = await res.text().catch(() => ''); dup = res.status === 409 || /Duplicate/i.test(t); }
      if (res.ok || dup) it.uploaded = true; else throw new Error('file:' + res.status);
    } catch (e) { it.error = true; throw e; }
    finally { it.uploading = false; refreshFiles(); }
  }

  async function saveFileRows(items) {
    if (state.filesSaved || !items.length) { state.filesSaved = true; return; }
    const rows = items.map(i => ({ lead_id: state.leadId, kind: i.kind, storage_path: i.path, file_name: i.name.slice(0, 200), mime_type: i.type, size_bytes: i.size }));
    const res = await sb('/rest/v1/client_lead_files', {
      method: 'POST', body: JSON.stringify(rows), headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' }
    });
    if (res.ok) state.filesSaved = true; else throw new Error('rows:' + res.status);
  }

  // ---------- Envío ----------
  function setSending(on) {
    state.sending = on;
    $('#submitBtn').disabled = $('#backBtn').disabled = on;
    $('#submitBtn').textContent = on ? 'Enviando…' : 'Enviar información';
    refreshFiles();
  }
  const status = m => $('#sendStatus').textContent = m;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (state.sending) return;
    if (form.elements.website.value) return; // honeypot: bots
    for (const n of [1, 2]) if (!validateStep(n)) { goStep(n); validateStep(n); return; }
    if (!validateStep(3)) return;
    if (!navigator.onLine) { showBanner('Parece que no tienes internet. Tu información sigue aquí: conéctate y vuelve a tocar “Enviar”.'); return; }

    showBanner(''); setSending(true);
    try {
      status('Guardando tus datos…');
      await saveLead();

      const items = [state.logo, ...state.photos].filter(Boolean);
      let done = items.filter(i => i.uploaded).length;
      for (const it of items) {
        if (it.uploaded) continue;
        status(`Subiendo archivos (${done + 1} de ${items.length})…`);
        await uploadItem(it); done++;
      }
      status('Finalizando…');
      await saveFileRows(items);

      clearDraft();
      $('#okName').textContent = form.elements.full_name.value.trim().split(/\s+/)[0];
      $('#okBiz').textContent = form.elements.business_name.value.trim();
      $('#okRef').textContent = state.leadId.slice(0, 8).toUpperCase();
      form.hidden = true; $('#progress').hidden = true; $('#intro').hidden = true; showBanner('');
      const s = $('#success'); s.hidden = false; s.focus(); window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const offline = !navigator.onLine || err.name === 'AbortError' || err instanceof TypeError;
      showBanner(offline
        ? 'No pudimos terminar el envío por un problema de conexión. No perdiste nada: revisa tu internet y toca “Enviar información” de nuevo; continuamos donde quedó.'
        : 'No pudimos guardar tu información (' + String(err.message || err) + '). No perdiste nada: intenta de nuevo y, si sigue igual, escríbenos por WhatsApp.');
      status('');
    } finally { setSending(false); }
  });

  window.addEventListener('online', () => { if ($('#banner').textContent.includes('conexión')) showBanner('Volvió tu internet. Toca “Enviar información” para continuar.', true); });
  goStep(1);
})();
