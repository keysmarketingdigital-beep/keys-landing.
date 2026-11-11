/* Efecto Matrix detrás de la portada. Se apaga si el visitante pide menos animación. */
(function () {
  'use strict';
  var cv = document.getElementById('mx');
  var mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!cv || (mq && mq.matches)) { if (cv) cv.style.display = 'none'; return; }
  var ctx = cv.getContext('2d');
  if (!ctx) { cv.style.display = 'none'; return; }
  var host = cv.parentElement;
  var chars = 'アカサタナハマヤラワ0123456789KEYS<>/{}#'.split('');
  var font = 15, cols = 0, drops = [], raf = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

  function size() {
    var w = host.clientWidth, h = host.clientHeight;
    cv.width = Math.max(1, Math.floor((w + 48) * dpr));
    cv.height = Math.max(1, Math.floor((h + 48) * dpr));
    cv.style.width = (w + 48) + 'px';
    cv.style.height = (h + 48) + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil((w + 48) / font);
    drops = [];
    for (var i = 0; i < cols; i++) drops[i] = Math.floor(Math.random() * -40);
  }

  function draw() {
    ctx.fillStyle = 'rgba(8,11,18,0.10)';
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.font = font + 'px "JetBrains Mono", monospace';
    for (var i = 0; i < cols; i++) {
      var y = drops[i] * font;
      var c = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillStyle = Math.random() > 0.94 ? '#EAFFFB' : '#35E5D0';
      ctx.fillText(c, i * font, y);
      if (y > host.clientHeight + 48 && Math.random() > 0.975) drops[i] = Math.floor(Math.random() * -20);
      drops[i]++;
    }
    raf = requestAnimationFrame(draw);
  }

  function start() { if (!raf) draw(); }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  size();
  start();
  var t;
  window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(size, 150); });
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
})();
