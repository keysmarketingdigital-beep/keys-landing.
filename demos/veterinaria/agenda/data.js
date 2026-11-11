/* Datos y reglas de KEYS Veterinaria (demo). Mismas reglas del agente: ver agente-veterinario/backend.py.
   Todo lo marcado "ejemplo" o "por confirmar" debe validarlo la clínica. */
(function(){
var C={nombre:'KEYS Veterinaria',web:'keysmarketingdigital.com',wa:'573045550119',waShow:'304 555 0119',
 direccion:'Dirección por confirmar',abre:0,cierra:1440,colchon:10,limiteCambioH:24,maxFuturas:3,recordatorioH:3};
var ESPECIES=[['canino','Perro'],['felino','Gato'],['ave','Ave'],['conejo_roedor','Conejo o roedor'],['reptil','Reptil'],['otro','Otra']];
var ALL=['canino','felino','ave','conejo_roedor','reptil','otro'];
// dur en minutos (ejemplo, basado en otras veterinarias; por confirmar). cat para filtros.
var SERVICIOS={
 consulta_general:{n:'Consulta general',dur:30,cat:'consulta',pideVac:false},
 control_cachorro_gatito:{n:'Control de cachorro o gatito',dur:30,cat:'consulta',pideVac:true},
 chequeo_geriatrico:{n:'Chequeo geriátrico',dur:30,cat:'consulta'},
 consulta_especialista:{n:'Consulta con especialista',dur:40,cat:'consulta'},
 vacunacion:{n:'Vacunación',dur:20,cat:'prevencion',pideVac:true},
 desparasitacion:{n:'Desparasitación',dur:20,cat:'prevencion'},
 microchip:{n:'Implantación de microchip',dur:10,cat:'prevencion'},
 laboratorio:{n:'Laboratorio clínico (toma de muestras)',dur:10,cat:'diagnostico',sala:'laboratorio',prep:true},
 radiografia:{n:'Radiografía (rayos X)',dur:30,cat:'diagnostico',sala:'sala_imagenes'},
 ecografia:{n:'Ecografía',dur:30,cat:'diagnostico',sala:'sala_imagenes',prep:true},
 odontologia:{n:'Odontología veterinaria',dur:60,cat:'odontologia',prep:true},
 cirugia:{n:'Cirugía y esterilización',dur:90,cat:'cirugia',sala:'quirofano',prep:true},
 control_postoperatorio:{n:'Control postoperatorio',dur:20,cat:'cirugia'},
 estetica_bano:{n:'Estética: baño e higiene',dur:60,cat:'estetica'},
 estetica_corte:{n:'Estética: baño y corte',dur:120,cat:'estetica'}
};
var CATS={consulta:'Consultas y chequeos',prevencion:'Prevención',diagnostico:'Laboratorio e imágenes',odontologia:'Odontología',cirugia:'Cirugía',estetica:'Estética'};
var PROF={
 vet1:{n:'Veterinario/a 1 (demo)',rol:'Veterinario',sala:'consultorio_1',esp:['canino','felino'],srv:['consulta_general','control_cachorro_gatito','chequeo_geriatrico','vacunacion','desparasitacion','microchip','control_postoperatorio'],img:'../img/equipo-1.webp'},
 vet2:{n:'Veterinario/a 2 (demo)',rol:'Veterinario',sala:'consultorio_2',esp:ALL,srv:['consulta_general','desparasitacion','cirugia','control_postoperatorio'],img:'../img/equipo-2.webp'},
 esp1:{n:'Especialista (demo)',rol:'Veterinario especialista',sala:'consultorio_3',esp:['canino','felino'],srv:['consulta_especialista','odontologia','radiografia','ecografia'],img:'../img/equipo-3.webp'},
 lab1:{n:'Laboratorio (demo)',rol:'Laboratorista',sala:'laboratorio',esp:ALL,srv:['laboratorio'],img:'../img/equipo-2.svg'},
 peluq1:{n:'Peluquero/a 1 (demo)',rol:'Estética',sala:'sala_estetica',esp:['canino','felino'],srv:['estetica_bano','estetica_corte'],img:'../img/equipo-1.svg'}
};
var SALAS={consultorio_1:'Consultorio 1',consultorio_2:'Consultorio 2',consultorio_3:'Consultorio 3',laboratorio:'Laboratorio',sala_imagenes:'Sala de imágenes',quirofano:'Quirófano',sala_estetica:'Sala de estética'};
// Señales de emergencia (lista base; la valida el veterinario de la clínica)
var VITAL=[['sangrado',/sangr|hemorrag/],['intoxicación o envenenamiento',/envenen|intoxic|veneno|raticida|(comio|tomo|trago|ingirio|lamio).{0,30}(chocolate|veneno|raticida|medicamento|pastilla|xilitol|uvas)/],
 ['dificultad para respirar',/no respira|dificultad (para )?respirar|le cuesta respirar|ahog|asfixi/],['convulsiones',/convuls|ataque epilept/],
 ['atropellamiento o trauma grave',/atropell|lo golpeo un carro|cayo de(l)? (balcon|ventana|piso|altura)/],['pérdida de conciencia',/inconsciente|desmay|no reacciona|no responde/],
 ['mucosas pálidas o moradas',/encias (blancas|palidas|azules|moradas)|lengua (azul|morada)/],['abdomen hinchado o duro',/(abdomen|barriga|panza) (hinchad|dur)/],
 ['golpe de calor',/golpe de calor/],['no puede orinar',/no (puede )?orin/]];
var URGENTE=[['vómito',/vomit/],['diarrea',/diarrea/],['no come',/no (ha )?comido|no quiere comer|no come/],['cojera',/cojea|cojera|no apoya/],['herida',/herida|mordi|cortada/],['ojo',/\bojo/],['decaimiento',/decaid|letarg|apatic/],['fiebre',/fiebre/],['dolor',/dolor/]];
window.KV={C:C,ESPECIES:ESPECIES,SERVICIOS:SERVICIOS,CATS:CATS,PROF:PROF,SALAS:SALAS,VITAL:VITAL,URGENTE:URGENTE};
})();
