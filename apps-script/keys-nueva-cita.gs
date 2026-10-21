/**
 * KEYS · Nueva cita desde el landing → Google Calendar + correos
 *
 * Reemplazo gratuito del workflow de n8n (no requiere membresía de nada).
 * Corre con tu propia cuenta de Google: crea el evento en tu Google Calendar
 * y envía el aviso a KEYS y la confirmación al cliente, usando Gmail/Calendar
 * de tu cuenta.
 *
 * CÓMO INSTALARLO:
 * 1. Ve a https://script.google.com → "Nuevo proyecto".
 * 2. Borra el contenido de Code.gs y pega todo este archivo.
 * 3. Arriba a la derecha: "Implementar" → "Nueva implementación".
 *    - Tipo: "Aplicación web".
 *    - Ejecutar como: "Yo" (tu cuenta de Google).
 *    - Quién tiene acceso: "Cualquier usuario" (necesario para que Supabase
 *      pueda llamarla).
 * 4. Copia la URL de la aplicación web que te da (termina en /exec).
 * 5. En Supabase: Database → Webhooks → crea uno nuevo sobre la tabla de
 *    citas (appointments), evento INSERT, tipo "HTTP Request", y pega esa
 *    URL como destino (method POST).
 * 6. La primera vez que se ejecute, Google te pedirá autorizar el script
 *    (acceso a tu Calendar y tu Gmail) — es un permiso único sobre tu propia
 *    cuenta, no hay cuenta de pago ni membresía de por medio.
 *
 * Si cambias el diferencial de KEYS (tenant_id) en Supabase, actualízalo
 * también en la constante KEYS_TENANT_ID de abajo.
 */

var KEYS_TENANT_ID = '61847ab9-eb11-42ad-aef6-f41e5f0afa0d';
var KEYS_EMAIL = 'keysmarketingdigital@gmail.com';
var KEYS_WHATSAPP = '573045550119';

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var record = body.record || {};

    // Diferencial de KEYS: solo procesamos citas de este tenant
    // (la misma base de Supabase es multi-tenant, comparte tabla con otros negocios).
    if (String(record.tenant_id) !== KEYS_TENANT_ID) {
      return jsonOut({ ok: true, skipped: true, reason: 'tenant distinto a KEYS' });
    }

    var dateStr = record.appt_date;                         // 'YYYY-MM-DD'
    var timeStr = String(record.appt_time || '').slice(0, 5); // 'HH:MM'
    if (!dateStr || !timeStr) return jsonOut({ ok: false, error: 'faltan appt_date/appt_time' });

    // Colombia no tiene horario de verano: UTC-5 todo el año.
    var start = new Date(dateStr + 'T' + timeStr + ':00-05:00');
    var end = new Date(start.getTime() + 30 * 60000);

    var name = record.name || '';
    var phone = record.phone || '';
    var email = record.email || '';
    var biz = record.business_name || '';
    var bizType = record.business_type || '';
    var city = record.city || '';
    var interests = (record.interests || []).join(', ');
    var msg = record.message || '';
    var waNum = String(phone).replace(/\D/g, '');

    var summary = 'Reunión KEYS · ' + name + (biz ? ' (' + biz + ')' : '');
    var description = [
      'Reunión gratis de 30 minutos agendada desde el landing de KEYS.',
      '',
      'Nombre: ' + name,
      'WhatsApp: ' + phone,
      'Correo: ' + (email || 'No indicado'),
      'Negocio: ' + (biz || 'No indicado'),
      'Tipo de negocio: ' + (bizType || 'No indicado'),
      'Ciudad: ' + (city || 'No indicada'),
      'Le interesa: ' + (interests || 'No indicó'),
      'Mensaje: ' + (msg || '(sin mensaje)'),
      '',
      'WhatsApp directo: https://wa.me/' + waNum
    ].join('\n');

    // 1) Crear el evento en tu Google Calendar
    CalendarApp.getDefaultCalendar().createEvent(summary, start, end, {
      description: description,
      location: 'WhatsApp / videollamada'
    });

    // 2) Aviso a KEYS por correo
    MailApp.sendEmail({
      to: KEYS_EMAIL,
      subject: 'Nueva reunión KEYS: ' + dateStr + ' a las ' + timeStr,
      body: description + '\n\nEstado: pendiente. Confírmala escribiéndole por WhatsApp.'
    });

    // 3) Confirmación al cliente, si dejó correo
    if (email) {
      MailApp.sendEmail({
        to: email,
        subject: 'Recibimos tu solicitud de reunión con KEYS',
        body: 'Hola ' + name + ',\n\n' +
          'Recibimos tu solicitud de reunión gratis de 30 minutos para el ' + dateStr + ' a las ' + timeStr + '.\n\n' +
          'Te escribiremos por WhatsApp para confirmarla.\n\n' +
          'Equipo KEYS'
      });
    }

    return jsonOut({ ok: true });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
