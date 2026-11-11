/* KEYS Citas · MODO DEMO (sin Supabase).
   Simula en el navegador las mismas funciones (rpc) y el ingreso del equipo que usa la base real.
   Se activa con demo:true en config.js. Para producción: demo:false, url y key del proyecto Supabase,
   y se ejecuta 4-odontologia.sql. Los datos de la demo viven solo en este navegador. */
(function(){
'use strict';
var C=window.KEYS_CONFIG||{}; if(!C.demo) return;
var KEY='ko-demo-v1', pad=function(n){return String(n).padStart(2,'0');};
var iso=function(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());};
var addDays=function(s,n){var p=s.split('-').map(Number),d=new Date(p[0],p[1]-1,p[2]);d.setDate(d.getDate()+n);return iso(d);};
var today=function(){return iso(new Date());};
var nowMin=function(){var d=new Date();return d.getHours()*60+d.getMinutes();};
var dow=function(s){var p=s.split('-').map(Number);return new Date(p[0],p[1]-1,p[2]).getDay();};
var uid=function(){return 'd'+Math.random().toString(36).slice(2,10);};
var digits=function(v){return String(v||'').replace(/\D/g,'');};

var F={s1:'valoracion',s2:'blanqueamiento',s3:'restauracion',s4:'endodoncia',s5:'ortodoncia',s6:'implantes',s7:'cirugia',s8:'odontopediatria'};
var PF={p1:'../img/equipo-1.webp',p2:'../img/equipo-2.webp'};

function seed(){
  var cats=[{id:'c1',nombre:'Valoración y prevención'},{id:'c2',nombre:'Estética dental'},{id:'c3',nombre:'Tratamientos'},{id:'c4',nombre:'Especialidades'}];
  var P=['p1','p2'];
  var sv=function(id,c,n,d,dur,pr,arte,pros){return {id:id,categoria:c,nombre:n,descripcion:d,duracion:dur,precio:pr,arte:arte,foto:'../img/svc-'+F[id]+'.webp',pros:pros};};
  var servicios=[
    sv('s1','c1','Valoración odontológica','Revisión completa y plan de tratamiento explicado.',30,40000,'tooth',P),
    sv('s2','c2','Blanqueamiento dental','Aclara el color de tus dientes de forma segura.',60,250000,'star',['p1']),
    sv('s3','c3','Restauración (calzas)','Reparación de caries y dientes fracturados.',45,90000,'tooth',P),
    sv('s4','c3','Endodoncia','Tratamiento de conductos para salvar el diente.',60,280000,'tooth',['p2']),
    sv('s5','c4','Ortodoncia (control)','Control y ajuste de brackets o alineadores.',30,70000,'combo',['p2']),
    sv('s6','c4','Valoración de implantes','Estudio para reponer dientes perdidos.',40,60000,'tooth',['p2']),
    sv('s7','c4','Cirugía oral','Extracciones y procedimientos quirúrgicos.',60,150000,'tooth',['p2']),
    sv('s8','c1','Odontopediatría','Atención amable para niños.',30,50000,'star',['p1'])
  ];
  var db={
    negocio:{slug:'keys-odontologia',nombre:'KEYS Odontología',tipo:'Consultorio odontológico',ciudad:'Rionegro',direccion:'Dirección por confirmar',telefono:'3045550119',
      descripcion:'Consultorio odontológico demostrativo: valoración, estética, tratamientos y especialidades para toda la familia.',sigla:'KO',arte:'tooth',color:'#0b835c',
      apertura:480,cierre:1080,almuerzo:[720,780],dias:[1,2,3,4,5],colchon:10,horas_cambio:24,tema:'vb',landing:null},
    cats:cats,servicios:servicios,
    pros:[{id:'p1',nombre:'Profesional 1 (demo)',rol:'Odontología general y estética',foto:'../img/equipo-1.webp'},{id:'p2',nombre:'Profesional 2 (demo)',rol:'Ortodoncia y rehabilitación',foto:'../img/equipo-2.webp'}],
    clientes:[],citas:[],bloqueos:[]
  };
  // Dos citas de ejemplo para que el panel del equipo no se vea vacío
  var f=addDays(today(),1); while([1,2,3,4,5].indexOf(dow(f))<0) f=addDays(f,1);
  var cl=function(n,a,t){var c={id:uid(),cedula:null,nombre:n,apellido:a,telefono:t,invitado:true};db.clientes.push(c);return c;};
  var c1=cl('Ana','Ejemplo','3001112233'), c2=cl('Luis','Ejemplo','3004445566');
  db.citas.push({id:uid(),cliente:c1.id,pid:'p1',fecha:f,ini:540,fin:580,ids:['s1'],estado:'agendada',valor:40000,avisado:false});
  db.citas.push({id:uid(),cliente:c2.id,pid:'p2',fecha:f,ini:600,fin:670,ids:['s4'],estado:'agendada',valor:280000,avisado:false});
  return db;
}
var mem=null;
function load(){
  if(mem) return mem;
  try{var r=localStorage.getItem(KEY); if(r){mem=JSON.parse(r);return mem;}}catch(e){}
  mem=seed(); save(); return mem;
}
function save(){ try{localStorage.setItem(KEY,JSON.stringify(mem));}catch(e){} }
function svc(db,id){return db.servicios.find(function(s){return s.id===id;});}
function bloqueTotal(db,ids){
  var d=0,b=0; ids.forEach(function(i){var s=svc(db,i);d+=s.duracion;});
  return d+db.negocio.colchon;
}
function validarSlot(db,pid,ids,fecha,ini,ign){
  var n=db.negocio, today0=today();
  if(!ids||!ids.length) return 'servicios';
  var p=db.pros.find(function(x){return x.id===pid;}); if(!p) return 'profesional';
  for(var k=0;k<ids.length;k++){var s=svc(db,ids[k]); if(!s) return 'servicios'; if(s.pros.indexOf(pid)<0) return 'servicios';}
  if(fecha<today0||fecha>addDays(today0,62)||(fecha===today0&&ini<=nowMin())) return 'fecha';
  var fin=ini+bloqueTotal(db,ids);
  if(n.dias.indexOf(dow(fecha))<0||ini<n.apertura||fin>n.cierre) return 'horario';
  if(n.almuerzo[1]>n.almuerzo[0]&&ini<n.almuerzo[1]&&n.almuerzo[0]<fin) return 'horario';
  var ocupado=db.citas.some(function(c){return c.pid===pid&&c.fecha===fecha&&c.estado!=='cancelada'&&c.id!==ign&&ini<c.fin&&c.ini<fin;})||
    db.bloqueos.some(function(b){return b.pid===pid&&b.fecha===fecha&&ini<b.hasta&&b.desde<fin;});
  return ocupado?'ocupado':null;
}
function crearCita(db,cli,pid,ids,fecha,ini,origen){
  var fin=ini+bloqueTotal(db,ids), valor=0; ids.forEach(function(i){valor+=svc(db,i).precio;});
  var c={id:uid(),cliente:cli.id,pid:pid,fecha:fecha,ini:ini,fin:fin,ids:ids.slice(),estado:'agendada',valor:valor,avisado:false,origen:origen||'cliente'};
  db.citas.push(c); return c;
}
function findCliente(db,ident){
  var d=digits(ident);
  return db.clientes.find(function(c){return c.cedula&&(c.cedula===d||digits(c.telefono)===d);})||null;
}
function citaCliente(db,c){var x=db.clientes.find(function(k){return k.id===c.cliente;});return x?(x.nombre+(x.apellido?' '+x.apellido:'')):'Cliente';}
function plazoOk(db,c){
  var p=c.fecha.split('-').map(Number), d=new Date(p[0],p[1]-1,p[2],Math.floor(c.ini/60),c.ini%60);
  return (d.getTime()-Date.now())>=db.negocio.horas_cambio*3600*1000;
}
function futurasActivas(db,cliId){var t=today();return db.citas.filter(function(c){return c.cliente===cliId&&c.estado==='agendada'&&c.fecha>=t;}).length;}

var R={
  ct_publico:function(db,a){
    if(a.p_slug!==db.negocio.slug) return null;
    var n=db.negocio;
    return {negocio:n,categorias:db.cats,servicios:db.servicios.map(function(s){return {id:s.id,categoria:s.categoria,nombre:s.nombre,descripcion:s.descripcion,duracion:s.duracion,precio:s.precio,arte:s.arte,foto:F[s.id]?'../img/svc-'+F[s.id]+'.webp':(s.foto||null)};}),
      profesionales:db.pros.map(function(p){return {id:p.id,nombre:p.nombre,rol:p.rol,foto:PF[p.id]||p.foto||null,servicios:db.servicios.filter(function(s){return s.pros.indexOf(p.id)>=0;}).map(function(s){return s.id;})};}),
      resenas:[],promos:[]};
  },
  ct_ocupacion:function(db,a){
    var out=[];
    db.citas.forEach(function(c){if(c.estado!=='cancelada'&&c.fecha>=a.p_desde&&c.fecha<=a.p_hasta) out.push({id:c.id,pid:c.pid,fecha:c.fecha,ini:c.ini,fin:c.fin});});
    db.bloqueos.forEach(function(b){if(b.fecha>=a.p_desde&&b.fecha<=a.p_hasta) out.push({id:null,pid:b.pid,fecha:b.fecha,ini:b.desde,fin:b.hasta});});
    return out;
  },
  ct_mis_citas:function(db,a){
    var cl=findCliente(db,a.p_identificador); if(!cl) return null;
    return {cliente:{nombre:cl.nombre,apellido:cl.apellido,telefono:cl.telefono},
      citas:db.citas.filter(function(c){return c.cliente===cl.id;}).sort(function(x,y){return (x.fecha+pad(0)+x.ini)<(y.fecha+pad(0)+y.ini)?-1:1;}).map(function(c){return {id:c.id,servicios:c.ids,profesional:c.pid,fecha:c.fecha,inicio:c.ini,fin:c.fin,estado:c.estado,valor:c.valor};})};
  },
  ct_registrar:function(db,a){
    var t=digits(a.p_telefono), ced=digits(a.p_cedula);
    if(!a.p_acepta||String(a.p_nombre||'').trim().length<2||t.length!==10||ced.length<6) return {ok:false,error:'datos'};
    var porTel=db.clientes.find(function(c){return digits(c.telefono)===t;});
    if(porTel&&porTel.cedula) return {ok:false,error:'ya_registrado'};
    if(db.clientes.some(function(c){return c.cedula===ced;})) return {ok:false,error:'cedula_en_uso'};
    if(porTel){porTel.cedula=ced;porTel.nombre=a.p_nombre;porTel.apellido=a.p_apellido;porTel.invitado=false;}
    else db.clientes.push({id:uid(),cedula:ced,nombre:a.p_nombre,apellido:a.p_apellido,telefono:t,invitado:false});
    return {ok:true};
  },
  ct_reservar:function(db,a){
    var t=digits(a.p_telefono), nom=String(a.p_nombre||'').trim();
    if(nom.length<2||t.length!==10) return {ok:false,error:'datos'};
    var cli=db.clientes.find(function(c){return digits(c.telefono)===t;});
    if(cli&&futurasActivas(db,cli.id)>=3) return {ok:false,error:'limite'};
    var e=validarSlot(db,a.p_profesional,a.p_servicios,a.p_fecha,a.p_inicio); if(e) return {ok:false,error:e};
    if(!cli){cli={id:uid(),cedula:null,nombre:nom,apellido:a.p_apellido||'',telefono:t,invitado:true};db.clientes.push(cli);}
    var c=crearCita(db,cli,a.p_profesional,a.p_servicios,a.p_fecha,a.p_inicio);
    return {ok:true,cita:c.id,fin:c.fin,cobrado:c.valor};
  },
  ct_reprogramar:function(db,a){
    var cl=findCliente(db,a.p_identificador); if(!cl) return {ok:false,error:'no_encontrada'};
    var c=db.citas.find(function(x){return x.id===a.p_cita&&x.cliente===cl.id&&x.estado==='agendada';}); if(!c) return {ok:false,error:'no_encontrada'};
    if(!plazoOk(db,c)) return {ok:false,error:'plazo'};
    var e=validarSlot(db,a.p_profesional,a.p_servicios,a.p_fecha,a.p_inicio,c.id); if(e) return {ok:false,error:e};
    var fin=a.p_inicio+bloqueTotal(db,a.p_servicios), v=0; a.p_servicios.forEach(function(i){v+=svc(db,i).precio;});
    c.pid=a.p_profesional;c.ids=a.p_servicios.slice();c.fecha=a.p_fecha;c.ini=a.p_inicio;c.fin=fin;c.valor=v;c.avisado=false;
    return {ok:true,cita:c.id,fin:fin,cobrado:v};
  },
  ct_cancelar:function(db,a){
    var cl=findCliente(db,a.p_identificador); if(!cl) return {ok:false,error:'no_encontrada'};
    var c=db.citas.find(function(x){return x.id===a.p_cita&&x.cliente===cl.id&&x.estado==='agendada';}); if(!c) return {ok:false,error:'no_encontrada'};
    if(!plazoOk(db,c)) return {ok:false,error:'plazo'};
    c.estado='cancelada'; return {ok:true};
  }
};

/* ---- Equipo ---- */
var USERS={'admin@keys.demo':{pw:'demo1234',tok:'demo-admin'},'profesional@keys.demo':{pw:'demo1234',tok:'demo-pro1'}};
function quien(tok){return tok==='demo-admin'?{rol:'admin',pid:null}:tok==='demo-pro1'?{rol:'profesional',pid:'p1'}:null;}
var E={
  ct_equipo_yo:function(db,a,u){
    return {negocio:db.negocio,rol:u.rol,profesional:u.pid,profesionales:db.pros.map(function(p){return {id:p.id,nombre:p.nombre,rol:p.rol};}),
      servicios:db.servicios.map(function(s){return {id:s.id,nombre:s.nombre,duracion:s.duracion,precio:s.precio,profesionales:s.pros};})};
  },
  ct_equipo_agenda:function(db,a,u){
    var vis=function(pid){return u.rol==='admin'||pid===u.pid;};
    return {citas:db.citas.filter(function(c){return vis(c.pid)&&c.fecha>=a.p_desde&&c.fecha<=a.p_hasta;}).map(function(c){
        var cl=db.clientes.find(function(k){return k.id===c.cliente;})||{};
        return {id:c.id,pid:c.pid,fecha:c.fecha,ini:c.ini,fin:c.fin,estado:c.estado,cliente:citaCliente(db,c),telefono:cl.telefono||'',
          servicios:c.ids.map(function(i){return svc(db,i).nombre;}).join(' + '),valor:c.valor,avisado:!!c.avisado};}),
      bloqueos:db.bloqueos.filter(function(b){return vis(b.pid)&&b.fecha>=a.p_desde&&b.fecha<=a.p_hasta;}).map(function(b){return {id:b.id,pid:b.pid,fecha:b.fecha,desde:b.desde,hasta:b.hasta,motivo:b.motivo};})};
  },
  ct_equipo_estado:function(db,a,u){
    var c=db.citas.find(function(x){return x.id===a.p_cita;}); if(!c) return {ok:false,error:'no_encontrada'};
    if(u.rol!=='admin'&&c.pid!==u.pid) return {ok:false,error:'permiso'};
    c.estado=a.p_estado; return {ok:true};
  },
  ct_equipo_recordar:function(db,a,u){
    var c=db.citas.find(function(x){return x.id===a.p_cita;}); if(!c) return {ok:false,error:'no_encontrada'};
    c.avisado=true; var cl=db.clientes.find(function(k){return k.id===c.cliente;})||{};
    var p=c.fecha.split('-'), nm=citaCliente(db,c).split(' ')[0];
    return {ok:true,telefono:cl.telefono,texto:'Hola '+nm+', te recordamos tu cita en '+db.negocio.nombre+' el '+c.fecha+' a las '+pad(Math.floor(c.ini/60))+':'+pad(c.ini%60)+'. ¡Te esperamos!'};
  },
  ct_equipo_crear:function(db,a,u){
    var pid=u.rol==='admin'?a.p_prof:u.pid, t=digits(a.p_telefono);
    var e=validarSlot(db,pid,a.p_servicios,a.p_fecha,a.p_inicio); if(e) return {ok:false,error:e};
    var cli=db.clientes.find(function(c){return digits(c.telefono)===t;});
    if(!cli){var pp=String(a.p_nombre).trim().split(/\s+/);cli={id:uid(),cedula:null,nombre:pp[0],apellido:pp.slice(1).join(' '),telefono:t,invitado:true};db.clientes.push(cli);}
    crearCita(db,cli,pid,a.p_servicios,a.p_fecha,a.p_inicio,'equipo'); return {ok:true};
  },
  ct_equipo_bloquear:function(db,a,u){
    var pid=u.rol==='admin'?a.p_prof:u.pid;
    if(db.citas.some(function(c){return c.pid===pid&&c.fecha===a.p_fecha&&c.estado==='agendada'&&a.p_desde<c.fin&&c.ini<a.p_hasta;})) return {ok:false,error:'hay_citas'};
    db.bloqueos.push({id:uid(),pid:pid,fecha:a.p_fecha,desde:a.p_desde,hasta:a.p_hasta,motivo:a.p_motivo||''}); return {ok:true};
  },
  ct_equipo_desbloquear:function(db,a,u){
    db.bloqueos=db.bloqueos.filter(function(b){return b.id!==a.p_id||(u.rol!=='admin'&&b.pid!==u.pid);}); return {ok:true};
  },
  ct_equipo_horario:function(db,a,u){
    if(u.rol!=='admin') return {ok:false,error:'permiso'};
    var n=db.negocio; n.apertura=a.p_apertura;n.cierre=a.p_cierre;n.almuerzo=[a.p_alm_ini||0,a.p_alm_fin||0];n.dias=a.p_dias; return {ok:true};
  }
};

function resp(obj,status){return Promise.resolve(new Response(JSON.stringify(obj),{status:status||200,headers:{'Content-Type':'application/json'}}));}
var realFetch=window.fetch.bind(window);
window.fetch=function(u,o){
  u=String(u); if(u.indexOf(C.url)!==0) return realFetch(u,o);
  var path=u.slice(C.url.length), body={}; try{body=JSON.parse((o&&o.body)||'{}');}catch(e){}
  var db=load();
  if(path.indexOf('/auth/v1/token')===0){
    if(path.indexOf('grant_type=password')>0){
      var us=USERS[String(body.email||'').trim().toLowerCase()];
      if(!us||us.pw!==body.password) return resp({error:'invalid_grant'},400);
      return resp({access_token:us.tok,refresh_token:'demo-refresh',token_type:'bearer'});
    }
    return resp({error:'invalid_grant'},400);
  }
  var m=path.match(/^\/rest\/v1\/rpc\/([a-z_]+)$/); if(!m) return resp({error:'not_found'},404);
  var fn=m[1], tok=String(((o&&o.headers)||{}).Authorization||'').replace(/^Bearer /,'');
  var out;
  if(R[fn]) out=R[fn](db,body);
  else if(E[fn]){var us2=quien(tok); if(!us2) return resp({message:'jwt'},401); out=E[fn](db,body,us2);}
  else return resp({error:'unknown'},404);
  save(); return resp(out===undefined?null:out);
};
window.KEYS_DEMO_RESET=function(){mem=null;try{localStorage.removeItem(KEY);}catch(e){}location.reload();};
})();
