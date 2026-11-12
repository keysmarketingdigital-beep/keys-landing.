(function () {
  'use strict';
  // Google recomienda NO redirigir automáticamente según el idioma del
  // navegador cuando el sitio ya usa hreflang (como este) — puede estorbar
  // a que Google indexe bien la versión en español, y a alguien que
  // comparte este link en español sin querer le cambiaría el idioma solo.
  // En vez de redirigir, mostramos un aviso discreto de que puede cambiar
  // de idioma para navegar mejor, y que la persona decida — se puede
  // cerrar y no vuelve a salir en ese navegador.
  try {
    if (localStorage.getItem('keys_lang')) return; // ya eligió idioma antes en esta página
    if (localStorage.getItem('keys_lang_banner_dismissed')) return;
  } catch (e) {}

  var BL = ((navigator.language || navigator.userLanguage || '').slice(0, 2) || '').toLowerCase();
  if (BL === 'es') return; // ya está en su idioma

  var MSG = {
    en: { text: 'For a better experience, you can switch the language of this page —', link: 'View this page in English' },
    pt: { text: 'Para uma navegação melhor, você pode mudar o idioma desta página —', link: 'Ver esta página em inglês' },
    fr: { text: 'Pour une meilleure navigation, vous pouvez changer la langue de cette page —', link: 'Voir cette page en anglais' },
    de: { text: 'Für eine bessere Navigation können Sie die Sprache dieser Seite ändern —', link: 'Diese Seite auf Englisch ansehen' },
    it: { text: 'Per una navigazione migliore, puoi cambiare la lingua di questa pagina —', link: 'Vedi questa pagina in inglese' }
  }[BL] || { text: 'For a better experience, you can switch the language of this page —', link: 'View this page in English' };

  var el = document.getElementById('langBanner');
  document.getElementById('langBannerText').textContent = MSG.text;
  document.getElementById('langBannerLinkText').textContent = MSG.link;
  el.hidden = false;
  document.getElementById('langBannerClose').addEventListener('click', function () {
    el.hidden = true;
    try { localStorage.setItem('keys_lang_banner_dismissed', '1'); } catch (e) {}
  });
})();
