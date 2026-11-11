/* Formulario rápido de "Paquetes": arma el mensaje y abre WhatsApp. No guarda datos. */
(function () {
  'use strict';
  var f = document.getElementById('quickForm'); if (!f) return;
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var n = document.getElementById('qfName'), b = document.getElementById('qfBiz'), i = document.getElementById('qfInt');
    if (!n.value.trim()) { n.focus(); n.setAttribute('aria-invalid', 'true'); return; }
    n.removeAttribute('aria-invalid');
    var en = document.documentElement.lang === 'en';
    var msg = en
      ? 'Hi KEYS, I am ' + n.value.trim() + '.' + (b.value.trim() ? ' My business: ' + b.value.trim() + '.' : '') + ' I am interested in: ' + i.value + '.'
      : 'Hola KEYS, soy ' + n.value.trim() + '.' + (b.value.trim() ? ' Mi negocio: ' + b.value.trim() + '.' : '') + ' Me interesa: ' + i.value + '.';
    if (window.keysTrackLead) window.keysTrackLead('form');
    window.open('https://wa.me/573045550119?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });
})();
