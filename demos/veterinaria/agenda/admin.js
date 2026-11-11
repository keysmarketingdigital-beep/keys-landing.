(function(){
var K=KV,E=KE,$=function(s){return document.querySelector(s)};
var USERS={'admin@keys.demo':{rol:'admin',pid:null},'profesional@keys.demo':{rol:'prof',pid:'vet1'}};
var ses=null,tab='agenda',last=0;
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function td(r,x){var c=el('td','',x);r.appendChild(c);return c}
function tag(txt,cls){return el('span','tag '+cls,txt)}
function b(txt,fn,c){var x=el('button','btn sm '+(c||''),txt);x.type='button';x.addEventListener('click',fn);return x}
$('#fLog').addEventListener('submit',function(e){e.preventDefault();var d=new FormData(this),u=USERS[(d.get('u')||'').trim().toLowerCase()];
 if(!u||d.get('p')!=='demo1234'){$('#lErr').hidden=false;$('#lErr').textContent='Correo o clave incorrectos.';return}
 ses=u;$('#pLogin').hidden=true;$('#app').hidden=false;E.sembrar();render()});
function cola(){return E.db().cola.filter(function(x){return x.estado==='en_cola'||x.estado==='aviso_llegada'})}
function tabs(){var n=cola().length,t=[['agenda','Agenda del día'],['urg','Urgencias'+(n?'|'+n:'')],['srv','Servicios'],['eq','Equipo'],['msg','Mensajes']];
 var c=$('.tabs');c.innerHTML='';t.forEach(function(x){var p=x[1].split('|'),bt=el('button','',p[0]);bt.type='button';bt.setAttribute('role','tab');bt.setAttribute('aria-selected',tab===x[0]);
  if(p[1])bt.appendChild(el('span','badge',p[1]));bt.addEventListener('click',function(){tab=x[0];render()});c.appendChild(bt)})}
function tabla(cols){var w=el('div','tbl'),t=el('table'),h=el('tr');cols.forEach(function(c){h.appendChild(el('th','',c))});t.appendChild(h);w.appendChild(t);return [w,t]}
function render(){if(!ses)return;tabs();var v=$('#v');v.innerHTML='';var p=el('section','panel');v.appendChild(p);var d=E.db();
 if(tab==='agenda'){var hoy=E.ymd(E.nowCO());p.appendChild(el('h2','','Citas confirmadas'));var f=d.citas.filter(function(c){return c.estado==='confirmada'&&(ses.rol==='admin'||c.pid===ses.pid)}).sort(function(a,b){return (a.f+('0000'+a.m).slice(-4)).localeCompare(b.f+('0000'+b.m).slice(-4))});
  if(!f.length){p.appendChild(el('p','hint','Sin citas.'));return}
  var r=tabla(['Fecha y hora','Servicio','Mascota','Dueño','Profesional','Sala','']);f.forEach(function(c){var tr=el('tr');td(tr,E.fmtCuando(c.f,c.m)+(c.f===hoy?' (hoy)':''));td(tr,K.SERVICIOS[c.tipo].n);td(tr,c.mascota.nombre+' ('+c.mascota.especie+')');td(tr,c.dueno+' · '+c.cel);td(tr,K.PROF[c.pid].n);td(tr,K.SALAS[c.sala]||c.sala);
   td(tr,'').appendChild(b('Cancelar',function(){var x=E.db();x.citas.forEach(function(y){if(y.id===c.id)y.estado='cancelada'});E.save(x);render()}));r[1].appendChild(tr)});p.appendChild(r[0])}
 else if(tab==='urg'){p.appendChild(el('h2','','Cola de urgencias (sin cita)'));p.appendChild(el('p','hint','Las urgencias no se agendan: se atienden por prioridad. Primero las graves, luego por hora de llegada.'));
  var q=cola().sort(function(a,b){return (a.nivel==='vital'?0:1)-(b.nivel==='vital'?0:1)||a.t-b.t});if(!q.length){p.appendChild(el('p','','No hay urgencias en cola.'));return}
  var r=tabla(['#','Prioridad','Mascota','Dueño','Síntomas','']);q.forEach(function(u,i){var tr=el('tr');td(tr,i+1);td(tr,'').appendChild(tag(u.nivel==='vital'?'Grave':'Urgente',u.nivel==='vital'?'t-v':'t-u'));td(tr,u.mascota+' ('+u.especie+')');td(tr,u.dueno+' · '+u.cel);td(tr,u.sintomas+(u.senales.length?' ['+u.senales.join(', ')+']':''));
   td(tr,'').appendChild(b('Atendida',function(){var x=E.db();x.cola.forEach(function(y){if(y.id===u.id)y.estado='atendida'});E.save(x);render()}));r[1].appendChild(tr)});p.appendChild(r[0])}
 else if(tab==='srv'){p.appendChild(el('h2','','Servicios (duraciones de ejemplo, por confirmar)'));var r=tabla(['Servicio','Categoría','Duración','Sala','Paso en agenda']);Object.keys(K.SERVICIOS).forEach(function(id){var s=K.SERVICIOS[id],tr=el('tr');td(tr,s.n);td(tr,K.CATS[s.cat]);td(tr,s.dur+' min');td(tr,s.sala?K.SALAS[s.sala]:'Del profesional');td(tr,(s.dur+K.C.colchon)+' min');r[1].appendChild(tr)});p.appendChild(r[0]);
  p.appendChild(el('p','hint','Sin cita: urgencias 24 h, hospitalización y farmacia.'))}
 else if(tab==='eq'){p.appendChild(el('h2','','Equipo (nombres de ejemplo)'));var r=tabla(['Nombre','Rol','Especies','Servicios']);Object.keys(K.PROF).forEach(function(id){var x=K.PROF[id],tr=el('tr');td(tr,x.n);td(tr,x.rol);td(tr,x.esp.length===6?'Todas':x.esp.join(', '));td(tr,x.srv.map(function(s){return K.SERVICIOS[s].n}).join(', '));r[1].appendChild(tr)});p.appendChild(r[0])}
 else{p.appendChild(el('h2','','Mensajes'));var n=d.citas.filter(function(c){return c.estado==='confirmada'&&c.creada>last}).length;
  var m=d.citas.filter(function(c){return c.estado==='confirmada'}).sort(function(a,b){return b.creada-a.creada}).slice(0,10);if(!m.length)p.appendChild(el('p','hint','Sin mensajes.'));
  m.forEach(function(c){var bx=el('div','cita');bx.appendChild(el('p','','Nueva cita '+c.id+': '+c.dueno+' agendó '+K.SERVICIOS[c.tipo].n+' para '+c.mascota.nombre+' el '+E.fmtCuando(c.f,c.m)+'.'));
   var a=el('a','btn sm wa','Escribir por WhatsApp');a.href='https://wa.me/57'+c.cel+'?text='+encodeURIComponent('Hola '+c.dueno+', te escribimos de '+K.C.nombre+' sobre tu cita '+c.id+'.');a.target='_blank';a.rel='noopener';bx.appendChild(a);p.appendChild(bx)});last=Date.now()}}
// refresco automático
var sig='';function firma(){var d=E.db();return d.citas.length+'|'+d.cola.length+'|'+d.citas.filter(function(c){return c.estado==='confirmada'}).length+'|'+cola().length}
setInterval(function(){if(ses&&document.visibilityState==='visible'){var s=firma();if(s!==sig){sig=s;render()}}},30000);
document.addEventListener('visibilitychange',function(){if(ses&&document.visibilityState==='visible'){sig=firma();render()}});
window.addEventListener('storage',function(){if(ses)render()});
})();
