-- =====================================================================
-- KEYS · Migración sobre la base multi-tenant existente
--  1) KEYS como un tenant más
--  2) CRM: columnas nuevas en contacts (sirven para todos los tenants)
--  3) Agenda multi-tenant: booking_availability, booking_blocks, appointments
--  4) Funciones públicas para el landing (por slug del negocio)
--  5) Correcciones de seguridad: contacts solo para el equipo,
--     llaves de Brevo/WhatsApp fuera de tenants, autorizaciones en false
-- Es segura de ejecutar más de una vez.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0) Utilidad: teléfono colombiano normalizado (300 123 4567 → 573001234567)
-- ---------------------------------------------------------------------
create or replace function public.normalize_phone_co(p text)
returns text
language sql
immutable
set search_path = public
as $$
  select case when d ~ '^3[0-9]{9}$' then '57' || d else d end
  from (select regexp_replace(coalesce(p, ''), '[^0-9]', '', 'g') as d) x
$$;

-- ---------------------------------------------------------------------
-- 1) KEYS como tenant
-- ---------------------------------------------------------------------
insert into public.tenants (slug, name)
values ('keys', 'KEYS Marketing Digital')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- 2) CRM: columnas nuevas en contacts
-- ---------------------------------------------------------------------
alter table public.contacts
  add column if not exists business_name        text,
  add column if not exists business_type        text,
  add column if not exists city                 text,
  add column if not exists interests            text[] not null default '{}',
  add column if not exists stage                text   not null default 'nuevo',
  add column if not exists notes                text,
  add column if not exists last_contact_at      timestamptz,
  add column if not exists data_consent_at      timestamptz,
  add column if not exists marketing_consent_at timestamptz,
  add column if not exists unsubscribe_token    uuid   not null default gen_random_uuid(),
  add column if not exists utm_source           text,
  add column if not exists utm_medium           text,
  add column if not exists utm_campaign         text,
  add column if not exists landing_page         text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'contacts_stage_check') then
    alter table public.contacts add constraint contacts_stage_check
      check (stage in ('nuevo', 'contactado', 'reunion_agendada', 'propuesta', 'cliente', 'perdido'));
  end if;
end $$;

create unique index if not exists contacts_unsubscribe_token_key on public.contacts (unsubscribe_token);
create index if not exists contacts_tenant_phone_idx on public.contacts (tenant_id, phone);

-- Autorización explícita (Ley 1581 y reglas de WhatsApp): por defecto NO.
alter table public.contacts alter column email_opt_in    set default false;
alter table public.contacts alter column whatsapp_opt_in set default false;

-- ---------------------------------------------------------------------
-- 3) Agenda multi-tenant
-- ---------------------------------------------------------------------
create table if not exists public.booking_availability (
  id         bigint generated always as identity primary key,
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  weekday    smallint not null check (weekday between 1 and 7),   -- 1 = lunes ... 7 = domingo
  slot_time  time not null,
  active     boolean not null default true,
  unique (tenant_id, weekday, slot_time)
);

-- Tipo de reunión por franja: llamada (de día) o videollamada con pantalla compartida (de noche).
alter table public.booking_availability
  add column if not exists meeting_type text not null default 'llamada';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'booking_availability_meeting_type_check'
  ) then
    alter table public.booking_availability
      add constraint booking_availability_meeting_type_check
      check (meeting_type in ('llamada', 'videollamada'));
  end if;
end $$;

create table if not exists public.booking_blocks (
  id          bigint generated always as identity primary key,
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  block_date  date not null,
  slot_time   time,                                                -- vacío = todo el día
  reason      text
);

create table if not exists public.appointments (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants(id) on delete cascade,
  contact_id     uuid references public.contacts(id) on delete set null,
  appt_date      date not null,
  appt_time      time not null,
  name           text not null check (char_length(name) between 2 and 120),
  phone          text not null,
  email          text,
  business_name  text,
  business_type  text,
  city           text,
  interests      text[] not null default '{}',
  message        text,
  status         text not null default 'pendiente'
                 check (status in ('pendiente', 'confirmada', 'cancelada', 'realizada')),
  source         text not null default 'landing',
  created_at     timestamptz not null default now()
);

-- Tipo de reunión que quedó agendada (llamada de día o videollamada de noche),
-- tomado de booking_availability en el momento de la reserva.
alter table public.appointments
  add column if not exists meeting_type text;

create unique index if not exists appointments_slot_unique
  on public.appointments (tenant_id, appt_date, appt_time)
  where status in ('pendiente', 'confirmada');
create index if not exists appointments_contact_idx on public.appointments (contact_id);

alter table public.booking_availability enable row level security;
alter table public.booking_blocks       enable row level security;
alter table public.appointments         enable row level security;

revoke all on public.booking_availability from anon;
revoke all on public.booking_blocks       from anon;
revoke all on public.appointments         from anon;

-- Solo el equipo del negocio (admin, developer, employee) gestiona su agenda.
drop policy if exists booking_availability_staff on public.booking_availability;
create policy booking_availability_staff on public.booking_availability
  for all to authenticated
  using      (tenant_id = public.my_tenant() and public.my_role() in ('admin', 'developer', 'employee'))
  with check (tenant_id = public.my_tenant() and public.my_role() in ('admin', 'developer', 'employee'));

drop policy if exists booking_blocks_staff on public.booking_blocks;
create policy booking_blocks_staff on public.booking_blocks
  for all to authenticated
  using      (tenant_id = public.my_tenant() and public.my_role() in ('admin', 'developer', 'employee'))
  with check (tenant_id = public.my_tenant() and public.my_role() in ('admin', 'developer', 'employee'));

drop policy if exists appointments_staff on public.appointments;
create policy appointments_staff on public.appointments
  for all to authenticated
  using      (tenant_id = public.my_tenant() and public.my_role() in ('admin', 'developer', 'employee'))
  with check (tenant_id = public.my_tenant() and public.my_role() in ('admin', 'developer', 'employee'));

-- Horarios iniciales de KEYS: lunes a viernes.
-- De día (9, 10, 11 a. m. y 2, 3 p. m.) son llamadas telefónicas: Yeison agenda
-- después, si hace falta, la reunión por video para mostrar pantalla.
insert into public.booking_availability (tenant_id, weekday, slot_time, meeting_type)
select t.id, d, h, 'llamada'
from public.tenants t,
     generate_series(1, 5) as d,
     unnest(array['09:00', '10:00', '11:00', '14:00', '15:00']::time[]) as h
where t.slug = 'keys'
on conflict (tenant_id, weekday, slot_time) do update set meeting_type = excluded.meeting_type;

-- Se quitó la franja de las 4 p. m. (16:00); se borra por si una ejecución
-- anterior de este script ya la había dejado sembrada.
delete from public.booking_availability a
using public.tenants t
where a.tenant_id = t.id and t.slug = 'keys' and a.slot_time = '16:00';

-- De noche (8:30 p. m.) es videollamada con pantalla compartida, para mostrar los prototipos en vivo.
insert into public.booking_availability (tenant_id, weekday, slot_time, meeting_type)
select t.id, d, '20:30'::time, 'videollamada'
from public.tenants t,
     generate_series(1, 5) as d
where t.slug = 'keys'
on conflict (tenant_id, weekday, slot_time) do update set meeting_type = excluded.meeting_type;

-- ---------------------------------------------------------------------
-- 4) Funciones públicas para el landing
-- ---------------------------------------------------------------------

-- Horarios libres de un negocio (no expone datos de nadie).
-- Se eliminó el "create or replace" porque cambia la forma de la tabla devuelta
-- (se agregó la columna tipo) y Postgres no permite eso con replace; se dropea primero.
drop function if exists public.get_available_slots(text, int);

create function public.get_available_slots(p_tenant_slug text, p_days int default 14)
returns table (fecha date, hora time, tipo text)
language sql
stable
security definer
set search_path = public
as $$
  with t as (
    select id from public.tenants where slug = p_tenant_slug
  ),
  hoy as (
    select (now() at time zone 'America/Bogota')::date as d
  ),
  dias as (
    select g::date as dia
    from hoy,
         generate_series((hoy.d + 1)::timestamp,
                         (hoy.d + least(greatest(p_days, 1), 30))::timestamp,
                         interval '1 day') as g
  )
  select dias.dia, a.slot_time, a.meeting_type
  from t
  join public.booking_availability a on a.tenant_id = t.id and a.active
  join dias on a.weekday = extract(isodow from dias.dia)
  where not exists (
          select 1 from public.appointments ap
          where ap.tenant_id = t.id and ap.appt_date = dias.dia and ap.appt_time = a.slot_time
            and ap.status in ('pendiente', 'confirmada'))
    and not exists (
          select 1 from public.booking_blocks b
          where b.tenant_id = t.id and b.block_date = dias.dia
            and (b.slot_time is null or b.slot_time = a.slot_time))
  order by 1, 2;
$$;

-- Reservar y llenar el CRM del negocio en un solo paso.
create or replace function public.book_appointment(
  p_tenant_slug     text,
  p_date            date,
  p_time            time,
  p_name            text,
  p_phone           text,
  p_email           text    default null,
  p_business_name   text    default null,
  p_business_type   text    default null,
  p_city            text    default null,
  p_interests       text[]  default '{}',
  p_message         text    default null,
  p_data_consent    boolean default false,
  p_whatsapp_opt_in boolean default false,
  p_email_opt_in    boolean default false,
  p_utm             jsonb   default '{}'::jsonb,
  p_page            text    default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant    uuid;
  v_phone     text := public.normalize_phone_co(p_phone);
  v_email     text := nullif(lower(btrim(coalesce(p_email, ''))), '');
  v_name      text := btrim(coalesce(p_name, ''));
  v_biz       text := nullif(left(btrim(coalesce(p_business_name, '')), 160), '');
  v_type      text := nullif(left(btrim(coalesce(p_business_type, '')), 80), '');
  v_city      text := nullif(left(btrim(coalesce(p_city, '')), 80), '');
  v_msg       text := nullif(left(btrim(coalesce(p_message, '')), 1000), '');
  v_interests text[];
  v_contact   uuid;
  v_appt      uuid;
  v_meeting_type text;
begin
  select id into v_tenant from public.tenants where slug = p_tenant_slug;
  if v_tenant is null then
    raise exception 'negocio_no_encontrado' using errcode = 'P0001';
  end if;
  if not coalesce(p_data_consent, false) then
    raise exception 'falta_autorizacion_datos' using errcode = 'P0001';
  end if;
  if char_length(v_name) not between 2 and 120 then
    raise exception 'nombre_invalido' using errcode = 'P0001';
  end if;
  if v_phone !~ '^[0-9]{7,15}$' then
    raise exception 'whatsapp_invalido' using errcode = 'P0001';
  end if;
  if v_email is not null and (char_length(v_email) > 160
      or v_email !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$') then
    raise exception 'correo_invalido' using errcode = 'P0001';
  end if;
  if coalesce(p_email_opt_in, false) and v_email is null then
    raise exception 'falta_correo' using errcode = 'P0001';
  end if;

  -- Intereses: sin vacíos, sin repetidos, máximo 10.
  select coalesce(array_agg(i), '{}') into v_interests
  from (select distinct left(btrim(x), 60) as i
        from unnest(coalesce(p_interests, '{}')) as x
        where btrim(x) <> ''
        limit 10) s;

  -- Evita que dos envíos simultáneos del mismo número creen dos contactos.
  perform pg_advisory_xact_lock(hashtext(v_tenant::text || ':' || v_phone));

  select s.tipo into v_meeting_type
  from public.get_available_slots(p_tenant_slug, 30) s
  where s.fecha = p_date and s.hora = p_time
  limit 1;

  if v_meeting_type is null then
    raise exception 'horario_no_disponible' using errcode = 'P0001';
  end if;

  -- Anti-abuso: máximo 2 reuniones activas a futuro por número.
  if (select count(*) from public.appointments a
      where a.tenant_id = v_tenant and a.phone = v_phone
        and a.status in ('pendiente', 'confirmada')
        and a.appt_date >= (now() at time zone 'America/Bogota')::date) >= 2 then
    raise exception 'demasiadas_citas' using errcode = 'P0001';
  end if;

  -- Contacto del CRM (el teléfono normalizado es la llave dentro del negocio).
  select id into v_contact
  from public.contacts
  where tenant_id = v_tenant and public.normalize_phone_co(phone) = v_phone
  order by created_at
  limit 1;

  if v_contact is null then
    insert into public.contacts (
      tenant_id, name, email, phone, source, tags,
      business_name, business_type, city, interests, stage, last_contact_at,
      data_consent_at, email_opt_in, whatsapp_opt_in, marketing_consent_at,
      utm_source, utm_medium, utm_campaign, landing_page
    ) values (
      v_tenant, v_name, v_email, v_phone, 'landing', array['landing'],
      v_biz, v_type, v_city, v_interests, 'reunion_agendada', now(),
      now(), coalesce(p_email_opt_in, false), coalesce(p_whatsapp_opt_in, false), now(),
      nullif(left(coalesce(p_utm ->> 'source',   ''), 200), ''),
      nullif(left(coalesce(p_utm ->> 'medium',   ''), 200), ''),
      nullif(left(coalesce(p_utm ->> 'campaign', ''), 200), ''),
      nullif(left(coalesce(p_page, ''), 300), '')
    )
    returning id into v_contact;
  else
    update public.contacts c set
      name            = v_name,
      email           = coalesce(v_email, c.email),
      business_name   = coalesce(v_biz,  c.business_name),
      business_type   = coalesce(v_type, c.business_type),
      city            = coalesce(v_city, c.city),
      interests       = (select coalesce(array_agg(y), '{}')
                         from (select distinct y from unnest(c.interests || v_interests) as y limit 20) z),
      tags            = (select coalesce(array_agg(y), '{}')
                         from (select distinct y from unnest(coalesce(c.tags, '{}') || array['landing']) as y) z),
      stage           = case when c.stage in ('nuevo', 'contactado', 'perdido') then 'reunion_agendada' else c.stage end,
      last_contact_at = now(),
      -- La última decisión de la persona sobre sus autorizaciones es la que vale.
      data_consent_at      = now(),
      email_opt_in         = coalesce(p_email_opt_in, false),
      whatsapp_opt_in      = coalesce(p_whatsapp_opt_in, false),
      marketing_consent_at = now(),
      -- Se conserva el origen del primer contacto.
      utm_source   = coalesce(c.utm_source,   nullif(left(coalesce(p_utm ->> 'source',   ''), 200), '')),
      utm_medium   = coalesce(c.utm_medium,   nullif(left(coalesce(p_utm ->> 'medium',   ''), 200), '')),
      utm_campaign = coalesce(c.utm_campaign, nullif(left(coalesce(p_utm ->> 'campaign', ''), 200), '')),
      landing_page = coalesce(c.landing_page, nullif(left(coalesce(p_page, ''), 300), ''))
    where c.id = v_contact;
  end if;

  insert into public.appointments (
    tenant_id, contact_id, appt_date, appt_time, name, phone, email,
    business_name, business_type, city, interests, message, meeting_type
  ) values (
    v_tenant, v_contact, p_date, p_time, v_name, v_phone, v_email,
    v_biz, v_type, v_city, v_interests, v_msg, v_meeting_type
  )
  returning id into v_appt;

  if v_msg is not null then
    insert into public.lead_messages (tenant_id, contact_id, name, email, phone, message)
    values (v_tenant, v_contact, v_name, v_email, v_phone, v_msg);
  end if;

  return v_appt;
exception
  when unique_violation then
    raise exception 'horario_no_disponible' using errcode = 'P0001';
end;
$$;

-- Darse de baja de campañas desde el enlace del correo o mensaje.
create or replace function public.unsubscribe_contact(p_token uuid, p_channel text default 'todo')
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_channel not in ('correo', 'whatsapp', 'todo') then
    raise exception 'canal_invalido' using errcode = 'P0001';
  end if;
  update public.contacts
     set email_opt_in    = case when p_channel in ('correo', 'todo')   then false else email_opt_in end,
         whatsapp_opt_in = case when p_channel in ('whatsapp', 'todo') then false else whatsapp_opt_in end,
         marketing_consent_at = now()
   where unsubscribe_token = p_token
  returning id into v_id;
  return v_id is not null;
end;
$$;

-- ---------------------------------------------------------------------
-- 5) Seguridad
-- ---------------------------------------------------------------------

-- 5a) Los contactos solo los ve y edita el equipo del negocio, no sus clientes.
drop policy if exists contacts_tenant_staff on public.contacts;
create policy contacts_tenant_staff on public.contacts
  for all to authenticated
  using      (tenant_id = public.auth_tenant_id() and public.my_role() in ('admin', 'developer', 'employee'))
  with check (tenant_id = public.auth_tenant_id() and public.my_role() in ('admin', 'developer', 'employee'));

-- 5b) Llaves de Brevo y WhatsApp en una tabla que solo lee el servidor.
create table if not exists public.tenant_secrets (
  tenant_id        uuid primary key
                   references public.tenants(id) on delete cascade
                   deferrable initially deferred,
  brevo_api_key    text,
  whatsapp_api_key text,
  updated_at       timestamptz not null default now()
);
alter table public.tenant_secrets enable row level security;
revoke all on public.tenant_secrets from anon, authenticated;

-- Si el panel de administración guarda una llave en tenants, se mueve aquí
-- y en tenants queda vacía (el panel sigue funcionando sin cambios).
create or replace function public.stash_tenant_secrets()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_brevo text := nullif(btrim(coalesce(new.brevo_api_key, '')), '');
  v_wa    text := nullif(btrim(coalesce(new.whatsapp_api_key, '')), '');
begin
  if v_brevo is not null or v_wa is not null then
    insert into public.tenant_secrets (tenant_id, brevo_api_key, whatsapp_api_key, updated_at)
    values (new.id, v_brevo, v_wa, now())
    on conflict (tenant_id) do update set
      brevo_api_key    = coalesce(excluded.brevo_api_key,    public.tenant_secrets.brevo_api_key),
      whatsapp_api_key = coalesce(excluded.whatsapp_api_key, public.tenant_secrets.whatsapp_api_key),
      updated_at       = now();
  end if;
  new.brevo_api_key    := null;
  new.whatsapp_api_key := null;
  return new;
end;
$$;

drop trigger if exists trg_stash_tenant_secrets on public.tenants;
create trigger trg_stash_tenant_secrets
  before insert or update on public.tenants
  for each row execute function public.stash_tenant_secrets();

-- Mueve las llaves que ya existieran.
update public.tenants set brevo_api_key = brevo_api_key
where brevo_api_key is not null or whatsapp_api_key is not null;

-- Para que el panel sepa si la llave ya está configurada, sin poder leerla.
create or replace function public.tenant_secret_status()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
           'brevo',    coalesce(s.brevo_api_key    is not null, false),
           'whatsapp', coalesce(s.whatsapp_api_key is not null, false))
  from (select public.my_tenant() as t) x
  left join public.tenant_secrets s on s.tenant_id = x.t
  where public.my_role() in ('admin', 'developer');
$$;

-- ---------------------------------------------------------------------
-- 6) Permisos de las funciones
-- ---------------------------------------------------------------------
revoke all on function public.normalize_phone_co(text) from public, anon, authenticated;
revoke all on function public.stash_tenant_secrets() from public, anon, authenticated;
revoke all on function public.get_available_slots(text, int) from public;
revoke all on function public.book_appointment(text, date, time, text, text, text, text, text, text, text[], text, boolean, boolean, boolean, jsonb, text) from public;
revoke all on function public.unsubscribe_contact(uuid, text) from public;
revoke all on function public.tenant_secret_status() from public, anon;

grant execute on function public.get_available_slots(text, int) to anon, authenticated;
grant execute on function public.book_appointment(text, date, time, text, text, text, text, text, text, text[], text, boolean, boolean, boolean, jsonb, text) to anon, authenticated;
grant execute on function public.unsubscribe_contact(uuid, text) to anon, authenticated;
grant execute on function public.tenant_secret_status() to authenticated;

-- =====================================================================
-- 7) Demo pública "Vitrina Virtual" — módulo de CRM y Campañas EN VIVO
--
-- El prototipo de vitrina del landing trae un panel admin con pestañas
-- Productos / Pedidos / Balance / CRM / Campañas. Productos, Pedidos y
-- Balance se quedan como demo local (localStorage) porque son datos de
-- ejemplo del catálogo, pero CRM y Campañas ahora sí leen y escriben en
-- Supabase de verdad, para que Yeison pueda mostrar en vivo cómo
-- quedarían esas dos funciones para un cliente.
--
-- NOTA IMPORTANTE (reescrito tras conectar con el proyecto real de
-- Supabase): este proyecto YA es una base multi-tenant en producción,
-- con tablas `campaigns` / `campaign_recipients` propias — no hay que
-- crearlas ni envolverlas en funciones `demo_*`. El panel
-- (`demos/crm-campanas.html`) habla por REST directo contra
-- `contacts` y `campaigns`, protegido por las políticas RLS que ya
-- existen en esas tablas (`contacts_tenant_staff`,
-- `tenant_isolation_campaigns`), exactamente igual que cualquier otro
-- negocio del sistema. Lo único que hace falta aplicar es:
--   a) un tenant propio ('vitrina-demo') para que esta demo nunca
--      comparta fila con un cliente real (ni con 'am-belleza-spa'),
--   b) el estado "cerrado" en contacts.stage, que el embudo real no usaba.
--
-- El panel es solo para Yeison: pide iniciar sesión con un usuario real
-- de Supabase Auth (creado una sola vez en el Dashboard, con metadata
-- {"tenant_slug":"vitrina-demo"} y rol subido a 'admin' por SQL — ver
-- CLAUDE.md). Sin esa sesión, las políticas RLS de `contacts` y
-- `campaigns` no dejan leer ni escribir nada: el anon key público del
-- landing no alcanza por sí solo.
-- =====================================================================

insert into public.tenants (slug, name, contact_email)
values ('vitrina-demo', 'KEYS · Vitrina Virtual (demo privada)', 'keysmarketingdigital@gmail.com')
on conflict (slug) do nothing;

-- El CRM de la demo usa un estado "cerrado" que el embudo real no tenía.
alter table public.contacts drop constraint if exists contacts_stage_check;
alter table public.contacts add constraint contacts_stage_check
  check (stage in ('nuevo', 'contactado', 'reunion_agendada', 'propuesta', 'cliente', 'perdido', 'cerrado'));

-- Las tablas `campaigns` y `campaign_recipients`, y sus políticas RLS
-- (`tenant_isolation_campaigns`, `tenant_isolation_campaign_recipients`),
-- ya existían en este proyecto antes de esta demo — no se tocan aquí.
-- Esquema real de `campaigns` (para referencia del panel):
--   id uuid · tenant_id uuid · name text · product_id uuid (nulo, FK a un
--   catálogo que esta demo no usa) · landing_url text · channel_email bool
--   · channel_whatsapp bool · message text · scheduled_date date (NOT NULL)
--   · scheduled_time time (NOT NULL, default 09:00) · status text
--   (default 'programada') · created_at timestamptz.
-- Como no hay columna libre de "producto/servicio" (solo el product_id
-- del catálogo), el panel la guarda como primera línea de `message`
-- ("Producto/servicio: …") y la separa de nuevo al mostrarla.

-- ---------------------------------------------------------------------
-- 7e) Categorías con imagen y descripción propias (pestaña "Categorías"
--     del panel). La tabla real `categories` solo tenía key/label_es/
--     label_en/sort_order, y tenía RLS activado SIN ninguna política
--     (nadie podía leer ni escribir ahí, de ningún tenant). Se agregan
--     las dos columnas que faltan y las políticas, en el mismo patrón
--     que ya usan `products`/`contacts` para cada negocio.
-- ---------------------------------------------------------------------
alter table public.categories
  add column if not exists image_url text,
  add column if not exists description text;

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
  for select to anon, authenticated
  using (true);

drop policy if exists categories_tenant_staff on public.categories;
create policy categories_tenant_staff on public.categories
  for all to authenticated
  using      (tenant_id = public.my_tenant() and public.my_role() in ('admin', 'developer', 'employee'))
  with check (tenant_id = public.my_tenant() and public.my_role() in ('admin', 'developer', 'employee'));

grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;

-- ---------------------------------------------------------------------
-- 7f) Subida de imágenes desde PC/celular para categorías y productos.
--     El bucket 'catalog-images' ya se creó (público para lectura), pero
--     sus políticas de Storage son DDL y el entorno tampoco las deja
--     aplicar en automático. Sin esto, cualquiera con la anon key podría
--     subir o borrar archivos en el bucket.
-- ---------------------------------------------------------------------
drop policy if exists catalog_images_public_read on storage.objects;
create policy catalog_images_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'catalog-images');

drop policy if exists catalog_images_staff_write on storage.objects;
create policy catalog_images_staff_write on storage.objects
  for insert to authenticated
  with check (bucket_id = 'catalog-images' and public.my_role() in ('admin', 'developer', 'employee'));

drop policy if exists catalog_images_staff_update on storage.objects;
create policy catalog_images_staff_update on storage.objects
  for update to authenticated
  using      (bucket_id = 'catalog-images' and public.my_role() in ('admin', 'developer', 'employee'))
  with check (bucket_id = 'catalog-images' and public.my_role() in ('admin', 'developer', 'employee'));

drop policy if exists catalog_images_staff_delete on storage.objects;
create policy catalog_images_staff_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'catalog-images' and public.my_role() in ('admin', 'developer', 'employee'));
