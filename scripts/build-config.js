// Genera config.js a partir de las variables de entorno de Netlify.
// Si una variable no existe, conserva el valor que ya tiene config.js.
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'config.js');
const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';

// Lee los valores actuales de config.js como respaldo.
const fallback = {};
for (const m of current.matchAll(/([A-Z_]+):\s*'([^']*)'/g)) fallback[m[1]] = m[2];

const keys = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'TENANT_SLUG', 'WHATSAPP', 'EMAIL', 'DEMO_VITRINA'];
const cfg = {};
for (const k of keys) cfg[k] = (process.env[k] || fallback[k] || '').trim();
if (!cfg.TENANT_SLUG) cfg.TENANT_SLUG = 'keys';

const body =
  '// Archivo generado por scripts/build-config.js. Las llaves públicas de Supabase\n' +
  '// son seguras en el navegador porque las tablas están protegidas (ver supabase/migracion-keys-crm.sql).\n' +
  'window.KEYS_CONFIG = {\n' +
  keys.map((k) => "  " + k + ": '" + cfg[k].replace(/'/g, "\\'") + "'").join(',\n') +
  '\n};\n';

fs.writeFileSync(file, body);
console.log('config.js generado. Supabase ' + (cfg.SUPABASE_URL && !/TU-PROYECTO/.test(cfg.SUPABASE_URL) ? 'conectado' : 'sin conectar (modo demo)'));
