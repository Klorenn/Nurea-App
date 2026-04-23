-- ============================================================================
--  NUREA · SCHEMA CONSOLIDADO · 05 — Datos semilla
--  Categorías · Especialidades · Settings · Chile
-- ============================================================================

begin;

-- ============================================================================
--  PLATFORM SETTINGS
-- ============================================================================
insert into public.platform_settings (key, value, description) values
  ('commission_rate',    to_jsonb(0.15),                    'Comisión de plataforma sobre cada pago'),
  ('default_currency',   to_jsonb('CLP'::text),             'Moneda por defecto (Chile)'),
  ('default_country',    to_jsonb('CL'::text),              'País por defecto'),
  ('default_city',       to_jsonb('Temuco'::text),          'Ciudad base (Temuco, Araucanía)'),
  ('default_timezone',   to_jsonb('America/Santiago'::text),'Zona horaria operacional'),
  ('default_language',   to_jsonb('es'::text),              'Idioma base'),
  ('booking_lead_hours', to_jsonb(2),                       'Horas mínimas de anticipación para agendar'),
  ('cancellation_hours', to_jsonb(24),                      'Horas antes de la cita para cancelar sin costo'),
  ('min_appointment_minutes', to_jsonb(15),                 'Duración mínima de una cita'),
  ('max_appointment_minutes', to_jsonb(120),                'Duración máxima de una cita')
on conflict (key) do update set value = excluded.value, updated_at = now();

-- ============================================================================
--  CATEGORIES
-- ============================================================================
insert into public.categories (id, slug, name_es, name_en, description_es, icon, sort_order) values
  (gen_random_uuid(), 'medica',      'Medicina',       'Medicine',      'Especialidades clínicas y quirúrgicas', 'stethoscope',  10),
  (gen_random_uuid(), 'salud-mental','Salud mental',   'Mental health', 'Psicología, psiquiatría y terapia',     'brain',        20),
  (gen_random_uuid(), 'wellness',    'Bienestar',      'Wellness',      'Nutrición, kinesiología y cuidado integral', 'leaf',    30),
  (gen_random_uuid(), 'dental',      'Odontología',    'Dental',        'Salud bucal',                           'tooth',        40),
  (gen_random_uuid(), 'diagnostico', 'Diagnóstico',    'Diagnostics',   'Imagenología y laboratorio',            'activity',     50),
  (gen_random_uuid(), 'estetica',    'Medicina estética','Aesthetics',  'Dermatología estética y tratamientos',  'sparkles',     60)
on conflict (slug) do update
  set name_es = excluded.name_es,
      name_en = excluded.name_en,
      description_es = excluded.description_es,
      icon = excluded.icon,
      sort_order = excluded.sort_order;

-- ============================================================================
--  SPECIALTIES (Chile)
--  Basadas en la Superintendencia de Salud de Chile + wellness/salud mental.
-- ============================================================================
with cat as (
  select id, slug from public.categories
)
insert into public.specialties (category_id, slug, name_es, name_en, requires_license, sort_order, icon)
select c.id, v.slug, v.name_es, v.name_en, v.requires_license, v.sort_order, v.icon
from (values
  -- Medicina general + clínica
  ('medica',      'medicina-general',          'Medicina general',           'General Medicine',        true, 10,  'stethoscope'),
  ('medica',      'medicina-interna',          'Medicina interna',           'Internal Medicine',       true, 20,  'stethoscope'),
  ('medica',      'medicina-familiar',         'Medicina familiar',          'Family Medicine',         true, 30,  'heart'),
  ('medica',      'pediatria',                 'Pediatría',                  'Pediatrics',              true, 40,  'baby'),
  ('medica',      'ginecologia-obstetricia',   'Ginecología y Obstetricia',  'Gynecology & Obstetrics', true, 50,  'female'),
  ('medica',      'cardiologia',               'Cardiología',                'Cardiology',              true, 60,  'heart-pulse'),
  ('medica',      'neurologia',                'Neurología',                 'Neurology',               true, 70,  'brain'),
  ('medica',      'dermatologia',              'Dermatología',               'Dermatology',             true, 80,  'layers'),
  ('medica',      'endocrinologia',            'Endocrinología',             'Endocrinology',           true, 90,  'droplet'),
  ('medica',      'gastroenterologia',         'Gastroenterología',          'Gastroenterology',        true, 100, 'pill'),
  ('medica',      'neumologia',                'Neumología',                 'Pulmonology',             true, 110, 'wind'),
  ('medica',      'traumatologia',             'Traumatología y Ortopedia',  'Orthopedics',             true, 120, 'bone'),
  ('medica',      'urologia',                  'Urología',                   'Urology',                 true, 130, 'droplets'),
  ('medica',      'oftalmologia',              'Oftalmología',               'Ophthalmology',           true, 140, 'eye'),
  ('medica',      'otorrinolaringologia',      'Otorrinolaringología',       'ENT',                     true, 150, 'ear'),
  ('medica',      'reumatologia',              'Reumatología',               'Rheumatology',            true, 160, 'bone'),
  ('medica',      'oncologia',                 'Oncología',                  'Oncology',                true, 170, 'shield'),
  ('medica',      'medicina-deportiva',        'Medicina deportiva',         'Sports Medicine',         true, 180, 'activity'),
  -- Salud mental
  ('salud-mental','psicologia-clinica',        'Psicología clínica',         'Clinical Psychology',     true, 10,  'brain'),
  ('salud-mental','psiquiatria',               'Psiquiatría',                'Psychiatry',              true, 20,  'brain'),
  ('salud-mental','psicologia-infantil',       'Psicología infantil',        'Child Psychology',        true, 30,  'smile'),
  ('salud-mental','terapia-pareja',            'Terapia de pareja',          'Couples Therapy',         true, 40,  'heart'),
  ('salud-mental','terapia-familiar',          'Terapia familiar',           'Family Therapy',          true, 50,  'users'),
  ('salud-mental','psicopedagogia',            'Psicopedagogía',             'Educational Psychology',  true, 60,  'book'),
  -- Wellness
  ('wellness',    'nutricion',                 'Nutrición',                  'Nutrition',               true, 10,  'apple'),
  ('wellness',    'kinesiologia',              'Kinesiología',               'Physiotherapy',           true, 20,  'activity'),
  ('wellness',    'fonoaudiologia',            'Fonoaudiología',             'Speech Therapy',          true, 30,  'message-square'),
  ('wellness',    'terapia-ocupacional',       'Terapia ocupacional',        'Occupational Therapy',    true, 40,  'briefcase'),
  ('wellness',    'matrona',                   'Matrona',                    'Midwifery',               true, 50,  'female'),
  ('wellness',    'fisiatria',                 'Fisiatría',                  'Physiatry',               true, 60,  'activity'),
  -- Dental
  ('dental',      'odontologia-general',       'Odontología general',        'General Dentistry',       true, 10,  'tooth'),
  ('dental',      'ortodoncia',                'Ortodoncia',                 'Orthodontics',            true, 20,  'tooth'),
  ('dental',      'endodoncia',                'Endodoncia',                 'Endodontics',             true, 30,  'tooth'),
  ('dental',      'periodoncia',               'Periodoncia',                'Periodontics',            true, 40,  'tooth'),
  ('dental',      'implantologia',             'Implantología',              'Implantology',            true, 50,  'tooth'),
  ('dental',      'odontopediatria',           'Odontopediatría',            'Pediatric Dentistry',     true, 60,  'tooth'),
  -- Diagnóstico
  ('diagnostico', 'radiologia',                'Radiología',                 'Radiology',               true, 10,  'scan'),
  ('diagnostico', 'laboratorio-clinico',       'Laboratorio clínico',        'Clinical Laboratory',     true, 20,  'flask'),
  ('diagnostico', 'imagenologia',              'Imagenología',               'Imaging',                 true, 30,  'camera'),
  -- Estética
  ('estetica',    'medicina-estetica',         'Medicina estética',          'Aesthetic Medicine',      true, 10,  'sparkles'),
  ('estetica',    'dermatologia-estetica',     'Dermatología estética',      'Aesthetic Dermatology',   true, 20,  'sparkles')
) as v(cat_slug, slug, name_es, name_en, requires_license, sort_order, icon)
join cat c on c.slug = v.cat_slug
on conflict (slug) do update
  set name_es          = excluded.name_es,
      name_en          = excluded.name_en,
      category_id      = excluded.category_id,
      requires_license = excluded.requires_license,
      sort_order       = excluded.sort_order,
      icon             = excluded.icon;

-- ============================================================================
--  SEARCH SYNONYMS
-- ============================================================================
with sp as (select id, slug from public.specialties)
insert into public.search_synonyms (specialty_id, synonym)
select sp.id, s.syn
from (values
  ('psicologia-clinica',    'psicologo'),
  ('psicologia-clinica',    'psicóloga'),
  ('psicologia-clinica',    'terapia'),
  ('psicologia-clinica',    'terapeuta'),
  ('psiquiatria',           'psiquiatra'),
  ('nutricion',             'nutricionista'),
  ('nutricion',             'nutriologo'),
  ('kinesiologia',          'kinesiologo'),
  ('kinesiologia',          'kine'),
  ('kinesiologia',          'fisio'),
  ('kinesiologia',          'fisioterapia'),
  ('odontologia-general',   'dentista'),
  ('odontologia-general',   'odontologo'),
  ('pediatria',             'pediatra'),
  ('ginecologia-obstetricia','ginecologo'),
  ('ginecologia-obstetricia','ginecologa'),
  ('ginecologia-obstetricia','obstetra'),
  ('cardiologia',           'cardiologo'),
  ('dermatologia',          'dermatologo'),
  ('traumatologia',         'traumatologo'),
  ('oftalmologia',          'oculista'),
  ('otorrinolaringologia',  'otorrino'),
  ('matrona',               'partera')
) as s(spec_slug, syn)
join sp on sp.slug = s.spec_slug
on conflict (specialty_id, synonym) do nothing;

commit;
