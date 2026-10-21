# KEYS · Landing conectado a tu Supabase multi-tenant

```
Visitante en el landing (Netlify)
   │  ve horarios libres y agenda
   ▼
Supabase (proyecto keysmarketingdigital) · negocio "keys"
   │  guarda la cita en appointments y el cliente en contacts (tu CRM)
   ▼
n8n (webhook) ──► Gmail ──► te llega el aviso (y al cliente, si dejó su correo)
```

KEYS es un negocio (tenant) más dentro de tu base, igual que Cocina Oculta. Todo lo nuevo sirve para cualquier negocio: el día que un consultorio o salón quiera agenda, solo le creas sus horarios.

## Qué ya está hecho en Supabase

La migración `supabase/migracion-keys-crm.sql` **ya está aplicada** en tu proyecto. No tienes que ejecutarla; queda en el paquete como respaldo.

- **Negocio KEYS** (slug `keys`) con horarios de lunes a viernes: 9, 10 y 11 a. m. y 2, 3 y 4 p. m.
- **Agenda multi-tenant:** `booking_availability` (horarios), `booking_blocks` (días u horas bloqueados) y `appointments` (citas).
- **CRM:** `contacts` ahora guarda también tipo de negocio, ciudad, intereses, etapa, fechas de autorización, origen (UTM) y un token para darse de baja. Los mensajes del formulario van a `lead_messages`.
- **Funciones públicas** que usa el landing: `get_available_slots`, `book_appointment` y `unsubscribe_contact`.
- **Seguridad:**
  - Los contactos solo los ve el equipo del negocio (admin, developer, employee), ya no los clientes.
  - Las llaves de Brevo y WhatsApp se guardan en `tenant_secrets`, que solo lee el servidor. El panel puede seguir guardándolas en `tenants`: se mueven solas.
  - Las autorizaciones de campañas empiezan en "no" hasta que la persona acepte.
- **Edge function `dynamic-action`** (envío de campañas) actualizada a la versión 6: lee la llave de Brevo desde `tenant_secrets`.

## Paso 1 · n8n y Gmail (10 min)

1. En n8n: **Workflows → Import from file** → `n8n/keys-nueva-cita.workflow.json`.
2. En el nodo **Aviso a KEYS** cambia `correo@tudominio.com` por tu correo.
3. En los dos nodos de Gmail elige tu cuenta en *Credential*.
4. En el nodo **Nueva cita (Supabase)** crea una credencial *Header Auth*: nombre `x-keys-secret` y una clave larga inventada por ti.
5. Copia la **Production URL** del webhook y **activa** el flujo.

El flujo ya filtra por el negocio KEYS: si otro negocio recibe citas, no te llegan a ti.

## Paso 2 · Aviso de citas nuevas (3 min)

Supabase → **Database → Webhooks → Create a new hook**:
- Table: `appointments` · Events: solo **Insert**
- Type: **HTTP Request**, **POST**, URL: la *Production URL* de n8n
- HTTP Headers: `x-keys-secret` con la misma clave del paso 1

## Paso 3 · Netlify (5 min)

1. **Add new site → Deploy manually** y arrastra esta carpeta.
2. **Site configuration → Environment variables**:

| Variable | Valor |
|---|---|
| `SUPABASE_URL` | `https://kuyijvnzdrngailqndlm.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase → Project Settings → API → llave **publishable** (o *anon*) |
| `TENANT_SLUG` | `keys` |
| `WHATSAPP` | Tu número con indicativo, sin `+` (ej. `573001234567`) |
| `EMAIL` | Tu correo de contacto |
| `DEMO_VITRINA` | (Opcional) enlace de la demo de la vitrina |

3. **Deploy** de nuevo. El registro debe decir *Supabase conectado*.

Nunca pongas la llave **secret** / *service_role* en Netlify: esa solo va en n8n o en funciones del servidor.

## Paso 4 · Prueba completa

1. Agenda una reunión de prueba en tu sitio.
2. En Supabase → Table Editor → `appointments` y `contacts` debe aparecer (filtra por el tenant de KEYS).
3. Te debe llegar el correo. Si no, revisa n8n → **Executions**.
4. Ese horario ya no debe aparecer en el landing.

## Uso diario

- **Horarios:** `booking_availability` del tenant KEYS (`weekday`: 1 = lunes … 7 = domingo; apaga con `active`).
- **Bloquear un día u hora:** fila en `booking_blocks` (deja `slot_time` vacío para todo el día).
- **Citas:** en `appointments` cambia `status` a `confirmada`, `cancelada` o `realizada`. Cancelar libera el horario.
- **Seguimiento del cliente:** en `contacts` usa `stage` (nuevo, contactado, reunion_agendada, propuesta, cliente, perdido) y `notes`.

## Reglas que el formulario ya respeta

- Sin marcar la autorización de datos (Ley 1581 de 2012) no se puede agendar.
- Promociones por WhatsApp y por correo son casillas separadas y opcionales; por correo exige dejar el correo.
- `300 123 4567` y `+57 300-123-4567` son la misma persona: no se duplica, y sus intereses se suman.
- Máximo 2 reuniones activas por número, para evitar reservas falsas.

## Pendientes conocidos (no se tocaron para no romper tus apps)

- **Pedidos y chats entre clientes:** las políticas de `orders` y `chat_messages` dejan que un cliente vea los de todos los clientes del negocio. Para cerrarlo hay que saber cómo tu app muestra el historial de cada cliente.
- **Clientes de Cocina Oculta:** los contactos que llegan por pedidos ahora empiezan sin autorización de campañas. Conviene agregar la casilla en el formulario de pedido.
- **Hora de campañas:** `dynamic-action` compara la hora programada con la hora UTC del servidor; programando en hora de Colombia, saldrían unas 5 horas antes.
- **WhatsApp en campañas:** `dynamic-action` solo envía correos por ahora.
- **Enlace de baja en los correos de campaña:** la función `unsubscribe_contact` ya existe, pero los correos todavía no incluyen el enlace.

## Prototipos en vivo (sin imágenes)

En "Proyectos y prototipos", cada demo tiene el botón **"Probar aquí"**: abre el prototipo real, completo e interactivo, dentro de la misma página, sin imágenes ni capturas. Todos viven en la carpeta `demos/`, así que funcionan una vez publicado el sitio en Netlify (o abriendo `index.html` junto a la carpeta `demos/`).

Prototipos incluidos:

| Prototipo | Archivo | Notas |
|---|---|---|
| Catálogo virtual (belleza) | `demos/belleza.html` | Datos de demo ("Studio Bella"). Guarda todo en el navegador de quien lo prueba; no toca ninguna base. |
| Cocina Oculta | `demos/cocina-oculta.html` | **Conectado a tu Supabase, pero al negocio de pruebas `cocina-oculta-pruebas`.** Ningún visitante toca los datos del negocio real. |
| Landing de consultorio | `demos/consultorio-landing.html` | Datos de demo ("Dra. Laura Restrepo"). |
| Gestión de consultorio | `demos/consultorio-gestion.html` | Datos de demo. Guarda en el navegador. |
| Sitio de reformas | `demos/reformas.html` | Datos de demo ("Reformas del Hogar"). El botón "powered by KEYS" usa `57XXXXXXXXXX`: reemplázalo por tu número. |

Todos los nombres, teléfonos, redes y fotos de clientes reales se quitaron y se cambiaron por datos de demostración.

## Capturas

No hacen falta: los prototipos se muestran funcionando. Si algún día quieres una captura fija en una tarjeta, guárdala en `img/` y escribe la ruta en `shot:` del proyecto dentro de `PROJECTS` en `index.html`.
