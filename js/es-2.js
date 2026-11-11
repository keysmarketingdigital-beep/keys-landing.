(function(){
  /* Medición (GA4 + Google Ads) solo con consentimiento. Sin IDs no carga nada. */
  var T = window.SJ_TRACK || {}, ids = [];
  if (T.GADS_ID) ids.push(T.GADS_ID);
  if (T.GA4_ID) ids.push(T.GA4_ID);
  if (!ids.length) return;
  var KEY = 'keys_cookies', EN = (document.documentElement.lang || '').indexOf('en') === 0, loaded = false;
  function get(){ try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v){ try { localStorage.setItem(KEY, v); } catch (e) {} }
  function load(){
    if (loaded) return; loaded = true;
    var s = document.createElement('script'); s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ids[0];
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    ids.forEach(function (id) { gtag('config', id); });
  }
  var TX = EN
    ? { t: 'We use Google cookies (Analytics and Ads) to measure visits and know which ads work. Do you accept them?', a: 'Accept', r: 'Decline', p: 'Privacy policy', h: '../politica-privacidad.html', pref: 'Cookie preferences', l: 'Cookies' }
    : { t: 'Usamos cookies de Google (Analytics y Ads) para medir las visitas y saber qué anuncios funcionan. ¿Las aceptas?', a: 'Aceptar', r: 'Rechazar', p: 'Política de privacidad', h: 'politica-privacidad.html', pref: 'Preferencias de cookies', l: 'Cookies' };
  function close(b){ if (b && b.parentNode) b.parentNode.removeChild(b); }
  function banner(){
    if (document.getElementById('ck-bar')) return;
    var b = document.createElement('div'); b.id = 'ck-bar'; b.setAttribute('role', 'dialog'); b.setAttribute('aria-label', TX.l);
    var p = document.createElement('p'); p.textContent = TX.t + ' ';
    var a = document.createElement('a'); a.href = TX.h; a.textContent = TX.p; p.appendChild(a);
    var row = document.createElement('div'); row.className = 'ck-row';
    var no = document.createElement('button'); no.type = 'button'; no.className = 'ck-no'; no.textContent = TX.r;
    var ok = document.createElement('button'); ok.type = 'button'; ok.className = 'ck-ok'; ok.textContent = TX.a;
    no.addEventListener('click', function(){ var was = get(); set('denied'); close(b); if (was === 'granted') location.reload(); });
    ok.addEventListener('click', function(){ set('granted'); close(b); load(); });
    row.appendChild(no); row.appendChild(ok); b.appendChild(p); b.appendChild(row);
    document.body.appendChild(b);
  }
  function whenReady(fn){ if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  window.keysCookiePrefs = function(){ whenReady(banner); };
  var v = get();
  if (v === 'granted') load(); else if (v !== 'denied') whenReady(banner);
  whenReady(function(){
    var f = document.querySelector('footer'); if (!f) return;
    var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'ck-pref'; btn.textContent = TX.pref;
    btn.addEventListener('click', banner); f.appendChild(btn);
  });
})();
