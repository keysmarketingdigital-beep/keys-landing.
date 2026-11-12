/* Landing KEYS: medición de contactos, video, aparición al bajar, encabezado, galerías y formulario.
   Archivo compartido por / y /en/ (detecta el idioma con <html lang>). */
(function(){
  /* ---------- Seguimiento de conversiones (Google Ads / GA4) ---------- */
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
    if (window.gtag && TRACK.GA4_ID) window.gtag('event', 'generate_lead', { method: kind });
    if (window.fbq) window.fbq('track', 'Lead');
  }
  window.keysTrackLead = trackLead;
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (/^https:\/\/wa\.me\//.test(href)) trackLead('whatsapp');
    else if (/^tel:/.test(href)) trackLead('call');
  });
})();
/* video: respeta reducir movimiento */
(function(){var v=document.getElementById('hv'),b=document.getElementById('hvp');if(!v)return;function ui(){if(b){b.textContent=v.paused?'▶':'❚❚';b.setAttribute('aria-label',document.documentElement.lang==='en'?(v.paused?'Play video':'Pause video'):(v.paused?'Reproducir video':'Pausar video'))}}if(matchMedia('(prefers-reduced-motion: reduce)').matches){v.removeAttribute('autoplay');v.pause();}else{var p=v.play();if(p&&p.catch)p.catch(function(){});}if(b)b.addEventListener('click',function(){if(v.paused){var q=v.play();if(q&&q.catch)q.catch(function(){})}else v.pause()});v.addEventListener('play',ui);v.addEventListener('pause',ui);ui();})();
(function(){
var R=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* reveal */
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.rv').forEach(function(el){io.observe(el)});
var sx=document.querySelector('.steps.fx');if(sx){var so=new IntersectionObserver(function(es){if(es[0].isIntersecting){sx.classList.add('on');so.disconnect()}},{threshold:.3});so.observe(sx)}
/* nav + progress */
var hdr=document.getElementById('hdr'),pg=document.getElementById('pg');
function sc(){var h=document.documentElement,m=h.scrollHeight-h.clientHeight;pg.style.width=(m>0?h.scrollTop/m*100:0)+'%';hdr.classList.toggle("hscr",h.scrollTop>10)}
addEventListener('scroll',sc,{passive:true});sc();
/* hero slides */
[].slice.call(document.querySelectorAll('.gal')).forEach(function(g){
 var im=[].slice.call(g.querySelectorAll('.slides img')),bt=[].slice.call(g.querySelectorAll('.sc-chips button')),
 u=g.querySelector('.gu'),pb=g.querySelector('.sc-prog b'),k=0,t,nx=g.nextElementSibling,lv=nx&&nx.querySelector('.live');
 function go(n){im[k].classList.remove('on');bt[k].classList.remove('on');k=n;im[k].classList.add('on');bt[k].classList.add('on');
  if(pb&&!R){pb.classList.remove('run');void pb.offsetWidth;pb.classList.add('run')}if(u)u.textContent=im[k].dataset.u;if(lv){var L=im[k].dataset.live;if(L){lv.href=L;lv.hidden=false;if(!lv.hasAttribute('data-fixed'))lv.textContent=(document.documentElement.lang==='en'?'See '+bt[k].textContent.trim().toLowerCase()+' live ↗':'Ver '+bt[k].textContent.trim().toLowerCase()+' en vivo ↗')}else lv.hidden=true}bt.forEach(function(x,i){x.setAttribute('aria-pressed',i===k?'true':'false')})}
 function auto(){clearInterval(t);if(!R)t=setInterval(function(){go((k+1)%im.length)},4200)}
 bt.forEach(function(b,i){b.addEventListener('click',function(){go(i);auto()})});
 if(im.length){go(0);auto()}
});
})();

(function(){var f=document.getElementById('f');if(!f)return;
var EN=document.documentElement.lang==='en';
f.addEventListener('submit',function(e){e.preventDefault();
var n=document.getElementById('n').value.trim(),s=document.getElementById('s').value;
var t=EN?('Hi, I am '+(n||'a new client')+'. I would like information about: '+s+'.'):('Hola, soy '+(n||'un cliente nuevo')+'. Quiero información sobre: '+s+'.');
if(window.keysTrackLead)window.keysTrackLead('form');
window.open('https://wa.me/573045550119?text='+encodeURIComponent(t),'_blank','noopener');});})();
