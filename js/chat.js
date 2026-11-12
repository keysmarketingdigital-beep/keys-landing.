(function () {
  'use strict';
  var CFG = window.KEYS_CONFIG || {};
  var LIVE = /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(CFG.SUPABASE_URL || '') &&
             CFG.SUPABASE_ANON_KEY && !/^TU_/.test(CFG.SUPABASE_ANON_KEY);
  if (!LIVE) return; // sin Supabase conectado, no mostramos el widget

  // El visitante no tiene por qué saber que este chat traduce solo, así
  // que en vez de abrir siempre en el idioma de la página (es/en), el
  // widget detecta el idioma del NAVEGADOR y, si está entre los que
  // tenemos traducidos abajo, abre directo en ese idioma — así la
  // invitación a "escribe en tu idioma" ya llega escrita en su idioma,
  // sin que tenga que adivinar nada. Si su idioma no está en la lista,
  // cae al idioma de la página (es/en) como respaldo.
  var PAGE_LANG = (document.documentElement.lang === 'en') ? 'en' : 'es';
  var BROWSER_LANG = ((navigator.language || navigator.userLanguage || '').slice(0, 2) || '').toLowerCase();
  var SUPPORTED_LANGS = ['es', 'en', 'pt', 'fr', 'de', 'it'];
  var LANG = SUPPORTED_LANGS.indexOf(BROWSER_LANG) > -1 ? BROWSER_LANG : PAGE_LANG;
  var STR = {
    es: {
      title: 'Chat con KEYS',
      note: 'Escribe en el idioma que prefieras: tu mensaje llega traducido automáticamente y nuestra respuesta vuelve traducida al tuyo.',
      placeholder: 'Escribe tu mensaje…',
      nameLbl: 'Tu nombre', emailLbl: 'Correo', phoneLbl: 'WhatsApp (opcional si dejas correo)',
      startBtn: 'Empezar a chatear', needOne: 'Déjanos tu correo o tu WhatsApp para poder responderte.',
      hint: 'Así podemos responderte aunque cierres esta ventana.',
      sending: 'Enviando…', err: 'No se pudo enviar. Intenta de nuevo.',
      translatedFrom: 'Traducido automáticamente del español', seeOriginal: 'ver original', seeTranslation: 'ocultar original'
    },
    en: {
      title: 'Chat with KEYS',
      note: 'Write in whatever language you prefer: your message arrives auto-translated, and our reply comes back translated into yours.',
      placeholder: 'Type your message…',
      nameLbl: 'Your name', emailLbl: 'Email', phoneLbl: 'WhatsApp (optional if you leave an email)',
      startBtn: 'Start chatting', needOne: 'Leave your email or WhatsApp so we can reply.',
      hint: 'This way we can reply even if you close this window.',
      sending: 'Sending…', err: 'Could not send. Please try again.',
      translatedFrom: 'Auto-translated from Spanish', seeOriginal: 'see original', seeTranslation: 'hide original'
    },
    pt: {
      title: 'Chat com a KEYS',
      note: 'Escreva no idioma que preferir: sua mensagem chega traduzida automaticamente, e nossa resposta volta traduzida para o seu idioma.',
      placeholder: 'Escreva sua mensagem…',
      nameLbl: 'Seu nome', emailLbl: 'E-mail', phoneLbl: 'WhatsApp (opcional se deixar e-mail)',
      startBtn: 'Começar a conversar', needOne: 'Deixe seu e-mail ou WhatsApp para podermos responder.',
      hint: 'Assim podemos responder mesmo se você fechar esta janela.',
      sending: 'Enviando…', err: 'Não foi possível enviar. Tente novamente.',
      translatedFrom: 'Traduzido automaticamente do espanhol', seeOriginal: 'ver original', seeTranslation: 'ocultar original'
    },
    fr: {
      title: 'Chat avec KEYS',
      note: 'Écrivez dans la langue de votre choix : votre message arrive traduit automatiquement, et notre réponse vous revient traduite dans votre langue.',
      placeholder: 'Écrivez votre message…',
      nameLbl: 'Votre nom', emailLbl: 'E-mail', phoneLbl: 'WhatsApp (facultatif si vous laissez un e-mail)',
      startBtn: 'Commencer à discuter', needOne: 'Laissez votre e-mail ou WhatsApp pour que nous puissions répondre.',
      hint: 'Ainsi, nous pouvons répondre même si vous fermez cette fenêtre.',
      sending: 'Envoi…', err: 'Échec de l\'envoi. Réessayez.',
      translatedFrom: 'Traduit automatiquement de l\'espagnol', seeOriginal: 'voir l\'original', seeTranslation: 'masquer l\'original'
    },
    de: {
      title: 'Chat mit KEYS',
      note: 'Schreiben Sie in der Sprache Ihrer Wahl: Ihre Nachricht wird automatisch übersetzt, und unsere Antwort kommt übersetzt in Ihre Sprache zurück.',
      placeholder: 'Nachricht schreiben…',
      nameLbl: 'Ihr Name', emailLbl: 'E-Mail', phoneLbl: 'WhatsApp (optional, wenn Sie eine E-Mail angeben)',
      startBtn: 'Chat starten', needOne: 'Bitte E-Mail oder WhatsApp angeben, damit wir antworten können.',
      hint: 'So können wir antworten, auch wenn Sie dieses Fenster schließen.',
      sending: 'Wird gesendet…', err: 'Senden fehlgeschlagen. Bitte erneut versuchen.',
      translatedFrom: 'Automatisch aus dem Spanischen übersetzt', seeOriginal: 'Original anzeigen', seeTranslation: 'Original ausblenden'
    },
    it: {
      title: 'Chat con KEYS',
      note: 'Scrivi nella lingua che preferisci: il tuo messaggio arriva tradotto automaticamente, e la nostra risposta torna tradotta nella tua lingua.',
      placeholder: 'Scrivi il tuo messaggio…',
      nameLbl: 'Il tuo nome', emailLbl: 'Email', phoneLbl: 'WhatsApp (facoltativo se lasci l\'email)',
      startBtn: 'Inizia a chattare', needOne: 'Lascia la tua email o il WhatsApp per poterti rispondere.',
      hint: 'Così possiamo risponderti anche se chiudi questa finestra.',
      sending: 'Invio…', err: 'Invio non riuscito. Riprova.',
      translatedFrom: 'Tradotto automaticamente dallo spagnolo', seeOriginal: 'vedi originale', seeTranslation: 'nascondi originale'
    }
  }[LANG];

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }

  $('kc-t-title').textContent = STR.title;
  $('kc-t-note').textContent = STR.note;
  // Línea extra en otro idioma, para que SIEMPRE se note que el chat es multilingüe
  // (aunque el navegador del visitante esté en español verá también el aviso en inglés).
  $('kc-t-any').textContent = LANG === 'en'
    ? '🌐 También puedes escribirnos en español o en cualquier otro idioma.'
    : '🌐 You can write to us in English or any other language.';
  $('kc-input').placeholder = STR.placeholder;
  // Accesibilidad: nombre del campo y del botón, idioma del panel y rol de diálogo.
  $('kc-input').setAttribute('aria-label', STR.placeholder.replace(/…$/, ''));
  $('kc-send').setAttribute('aria-label', { es: 'Enviar', en: 'Send', pt: 'Enviar', fr: 'Envoyer', de: 'Senden', it: 'Invia' }[LANG]);
  $('kc-panel').setAttribute('lang', LANG);
  $('kc-panel').setAttribute('role', 'dialog');
  $('kc-panel').setAttribute('aria-labelledby', 'kc-t-title');
  $('kc-btn').setAttribute('aria-expanded', 'false');
  $('kc-btn').setAttribute('aria-controls', 'kc-panel');

  var FN_URL = CFG.SUPABASE_URL + '/functions/v1/chat-public';
  function call(payload) {
    return fetch(FN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: CFG.SUPABASE_ANON_KEY },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, data: j }; }); });
  }

  var convId = null, visitorName = '', pollTimer = null, open = false, sending = false;
  try {
    convId = localStorage.getItem('keys_chat_conv');
    visitorName = localStorage.getItem('keys_chat_name') || '';
  } catch (e) {}

  function showErr(msg) {
    var e = $('kc-err');
    if (!msg) { e.hidden = true; e.textContent = ''; return; }
    e.hidden = false; e.textContent = msg;
  }

  function renderIntake() {
    var body = $('kc-body');
    body.innerHTML =
      '<div id="kc-intake">' +
      '<p style="font-size:13px;color:var(--muted);margin:0 0 4px">' + esc(STR.hint) + '</p>' +
      '<div><label for="kc-name">' + esc(STR.nameLbl) + '</label><input id="kc-name" type="text" autocomplete="name"></div>' +
      '<div><label for="kc-email">' + esc(STR.emailLbl) + '</label><input id="kc-email" type="email" autocomplete="email"></div>' +
      '<div><label for="kc-phone">' + esc(STR.phoneLbl) + '</label><input id="kc-phone" type="tel" autocomplete="tel"></div>' +
      '<button id="kc-start" type="button" class="btn btn-main btn-sm" style="width:100%;margin-top:4px">' + esc(STR.startBtn) + '</button>' +
      '</div>';
    $('kc-start').addEventListener('click', function () {
      var name = $('kc-name').value.trim();
      var email = $('kc-email').value.trim();
      var phone = $('kc-phone').value.trim();
      if (!email && !phone) { showErr(STR.needOne); return; }
      showErr(null);
      var text = $('kc-input').value.trim() || (LANG === 'en' ? 'Hello, I would like more information.' : 'Hola, quisiera más información.');
      sendMessage(text, { visitor_name: name, visitor_email: email, visitor_phone: phone });
    });
  }

  function bubble(m) {
    var cls = m.sender === 'visitante' ? 'v' : 'k';
    var html = '<div class="kc-msg ' + cls + '">' + esc(m.view_text).replace(/\n/g, '<br>');
    if (m.is_translated) {
      html += '<span class="kc-tr" data-orig="' + esc(m.original_text) + '">' + esc(STR.translatedFrom) + ' · ' + esc(STR.seeOriginal) + '</span>';
    }
    html += '</div>';
    return html;
  }

  function renderMessages(list) {
    var body = $('kc-body');
    body.innerHTML = list.map(bubble).join('') || '';
    body.querySelectorAll('.kc-tr').forEach(function (el) {
      el.addEventListener('click', function () {
        var msg = el.closest('.kc-msg');
        var shown = msg.querySelector('.kc-orig');
        if (shown) { shown.remove(); el.textContent = STR.translatedFrom + ' · ' + STR.seeOriginal; return; }
        var o = document.createElement('span');
        o.className = 'kc-orig';
        o.textContent = el.getAttribute('data-orig');
        el.insertAdjacentElement('beforebegin', o);
        el.textContent = STR.translatedFrom + ' · ' + STR.seeTranslation;
      });
    });
    body.scrollTop = body.scrollHeight;
  }

  function poll() {
    if (!convId) return;
    call({ action: 'poll', conversation_id: convId }).then(function (res) {
      if (res.ok && res.data && res.data.messages) renderMessages(res.data.messages);
    }).catch(function () {});
  }

  function sendMessage(text, extra) {
    if (sending || !text) return;
    sending = true;
    $('kc-send').disabled = true;
    showErr(null);
    var payload = Object.assign({ action: 'send', text: text, conversation_id: convId }, extra || {});
    call(payload).then(function (res) {
      sending = false; $('kc-send').disabled = false;
      if (!res.ok) { showErr((res.data && res.data.detail) || STR.err); return; }
      if (!convId) {
        convId = res.data.conversation_id;
        try {
          localStorage.setItem('keys_chat_conv', convId);
          if (extra && extra.visitor_name) localStorage.setItem('keys_chat_name', extra.visitor_name);
        } catch (e) {}
        $('kc-body').innerHTML = '';
      }
      $('kc-input').value = '';
      poll();
      if (!pollTimer) pollTimer = setInterval(poll, 4000);
    }).catch(function () {
      sending = false; $('kc-send').disabled = false;
      showErr(STR.err);
    });
  }

  $('kc-send').addEventListener('click', function () {
    var text = $('kc-input').value.trim();
    if (!text) return;
    if (!convId) { showErr(STR.needOne); return; }
    sendMessage(text, {});
  });
  $('kc-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('kc-send').click(); }
  });

  // ---- Burbuja "escríbenos en tu idioma" junto al botón (antes de abrir el chat) ----
  var TEASER_KEY = 'keys_chat_teaser_off';
  var TEASE = { es: 'Escríbenos en tu idioma', en: 'Write to us in your language', pt: 'Escreva no seu idioma',
    fr: 'Écrivez-nous dans votre langue', de: 'Schreiben Sie uns in Ihrer Sprache', it: 'Scrivici nella tua lingua' };
  var teaseOrder = [LANG].concat(['es', 'en', 'pt', 'fr', 'de', 'it'].filter(function (l) { return l !== LANG; }));
  var teaseTimer = null, teaseIdx = 0;
  function teaserOff() { try { return localStorage.getItem(TEASER_KEY) === '1'; } catch (e) { return false; } }
  function hideTeaser(remember) {
    var t = $('kc-teaser'); t.classList.remove('on');
    if (teaseTimer) { clearInterval(teaseTimer); teaseTimer = null; }
    setTimeout(function () { t.hidden = true; }, 350);
    if (remember) { try { localStorage.setItem(TEASER_KEY, '1'); } catch (e) {} }
  }
  function showTeaser() {
    if (open || teaserOff()) return;
    var t = $('kc-teaser'), txt = $('kc-teaser-txt');
    txt.textContent = '🌐 ' + TEASE[teaseOrder[0]];
    t.hidden = false; requestAnimationFrame(function () { t.classList.add('on'); });
    teaseTimer = setInterval(function () {
      teaseIdx = (teaseIdx + 1) % teaseOrder.length;
      txt.style.opacity = 0;
      setTimeout(function () { txt.textContent = '🌐 ' + TEASE[teaseOrder[teaseIdx]]; txt.style.opacity = 1; }, 250);
    }, 2600);
  }
  setTimeout(showTeaser, 3500);
  $('kc-teaser-txt').addEventListener('click', function () { $('kc-btn').click(); });
  $('kc-teaser-x').addEventListener('click', function () { hideTeaser(true); });

  $('kc-btn').addEventListener('click', function () {
    open = !open;
    if (open) hideTeaser(true);
    $('kc-panel').classList.toggle('open', open);
    $('kc-btn').setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      if (convId) { poll(); if (!pollTimer) pollTimer = setInterval(poll, 4000); }
      else renderIntake();
      // Lleva el foco dentro del panel: al primer campo o al cuadro de mensaje.
      setTimeout(function () { var f = $('kc-name') || $('kc-input'); if (f) f.focus(); }, 30);
    } else {
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
      $('kc-btn').focus();
    }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) $('kc-btn').click(); });
  $('kc-close').addEventListener('click', function () { $('kc-btn').click(); });
})();
