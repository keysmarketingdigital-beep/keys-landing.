(function () {
  'use strict';
  var CFG = Object.assign(
    { WHATSAPP: '57XXXXXXXXXX' },
    window.KEYS_CONFIG || {}
  );
  function waLink(text) { return 'https://wa.me/' + CFG.WHATSAPP + (text ? '?text=' + encodeURIComponent(text) : ''); }

  var TRACK = window.SJ_TRACK || { GADS_ID: '', GADS_LABELS: {}, GA4_ID: '' };
  var lastTrack = {};
  function trackLead(kind) {
    var now = Date.now();
    if (lastTrack[kind] && now - lastTrack[kind] < 3000) return;
    lastTrack[kind] = now;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'lead', lead_type: kind });
    if (window.gtag && TRACK.GADS_ID && TRACK.GADS_LABELS && TRACK.GADS_LABELS[kind]) {
      window.gtag('event', 'conversion', { send_to: TRACK.GADS_ID + '/' + TRACK.GADS_LABELS[kind] });
    }
    if (window.fbq) window.fbq('track', 'Lead');
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (/^https:\/\/wa\.me\//.test(href)) trackLead('whatsapp');
    else if (/^tel:/.test(href)) trackLead('call');
  });

  document.querySelectorAll('[data-wa]').forEach(function (a) { a.href = waLink(a.getAttribute('data-wa')); });
})();
