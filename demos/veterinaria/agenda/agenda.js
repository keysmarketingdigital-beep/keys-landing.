(function(){
var K=KV,E=KE,$=function(s){return document.querySelector(s)};
var S={esp:null,tipo:null,pid:null,f:null,m:null,mod:null};
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function btn(txt,on,cls,sub){var b=el('button','opt'+(cls?' '+cls:''),txt);b.type='button';if(sub){b.appendChild(el('small','',sub))}b.addEventListener('click',on);return b}
function show(s,v){$(s).hidden=!v}
E.sembrar();
// especies (agenda y urgencia)
K.ESPECIES.forEach(function(e){var o=el('option','',e[1]);o.value=e[0];$('#uEsp').appendChild(o)});
function pintaEsp(){var c=$('#oEsp');c.innerHTML='';K.ESPECIES.forEach(function(e){c.appendChild(btn(e[1],function(){S.esp=e[0];S.tipo=S.pid=S.f=S.m=null;pintaEsp();pintaSrv();reseteaPaso3()},S.esp===e[0]?'on':''))})}
function atiende(t){return E.profesionales(S.esp,t).length>0}
var FILT=(new URLSearchParams(location.search)).get('s');
function pintaSrv(){var c=$('#oSrv');c.innerHTML='';$('#hSrv').textContent='';if(!S.esp){$('#hSrv').textContent='Elige primero la especie.';return}
 Object.keys(K.SERVICIOS).forEach(function(id){var s=K.SERVICIOS[id];if(FILT&&FILT!=='urgencias'&&FILT!=='hospital'&&s.cat!==FILT)return;
  if(!atiende(id))return;c.appendChild(btn(s.n,function(){S.tipo=id;S.pid=S.f=S.m=null;pintaSrv();pintaPaso3()},S.tipo===id?'on':'',s.dur+' min (ejemplo)'))});
 if(!c.children.length)$('#hSrv').textContent='Ningún profesional atiende esa combinación. Escríbenos por WhatsApp.';
 if(FILT){var a=el('a','','Ver todos los servicios');a.href='index.html';a.style.marginLeft='8px';c.appendChild(a)}}
function reseteaPaso3(){show('#bPro',false);show('#fDat',false)}
function pintaPaso3(){show('#bPro',true);show('#fDat',false);var c=$('#oPro');c.innerHTML='';
 E.profesionales(S.esp,S.tipo).forEach(function(id){var p=K.PROF[id],b=btn('',function(){S.pid=id;S.f=S.m=null;pintaPaso3()},'pro'+(S.pid===id?' on':''));
  var i=el('img');i.src=p.img;i.alt='';i.width=44;i.height=44;b.appendChild(i);var d=el('span','',p.n);d.appendChild(el('small','',p.rol));b.appendChild(d);c.appendChild(b)});
 var d=$('#oDia');d.innerHTML='';$('#oHrs').innerHTML='';if(!S.pid)return;var h=E.nowCO();
 for(var i=0;i<7;i++){(function(i){var x=new Date(h.getFullYear(),h.getMonth(),h.getDate()+i),f=E.ymd(x),t=E.DIAS[x.getDay()].slice(0,3)+' '+x.getDate()+' '+E.MESES[x.getMonth()].slice(0,3);
  d.appendChild(btn(t,function(){S.f=f;S.m=null;pintaPaso3()},S.f===f?'on':''))})(i)}
 if(!S.f)return;var r=E.disponibilidad(S.tipo,S.esp,S.f,S.pid)[S.pid]||[];
 if(!r.length){$('#oHrs').appendChild(el('p','hint','Sin horarios ese día. Prueba otro.'));return}
 r.forEach(function(m){$('#oHrs').appendChild(btn(E.fmtH(m),function(){S.m=m;pintaPaso3();pintaDatos()},S.m===m?'on':''))})}
function pintaDatos(){show('#fDat',true);var s=K.SERVICIOS[S.tipo];$('#resumen').textContent=s.n+' · '+K.PROF[S.pid].n+' · '+E.fmtCuando(S.f,S.m);
 show('#lVac',!!s.pideVac);var p=$('#prep');p.hidden=!s.prep;if(s.prep)p.textContent='Preparación (ejemplo, la confirma la clínica): ayuno según indique el veterinario antes de este servicio.'}
$('#fDat').addEventListener('submit',function(e){e.preventDefault();var d=new FormData(this),er=$('#dErr');er.hidden=true;
 var ev=E.evaluar((d.get('notas')||''));
 if(ev.nivel==='vital'||ev.nivel==='urgente'){er.hidden=false;er.textContent='Lo que describes ('+ev.senales.join(', ')+') puede ser una urgencia y no se agenda. Usa “Registrar una urgencia” arriba o ven a la clínica.';return}
 if(!d.get('dueno')||!d.get('mascota')){er.hidden=false;er.textContent='Completa tu nombre y el de tu mascota.';return}
 var r=E.reservar({tipo:S.tipo,pid:S.pid,f:S.f,m:S.m,especie:S.esp,dueno:d.get('dueno'),cel:d.get('cel'),mascota:d.get('mascota'),raza:d.get('raza'),edad:d.get('edad'),peso:d.get('peso'),vacunas:d.get('vacunas'),notas:d.get('notas'),autoriza:!!d.get('aut')});
 if(!r.ok){er.hidden=false;er.textContent=r.detalle||r.codigo;if(r.codigo==='SLOT_OCUPADO'){S.m=null;pintaPaso3()}return}
 var c=r.cita,b=$('#rOk');b.className='ok';b.hidden=false;b.innerHTML='';b.appendChild(el('h2','','Cita confirmada'));
 b.appendChild(el('p','',c.id+' · '+K.SERVICIOS[c.tipo].n+' de '+c.mascota.nombre+' · '+E.fmtCuando(c.f,c.m)+' · '+K.PROF[c.pid].n));
 b.appendChild(el('p','hint','Guarda el código '+c.id+' para cambiar o cancelar (hasta '+K.C.limiteCambioH+' h antes). Recordatorio '+K.C.recordatorioH+' h antes por WhatsApp (en producción).'));
 var a=el('a','btn wa','Confirmar por WhatsApp');a.href=E.waLink(c);a.target='_blank';a.rel='noopener';b.appendChild(a);show('#fDat',false);show('#bPro',false);b.scrollIntoView({behavior:'smooth'})});
// urgencias
$('#bUrg').addEventListener('click',function(){show('#pUrg',true);$('#pUrg').scrollIntoView({behavior:'smooth'})});
$('#fUrg').addEventListener('submit',function(e){e.preventDefault();var d=new FormData(this),er=$('#uErr');er.hidden=true;
 if(E.cel(d.get('cel')).length!==10||!d.get('sint')||!d.get('dueno')){er.hidden=false;er.textContent='Completa tu nombre, un celular de 10 dígitos y qué le pasa.';return}
 var r=E.urgencia({dueno:d.get('dueno'),cel:d.get('cel'),mascota:d.get('mascota'),especie:d.get('especie'),sintomas:d.get('sint')}),b=$('#uRes');b.hidden=false;b.className='ok';b.innerHTML='';
 b.appendChild(el('h2','',r.nivel==='vital'?'Ven de inmediato':'Quedaste en la cola de prioridad'));
 b.appendChild(el('p','',r.nivel==='vital'?'Lo que describes es grave ('+r.item.senales.join(', ')+'). Ven ya a la clínica: el equipo te recibe por prioridad.':'Tu mascota entra por prioridad al llegar. Posición en la cola: '+E.colaPos(r.item.id)+'. Si empeora, ven de inmediato.'));
 var a=el('a','btn wa','Avisar por WhatsApp que voy en camino');a.href='https://wa.me/'+K.C.wa+'?text='+encodeURIComponent('Hola, voy en camino con una urgencia: '+d.get('mascota')+' ('+d.get('sint')+')');a.target='_blank';a.rel='noopener';b.appendChild(a);this.hidden=true});
// gestionar
$('#bMia').addEventListener('click',function(){var er=$('#mErr'),res=$('#mRes');er.hidden=true;res.innerHTML='';var id=$('#mId').value.trim().toUpperCase(),c=$('#mCel').value;
 var r=E.mia(id,c);if(!r.ok){er.hidden=false;er.textContent=r.detalle||('No encontramos la cita ('+r.codigo+').');return}
 var ci=r.cita,box=el('div','cita');box.appendChild(el('p','',ci.id+' · '+K.SERVICIOS[ci.tipo].n+' de '+ci.mascota.nombre+' · '+E.fmtCuando(ci.f,ci.m)));
 box.appendChild(btn('Cancelar cita',function(){var x=E.cancelar(id,c);box.innerHTML='';box.appendChild(el('p','',x.ok?'Cita cancelada.':(x.detalle||x.codigo)))}));
 box.appendChild(btn('Cambiar horario',function(){var w=el('div'),h=E.nowCO();w.appendChild(el('p','hint','Elige un día:'));var o=el('div','opts');w.appendChild(o);var hr=el('div','hrs');w.appendChild(hr);
  for(var i=0;i<7;i++){(function(i){var x=new Date(h.getFullYear(),h.getMonth(),h.getDate()+i),f=E.ymd(x);o.appendChild(btn(E.DIAS[x.getDay()].slice(0,3)+' '+x.getDate(),function(){hr.innerHTML='';var s=(E.disponibilidad(ci.tipo,ci.mascota.especie,f,ci.pid)[ci.pid]||[]);
   if(!s.length)hr.appendChild(el('p','hint','Sin horarios.'));s.forEach(function(m){hr.appendChild(btn(E.fmtH(m),function(){var y=E.reprogramar(id,c,f,m);box.innerHTML='';box.appendChild(el('p','',y.ok?'Cita cambiada a '+E.fmtCuando(f,m)+'.':(y.detalle||y.codigo)))}))})}))})(i)}
  box.appendChild(w)}));res.appendChild(box)});
pintaEsp();pintaSrv();
if(FILT==='urgencias'||FILT==='hospital'){show('#pUrg',true)}
})();
