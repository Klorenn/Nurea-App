-- ============================================================================
--  NUREA · SCHEMA CONSOLIDADO · 01 — Tablas
--  Chile · Temuco · Plataforma de cuidado y bienestar
-- ============================================================================

begin;

-- ============================================================================
--  PROFILES · Perfil universal (paciente, profesional, admin)
--  FK 1:1 con auth.users (ON DELETE CASCADE vía trigger de creación)
-- ============================================================================
create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  role              text not null default 'patient'
                    check (role in ('patient','professional','admin')),
  first_name        text,
  last_name         text,
  email             citext,
  email_verified    boolean not null default false,
  phone             text,
  show_phone        boolean not null default false,
  date_of_birth     date,
  gender            text check (gender in ('female','male','non_binary','prefer_not_to_say','other')),
  national_id       text,                         -- RUT
  health_insurance  text,                         -- Fonasa / Isapre / Particular
  avatar_url        text,
  address           text,
  city              text default 'Temuco',
  region            text default 'Araucanía',
  country           text not null default 'CL',
  language          text not null default 'es' check (language in ('es','en')),
  -- Paciente
  allergies              text,
  chronic_diseases       text,
  current_medications    text,
  patient_goal           text,
  -- Profesional (breve)
  professional_title     text,
  -- Onboarding / estado
  is_onboarded           boolean not null default false,
  onboarding_completed   boolean not null default false,
  status                 text not null default 'offline'
                         check (status in ('online','offline','away','busy')),
  last_seen              timestamptz,
  response_time          text,
  -- Suscripción / pagos
  subscription_status    text default 'inactive'
                         check (subscription_status in
                           ('inactive','active','past_due','canceled','trialing','unpaid','pending_approval')),
  trial_end_date         timestamptz,
  selected_plan_id       text,
  stripe_customer_id     text,
  stripe_subscription_id text,
  mp_user_id             text,
  mp_access_token        text,
  mp_refresh_token       text,
  mp_public_key          text,
  mp_token_updated_at    timestamptz,
  -- Meta
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.profiles is
  'Perfil universal de Nurea. 1 registro por auth.users.id. Cubre paciente, profesional y admin.';

create index if not exists idx_profiles_role          on public.profiles(role);
create index if not exists idx_profiles_email         on public.profiles(email);
create index if not exists idx_profiles_national_id   on public.profiles(national_id);
create index if not exists idx_profiles_city          on public.profiles(city);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.tg_set_updated_at();


-- ============================================================================
--  CATEGORIES · Agrupación de especialidades (médica, wellness, dental…)
-- ============================================================================
create table if not exists public.categories (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name_es         text not null,
  name_en         text,
  description_es  text,
  description_en  text,
  icon            text,
  sort_order      int not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);


-- ============================================================================
--  SPECIALTIES · Taxonomía médica/wellness
-- ============================================================================
create table if not exists public.specialties (
  id                uuid primary key default gen_random_uuid(),
  category_id       uuid references public.categories(id) on delete set null,
  parent_id         uuid references public.specialties(id) on delete set null,
  slug              text not null unique,
  name_es           text not null,
  name_en           text,
  icon              text,
  requires_license  boolean not null default true,
  is_active         boolean not null default true,
  sort_order        int not null default 0,
  created_at        timestamptz not null default now()
);

create index if not exists idx_specialties_category on public.specialties(category_id);
create index if not exists idx_specialties_active   on public.specialties(is_active);


-- ============================================================================
--  SEARCH_SYNONYMS · Sinónimos por especialidad
-- ============================================================================
create table if not exists public.search_synonyms (
  id            uuid primary key default gen_random_uuid(),
  specialty_id  uuid not null references public.specialties(id) on delete cascade,
  synonym       text not null,
  unique (specialty_id, synonym)
);


-- ============================================================================
--  PROFESSIONALS · Datos clínicos / comerciales del profesional
-- ============================================================================
create table if not exists public.professionals (
  id                         uuid primary key references public.profiles(id) on delete cascade,
  slug                       text unique,
  specialty_id               uuid references public.specialties(id) on delete set null,
  bio                        text,
  bio_extended               text,
  university                 text,
  years_experience           int check (years_experience >= 0 and years_experience <= 80),
  languages                  text[] default array['es']::text[],
  -- Registro profesional Chile
  registration_number        text,
  registration_institution   text default 'Superintendencia de Salud · Chile',
  professional_license_number text,
  license_issuing_institution text,
  license_country            text default 'CL',
  license_expiry_date        date,
  -- Modalidad y precios (CLP por defecto)
  consultation_type          text not null default 'both'
                             check (consultation_type in ('online','in-person','both')),
  consultation_types         jsonb not null default '[]'::jsonb,
  online_price               numeric(12,2),
  in_person_price            numeric(12,2),
  consultation_price         numeric(12,2),
  currency                   text not null default 'CLP' check (currency in ('CLP','USD')),
  -- Ubicación
  clinic_address             text,
  city                       text default 'Temuco',
  region                     text default 'Araucanía',
  latitude                   numeric(10,7),
  longitude                  numeric(10,7),
  -- Verificación KYP
  verified                   boolean not null default false,
  verification_status        text not null default 'pending'
                             check (verification_status in ('pending','under_review','verified','rejected')),
  verification_date          timestamptz,
  verification_document_url  text,
  verification_document_name text,
  verification_notes         text,
  verified_by                uuid references public.profiles(id),
  -- Configuración pro
  availability               jsonb not null default '{}'::jsonb,
  booking_auto_message       text,
  awards_and_courses         jsonb not null default '[]'::jsonb,
  accepted_insurances        text[] default array[]::text[],
  -- Pagos
  stripe_account_id          text,
  payouts_enabled            boolean not null default false,
  stellar_wallet             text,
  -- Ratings (derivados)
  rating                     numeric(3,2) not null default 0,
  average_rating             numeric(3,2) not null default 0,
  review_count               int not null default 0,
  -- Meta
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);

create index if not exists idx_professionals_specialty   on public.professionals(specialty_id);
create index if not exists idx_professionals_city        on public.professionals(city);
create index if not exists idx_professionals_verified    on public.professionals(verified);
create index if not exists idx_professionals_consult_t   on public.professionals(consultation_type);
create index if not exists idx_professionals_slug        on public.professionals(slug);

drop trigger if exists trg_professionals_updated_at on public.professionals;
create trigger trg_professionals_updated_at
  before update on public.professionals
  for each row execute function public.tg_set_updated_at();


-- ============================================================================
--  PROFESSIONAL_SPECIALTIES · Relación M2M profesional ↔ especialidades
-- ============================================================================
create table if not exists public.professional_specialties (
  id                uuid primary key default gen_random_uuid(),
  professional_id   uuid not null references public.professionals(id) on delete cascade,
  specialty_id      uuid not null references public.specialties(id) on delete cascade,
  is_primary        boolean not null default false,
  certification_url text,
  certified_at      timestamptz,
  created_at        timestamptz not null default now(),
  unique (professional_id, specialty_id)
);

create index if not exists idx_ps_professional on public.professional_specialties(professional_id);
create index if not exists idx_ps_specialty    on public.professional_specialties(specialty_id);


-- ============================================================================
--  PROFESSIONAL_CREDENTIALS · Títulos y certificados con validación
-- ============================================================================
create table if not exists public.professional_credentials (
  id               uuid primary key default gen_random_uuid(),
  professional_id  uuid not null references public.professionals(id) on delete cascade,
  title            text not null,
  institution      text not null,
  year             text,
  type             text not null check (type in ('Título','Diplomado','Magíster','Curso','Especialidad','Licencia')),
  file_url         text,
  status           text not null default 'pending' check (status in ('pending','verified','rejected')),
  rejection_reason text,
  verified_at      timestamptz,
  verified_by      uuid references public.profiles(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_pc_professional on public.professional_credentials(professional_id);
create index if not exists idx_pc_status       on public.professional_credentials(status);


-- ============================================================================
--  APPOINTMENTS · Citas paciente ↔ profesional
-- ============================================================================
create table if not exists public.appointments (
  id                 uuid primary key default gen_random_uuid(),
  patient_id         uuid not null references public.profiles(id) on delete cascade,
  professional_id    uuid not null references public.professionals(id) on delete cascade,
  appointment_date   date not null,
  appointment_time   time not null,
  duration_minutes   int  not null default 30 check (duration_minutes between 5 and 240),
  type               text not null default 'online' check (type in ('online','in-person')),
  is_online          boolean generated always as (type = 'online') stored,
  status             text not null default 'pending'
                     check (status in ('pending','confirmed','cancelled','completed','no_show')),
  payment_status     text default 'pending'
                     check (payment_status in ('pending','paid','refunded','held_escrow','failed')),
  price              numeric(12,2),
  currency           text not null default 'CLP',
  meeting_link       text,
  meeting_room_id    text,
  video_platform     text,
  meeting_expires_at timestamptz,
  review_request_sent boolean not null default false,
  cancellation_reason text,
  cancelled_by       uuid references public.profiles(id),
  cancelled_at       timestamptz,
  notes_patient      text,            -- nota del paciente al agendar
  notes_professional text,            -- nota interna del pro
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists idx_appointments_patient      on public.appointments(patient_id);
create index if not exists idx_appointments_professional on public.appointments(professional_id);
create index if not exists idx_appointments_date_time    on public.appointments(appointment_date, appointment_time);
create index if not exists idx_appointments_status       on public.appointments(status);

drop trigger if exists trg_appointments_updated_at on public.appointments;
create trigger trg_appointments_updated_at
  before update on public.appointments
  for each row execute function public.tg_set_updated_at();


-- ============================================================================
--  MEDICAL_RECORDS · Ficha clínica ultra-sensible
-- ============================================================================
create table if not exists public.medical_records (
  id                       uuid primary key default gen_random_uuid(),
  patient_id               uuid not null references public.profiles(id) on delete cascade,
  professional_id          uuid not null references public.profiles(id) on delete set null,
  appointment_id           uuid references public.appointments(id) on delete set null,
  reason_for_visit         text,
  chief_complaint          text,
  diagnosis                text,
  diagnosis_code           text,                     -- CIE-10
  treatment                text,
  prescription             text,
  follow_up_instructions   text,
  follow_up_date           date,
  vital_signs              jsonb,
  attachments              jsonb not null default '[]'::jsonb,
  private_notes            text,                    -- NO visible al paciente
  is_draft                 boolean not null default true,
  is_signed                boolean not null default false,
  signed_at                timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  deleted_at               timestamptz              -- soft delete
);

create index if not exists idx_mr_patient       on public.medical_records(patient_id) where deleted_at is null;
create index if not exists idx_mr_professional  on public.medical_records(professional_id) where deleted_at is null;
create index if not exists idx_mr_appointment   on public.medical_records(appointment_id);

drop trigger if exists trg_mr_updated_at on public.medical_records;
create trigger trg_mr_updated_at
  before update on public.medical_records
  for each row execute function public.tg_set_updated_at();


-- ============================================================================
--  PRESCRIPTIONS · Recetas
-- ============================================================================
create table if not exists public.prescriptions (
  id                uuid primary key default gen_random_uuid(),
  medical_record_id uuid references public.medical_records(id) on delete set null,
  professional_id   uuid not null references public.profiles(id) on delete cascade,
  patient_id        uuid not null references public.profiles(id) on delete cascade,
  medication_name   text not null,
  dosage            text,
  frequency         text,
  duration          text,
  instructions      text,
  is_signed         boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_rx_patient       on public.prescriptions(patient_id);
create index if not exists idx_rx_professional  on public.prescriptions(professional_id);


-- ============================================================================
--  DOCUMENTS · Documentos médicos (laboratorio, radiografía, etc.)
-- ============================================================================
create table if not exists public.documents (
  id               uuid primary key default gen_random_uuid(),
  patient_id       uuid references public.profiles(id) on delete cascade,
  professional_id  uuid references public.profiles(id) on delete set null,
  appointment_id   uuid references public.appointments(id) on delete set null,
  uploaded_by      uuid references public.profiles(id) on delete set null,
  name             text not null,
  description      text,
  file_name        text not null,
  file_url         text not null,
  file_type        text,
  file_size        bigint,
  category         text check (category in
                     ('lab_result','imaging','prescription','referral','insurance','consent','report','other')),
  encrypted        boolean not null default false,
  access_level     text not null default 'patient_and_professional'
                   check (access_level in
                     ('patient_only','professional_only','patient_and_professional','admin_only')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_docs_patient       on public.documents(patient_id);
create index if not exists idx_docs_professional  on public.documents(professional_id);
create index if not exists idx_docs_category      on public.documents(category);


-- ============================================================================
--  CONVERSATIONS / CHAT_MESSAGES · Chat paciente ↔ profesional
-- ============================================================================
create table if not exists public.conversations (
  id               uuid primary key default gen_random_uuid(),
  initiated_by     uuid not null references public.profiles(id) on delete cascade,
  professional_id  uuid not null references public.profiles(id) on delete cascade,
  request_status   text not null default 'pending' check (request_status in ('pending','accepted','rejected')),
  request_message  text,
  responded_at     timestamptz,
  last_message_at  timestamptz default now(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_conv_initiated    on public.conversations(initiated_by);
create index if not exists idx_conv_professional on public.conversations(professional_id);

create table if not exists public.chat_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id) on delete cascade,
  content         text,
  message_type    text not null default 'text'
                  check (message_type in ('text','image','file','audio','system')),
  file_url        text,
  file_name       text,
  file_size       bigint,
  file_type       text,
  status          text not null default 'sent' check (status in ('sent','delivered','read')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_msg_conv   on public.chat_messages(conversation_id, created_at desc);
create index if not exists idx_msg_sender on public.chat_messages(sender_id);


-- ============================================================================
--  REVIEWS · Reseñas (1 por cita)
-- ============================================================================
create table if not exists public.reviews (
  id              uuid primary key default gen_random_uuid(),
  appointment_id  uuid not null references public.appointments(id) on delete cascade,
  patient_id      uuid not null references public.profiles(id) on delete cascade,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  rating          int not null check (rating between 1 and 5),
  comment         text,
  is_anonymous    boolean not null default false,
  review_reply    text,                        -- respuesta del profesional
  reply_at        timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint uq_review_per_appointment unique (appointment_id)
);

create index if not exists idx_reviews_professional on public.reviews(professional_id);


-- ============================================================================
--  FAVORITES · Profesionales favoritos
-- ============================================================================
create table if not exists public.favorites (
  id              uuid primary key default gen_random_uuid(),
  patient_id      uuid not null references public.profiles(id) on delete cascade,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  created_at      timestamptz not null default now(),
  unique (patient_id, professional_id)
);


-- ============================================================================
--  PAYMENTS · Pagos completos (Stripe / MercadoPago / otros)
-- ============================================================================
create table if not exists public.payments (
  id                          uuid primary key default gen_random_uuid(),
  appointment_id              uuid references public.appointments(id) on delete set null,
  patient_id                  uuid not null references public.profiles(id) on delete cascade,
  professional_id             uuid references public.profiles(id) on delete set null,
  amount                      numeric(12,2) not null check (amount >= 0),
  platform_fee                numeric(12,2) default 0,
  professional_net            numeric(12,2) default 0,
  currency                    text not null default 'CLP',
  status                      text not null default 'pending'
                              check (status in ('pending','processing','paid','failed','refunded','cancelled','held_escrow')),
  payment_method              text check (payment_method in
                                ('card','mercadopago','stripe','transfer','cash','other')),
  stripe_payment_intent_id    text,
  stripe_session_id           text,
  mercadopago_payment_id      text,
  mercadopago_preference_id   text,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index if not exists idx_pay_appointment on public.payments(appointment_id);
create index if not exists idx_pay_patient     on public.payments(patient_id);
create index if not exists idx_pay_status      on public.payments(status);


-- ============================================================================
--  SUPPORT_TICKETS / TICKET_MESSAGES
-- ============================================================================
create table if not exists public.support_tickets (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  admin_id        uuid references public.profiles(id) on delete set null,
  user_role       text,
  subject         text not null,
  message         text not null,
  category        text,
  status          text not null default 'open' check (status in ('open','in_progress','resolved','closed')),
  priority        text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  admin_response  text,
  resolved_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.ticket_messages (
  id         uuid primary key default gen_random_uuid(),
  ticket_id  uuid not null references public.support_tickets(id) on delete cascade,
  sender_id  uuid not null references public.profiles(id) on delete cascade,
  message    text not null,
  created_at timestamptz not null default now()
);


-- ============================================================================
--  NOTIFICATIONS / ADMIN_NOTIFICATIONS
-- ============================================================================
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null,
  title      text not null,
  message    text,
  data       jsonb not null default '{}'::jsonb,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notif_user on public.notifications(user_id, created_at desc);

create table if not exists public.admin_notifications (
  id         uuid primary key default gen_random_uuid(),
  type       text not null,
  message    text not null,
  data       jsonb not null default '{}'::jsonb,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);


-- ============================================================================
--  PLATFORM_SETTINGS · Configuración global
-- ============================================================================
create table if not exists public.platform_settings (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  value       jsonb not null,
  description text,
  updated_by  uuid references public.profiles(id),
  updated_at  timestamptz not null default now()
);


-- ============================================================================
--  WAITLIST · Hard gate
-- ============================================================================
create table if not exists public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      citext not null unique,
  source     text default 'landing',
  metadata   jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);


-- ============================================================================
--  AUDIT_LOG · Log de auditoría
-- ============================================================================
create table if not exists public.audit_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete set null,
  action      text not null,
  table_name  text,
  record_id   uuid,
  old_values  jsonb,
  new_values  jsonb,
  ip_address  inet,
  user_agent  text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_audit_user  on public.audit_log(user_id, created_at desc);
create index if not exists idx_audit_table on public.audit_log(table_name, record_id);


commit;
