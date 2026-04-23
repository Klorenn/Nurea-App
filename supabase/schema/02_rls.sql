-- ============================================================================
--  NUREA · SCHEMA CONSOLIDADO · 02 — Row Level Security
--  Ejecutar después de 01_schema.sql
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- Helper: saber si el usuario actual es admin (sin recursión en RLS)
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ----------------------------------------------------------------------------
-- Helper: saber si el usuario actual es profesional
-- ----------------------------------------------------------------------------
create or replace function public.is_professional()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'professional'
  );
$$;

grant execute on function public.is_admin()        to anon, authenticated;
grant execute on function public.is_professional() to anon, authenticated;

-- ============================================================================
--  PROFILES
-- ============================================================================
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_all"       on public.profiles;
drop policy if exists "profiles_insert_self"      on public.profiles;
drop policy if exists "profiles_update_self"      on public.profiles;
drop policy if exists "profiles_update_admin"     on public.profiles;
drop policy if exists "profiles_delete_admin"     on public.profiles;

-- Lectura pública del perfil básico (nombre, rol, avatar) — la app ya filtra.
create policy "profiles_select_all" on public.profiles
  for select using (true);

create policy "profiles_insert_self" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_self" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

create policy "profiles_delete_admin" on public.profiles
  for delete using (public.is_admin());


-- ============================================================================
--  CATEGORIES / SPECIALTIES / SEARCH_SYNONYMS
-- ============================================================================
alter table public.categories         enable row level security;
alter table public.specialties        enable row level security;
alter table public.search_synonyms    enable row level security;

drop policy if exists "cat_select_all"    on public.categories;
drop policy if exists "cat_write_admin"   on public.categories;
create policy "cat_select_all"  on public.categories for select using (true);
create policy "cat_write_admin" on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "spec_select_all"   on public.specialties;
drop policy if exists "spec_write_admin"  on public.specialties;
create policy "spec_select_all"  on public.specialties for select using (true);
create policy "spec_write_admin" on public.specialties for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "syn_select_all"    on public.search_synonyms;
drop policy if exists "syn_write_admin"   on public.search_synonyms;
create policy "syn_select_all"  on public.search_synonyms for select using (true);
create policy "syn_write_admin" on public.search_synonyms for all
  using (public.is_admin()) with check (public.is_admin());


-- ============================================================================
--  PROFESSIONALS / PROFESSIONAL_SPECIALTIES / CREDENTIALS
-- ============================================================================
alter table public.professionals             enable row level security;
alter table public.professional_specialties  enable row level security;
alter table public.professional_credentials  enable row level security;

drop policy if exists "pros_select_all"       on public.professionals;
drop policy if exists "pros_insert_self"      on public.professionals;
drop policy if exists "pros_update_self"      on public.professionals;
drop policy if exists "pros_update_admin"     on public.professionals;

create policy "pros_select_all"   on public.professionals for select using (true);
create policy "pros_insert_self"  on public.professionals for insert
  with check (auth.uid() = id and public.is_professional());
create policy "pros_update_self"  on public.professionals for update
  using (auth.uid() = id) with check (auth.uid() = id);
create policy "pros_update_admin" on public.professionals for update
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "ps_select_all"    on public.professional_specialties;
drop policy if exists "ps_write_self"    on public.professional_specialties;
create policy "ps_select_all" on public.professional_specialties for select using (true);
create policy "ps_write_self" on public.professional_specialties for all
  using (auth.uid() = professional_id or public.is_admin())
  with check (auth.uid() = professional_id or public.is_admin());

drop policy if exists "pc_select_self_or_verified" on public.professional_credentials;
drop policy if exists "pc_insert_self"             on public.professional_credentials;
drop policy if exists "pc_update_self"             on public.professional_credentials;
drop policy if exists "pc_admin_all"               on public.professional_credentials;

create policy "pc_select_self_or_verified" on public.professional_credentials for select
  using (
    status = 'verified'
    or auth.uid() = professional_id
    or public.is_admin()
  );
create policy "pc_insert_self" on public.professional_credentials for insert
  with check (auth.uid() = professional_id);
create policy "pc_update_self" on public.professional_credentials for update
  using (auth.uid() = professional_id) with check (auth.uid() = professional_id);
create policy "pc_admin_all" on public.professional_credentials for all
  using (public.is_admin()) with check (public.is_admin());


-- ============================================================================
--  APPOINTMENTS
-- ============================================================================
alter table public.appointments enable row level security;

drop policy if exists "appt_select_participants" on public.appointments;
drop policy if exists "appt_insert_patient"      on public.appointments;
drop policy if exists "appt_update_participants" on public.appointments;
drop policy if exists "appt_delete_admin"        on public.appointments;

create policy "appt_select_participants" on public.appointments for select
  using (
    auth.uid() = patient_id
    or auth.uid() = professional_id
    or public.is_admin()
  );

create policy "appt_insert_patient" on public.appointments for insert
  with check (auth.uid() = patient_id);

create policy "appt_update_participants" on public.appointments for update
  using (
    auth.uid() = patient_id
    or auth.uid() = professional_id
    or public.is_admin()
  )
  with check (
    auth.uid() = patient_id
    or auth.uid() = professional_id
    or public.is_admin()
  );

create policy "appt_delete_admin" on public.appointments for delete
  using (public.is_admin());


-- ============================================================================
--  MEDICAL_RECORDS · súper estricto
-- ============================================================================
alter table public.medical_records enable row level security;

drop policy if exists "mr_select_owner"   on public.medical_records;
drop policy if exists "mr_insert_pro"     on public.medical_records;
drop policy if exists "mr_update_pro"     on public.medical_records;
drop policy if exists "mr_delete_pro"     on public.medical_records;

create policy "mr_select_owner" on public.medical_records for select
  using (
    auth.uid() = patient_id
    or auth.uid() = professional_id
    or public.is_admin()
  );

create policy "mr_insert_pro" on public.medical_records for insert
  with check (auth.uid() = professional_id and public.is_professional());

create policy "mr_update_pro" on public.medical_records for update
  using (auth.uid() = professional_id)
  with check (auth.uid() = professional_id);

create policy "mr_delete_pro" on public.medical_records for delete
  using (auth.uid() = professional_id or public.is_admin());


-- ============================================================================
--  PRESCRIPTIONS / DOCUMENTS
-- ============================================================================
alter table public.prescriptions enable row level security;

drop policy if exists "rx_select_owner"  on public.prescriptions;
drop policy if exists "rx_insert_pro"    on public.prescriptions;
drop policy if exists "rx_update_pro"    on public.prescriptions;

create policy "rx_select_owner" on public.prescriptions for select
  using (
    auth.uid() = patient_id
    or auth.uid() = professional_id
    or public.is_admin()
  );

create policy "rx_insert_pro" on public.prescriptions for insert
  with check (auth.uid() = professional_id);

create policy "rx_update_pro" on public.prescriptions for update
  using (auth.uid() = professional_id) with check (auth.uid() = professional_id);


alter table public.documents enable row level security;

drop policy if exists "docs_select_access"  on public.documents;
drop policy if exists "docs_insert_owner"   on public.documents;
drop policy if exists "docs_update_owner"   on public.documents;
drop policy if exists "docs_delete_owner"   on public.documents;

create policy "docs_select_access" on public.documents for select
  using (
    public.is_admin()
    or (access_level = 'admin_only' and public.is_admin())
    or (access_level = 'patient_only'             and auth.uid() = patient_id)
    or (access_level = 'professional_only'        and auth.uid() = professional_id)
    or (access_level = 'patient_and_professional' and (auth.uid() = patient_id or auth.uid() = professional_id))
  );

create policy "docs_insert_owner" on public.documents for insert
  with check (auth.uid() = uploaded_by);

create policy "docs_update_owner" on public.documents for update
  using (auth.uid() = uploaded_by or public.is_admin())
  with check (auth.uid() = uploaded_by or public.is_admin());

create policy "docs_delete_owner" on public.documents for delete
  using (auth.uid() = uploaded_by or public.is_admin());


-- ============================================================================
--  CONVERSATIONS / CHAT_MESSAGES
-- ============================================================================
alter table public.conversations enable row level security;

drop policy if exists "conv_select_parts"  on public.conversations;
drop policy if exists "conv_insert_self"   on public.conversations;
drop policy if exists "conv_update_parts"  on public.conversations;

create policy "conv_select_parts" on public.conversations for select
  using (
    auth.uid() = initiated_by
    or auth.uid() = professional_id
    or public.is_admin()
  );

create policy "conv_insert_self" on public.conversations for insert
  with check (auth.uid() = initiated_by);

create policy "conv_update_parts" on public.conversations for update
  using (auth.uid() = initiated_by or auth.uid() = professional_id)
  with check (auth.uid() = initiated_by or auth.uid() = professional_id);


alter table public.chat_messages enable row level security;

drop policy if exists "msg_select_parts"  on public.chat_messages;
drop policy if exists "msg_insert_parts"  on public.chat_messages;
drop policy if exists "msg_update_sender" on public.chat_messages;

create policy "msg_select_parts" on public.chat_messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = chat_messages.conversation_id
        and (auth.uid() = c.initiated_by or auth.uid() = c.professional_id)
    )
    or public.is_admin()
  );

create policy "msg_insert_parts" on public.chat_messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = chat_messages.conversation_id
        and (auth.uid() = c.initiated_by or auth.uid() = c.professional_id)
    )
  );

create policy "msg_update_sender" on public.chat_messages for update
  using (auth.uid() = sender_id) with check (auth.uid() = sender_id);


-- ============================================================================
--  REVIEWS / FAVORITES
-- ============================================================================
alter table public.reviews enable row level security;

drop policy if exists "rev_select_all"      on public.reviews;
drop policy if exists "rev_insert_patient"  on public.reviews;
drop policy if exists "rev_update_self"     on public.reviews;
drop policy if exists "rev_reply_pro"       on public.reviews;

create policy "rev_select_all" on public.reviews for select using (true);

create policy "rev_insert_patient" on public.reviews for insert
  with check (
    auth.uid() = patient_id
    and exists (
      select 1 from public.appointments a
      where a.id = reviews.appointment_id
        and a.patient_id = auth.uid()
        and a.status = 'completed'
    )
  );

create policy "rev_update_self" on public.reviews for update
  using (auth.uid() = patient_id) with check (auth.uid() = patient_id);

-- El profesional solo puede agregar/editar su respuesta (review_reply)
create policy "rev_reply_pro" on public.reviews for update
  using (auth.uid() = professional_id) with check (auth.uid() = professional_id);


alter table public.favorites enable row level security;

drop policy if exists "fav_select_self" on public.favorites;
drop policy if exists "fav_write_self"  on public.favorites;

create policy "fav_select_self" on public.favorites for select
  using (auth.uid() = patient_id or public.is_admin());

create policy "fav_write_self" on public.favorites for all
  using (auth.uid() = patient_id) with check (auth.uid() = patient_id);


-- ============================================================================
--  PAYMENTS
-- ============================================================================
alter table public.payments enable row level security;

drop policy if exists "pay_select_participants" on public.payments;
drop policy if exists "pay_admin_all"           on public.payments;

create policy "pay_select_participants" on public.payments for select
  using (
    auth.uid() = patient_id
    or auth.uid() = professional_id
    or public.is_admin()
  );

create policy "pay_admin_all" on public.payments for all
  using (public.is_admin()) with check (public.is_admin());


-- ============================================================================
--  SUPPORT_TICKETS / TICKET_MESSAGES
-- ============================================================================
alter table public.support_tickets enable row level security;

drop policy if exists "tkt_select_self"  on public.support_tickets;
drop policy if exists "tkt_insert_self"  on public.support_tickets;
drop policy if exists "tkt_update_self"  on public.support_tickets;
drop policy if exists "tkt_admin_all"    on public.support_tickets;

create policy "tkt_select_self" on public.support_tickets for select
  using (auth.uid() = user_id or public.is_admin());
create policy "tkt_insert_self" on public.support_tickets for insert
  with check (auth.uid() = user_id);
create policy "tkt_update_self" on public.support_tickets for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tkt_admin_all"   on public.support_tickets for all
  using (public.is_admin()) with check (public.is_admin());

alter table public.ticket_messages enable row level security;

drop policy if exists "tktmsg_select_parts"  on public.ticket_messages;
drop policy if exists "tktmsg_insert_parts"  on public.ticket_messages;

create policy "tktmsg_select_parts" on public.ticket_messages for select
  using (
    exists (
      select 1 from public.support_tickets t
      where t.id = ticket_messages.ticket_id
        and (t.user_id = auth.uid() or public.is_admin())
    )
  );
create policy "tktmsg_insert_parts" on public.ticket_messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.support_tickets t
      where t.id = ticket_messages.ticket_id
        and (t.user_id = auth.uid() or public.is_admin())
    )
  );


-- ============================================================================
--  NOTIFICATIONS
-- ============================================================================
alter table public.notifications enable row level security;

drop policy if exists "notif_select_self" on public.notifications;
drop policy if exists "notif_update_self" on public.notifications;
drop policy if exists "notif_admin_all"   on public.notifications;

create policy "notif_select_self" on public.notifications for select
  using (auth.uid() = user_id or public.is_admin());
create policy "notif_update_self" on public.notifications for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notif_admin_all" on public.notifications for all
  using (public.is_admin()) with check (public.is_admin());


alter table public.admin_notifications enable row level security;

drop policy if exists "adminnotif_admin_all" on public.admin_notifications;
create policy "adminnotif_admin_all" on public.admin_notifications for all
  using (public.is_admin()) with check (public.is_admin());


-- ============================================================================
--  PLATFORM_SETTINGS / WAITLIST / AUDIT_LOG
-- ============================================================================
alter table public.platform_settings enable row level security;

drop policy if exists "plat_select_all"  on public.platform_settings;
drop policy if exists "plat_write_admin" on public.platform_settings;

create policy "plat_select_all"  on public.platform_settings for select using (true);
create policy "plat_write_admin" on public.platform_settings for all
  using (public.is_admin()) with check (public.is_admin());


alter table public.waitlist enable row level security;

drop policy if exists "wl_insert_public" on public.waitlist;
drop policy if exists "wl_select_admin"  on public.waitlist;

-- Cualquiera (anónimo o logueado) puede apuntarse; solo admin ve la lista.
create policy "wl_insert_public" on public.waitlist for insert with check (true);
create policy "wl_select_admin"  on public.waitlist for select using (public.is_admin());


alter table public.audit_log enable row level security;

drop policy if exists "audit_admin_read" on public.audit_log;
create policy "audit_admin_read" on public.audit_log for select using (public.is_admin());

commit;
