// KEYS Citas · configuración.
// MODO DEMO (actual): la agenda funciona en el navegador con datos de ejemplo (demo-db.js), sin Supabase.
// PRODUCCIÓN (al vender): poner demo:false, pegar la URL y la clave PUBLICABLE del proyecto Supabase
// y ejecutar 4-odontologia.sql. La clave publicable es pública por diseño (la seguridad está en la base:
// RLS + funciones). NUNCA pegues aquí la clave "service_role" / "secret".
window.KEYS_CONFIG = {
  demo: true,
  url: 'https://demo.keys.local',
  key: 'demo',
  // url: 'https://egybmszmgpjpzwtvsxqw.supabase.co',
  // key: 'sb_publishable_SbqgDU5k4po7kKPwUidyhw_uCeqZgq3',
  slug: 'keys-odontologia'
};
