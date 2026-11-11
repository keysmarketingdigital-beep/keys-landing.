/* ===== Medición: pega aquí los códigos cuando existan =====
   GA4_ID: ID de medición de Google Analytics 4 (empieza por G-), p. ej. 'G-ABC123XYZ'
   GADS_ID y GADS_LABELS: conversiones de Google Ads (opcional)
   Mientras GA4_ID y GADS_ID estén vacíos, la página no carga nada de Google ni muestra el aviso de cookies. */
window.TRACK={GA4_ID:'',GADS_ID:'',GADS_LABELS:{whatsapp:'',form:'',call:''}};
(function(){
  var T=window.TRACK, KEY='od-cookies';
  if(!T.GA4_ID&&!T.GADS_ID)return;
  function get(){try{return localStorage.getItem(KEY)}catch(e){return null}}
  function set(v){try{localStorage.setItem(KEY,v)}catch(e){}}
  function load(){
    if(window.__odGtag)return; window.__odGtag=true;
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments)};
    gtag('js',new Date());
    if(T.GA4_ID)gtag('config',T.GA4_ID,{anonymize_ip:true});
    if(T.GADS_ID)gtag('config',T.GADS_ID);
    var sc=document.createElement('script'); sc.async=true; sc.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(T.GA4_ID||T.GADS_ID); document.head.appendChild(sc);
  }
  function bar(){
    if(document.getElementById('ckbar'))return;
    var d=document.createElement('div'); d.id='ckbar'; d.className='ckbar'; d.setAttribute('role','region'); d.setAttribute('aria-label','Aviso de cookies');
    d.innerHTML='<p>Usamos cookies de Google Analytics para saber cuántas personas visitan la página. No usamos datos de salud. <a href="politica-privacidad.html">Más información</a></p><div><button type="button" class="btn btn-ghost" data-ck="no">Rechazar</button><button type="button" class="btn btn-primary" data-ck="si">Aceptar</button></div>';
    d.addEventListener('click',function(e){var b=e.target.closest('[data-ck]'); if(!b)return; set(b.getAttribute('data-ck')); if(b.getAttribute('data-ck')==='si')load(); d.remove();});
    document.body.appendChild(d);
  }
  var c=get(); if(c==='si')load(); else if(c!=='no')bar();
  var pref=document.getElementById('ckPref'); if(pref){pref.hidden=false; pref.addEventListener('click',function(){bar(); var b=document.querySelector('#ckbar [data-ck=si]'); if(b)b.focus();});}
})();
(function(){
  var WA='573045550119', last=0;
  function track(t){
    if(Date.now()-last<3000)return; last=Date.now();
    try{(window.dataLayer=window.dataLayer||[]).push({event:'lead',type:t});
      var T=window.TRACK;
      if(window.gtag&&T.GA4_ID)gtag('event','generate_lead',{method:t});
      if(window.gtag&&T.GADS_ID&&T.GADS_LABELS[t])gtag('event','conversion',{send_to:T.GADS_ID+'/'+T.GADS_LABELS[t]});
      if(window.fbq)fbq('track','Lead');}catch(e){}
  }
  document.addEventListener('click',function(e){
    var a=e.target.closest('a.js-wa');
    if(a){
      var m=a.getAttribute('data-msg')||'Hola, quiero información';
      a.href='https://wa.me/'+WA+'?text='+encodeURIComponent(m);
      track('whatsapp');
    }
    var t=e.target.closest('a[href^="tel:"]'); if(t)track('call');
  });

  /* ---- Opiniones reales de Google (vacío = la sección queda oculta) ----
     Copiar tal cual, con autorización de cada persona: {name:'Nombre A.',stars:5,when:'',text:'Texto de la opinión'}
     RATING: {score:'4,9',count:30} y GMAPS_PLACE / GMAPS_DIR con el place_id del consultorio. */
  var GOOGLE_REVIEWS=[];
  var RATING={score:'',count:0};
  var GMAPS_PLACE='', GMAPS_DIR='', GMAPS_REVIEW='';
  (function(){
    var box=document.getElementById('reviews'), sec=document.getElementById('opiniones'); if(!box||!sec||!GOOGLE_REVIEWS.length)return;
    sec.hidden=false;
    if(RATING.score){document.getElementById('rtNum').textContent=RATING.score; document.getElementById('rtTxt').textContent=RATING.count+' opiniones en Google';}
    var rl=document.getElementById('rtLink'); if(GMAPS_PLACE)rl.href=GMAPS_PLACE; else rl.hidden=true;
    GOOGLE_REVIEWS.forEach(function(r){
      var d=document.createElement('div'); d.className='review';
      var st=document.createElement('div'); st.className='stars'; st.textContent='★★★★★'.slice(0,r.stars)+'☆☆☆☆☆'.slice(0,5-r.stars);
      var p=document.createElement('p'); p.textContent='“'+r.text+'”';
      var w=document.createElement('div'); w.className='who'; var b=document.createElement('b'); b.textContent=r.name; w.appendChild(b); w.appendChild(document.createTextNode(r.when?' · '+r.when:''));
      d.appendChild(st); d.appendChild(p); d.appendChild(w);
      if(GMAPS_PLACE){
        var lk=document.createElement('div'); lk.className='rvlinks';
        var g=document.createElement('a'); g.href=GMAPS_PLACE; g.target='_blank'; g.rel='noopener'; g.textContent='Ver en Google Maps'; g.setAttribute('aria-label','Ver la opinión de '+r.name+' en Google Maps');
        lk.appendChild(g);
        if(GMAPS_DIR){var c=document.createElement('a'); c.href=GMAPS_DIR; c.target='_blank'; c.rel='noopener'; c.textContent='Cómo llegar'; lk.appendChild(c);}
        d.appendChild(lk);
      }
      box.appendChild(d);
    });
    var gn=document.getElementById('gnote'); gn.hidden=false;
    if(GMAPS_REVIEW){gn.appendChild(document.createTextNode(' ¿Ya te atendimos? ')); var a=document.createElement('a'); a.href=GMAPS_REVIEW; a.target='_blank'; a.rel='noopener'; a.textContent='Déjanos tu opinión en Google'; gn.appendChild(a);}
    /* carrusel: avanza de a una tarjeta hacia la izquierda, en bucle, dentro de un marco */
    var cards=[].slice.call(box.children), playing=true, timer=null, busy=false;
    var rm=window.matchMedia('(prefers-reduced-motion: reduce)');
    var frame=document.createElement('div'); frame.className='rvframe';
    var vp=document.createElement('div'); vp.className='rvviewport';
    box.parentNode.insertBefore(frame,box); frame.appendChild(vp); vp.appendChild(box); box.classList.add('track');
    var ctl=document.createElement('div'); ctl.className='rvctl';
    ctl.innerHTML='<button type="button" class="rvbtn" id="rvPrev" aria-label="Opinión anterior">‹</button><button type="button" class="rvbtn" id="rvNext" aria-label="Opinión siguiente">›</button><button type="button" class="rvbtn rvplay" id="rvPlay" aria-label="Pausar movimiento automático">❚❚</button><span class="rvsr" id="rvSr" aria-live="off"></span>';
    frame.appendChild(ctl);
    frame.setAttribute('role','region'); frame.setAttribute('aria-roledescription','carrusel'); frame.setAttribute('aria-label','Opiniones de pacientes en Google');
    function still(){return rm.matches||document.documentElement.className.indexOf('a11y-s')>-1}
    function step(){var c=box.firstElementChild; return c.getBoundingClientRect().width+parseFloat(getComputedStyle(box).columnGap||getComputedStyle(box).gap||18)}
    function announce(){var c=box.firstElementChild, w=c.querySelector('.who b'); document.getElementById('rvSr').textContent='Opinión de '+(w?w.textContent:'')+', '+(cards.indexOf(c)+1)+' de '+cards.length}
    function next(manual){
      if(busy)return; busy=true;
      var done=function(){box.style.transition='none'; box.appendChild(box.firstElementChild); box.style.transform='translateX(0)'; box.offsetWidth; busy=false; announce()};
      if(still()){done();}else{box.style.transition='transform .7s cubic-bezier(.45,.05,.25,1)'; box.style.transform='translateX(-'+step()+'px)'; setTimeout(done,720)}
      if(manual)userAct();
    }
    function prev(manual){
      if(busy)return; busy=true;
      box.style.transition='none'; box.insertBefore(box.lastElementChild,box.firstElementChild);
      if(still()){box.style.transform='translateX(0)'; busy=false; announce();}
      else{box.style.transform='translateX(-'+step()+'px)'; box.offsetWidth; box.style.transition='transform .7s cubic-bezier(.45,.05,.25,1)'; box.style.transform='translateX(0)'; setTimeout(function(){busy=false; announce()},720)}
      if(manual)userAct();
    }
    function userAct(){document.getElementById('rvSr').setAttribute('aria-live','polite'); restart()}
    function tick(){ if(!playing||document.hidden||still())return; if(frame.matches(':hover')||frame.contains(document.activeElement))return; next(false) }
    function restart(){clearInterval(timer); if(playing&&!rm.matches)timer=setInterval(tick,4000)}
    document.getElementById('rvPrev').onclick=function(){prev(true)};
    document.getElementById('rvNext').onclick=function(){next(true)};
    document.getElementById('rvPlay').onclick=function(){
      playing=!playing; this.textContent=playing?'❚❚':'▶'; this.setAttribute('aria-label',playing?'Pausar movimiento automático':'Reanudar movimiento automático');
      document.getElementById('rvSr').setAttribute('aria-live',playing?'off':'polite'); restart();
    };
    if(rm.matches){playing=false; var pb=document.getElementById('rvPlay'); pb.textContent='▶'; pb.setAttribute('aria-label','Reanudar movimiento automático')}
    function mores(){
      /* primero se mide todo y luego se modifica, para no forzar recálculos de diseño */
      var m=cards.map(function(c){var p=c.querySelector('p');return c.classList.contains('open')?null:p.scrollHeight>p.clientHeight+2});
      cards.forEach(function(c,i){
        var p=c.querySelector('p'), b=c.querySelector('.rvmore'), over=m[i]; if(over===null)return;
        if(over&&!b){b=document.createElement('button'); b.type='button'; b.className='rvmore'; b.textContent='Leer completa'; b.setAttribute('aria-expanded','false');
          b.onclick=function(){var o=c.classList.toggle('open'); b.textContent=o?'Leer menos':'Leer completa'; b.setAttribute('aria-expanded',o?'true':'false')};
          p.parentNode.insertBefore(b,p.nextSibling)}
        if(!over&&b)b.remove();
      })}
    var rz; window.addEventListener('resize',function(){clearTimeout(rz); rz=setTimeout(mores,150)});
    mores(); announce(); restart();
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(mores);
  })();

  /* ---- movimiento e interacción ---- */
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nav=document.querySelector('.nav'), prog=document.getElementById('progress'), mbar=document.getElementById('mbar'), hero=document.querySelector('.hero');
  function onScroll(){
    var y=window.scrollY||0, h=document.documentElement.scrollHeight-window.innerHeight;
    nav.classList.toggle('s',y>20);
    prog.style.transform='scaleX('+(h>0?Math.min(1,y/h):0)+')';
    if(mbar){var mo=y>(hero?hero.offsetHeight*0.8:500); mbar.classList.toggle('on',mo); document.documentElement.classList.toggle('mbar-on',mo);}
  }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();

  // aparición al desplazarse
  if(!reduce&&'IntersectionObserver' in window){
    document.documentElement.classList.add('js');
    var sel='.sechead,.serv,.why .card,.docgrid>*,.rating,.locgrid>*,.mapcard,details,.bookgrid>*,.reviews .review';
    var els=[].slice.call(document.querySelectorAll(sel)).concat([].slice.call(document.querySelectorAll('.reveal')));
    var seen=new Set();
    els.forEach(function(el){ if(seen.has(el))return; seen.add(el); el.classList.add('reveal');
      var sib=el.parentElement?[].indexOf.call(el.parentElement.children,el):0; el.style.setProperty('--d',(Math.min(sib,5)*0.08)+'s'); });
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
    seen.forEach(function(el){io.observe(el);});
  }

  // etapas rotativas en el hero
  var tk=document.getElementById('ticker');
  if(tk&&!reduce){
    var words=['Niños','Jóvenes','Adultos','Adultos mayores'], wi=0;
    setInterval(function(){if(document.documentElement.classList.contains('a11y-s'))return;tk.classList.add('out');setTimeout(function(){wi=(wi+1)%words.length;tk.textContent=words[wi];tk.classList.remove('out');},350);},2400);
  }

  // filtros de servicios
  var fb=document.getElementById('filters');
  if(fb){
    fb.addEventListener('click',function(e){
      var b=e.target.closest('.fbtn'); if(!b)return; var f=b.getAttribute('data-f');
      [].forEach.call(fb.querySelectorAll('.fbtn'),function(x){var on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on);});
      [].forEach.call(document.querySelectorAll('.serv'),function(c){
        var ok=f==='all'||(' '+c.getAttribute('data-cat')+' ').indexOf(' '+f+' ')>-1;
        c.hidden=!ok; c.classList.remove('show'); if(ok){c.classList.add('in'); void c.offsetWidth; c.classList.add('show');}
      });
    });
  }

  // guía "¿qué necesitas?"
  var NAME='KEYS Odontología';
  var QZ={
    chequeo:{t:'Valoración y prevención',x:'Revisión completa, limpieza y un plan claro para cuidar tu boca antes de que duela.',m:'Hola, quiero agendar una valoración y limpieza dental en '+NAME},
    dolor:{t:'Valoración por dolor o molestia',x:'Cuéntanos qué sientes para darte el horario más pronto y valorar si necesitas una restauración o una endodoncia.',m:'Hola, tengo dolor o una molestia dental y quiero una cita en '+NAME},
    estetica:{t:'Blanqueamiento y estética dental',x:'Valoramos el estado de tu boca y te explicamos qué opciones te convienen para mejorar tu sonrisa.',m:'Hola, quiero información sobre blanqueamiento y estética dental en '+NAME},
    orto:{t:'Ortodoncia',x:'Una valoración para alinear tus dientes y corregir la mordida, con las opciones explicadas.',m:'Hola, quiero información sobre ortodoncia en '+NAME},
    faltan:{t:'Implantes y rehabilitación oral',x:'Te explicamos las alternativas para reponer los dientes que te faltan y recuperar tu masticación.',m:'Hola, me faltan dientes y quiero información sobre implantes o rehabilitación en '+NAME},
    ninos:{t:'Odontopediatría',x:'Atención dental para niñas y niños, en un ambiente tranquilo y con acompañamiento a la familia.',m:'Hola, quiero agendar una cita de odontopediatría en '+NAME}
  };
  var qs=document.getElementById('qStep'), qr=document.getElementById('qResult');
  if(qs&&qr){
    qs.addEventListener('click',function(e){
      var b=e.target.closest('.qopt'); if(!b)return; var r=QZ[b.getAttribute('data-k')];
      document.getElementById('qTitle').textContent=r.t; document.getElementById('qText').textContent=r.x;
      document.getElementById('qWa').href='https://wa.me/'+WA+'?text='+encodeURIComponent(r.m);
      qs.hidden=true; qr.hidden=false;
    });
    document.getElementById('qWa').addEventListener('click',function(){track('whatsapp');});
    document.getElementById('qReset').addEventListener('click',function(){qr.hidden=true;qs.hidden=false;});
  }

  // desplazamiento suave de la imagen con el mouse
  if(!reduce&&window.matchMedia&&window.matchMedia('(hover:hover)').matches){
    [].forEach.call(document.querySelectorAll('.serv'),function(c){
      c.addEventListener('mousemove',function(e){var r=c.getBoundingClientRect();c.style.setProperty('--mx',((e.clientX-r.left)/r.width-.5).toFixed(3));c.style.setProperty('--my',((e.clientY-r.top)/r.height-.5).toFixed(3));});
      c.addEventListener('mouseleave',function(){c.style.setProperty('--mx',0);c.style.setProperty('--my',0);});
    });
  }

  /* ---- accesibilidad ---- */
  (function(){
    var root=document.documentElement, KEY='od-a11y';
    var st={t:0,c:0,l:0,f:0,sp:0,s:0};
    try{var raw=localStorage.getItem(KEY); if(raw){var o=JSON.parse(raw); for(var k in st){if(typeof o[k]==='number')st[k]=o[k];}}}catch(e){}
    var btn=document.getElementById('a11yBtn'), panel=document.getElementById('a11yPanel');
    var TXT=[100,110,125,140];
    function apply(save){
      ['t1','t2','t3'].forEach(function(c){root.classList.remove('a11y-'+c);});
      if(st.t>0)root.classList.add('a11y-t'+st.t);
      ['c','l','f','sp','s'].forEach(function(k){root.classList.toggle('a11y-'+k,!!st[k]);});
      document.getElementById('a11yTxtVal').textContent=TXT[st.t]+'%';
      document.getElementById('a11yMinus').disabled=st.t===0; document.getElementById('a11yPlus').disabled=st.t===3;
      [].forEach.call(panel.querySelectorAll('.a11y-opt'),function(b){b.setAttribute('aria-pressed',st[b.getAttribute('data-opt')]?'true':'false');});
      if(save){try{localStorage.setItem(KEY,JSON.stringify(st));}catch(e){}}
    }
    function open(on){panel.hidden=!on;btn.setAttribute('aria-expanded',on?'true':'false'); if(on){document.getElementById('a11yPlus').focus();}else{btn.focus();}}
    btn.addEventListener('click',function(){open(panel.hidden);});
    document.getElementById('a11yClose').addEventListener('click',function(){open(false);});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!panel.hidden)open(false);});
    document.addEventListener('click',function(e){if(!panel.hidden&&!panel.contains(e.target)&&!btn.contains(e.target)){panel.hidden=true;btn.setAttribute('aria-expanded','false');}});
    document.getElementById('a11yPlus').addEventListener('click',function(){if(st.t<3){st.t++;apply(true);}});
    document.getElementById('a11yMinus').addEventListener('click',function(){if(st.t>0){st.t--;apply(true);}});
    panel.addEventListener('click',function(e){var b=e.target.closest('.a11y-opt'); if(!b)return; var k=b.getAttribute('data-opt'); st[k]=st[k]?0:1; apply(true);});
    document.getElementById('a11yReset').addEventListener('click',function(){st={t:0,c:0,l:0,f:0,sp:0,s:0};apply(true);});
    apply(false);
  })();
  var b=document.getElementById('burger'), mm=document.getElementById('mmenu');
  function menu(on){mm.classList.toggle('on',on);b.setAttribute('aria-expanded',on);}
  b.addEventListener('click',function(){menu(!mm.classList.contains('on'));});
  mm.addEventListener('click',function(e){if(e.target.closest('a'))menu(false);});
  document.getElementById('bookForm').addEventListener('submit',function(e){
    e.preventDefault();
    var n=document.getElementById('bName').value.trim(), err=document.getElementById('bErr');
    if(!n||!document.getElementById('bAuth').checked){
      err.textContent=!n?'Escribe tu nombre.':'Debes aceptar la autorización de datos para continuar.';
      err.style.display='block'; return;
    }
    err.style.display='none';
    var msg='Hola, soy '+n+'. Quiero agendar: '+document.getElementById('bSvc').value+'.';
    var x=document.getElementById('bMsg').value.trim(); if(x)msg+=' '+x;
    track('form');
    window.open('https://wa.me/'+WA+'?text='+encodeURIComponent(msg),'_blank','noopener');
  });
})();
/* ===== Detalle de cada servicio (ventana ampliada) ===== */
(function(){
  var S={
 "valoracion": {
  "img": "img/svc-valoracion.webp",
  "alt": "Foto ilustrativa de valoración y prevención",
  "t": "Valoración y prevención",
  "l": "Revisamos tu boca con calma y te entregamos un plan de tratamiento claro, con opciones.",
  "i": [
   "Exámenes de rutina: primera consulta y revisión completa de dientes y encías",
   "Profilaxis (limpieza dental)",
   "Detartraje (retiro de sarro)",
   "Urgencias odontológicas",
   "Exodoncias (extracciones)",
   "Radiografías, flúor y sellantes cuando el odontólogo los indique",
   "Plan de tratamiento por escrito, explicado antes de empezar"
  ],
  "p": "Niños, jóvenes, adultos y adultos mayores, para un control de rutina o una primera valoración.",
  "c": "Trae tu documento y, si los tienes, radiografías o tratamientos anteriores. Cuéntale al odontólogo si tomas medicamentos o tienes alergias.",
  "m": "Hola, quiero agendar una valoración dental en KEYS Odontología"
 },
 "blanqueamiento": {
  "img": "img/svc-blanqueamiento.webp",
  "alt": "Foto ilustrativa de blanqueamiento y estética dental",
  "t": "Blanqueamiento y estética dental",
  "l": "Valoramos si el blanqueamiento es adecuado para ti y qué opción te conviene.",
  "i": [
   "Diseño de sonrisa",
   "Blanqueamiento dental, en consultorio o con acompañamiento en casa",
   "Carillas dentales",
   "Cambio de calzas negras",
   "Restauraciones con resina",
   "Valoración previa del color y del estado de dientes y encías",
   "Indicaciones para mantener el resultado y cuidar la sensibilidad"
  ],
  "p": "Adultos con dientes y encías sanas que quieren aclarar el color de su sonrisa.",
  "c": "Si tienes caries o encías inflamadas, se tratan primero. El resultado depende de cada persona; el odontólogo te explica qué esperar.",
  "m": "Hola, quiero información sobre blanqueamiento dental en KEYS Odontología"
 },
 "restauracion": {
  "img": "img/svc-restauracion.webp",
  "alt": "Foto ilustrativa de resinas y restauraciones",
  "t": "Resinas y restauraciones",
  "l": "Reparamos los dientes dañados para que vuelvan a funcionar bien y se vean naturales.",
  "i": [
   "Restauraciones con resina del color del diente",
   "Cambio de calzas negras (amalgama) por resina",
   "Reparación de dientes fracturados, desgastados o con manchas",
   "Tratamiento de caries",
   "Orientación para evitar que vuelvan a aparecer caries"
  ],
  "p": "Personas con caries, dientes rotos, sensibilidad o restauraciones viejas.",
  "c": "Si tienes dolor o un diente roto, escríbenos y te indicamos el horario más pronto disponible.",
  "m": "Hola, quiero agendar una cita para una caries o restauración en KEYS Odontología"
 },
 "endodoncia": {
  "img": "img/svc-endodoncia.webp",
  "alt": "Foto ilustrativa de endodoncia",
  "t": "Endodoncia",
  "l": "Tratamiento para conservar un diente cuya parte interna está inflamada o infectada.",
  "i": [
   "Valoración del diente con radiografía",
   "Tratamiento de conducto con anestesia local",
   "Control posterior para ver cómo evoluciona",
   "Orientación sobre la restauración final del diente"
  ],
  "p": "Personas con dolor fuerte al masticar, dolor por frío o calor, o un diente oscurecido.",
  "c": "Cuéntanos tus síntomas al agendar. Si tienes inflamación de la cara, fiebre o dificultad para tragar o respirar, acude a urgencias.",
  "m": "Hola, quiero agendar una valoración por dolor dental / endodoncia en KEYS Odontología"
 },
 "ortodoncia": {
  "img": "img/svc-ortodoncia.webp",
  "alt": "Foto ilustrativa de ortodoncia",
  "t": "Ortodoncia",
  "l": "Valoración para alinear tus dientes y mejorar cómo muerdes, a cualquier edad.",
  "i": [
   "Brackets tradicionales",
   "Brackets de autoligado",
   "Brackets cerámicos",
   "Placas invisibles",
   "Estudio inicial con fotos y radiografías cuando se requieran",
   "Controles periódicos y retención al terminar"
  ],
  "p": "Niños, jóvenes y adultos con dientes torcidos, separados, apiñados o con la mordida cruzada.",
  "c": "Trae radiografías anteriores si las tienes. El tiempo del tratamiento depende de cada caso y se define en la valoración.",
  "m": "Hola, quiero información sobre ortodoncia en KEYS Odontología"
 },
 "implantes": {
  "img": "img/svc-implantes.webp",
  "alt": "Foto ilustrativa de implantes y rehabilitación oral",
  "t": "Implantes y rehabilitación oral",
  "l": "Te explicamos las alternativas para reponer dientes perdidos y recuperar tu masticación.",
  "i": [
   "Implantes dentales, según el estado del hueso y las encías",
   "Prótesis fija en porcelana y zirconio",
   "Prótesis removible",
   "Placas estéticas",
   "Valoración de la boca y estudios por imágenes cuando se necesiten",
   "Plan por etapas, con tiempos y cuidados explicados"
  ],
  "p": "Personas que perdieron uno o varios dientes, o usan prótesis que les incomodan.",
  "c": "Trae tus radiografías y exámenes anteriores. Cuéntanos si tienes enfermedades como diabetes o si tomas medicamentos.",
  "m": "Hola, quiero información sobre implantes y rehabilitación oral en KEYS Odontología"
 },
 "cirugia": {
  "img": "img/svc-cirugia.webp",
  "alt": "Foto ilustrativa de cirugía oral y cordales",
  "t": "Cirugía oral y cordales",
  "l": "Valoramos tu caso y te explicamos qué esperar antes, durante y después del procedimiento.",
  "i": [
   "Exodoncia de cordales (muelas del juicio)",
   "Extracción de dientes incluidos",
   "Cirugía plástica gingival",
   "Frenectomía",
   "Valoración con radiografía",
   "Indicaciones de cuidado y control después del procedimiento"
  ],
  "p": "Personas con muelas del juicio que duelen o están mal ubicadas, dientes que no se pueden conservar o infecciones.",
  "c": "Cuéntanos qué medicamentos tomas y si tienes alergias. Te indicamos si necesitas estudios antes del procedimiento.",
  "m": "Hola, quiero agendar una valoración de cirugía oral / cordales en KEYS Odontología"
 },
 "odontopediatria": {
  "img": "img/svc-odontopediatria.webp",
  "alt": "Foto ilustrativa de odontopediatría",
  "t": "Odontopediatría",
  "l": "Hacemos que la visita al odontólogo sea una experiencia tranquila para tu hijo.",
  "i": [
   "Ortopedia: aparatología fija y removible para corregir hábitos y direccionar el crecimiento de los maxilares en los niños",
   "Primera visita de adaptación y revisión",
   "Limpieza, flúor y sellantes",
   "Tratamiento de caries en dientes de leche",
   "Orientación a los padres sobre cepillado y hábitos"
  ],
  "p": "Bebés, niñas y niños; la primera visita se recomienda cuando salen los primeros dientes.",
  "c": "Cuéntale al niño que vienes a \"mirar los dientes\", sin hablar de dolor. Puedes acompañarlo durante la consulta.",
  "m": "Hola, quiero agendar una cita de odontopediatría en KEYS Odontología"
 }
};
  var d=document.getElementById('svcDlg'); if(!d)return; var last=null;
  function $(id){return document.getElementById(id)}
  function open(k,btn){
    var x=S[k]; if(!x)return; last=btn;
    var im=$('sdImg'); if(x.img){im.src=x.img; im.alt=x.alt||''; im.hidden=false;} else {im.hidden=true; im.removeAttribute('src');}
    $('sdT').textContent=x.t; $('sdL').textContent=x.l; $('sdP').textContent=x.p; $('sdC').textContent=x.c;
    var ul=$('sdI'); ul.textContent=''; x.i.forEach(function(t){var li=document.createElement('li'); li.textContent=t; ul.appendChild(li)});
    $('sdWa').setAttribute('data-msg',x.m);
    if(d.showModal)d.showModal(); else d.setAttribute('open','');
    d.querySelector('.sdlg-in').scrollTop=0;
  }
  function close(){if(d.close)d.close(); else d.removeAttribute('open')}
  d.addEventListener('close',function(){if(last)last.focus()});
  document.addEventListener('click',function(e){var b=e.target.closest('.sdet'); if(b)open(b.getAttribute('data-svc'),b)});
  $('sdX').addEventListener('click',close); $('sdX2').addEventListener('click',close);
  d.addEventListener('click',function(e){if(e.target===d)close()});
  d.addEventListener('click',function(e){if(e.target.closest('#sdWa'))setTimeout(close,300)});
})();
/* ===== Horario de hoy (hora de Colombia, UTC-5, sin festivos) ===== */
(function(){
  var el=document.getElementById('openNow'); if(!el)return;
  var H={1:[8,18],2:[8,18],3:[8,18],4:[8,18],5:[8,18],6:[8,13]};
  var now=new Date(Date.now()-5*3600*1000), day=now.getUTCDay(), h=now.getUTCHours()+now.getUTCMinutes()/60, r=H[day];
  var open=r&&h>=r[0]&&h<r[1];
  el.textContent=open?'Abierto ahora':'Cerrado ahora'; el.className='opennow '+(open?'on':'off'); el.hidden=false;
})();

/* ===== Antes y después ===== */
(function(){
  document.querySelectorAll('.baslide').forEach(function(s){
    var r=s.querySelector('.barange'); if(!r)return;
    function u(){s.style.setProperty('--p',r.value+'%');}
    r.addEventListener('input',u); u();
  });
})();

/* ===== Demo personalizable: ?n=Nombre&c=Ciudad (solo para mostrar a prospectos) ===== */
(function(){
  var q; try{q=new URLSearchParams(location.search)}catch(e){return}
  function clean(v){return (v||'').replace(/[^\p{L}\p{N} .,&'\-]/gu,'').replace(/\s+/g,' ').trim().slice(0,40)}
  var n=clean(q.get('n')), c=clean(q.get('c'));
  if(!n&&!c)return;
  var A='KEYS Odontología', B='Rionegro';
  function sub(s){if(n)s=s.split(A).join(n); if(c)s=s.split(B).join(c); return s}
  var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:function(t){var p=t.parentNode&&t.parentNode.nodeName;return (p==='SCRIPT'||p==='STYLE'||p==='NOSCRIPT')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}}),t,list=[];
  while((t=w.nextNode()))list.push(t);
  list.forEach(function(t){var v=sub(t.nodeValue); if(v!==t.nodeValue)t.nodeValue=v});
  document.querySelectorAll('[data-msg],[aria-label],[alt],[title]').forEach(function(el){
    ['data-msg','aria-label','alt','title'].forEach(function(a){var v=el.getAttribute(a); if(v){var s=sub(v); if(s!==v)el.setAttribute(a,s)}});
  });
  document.title=sub(document.title);
})();

/* ===== Dinámica: aparición al hacer scroll, contadores, barra de progreso ===== */
(function(){
  var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(rm||!('IntersectionObserver' in window))return;
  var H=document.documentElement; H.classList.add('dyn');
  function mark(sel,kind,step){
    document.querySelectorAll(sel).forEach(function(el){
      if(el.closest('.hero'))return;
      var sib=el.parentNode?Array.prototype.filter.call(el.parentNode.children,function(x){return x.matches(sel)}):[el];
      var i=sib.indexOf(el); el.classList.add('rv'); if(kind)el.classList.add(kind);
      el.style.setProperty('--d',(Math.min(i,6)*(step||.08)).toFixed(2)+'s');
    });
  }
  mark('.sechead');
  mark('.servs>*',null,.07);
  mark('.hstats li',null,.1);
  mark('.quizgrid>*');
  mark('.whygrid>*',null,.09);
  mark('.bacard',null,.1);
  mark('.docgrid>*:first-child','rv-l'); mark('.docgrid>*:last-child','rv-r');
  mark('#ubicacion .wrap>*');
  mark('.faq details',null,.05);
  mark('.bookgrid>*:first-child','rv-l'); mark('.bookgrid>*:last-child','rv-z');
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}})},{rootMargin:'0px 0px -8% 0px',threshold:.08});
  document.querySelectorAll('.rv').forEach(function(el){io.observe(el)});
  /* Contadores en la barra de cifras */
  var cio=new IntersectionObserver(function(es){es.forEach(function(e){
    if(!e.isIntersecting)return; cio.unobserve(e.target);
    var b=e.target, m=b.textContent.match(/^(\d+)(.*)$/); if(!m)return;
    var to=+m[1], rest=m[2], t0=null, dur=to>3?1100:600;
    b.setAttribute('aria-label',b.textContent);
    function f(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/dur),v=Math.round(to*(1-Math.pow(1-k,3)));b.textContent=v+rest;if(k<1)requestAnimationFrame(f);}
    requestAnimationFrame(f);
  })},{threshold:.6});
  document.querySelectorAll('.hstats b').forEach(function(b){cio.observe(b)});
  /* Barra de progreso y sombra del encabezado */
  var bar=document.createElement('div'); bar.className='scrollbar'; bar.setAttribute('aria-hidden','true'); document.body.appendChild(bar);
  var nav=document.querySelector('.nav'), tick=false;
  function upd(){tick=false;var y=window.scrollY,h=document.documentElement.scrollHeight-innerHeight;bar.style.transform='scaleX('+(h>0?y/h:0)+')';if(nav)nav.classList.toggle('scrolled',y>10);}
  addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(upd)}},{passive:true}); upd();
})();
