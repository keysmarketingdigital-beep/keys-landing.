/* Backend de demostración en el navegador (equivale a demo-db.js). Datos en localStorage 'kv-demo-v1' con respaldo en memoria.
   Reglas: 24 h todos los días, colchón 10 min, huecos cada (duración + colchón), cambios hasta 24 h antes,
   máx. 3 citas futuras por celular. Hora local de Colombia (UTC-5) tomada del reloj del navegador convertido a UTC-5. */
(function(){
var K=window.KV,KEY='kv-demo-v1',mem=null;
function load(){try{var s=localStorage.getItem(KEY);if(s)return JSON.parse(s)}catch(e){}return mem||{citas:[],clientes:{},mascotas:[],cola:[],n:0}}
function save(d){mem=d;try{localStorage.setItem(KEY,JSON.stringify(d))}catch(e){}}
function norm(s){return (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
function cel(s){var d=(s||'').replace(/\D/g,'');return d.length===12&&d.indexOf('57')===0?d.slice(2):d}
function nowCO(){var n=new Date();return new Date(n.getTime()+n.getTimezoneOffset()*60000-5*3600000)} // "reloj de pared" de Colombia
function pad(n){return (n<10?'0':'')+n}
function ymd(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function mkDate(f,min){var p=f.split('-');return new Date(+p[0],+p[1]-1,+p[2],Math.floor(min/60),min%60)}
var DIAS=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'],MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
function fmtH(min){var h=Math.floor(min/60),m=min%60,s=h<12?'a. m.':'p. m.';h=h%12||12;return h+':'+pad(m)+' '+s}
function fmtCuando(f,min){var d=mkDate(f,min);return DIAS[d.getDay()]+' '+d.getDate()+' de '+MESES[d.getMonth()]+', '+fmtH(min)}
function sala(tipo,pid){return K.SERVICIOS[tipo].sala||K.PROF[pid].sala}
function candidatos(tipo,esp){var o=[];for(var id in K.PROF){var p=K.PROF[id];if(p.srv.indexOf(tipo)>-1&&p.esp.indexOf(esp)>-1)o.push(id)}return o}
function grid(dur){var o=[],t=K.C.abre,st=dur+K.C.colchon;while(t+dur<=K.C.cierra){o.push(t);t+=st}return o}
function ini(c){return c.f+'T'+pad(Math.floor(c.m/60))+':'+pad(c.m%60)}
function libre(d,pid,tipo,f,m,ignorar){var dur=K.SERVICIOS[tipo].dur,s=sala(tipo,pid),buf=K.C.colchon;
  return !d.citas.some(function(c){if(c.estado!=='confirmada'||c.id===ignorar||c.f!==f)return false;
    if(c.pid!==pid&&c.sala!==s)return false;var cd=K.SERVICIOS[c.tipo].dur;return m<c.m+cd+buf&&c.m<m+dur+buf})}
function esFuturo(f,m){return mkDate(f,m)>nowCO()}
function slots(d,pid,tipo,f,desde,hasta,ignorar){var dur=K.SERVICIOS[tipo].dur;return grid(dur).filter(function(m){return esFuturo(f,m)&&libre(d,pid,tipo,f,m,ignorar)&&(desde==null||m>=desde)&&(hasta==null||m<=hasta)})}
var E={
 K:K,ymd:ymd,nowCO:nowCO,fmtH:fmtH,fmtCuando:fmtCuando,mkDate:mkDate,cel:cel,norm:norm,DIAS:DIAS,MESES:MESES,
 db:load,save:save,
 profesionales:function(esp,tipo){return candidatos(tipo,esp)},
 disponibilidad:function(tipo,esp,f,pid,desde,hasta){var d=load(),ids=pid?[pid]:candidatos(tipo,esp),r={};
   ids.forEach(function(id){var s=slots(d,id,tipo,f,desde,hasta);if(s.length)r[id]=s});return r},
 evaluar:function(txt){var t=norm(txt),v=K.VITAL.filter(function(x){return x[1].test(t)}).map(function(x){return x[0]});
   if(v.length)return{nivel:'vital',senales:v};var u=K.URGENTE.filter(function(x){return x[1].test(t)}).map(function(x){return x[0]});
   return u.length?{nivel:'urgente',senales:u}:{nivel:'normal',senales:[]}},
 futuras:function(c){var d=load();return d.citas.filter(function(x){return x.cel===c&&x.estado==='confirmada'&&esFuturo(x.f,x.m)})},
 reservar:function(o){var d=load(),c=cel(o.cel);
   if(c.length!==10)return{ok:false,codigo:'CELULAR_INVALIDO',detalle:'El celular debe tener 10 dígitos.'};
   if(!o.autoriza)return{ok:false,codigo:'SIN_AUTORIZACION_DATOS',detalle:'Falta la autorización de datos (Ley 1581 de 2012).'};
   var cand=candidatos(o.tipo,o.especie);if(!cand.length)return{ok:false,codigo:'SIN_PROFESIONAL_PARA_ESPECIE',detalle:'Ningún profesional atiende esa especie para ese servicio. Escríbenos por WhatsApp.'};
   if(cand.indexOf(o.pid)<0)return{ok:false,codigo:'PROFESIONAL_NO_ATIENDE',detalle:'Ese profesional no atiende esa especie o servicio.'};
   if(K.SERVICIOS[o.tipo].pideVac&&!o.vacunas)return{ok:false,codigo:'FALTA_HISTORIAL_VACUNAS',detalle:'Indica el historial de vacunas o "sin carnet".'};
   if(grid(K.SERVICIOS[o.tipo].dur).indexOf(o.m)<0||!esFuturo(o.f,o.m))return{ok:false,codigo:'FUERA_DE_HORARIO',detalle:'Esa hora no existe en la agenda.'};
   if(!libre(d,o.pid,o.tipo,o.f,o.m))return{ok:false,codigo:'SLOT_OCUPADO',detalle:'Ese horario acaba de ocuparse. Elige otro.'};
   if(E.futuras(c).length>=K.C.maxFuturas)return{ok:false,codigo:'LIMITE_CITAS',detalle:'Máximo '+K.C.maxFuturas+' citas futuras por celular. Cancela o cambia una.'};
   d.n++;var cita={id:'C-'+('000'+d.n).slice(-4),tipo:o.tipo,pid:o.pid,sala:sala(o.tipo,o.pid),f:o.f,m:o.m,cel:c,dueno:o.dueno,
     mascota:{nombre:o.mascota,especie:o.especie,raza:o.raza,edad:o.edad,peso:o.peso,vacunas:o.vacunas||''},estado:'confirmada',notas:o.notas||'',creada:Date.now()};
   d.citas.push(cita);d.clientes[c]={nombre:o.dueno,cel:c};save(d);return{ok:true,cita:cita}},
 mia:function(id,celu){var d=load(),c=d.citas.filter(function(x){return x.id===id})[0];
   if(!c)return{ok:false,codigo:'CITA_NO_ENCONTRADA'};if(c.cel!==cel(celu))return{ok:false,codigo:'IDENTIDAD_NO_COINCIDE',detalle:'El celular no corresponde al titular.'};
   if(c.estado!=='confirmada')return{ok:false,codigo:'CITA_NO_ACTIVA'};
   if(mkDate(c.f,c.m)-nowCO()<K.C.limiteCambioH*3600000)return{ok:false,codigo:'CAMBIO_FUERA_DE_PLAZO',detalle:'Faltan menos de '+K.C.limiteCambioH+' h: escríbenos por WhatsApp.'};
   return{ok:true,cita:c,d:d}},
 cancelar:function(id,celu){var r=E.mia(id,celu);if(!r.ok)return r;r.cita.estado='cancelada';save(r.d);return{ok:true}},
 reprogramar:function(id,celu,f,m){var r=E.mia(id,celu);if(!r.ok)return r;var c=r.cita;
   if(grid(K.SERVICIOS[c.tipo].dur).indexOf(m)<0||!esFuturo(f,m))return{ok:false,codigo:'FUERA_DE_HORARIO'};
   if(!libre(r.d,c.pid,c.tipo,f,m,c.id))return{ok:false,codigo:'SLOT_OCUPADO',detalle:'Ese horario acaba de ocuparse.'};
   c.f=f;c.m=m;save(r.d);return{ok:true,cita:c}},
 urgencia:function(o){var d=load();d.n++;var ev=E.evaluar(o.sintomas);
   var it={id:'U-'+('000'+d.n).slice(-4),cel:cel(o.cel),dueno:o.dueno,mascota:o.mascota,especie:o.especie,sintomas:o.sintomas,nivel:ev.nivel==='vital'?'vital':'urgente',senales:ev.senales,t:Date.now(),estado:ev.nivel==='vital'?'aviso_llegada':'en_cola'};
   d.cola.push(it);save(d);return{ok:true,item:it,nivel:it.nivel}},
 colaPos:function(id){var d=load().cola.filter(function(x){return x.estado==='en_cola'||x.estado==='aviso_llegada'}).sort(function(a,b){return (a.nivel==='vital'?0:1)-(b.nivel==='vital'?0:1)||a.t-b.t});
   for(var i=0;i<d.length;i++)if(d[i].id===id)return i+1;return 0},
 waLink:function(c){var t='Hola, confirmo la cita '+c.id+': '+K.SERVICIOS[c.tipo].n+' de '+c.mascota.nombre+' ('+c.mascota.especie+') el '+fmtCuando(c.f,c.m)+' con '+K.PROF[c.pid].n+'.';
   return 'https://wa.me/'+K.C.wa+'?text='+encodeURIComponent(t)},
 reset:function(){try{localStorage.removeItem(KEY)}catch(e){}mem=null},
 sembrar:function(){var d=load();if(d.citas.length||d.cola.length)return;var hoy=nowCO(),f=ymd(new Date(hoy.getFullYear(),hoy.getMonth(),hoy.getDate()+2));
   function add(t,pid,m,dn,cl,mn,es,rz){d.n++;d.citas.push({id:'C-'+('000'+d.n).slice(-4),tipo:t,pid:pid,sala:sala(t,pid),f:f,m:m,cel:cl,dueno:dn,mascota:{nombre:mn,especie:es,raza:rz,edad:'3 años',peso:'12',vacunas:'al día (ejemplo)'},estado:'confirmada',notas:'Cita de ejemplo',creada:Date.now()})}
   add('consulta_general','vet1',9*60+20,'Cliente ejemplo 1','3000000001','Luna','felino','mestizo');
   add('vacunacion','vet1',10*60,'Cliente ejemplo 2','3000000002','Rocky','canino','criollo');
   add('cirugia','vet2',13*60+20,'Cliente ejemplo 3','3000000003','Toby','canino','labrador');save(d)}
};
window.KE=E;
})();
