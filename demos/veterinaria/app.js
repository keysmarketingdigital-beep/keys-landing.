(function(){
var SERV={"consulta": {"id": "consulta", "cat": "consulta", "t": "Consultas y chequeos", "img": "svc-consulta", "d": "Consulta general, control de cachorro o gatito, chequeo geriátrico y consulta con especialista.", "subs": [["Consulta general", 30], ["Control de cachorro o gatito", 30], ["Chequeo geriátrico", 30], ["Consulta con especialista", 40]], "precio": "40.000"}, "prevencion": {"id": "prevencion", "cat": "prevencion", "t": "Vacunación y desparasitación", "img": "svc-prevencion", "d": "Plan de vacunas, desparasitación y microchip de identificación.", "subs": [["Vacunación", 20], ["Desparasitación", 20], ["Implantación de microchip", 10]], "precio": "35.000"}, "diagnostico": {"id": "diagnostico", "cat": "diagnostico", "t": "Laboratorio e imágenes", "img": "svc-diagnostico", "d": "Toma de muestras para laboratorio clínico, radiografía y ecografía.", "subs": [["Laboratorio clínico (toma de muestras)", 10], ["Radiografía (rayos X)", 30], ["Ecografía", 30]], "precio": "60.000"}, "cirugia": {"id": "cirugia", "cat": "cirugia", "t": "Cirugía y esterilización", "img": "svc-cirugia", "d": "Cirugías programadas, esterilización y castración, con control postoperatorio.", "subs": [["Cirugía y esterilización", 90], ["Control postoperatorio", 20]], "precio": "250.000"}, "odontologia": {"id": "odontologia", "cat": "consulta", "t": "Odontología veterinaria", "img": "svc-odontologia", "d": "Valoración y limpieza dental para perros y gatos.", "subs": [["Odontología veterinaria", 60]], "precio": "120.000"}, "estetica": {"id": "estetica", "cat": "estetica", "t": "Estética y peluquería", "img": "svc-estetica", "d": "Baño e higiene, o baño con corte, para perros y gatos.", "subs": [["Baño e higiene", 60], ["Baño y corte", 120]], "precio": "50.000"}, "urgencias": {"id": "urgencias", "cat": "urgencias", "t": "Urgencias 24 horas", "img": "svc-urgencias", "d": "Atención prioritaria sin cita, todos los días y a cualquier hora. Las urgencias no se agendan: se atienden por prioridad.", "subs": [["Sin cita: ingreso por prioridad", null]], "precio": null}, "hospital": {"id": "hospital", "cat": "urgencias", "t": "Hospitalización y farmacia", "img": "svc-hospital", "d": "La hospitalización se define tras la consulta. Farmacia veterinaria en la clínica.", "subs": [["Hospitalización (se define tras la consulta)", null], ["Farmacia", null]], "precio": null}},WA='573045550119';
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
// menú móvil
var b=$('#burger'),m=$('#mnav');
b.addEventListener('click',function(){var o=m.hasAttribute('hidden');if(o)m.removeAttribute('hidden');else m.setAttribute('hidden','');b.setAttribute('aria-expanded',o)});
$$('#mnav a').forEach(function(a){a.addEventListener('click',function(){m.setAttribute('hidden','');b.setAttribute('aria-expanded','false')})});
// filtros
$$('.chip').forEach(function(c){c.addEventListener('click',function(){var f=c.dataset.f;$$('.chip').forEach(function(x){x.classList.toggle('on',x===c)});
 $$('.svc').forEach(function(s){s.hidden=!(f==='todos'||s.dataset.cat===f)})})});
// detalle
var dlg=$('#dlg'),db=$('#dbody');
$$('[data-det]').forEach(function(btn){btn.addEventListener('click',function(){var s=SERV[btn.dataset.det];
 var li=s.subs.map(function(x){return '<li>'+x[0]+(x[1]?' · '+x[1]+' min (ejemplo)':'')+'</li>'}).join('');
 db.innerHTML='<h3 id="dt">'+s.t+'</h3><p>'+s.d+'</p><ul>'+li+'</ul><p><small>Subcategorías y tiempos de ejemplo: la clínica debe confirmarlos.</small></p>'+(s.id==='urgencias'?'<a class="btn dark" href="https://wa.me/'+WA+'?text=Voy%20en%20camino%20con%20una%20urgencia" target="_blank" rel="noopener">Avisar por WhatsApp</a>':'<a class="btn dark" href="agenda/index.html?s='+s.id+'">Agendar cita</a>');
 dlg.showModal()})});
// guía rápida
var Q={q:'¿Qué pasa con tu mascota?',o:[
 ['Es una urgencia (sangrado, intoxicación, no respira, convulsiones)','Urgencias 24 horas: no agendes, ven de inmediato. Avisa por WhatsApp que vas en camino.',null],
 ['Revisión o algo me preocupa','Consulta general o con especialista.','consulta'],
 ['Vacunas, desparasitación o microchip','Prevención: vacunación, desparasitación y microchip.','prevencion'],
 ['Necesita examen o imágenes','Laboratorio, radiografía o ecografía.','diagnostico'],
 ['Cirugía, esterilización o control después','Cirugía y esterilización, con control postoperatorio.','cirugia'],
 ['Baño, corte o limpieza dental','Estética u odontología veterinaria.','estetica']]};
var qo=$('#qo'),qr=$('#qr');
Q.o.forEach(function(o){var bt=document.createElement('button');bt.type='button';bt.textContent=o[0];bt.addEventListener('click',function(){
 qr.hidden=false;qr.innerHTML='<b>'+o[1]+'</b><br><br>'+(o[2]?'<a class="btn dark" href="agenda/index.html?s='+o[2]+'">Agendar cita</a>':'<a class="btn dark" href="https://wa.me/'+WA+'?text=Voy%20en%20camino%20con%20una%20urgencia" target="_blank" rel="noopener">Avisar por WhatsApp</a>')});qo.appendChild(bt)});
// comparador antes/después
$$('.ba').forEach(function(w){var r=$('input',w),t=$('.before',w),h=$('.hdl',w);function u(){t.style.clipPath='inset(0 '+(100-r.value)+'% 0 0)';h.style.left=r.value+'%'}r.addEventListener('input',u)});
// formulario -> WhatsApp
var f=$('#frm'),er=$('#ferr');
f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);
 if(!d.get('n')||!d.get('m')||!d.get('a')){er.hidden=false;er.textContent='Completa tu nombre, el de tu mascota y acepta el tratamiento de datos.';return}
 er.hidden=true;var t='Hola, soy '+d.get('n')+'. Quiero agendar para '+d.get('m')+': '+d.get('s')+'. '+(d.get('t')||'');
 window.open('https://wa.me/'+WA+'?text='+encodeURIComponent(t),'_blank','noopener')});
// accesibilidad
var a=$('#a11y'),st=0;a.addEventListener('click',function(){st=(st+1)%3;var h=document.documentElement;h.classList.toggle('a11y-t',st>=1);h.classList.toggle('a11y-c',st===2);a.setAttribute('aria-pressed',st>0)});
// cookies
var ck=$('#ckb');function ckv(){try{return localStorage.getItem('kv-ck')}catch(e){return null}}
if(!ckv())ck.removeAttribute('hidden');
function ckset(v){try{localStorage.setItem('kv-ck',v)}catch(e){}ck.setAttribute('hidden','')}
$('#cka').addEventListener('click',function(){ckset('1')});$('#ckr').addEventListener('click',function(){ckset('0')});
$('#ckp').addEventListener('click',function(){ck.removeAttribute('hidden')});

// dinámicas: aparición al hacer scroll, contadores y sombra del encabezado
var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var hd=$('.hd');window.addEventListener('scroll',function(){hd.classList.toggle('sc',window.scrollY>8)},{passive:true});
if(!rm&&'IntersectionObserver' in window){document.documentElement.classList.add('js');
 var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
 $$('.sec .wrap > *, .svc, .card, .ba, .faq details').forEach(function(x,i){x.classList.add('rv');x.style.transitionDelay=(i%4)*60+'ms';io.observe(x)});
 var co=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;co.unobserve(e.target);var n=e.target,end=parseInt(n.textContent,10),suf=n.textContent.replace(/[0-9]/g,''),t0=null;
  function st(t){if(!t0)t0=t;var p=Math.min((t-t0)/900,1);n.textContent=Math.round(end*p)+suf;if(p<1)requestAnimationFrame(st)}requestAnimationFrame(st)})},{threshold:.6});
 $$('.hstats b').forEach(function(n){co.observe(n)})}

// v3: progreso, scrollspy, parallax, volver arriba, palabras rotativas, mapa y comentarios
var pg=$('#prog'),tt=$('#top2'),hw=$('.hero-full');
function onsc(){var y=window.scrollY,dh=document.documentElement.scrollHeight-innerHeight;pg.style.transform='scaleX('+(dh>0?Math.min(y/dh,1):0)+')';tt.classList.toggle('on',y>700);if(!rm&&hw&&y<900)hw.style.setProperty('--py',Math.min(y*.1,60)+'px')}
window.addEventListener('scroll',onsc,{passive:true});onsc();
tt.addEventListener('click',function(){window.scrollTo({top:0,behavior:rm?'auto':'smooth'})});
if('IntersectionObserver' in window){var links={};$$('.nav a').forEach(function(a){links[a.getAttribute('href').slice(1)]=a});
 var so=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){$$('.nav a').forEach(function(a){a.classList.remove('act')});var l=links[e.target.id];if(l)l.classList.add('act')}})},{rootMargin:'-40% 0px -55% 0px'});
 Object.keys(links).forEach(function(id){var s=document.getElementById(id);if(s)so.observe(s)})}
var em=$('.hero h1 em');if(em&&!rm){var W=['a cualquier hora','todos los días','con cariño'],wi=0;em.classList.add('sw');
 setInterval(function(){em.classList.add('out');setTimeout(function(){wi=(wi+1)%W.length;em.textContent=W[wi];em.classList.remove('out')},350)},3800)}
var ms=1,mi=$('#mapi');function mz(d){ms=Math.max(1,Math.min(1.8,+(ms+d).toFixed(1)));mi.style.transform='scale('+ms+')'}
$('#zi').addEventListener('click',function(){mz(.4)});$('#zo').addEventListener('click',function(){mz(-.4)});
var fine=window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches;
$$('.svc').forEach(function(c){c.addEventListener('pointermove',function(e){if(!fine)return;var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;c.style.setProperty('--mx',(x*100)+'%');c.style.setProperty('--my',(y*100)+'%');if(!rm){c.style.setProperty('--rx',((.5-y)*5).toFixed(2)+'deg');c.style.setProperty('--ry',((x-.5)*6).toFixed(2)+'deg')}});
 c.addEventListener('pointerleave',function(){c.style.setProperty('--rx','0deg');c.style.setProperty('--ry','0deg')})});
var sn=$('#svcn');if(sn){$$('.chip').forEach(function(c){c.addEventListener('click',function(){setTimeout(function(){sn.textContent=$$('.svc:not([hidden])').length},0)})})}
})();
