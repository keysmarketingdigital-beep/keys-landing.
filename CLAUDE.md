# KEYS Marketing Digital — landing propia

Landing de servicios de KEYS (Rionegro / Oriente Antioqueño). Un solo `index.html`, sin frameworks.

## Datos del negocio
- WhatsApp: 3045550119 (+57 304 555 0119)
- Email: keysmarketingdigital@gmail.com
- Zona: Oriente Antioqueño, Colombia
- Dominio: **pendiente** — el sitio usa `https://keysmarketingdigital.com/` como placeholder en canonical, og:url, JSON-LD, robots.txt y sitemap.xml. Cuando se compre el dominio real, reemplazar esa URL en todos esos archivos.

## SEO / Google (ver `politica-privacidad.html`, `robots.txt`, `sitemap.xml`)
- JSON-LD LocalBusiness + WebSite ya están en el `<head>` de `index.html`.
- Falta: verificación de Google Search Console (dejar el archivo `googleXXXX.html` cuando se genere) y envío del sitemap.
- Favicon actual: emoji 🔑 inline (no hay archivo de logo cuadrado todavía).

## Conversiones (Google Ads) y Analytics
- Andamio ya instalado en `index.html`: `window.SJ_TRACK = { GADS_ID:'', GADS_LABELS:{whatsapp:'',form:'',call:''}, GA4_ID:'' }`.
- `trackLead('whatsapp'|'form'|'call')` ya está conectado: se dispara con cualquier clic a un enlace `wa.me/...` o `tel:...`, y al enviar el formulario de agenda (tanto en modo demo como en modo "live" con Supabase).
- **Pendiente del cliente**: el ID de Google Ads (`AW-...`) y las etiquetas de conversión por acción, y/o el ID de GA4 (`G-...`). En cuanto los tenga, se rellenan en `SJ_TRACK` y se vuelve a publicar — no hay que tocar nada más del código.

## CRM y Campañas (en vivo, conectado a Supabase) — `demos/crm-campanas.html`
- Módulo aparte del catálogo (`demos/belleza.html`): solo trae el CRM de leads y el planificador de campañas.
- Enlazado desde el proyecto "vitrina" del landing (botón "Ver CRM y campañas").
- **El proyecto de Supabase (`kuyijvnzdrngailqndlm`) es una base real, multi-tenant, ya en producción** (sirve también a `am-belleza-spa`, `cocina-oculta`, etc.). `config.js` ya tiene la llave pública (`anon key`) real — el sitio entero quedó "en vivo" con esto, incluida la agenda de citas de KEYS en `index.html`, no solo este panel.
- Este panel habla **REST directo contra las tablas reales `contacts` y `campaigns`** (no funciones RPC propias) — queda protegido por las políticas RLS que ya existían para cualquier negocio del sistema (`contacts_tenant_staff`, `tenant_isolation_campaigns`): sin una sesión real de Supabase Auth con el rol correcto, esas políticas no dejan leer ni escribir nada, así que el anon key público no alcanza por sí solo.
- Vive aislado en su propio tenant `vitrina-demo` (id real `b0595b11-afa2-41de-8296-51ead8b14ecf`, creado con la migración de la sección 7 de `supabase/migracion-keys-crm.sql`) — nunca comparte fila con AM Belleza ni con ningún otro cliente.
- El CRM reutiliza la tabla `contacts` que ya existía (se le agregó el estado `cerrado`). Las campañas usan la tabla real `campaigns` (ya existente en el proyecto): no tiene columna libre de "producto", así que el panel guarda el producto/servicio como primera línea de `message` y la separa de nuevo al mostrarla; `scheduled_date` es obligatoria en esa tabla, por eso el formulario la exige.
- **Categorías** (pestaña nueva, entre CRM y Campañas): crea/edita categorías del catálogo con nombre (clave interna + nombre visible ES/EN), imagen y descripción, acotado al tenant `vitrina-demo`. La tabla real `categories` no traía esas dos columnas (`image_url`, `description`) ni reglas de seguridad — están en la migración pendiente de abajo.
- **Imagen de categoría — subida desde PC/celular**: el formulario deja elegir un archivo directamente (botón "Subir foto desde tu PC o celular") además de pegar una URL; con archivo, se sube al bucket público `catalog-images` de Supabase Storage (ya creado) y se guarda la URL pública resultante. En modo demo local (sin Supabase activo) se guarda como data URL en su lugar. Falta correr los permisos del bucket — ver pendientes abajo.
- Carga masiva de contactos desde CSV o Excel (.xlsx): detecta sola las columnas de nombre, correo y WhatsApp sin importar el orden ni el idioma del encabezado. El Excel se lee con SheetJS cargado solo cuando hace falta (CDN).
- Las "campañas" se guardan **programadas**, no se envían solas a los leads reales: es el calendario/base de datos; el envío real masivo (WhatsApp Business API, etc.) sigue por conectar.
- **Envío de prueba automático al guardar una campaña**: cada vez que se crea o edita una campaña con el canal de correo activado, el panel llama a la función de Supabase `send-campaign-test`, que manda un correo de PRUEBA **solo a keysmarketingdigital@gmail.com** (nunca a los leads) usando Brevo. Usa un secreto propio `KEYS_BREVO_API_KEY` en Supabase (Project Settings → Edge Functions → Secrets) — **distinto** del secreto compartido `BREVO_API_KEY` que usa la función `dynamic-action` (el envío real de campañas de TODA la plataforma multi-tenant): no hay que tocar ni reemplazar ese otro secreto. Si el envío de prueba falla (p. ej. falta el secreto), la campaña igual se guarda; solo se avisa aparte.
- **Destinatarios + envío real de correo + WhatsApp manual (22 oct 2026)**: el formulario de campaña tiene un checklist "Destinatarios" con todos los leads (botones "Marcar todos"/"Desmarcar todos"); la selección se guarda en la tabla real `campaign_recipients` (ya existía en el proyecto, aislada por tenant vía RLS) al guardar la campaña, usando el canal `email` como lista canónica de a quién va dirigida (sirve tanto para el correo real como para los enlaces de WhatsApp).
  - **Correo real**: botón "✉ Enviar correo real" en cada campaña con canal Correo activo → llama a la nueva función de Supabase `send-campaign-send` (usa el mismo secreto `KEYS_BREVO_API_KEY`, nunca el compartido `BREVO_API_KEY`), manda el correo de verdad solo a los leads marcados que tengan correo, y pide confirmación antes de enviar. Al terminar marca la campaña como `realizada`.
  - **WhatsApp — manual a propósito** (pedido explícito del cliente, no automatizar): botón "💬 WhatsApp (manual)" que genera enlaces `wa.me/<número>?text=...` por cada lead marcado que tenga WhatsApp, para que el usuario los abra y envíe él mismo. No hay ni debe haber envío automático de WhatsApp.
  - **Fix de seguridad relacionado**: antes, una campaña nueva se guardaba con el estado por defecto de la tabla (`'programada'`), que es justo el que usa el despachador automático **compartido de toda la plataforma** (`dynamic-action`, corre por cron cada 10 min) para decidir qué campañas procesar y mandar solas. Ahora toda campaña nueva se guarda explícitamente como `'pendiente'`, así ese proceso compartido nunca la toma — el único envío real posible para KEYS es el botón manual de arriba. El botón de estado "Programada" que ya existía en la lista de campañas sigue ahí (por si algún día se quiere usar ese flujo compartido), pero no conviene tocarlo sin avisar: haría que una campaña entre al despachador automático, que usaría la llave compartida de Brevo (no la de KEYS) salvo que se configure un `tenant_secrets` propio, cosa que aún no se hizo.
- **Acceso privado**: el panel pide entrar antes de mostrar nada, con correo y contraseña reales contra Supabase Auth (ya no hay modo de clave simple local — eso solo aplicaba antes de activar la llave real).
- **Falta un paso tuyo, una sola vez, para poder entrar**:
  1. Supabase → *Authentication → Users → Add user* → tu correo y una contraseña.
  2. En **User Metadata** pon exactamente: `{"tenant_slug": "vitrina-demo"}` (sin esto, la creación del usuario falla: hay un disparador en la base que exige ese dato o un `business_name` para saber a qué tenant unirte).
  3. Marca "Auto Confirm User".
  4. Avísame tu correo y yo subo tu rol a `admin` dentro del tenant `vitrina-demo` por SQL (el disparador solo te deja como `'client'`, y el panel exige `admin`/`developer`/`employee`).
  5. Con eso ya puedes iniciar sesión en el panel con ese correo y contraseña.
- **Pendiente de probar de principio a fin**: hasta que completes esos pasos no hay ninguna sesión real contra la que probar el inicio de sesión del panel; el resto (lectura/escritura REST, import CSV/Excel) ya se verificó que no rompe nada en modo sin sesión.

## ✅ Migraciones aplicadas (21 oct 2026)
Los tres bloques pendientes de `supabase/migracion-keys-crm.sql` ya se corrieron en Supabase → SQL Editor y se verificaron en la base real:

1. **Tipo de reunión (llamada/videollamada) en la agenda real** (sección 3-4) — `booking_availability.meeting_type` ya existe; `get_available_slots`/`book_appointment` ya distinguen llamada de día / videollamada de noche (8:30 p. m.).
2. **Columnas y permisos de `categories`** (sección 7e) — `image_url` y `description` ya existen, con las políticas `categories_public_read` / `categories_tenant_staff`. La pestaña "Categorías" del panel ya guarda sin error.
3. **Permisos del bucket `catalog-images`** (sección 7f) — las 4 políticas de `storage.objects` (`catalog_images_public_read/staff_write/staff_update/staff_delete`) ya existen. La subida de fotos desde PC/celular en Categorías ya debería funcionar de punta a punta.

## Agenda → Google Calendar
- **Ruta activa (gratis, sin membresía)**: `apps-script/keys-nueva-cita.gs` — un Google Apps Script que corre con la cuenta de Google de Yeison. Recibe el webhook de Supabase cuando se inserta una cita nueva, filtra por el diferencial de KEYS (`tenant_id = 61847ab9-eb11-42ad-aef6-f41e5f0afa0d`, igual que hacía el flujo de n8n), crea el evento en Google Calendar (30 min, zona America/Bogota) y manda el aviso a KEYS y la confirmación al cliente por correo (reemplaza también esa parte de n8n). Instrucciones de instalación completas dentro del archivo (deploy como "Aplicación web" en script.google.com, luego apuntar un Database Webhook de Supabase a esa URL).
- **Ruta alterna (si algún día tiene membresía de n8n)**: `n8n/keys-nueva-cita.workflow.json` ya incluye el nodo "Crear evento en Google Calendar" colgado de la misma condición "¿Es una cita de KEYS?". Queda ahí por si la retoma, pero no es necesaria mientras use el Apps Script.

## No inventar
- Teléfonos, años de experiencia, garantías, cifras o NIT que el cliente no haya dado.
- El equipo del prototipo "Sistema de agenda y citas" es ficticio, excepto el nombre "Laura Restrepo" (antes Dra. Paola) que sí debe mantenerse como alias ficticio consistente.
