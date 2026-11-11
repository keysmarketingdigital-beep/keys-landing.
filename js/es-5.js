(function () {
  'use strict';

  /* ---------- Configuración ---------- */
  var CFG = Object.assign(
    { SUPABASE_URL: '', SUPABASE_ANON_KEY: '', TENANT_SLUG: 'keys', WHATSAPP: '57XXXXXXXXXX', EMAIL: 'correo@tudominio.com', DEMO_VITRINA: '' },
    window.KEYS_CONFIG || {}
  );
  var LIVE = /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(CFG.SUPABASE_URL) &&
             CFG.SUPABASE_ANON_KEY && !/^TU_/.test(CFG.SUPABASE_ANON_KEY);

  function $(id) { return document.getElementById(id); }
  function waLink(text) { return 'https://wa.me/' + CFG.WHATSAPP + (text ? '?text=' + encodeURIComponent(text) : ''); }
  function mailLink(subject, body) { return 'mailto:' + CFG.EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body); }

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
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  var CHECK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#35E5D0" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>';


  /* ---------- i18n ---------- */
  var LANG = 'es'; try { LANG = localStorage.getItem('keys_lang') || 'es'; } catch (e) {}
  var T = {
    pl_eye:{es:"// MARCAS Y PLATAFORMAS",en:"// BRANDS & PLATFORMS"},
    pl_h2:{es:"Trabajamos con las plataformas que ya conoces.",en:"We work with the platforms you already know."},
    pl_lead:{es:"Configuramos y conectamos cada herramienta a tu nombre, para que tu negocio se vea, se mida y venda.",en:"We set up and connect each tool in your name, so your business gets seen, measured and sells."},
    pl_ads:{es:"Publicidad",en:"Advertising"},
    pl_med:{es:"Medición",en:"Analytics"},
    pl_pres:{es:"Presencia en Google",en:"Presence on Google"},
    pl_pres_0:{es:"Perfil de Empresa en Google",en:"Google Business Profile"},
    pl_db:{es:"Base de datos",en:"Database"},
    pl_dom:{es:"Dominios y hosting",en:"Domains & hosting"},
    pl_dom_1:{es:"Dominio propio (.com)",en:"Your own domain (.com)"},
    pl_msg:{es:"Correo y mensajería",en:"Email & messaging"},
    nav_pk:{es:"Paquetes",en:"Packages"},
    pk_eye:{es:"// PAQUETES",en:"// PACKAGES"},
    pk_h2:{es:"Elige por dónde empezar.",en:"Choose where to start."},
    pk_lead:{es:"Cada paquete se adapta a tu negocio. El precio lo definimos contigo en la reunión inicial gratis, sin costos ocultos.",en:"Every package is tailored to your business. We set the price with you in the free first meeting, with no hidden costs."},
    pk_cta:{es:"Cotizar por WhatsApp",en:"Get a quote on WhatsApp"},
    pk_feat:{es:"Destacado",en:"Featured"},
    pk_inc:{es:"Incluye",en:"Includes"},
    pk_land_t:{es:"Landing page",en:"Landing page"},
    pk_land_s:{es:"Tu página para que te encuentren y te escriban.",en:"Your page so people find you and reach out."},
    pk_land_0:{es:"Diseño adaptado a tu marca",en:"Design tailored to your brand"},
    pk_land_1:{es:"Se ve perfecto en celular y computador",en:"Looks great on phone and desktop"},
    pk_land_2:{es:"Carga rápida y segura",en:"Fast and secure"},
    pk_land_3:{es:"Botón de WhatsApp siempre a la vista",en:"WhatsApp button always in view"},
    pk_land_4:{es:"Formulario de contacto y cotización",en:"Contact and quote form"},
    pk_land_5:{es:"Medición de visitas y resultados",en:"Visit and results tracking"},
    pk_land_6:{es:"Tu propio dominio (tunegocio.com)",en:"Your own domain (yourbusiness.com)"},
    pk_land_7:{es:"Versión en inglés, si la necesitas",en:"English version, if you need it"},
    pk_cat_t:{es:"Catálogo virtual",en:"Online catalog"},
    pk_cat_s:{es:"Para vender tus productos por WhatsApp.",en:"To sell your products through WhatsApp."},
    pk_cat_0:{es:"Todo lo del paquete Landing page",en:"Everything in the Landing page package"},
    pk_cat_1:{es:"Catálogo de productos con fotos y precios",en:"Product catalog with photos and prices"},
    pk_cat_2:{es:"Pedidos directos a tu WhatsApp",en:"Orders straight to your WhatsApp"},
    pk_cat_3:{es:"Panel para administrar productos y pedidos",en:"Panel to manage products and orders"},
    pk_cat_4:{es:"Fácil de actualizar cuando lo necesites",en:"Easy to update whenever you need"},
    pk_agd_t:{es:"Agenda y citas",en:"Booking & appointments"},
    pk_agd_s:{es:"Para que tus clientes reserven solos.",en:"So your clients book on their own."},
    pk_agd_0:{es:"Todo lo del paquete Landing page",en:"Everything in the Landing page package"},
    pk_agd_1:{es:"Agenda de citas en línea",en:"Online appointment booking"},
    pk_agd_2:{es:"Recordatorios automáticos para reducir inasistencias",en:"Automatic reminders to reduce no-shows"},
    pk_agd_3:{es:"Vista separada para administrador, profesional y cliente",en:"Separate views for admin, staff and client"},
    pk_agd_4:{es:"Sección de servicios y precios",en:"Services and prices section"},
    pk_cap_t:{es:"Captación de clientes",en:"Client acquisition"},
    pk_cap_s:{es:"Para volver a venderle a tu base de clientes.",en:"To sell again to your customer base."},
    pk_cap_0:{es:"CRM con tus leads organizados por carpetas",en:"CRM with your leads organized in folders"},
    pk_cap_1:{es:"Campañas por correo programadas, con confirmación de envío y reporte de rebotes",en:"Scheduled email campaigns with delivery confirmation and bounce report"},
    pk_cap_2:{es:"Mensajes listos para enviar por WhatsApp",en:"Ready-to-send WhatsApp messages"},
    pk_cap_3:{es:"Chat en tu página que traduce al idioma de cada cliente",en:"Website chat that translates to each client's language"},
    pk_cap_4:{es:"Carga de contactos desde Excel o CSV",en:"Import contacts from Excel or CSV"},
    pk_all:{es:"Todos incluyen: reunión inicial gratis, un prototipo para probar antes de empezar, todo a tu nombre y acompañamiento después de la entrega.",en:"All of them include: a free first meeting, a prototype to try before we start, everything in your name, and support after delivery."},
    pk_mant:{es:"¿Ya tienes página? Mira el mantenimiento web →",en:"Already have a website? See website maintenance →"},
    qf_h:{es:"¿No sabes cuál elegir?",en:"Not sure which one to pick?"},
    qf_p:{es:"Cuéntanos tres cosas y te respondemos por WhatsApp.",en:"Tell us three things and we will reply on WhatsApp."},
    qf_name:{es:"Tu nombre",en:"Your name"},
    qf_biz:{es:"Tipo de negocio",en:"Type of business"},
    qf_biz_ph:{es:"Ej. barbería, consultorio, restaurante",en:"E.g. barbershop, clinic, restaurant"},
    qf_int:{es:"Qué te interesa",en:"What you are interested in"},
    qf_o0:{es:"Aún no sé",en:"Not sure yet"},
    qf_send:{es:"Enviar por WhatsApp",en:"Send on WhatsApp"},
    qf_note:{es:"Se abre WhatsApp con tu mensaje listo. Este formulario no guarda tus datos.",en:"WhatsApp opens with your message ready. This form does not store your data."},
    rv_eye:{es:"// RESEÑAS EN GOOGLE",en:"// GOOGLE REVIEWS"},
    rv_h2:{es:"Lo que dicen nuestros clientes.",en:"What our clients say."},
    rv_src:{es:"Reseña en Google",en:"Google review"},
    rv_tr:{es:"(Traducción) Excelente trabajo, información muy clara y muy cumplidos. ¡Sin duda los recomiendo!",en:"(Translated) Excellent work, very clear information and always on time. I definitely recommend them!"},
    tl_h:{es:"Herramientas con las que trabajamos",en:"Tools we work with"},
    cv_h:{es:"Dónde trabajamos",en:"Where we work"},
    cv_0:{es:"Colombia",en:"Colombia"},
    cv_1:{es:"Estados Unidos",en:"United States"},
    cv_2:{es:"Otros países, de forma remota",en:"Other countries, remotely"},
    cv_3:{es:"Español e inglés",en:"Spanish and English"},
    tl_3:{es:"Perfil de Empresa en Google",en:"Google Business Profile"},
    nav_feat:{es:'★ Landing page y mantenimiento',en:'★ Landing page & maintenance'},
    nav_ex:{es:'Ejemplos',en:'Examples'},nav_sv:{es:'Servicios',en:'Services'},nav_pr:{es:'Cómo trabajamos',en:'How we work'},
    hero_eye:{es:'DE TU CABEZA A LA PANTALLA',en:'FROM YOUR MIND TO THE SCREEN'},
    hero_h1:{es:'Mientras tú atiendes, tu página consigue nuevos clientes.',en:'While you work, your website brings in new clients.'},
    hero_lead:{es:'Creamos tu página, tu catálogo y tu sistema de reservas para que te encuentren, confíen y te compren, aunque no estés.',en:"We build your website, catalog and booking system so people find you, trust you and buy from you, even when you're away."},
    feat_pill_t:{es:'Servicio destacado: Creación de landing page y mantenimiento',en:'Featured service: Landing page creation & maintenance'},
    cta_wa:{es:'Escríbenos por WhatsApp',en:'Message us on WhatsApp'},
    hero_cta2:{es:'Ver ejemplos reales',en:'See real examples'},
    tr1b:{es:'Reunión inicial gratis',en:'Free first meeting'},tr1t:{es:'30 minutos, sin compromiso',en:'30 minutes, no commitment'},
    tr2b:{es:'Pruébalo antes de decidir',en:'Try it before you decide'},tr2t:{es:'Abre nuestros prototipos reales',en:'Open our real prototypes'},
    tr3b:{es:'Todo es tuyo',en:"It's all yours"},tr3t:{es:'Tu dominio, tus cuentas, tus datos',en:'Your domain, your accounts, your data'},
    tr4b:{es:'Acompañamiento continuo',en:'Ongoing support'},tr4t:{es:'No te dejamos solo tras la entrega',en:"We don't leave you alone after delivery"},
    val_eye:{es:'// POR QUÉ KEYS',en:'// WHY KEYS'},val_h2:{es:'No te entregamos una herramienta y desaparecemos.',en:"We don't hand you a tool and vanish."},
    val1h:{es:'Seguridad',en:'Security'},val1p:{es:'Tus datos y los de tus clientes, aislados y protegidos.',en:"Your data and your clients' data, isolated and protected."},
    val2h:{es:'Innovación',en:'Innovation'},val2p:{es:'Chatbots, CRM y automatización que venden por ti.',en:'Chatbots, CRM and automation that sell for you.'},
    val3h:{es:'Compromiso',en:'Commitment'},val3p:{es:'Resultados reales: más reservas y clientes, no solo seguidores.',en:'Real results: more bookings and clients, not just followers.'},
    val4h:{es:'Ayuda tecnológica',en:'Tech support'},val4p:{es:'Te explicamos, configuramos y acompañamos en el uso.',en:'We explain, set up and support you in using it.'},
    sv_eye:{es:'// SERVICIOS',en:'// SERVICES'},sv_h2:{es:'Todo lo que podemos hacer por ti.',en:'Everything we can do for you.'},
    s1h:{es:'Catálogo virtual personalizado',en:'Custom online catalog'},s1p:{es:'Tus productos o servicios en línea, con pedidos directos a tu WhatsApp.',en:'Your products or services online, with orders straight to your WhatsApp.'},
    s2h:{es:'Agendamiento de citas',en:'Appointment booking'},s2p:{es:'Agenda en línea para que tus clientes reserven solos, con panel para tu equipo.',en:'Online scheduling so clients book themselves, with a panel for your team.'},
    s3h:{es:'Creación de landing page y mantenimiento',en:'Landing page creation & maintenance'},s3p:{es:'Tu página de aterrizaje, rápida y clara, pensada para convertir visitas en clientes y posicionarte en Google — y la mantenemos actualizada, segura y funcionando.',en:'Your landing page, fast and clear, built to turn visitors into clients and rank on Google — and we keep it updated, secure and running.'},
    feat_tag:{es:'Destacado',en:'Featured'},
    s4h:{es:'Chatbots y WhatsApp',en:'Chatbots & WhatsApp'},s4p:{es:'Responden dudas y atienden a tus clientes, aun cuando no estás.',en:"They answer questions and assist your clients, even when you're away."},
    s5h:{es:'CRM y automatización',en:'CRM & automation'},s5p:{es:'Cada contacto y su seguimiento, en orden y en automático.',en:'Every contact and its follow-up, organized and automatic.'},
    s6h:{es:'Base de datos de clientes',en:'Customer database'},s6p:{es:'Todos tus clientes en un lugar, listos para volver a venderles.',en:'All your clients in one place, ready to sell to again.'},
    s7h:{es:'Campañas por correo y WhatsApp',en:'Email & WhatsApp campaigns'},s7p:{es:'Promos y recordatorios a tu base, medidos por aperturas y respuestas.',en:'Promos and reminders to your list, measured by opens and replies.'},
    s8h:{es:'Marketing digital',en:'Digital marketing'},s8p:{es:'Contenido, diseño y Meta Ads medidos con datos reales, no con intuición.',en:'Content, design and Meta Ads measured with real data, not guesswork.'},
    sec_eye:{es:'// ELIGE TU NEGOCIO',en:'// CHOOSE YOUR BUSINESS'},sec_h2:{es:'¿Qué tipo de negocio tienes?',en:'What kind of business do you have?'},sec_lead:{es:'Elige el tuyo y mira, en vivo, un ejemplo real de lo que podemos construir para ti.',en:'Pick yours and see, live, a real example of what we can build for you.'},
    pr_eye:{es:'// EJEMPLOS REALES',en:'// REAL EXAMPLES'},pr_h2:{es:'Míralo funcionando antes de decidir.',en:'See it working before you decide.'},pr_lead:{es:'Estos son prototipos reales que puedes abrir y probar ahora mismo. Cada uno muestra lo que podemos construir para tu negocio.',en:'These are real prototypes you can open and try right now. Each one shows what we can build for your business.'},
    ps_eye:{es:'// CÓMO TRABAJAMOS',en:'// HOW WE WORK'},ps_h2:{es:'Un camino claro, sin sorpresas.',en:'A clear path, no surprises.'},
    p1h:{es:'Escuchamos',en:'We listen'},p1p:{es:'Reunión gratis de 30 minutos: entendemos tu negocio, tus clientes y qué quieres lograr antes de proponer nada.',en:'Free 30-minute meeting: we understand your business, your clients and your goals before proposing anything.'},
    p2h:{es:'Prototipamos',en:'We prototype'},p2p:{es:'Te mostramos algo que puedes ver y probar, para decidir con confianza y no a ciegas.',en:'We show you something you can see and try, so you decide with confidence, not blindly.'},
    p3h:{es:'Implementamos',en:'We implement'},p3p:{es:'Ponemos en marcha la herramienta con tu identidad, tus servicios y tus canales de contacto.',en:'We launch the tool with your identity, your services and your contact channels.'},
    p4h:{es:'Acompañamos',en:'We support'},p4p:{es:'Te enseñamos a usarla, medimos resultados y la ajustamos contigo mes a mes.',en:'We teach you to use it, measure results and refine it with you month to month.'},
    faq_eye:{es:'// PREGUNTAS FRECUENTES',en:'// FAQ'},faq_h2:{es:'Lo que más nos preguntan.',en:'What people ask us most.'},
    q1s:{es:'¿Puedo ver algo antes de decidir?',en:'Can I see something before deciding?'},q1p:{es:'Sí. Puedes abrir nuestros prototipos y probarlos tú mismo en la sección de prototipos. Después de la reunión inicial te mostramos cómo se vería el tuyo.',en:'Yes. You can open our prototypes and try them yourself in the examples section. After the first meeting we show you how yours would look.'},
    q2s:{es:'¿Cuánto cuesta?',en:'How much does it cost?'},q2p:{es:'Depende de lo que necesites. En la reunión inicial, que es gratis, hacemos la cuenta contigo y te damos un precio claro antes de empezar, sin costos ocultos.',en:'It depends on what you need. In the first meeting, which is free, we work out the numbers with you and give you a clear price before starting, with no hidden costs.'},
    q3s:{es:'¿Cuánto tarda tenerlo listo?',en:'How long does it take?'},q3p:{es:'El montaje toma 10 días hábiles una vez definido el alcance. Antes de empezar siempre te mostramos un prototipo que puedes ver y probar, así decides con confianza.',en:'Setup takes 10 business days once the scope is defined. Before starting we always show you a prototype you can see and try, so you decide with confidence.'},
    q4s:{es:'¿Tengo que cambiar mi WhatsApp o mis herramientas?',en:'Do I have to change my WhatsApp or my tools?'},q4p:{es:'No. Trabajamos con lo que ya usas, como tu número de WhatsApp y tus redes, y conectamos lo nuevo a eso.',en:'No. We work with what you already use, like your WhatsApp number and your social media, and connect the new tools to them.'},
    q5s:{es:'¿De quién es lo que construyen?',en:'Who owns what you build?'},q5p:{es:'Tuyo. Tu dominio, tus cuentas y tus datos quedan a tu nombre, y cada negocio trabaja con sus datos separados de los demás.',en:'Yours. Your domain, your accounts and your data stay in your name, and each business keeps its data separate from the rest.'},
    q6s:{es:'¿Qué pasa después de la entrega?',en:'What happens after delivery?'},q6p:{es:'Te enseñamos a usarlo, resolvemos tus dudas y lo vamos ajustando contigo. No te dejamos solo con la herramienta.',en:'We teach you to use it, answer your questions and keep refining it with you. We don’t leave you alone with the tool.'},
    ag_eye:{es:'// AGENDA TU REUNIÓN',en:'// BOOK YOUR MEETING'},ag_h2:{es:'¿Listo para llevar tu idea a la pantalla?',en:'Ready to bring your idea to the screen?'},ag_lead:{es:'Elige el día y la hora que mejor te queden. Es una reunión de 30 minutos, sin costo y sin compromiso.',en:"Pick the day and time that work best for you. It's a 30-minute meeting, free and with no commitment."},
    agc1:{es:'Te escuchamos y entendemos tu negocio',en:'We listen and understand your business'},agc2:{es:'Te mostramos cómo podría verse en tu caso',en:'We show you how it could look for you'},agc3:{es:'Sales con una hoja de ruta clara',en:'You leave with a clear roadmap'},
    ag_or:{es:'o agenda una reunión gratis de 30 min en el formulario &#8594;',en:'or book a free 30-min meeting in the form &#8594;'},
    f_day:{es:'1 · ELIGE EL DÍA',en:'1 · CHOOSE THE DAY'},f_time:{es:'2 · ELIGE LA HORA',en:'2 · CHOOSE THE TIME'},f_data:{es:'3 · TUS DATOS',en:'3 · YOUR DETAILS'},
    f_more:{es:'Cuéntanos más',en:'Tell us more'},f_opt:{es:'(opcional)',en:'(optional)'},
    opt0:{es:'¿Qué tipo de negocio tienes?',en:'What kind of business do you have?'},opt1:{es:'Restaurante o cocina oculta',en:'Restaurant or ghost kitchen'},opt2:{es:'Consultorio médico o clínica',en:'Medical office or clinic'},opt3:{es:'Barbería',en:'Barbershop'},opt4:{es:'Salón de belleza o spa',en:'Beauty salon or spa'},opt5:{es:'Estética facial o corporal',en:'Facial or body aesthetics'},opt6:{es:'Otro',en:'Other'},
    i1:{es:'Catálogo virtual',en:'Online catalog'},i2:{es:'Agendamiento',en:'Scheduling'},i3:{es:'Landing page',en:'Landing page'},i4:{es:'Chatbot y WhatsApp',en:'Chatbot & WhatsApp'},i5:{es:'CRM y automatización',en:'CRM & automation'},i6:{es:'Base de datos de clientes',en:'Customer database'},i7:{es:'Campañas por correo y WhatsApp',en:'Email & WhatsApp campaigns'},i8:{es:'Marketing digital',en:'Digital marketing'},
    cwa:{es:'Quiero recibir promociones y novedades por WhatsApp.',en:'I want to receive promotions and news via WhatsApp.'},cmail:{es:'Quiero recibir promociones y novedades por correo.',en:'I want to receive promotions and news via email.'},cdat:{es:'Autorizo a KEYS a usar mis datos para contactarme sobre este servicio, conforme a la Ley 1581 de 2012.',en:'I authorize KEYS to use my data to contact me about this service, under Colombian Law 1581 of 2012.'},cdat_link:{es:'Ver política de privacidad',en:'View privacy policy'},
    legal:{es:'Puedes darte de baja de las promociones cuando quieras desde el mismo correo o WhatsApp que te enviemos.',en:'You can unsubscribe from promotions anytime from the same email or WhatsApp we send you.'},
    f_go:{es:'Agendar reunión gratis',en:'Book free meeting'},
    d_t:{es:'RESERVA RECIBIDA',en:'BOOKING RECEIVED'},d_p:{es:'Te escribiremos por WhatsApp para confirmarla. Si necesitas cambiarla, respóndenos ahí mismo.',en:"We'll message you on WhatsApp to confirm it. If you need to change it, just reply there."},d_wa:{es:'Escribir por WhatsApp',en:'Message on WhatsApp'},d_again:{es:'Agendar otra reunión',en:'Book another meeting'},
    se_t:{es:'CASI LISTO',en:'ALMOST DONE'},se_p:{es:'Tu horario queda reservado cuando nos envíes esta solicitud. Elige cómo prefieres mandarla:',en:'Your slot is reserved once you send this request. Choose how to send it:'},se_wa:{es:'Enviar por WhatsApp',en:'Send via WhatsApp'},se_mail:{es:'Enviar por correo',en:'Send via email'},se_back:{es:'← Cambiar día u hora',en:'← Change day or time'},
    meet30:{es:'Reunión de 30 minutos · sin costo',en:'30-minute meeting · free'},
    foot:{es:'Marketing Digital · Estrategias que convierten',en:'Digital Marketing · Strategies that convert'},foot_priv:{es:'Política de privacidad',en:'Privacy policy'},
    ph_name:{es:'Tu nombre',en:'Your name'},ph_wa:{es:'Tu WhatsApp',en:'Your WhatsApp'},ph_biz:{es:'Nombre de tu negocio',en:'Your business name'},ph_city:{es:'Tu ciudad',en:'Your city'},ph_mail:{es:'Tu correo',en:'Your email'},ph_msg:{es:'¿Qué necesitas?',en:'What do you need?'},
    see_ex:{es:'Ver ejemplo',en:'See example'},pill_ready:{es:'EJEMPLO LISTO',en:'EXAMPLE READY'},pill_dev:{es:'EN DESARROLLO',en:'IN PROGRESS'},
    ideal:{es:'Ideal para',en:'Ideal for'},inc_t:{es:'TODO LO QUE INCLUYE',en:'EVERYTHING INCLUDED'},g_t:{es:'Te ponemos en Google',en:'We get you on Google'},badge_iso:{es:'Datos de cada negocio, aislados',en:'Each business keeps its own isolated data'},slot_call:{es:'Llamada',en:'Phone call'},slot_video:{es:'Videollamada',en:'Video call'},
    live_note:{es:'Prototipo en vivo · se ejecuta aquí mismo',en:'Live prototype · runs right here'},shots_note:{es:'pantallazos · desliza para ver el sitio',en:'screenshots · swipe to browse the site'},
    btn_quote:{es:'Cotizar por WhatsApp',en:'Quote on WhatsApp'},btn_more:{es:'Saber más por WhatsApp',en:'Learn more on WhatsApp'},btn_full:{es:'Ver en pantalla completa',en:'View full screen'},btn_site:{es:'Ver sitio completo',en:'View full site'},btn_open:{es:'Abrir prototipo',en:'Open prototype'},btn_crm:{es:'Ver CRM y campañas',en:'See CRM & campaigns'},
    online:{es:'en línea',en:'online'}
  };
  var TR = {
    cats:{todos:{label:'All'},vitrina:{label:'Catalog'},cocina:{label:'Food'},consultorios:{label:'Clinics'},veterinaria:{label:'Vets'},barberia:{label:'Barbershops'},reformas:{label:'Services'},contadores:{label:'Accountants'}},
    sectors:{
      cocina:{label:'RESTAURANTS & FOOD',title:'KEYS Restaurants',item0:'Take orders with no commissions'},
      'consultorio-landing':{label:'PROFESSIONALS & CLINICS',title:'KEYS Clinic',item0:'Clients book themselves, anytime'},
      odontologia:{"label": "DENTISTRY", "title": "KEYS Dentistry", "item0": "Online booking 24 hours a day"},
      vitrina:{label:'BEAUTY & SPA',title:'KEYS Beauty',item0:'Sell without having to be available'},
      reformas:{label:'SERVICE PLATFORM',title:'KEYS Services',item0:'A cover that builds trust and a work gallery'},
      contadores:{label:'ACCOUNTANTS & FINANCE',title:'KEYS Accountants',item0:'Clients upload documents without WhatsApp'}
    },
    projects:{
      vitrina:{sector:'ONLINE CATALOG',title:'Online catalog',status:'Example',desc:'Your catalog online so clients see your products, order them on WhatsApp and come back to buy. You sell at any hour, without having to be available, and your business projects a professional, trustworthy image.',applies:['Barbershop','Nails','Brows','Lashes','Spa','Facial aesthetics','Body aesthetics','Beauty salons'],features:['Your clients buy from their phone, at any hour','Orders arrive straight to your WhatsApp, no middlemen','Your business looks tidy and professional','You control products, orders and sales from one panel'],includes:['Product catalog with photos and prices','Orders go straight to your WhatsApp','Panel to manage products and orders','Professional design adapted to your brand','Looks perfect on phone and computer','Fast and secure loading','WhatsApp button always in view','Easy to update whenever you need','Ongoing guidance and support','Your own domain (yourbusiness.com)'],google:['We create and optimize your Google profile (Google Business)','You show up on Google Maps with photos, hours and reviews','We work your ranking so people find you when they search your service on Google']},
      cocina:{sector:'ORDERS & DELIVERY',title:'Restaurant platform',status:'Example',desc:'Your own orders and delivery channel, without paying commissions to third parties. Your clients see the menu, order and pay, while you get everything organized. More orders, fewer calls and a tidier operation.',applies:['Restaurants','Ghost kitchens','Fast food','Delivery','Desserts & bakery','Coffee shops'],features:['You get orders directly, with no platform commissions','Your clients order from their phone in minutes','You update your menu whenever you want','Everything arrives organized in your control panel'],includes:['Daily menu with photos and descriptions','Panel to receive and organize orders','Professional design adapted to your brand','Looks perfect on phone and computer','Fast and secure loading','WhatsApp button always in view','Easy to update whenever you need','Ongoing guidance and support','Your own domain (yourbusiness.com)'],google:['We create and optimize your Google profile (Google Business)','You show up on Google Maps with photos, hours and reviews','We work your ranking so people find you when they search your service on Google']},
      'consultorio-landing':{sector:'PROFESSIONALS & CLINICS',title:'Professional website',status:'Example',desc:'A page that builds trust and turns visits into appointments. Your clients learn your services, see your prices and book online or message you on WhatsApp, with no calls or waiting. Your professional presence, available 24/7.',applies:['Medical offices','Dentistry','Psychology','Physiotherapy','Nutrition','Independent professionals'],features:['You make a great first impression and build trust','Your clients book themselves, at any hour','Fewer calls: the information is clear on the page','You show up online when people search for you'],includes:['Online appointment booking','Services and pricing section','Visit and results tracking','Professional design adapted to your brand','Looks perfect on phone and computer','Fast and secure loading','WhatsApp button always in view','Easy to update whenever you need','Ongoing guidance and support','Your own domain (yourbusiness.com)'],google:['We create and optimize your Google profile (Google Business)','You show up on Google Maps with photos, hours and reviews','We work your ranking so people find you when they search your service on Google']},
      odontologia:{"sector": "DENTAL CLINIC", "title": "Dental clinic", "status": "Example", "desc": "A complete website for a dental practice: services explained in detail, a guide so patients know which appointment to book, before-and-after cases and online booking. Patients book on their own, at any hour, and the practice organizes its schedule from a panel.", "applies": ["General dentistry", "Orthodontics", "Cosmetic dentistry", "Pediatric dentistry", "Dental clinics", "Specialists"], "features": ["Your patients book at any hour, even when the practice is closed", "A quick guide tells them which service to book", "Before-and-after cases that build trust", "Your team sees and organizes the schedule from a panel"], "includes": ["Services explained in detail, with filters", "Online booking with a panel for the team", "Before-and-after comparison", "WhatsApp with a ready message for each service", "Accessibility options (text size and contrast)", "Cookie notice and privacy policy", "Professional design adapted to your brand", "Looks perfect on phone and computer", "Fast and secure loading", "Your own domain (yourbusiness.com)"], "google": ["We create and optimize your Google profile (Google Business)", "You show up on Google Maps with photos, hours and reviews", "We work your ranking so people find you when they search your service on Google"]},
      veterinaria:{"sector": "VETERINARY CLINIC", "title": "Veterinary clinic", "status": "Example", "desc": "A website for a veterinary clinic with 24-hour online booking. Owners choose the species, service, professional and time, and if they describe an emergency the page does not book it: it sends them to urgent care, handled by priority. The team sees appointments and the urgent-care queue in a panel.", "applies": ["Veterinary clinics", "Veterinary offices", "Animal hospitals", "Pet grooming", "Home-visit vets"], "features": ["Owners book at any hour, even when the clinic is closed", "Emergencies are not booked: they enter a priority queue", "A quick guide tells them which appointment their pet needs", "Your team sees appointments and emergencies in a panel"], "includes": ["Booking by species, service, professional and time", "Emergency intake with priority", "Services with filters and sample prices", "Before-and-after comparison", "Team presentation", "WhatsApp button always in view", "Cookie notice and privacy policy", "Professional design adapted to your brand", "Looks perfect on phone and computer", "Your own domain (yourbusiness.com)"], "google": ["We create and optimize your Google profile (Google Business)", "You show up on Google Maps with photos, hours and reviews", "We work your ranking so people find you when they search your service on Google"]},
      barberia:{"sector": "BARBERSHOP", "title": "Barbershop with online booking", "status": "Example", "desc": "A website for a barbershop with online booking connected to a real database. Clients choose the service and the barber, see prices and promotions, and book in under a minute. They can also change or cancel their appointment without calling, and the team signs in to its panel with a username and password.", "applies": ["Barbershops", "Hair salons", "Beauty salons", "Men's spa", "Beard studios"], "features": ["Your clients book on their own, at any hour", "They choose the service and the barber they prefer", "They change or cancel their appointment without calling", "Your team signs in to its panel with a username and password"], "includes": ["Service menu with prices and duration", "Promotions featured on the home page", "Online booking connected to a database", "Team presentation", "Client reviews", "Map, hours and contact", "WhatsApp button always in view", "Professional design adapted to your brand", "Looks perfect on phone and computer", "Your own domain (yourbusiness.com)"], "google": ["We create and optimize your Google profile (Google Business)", "You show up on Google Maps with photos, hours and reviews", "We work your ranking so people find you when they search your service on Google"]},
      'consultorio-gestion':{sector:'SCHEDULING & MANAGEMENT',title:'Booking & appointment system',status:'Example',desc:'A tool to organize your appointments and stop wasting time coordinating by message. Each role has its own view, reminders cut no-shows and you keep control of your schedule in one place.',applies:['Clinics','Barbershops','Salons & spa','Aesthetic centers','Appointment-based professionals'],features:['Fewer no-shows thanks to automatic reminders','Your team and your clients see an up-to-date schedule','You save time: less manual coordination','Your entire appointment history in one place'],includes:['Separate view for each role: admin, professional and client','Automatic reminders to reduce no-shows','Control of appointments, time and income','Private, secure access for your team','Professional design adapted to your brand','Looks perfect on phone and computer','Fast and secure loading','WhatsApp button always in view','Easy to update whenever you need','Ongoing guidance and support']},
      reformas:{sector:'SERVICE PLATFORM',title:'Service platform',status:'Example',desc:'A complete website so a service business looks professional, builds trust and gets more requests. It presents your offer, shows your work with photos, lets clients book visits and message you on WhatsApp. We adapt it to your brand and the services you offer.',applies:['Remodeling','Construction','Maintenance','Plumbing','Electrical','Carpentry','Gardening','Home services'],features:['A cover that presents your business and builds trust','Service catalog with photos of your work','Interactive before-and-after gallery','Visit booking and direct WhatsApp contact','Testimonials and coverage area'],includes:['Professional design adapted to your brand','Looks perfect on phone and computer','Fast and secure loading','Spanish and English versions','Contact and quote form','WhatsApp button always in view','Your own domain (yourbusiness.com)','Visit and results tracking','Easy to update whenever you need','Ongoing guidance and support'],google:['We create and optimize your Google profile (Google Business)','You show up on Google Maps with photos, hours and reviews','We work your ranking so people find you when they search your service on Google']},
      contadores:{sector:'ACCOUNTANTS & FINANCE',title:'Portal for accountants & clients',status:'Example',desc:'A web platform where your clients upload their documents and track the status of their tax return, while you manage everything from one panel. Fewer WhatsApp messages, fewer lost papers and a service that looks professional. It can also include financial tools for your clients. We adapt it to your brand.',applies:['Independent accountants','Accounting firms','Tax advisors','Tax returns','Accounting outsourcing','Financial advisors'],features:['Your clients create an account and upload documents from their phone','They check in 30 seconds whether they must file a return','They follow their return step by step','Tax calendar with deadlines and reminders','A panel with all your clients and their documents','Messaging with your clients inside the platform'],includes:['Professional design with your brand','Looks perfect on phone and computer','Secure access with username and password','Each client only sees their own documents','Document upload organized by category','Status and progress per client','Tax calendar and priorities','Automatic reminders to your clients','Custom financial tools and calculators','Ongoing guidance and support'],google:['We create and optimize your Google profile (Google Business)','You show up on Google Maps with photos, hours and reviews','We work your ranking so people find you when they search your service on Google']}
    }
  };
  var MSGS = {
    'Cargando horarios…':'Loading times…','Guardando tu reserva…':'Saving your booking…',
    'Por ahora no hay horarios libres. Escríbenos por WhatsApp y lo resolvemos.':'No free times right now. Message us on WhatsApp and we’ll sort it out.',
    'No pudimos cargar la agenda en vivo. Igual puedes enviar tu solicitud por WhatsApp o correo.':'We couldn’t load the live schedule. You can still send your request via WhatsApp or email.',
    'Elige un día y una hora para tu reunión.':'Pick a day and time for your meeting.',
    'Escribe tu nombre.':'Enter your name.',
    'Escribe un número de WhatsApp válido.':'Enter a valid WhatsApp number.',
    'Revisa tu correo: parece incompleto.':'Check your email: it looks incomplete.',
    'Escribe tu correo para poder enviarte promociones por ahí.':'Enter your email so we can send promotions there.',
    'Marca la autorización de datos para poder agendar tu reunión.':'Check the data authorization to book your meeting.',
    'Ese horario acaba de ocuparse. Elige otro de los que quedan libres.':'That slot was just taken. Pick another of the open ones.',
    'Revisa tu número de WhatsApp.':'Check your WhatsApp number.',
    'Ya tienes reuniones agendadas. Escríbenos por WhatsApp si necesitas otra.':'You already have meetings booked. Message us on WhatsApp if you need another.',
    'Escribe tu nombre completo.':'Enter your full name.',
    'No pudimos guardar tu reserva. Escríbenos por WhatsApp y la agendamos por ahí.':'We couldn’t save your booking. Message us on WhatsApp and we’ll book it there.'
  };
  function dv(group, id, field, fallback) { if (LANG === 'en' && TR[group] && TR[group][id] && TR[group][id][field] != null) return TR[group][id][field]; return fallback; }
  function TT(k) { var o = T[k]; return o ? (o[LANG] || o.es) : k; }

  document.querySelectorAll('[data-wa]').forEach(function (a) { a.href = waLink(a.getAttribute('data-wa')); });

  var UTM = (function () {
    var q = new URLSearchParams(location.search);
    return { source: q.get('utm_source') || '', medium: q.get('utm_medium') || '', campaign: q.get('utm_campaign') || '' };
  })();
  var PAGINA = location.href.slice(0, 300);

  /* ---------- Prototipos y sectores ---------- */
  var vit = CFG.DEMO_VITRINA
    ? [{ label: 'Ver vitrina', href: CFG.DEMO_VITRINA, ext: true }]
    : [{ label: 'Pedir demo de la vitrina', href: '#agenda', ext: false }];

  var PROJECTS = [
    { id: 'vitrina', cat: 'vitrina', sector: 'CATÁLOGO VIRTUAL', embed: 'demos/belleza.html', title: 'Catálogo virtual', status: 'Ejemplo', ready: true, url: 'ejemplo · catalogo-virtual', shot: '', site: 'https://vitrinavirtual.netlify.app/',
      desc: 'Tu catálogo en línea para que tus clientes vean tus productos, los pidan por WhatsApp y vuelvan a comprar. Vendes a cualquier hora, sin depender de estar disponible, y tu negocio proyecta una imagen profesional que genera confianza.',
      applies: ['Barbería', 'Uñas', 'Cejas', 'Pestañas', 'Spa', 'Estética facial', 'Estética corporal', 'Salones de belleza'],
      features: ['Tus clientes compran desde el celular, a cualquier hora', 'Los pedidos llegan directo a tu WhatsApp, sin intermediarios', 'Tu negocio se ve ordenado y profesional', 'Controlas productos, pedidos y ventas desde un panel'], shots: ['img/prototipos/vitrina-1.webp',
'img/prototipos/vitrina-2.webp',
'img/prototipos/vitrina-3.webp',
'img/prototipos/vitrina-4.webp',
'img/prototipos/vitrina-5.webp',
'img/prototipos/vitrina-6.webp',
'img/prototipos/vitrina-7.webp',
'img/prototipos/vitrina-8.webp',
'img/prototipos/vitrina-9.webp',
'img/prototipos/vitrina-10.webp',
'img/prototipos/vitrina-11.webp'], includes: ["Catálogo de productos con fotos y precios", "Pedidos directos a tu WhatsApp", "Panel para administrar productos y pedidos", "Diseño profesional adaptado a tu marca", "Se ve perfecto en celular y computador", "Carga rápida y segura", "Botón de WhatsApp siempre a la vista", "Fácil de actualizar cuando lo necesites", "Acompañamiento y soporte continuo", "Tu propio dominio (tunegocio.com)"], google: ["Creamos y optimizamos tu perfil de Google (Google Business)", "Apareces en Google Maps con fotos, horarios y reseñas", "Trabajamos tu posicionamiento para que te encuentren cuando buscan tu servicio en Google"],
      links: [{ label: 'Ver catálogo', href: 'demos/belleza.html', ext: true }] },
    { id: 'cocina', cat: 'cocina', sector: 'RESTAURANTES Y DOMICILIOS', title: 'Plataforma para restaurantes', status: 'Ejemplo', ready: true, url: 'ejemplo · pedidos-y-domicilios', shot: '',
      desc: 'Tu propio canal de pedidos y domicilios, sin pagar comisiones a terceros. Tus clientes ven el menú, piden y pagan, mientras tú recibes todo organizado. Más pedidos, menos llamadas y una operación más ordenada.',
      applies: ['Restaurantes', 'Cocinas ocultas', 'Comidas rápidas', 'Domicilios', 'Postres y repostería', 'Cafeterías'],
      features: ['Recibes pedidos directos, sin comisiones de plataformas', 'Tus clientes piden desde el celular en minutos', 'Actualizas tu menú cuando quieras', 'Todo llega organizado a tu panel de control'], shots: ["img/prototipos/cocina-1.webp","img/prototipos/cocina-2.webp","img/prototipos/cocina-3.webp","img/prototipos/cocina-4.webp","img/prototipos/cocina-5.webp"], includes: ["Menú del día con fotos y descripción", "Panel para recibir y organizar los pedidos", "Diseño profesional adaptado a tu marca", "Se ve perfecto en celular y computador", "Carga rápida y segura", "Botón de WhatsApp siempre a la vista", "Fácil de actualizar cuando lo necesites", "Acompañamiento y soporte continuo", "Tu propio dominio (tunegocio.com)"], google: ["Creamos y optimizamos tu perfil de Google (Google Business)", "Apareces en Google Maps con fotos, horarios y reseñas", "Trabajamos tu posicionamiento para que te encuentren cuando buscan tu servicio en Google"],
      embed: 'demos/cocina-oculta.html', links: [{ label: 'Ver prototipo', href: 'demos/cocina-oculta.html', ext: true }] },
    { id: 'consultorio-landing', cat: 'consultorios', sector: 'PROFESIONALES Y CONSULTORIOS', title: 'Página web profesional', status: 'Ejemplo', ready: true, url: 'ejemplo · pagina-profesional', shot: '', site: 'https://silver-bubblegum-ea769c.netlify.app/#faq',
      desc: 'Una página que transmite confianza y convierte visitas en citas. Tus clientes conocen tus servicios, ven tus precios y agendan en línea o te escriben por WhatsApp, sin llamadas ni esperas. Tu presencia profesional, disponible las 24 horas.',
      applies: ['Consultorios médicos', 'Odontología', 'Psicología', 'Fisioterapia', 'Nutrición', 'Profesionales independientes'],
      features: ['Causas una buena primera impresión y generas confianza', 'Tus clientes agendan solos, a cualquier hora', 'Menos llamadas: la información está clara en la página', 'Apareces en internet cuando te buscan'], shots: ["img/prototipos/consultorio-landing-1.webp", "img/prototipos/consultorio-landing-2.webp", "img/prototipos/consultorio-landing-3.webp", "img/prototipos/consultorio-landing-4.webp", "img/prototipos/consultorio-landing-5.webp", "img/prototipos/consultorio-landing-6.webp", "img/prototipos/consultorio-landing-7.webp", "img/prototipos/consultorio-landing-8.webp"], includes: ["Agenda de citas en línea", "Sección de servicios y precios", "Medición de visitas y resultados", "Diseño profesional adaptado a tu marca", "Se ve perfecto en celular y computador", "Carga rápida y segura", "Botón de WhatsApp siempre a la vista", "Fácil de actualizar cuando lo necesites", "Acompañamiento y soporte continuo", "Tu propio dominio (tunegocio.com)"], google: ["Creamos y optimizamos tu perfil de Google (Google Business)", "Apareces en Google Maps con fotos, horarios y reseñas", "Trabajamos tu posicionamiento para que te encuentren cuando buscan tu servicio en Google"],
      embed: 'demos/consultorio-landing.html', links: [{ label: 'Ver landing', href: 'demos/consultorio-landing.html', ext: true }] },
    { id: 'odontologia', cat: 'consultorios', sector: "CONSULTORIO ODONTOLÓGICO", title: "Consultorio odontológico", status: 'Ejemplo', ready: true, url: 'ejemplo · consultorio-odontologico', shot: '', site: 'demos/odontologia/index.html',
      desc: "Una página completa para un consultorio odontológico: servicios explicados en detalle, una guía para que el paciente sepa qué cita pedir, casos de antes y después y agenda en línea. El paciente reserva solo, a cualquier hora, y el consultorio organiza su agenda desde un panel.",
      applies: ["Odontología general", "Ortodoncia", "Estética dental", "Odontopediatría", "Clínicas dentales", "Especialistas"],
      features: ["Tus pacientes reservan su cita a cualquier hora, incluso con el consultorio cerrado", "Una guía rápida les dice qué servicio pedir", "Casos de antes y después que generan confianza", "Tu equipo ve y organiza la agenda desde un panel"], shots: ["img/prototipos/odontologia-1.webp", "img/prototipos/odontologia-2.webp", "img/prototipos/odontologia-3.webp", "img/prototipos/odontologia-4.webp", "img/prototipos/odontologia-5.webp", "img/prototipos/odontologia-6.webp", "img/prototipos/odontologia-7.webp"], includes: ["Servicios explicados en detalle, con filtros", "Agenda en línea con panel para el equipo", "Comparador de antes y después", "WhatsApp con mensaje listo para cada servicio", "Opciones de accesibilidad (tamaño de letra y contraste)", "Aviso de cookies y política de privacidad", "Diseño profesional adaptado a tu marca", "Se ve perfecto en celular y computador", "Carga rápida y segura", "Tu propio dominio (tunegocio.com)"], google: ["Creamos y optimizamos tu perfil de Google (Google Business)", "Apareces en Google Maps con fotos, horarios y reseñas", "Trabajamos tu posicionamiento para que te encuentren cuando buscan tu servicio en Google"],
      embed: 'demos/odontologia/index.html', links: [{ label: 'Ver landing', href: 'demos/odontologia/index.html', ext: true }, { label: 'Ver agenda', href: 'demos/odontologia/agenda/index.html', ext: true }] },
    { id: 'veterinaria', cat: 'veterinaria', sector: "CLÍNICA VETERINARIA", title: "Clínica veterinaria", status: 'Ejemplo', ready: true, url: 'ejemplo · clinica-veterinaria', shot: '', site: 'demos/veterinaria/index.html',
      desc: "Una página para una clínica veterinaria con agenda en línea las 24 horas. El dueño elige la especie, el servicio, el profesional y la hora, y si describe una emergencia la página no la agenda: lo manda a urgencias, que se atienden por prioridad. El equipo ve las citas y la cola de urgencias en un panel.",
      applies: ["Clínicas veterinarias", "Consultorios veterinarios", "Hospitales veterinarios", "Peluquería y estética de mascotas", "Veterinarios a domicilio"],
      features: ["Los dueños reservan a cualquier hora, incluso con la clínica cerrada", "Las emergencias no se agendan: entran a una cola por prioridad", "Una guía rápida les dice qué cita necesita su mascota", "Tu equipo ve las citas y las urgencias en un panel"], shots: ["img/prototipos/veterinaria-v2-1.webp", "img/prototipos/veterinaria-v2-2.webp", "img/prototipos/veterinaria-v2-3.webp", "img/prototipos/veterinaria-v2-4.webp", "img/prototipos/veterinaria-v2-5.webp", "img/prototipos/veterinaria-v2-6.webp", "img/prototipos/veterinaria-v2-7.webp", "img/prototipos/veterinaria-v2-8.webp"], includes: ["Agenda por especie, servicio, profesional y hora", "Registro de urgencias con prioridad", "Servicios con filtros y precios de ejemplo", "Comparador de antes y después", "Presentación del equipo", "Botón de WhatsApp siempre a la vista", "Aviso de cookies y política de privacidad", "Diseño profesional adaptado a tu marca", "Se ve perfecto en celular y computador", "Tu propio dominio (tunegocio.com)"], google: ["Creamos y optimizamos tu perfil de Google (Google Business)", "Apareces en Google Maps con fotos, horarios y reseñas", "Trabajamos tu posicionamiento para que te encuentren cuando buscan tu servicio en Google"],
      embed: 'demos/veterinaria/index.html', links: [{ label: 'Ver landing', href: 'demos/veterinaria/index.html', ext: true }, { label: 'Ver agenda', href: 'demos/veterinaria/agenda/index.html', ext: true }] },
    { id: 'barberia', cat: 'barberia', sector: "BARBERÍA", title: "Barbería con agenda en línea", status: 'Ejemplo', ready: true, url: 'ejemplo · barberia', shot: '', site: 'https://barber-keys.netlify.app/',
      desc: "Una página para una barbería con agenda en línea conectada a una base de datos real. El cliente elige el servicio y el barbero, ve los precios y las promociones, y reserva en menos de un minuto. También puede cambiar o cancelar su cita sin llamar, y el equipo entra a su panel con usuario y contraseña.",
      applies: ["Barberías", "Peluquerías", "Salones de belleza", "Spa para hombres", "Estudios de barba"],
      features: ["Tus clientes reservan solos, a cualquier hora", "Eligen el servicio y el barbero que prefieren", "Cambian o cancelan su cita sin llamar", "Tu equipo entra a su panel con usuario y contraseña"], shots: ["img/prototipos/barberia-v2-1.webp", "img/prototipos/barberia-v2-2.webp", "img/prototipos/barberia-v2-3.webp", "img/prototipos/barberia-v2-4.webp", "img/prototipos/barberia-v2-5.webp", "img/prototipos/barberia-v2-6.webp", "img/prototipos/barberia-v2-7.webp", "img/prototipos/barberia-v2-8.webp"], includes: ["Carta de servicios con precios y duración", "Promociones destacadas en la portada", "Agenda en línea conectada a base de datos", "Presentación del equipo", "Reseñas de clientes", "Mapa, horario y contacto", "Botón de WhatsApp siempre a la vista", "Diseño profesional adaptado a tu marca", "Se ve perfecto en celular y computador", "Tu propio dominio (tunegocio.com)"], google: ["Creamos y optimizamos tu perfil de Google (Google Business)", "Apareces en Google Maps con fotos, horarios y reseñas", "Trabajamos tu posicionamiento para que te encuentren cuando buscan tu servicio en Google"],
      links: [{ label: 'Ver sitio', href: 'https://barber-keys.netlify.app/', ext: true }] },
    { id: 'consultorio-gestion', cat: 'consultorios', sector: 'AGENDA Y GESTIÓN', title: 'Sistema de agenda y citas', status: 'Ejemplo', ready: true, url: 'ejemplo · agenda-y-citas', shot: '',
      desc: 'Una herramienta para ordenar tus citas y dejar de perder tiempo coordinando por mensajes. Cada rol tiene su vista, los recordatorios reducen las inasistencias y tienes el control de tu agenda en un solo lugar.',
      applies: ['Consultorios', 'Barberías', 'Salones y spa', 'Centros de estética', 'Profesionales con cita previa'],
      features: ['Menos inasistencias gracias a los recordatorios automáticos', 'Tu equipo y tus clientes ven la agenda al día', 'Ahorras tiempo: menos coordinación manual', 'Todo tu historial de citas en un solo lugar'], shots: ['img/prototipos/consultorio-gestion-1.webp',
'img/prototipos/consultorio-gestion-2.webp',
'img/prototipos/consultorio-gestion-3.webp',
'img/prototipos/consultorio-gestion-4.webp',
'img/prototipos/consultorio-gestion-5.webp',
'img/prototipos/consultorio-gestion-6.webp',
'img/prototipos/consultorio-gestion-7.webp',
'img/prototipos/consultorio-gestion-8.webp',
'img/prototipos/consultorio-gestion-9.webp',
'img/prototipos/consultorio-gestion-10.webp',
'img/prototipos/consultorio-gestion-11.webp',
'img/prototipos/consultorio-gestion-12.webp',
'img/prototipos/consultorio-gestion-13.webp',
'img/prototipos/consultorio-gestion-14.webp',
'img/prototipos/consultorio-gestion-15.webp',
'img/prototipos/consultorio-gestion-16.webp',
'img/prototipos/consultorio-gestion-17.webp',
'img/prototipos/consultorio-gestion-18.webp',
'img/prototipos/consultorio-gestion-19.webp',
'img/prototipos/consultorio-gestion-20.webp'], includes: ["Vista separada para cada rol: administrador, profesional y cliente", "Recordatorios automáticos para reducir inasistencias", "Control de citas, tiempos e ingresos", "Acceso privado y seguro para tu equipo", "Diseño profesional adaptado a tu marca", "Se ve perfecto en celular y computador", "Carga rápida y segura", "Botón de WhatsApp siempre a la vista", "Fácil de actualizar cuando lo necesites", "Acompañamiento y soporte continuo"],
      site: 'https://silver-bubblegum-ea769c.netlify.app/', embed: 'demos/consultorio-gestion.html', links: [{ label: 'Ver demo', href: 'demos/consultorio-gestion.html', ext: true }] },
    { id: 'reformas', cat: 'reformas', sector: 'PLATAFORMA DE SERVICIOS', title: 'Plataforma para servicios', status: 'Ejemplo', ready: true, site: 'https://reformasycocinassj.com', url: 'ejemplo · plataforma-de-servicios', shot: '', shots: ['img/prototipos/reformas-1.webp','img/prototipos/reformas-2.webp','img/prototipos/reformas-3.webp','img/prototipos/reformas-4.webp','img/prototipos/reformas-5.webp','img/prototipos/reformas-6.webp','img/prototipos/reformas-7.webp','img/prototipos/reformas-8.webp','img/prototipos/reformas-9.webp','img/prototipos/reformas-10.webp','img/prototipos/reformas-11.webp'],
      desc: 'Un sitio web completo para que un negocio de servicios se vea profesional, genere confianza y reciba más solicitudes. Presenta tu oferta, muestra tus trabajos con fotos, deja que tus clientes agenden visitas y te escriban por WhatsApp. Lo adaptamos a tu marca y a los servicios que ofreces.',
      applies: ['Reformas y remodelación', 'Construcción', 'Mantenimiento', 'Plomería', 'Electricidad', 'Carpintería', 'Jardinería', 'Servicios para el hogar'],
      features: ['Portada que presenta tu negocio y genera confianza', 'Catálogo de servicios con fotos de tus trabajos', 'Galería interactiva de antes y después', 'Agenda de visitas y contacto directo por WhatsApp', 'Testimonios y zona de cobertura'],
      includes: ['Diseño profesional adaptado a tu marca', 'Se ve perfecto en celular y computador', 'Carga rápida y segura', 'Versión en español e inglés', 'Formulario de contacto y cotización', 'Botón de WhatsApp siempre a la vista', 'Tu propio dominio (tunegocio.com)', 'Medición de visitas y resultados', 'Fácil de actualizar cuando lo necesites', 'Acompañamiento y soporte continuo'],
      google: ['Creamos y optimizamos tu perfil de Google (Google Business)', 'Apareces en Google Maps con fotos, horarios y reseñas', 'Trabajamos tu posicionamiento para que te encuentren cuando buscan tu servicio en Google'],
      embed: 'demos/reformas.html', links: [{ label: 'Ver sitio completo', href: 'demos/reformas.html', ext: true }] },
    { id: 'contadores', cat: 'contadores', sector: 'CONTADORES Y FINANZAS', title: 'Portal para contadores y sus clientes', status: 'Ejemplo', ready: true, url: 'ejemplo · portal-contable', shot: '', site: 'https://mecsolucionescontables.netlify.app/', shots: ['img/prototipos/contadores-1.webp','img/prototipos/contadores-2.webp','img/prototipos/contadores-3.webp','img/prototipos/contadores-4.webp','img/prototipos/contadores-5.webp','img/prototipos/contadores-6.webp','img/prototipos/contadores-7.webp','img/prototipos/contadores-8.webp','img/prototipos/contadores-9.webp'],
      desc: 'Una plataforma web donde tus clientes suben sus documentos y siguen el estado de su declaración de renta, mientras tú gestionas todo desde un solo panel. Menos mensajes por WhatsApp, menos papeles perdidos y un servicio que se ve profesional. También puede incluir herramientas financieras para tus clientes. La adaptamos a tu marca.',
      applies: ['Contadores independientes', 'Firmas contables', 'Asesores tributarios', 'Declaración de renta', 'Outsourcing contable', 'Asesores financieros'],
      features: ['Tus clientes crean su cuenta y cargan sus documentos desde el celular', 'Verifican en 30 segundos si deben declarar renta', 'Siguen el avance de su declaración paso a paso', 'Calendario tributario con fechas límite y recordatorios', 'Panel con todos tus clientes y su documentación', 'Mensajes con tus clientes dentro de la plataforma'],
      includes: ['Diseño profesional con tu marca', 'Se ve perfecto en celular y computador', 'Acceso seguro con usuario y contraseña', 'Cada cliente solo ve sus propios documentos', 'Carga de documentos organizada por categorías', 'Estado y avance del proceso por cliente', 'Calendario tributario y prioridades', 'Recordatorios automáticos a tus clientes', 'Herramientas y calculadoras financieras a tu medida', 'Acompañamiento y soporte continuo'],
      google: ['Creamos y optimizamos tu perfil de Google (Google Business)', 'Apareces en Google Maps con fotos, horarios y reseñas', 'Trabajamos tu posicionamiento para que te encuentren cuando buscan tu servicio en Google'],
      links: [{ label: 'Quiero saber más', href: '#agenda', ext: false }] }
  ];
  var CATS = [['todos', 'Todos'], ['vitrina', 'Catálogo'], ['cocina', 'Cocina'], ['consultorios', 'Consultorios'], ['veterinaria', 'Veterinarias'], ['barberia', 'Barberías'], ['reformas', 'Servicios'], ['contadores', 'Contadores']];
  var SECTORS = [
    { label: 'RESTAURANTES Y COCINAS', title: 'KEYS Restaurantes', ready: true, mont: 'Montaje: 10 días hábiles', cat: 'cocina', id: 'cocina', cta: 'Ver ejemplo',
      desc: 'Tu propio canal de pedidos y domicilios, sin comisiones. Más pedidos y una operación más ordenada.',
      items: ['Recibes pedidos sin pagar comisiones', 'Tus clientes piden desde el celular', 'Controlas todo desde un panel'] },
    { label: 'PROFESIONALES Y CONSULTORIOS', title: 'KEYS Consulta', ready: true, mont: 'Montaje: 10 días hábiles', cat: 'consultorios', id: 'consultorio-landing', cta: 'Ver ejemplo',
      desc: 'Una página que convierte visitas en citas y una agenda que reduce las inasistencias.',
      items: ['Tus clientes agendan solos, a cualquier hora', 'Recordatorios que reducen inasistencias', 'Generas confianza y presencia profesional'] },
    { label: "ODONTOLOGÍA", title: "KEYS Odontología", ready: true, mont: 'Montaje: 10 días hábiles', cat: 'consultorios', id: 'odontologia', cta: 'Ver ejemplo',
      desc: "Una página y una agenda en línea para que tus pacientes reserven su cita a cualquier hora.",
      items: ["Reserva en línea las 24 horas", "Casos de antes y después", "Contacto directo por WhatsApp"] },
    { label: 'BELLEZA Y SPA', title: 'KEYS Belleza', ready: true, mont: 'Montaje: 10 días hábiles', cat: 'vitrina', id: 'vitrina', cta: 'Ver ejemplo',
      desc: 'Un catálogo para vender y recibir pedidos desde el celular, a cualquier hora.',
      items: ['Vendes sin depender de estar disponible', 'Pedidos directos a tu WhatsApp', 'Imagen profesional que genera confianza'] },
    { label: 'PLATAFORMA DE SERVICIOS', title: 'KEYS Servicios', ready: true, mont: 'Montaje: 10 días hábiles', cat: 'reformas', id: 'reformas', cta: 'Ver ejemplo',
      desc: 'Un sitio web completo para negocios de servicios: presenta tu oferta, muestra tus trabajos y recibe solicitudes.',
      items: ['Portada que genera confianza y galería de trabajos', 'Agenda de visitas en línea', 'Contacto directo por WhatsApp'] },
    { label: 'CONTADORES Y FINANZAS', title: 'KEYS Contadores', ready: true, mont: 'Montaje: según alcance', cat: 'contadores', id: 'contadores', cta: 'Ver ejemplo',
      desc: 'Una plataforma para que tus clientes carguen sus documentos y sigas cada declaración desde un solo panel, con herramientas financieras.',
      items: ['Tus clientes suben sus documentos sin enviarlos por WhatsApp', 'Seguimiento del avance de cada declaración', 'Calendario tributario y recordatorios automáticos'] }
  ];

  var view = { filter: 'todos', selected: 'vitrina', embedOpen: null };

  function renderSectors() {
    $('sectors').innerHTML = SECTORS.map(function (s, i) {
      return '<button class="card hov" type="button" data-sector="' + i + '" style="text-align:left;padding:24px;display:flex;flex-direction:column;gap:10px;cursor:pointer;font-family:inherit;color:inherit">' +
        '<div class="sector-top"><span class="eyebrow" style="font-size:11px">' + esc(dv('sectors', s.id, 'label', s.label)) + '</span>' +
        '<span class="pill' + (s.ready ? ' ok' : '') + '">' + (s.ready ? TT('pill_ready') : TT('pill_dev')) + '</span></div>' +
        '<h3 style="font-size:21px;font-weight:600">' + esc(dv('sectors', s.id, 'title', s.title)) + '</h3>' +
        '<p style="font-size:14px;line-height:1.5;color:#9AA7BC;flex-grow:1;margin:0">' + esc(dv('sectors', s.id, 'item0', s.items[0])) + '</p>' +
        '<span class="mono" style="font-size:13px;color:var(--acc);font-weight:600">' + TT('see_ex') + ' &#8594;</span>' +
        '</button>';
    }).join('');
    $('sectors').querySelectorAll('[data-sector]').forEach(function (a) {
      a.addEventListener('click', function () {
        var s = SECTORS[+a.getAttribute('data-sector')];
        view.filter = s.cat; view.selected = s.id; view.embedOpen = null; renderProjects();
        var t = document.getElementById('proyectos'); if (t) t.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  function renderProjects() {
    var list = PROJECTS.filter(function (p) { return view.filter === 'todos' || p.cat === view.filter; });
    var sel = list.filter(function (p) { return p.id === view.selected; })[0] || list[0];
    view.selected = sel.id;

    $('chips').innerHTML = CATS.map(function (c) {
      return '<button class="chip" type="button" data-cat="' + c[0] + '" aria-pressed="' + (c[0] === view.filter) + '">' + esc(dv('cats', c[0], 'label', c[1])) + '</button>';
    }).join('');
    $('chips').querySelectorAll('.chip').forEach(function (b) {
      b.addEventListener('click', function () {
        var c = b.getAttribute('data-cat');
        view.filter = c;
        if (c !== 'todos') view.selected = PROJECTS.filter(function (p) { return p.cat === c; })[0].id;
        view.embedOpen = null;
        renderProjects();
      });
    });

    $('list').innerHTML = list.map(function (p) {
      return '<button class="item hov" type="button" data-id="' + p.id + '" aria-pressed="' + (p.id === sel.id) + '">' +
        '<span class="s mono">' + esc(dv('projects', p.id, 'sector', p.sector)) + '</span><span class="t">' + esc(dv('projects', p.id, 'title', p.title)) + '</span><span class="st">' + esc(dv('projects', p.id, 'status', p.status)) + '</span></button>';
    }).join('');
    $('list').querySelectorAll('.item').forEach(function (b) {
      b.addEventListener('click', function () { view.selected = b.getAttribute('data-id'); view.embedOpen = null; renderProjects(); });
    });

    var live = sel.embed && view.embedOpen === sel.id;
    var shots = sel.shots && sel.shots.length ? sel.shots : null;
    var shot = live
      ? '<div class="frame-wrap"><iframe class="frame" src="' + esc(sel.embed) + '" title="Prototipo: ' + esc(dv('projects', sel.id, 'title', sel.title)) + '" loading="lazy" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"></iframe></div><div class="frame-note"><b></b>' + TT('live_note') + '</div>'
      : (shots
        ? '<div class="galwrap"><div class="gal" id="gal">' + shots.map(function (u, i) { return '<img src="' + u + '" alt="Vista ' + (i + 1) + ' de ' + esc(dv('projects', sel.id, 'title', sel.title)) + '" loading="lazy" decoding="async">'; }).join('') + '</div><button class="galbtn gl" type="button" data-dir="-1" aria-label="Anterior">‹</button><button class="galbtn gr" type="button" data-dir="1" aria-label="Siguiente">›</button></div><div class="frame-note"><b></b>' + shots.length + ' ' + TT('shots_note') + '</div>'
        : (sel.shot ? '<div class="shot"><img src="' + esc(sel.shot) + '" alt="Captura de ' + esc(dv('projects', sel.id, 'title', sel.title)) + '"></div>' : '<div class="shot mono">[ CAPTURA DEL PROTOTIPO ]</div>'));
    var applies = sel.applies ? '<div class="applies"><span class="l">' + TT('ideal') + '</span><div class="tagrow">' + (dv('projects', sel.id, 'applies', sel.applies)).map(function (a) { return '<span class="tag">' + esc(a) + '</span>'; }).join('') + '</div></div>' : '';
    var featuresHtml = '<ul class="checks" style="gap:10px">' + (dv('projects', sel.id, 'features', sel.features)).map(function (f) { return '<li style="font-size:15px">' + CHECK + '<span>' + esc(f) + '</span></li>'; }).join('') + '</ul>';
    var includesHtml = sel.includes ? '<div class="inc"><span class="inc-t">' + TT('inc_t') + '</span><div class="inc-grid">' + (dv('projects', sel.id, 'includes', sel.includes)).map(function (x) { return '<div class="ii">' + CHECK + '<span>' + esc(x) + '</span></div>'; }).join('') + '</div></div>' : '';
    var googleHtml = sel.google ? '<div class="gblock"><div class="gh"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#35E5D0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z"></path><circle cx="12" cy="11" r="2.3"></circle></svg>' + TT('g_t') + '</div><ul>' + (dv('projects', sel.id, 'google', sel.google)).map(function (x) { return '<li>' + CHECK + '<span>' + esc(x) + '</span></li>'; }).join('') + '</ul></div>' : '';
    var hasExtra = !!(sel.includes || sel.google);
    $('detail').innerHTML =
      '<div class="meta"><span class="eyebrow" style="font-size:12px">' + esc(dv('projects', sel.id, 'sector', sel.sector)) + '</span><span class="pill' + (sel.ready ? ' ok' : '') + '">' + esc(dv('projects', sel.id, 'status', sel.status).toUpperCase()) + '</span></div>' +
      applies +
      '<h3>' + esc(dv('projects', sel.id, 'title', sel.title)) + '</h3><p class="d">' + esc(dv('projects', sel.id, 'desc', sel.desc)) + '</p>' +
      '<div class="dbody">' +
        '<div class="browser"><div class="browser-bar"><i></i><i></i><i></i><span class="mono">' + esc(sel.url) + '</span></div>' + shot + '</div>' +
        '<div class="dinfo">' + featuresHtml + googleHtml + includesHtml + '</div>' +
      '</div>' +
      '<div class="btns">' + (
        !sel.ready
          ? '<a class="btn btn-main btn-sm" href="' + waLink('Hola KEYS, me interesa ' + sel.title + ' (en desarrollo). Quiero saber más.') + '" target="_blank" rel="noopener">' + TT('btn_more') + '</a>'
          : '<a class="btn btn-main btn-sm" href="' + waLink('Hola KEYS, me interesó el ejemplo de ' + sel.title + '. Quiero una cotización.') + '" target="_blank" rel="noopener">' + TT('btn_quote') + '</a>' +
            (shots ? '<button class="btn btn-ghost btn-sm" type="button" data-lightbox>' + TT('btn_full') + '</button>' : '') +
            (sel.site
              ? '<a class="btn btn-ghost btn-sm" href="' + esc(sel.site) + '" target="_blank" rel="noopener">' + TT('btn_site') + '</a>'
              : (sel.embed ? '<a class="btn btn-ghost btn-sm" href="' + esc(sel.embed) + '" target="_blank" rel="noopener">' + TT('btn_open') + '</a>' : '')) +
            (sel.extra ? sel.extra.map(function (x) { return '<a class="btn btn-ghost btn-sm" href="' + esc(x.href) + '" target="_blank" rel="noopener">' + esc(x.key ? TT(x.key) : x.label) + '</a>'; }).join('') : '')
      ) + '</div>';
    var gal = $('detail').querySelector('.gal');
    if (gal) {
      $('detail').querySelectorAll('.galbtn').forEach(function (b) {
        b.addEventListener('click', function () { gal.scrollBy({ left: (+b.getAttribute('data-dir')) * gal.clientWidth, behavior: 'smooth' }); });
      });
      $('detail').querySelectorAll('.gal img').forEach(function (im, i) {
        im.addEventListener('click', function () {
          var imgs = [].map.call($('detail').querySelectorAll('.gal img'), function (x) { return x.getAttribute('src'); });
          lbOpen(imgs, i);
        });
      });
    }
    var lbBtn = $('detail').querySelector('[data-lightbox]');
    if (lbBtn) lbBtn.addEventListener('click', function () {
      var imgs = [].map.call($('detail').querySelectorAll('.gal img'), function (i) { return i.getAttribute('src'); });
      if (!imgs.length) return;
      var g = $('detail').querySelector('.gal');
      var idx = g ? Math.round(g.scrollLeft / g.clientWidth) : 0;
      lbOpen(imgs, idx);
    });
  }

  /* ---------- Agenda ---------- */
  var st = { days: [], di: 0, ti: -1, live: LIVE };
  var els = { pick: $('stepPick'), done: $('stepDone'), send: $('stepSend'), msg: $('msg'), go: $('btnGo') };

  function pad(n) { return String(n).padStart(2, '0'); }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseFecha(f) { var p = f.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2], 12); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function fmtHora(hhmm) {
    var p = hhmm.split(':').map(Number), h = p[0], m = p[1];
    return ((h % 12) || 12) + ':' + pad(m) + ' ' + (h < 12 ? (LANG==='en'?'AM':'a. m.') : (LANG==='en'?'PM':'p. m.'));
  }
  function fmtLargo(f) { return cap(parseFecha(f).toLocaleDateString(LANG==='en'?'en-US':'es-CO', { weekday: 'long', day: 'numeric', month: 'long' })); }
  function setMsg(t, isErr) { if (LANG === 'en' && MSGS[t]) t = MSGS[t]; els.msg.textContent = t || ''; els.msg.className = 'msg' + (isErr ? ' err' : ''); }

  function demoAgenda() {
    var out = [], d = new Date();
    var horasDia = ['09:00', '10:00', '11:00', '14:00', '15:00'].map(function (h) { return { h: h, t: 'llamada' }; });
    var horaNoche = { h: '20:30', t: 'videollamada' };
    d.setHours(12, 0, 0, 0);
    while (out.length < 8) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) out.push({ fecha: iso(d), horas: horasDia.concat([horaNoche]) });
    }
    return out;
  }

  function rpc(name, body) {
    var headers = { 'Content-Type': 'application/json', apikey: CFG.SUPABASE_ANON_KEY };
    if (/^eyJ/.test(CFG.SUPABASE_ANON_KEY)) headers.Authorization = 'Bearer ' + CFG.SUPABASE_ANON_KEY;
    return fetch(CFG.SUPABASE_URL + '/rest/v1/rpc/' + name, { method: 'POST', headers: headers, body: JSON.stringify(body || {}) })
      .then(function (r) {
        return r.json().catch(function () { return null; }).then(function (data) {
          if (!r.ok) { var e = new Error((data && data.message) || 'error'); e.status = r.status; throw e; }
          return data;
        });
      });
  }

  function loadAgenda() {
    setMsg('Cargando horarios…');
    var p = LIVE
      ? rpc('get_available_slots', { p_tenant_slug: CFG.TENANT_SLUG || 'keys', p_days: 21 }).then(function (rows) {
          var map = {};
          rows.forEach(function (r) { (map[r.fecha] = map[r.fecha] || []).push({ h: String(r.hora).slice(0, 5), t: r.tipo || 'llamada' }); });
          st.live = true;
          return Object.keys(map).sort().slice(0, 8).map(function (f) { return { fecha: f, horas: map[f] }; });
        })
      : Promise.resolve(demoAgenda());
    return p.then(function (days) {
      st.days = days; setMsg('');
      if (!days.length) setMsg('Por ahora no hay horarios libres. Escríbenos por WhatsApp y lo resolvemos.', true);
    }).catch(function () {
      st.live = false; st.days = demoAgenda();
      setMsg('No pudimos cargar la agenda en vivo. Igual puedes enviar tu solicitud por WhatsApp o correo.', true);
    }).then(function () { st.di = 0; st.ti = -1; renderDays(); renderTimes(); });
  }

  function renderDays() {
    $('days').innerHTML = st.days.map(function (d, i) {
      var dt = parseFecha(d.fecha);
      return '<button type="button" class="day" data-i="' + i + '" aria-pressed="' + (i === st.di) + '">' +
        '<small>' + esc(cap(dt.toLocaleDateString(LANG==='en'?'en-US':'es-CO', { weekday: 'short' }).replace('.', ''))) + '</small><b>' + dt.getDate() + '</b>' +
        '<small>' + esc(dt.toLocaleDateString(LANG==='en'?'en-US':'es-CO', { month: 'short' }).replace('.', '')) + '</small></button>';
    }).join('');
    $('days').querySelectorAll('.day').forEach(function (b) {
      b.addEventListener('click', function () { st.di = +b.getAttribute('data-i'); st.ti = -1; setMsg(''); renderDays(); renderTimes(); });
    });
  }
  function renderTimes() {
    var d = st.days[st.di];
    $('times').innerHTML = d ? d.horas.map(function (slot, i) {
      var esVideo = slot.t === 'videollamada';
      var tag = '<small class="time-tag">' + (esVideo ? '🎥 ' + TT('slot_video') : '📞 ' + TT('slot_call')) + '</small>';
      return '<button type="button" class="time' + (esVideo ? ' time-video' : '') + '" data-i="' + i + '" aria-pressed="' + (i === st.ti) + '">' + esc(fmtHora(slot.h)) + tag + '</button>';
    }).join('') : '';
    $('times').querySelectorAll('.time').forEach(function (b) {
      b.addEventListener('click', function () { st.ti = +b.getAttribute('data-i'); setMsg(''); renderTimes(); });
    });
  }

  function show(which) {
    els.pick.hidden = which !== 'pick';
    els.done.hidden = which !== 'done';
    els.send.hidden = which !== 'send';
  }

  els.pick.addEventListener('submit', function (e) {
    e.preventDefault();
    if ($('fHp').value) return;                                   // trampa para robots
    var d = st.days[st.di];
    var name = $('fName').value.trim(), wa = $('fWa').value.trim(), mail = $('fMail').value.trim();
    var biz = $('fBiz').value.trim(), tipo = $('fTipo').value, city = $('fCity').value.trim(), msg = $('fMsg').value.trim();
    var ints = Array.prototype.slice.call(document.querySelectorAll('input[name="interes"]:checked')).map(function (i) { return i.value; });
    var acDatos = $('fConsentDatos').checked, acWa = $('fConsentWa').checked, acMail = $('fConsentMail').checked;

    if (!d || st.ti < 0) return setMsg('Elige un día y una hora para tu reunión.', true);
    if (name.length < 2) return setMsg('Escribe tu nombre.', true);
    if (wa.replace(/\D/g, '').length < 7) return setMsg('Escribe un número de WhatsApp válido.', true);
    if (mail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) return setMsg('Revisa tu correo: parece incompleto.', true);
    if (acMail && !mail) return setMsg('Escribe tu correo para poder enviarte promociones por ahí.', true);
    if (!acDatos) return setMsg('Marca la autorización de datos para poder agendar tu reunión.', true);

    var slot = d.horas[st.ti];
    var hora = slot.h;
    var esVideo = slot.t === 'videollamada';
    var tipoReunion = esVideo ? TT('slot_video') : TT('slot_call');
    var cuando = fmtLargo(d.fecha) + ' · ' + fmtHora(hora) + ' · ' + tipoReunion;
    var detalle = 'Nombre: ' + name + '\nWhatsApp: ' + wa +
      (mail ? '\nCorreo: ' + mail : '') + '\nNegocio: ' + (biz || 'No indicado') +
      (tipo ? '\nTipo de negocio: ' + tipo : '') + (city ? '\nCiudad: ' + city : '') +
      (ints.length ? '\nLe interesa: ' + ints.join(', ') : '') + (msg ? '\nMensaje: ' + msg : '');
    var texto = 'Hola KEYS, quiero agendar una reunión gratis de 30 minutos el ' + cuando + '.\n' + detalle;
    var quien = name + ' · ' + wa;

    if (!st.live) {
      $('sendWhen').textContent = cuando; $('sendWho').textContent = quien;
      $('sendWa').href = waLink(texto);
      $('sendMail').href = mailLink('Reunión gratis KEYS: ' + cuando, texto);
      trackLead('form');
      return show('send');
    }

    els.go.disabled = true; setMsg('Guardando tu reserva…');
    rpc('book_appointment', {
      p_tenant_slug: CFG.TENANT_SLUG || 'keys',
      p_date: d.fecha, p_time: hora, p_name: name, p_phone: wa,
      p_email: mail || null, p_business_name: biz || null, p_business_type: tipo || null, p_city: city || null,
      p_interests: ints, p_message: msg || null,
      p_data_consent: acDatos, p_whatsapp_opt_in: acWa, p_email_opt_in: acMail,
      p_utm: UTM, p_page: PAGINA
    })
      .then(function () {
        $('doneWhen').textContent = cuando; $('doneWho').textContent = quien;
        $('doneWa').href = waLink('Hola KEYS, acabo de reservar una reunión para el ' + cuando + '. Soy ' + name + '.');
        setMsg(''); show('done');
        trackLead('form');
      })
      .catch(function (err) {
        var m = err.message || '';
        if (/horario_no_disponible/.test(m)) {
          return loadAgenda().then(function () {
            setMsg('Ese horario acaba de ocuparse. Elige otro de los que quedan libres.', true);
          });
        }
        if (/falta_autorizacion_datos/.test(m)) return setMsg('Marca la autorización de datos para poder agendar tu reunión.', true);
        if (/whatsapp_invalido/.test(m)) return setMsg('Revisa tu número de WhatsApp.', true);
        if (/falta_correo/.test(m)) return setMsg('Escribe tu correo para poder enviarte promociones por ahí.', true);
        if (/demasiadas_citas/.test(m)) return setMsg('Ya tienes reuniones agendadas. Escríbenos por WhatsApp si necesitas otra.', true);
        if (/correo_invalido/.test(m)) return setMsg('Revisa tu correo: parece incompleto.', true);
        if (/nombre_invalido/.test(m)) return setMsg('Escribe tu nombre completo.', true);
        setMsg('No pudimos guardar tu reserva. Escríbenos por WhatsApp y la agendamos por ahí.', true);
      })
      .then(function () { els.go.disabled = false; });
  });

  $('btnBack').addEventListener('click', function () { show('pick'); });
  $('btnAgain').addEventListener('click', function () { show('pick'); loadAgenda(); });

  /* ---------- Visor de imágenes a pantalla completa ---------- */
  var lbImgs = [], lbIdx = 0;
  function lbFit() {
    var im = $('lbImg'); if (!im.naturalWidth) return;
    var vw = Math.min(window.innerWidth, window.screen.width || 9999), vh = Math.min(window.innerHeight, window.screen.height ? window.screen.height - 140 : 9999);
    var maxW = vw - 32, maxH = vh * 0.88;
    var k = Math.min(1, maxW / im.naturalWidth, maxH / im.naturalHeight);
    im.style.width = Math.round(im.naturalWidth * k) + 'px'; im.style.height = Math.round(im.naturalHeight * k) + 'px';
    im.style.maxWidth = 'none'; im.style.maxHeight = 'none';
  }
  $('lbImg').addEventListener('load', lbFit);
  window.addEventListener('resize', function () { if ($('lb').classList.contains('open')) lbFit(); });
  function lbShow() { $('lbImg').src = lbImgs[lbIdx] || ''; $('lbCount').textContent = lbImgs.length > 1 ? (lbIdx + 1) + ' / ' + lbImgs.length : ''; var multi = lbImgs.length > 1; $('lbPrev').style.display = multi ? 'flex' : 'none'; $('lbNext').style.display = multi ? 'flex' : 'none'; }
  function lbOpen(imgs, idx) { lbImgs = imgs || []; lbIdx = idx || 0; lbShow(); $('lb').classList.add('open'); document.body.style.overflow = 'hidden'; }
  function lbClose() { $('lb').classList.remove('open'); $('lbImg').src = ''; document.body.style.overflow = ''; }
  $('lbClose').addEventListener('click', lbClose);
  $('lbPrev').addEventListener('click', function () { lbIdx = (lbIdx - 1 + lbImgs.length) % lbImgs.length; lbShow(); });
  $('lbNext').addEventListener('click', function () { lbIdx = (lbIdx + 1) % lbImgs.length; lbShow(); });
  $('lb').addEventListener('click', function (e) { if (e.target === this) lbClose(); });
  document.addEventListener('keydown', function (e) { if (!$('lb').classList.contains('open')) return; if (e.key === 'Escape') lbClose(); else if (e.key === 'ArrowLeft') $('lbPrev').click(); else if (e.key === 'ArrowRight') $('lbNext').click(); });
  window.lbOpen = lbOpen;

  renderSectors();
  renderProjects();
  show('pick');
  loadAgenda();

  (function () {
    var el = document.getElementById('mockBody'); if (!el) return;
    function img(id) { var p = PROJECTS.filter(function (x) { return x.id === id; })[0]; return p && p.shots && p.shots[0] ? p.shots[0] : ''; }
    var chat = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#06121A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    var cart = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>';
    var scenes = [
      { tag: 'VITRINA VIRTUAL', tag_en: 'ONLINE CATALOG', cta: 'Pedir por WhatsApp', cta_en: 'Order on WhatsApp', badge: '2', img: img('vitrina') },
      { tag: 'MENÚ DIGITAL', tag_en: 'DIGITAL MENU', cta: 'Hacer pedido', cta_en: 'Place order', badge: '3', img: img('cocina') },
      { tag: 'AGENDA DE CITAS', tag_en: 'APPOINTMENTS', cta: 'Reservar cita', cta_en: 'Book appointment', badge: '', img: img('consultorio-landing') },
      { tag: 'PORTAL CONTABLE', tag_en: 'ACCOUNTING PORTAL', cta: 'Subir documentos', cta_en: 'Upload documents', badge: '', img: img('contadores') }
    ].filter(function (s) { return s.img; });
    if (!scenes.length) return;
    function render(s) {
      var em = s.badge ? '<em>' + cart + '<s>' + s.badge + '</s></em>' : '';
      el.innerHTML = '<div class="mock-row mono"><span style="color:var(--acc);letter-spacing:1px">' + (LANG==='en'?s.tag_en:s.tag) + '</span><span class="live">' + TT('online') + '<i></i></span></div>' +
        '<div class="mprev"><img src="' + s.img + '" alt=""></div>' +
        '<div class="mock-cta"><b>' + chat + (LANG==='en'?s.cta_en:s.cta) + '</b>' + em + '</div>';
    }
    var i = 0; render(scenes[0]); window.__mockRender = function () { render(scenes[i]); };
    if (matchMedia('(prefers-reduced-motion:reduce)').matches || scenes.length < 2) return;
    setInterval(function () {
      el.style.opacity = '0';
      setTimeout(function () { i = (i + 1) % scenes.length; render(scenes[i]); el.style.opacity = '1'; }, 900);
    }, 6000);
  })();

  /* ---------- aplicar idioma ---------- */
  function applyLang(l) {
    LANG = (l === 'en') ? 'en' : 'es';
    try { localStorage.setItem('keys_lang', LANG); } catch (e) {}
    document.documentElement.lang = LANG;
    document.querySelectorAll('[data-t]').forEach(function (el) {
      var k = el.getAttribute('data-t'); if (!T[k]) return;
      var v = T[k][LANG] || T[k].es;
      if (k === 'ag_or') el.innerHTML = v; else el.textContent = v;
    });
    document.querySelectorAll('[data-tph]').forEach(function (el) {
      var k = el.getAttribute('data-tph'); if (T[k]) el.placeholder = T[k][LANG] || T[k].es;
    });
    renderSectors();
    renderProjects();
    renderDays();
    renderTimes();
    if (window.__mockRender) window.__mockRender();
  }
  var langTog = document.getElementById('langTog');
  if (langTog) langTog.addEventListener('click', function () { applyLang(LANG === 'es' ? 'en' : 'es'); });
  applyLang(LANG);
})();
