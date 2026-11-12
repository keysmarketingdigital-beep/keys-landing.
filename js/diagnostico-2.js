(function(){
'use strict';

var AREAS=[
 {id:'mkt',n:'Marketing',d:'Cómo se capta, se atiende y se mide a los clientes potenciales.'},
 {id:'con',n:'Contabilidad',d:'Registro, conciliación, cierre e impuestos.'},
 {id:'fin',n:'Finanzas',d:'Caja, cartera, pagos y reportes para la gerencia.'},
 {id:'nom',n:'Nómina',d:'Novedades, liquidaciones, cumplimiento y autoservicio del empleado.'}
];

/* tipo: M = mejorar (proceso o control), A = automatizar. i = impacto 1-3, e = esfuerzo 1-3, r = riesgo/cumplimiento 1-3 */
var Q=[
 {id:'M1',a:'mkt',p:'Gestión de leads',t:'M',i:3,e:2,r:1,
  q:'¿Cómo se registran y se les hace seguimiento a los contactos comerciales?',
  o:['Hojas de cálculo o correo.','CRM usado a medias.','CRM integrado con seguimiento automático.'],
  w:'Un contacto sin seguimiento a tiempo se enfría. Mide cuánta venta se pierde por desorden y no por falta de demanda.',
  rec:'Implementar un CRM con etapas de venta y recordatorios automáticos de seguimiento.',
  val:'Más ingresos: menos oportunidades perdidas por falta de seguimiento.'},
 {id:'M2',a:'mkt',p:'Reporte de campañas',t:'A',i:2,e:2,r:1,
  q:'¿Cuánto tarda consolidar los resultados de las campañas para la gerencia?',
  o:['Más de 3 días, a mano.','De 1 a 3 días.','Un tablero que se actualiza solo.'],
  w:'Si el reporte llega tarde, el presupuesto de marketing se decide a ciegas.',
  rec:'Construir un tablero de campañas que se alimente solo de las fuentes (anuncios, web y CRM).',
  val:'Ahorro de tiempo del equipo y decisiones más rápidas.'},
 {id:'M3',a:'mkt',p:'Aprobación de contenidos',t:'M',i:2,e:1,r:1,
  q:'¿Cómo se aprueban las piezas y campañas?',
  o:['Por correo o WhatsApp.','Hay un flujo definido pero manual.','Flujo con responsables y trazabilidad.'],
  w:'Los reprocesos de aprobación consumen días y exponen a errores de marca o de cumplimiento.',
  rec:'Definir un flujo de aprobación con responsables, plazos y trazabilidad para piezas y campañas.',
  val:'Menos reprocesos y menor riesgo de marca.'},
 {id:'M4',a:'mkt',p:'Comunicaciones automáticas',t:'A',i:2,e:2,r:1,
  q:'¿Cuántas comunicaciones a clientes o distribuidores se envían solas (correo, WhatsApp, recordatorios)?',
  o:['Ninguna, todo es manual.','Algunas.','Los flujos principales están automatizados.'],
  w:'Automatizar lo repetitivo libera al equipo para la estrategia y mantiene constante el contacto con el cliente.',
  rec:'Automatizar los envíos recurrentes (bienvenida, recordatorios, seguimiento) por correo y WhatsApp.',
  val:'Ahorro de tiempo y contacto constante con el cliente.'},

 {id:'C1',a:'con',p:'Registro de facturas de proveedores',t:'A',i:3,e:2,r:1,
  q:'¿Cómo entran al sistema contable las facturas recibidas?',
  o:['Digitación manual.','Captura parcial con validación manual.','Captura automática validada contra la DIAN.'],
  w:'La digitación es la mayor fuente de errores y de horas perdidas en contabilidad.',
  rec:'Automatizar la captura de facturas recibidas con validación contra la DIAN.',
  val:'Menos errores de digitación y horas liberadas del equipo contable.'},
 {id:'C2',a:'con',p:'Conciliación bancaria',t:'A',i:3,e:2,r:2,
  q:'¿Cómo se concilian los bancos y cuánto tarda?',
  o:['En Excel, más de 5 días.','Semiautomática, de 2 a 5 días.','Automática, menos de 2 días.'],
  w:'Una conciliación lenta retrasa el cierre y esconde partidas sin identificar y posibles fraudes.',
  rec:'Automatizar la conciliación bancaria con reglas de cruce y una lista de partidas pendientes.',
  val:'Cierre más rápido y detección temprana de partidas extrañas.'},
 {id:'C3',a:'con',p:'Cierre mensual',t:'M',i:3,e:3,r:1,
  q:'¿Cuántos días hábiles toma cerrar el mes?',
  o:['Más de 8 días.','De 4 a 8 días.','3 días o menos.'],
  w:'Cada día de cierre es un día sin información confiable para decidir.',
  rec:'Rediseñar el calendario de cierre con responsables por tarea y fechas de corte.',
  val:'Información financiera oportuna para decidir.'},
 {id:'C4',a:'con',p:'Impuestos e información exógena',t:'A',i:3,e:2,r:3,
  q:'¿Cómo se preparan los impuestos, las retenciones y la información exógena?',
  o:['Se arma a mano con varios archivos.','Parcialmente desde el sistema.','Se genera desde el sistema con validaciones.'],
  w:'Los errores de exógena y retenciones generan sanciones y reprocesos en épocas de alta carga.',
  rec:'Generar impuestos, retenciones e información exógena directamente desde el sistema, con validaciones.',
  val:'Cumplimiento tributario y menos riesgo de sanciones.'},
 {id:'C5',a:'con',p:'Reprocesos contables',t:'M',i:2,e:2,r:1,
  q:'¿Con qué frecuencia hay ajustes o reclasificaciones después del cierre?',
  o:['Casi todos los meses.','De vez en cuando.','Rara vez.'],
  w:'Mide la calidad del proceso: si hay muchos ajustes, el problema está antes, en la captura de datos.',
  rec:'Identificar la causa de los ajustes posteriores al cierre y poner controles en la captura de datos.',
  val:'Mayor calidad de la información y menos retrabajo.'},

 {id:'F1',a:'fin',p:'Flujo de caja',t:'M',i:3,e:2,r:1,
  q:'¿Cómo se proyecta el flujo de caja?',
  o:['En un Excel que arma una persona.','Semiautomático desde el ERP.','Integrado y actualizado a diario.'],
  w:'Una proyección tardía o manual impide anticipar necesidades de liquidez y financiación.',
  rec:'Integrar el flujo de caja con el ERP y actualizarlo a diario, con escenarios.',
  val:'Liquidez bajo control y financiación a tiempo.'},
 {id:'F2',a:'fin',p:'Cartera',t:'A',i:3,e:2,r:2,
  q:'¿Cómo se gestiona la cobranza?',
  o:['Seguimiento manual.','Reportes automáticos pero gestión manual.','Alertas y recordatorios automáticos.'],
  w:'La cartera vencida inmoviliza capital y es uno de los ahorros más medibles.',
  rec:'Automatizar alertas y recordatorios de cobro, y reportar la cartera por edades.',
  val:'Mejor capital de trabajo y menor cartera vencida.'},
 {id:'F3',a:'fin',p:'Aprobación de pagos',t:'M',i:3,e:1,r:2,
  q:'¿Cómo se solicitan, aprueban y soportan los pagos?',
  o:['Por correo o papel.','Flujo parcial.','Flujo con niveles de aprobación y soportes.'],
  w:'Es el control que evita pagos duplicados, no autorizados o sin soporte.',
  rec:'Implementar un flujo de aprobación de pagos con niveles, soportes y separación de funciones.',
  val:'Control del dinero y menor riesgo de fraude o pagos duplicados.'},
 {id:'F4',a:'fin',p:'Reporte a la gerencia',t:'A',i:2,e:2,r:1,
  q:'¿Cómo se arma el reporte financiero mensual?',
  o:['Consolidando varios archivos de Excel.','Parcialmente desde el ERP.','Con un tablero automático.'],
  w:'Quien consolida a mano gasta días en copiar datos en lugar de analizarlos.',
  rec:'Automatizar el reporte mensual en un tablero que consolide las fuentes sin copiar y pegar.',
  val:'Analistas dedicados a analizar y no a copiar.'},
 {id:'F5',a:'fin',p:'Dependencia de hojas de cálculo',t:'M',i:3,e:2,r:1,
  q:'¿Cuántos archivos de Excel críticos dependen de una sola persona?',
  o:['Varios.','Uno o dos.','Ninguno.'],
  w:'Es el riesgo operativo más común: si esa persona falta, el proceso se detiene.',
  rec:'Documentar y migrar los archivos críticos a un sistema con permisos, historial y respaldo.',
  val:'Continuidad operativa ante ausencias.'},

 {id:'N1',a:'nom',p:'Novedades y cálculo de nómina',t:'A',i:3,e:2,r:1,
  q:'¿Cómo llegan las novedades (horas extra, incapacidades, ingresos, retiros) y cómo se calcula la nómina?',
  o:['Por correo o papel, con cálculo manual.','Captura parcial en el sistema.','Captura automática con cálculo validado.'],
  w:'Las novedades tardías o mal capturadas son la causa principal de nóminas con errores y reclamos.',
  rec:'Digitalizar la captura de novedades y validar el cálculo de la nómina con reglas automáticas.',
  val:'Menos errores, reliquidaciones y reclamos.'},
 {id:'N2',a:'nom',p:'Liquidaciones y prestaciones',t:'M',i:3,e:1,r:3,
  q:'¿Cómo se calculan las liquidaciones, la prima, las cesantías y sus intereses?',
  o:['Manualmente.','Con plantillas en Excel.','Desde el sistema, con validación.'],
  w:'Un error en una liquidación tiene costo laboral directo y puede derivar en demandas.',
  rec:'Calcular liquidaciones y prestaciones desde el sistema, con validación de un segundo revisor.',
  val:'Menor riesgo laboral y de demandas.'},
 {id:'N3',a:'nom',p:'Nómina electrónica y PILA',t:'A',i:3,e:2,r:3,
  q:'¿Cómo se preparan la nómina electrónica y la planilla de seguridad social?',
  o:['Preparándolas a mano cada periodo.','Con ayuda parcial del sistema.','Automáticamente desde la nómina.'],
  w:'Son obligaciones con plazos fijos y sanciones por errores o mora.',
  rec:'Generar la nómina electrónica y la PILA directamente desde la nómina, con control de plazos.',
  val:'Cumplimiento puntual y menos riesgo de sanciones.'},
 {id:'N4',a:'nom',p:'Autoservicio del empleado',t:'A',i:2,e:2,r:1,
  q:'¿Cómo obtiene el empleado sus desprendibles y certificados, y cómo solicita permisos?',
  o:['Pidiéndolos a Recursos Humanos.','Por correo con un formato.','Por un portal de autoservicio.'],
  w:'Con una plantilla grande, cada solicitud repetitiva es tiempo de Recursos Humanos que se puede recuperar.',
  rec:'Habilitar un portal de autoservicio para desprendibles, certificados y solicitudes.',
  val:'Tiempo de Recursos Humanos liberado.'}
];
var LETRA=['A','B','C'];

var KS={M1:'Software a la medida + marketing digital',M2:'Software a la medida (tablero de campañas)',M3:'Software a la medida (flujo de aprobación)',M4:'Marketing digital + automatización',
 C1:'Keys Cuadre + automatización a la medida',C2:'Keys Cuadre (conciliación bancaria)',C3:'Keys Cuadre + asesoría contable',C4:'Keys Cuadre (impuestos e información exógena)',C5:'Asesoría contable + Keys Cuadre',
 F1:'Keys Cuadre (flujo de caja)',F2:'Keys Cuadre (cuentas por cobrar)',F3:'Keys Cuadre (cuentas por pagar) + flujo de aprobación',F4:'Software a la medida (tablero gerencial)',F5:'Software a la medida',
 N1:'Keys Nómina',N2:'Keys Nómina (liquidación)',N3:'Keys Nómina (aportes y nómina electrónica)',N4:'Keys Nómina (portal del empleado)'};
/* Cada fila de demo: [columna 1, columna 2, estado final]. Datos ficticios, solo ilustrativos. */
var DEMOS=[
 {id:'mkt',man:['Copiar contactos de web, WhatsApp y correo a un Excel','Asignar cada contacto a mano','Escribir y enviar cada seguimiento','Acordarse del recordatorio'],kst:['Captura automática desde web, WhatsApp y correo','Asignación al responsable','Primer mensaje y recordatorio programados'],n:'Marketing',tit:'Contactos comerciales con seguimiento automático',mod:'Software a la medida + marketing digital',cols:['Contacto','Origen','Estado'],ini:'Sin atender',
  rows:[['Clínica Aurora','Formulario web','Seguimiento enviado'],['Distribuidora Norte','WhatsApp','Asignado a ventas'],['Industrias Andes','Correo','Recordatorio programado'],['Comercial Sur','Feria empresarial','Seguimiento enviado']],
  res:'Resultado: 4 contactos atendidos sin trabajo manual.',
  ben:['Cada contacto llega de web, WhatsApp o correo a un solo lugar.','Se asigna un responsable y se programa el recordatorio.','La gerencia ve el embudo comercial sin armar reportes.']},
 {id:'con',man:['Descargar el extracto del banco','Pegar los movimientos en Excel','Buscar cada pago en los libros','Revisar diferencias una por una'],kst:['Importación del extracto','Cruce automático con los libros','Partidas pendientes enviadas a revisión'],n:'Contabilidad',tit:'Conciliación bancaria automática',mod:'Keys Cuadre',cols:['Movimiento bancario','Valor','Estado'],ini:'Pendiente',
  rows:[['Pago a proveedor Insumos S.A.S.','$ 1.250.000','Conciliado'],['Recaudo cliente Distribuidora Norte','$ 3.480.000','Conciliado'],['Comisión bancaria','$ 18.500','Conciliado'],['Consignación sin identificar','$ 920.000','Por revisar'],['Pago de nómina quincenal','$ 7.600.000','Conciliado']],
  res:'Resultado: 4 de 5 movimientos conciliados y 1 partida enviada a revisión.',
  ben:['El extracto se cruza con los libros con reglas definidas.','Solo se revisa lo que no cuadra.','El cierre del mes avanza sin esperar la conciliación.']},
 {id:'fin',man:['Revisar la cartera en un Excel','Llamar o escribir a cada cliente','Pedir aprobaciones por correo','Verificar soportes a mano'],kst:['Detección de vencimientos','Recordatorios automáticos','Aprobación por niveles con soporte'],n:'Finanzas',tit:'Cobranza y aprobación de pagos',mod:'Keys Cuadre',cols:['Documento','Situación','Estado'],ini:'Por gestionar',
  rows:[['Factura 1045 · Cliente Norte','Vencida hace 12 días','Recordatorio enviado'],['Factura 1051 · Cliente Sur','Vence en 3 días','Aviso programado'],['Pago 220 · Proveedor Insumos','Con soporte completo','Aprobado nivel 1'],['Pago 221 · Proveedor Logística','Supera el límite','Aprobado nivel 2']],
  res:'Resultado: cobranza gestionada y pagos aprobados con trazabilidad.',
  ben:['Alertas de cobro automáticas según el vencimiento.','Cada pago pasa por los niveles de aprobación definidos.','Queda registro de quién solicitó, aprobó y pagó.']},
 {id:'nom',man:['Recibir novedades por correo o papel','Calcular horas extra e incapacidades','Armar la nómina electrónica','Preparar la planilla de aportes'],kst:['Captura única de novedades','Cálculo automático de la nómina','Nómina electrónica y aportes generados'],n:'Nómina',tit:'Nómina, nómina electrónica y aportes',mod:'Keys Nómina',cols:['Empleado','Novedad','Estado'],ini:'Pendiente',
  rows:[['Ana R.','Horas extra: 6','Nómina calculada'],['Carlos M.','Incapacidad: 3 días','Nómina calculada'],['Laura P.','Ingreso nuevo','Nómina calculada'],['Total del periodo','Nómina electrónica y planilla de aportes','Listas para transmitir']],
  res:'Resultado: nómina calculada y documentos listos para transmitir.',
  ben:['Las novedades se capturan una sola vez.','Liquidación, nómina electrónica y aportes salen de la misma información.','El empleado consulta desprendibles en el portal.']}
];
var demoSel='con',dTimers=[];
var LOCK='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:-2px;margin-right:6px"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
var KEY='keys-auditoria-diagnostica-v1';
var memStore=null;

function hoy(){var d=new Date();var m=('0'+(d.getMonth()+1)).slice(-2),day=('0'+d.getDate()).slice(-2);return d.getFullYear()+'-'+m+'-'+day;}
function calcDefault(){return {costo:25000,red:50,a:{mkt:{p:2,h:5},con:{p:3,h:10},fin:{p:2,h:8},nom:{p:2,h:6}}};}
function nuevoId(){return 'a'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);}
function nuevoEstado(){return {id:nuevoId(),step:0,datos:{empresa:'',contacto:'',cargo:'',sector:'',fecha:hoy()},resp:{},visitadas:[],vistos:{demo:false},calc:calcDefault(),seg:{interes:'',proximo:'',fechaSeg:'',notas:''}};}
function normalizar(o){
  var d=nuevoEstado(),s=Object.assign({},d,o||{});
  s.datos=Object.assign({},d.datos,(o&&o.datos)||{});
  s.vistos=Object.assign({demo:false},(o&&o.vistos)||{});
  s.calc=Object.assign(calcDefault(),(o&&o.calc)||{});
  s.calc.a=Object.assign(calcDefault().a,(o&&o.calc&&o.calc.a)||{});
  s.seg=Object.assign({},d.seg,(o&&o.seg)||{});
  s.resp=(o&&o.resp)||{};s.visitadas=(o&&o.visitadas)||[];
  if(!s.id)s.id=nuevoId();
  return s;
}
var S=nuevoEstado();
var KEYL='keys-auditorias-lista-v1',memLista=null;

function cargar(){
  var raw=null;
  try{raw=window.localStorage.getItem(KEY);}catch(e){raw=memStore;}
  if(!raw)return;
  try{var o=JSON.parse(raw);if(o&&o.datos&&o.resp){S=normalizar(o);}}catch(e){}
}
function leerLista(){
  var raw=null;try{raw=window.localStorage.getItem(KEYL);}catch(e){raw=memLista;}
  if(!raw)return {};try{return JSON.parse(raw)||{};}catch(e){return {};}
}
function escribirLista(l){var s=JSON.stringify(l);try{window.localStorage.setItem(KEYL,s);}catch(e){memLista=s;}}
function tieneContenido(st){return !!(st.datos.empresa||st.datos.contacto||Object.keys(st.resp).length);}
var timer=null;
function guardarYa(){
  var s=JSON.stringify(S);
  try{window.localStorage.setItem(KEY,s);}catch(e){memStore=s;}
  var l=leerLista();if(tieneContenido(S)){l[S.id]=JSON.parse(s);}else{delete l[S.id];}
  escribirLista(l);actualizarBtnLista();
}
function guardar(){
  clearTimeout(timer);
  timer=setTimeout(function(){timer=null;guardarYa();var el=document.getElementById('estado-guardado');if(el)el.textContent='Progreso guardado.';},250);
}
window.addEventListener('pagehide',function(){if(timer){clearTimeout(timer);timer=null;guardarYa();}});
function actualizarBtnLista(){var b=document.getElementById('btn-lista');if(b)b.textContent='Mis diagnósticos ('+Object.keys(leerLista()).length+')';}
function conEstado(st,fn){var o=S;S=st;try{return fn();}finally{S=o;}}
function $(id){return document.getElementById(id);}
function esc(t){return String(t==null?'':t).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function areaQs(a){return Q.filter(function(q){return q.a===a;});}
function resp(id){return S.resp[id]||{};}
function respondida(q){return typeof resp(q.id).v==='number';}
function totalResp(){return Q.filter(respondida).length;}

/* ---------- Puntuación ---------- */
function nivel(p){if(p===null)return {c:'none',t:'Sin responder',i:'–'};if(p<34)return {c:'crit',t:'Crítico',i:'▲'};if(p<67)return {c:'dev',t:'En desarrollo',i:'●'};return {c:'ok',t:'Sólido',i:'✓'};}
function calcular(){
  var res={areas:[],global:null,total:0,aplic:0};
  var suma=0,n=0;
  AREAS.forEach(function(a){
    var qs=areaQs(a.id),s=0,k=0,sin=0;
    qs.forEach(function(q){var v=resp(q.id).v;if(typeof v!=='number')sin++;else if(v<3){s+=v*50;k++;}});
    var p=k?Math.round(s/k):null;
    res.areas.push({id:a.id,n:a.n,p:p,sin:sin,total:qs.length,nivel:nivel(p)});
    suma+=s;n+=k;
  });
  res.global=n?Math.round(suma/n):null;
  res.aplic=n;
  return res;
}
function prioridad(q,v){var sev=2-v;return sev*10+q.i*3+q.r*2-q.e;}
function cuadrante(q){
  if(q.i>=3&&q.e<=2)return 'Victoria rápida';
  if(q.i>=3)return 'Proyecto estratégico';
  if(q.e<=2)return 'Mejora incremental';
  return 'Por evaluar';
}
function diagnostico(){
  var brechas=[],fort=[];
  Q.forEach(function(q){
    var v=resp(q.id).v;
    if(v===0||v===1)brechas.push({q:q,v:v,pr:prioridad(q,v)});
    if(v===2)fort.push(q);
  });
  brechas.sort(function(a,b){return b.pr-a.pr;});
  fort.sort(function(a,b){return (b.i*2+b.r)-(a.i*2+a.r);});
  return {brechas:brechas,fort:fort};
}

/* ---------- Render ---------- */
function renderStepper(){
  var r=calcular();
  var h='<li><button type="button" data-step="0"'+(S.step===0?' aria-current="step"':'')+'>Inicio</button></li>';
  AREAS.forEach(function(a,i){
    var sin=r.areas[i].sin,visit=S.visitadas.indexOf(a.id)>-1;
    var cls=sin===0?'done':(visit?'warn':'');
    var mark=sin===0?'<span class="mark" aria-hidden="true">✓</span><span class="sr"> completa</span>':(visit?'<span class="mark" aria-hidden="true">!</span><span class="sr"> con preguntas sin responder</span>':'');
    h+='<li class="'+cls+'"><button type="button" data-step="'+(i+1)+'"'+(S.step===i+1?' aria-current="step"':'')+'>'+(i+1)+'. '+esc(a.n)+mark+'</button></li>';
  });
  h+='<li><button type="button" data-step="5"'+(S.step===5?' aria-current="step"':'')+'>Resultados</button></li>';
  $('stepper').innerHTML=h;
}
function renderProgreso(){
  var t=totalResp(),p=Math.round(t/Q.length*100);
  $('prog-texto').textContent=t+' de '+Q.length+' preguntas respondidas';
  $('prog-pct').textContent=p+' %';
  var b=$('prog-bar');b.setAttribute('aria-valuenow',p);b.firstElementChild.style.width=p+'%';
}
function renderArea(idx){
  var a=AREAS[idx],qs=areaQs(a.id);
  var h='<h2 id="t-area" tabindex="-1">'+(idx+1)+'. '+esc(a.n)+'</h2><p class="lead">'+esc(a.d)+' Responde A, B o C según la situación más parecida a la tuya. La evidencia o el comentario es opcional.</p>';
  qs.forEach(function(q){
    var r=resp(q.id);
    h+='<fieldset class="q" id="f-'+q.id+'"><legend>'+q.id+'. '+esc(q.q)+'<span class="tag">'+(q.t==='A'?'Candidato a automatizar':'Proceso a mejorar')+'</span></legend>';
    h+='<p class="why"><strong>Por qué importa:</strong> '+esc(q.w)+'</p><div class="opts">';
    q.o.forEach(function(t,i){
      var id='r-'+q.id+'-'+i;
      h+='<label class="opt" for="'+id+'"><input type="radio" name="q-'+q.id+'" id="'+id+'" value="'+i+'"'+(r.v===i?' checked':'')+'><span><b>'+LETRA[i]+')</b> '+esc(t)+'</span></label>';
    });
    h+='<label class="opt na" for="r-'+q.id+'-3"><input type="radio" name="q-'+q.id+'" id="r-'+q.id+'-3" value="3"'+(r.v===3?' checked':'')+'><span>No aplica en mi empresa</span></label></div>';
    h+='<div class="note"><label for="n-'+q.id+'">Evidencia o comentario (opcional)</label><textarea id="n-'+q.id+'" data-q="'+q.id+'" placeholder="Por ejemplo: el cierre lo hace una persona en un archivo de Excel."></textarea></div></fieldset>';
  });
  h+='<div class="nav"><button type="button" class="btn" data-go="prev">'+(idx===0?'Volver al inicio':'Área anterior')+'</button><button type="button" class="btn primary" data-go="next">'+(idx===AREAS.length-1?'Ver resultados':'Siguiente área')+'</button></div>';
  var v=$('view-area');v.innerHTML=h;
  qs.forEach(function(q){$('n-'+q.id).value=resp(q.id).n||'';});
}

function demoHTML(id){
  var d=DEMOS.filter(function(x){return x.id===id;})[0];
  var h='<div class="chipbar no-print" role="group" aria-label="Elige un demo">'+DEMOS.map(function(x){return '<button type="button" class="chip" data-demo="'+x.id+'" aria-pressed="'+(x.id===id?'true':'false')+'">'+x.n+'</button>';}).join('')+'</div>';
  h+='<h4>'+d.tit+'</h4><p class="small" style="margin:0 0 6px">Ejemplo ilustrativo con datos ficticios. Módulo: <strong>'+d.mod+'</strong>.</p>';
  h+='<div class="race"><div class="lane"><h5>Hoy: proceso manual</h5><ol class="stp" id="lm">'+d.man.map(function(s){return '<li>'+s+'</li>';}).join('')+'</ol><div class="bar"><span id="rm" class="fillm" style="width:0%"></span></div><div class="lstat" id="rm-t">En espera</div></div>';
  h+='<div class="lane keys"><h5>Con Keys</h5><ol class="stp" id="lk">'+d.kst.map(function(s){return '<li>'+s+'</li>';}).join('')+'</ol><div class="bar"><span id="rk" class="fillk" style="width:0%"></span></div><div class="lstat" id="rk-t">Listo para ejecutar</div></div></div>';
  h+='<div style="overflow-x:auto"><table><thead><tr>'+d.cols.map(function(c){return '<th>'+c+'</th>';}).join('')+'</tr></thead><tbody>';
  d.rows.forEach(function(r,i){h+='<tr><td>'+r[0]+'</td><td>'+r[1]+'</td><td><span class="badge none" id="ds-'+i+'">'+d.ini+'</span></td></tr>';});
  h+='</tbody></table></div><div class="actions"><button type="button" class="btn primary" id="demo-run" data-demo-run="'+id+'">Ejecutar demo</button></div><div class="demo-out" id="demo-out" role="status" aria-live="polite"></div>';
  return h;
}
function ejecutarDemo(id){
  var d=DEMOS.filter(function(x){return x.id===id;})[0],btn=$('demo-run'),out=$('demo-out'),rk=$('rk'),rm=$('rm'),tk=$('rk-t'),tm=$('rm-t');
  dTimers.forEach(clearTimeout);dTimers=[];
  function sched(fn,ms){dTimers.push(setTimeout(fn,ms));}
  var lk=$('lk').children,lm=$('lm').children,i;
  for(i=0;i<lk.length;i++)lk[i].className='';
  for(i=0;i<lm.length;i++)lm[i].className='';
  d.rows.forEach(function(r,j){var b=$('ds-'+j);b.className='badge none';b.textContent=d.ini;});
  out.innerHTML='';rk.style.transition='none';rm.style.transition='none';rk.style.width='0%';rm.style.width='0%';void rk.offsetWidth;
  tk.textContent='Ejecutando…';tm.textContent='En curso…';
  btn.disabled=true;btn.textContent='Ejecutando…';
  var reducir=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches,S1=reducir?0:900,S2=reducir?0:450;
  var nk=d.kst.length,T=nk*S1+d.rows.length*S2;
  rk.style.transition='width .5s ease';
  rm.style.transition='width '+Math.max(T,1)+'ms linear';rm.style.width='35%';
  if(lm.length){lm[0].className='run';}
  sched(function(){if(lm[0])lm[0].className='done';if(lm[1])lm[1].className='run';},Math.round(T*0.5));
  d.kst.forEach(function(s,k){
    sched(function(){lk[k].className='run';},k*S1);
    sched(function(){lk[k].className='done';rk.style.width=Math.round((k+1)/nk*60)+'%';},(k+1)*S1);
  });
  d.rows.forEach(function(r,j){
    sched(function(){
      var b=$('ds-'+j);if(!b)return;
      b.className='badge '+(r[2]==='Por revisar'?'dev':'ok');b.textContent=r[2];
      rk.style.width=Math.round(60+(j+1)/d.rows.length*40)+'%';
      if(j===d.rows.length-1){
        tk.textContent='Completado';tm.textContent='Sigue en curso…';
        out.innerHTML='<p style="margin:0"><strong>'+d.res+'</strong></p><p class="small" style="margin:6px 0 0">Con Keys:</p><ul>'+d.ben.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>';
        btn.disabled=false;btn.textContent='Repetir demo';S.vistos.demo=true;guardar();actualizarGate();
      }
    },nk*S1+(j+1)*S2);
  });
}
function fmtN(n){return Math.round(n).toLocaleString('es-CO');}
function money(n){return '$ '+fmtN(n);}
function calcHTML(){
  var c=S.calc;
  var h='<div class="card" id="calc-card" style="margin-top:14px"><h3 style="margin-top:0">Impacto estimado con tus propios números</h3><p class="small" style="margin:0 0 10px">Ajusta los valores de ejemplo. Es una estimación a partir de tus datos y del porcentaje de reducción que tú defines, no una promesa de ahorro; se valida en el diagnóstico profundo.</p>';
  h+='<div class="calc-top"><div class="field"><label for="c-costo">Costo por hora del equipo (COP)</label><input type="number" id="c-costo" min="0" step="1000" inputmode="numeric" value="'+c.costo+'"></div>';
  h+='<div class="field"><label for="c-red">Reducción de horas supuesta: <output id="calc-red-txt">'+c.red+' %</output></label><input type="range" id="c-red" class="no-print" min="10" max="90" step="5" value="'+c.red+'"></div></div>';
  h+='<div style="overflow-x:auto"><table class="calc"><thead><tr><th>Área</th><th>Personas</th><th>Horas por semana por persona en tareas manuales</th><th>Horas liberadas al año</th><th>Valor anual estimado</th></tr></thead><tbody>';
  AREAS.forEach(function(a){var x=c.a[a.id];
    h+='<tr><td><strong>'+a.n+'</strong><div class="bar cbar"><span id="cb-'+a.id+'" class="fillk" style="width:0%"></span></div></td><td><input type="number" min="0" id="cp-'+a.id+'" aria-label="Personas en '+a.n+'" value="'+x.p+'"></td><td><input type="number" min="0" id="ch-'+a.id+'" aria-label="Horas por semana por persona en '+a.n+'" value="'+x.h+'"></td><td id="cv-h-'+a.id+'">0</td><td id="cv-v-'+a.id+'">$ 0</td></tr>';
  });
  h+='</tbody></table></div><div class="calc-tot"><div><div class="big" id="calc-tot-h">0</div><div>horas liberadas al año</div></div><div><div class="big" id="calc-tot-v">$ 0</div><div>valor anual estimado (COP)</div></div><div><div class="big" id="calc-tot-s">0</div><div>semanas de trabajo (de 40 h)</div></div></div></div>';
  return h;
}
function actualizarCalc(){
  var c=S.calc,hrs=0,max=0,vals={};
  if(!$('calc-card'))return;
  AREAS.forEach(function(a){var x=c.a[a.id],h=Math.max(0,x.p)*Math.max(0,x.h)*48*c.red/100;vals[a.id]=h;hrs+=h;if(h>max)max=h;});
  AREAS.forEach(function(a){
    $('cv-h-'+a.id).textContent=fmtN(vals[a.id]);$('cv-v-'+a.id).textContent=money(vals[a.id]*c.costo);
    $('cb-'+a.id).style.width=(max?Math.round(vals[a.id]/max*100):0)+'%';
  });
  $('calc-red-txt').textContent=c.red+' %';
  $('calc-tot-h').textContent=fmtN(hrs);$('calc-tot-v').textContent=money(hrs*c.costo);$('calc-tot-s').textContent=fmtN(hrs/40);
}
function infoHTML(d){
  var h='<h3 style="margin-top:0">Informe de Keys: qué puede hacer por tu empresa</h3><div class="solgrid">'
   +'<div class="sol"><h5>Keys Nómina</h5><ul><li>Tablero y nómina calculada</li><li>Liquidación y aportes</li><li>Nómina electrónica</li><li>Portal del empleado y solicitudes</li></ul></div>'
   +'<div class="sol"><h5>Keys Cuadre</h5><ul><li>Flujo de caja</li><li>Conciliación bancaria</li><li>Cuentas por cobrar y por pagar</li><li>Impuestos e información exógena</li></ul></div>'
   +'<div class="sol"><h5>Software a la medida y automatización</h5><ul><li>Sistemas hechos para tu forma de trabajar</li><li>Menos tareas repetitivas y errores</li><li>Tableros e integraciones con tu ERP</li></ul></div>'
   +'<div class="sol"><h5>Marketing digital y web</h5><ul><li>Páginas web que generan contactos</li><li>Campañas y seguimiento</li><li>Comunicaciones automáticas</li></ul></div></div>';
  h+='<h4 style="margin:16px 0 6px">Tu ruta sugerida con Keys</h4>';
  var rec=d.brechas.slice(0,5);
  if(rec.length){
    h+='<div style="overflow-x:auto"><table><thead><tr><th>#</th><th>Proceso</th><th>Qué se haría</th><th>Solución Keys</th></tr></thead><tbody>';
    rec.forEach(function(b,i){h+='<tr><td>'+(i+1)+'</td><td><strong>'+esc(b.q.p)+'</strong></td><td>'+esc(b.q.rec)+'</td><td>'+esc(KS[b.q.id]||'Software a la medida')+'</td></tr>';});
    h+='</tbody></table></div>';
  }else{h+='<p>Tus procesos respondidos están en buen nivel. Keys puede ayudarte a medirlos con indicadores y a mantenerlos al día.</p>';}
  return h;
}
function implHTML(d){
  var prio=d.brechas.length?esc(d.brechas[0].q.p):'el proceso de mayor prioridad';
  var h='<h3 style="margin-top:0">Cómo se implementa, paso a paso</h3><p class="small" style="margin:0 0 8px">Las duraciones son orientativas y se confirman en la propuesta según el alcance.</p>'
   +'<div style="overflow-x:auto"><table><thead><tr><th>Fase</th><th>Qué se hace</th><th>Qué recibes</th><th>Duración orientativa</th></tr></thead><tbody>'
   +'<tr><td><strong>1. Diagnóstico profundo</strong></td><td>Sesión de 90 minutos con el equipo del área prioritaria: mapa del proceso, herramientas y puntos de dolor.</td><td>Mapa del proceso y lista de brechas validada.</td><td>1 a 2 semanas</td></tr>'
   +'<tr><td><strong>2. Diseño y alcance</strong></td><td>Se define qué se mejora y qué se automatiza, responsables, integraciones con el ERP y criterios de éxito.</td><td>Propuesta con alcance, cronograma e indicadores.</td><td>1 semana</td></tr>'
   +'<tr><td><strong>3. Piloto</strong></td><td>Se implementa <strong>'+prio+'</strong> con datos reales, en paralelo con el proceso actual.</td><td>Piloto funcionando y comparación contra el proceso actual.</td><td>2 a 4 semanas</td></tr>'
   +'<tr><td><strong>4. Despliegue y medición</strong></td><td>Se extiende a las demás áreas, se capacita al equipo y se miden tiempo, errores y cumplimiento.</td><td>Equipo capacitado, tablero de indicadores y plan de mejora continua.</td><td>Continuo</td></tr>'
   +'</tbody></table></div>';
  h+='<div class="two"><div><h4>Qué necesitamos de tu equipo</h4><ul class="clean"><li>Un responsable por área.</li><li>Muestras de datos o archivos de trabajo, sin información sensible al inicio.</li><li>Una persona de TI o del ERP para las integraciones.</li><li>Disponibilidad para sesiones cortas de revisión.</li></ul></div>'
   +'<div><h4>Lo que acordamos antes de empezar</h4><ul class="clean"><li>Confidencialidad y tratamiento de datos conforme a la Ley 1581.</li><li>Accesos por rol y por persona.</li><li>Alcance y criterios de aceptación por escrito.</li></ul></div></div>';
  h+='<div class="actions"><a class="btn primary cta-wa no-print" href="https://wa.me/573045550119" target="_blank" rel="noopener">Agendar la sesión por WhatsApp</a><span class="small" style="align-self:center">Keys Digital Solutions · WhatsApp 304 555 0119 · Atención remota</span></div>';
  return h;
}
function demoCard(){
  var r=calcular(),low=null;
  r.areas.forEach(function(a){if(a.p!==null&&(low===null||a.p<low.p))low=a;});
  demoSel=low?low.id:'con';
  return '<div class="card no-print" id="demo-card" style="margin-top:14px"><h3 style="margin-top:0">Demo: mira cómo trabajaría Keys en tu empresa</h3>'
   +'<div class="gate" id="gate"><strong id="gate-txt"></strong></div>'
   +'<div id="kp-demo">'+demoHTML(demoSel)+'</div></div>';
}
function desbloqueado(){return !!S.vistos.demo;}
function actualizarGate(){
  var ok=desbloqueado();
  document.body.classList.toggle('pdf-locked',!ok);
  var g=$('gate');
  if(g){g.className='gate'+(ok?' open':'');$('gate-txt').textContent=ok?'PDF desbloqueado. Ya puedes imprimirlo, guardarlo o descargar el informe.':'El PDF se desbloquea al ejecutar este demo. Elige un área y pulsa "Ejecutar demo".';}
  var b=$('btn-imprimir');
  if(b){b.setAttribute('aria-disabled',ok?'false':'true');b.innerHTML=ok?(enMarco?'Descargar informe imprimible':'Imprimir o guardar como PDF'):LOCK+'PDF bloqueado: ejecuta el demo';b.style.opacity=ok?'':'.75';}
  var bi=$('btn-informe');if(bi){if(enMarco)bi.hidden=true;bi.setAttribute('aria-disabled',ok?'false':'true');bi.style.opacity=ok?'':'.75';}
}
/* ---------- Gráfico de radar y animación de resultados ---------- */
function radarSVG(r){
  var cx=200,cy=140,R=95,ang=[-90,0,90,180];
  function pt(i,f){var a=ang[i]*Math.PI/180;return [cx+R*f*Math.cos(a),cy+R*f*Math.sin(a)];}
  function poly(f){return [0,1,2,3].map(function(i){var q=pt(i,f);return q[0].toFixed(1)+','+q[1].toFixed(1);}).join(' ');}
  var s='<svg viewBox="0 0 420 280" class="radar" role="img" aria-label="Radar de madurez: '+r.areas.map(function(a){return a.n+' '+(a.p===null?'sin responder':a.p+' de 100');}).join(', ')+'">';
  [.25,.5,.75,1].forEach(function(f){s+='<polygon points="'+poly(f)+'" fill="none" stroke="#c9d3d3" stroke-width="1"/>';});
  [0,1,2,3].forEach(function(i){var q=pt(i,1);s+='<line x1="'+cx+'" y1="'+cy+'" x2="'+q[0].toFixed(1)+'" y2="'+q[1].toFixed(1)+'" stroke="#c9d3d3"/>';});
  var pts=r.areas.map(function(a,i){var q=pt(i,(a.p||0)/100);return q[0].toFixed(1)+','+q[1].toFixed(1);}).join(' ');
  s+='<g class="radar-poly"><polygon points="'+pts+'" fill="rgba(15,168,154,.30)" stroke="#0b6f66" stroke-width="2.5" stroke-linejoin="round"/>';
  r.areas.forEach(function(a,i){var q=pt(i,(a.p||0)/100);s+='<circle cx="'+q[0].toFixed(1)+'" cy="'+q[1].toFixed(1)+'" r="4.5" fill="#0b6f66"/>';});
  s+='</g>';
  var L=[[200,24,'middle'],[306,144,'start'],[200,270,'middle'],[94,144,'end']];
  r.areas.forEach(function(a,i){s+='<text x="'+L[i][0]+'" y="'+L[i][1]+'" text-anchor="'+L[i][2]+'" font-size="13" font-weight="700" fill="#0b0f10">'+a.n+(a.p===null?'':' '+a.p)+'</text>';});
  return s+'</svg>';
}
var animFrame=null;
function animarResultados(){
  var cont=$('view-results');if(!cont)return;
  var reducir=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(reducir)return;
  var fills=cont.querySelectorAll('[data-w]'),counts=cont.querySelectorAll('[data-count]'),poly=cont.querySelector('.radar-poly'),i;
  for(i=0;i<fills.length;i++){fills[i].style.transition='none';fills[i].style.width='0%';}
  for(i=0;i<counts.length;i++)counts[i].textContent='0';
  if(poly)poly.classList.add('pre');
  void cont.offsetWidth;
  requestAnimationFrame(function(){
    for(var k=0;k<fills.length;k++){fills[k].style.transition='width 1.1s cubic-bezier(.2,.7,.2,1)';fills[k].style.width=fills[k].getAttribute('data-w')+'%';}
    if(poly)poly.classList.remove('pre');
    var t0=null;
    function paso(ts){if(t0===null)t0=ts;var q=Math.min(1,(ts-t0)/1100),e=1-Math.pow(1-q,3);
      for(var j=0;j<counts.length;j++)counts[j].textContent=Math.round(parseFloat(counts[j].getAttribute('data-count'))*e);
      if(q<1)animFrame=requestAnimationFrame(paso);}
    animFrame=requestAnimationFrame(paso);
  });
}
function finalizarAnim(){
  var cont=$('view-results');if(!cont)return;
  if(animFrame)cancelAnimationFrame(animFrame);
  var fills=cont.querySelectorAll('[data-w]'),counts=cont.querySelectorAll('[data-count]'),poly=cont.querySelector('.radar-poly'),i;
  for(i=0;i<fills.length;i++){fills[i].style.transition='none';fills[i].style.width=fills[i].getAttribute('data-w')+'%';}
  for(i=0;i<counts.length;i++)counts[i].textContent=counts[i].getAttribute('data-count');
  if(poly)poly.classList.remove('pre');
}
function segHTML(){
  var g=S.seg;
  function o(v,t){return '<option value="'+v+'"'+(g.interes===v?' selected':'')+'>'+t+'</option>';}
  return '<div class="card no-print seg" style="margin-top:14px"><h3 style="margin-top:0">Seguimiento comercial <span class="small" style="font-weight:400">(solo para ti; no sale en el PDF ni en el informe)</span></h3>'
   +'<div class="datos-grid"><div class="field"><label for="seg-interes">Interés del cliente</label><select id="seg-interes">'+o('','Sin definir')+o('Alto','Alto')+o('Medio','Medio')+o('Bajo','Bajo')+'</select></div>'
   +'<div class="field"><label for="seg-fecha">Fecha de seguimiento</label><input type="date" id="seg-fecha" value="'+esc(g.fechaSeg)+'"></div>'
   +'<div class="field" style="grid-column:1/-1"><label for="seg-proximo">Próximo paso acordado</label><input type="text" id="seg-proximo" value="'+esc(g.proximo)+'" placeholder="Ej.: sesión de 90 minutos con el equipo de finanzas"></div>'
   +'<div class="field" style="grid-column:1/-1"><label for="seg-notas">Notas de la reunión</label><textarea id="seg-notas">'+esc(g.notas)+'</textarea></div></div></div>';
}
/* ---------- Mis diagnósticos ---------- */
function resumenAud(st){return conEstado(st,function(){var r=calcular(),d=diagnostico();return {r:r,top:d.brechas.slice(0,3).map(function(b){return b.q.p;})};});}
function renderLista(){
  var l=leerLista(),ids=Object.keys(l).sort().reverse(),h='';
  if(!ids.length){$('lista-cuerpo').innerHTML='<p>Aún no hay diagnósticos guardados. Empieza una y aparecerá aquí.</p>';return;}
  h='<div style="overflow-x:auto"><table><thead><tr><th>Empresa</th><th>Fecha</th><th>Puntaje</th><th>Interés</th><th>Acciones</th></tr></thead><tbody>';
  ids.forEach(function(id){
    var st=normalizar(l[id]),sm=resumenAud(st),g=sm.r.global;
    h+='<tr><td><strong>'+esc(st.datos.empresa||'Sin nombre')+'</strong>'+(id===S.id?' <span class="pill">Actual</span>':'')+'<br><small>'+esc(st.datos.contacto||'')+'</small></td><td>'+esc(st.datos.fecha)+'</td><td>'+(g===null?'–':g+'/100')+'</td><td>'+esc(st.seg.interes||'–')+'</td><td><button type="button" class="btn" data-abrir="'+id+'">Abrir</button> <button type="button" class="btn danger" data-borrar="'+id+'">Eliminar</button></td></tr>';
  });
  $('lista-cuerpo').innerHTML=h+'</tbody></table></div>';
}
function abrirLista(){guardarYa();renderLista();var d=$('dlg-lista');if(d.showModal)d.showModal();}
function abrirAud(id){
  guardarYa();var l=leerLista();if(!l[id])return;
  S=normalizar(l[id]);S.step=totalResp()>0?5:0;pintarDatos();$('dlg-lista').close();render(true);
}
function nuevaAud(){
  guardarYa();S=nuevoEstado();pintarDatos();guardarYa();
  var d=$('dlg-lista');if(d&&d.open)d.close();render(true);$('estado-guardado').textContent='Nuevo diagnóstico creado.';
}
function csvTodas(){
  guardarYa();var l=leerLista(),ids=Object.keys(l).sort();
  var cab=['Empresa','Contacto','Cargo','Sector','Fecha','Puntaje global','Marketing','Contabilidad','Finanzas','Nómina','Procesos prioritarios','Interés','Próximo paso','Fecha de seguimiento','Notas'];
  var f=function(x){return '"'+String(x==null?'':x).replace(/"/g,'""')+'"';};
  var rows=ids.map(function(id){
    var st=normalizar(l[id]),sm=resumenAud(st),d=st.datos,g=st.seg;
    return [d.empresa,d.contacto,d.cargo,d.sector,d.fecha,sm.r.global===null?'':sm.r.global].concat(sm.r.areas.map(function(a){return a.p===null?'':a.p;})).concat([sm.top.join(' | '),g.interes,g.proximo,g.fechaSeg,g.notas]);
  });
  return '﻿'+[cab].concat(rows).map(function(r){return r.map(f).join(';');}).join('\r\n');
}
/* ---------- Informe descargable (HTML autónomo) ---------- */
function informeNodo(){
  if(S.step!==5){S.step=5;render(false);}
  finalizarAnim();
  var src=$('view-results'),ins=src.querySelectorAll('input,select,textarea'),i;
  for(i=0;i<ins.length;i++){if(ins[i].tagName==='TEXTAREA')ins[i].textContent=ins[i].value;else if(ins[i].tagName==='SELECT'){}else ins[i].setAttribute('value',ins[i].value);}
  var el=src.cloneNode(true),sel=el.querySelectorAll('.no-print,.actions,.seg,.print-lock');
  for(i=0;i<sel.length;i++)if(sel[i].parentNode)sel[i].parentNode.removeChild(sel[i]);
  el.removeAttribute('hidden');el.removeAttribute('id');
  return el;
}
function descargarInforme(){
  var el=informeNodo();
  var css=document.getElementsByTagName('style')[0].textContent;
  var sym=document.querySelector('svg[width="0"]').outerHTML;
  var extra='.printhead{display:flex!important;justify-content:space-between;align-items:center;border-bottom:3px solid #000;padding-bottom:8px;margin-bottom:12px}.printhead svg{height:34px;width:91px;color:#000;--logo-accent:#0b6f66}body{background:#fff}';
  var html='<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Informe de diagnóstico</title><style>'+css+extra+'</style></head><body>'+sym+'<main>'+el.outerHTML+'</main></body></html>';
  descargar('informe-'+slug()+'.html','text/html;charset=utf-8',html);
}
var enMarco=false;try{enMarco=(window.self!==window.top);}catch(e){enMarco=true;}
function abrirVista(){
  var el=informeNodo(),body=$('vi-body');body.innerHTML='';
  el.id='';el.className='vi-doc';body.appendChild(el);
  var ph=body.querySelector('.printhead');if(ph)ph.style.display='flex';
  $('vi-msg').textContent='';$('vi-texto').hidden=true;
  $('vi').hidden=false;document.body.style.overflow='hidden';$('vi-cerrar').focus();
}
function cerrarVista(){$('vi').hidden=true;document.body.style.overflow='';var b=$('btn-vista');if(b)b.focus();}
function copiarResumen(){
  var txt=resumenTexto(),ok=false;
  function fallback(){var ta=$('vi-texto');ta.hidden=false;ta.value=txt;ta.focus();ta.select();$('vi-msg').textContent='Tu visor no permite copiar solo. El texto quedó seleccionado: cópialo con Ctrl+C.';}
  try{
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(function(){$('vi-msg').textContent='Resumen copiado.';}).catch(fallback);ok=true;}
  }catch(e){}
  if(!ok)fallback();
}
function informeKeys(d){
  return demoCard()+calcHTML()+'<div class="card" style="margin-top:14px">'+infoHTML(d)+'</div><div class="card" style="margin-top:14px">'+implHTML(d)+'</div>';
}
function fila(arr){return arr.map(function(x){return '<li>'+x+'</li>';}).join('');}
function renderResultados(){
  var r=calcular(),d=diagnostico(),dt=S.datos;
  var h='<div class="printhead"><svg role="img" aria-label="Keys Digital Solutions"><use href="#logo"/></svg><div><strong>Informe de diagnóstico</strong><br>'+esc(dt.fecha)+'</div></div>';
  h+='<div class="card"><h2 id="t-res" tabindex="-1">Resultados del diagnóstico</h2>';
  h+='<p class="lead">'+(dt.empresa?'<strong>'+esc(dt.empresa)+'</strong>':'Empresa sin nombre')+(dt.sector?' · '+esc(dt.sector):'')+(dt.contacto?' · Responde: '+esc(dt.contacto)+(dt.cargo?' ('+esc(dt.cargo)+')':''):'')+' · '+esc(dt.fecha)+'</p>';
  var inc=r.areas.filter(function(a){return a.sin>0;});
  if(totalResp()===0){h+='<div class="banner info">Aún no has respondido ninguna pregunta. Completa las áreas para ver el diagnóstico.</div></div>';$('view-results').innerHTML=h;return;}
  if(inc.length){h+='<div class="banner warn" role="status"><strong>Resultado parcial.</strong> Quedan preguntas sin responder en: '+inc.map(function(a){return esc(a.n)+' ('+a.sin+')';}).join(', ')+'. El puntaje solo considera las preguntas respondidas.</div>';}
  var ng=nivel(r.global),low=null;
  r.areas.forEach(function(a){if(a.p!==null&&(low===null||a.p<low.p))low=a;});
  var top=d.brechas[0];
  var exec='<p class="exec">'+(low?'Tu mayor oportunidad está en <strong>'+esc(low.n)+'</strong> ('+low.p+'/100).':'')+(top?' El proceso más urgente es <strong>'+esc(top.q.p)+'</strong>: '+esc(top.q.val):'')+'</p>';
  h+='<div class="global"><div style="flex:1;min-width:240px"><div class="score-big"><span data-count="'+r.global+'">'+r.global+'</span><span style="font-size:1.2rem"> / 100</span></div><div>Puntaje global de madurez</div><div style="margin-top:8px"><span class="badge '+ng.c+'">'+ng.i+' '+ng.t+'</span></div><div class="bar" style="margin-top:8px" role="img" aria-label="Puntaje global '+r.global+' de 100, nivel '+ng.t+'"><span class="fill '+ng.c+'" data-w="'+r.global+'" style="width:'+r.global+'%"></span></div>'+exec+'</div><div class="radar-wrap">'+radarSVG(r)+'</div></div>';
  h+='<div class="areas">';
  r.areas.forEach(function(a){
    h+='<div class="areacard"><h4>'+esc(a.n)+'</h4>';
    if(a.p===null){h+='<span class="badge none">Sin responder</span>';}
    else{h+='<div class="pct"><span data-count="'+a.p+'">'+a.p+'</span> <span style="font-size:.9rem;font-weight:400">/ 100</span></div><span class="badge '+a.nivel.c+'">'+a.nivel.i+' '+a.nivel.t+'</span><div class="bar" style="margin-top:8px" role="img" aria-label="'+esc(a.n)+': '+a.p+' de 100, '+a.nivel.t+'"><span class="fill '+a.nivel.c+'" data-w="'+a.p+'" style="width:'+a.p+'%"></span></div>';}
    h+='<div style="font-size:.8rem;color:var(--muted);margin-top:6px">'+(a.total-a.sin)+' de '+a.total+' respondidas</div></div>';
  });
  h+='</div></div>';

  h+='<div class="card" style="margin-top:14px"><h3 style="margin-top:0">Fortalezas principales</h3>';
  var fo=d.fort.slice(0,4);
  h+=fo.length?'<ul class="clean">'+fila(fo.map(function(q){return '<strong>'+esc(q.p)+'</strong>: ya está ordenado y es una base para crecer.';}))+'</ul>':'<p>Todavía no hay procesos en nivel sólido. Esa es la mayor oportunidad.</p>';
  h+='<h3>Brechas más urgentes</h3>';
  var br=d.brechas.slice(0,3);
  h+=br.length?'<ul class="clean">'+fila(br.map(function(b){return '<strong>'+esc(b.q.p)+'</strong> ('+AREAS.filter(function(a){return a.id===b.q.a;})[0].n+'): '+esc(b.q.val);}))+'</ul>':'<p>No se detectaron brechas en las preguntas respondidas.</p>';
  h+='</div>';

  h+='<div class="card" style="margin-top:14px"><h3 style="margin-top:0">Recomendaciones priorizadas por impacto y esfuerzo</h3>';
  var rec=d.brechas.slice(0,5);
  if(rec.length){
    h+='<div style="overflow-x:auto"><table><thead><tr><th>#</th><th>Recomendación</th><th>Tipo</th><th>Impacto</th><th>Esfuerzo</th><th>Prioridad</th></tr></thead><tbody>';
    var L=['','Bajo','Medio','Alto'];
    rec.forEach(function(b,i){
      h+='<tr><td>'+(i+1)+'</td><td><strong>'+esc(b.q.p)+'.</strong> '+esc(b.q.rec)+'<br><small>'+esc(b.q.val)+'</small></td><td>'+(b.q.t==='A'?'Automatizar':'Mejorar')+'</td><td>'+L[b.q.i]+'</td><td>'+L[b.q.e]+'</td><td><span class="pill">'+cuadrante(b.q)+'</span></td></tr>';
    });
    h+='</tbody></table></div>';
  }else{h+='<ul class="clean"><li>Definir indicadores de seguimiento (tiempo de cierre, errores y costo por proceso) para sostener el nivel alcanzado.</li><li>Revisar el diagnóstico cada seis meses.</li><li>Evaluar automatizaciones adicionales en los procesos de mayor volumen.</li></ul>';}
  h+='<div class="two" style="margin-top:14px"><div><h3 style="margin-top:0">Procesos a mejorar</h3>';
  var pm=d.brechas.filter(function(b){return b.q.t==='M';}).slice(0,3);
  h+=pm.length?'<ul class="clean">'+fila(pm.map(function(b){return esc(b.q.p);}))+'</ul>':'<p>Sin brechas en este grupo.</p>';
  h+='</div><div><h3 style="margin-top:0">Candidatos a automatizar</h3>';
  var pa=d.brechas.filter(function(b){return b.q.t==='A';}).slice(0,3);
  h+=pa.length?'<ul class="clean">'+fila(pa.map(function(b){return esc(b.q.p);}))+'</ul>':'<p>Sin brechas en este grupo.</p>';
  h+='</div></div></div>';

  if(enMarco){h+='<div class="banner info no-print" role="status" style="margin-top:14px"><strong>Estás viendo esta página dentro de otra aplicación.</strong> Algunos visores bloquean imprimir y descargar. Usa &quot;Ver informe en pantalla&quot; para leer o mostrar el informe completo, y &quot;Copiar resumen&quot; para llevarte el texto. Para guardar el PDF, abre el archivo en tu navegador (Chrome, Edge o Safari).</div>';}
  h+=informeKeys(d);
  h+=segHTML();
  h+='<div class="print-lock">El informe en PDF se desbloquea al ejecutar el demo de Keys en la pantalla de resultados.</div>';
  var coment=Q.filter(function(q){return resp(q.id).n;});
  if(coment.length){
    h+='<div class="card" style="margin-top:14px"><h3 style="margin-top:0">Evidencias y comentarios</h3><ul class="clean">'+fila(coment.map(function(q){return '<strong>'+q.id+' '+esc(q.p)+':</strong> '+esc(resp(q.id).n);}))+'</ul></div>';
  }
  h+='<div class="actions no-print"><button type="button" class="btn primary" id="btn-imprimir" aria-disabled="true">Imprimir o guardar como PDF</button><button type="button" class="btn" id="btn-informe" aria-disabled="true">Descargar informe (archivo HTML)</button><button type="button" class="btn" id="btn-vista">Ver informe en pantalla</button><button type="button" class="btn" id="btn-txt">Descargar texto (.txt)</button><button type="button" class="btn" id="btn-json">Descargar respuestas (.json)</button><button type="button" class="btn" id="btn-lista-res">Mis diagnósticos</button><button type="button" class="btn" data-step="4">Volver a Nómina</button></div>';
  $('view-results').innerHTML=h;
  actualizarBtnLista();actualizarCalc();animarResultados();
}

function render(foco){
  ['view-inicio','view-area','view-results'].forEach(function(id){$(id).hidden=true;});
  if(S.step===0){$('view-inicio').hidden=false;}
  else if(S.step>=1&&S.step<=4){$('view-area').hidden=false;renderArea(S.step-1);}
  else{$('view-results').hidden=false;renderResultados();}
  document.body.classList.toggle('is-home',S.step===0);
  document.documentElement.classList.toggle('lt',S.step!==0);
  renderStepper();renderProgreso();renderAvisoArea();actualizarHero();actualizarGate();
  if(foco){var t=S.step===0?$('t-inicio'):S.step===5?$('t-res'):$('t-area');if(t){t.focus({preventScroll:true});window.scrollTo({top:0,behavior:'smooth'});}}
}
function renderAvisoArea(){
  var av=$('avisos');av.innerHTML='';
  if(S.step>=1&&S.step<=4){
    var a=AREAS[S.step-1],sin=areaQs(a.id).filter(function(q){return !respondida(q);}).length;
    if(S.visitadas.indexOf(a.id)>-1&&sin>0){av.innerHTML='<div class="banner warn" role="status">En '+esc(a.n)+' quedan '+sin+' preguntas sin responder. Puedes continuar, pero el resultado de esta área será parcial.</div>';}
  }
}
function marcarVisitada(step){
  if(step>=1&&step<=4){var id=AREAS[step-1].id;if(S.visitadas.indexOf(id)<0)S.visitadas.push(id);}
}
function ir(n,foco){
  if(S.step>=1&&S.step<=4)marcarVisitada(S.step);
  if(n===0&&S.step>0)S.ultimo=S.step;
  S.step=n;guardar();render(foco!==false);
}

/* ---------- Exportación ---------- */
function descargarClasico(nombre,tipo,contenido){
  var b=new Blob([contenido],{type:tipo});var u=URL.createObjectURL(b);var a=document.createElement('a');
  a.href=u;a.download=nombre;document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(function(){URL.revokeObjectURL(u);},500);
}
function descargar(nombre,tipo,contenido){
  var msg=$('estado-guardado');
  /* Dentro de claude.ai las descargas directas se bloquean; allí se usa la capacidad "downloads". */
  if(window.claude&&typeof window.claude.use==='function'){
    window.claude.use('downloads').then(function(d){
      if(!d){descargarClasico(nombre,tipo,contenido);return;}
      d.save({filename:nombre,data:contenido}).then(function(){if(msg)msg.textContent='Archivo guardado: '+nombre;}).catch(function(){
        d.save({filename:nombre,data:new Blob([contenido],{type:tipo})}).catch(function(){if(msg)msg.textContent='No se pudo guardar el archivo en este visor.';});
      });
    }).catch(function(){descargarClasico(nombre,tipo,contenido);});
    return;
  }
  descargarClasico(nombre,tipo,contenido);
}
function slug(){return (S.datos.empresa||'diagnostico').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'diagnostico';}
function resumenTexto(){
  var r=calcular(),d=diagnostico(),dt=S.datos,L=['','Bajo','Medio','Alto'];
  var t=['AUDITORÍA DIAGNÓSTICA - KEYS DIGITAL SOLUTIONS','Empresa: '+(dt.empresa||'-'),'Responde: '+(dt.contacto||'-')+(dt.cargo?' ('+dt.cargo+')':''),'Sector: '+(dt.sector||'-'),'Fecha: '+dt.fecha,'',
   'PUNTAJE GLOBAL: '+(r.global===null?'sin datos':r.global+'/100 ('+nivel(r.global).t+')'),'','POR ÁREA'];
  r.areas.forEach(function(a){t.push('- '+a.n+': '+(a.p===null?'sin responder':a.p+'/100 ('+a.nivel.t+')')+' ['+(a.total-a.sin)+'/'+a.total+' respondidas]');});
  t.push('','FORTALEZAS');
  (d.fort.slice(0,4).length?d.fort.slice(0,4):[null]).forEach(function(q){t.push('- '+(q?q.p:'Aún no hay procesos en nivel sólido.'));});
  t.push('','BRECHAS MÁS URGENTES');
  (d.brechas.slice(0,3).length?d.brechas.slice(0,3):[null]).forEach(function(b){t.push('- '+(b?b.q.p+': '+b.q.val:'Sin brechas detectadas.'));});
  t.push('','RECOMENDACIONES PRIORIZADAS');
  d.brechas.slice(0,5).forEach(function(b,i){t.push((i+1)+'. '+b.q.p+' ['+(b.q.t==='A'?'Automatizar':'Mejorar')+'] '+b.q.rec+' Solución Keys: '+(KS[b.q.id]||'')+'. (Impacto '+L[b.q.i]+', Esfuerzo '+L[b.q.e]+', '+cuadrante(b.q)+')');});
  t.push('','RESPUESTAS');
  Q.forEach(function(q){var x=resp(q.id);t.push(q.id+' '+q.p+': '+(typeof x.v!=='number'?'sin responder':x.v===3?'No aplica':LETRA[x.v]+') '+q.o[x.v])+(x.n?' | Comentario: '+x.n:''));});
  return t.join('\n');
}
function jsonExport(){
  var r=calcular(),d=diagnostico();
  return JSON.stringify({version:1,generado:new Date().toISOString(),datos:S.datos,seguimiento:S.seg,impacto:S.calc,
    puntajes:{global:r.global,areas:r.areas.map(function(a){return {area:a.n,puntaje:a.p,nivel:a.nivel.t,respondidas:a.total-a.sin,total:a.total};})},
    respuestas:Q.map(function(q){var x=resp(q.id);return {id:q.id,area:q.a,proceso:q.p,pregunta:q.q,respuesta:typeof x.v!=='number'?null:(x.v===3?'No aplica':LETRA[x.v]),comentario:x.n||''};}),
    recomendaciones:d.brechas.slice(0,5).map(function(b){return {proceso:b.q.p,tipo:b.q.t==='A'?'Automatizar':'Mejorar',recomendacion:b.q.rec,impacto:b.q.i,esfuerzo:b.q.e,prioridad:cuadrante(b.q)};})},null,2);
}

/* ---------- Eventos ---------- */
document.addEventListener('click',function(e){
  var t=e.target.closest('button');if(!t)return;
  if(t.dataset.demo){dTimers.forEach(clearTimeout);dTimers=[];demoSel=t.dataset.demo;$('kp-demo').innerHTML=demoHTML(demoSel);return;}
  if(t.dataset.demoRun){ejecutarDemo(t.dataset.demoRun);return;}
  if(t.dataset.abrir){abrirAud(t.dataset.abrir);return;}
  if(t.dataset.borrar){
    if(t.dataset.seguro!=='1'){t.dataset.seguro='1';t.textContent='¿Seguro?';return;}
    var l=leerLista();delete l[t.dataset.borrar];escribirLista(l);
    if(t.dataset.borrar===S.id){try{window.localStorage.removeItem(KEY);}catch(er){}memStore=null;S=nuevoEstado();pintarDatos();render(true);}
    actualizarBtnLista();renderLista();return;
  }
  if(t.dataset.step!==undefined){ir(parseInt(t.dataset.step,10));return;}
  if(t.id==='btn-comenzar'){ir(pasoContinuar());return;}
  if(t.id==='btn-comenzar-2'){ir(1);return;}
  if(t.id==='btn-datos'){var dc=$('d-empresa');dc.scrollIntoView({behavior:'smooth',block:'center'});dc.focus({preventScroll:true});return;}
  if(t.id==='btn-empezar-de-nuevo'){$('btn-reiniciar').click();return;}
  if(t.dataset.go==='next'){ir(S.step+1);return;}
  if(t.dataset.go==='prev'){ir(S.step-1);return;}
  if(t.id==='btn-imprimir'||t.id==='btn-informe'){
    if(!desbloqueado()){var dc2=$('demo-card');if(dc2){dc2.scrollIntoView({behavior:'smooth',block:'start'});var dr=$('demo-run');if(dr)dr.focus({preventScroll:true});}return;}
    if(t.id==='btn-informe'||enMarco)descargarInforme();else window.print();return;
  }
  if(t.id==='btn-lista'||t.id==='btn-lista-res'){abrirLista();return;}
  if(t.id==='btn-vista'){abrirVista();return;}
  if(t.id==='vi-cerrar'){cerrarVista();return;}
  if(t.id==='vi-copiar'){copiarResumen();return;}
  if(t.id==='btn-nueva'||t.id==='btn-nueva-2'){nuevaAud();return;}
  if(t.id==='btn-csv'){descargar('auditorias-keys.csv','text/csv;charset=utf-8',csvTodas());return;}
  if(t.id==='dlg-lista-cerrar'){$('dlg-lista').close();return;}
  if(t.id==='btn-txt'){descargar('auditoria-'+slug()+'.txt','text/plain;charset=utf-8',resumenTexto());return;}
  if(t.id==='btn-json'){descargar('auditoria-'+slug()+'.json','application/json',jsonExport());return;}
  if(t.id==='btn-reiniciar'){var d=$('dlg-reiniciar');if(d.showModal)d.showModal();else if(confirm('¿Reiniciar el diagnóstico? Se borrarán todas las respuestas.'))reiniciar();return;}
  if(t.id==='dlg-no'){$('dlg-reiniciar').close();return;}
  if(t.id==='dlg-si'){$('dlg-reiniciar').close();reiniciar();return;}
});
document.addEventListener('change',function(e){
  var t=e.target;
  if(t.type==='radio'&&t.name&&t.name.indexOf('q-')===0){
    var id=t.name.slice(2);S.resp[id]=Object.assign(resp(id),{v:parseInt(t.value,10)});
    guardar();renderProgreso();renderStepper();renderAvisoArea();
  }
});
document.addEventListener('input',function(e){
  var t=e.target;
  if(t.dataset&&t.dataset.q){var id=t.dataset.q;S.resp[id]=Object.assign(resp(id),{n:t.value});guardar();return;}
  var map={'d-empresa':'empresa','d-contacto':'contacto','d-cargo':'cargo','d-sector':'sector','d-fecha':'fecha'};
  if(map[t.id]){S.datos[map[t.id]]=t.value;guardar();return;}
  var sm={'seg-interes':'interes','seg-proximo':'proximo','seg-fecha':'fechaSeg','seg-notas':'notas'};
  if(sm[t.id]){S.seg[sm[t.id]]=t.value;guardar();return;}
  if(t.id==='c-costo'){S.calc.costo=Math.max(0,parseFloat(t.value)||0);guardar();actualizarCalc();return;}
  if(t.id==='c-red'){S.calc.red=parseInt(t.value,10)||50;guardar();actualizarCalc();return;}
  var m=/^c([ph])-(mkt|con|fin|nom)$/.exec(t.id||'');
  if(m){S.calc.a[m[2]][m[1]]=Math.max(0,parseFloat(t.value)||0);guardar();actualizarCalc();return;}
});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&$('vi')&&!$('vi').hidden)cerrarVista();});
window.addEventListener('beforeprint',function(){if(S.step!==5){S.step=5;render(false);}finalizarAnim();});

function reiniciar(){
  var l=leerLista();delete l[S.id];escribirLista(l);
  try{window.localStorage.removeItem(KEY);}catch(e){}
  memStore=null;S=nuevoEstado();pintarDatos();render(true);actualizarBtnLista();
  $('estado-guardado').textContent='Diagnóstico reiniciado.';
}
function pintarDatos(){
  var d=S.datos;$('d-empresa').value=d.empresa;$('d-contacto').value=d.contacto;$('d-cargo').value=d.cargo;$('d-sector').value=d.sector;$('d-fecha').value=d.fecha;
}

cargar();pintarDatos();render(false);actualizarBtnLista();

/* ---------- Hero: video, controles e interacción ---------- */
function pasoContinuar(){
  if(totalResp()===0)return 1;
  if(S.ultimo>0)return S.ultimo;
  var r=calcular();for(var k=0;k<r.areas.length;k++){if(r.areas[k].sin>0)return k+1;}
  return 5;
}
function actualizarHero(){
  var n=totalResp(),txt=$('cta-texto'),rs=$('resume');
  if(!txt)return;
  txt.textContent=n>0?'Continuar el diagnóstico':'Comenzar el diagnóstico';
  if(n>0){rs.hidden=false;rs.innerHTML='Tienes un avance guardado en este navegador: '+n+' de '+Q.length+' preguntas respondidas. <button type="button" id="btn-empezar-de-nuevo">Empezar de nuevo</button>';}
  else{rs.hidden=true;rs.innerHTML='';}
}
var ICON={
  play:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
  pause:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
  off:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4z" fill="currentColor"/><path d="m16 9 5 6M21 9l-5 6"/></svg>',
  on:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>'
};
function iniciarHero(){
  var vid=$('video-marca'),frame=$('frame'),bp=$('vc-play'),bm=$('vc-mute'),fb=$('vfallback'),big=$('vc-big'),img=$('vanim'),ctr=document.querySelector('.vctrl');
  if(!vid)return;
  var b64='';
  var reducir=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pausaUsuario=false,pausaAuto=false,url=null,idx=-1,tmo=null,manejado=-2,animado=false;

  /* Cadena de respaldo: 1) URL blob (compatible con Safari/iOS), 2) data: URI (algunos visores bloquean blob:),
     3) archivo MARCA.mp4 junto al HTML, 4) animación WebP incrustada (funciona donde el video está bloqueado). */
  var intentos=[
    function(){return 'video/keys-marca.mp4';}
  ];
  function sync(){
    bp.innerHTML=vid.paused?ICON.play:ICON.pause;
    var a=vid.paused?'Reproducir video':'Pausar video';bp.setAttribute('aria-label',a);bp.title=a;
    bm.innerHTML=vid.muted?ICON.off:ICON.on;
    var m=vid.muted?'Activar sonido':'Silenciar video';bm.setAttribute('aria-label',m);bm.title=m;bm.setAttribute('aria-pressed',vid.muted?'false':'true');
  }
  function reproducir(){
    var p;try{p=vid.play();}catch(e){}
    if(p&&p.then){p.then(function(){big.hidden=true;sync();}).catch(function(){sync();setTimeout(avisarToque,400);});}else sync();
  }
  function avisarToque(){if(!animado&&vid.paused&&!pausaUsuario&&vid.readyState>=2&&!vid.error)big.hidden=false;}
  function mostrarAnimacion(){
    animado=true;vid.hidden=true;ctr.hidden=true;big.hidden=true;
    if(!img.getAttribute('src')){img.src='video/keys-marca-poster.webp';}
    img.hidden=false;
    fb.hidden=false;fb.innerHTML='Se muestra la versión animada sin sonido porque tu navegador bloqueó el video. <button type="button" id="vc-retry">Reintentar video</button>';
    $('vc-retry').addEventListener('click',reintentar);
  }
  function falla(){if(manejado===idx)return;manejado=idx;siguiente();}
  function siguiente(){
    clearTimeout(tmo);idx++;
    if(idx>=intentos.length){mostrarAnimacion();return;}
    var s;try{s=intentos[idx]();}catch(e){falla();return;}
    vid.src=s;vid.load();
    tmo=setTimeout(function(){if(vid.readyState<2)falla();},4000);
    if(!reducir)reproducir();else setTimeout(avisarToque,300);
  }
  function reintentar(){
    animado=false;idx=-1;manejado=-2;img.hidden=true;vid.hidden=false;ctr.hidden=false;fb.hidden=true;pausaUsuario=false;siguiente();
  }
  vid.muted=true;vid.defaultMuted=true;vid.setAttribute('muted','');vid.playsInline=true;
  vid.addEventListener('play',sync);vid.addEventListener('pause',sync);vid.addEventListener('volumechange',sync);
  vid.addEventListener('error',falla);
  vid.addEventListener('loadeddata',function(){clearTimeout(tmo);fb.hidden=true;});
  vid.addEventListener('playing',function(){big.hidden=true;fb.hidden=true;sync();});
  bp.addEventListener('click',function(){
    if(vid.paused){pausaUsuario=false;pausaAuto=false;reproducir();}else{pausaUsuario=true;vid.pause();}
  });
  bm.addEventListener('click',function(){vid.muted=!vid.muted;if(!vid.muted&&vid.paused&&!pausaUsuario)reproducir();sync();});
  big.addEventListener('click',function(){big.hidden=true;pausaUsuario=false;pausaAuto=false;vid.muted=false;reproducir();});
  frame.addEventListener('click',function(e){if(e.target===vid&&vid.paused&&!animado){pausaUsuario=false;reproducir();}});

  siguiente();
  sync();

  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){
      var visible=es[0].isIntersecting;
      if(animado)return;
      if(!visible&&!vid.paused){pausaAuto=true;vid.pause();}
      else if(visible&&pausaAuto&&!pausaUsuario){pausaAuto=false;reproducir();}
      else if(visible&&vid.paused&&!pausaUsuario&&!reducir&&vid.readyState>=2){reproducir();}
    },{threshold:.15}).observe(frame);
  }
  if(!reducir&&window.matchMedia&&window.matchMedia('(hover:hover) and (pointer:fine)').matches){
    var media=frame.parentNode;
    media.addEventListener('pointermove',function(e){
      var r=media.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      frame.style.transform='rotateY('+(x*10).toFixed(2)+'deg) rotateX('+(-y*10).toFixed(2)+'deg)';
    });
    media.addEventListener('pointerleave',function(){frame.style.transform='';});
  }
}
iniciarHero();actualizarHero();
/* ===== v6: hero en vivo, demo comparativa y aparición al hacer scroll ===== */
(function(){
  var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(id){return document.getElementById(id)}
  /* Consola del hero */
  var AR=[['Marketing'],['Contabilidad'],['Finanzas'],['Nómina']],SETS=[[72,48,31,55],[64,58,42,70],[81,39,52,61]],si=0;
  var bars=$('hx-bars');
  if(bars){
    bars.innerHTML=AR.map(function(a){return '<div class="cb"><div class="l"><span>'+a[0]+'</span><b>0</b></div><div class="t"><i></i></div></div>'}).join('');
    var FEED=[['AUTO','Conciliación: 4 de 5 movimientos cruzados con los libros'],['AUTO','Cartera: recordatorio enviado a Cliente Norte'],['REVISAR','Consignación sin identificar enviada a revisión',1],['AUTO','Nómina electrónica lista para transmitir'],['AUTO','Nuevo contacto web asignado a ventas'],['AUTO','Pago 221 aprobado en nivel 2 con soporte'],['AUTO','Tablero de gerencia actualizado']],fi=0;
    var CHIP=['conciliación bancaria','cobranza de cartera','nómina electrónica','seguimiento comercial'];
    function col(v){return v<34?'#ff6b6b':v<67?'#f4b942':'#3DE8D8'}
    function cycle(){
      var s=SETS[si++%SETS.length],g=Math.round(s.reduce(function(a,b){return a+b},0)/4);
      [].forEach.call(bars.querySelectorAll('.cb'),function(c,i){c.querySelector('i').style.width=s[i]+'%';c.querySelector('i').style.background=col(s[i]);count(c.querySelector('b'),s[i])});
      $('hx-ring').style.strokeDashoffset=314*(1-g/100);count($('hx-score'),g);
      $('hx-chip').textContent=CHIP[si%CHIP.length];
    }
    function count(el,to){var from=+el.textContent||0,t0=performance.now();if(RM){el.textContent=to;return}
      (function f(t){var p=Math.min(1,(t-t0)/1200),e=1-Math.pow(1-p,3);el.textContent=Math.round(from+(to-from)*e);if(p<1)requestAnimationFrame(f)})(t0)}
    function feed(){var f=FEED[fi++%FEED.length],d=new Date(),box=$('hx-feed'),el=document.createElement('div');
      el.innerHTML='<u'+(f[2]?' class="w"':'')+'>'+f[0]+'</u><span>'+f[1]+'</span><time>'+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)+'</time>';
      box.appendChild(el);while(box.children.length>4)box.removeChild(box.firstChild)}
    window.__kcycle=cycle;window.__kfeed=feed;setTimeout(cycle,500);feed();setTimeout(feed,900);setTimeout(feed,1700);
    if(!RM){setInterval(cycle,6500);setInterval(feed,2200)}
  }

  /* v9: panel en vivo interactivo */
  (function(){var st=document.getElementById('live-stage'),c=st&&st.querySelector('.console');if(!c)return;
    if(!RM&&matchMedia('(hover:hover)').matches){st.addEventListener('mousemove',function(e){var r=st.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.setProperty('--ry',(x*16)+'deg');c.style.setProperty('--rx',(-y*10)+'deg')});
      st.addEventListener('mouseleave',function(){c.style.removeProperty('--ry');c.style.removeProperty('--rx')})}
    var sb=document.getElementById('live-sim');if(sb&&window.__kcycle)sb.addEventListener('click',function(){window.__kcycle();window.__kfeed&&window.__kfeed()});
  })();
  /* Demo comparativa */
  var tabs=$('hr-tabs');
  if(tabs&&typeof DEMOS!=='undefined'){
    var cur=0,timers=[],started=false;
    tabs.innerHTML=DEMOS.map(function(d,i){return '<button type="button" class="ptab" role="tab" id="hr-t'+i+'" aria-selected="'+(i==0)+'">'+d.n+' <span style="opacity:.6;font-weight:500">· '+({mkt:'Seguimiento comercial',con:'Conciliación bancaria',fin:'Cobranza y pagos',nom:'Nómina electrónica'}[d.id]||'')+'</span></button>'}).join('');
    function clear(){timers.forEach(clearTimeout);timers=[]}
    function at(ms,fn){timers.push(setTimeout(fn,RM?0:ms))}
    function li(t){return '<li><i>✓</i>'+t+'</li>'}
    function run(i){
      clear();cur=i;var d=DEMOS[i];
      [].forEach.call(tabs.children,function(b,j){b.setAttribute('aria-selected',j==i)});
      $('hr-man').innerHTML=d.man.map(li).join('');$('hr-kl').innerHTML=d.kst.map(li).join('');
      $('hr-kname').textContent='Con '+(d.mod.indexOf('Keys')===0?d.mod:'Keys');
      $('hr-tb').innerHTML=d.rows.map(function(r){return '<tr><td>'+r[0]+'</td><td>'+r[1]+'</td><td><span class="sb">'+d.ini+'</span></td></tr>'}).join('');
      $('hr-ben').innerHTML=d.ben.map(function(b){return '<div>'+b+'</div>'}).join('');
      $('hr-mst').textContent='En proceso…';$('hr-kst').textContent='Automático';$('hr-mt').textContent='0';
      var mb=$('hr-mbar'),kb=$('hr-kbar');mb.style.transition='none';kb.style.transition='none';mb.style.width='0';kb.style.width='0';void mb.offsetWidth;
      mb.style.transition='width 9s linear';kb.style.transition='width 2.4s cubic-bezier(.4,0,.2,1)';
      var ml=$('hr-man').children,kl=$('hr-kl').children,rows=$('hr-tb').rows;
      at(300,function(){ml[0].className='run';mb.style.width='40%';kb.style.width='100%'});
      [].forEach.call(kl,function(e,j){at(300+j*800,function(){e.className='run'});at(1000+j*800,function(){e.className='ok'})});
      [].forEach.call(rows,function(r,j){at(2600+j*450,function(){var fin=d.rows[j][2],b=r.cells[2].firstChild;b.textContent=fin;b.className='sb '+(/revis/i.test(fin)?'rv':'ok');r.className='fl';setTimeout(function(){r.className=''},700)})});
      at(2600+rows.length*450,function(){$('hr-kst').textContent='Listo ✓'});
      at(4300,function(){ml[0].className='ok';ml[1].className='run';$('hr-mt').textContent='1'});
      at(8200,function(){ml[1].className='ok';ml[2].className='run';$('hr-mt').textContent='2'});
      at(9300,function(){$('hr-mst').textContent='Paso 3 de '+d.man.length+'…'});
    }
    tabs.addEventListener('click',function(e){var b=e.target.closest('.ptab');if(b)run([].indexOf.call(tabs.children,b))});
    tabs.addEventListener('keydown',function(e){if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;var n=(cur+(e.key==='ArrowRight'?1:-1)+DEMOS.length)%DEMOS.length;run(n);tabs.children[n].focus()});
    $('hr-again').addEventListener('click',function(){run(cur)});
    run(0);clear();
    var sec=tabs.closest('section');
    if('IntersectionObserver' in window){new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting&&!started){started=true;run(0)}})},{threshold:.35}).observe(sec)}else run(0);
  }
  /* CTA final */
  var c3=$('btn-comenzar-3');if(c3)c3.addEventListener('click',function(){var b=$('btn-comenzar');if(b)b.click();window.scrollTo(0,0)});
  /* Aparición al hacer scroll */
  var rv=document.querySelectorAll('.rvs');
  if(RM||!('IntersectionObserver' in window)){[].forEach.call(rv,function(e){e.classList.add('in')})}
  else{var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{threshold:.12});[].forEach.call(rv,function(e){io.observe(e)})}
})();
})();
