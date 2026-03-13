-- =============================================================================
-- NUREA: Seed de Taxonomía Médica Completa
-- Ejecutar en Supabase SQL Editor DESPUÉS de crear categories y specialties
-- =============================================================================

-- Limpiar datos existentes (si existen)
DELETE FROM public.specialties WHERE true;
DELETE FROM public.categories WHERE true;

-- =============================================================================
-- CATEGORÍAS PRINCIPALES
-- =============================================================================

INSERT INTO public.categories (id, name_es, name_en, slug, description_es, description_en, icon, sort_order)
VALUES
  -- Medicina Especializada
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    'Medicina Especializada',
    'Specialized Medicine',
    'medical',
    'Especialidades médicas que requieren formación especializada y licencia profesional',
    'Medical specialties requiring specialized training and professional licensing',
    'stethoscope',
    1
  ),
  -- Salud Integral y Bienestar
  (
    'b2c3d4e5-f6a7-8901-bcde-f12345678901'::uuid,
    'Salud Integral y Bienestar',
    'Wellness & Holistic Health',
    'wellness',
    'Profesionales de salud mental, nutrición, rehabilitación y bienestar general',
    'Mental health, nutrition, rehabilitation and general wellness professionals',
    'heart-pulse',
    2
  ),
  -- Odontología
  (
    'c3d4e5f6-a7b8-9012-cdef-123456789012'::uuid,
    'Odontología',
    'Dentistry',
    'dental',
    'Especialidades en salud bucal y odontología',
    'Oral health and dental specialties',
    'smile',
    3
  ),
  -- Servicios de Diagnóstico
  (
    'd4e5f6a7-b8c9-0123-defa-234567890123'::uuid,
    'Servicios de Diagnóstico',
    'Diagnostic Services',
    'diagnostics',
    'Servicios de laboratorio, imagenología y diagnóstico médico',
    'Laboratory, imaging and medical diagnostic services',
    'microscope',
    4
  );

-- =============================================================================
-- ESPECIALIDADES: MEDICINA ESPECIALIZADA
-- =============================================================================

INSERT INTO public.specialties (id, category_id, parent_id, name_es, name_en, slug, icon, requires_license, is_active, sort_order)
VALUES
  -- Cardiología
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Cardiología',
    'Cardiology',
    'cardiologia',
    'heart',
    true,
    true,
    1
  ),
  -- Dermatología
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Dermatología',
    'Dermatology',
    'dermatologia',
    'scan-face',
    true,
    true,
    2
  ),
  -- Endocrinología
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Endocrinología',
    'Endocrinology',
    'endocrinologia',
    'activity',
    true,
    true,
    3
  ),
  -- Gastroenterología
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Gastroenterología',
    'Gastroenterology',
    'gastroenterologia',
    'pill',
    true,
    true,
    4
  ),
  -- Geriatría
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Geriatría',
    'Geriatrics',
    'geriatria',
    'users',
    true,
    true,
    5
  ),
  -- Ginecología y Obstetricia
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Ginecología y Obstetricia',
    'Gynecology & Obstetrics',
    'ginecologia',
    'baby',
    true,
    true,
    6
  ),
  -- Hematología
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Hematología',
    'Hematology',
    'hematologia',
    'droplets',
    true,
    true,
    7
  ),
  -- Infectología
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Infectología',
    'Infectious Disease',
    'infectologia',
    'bug',
    true,
    true,
    8
  ),
  -- Nefrología
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Nefrología',
    'Nephrology',
    'nefrologia',
    'bean',
    true,
    true,
    9
  ),
  -- Neumología
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Neumología',
    'Pulmonology',
    'neumologia',
    'wind',
    true,
    true,
    10
  ),
  -- Neurología
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Neurología',
    'Neurology',
    'neurologia',
    'brain',
    true,
    true,
    11
  ),
  -- Oncología
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Oncología',
    'Oncology',
    'oncologia',
    'ribbon',
    true,
    true,
    12
  ),
  -- Pediatría
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Pediatría',
    'Pediatrics',
    'pediatria',
    'baby',
    true,
    true,
    13
  ),
  -- Psiquiatría
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Psiquiatría',
    'Psychiatry',
    'psiquiatria',
    'brain',
    true,
    true,
    14
  ),
  -- Reumatología
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Reumatología',
    'Rheumatology',
    'reumatologia',
    'bone',
    true,
    true,
    15
  ),
  -- Urología
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Urología',
    'Urology',
    'urologia',
    'droplet',
    true,
    true,
    16
  ),
  -- Medicina Interna
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Medicina Interna',
    'Internal Medicine',
    'medicina-interna',
    'stethoscope',
    true,
    true,
    17
  ),
  -- Medicina General / Medicina Familiar
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Medicina General',
    'General Practice',
    'medicina-general',
    'stethoscope',
    true,
    true,
    18
  ),
  -- Medicina Familiar
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Medicina Familiar',
    'Family Medicine',
    'medicina-familiar',
    'users',
    true,
    true,
    19
  ),
  -- Anestesiología
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Anestesiología',
    'Anesthesiology',
    'anestesiologia',
    'syringe',
    true,
    true,
    20
  ),
  -- Medicina Deportiva
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Medicina Deportiva',
    'Sports Medicine',
    'medicina-deportiva',
    'dumbbell',
    true,
    true,
    21
  ),
  -- Alergología e Inmunología
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Alergología e Inmunología',
    'Allergy & Immunology',
    'alergologia',
    'flower',
    true,
    true,
    22
  ),
  -- Medicina Intensiva
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Medicina Intensiva',
    'Critical Care Medicine',
    'medicina-intensiva',
    'heart-pulse',
    true,
    true,
    23
  ),

  -- =============================================================================
  -- ESPECIALIDADES QUIRÚRGICAS (dentro de Medicina Especializada)
  -- =============================================================================
  -- Cirugía General
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Cirugía General',
    'General Surgery',
    'cirugia-general',
    'scissors',
    true,
    true,
    30
  ),
  -- Oftalmología
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Oftalmología',
    'Ophthalmology',
    'oftalmologia',
    'eye',
    true,
    true,
    31
  ),
  -- Otorrinolaringología
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Otorrinolaringología',
    'Otorhinolaryngology (ENT)',
    'otorrinolaringologia',
    'ear',
    true,
    true,
    32
  ),
  -- Traumatología y Ortopedia
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Traumatología y Ortopedia',
    'Orthopedic Surgery',
    'traumatologia',
    'bone',
    true,
    true,
    33
  ),
  -- Cirugía Cardiovascular
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Cirugía Cardiovascular',
    'Cardiovascular Surgery',
    'cirugia-cardiovascular',
    'heart',
    true,
    true,
    34
  ),
  -- Neurocirugía
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Neurocirugía',
    'Neurosurgery',
    'neurocirugia',
    'brain',
    true,
    true,
    35
  ),
  -- Cirugía Plástica y Reconstructiva
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Cirugía Plástica y Reconstructiva',
    'Plastic & Reconstructive Surgery',
    'cirugia-plastica',
    'sparkles',
    true,
    true,
    36
  ),
  -- Cirugía Pediátrica
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Cirugía Pediátrica',
    'Pediatric Surgery',
    'cirugia-pediatrica',
    'baby',
    true,
    true,
    37
  ),
  -- Urología Quirúrgica
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Cirugía Urológica',
    'Urologic Surgery',
    'cirugia-urologica',
    'droplet',
    true,
    true,
    38
  ),
  -- Cirugía Oncológica
  (
    gen_random_uuid(),
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    NULL,
    'Cirugía Oncológica',
    'Surgical Oncology',
    'cirugia-oncologica',
    'ribbon',
    true,
    true,
    39
  );

-- =============================================================================
-- ESPECIALIDADES: SALUD MENTAL Y BIENESTAR
-- =============================================================================

INSERT INTO public.specialties (id, category_id, parent_id, name_es, name_en, slug, icon, requires_license, is_active, sort_order)
VALUES
  -- Psicología Clínica
  (
    gen_random_uuid(),
    'b2c3d4e5-f6a7-8901-bcde-f12345678901'::uuid,
    NULL,
    'Psicología Clínica',
    'Clinical Psychology',
    'psicologia-clinica',
    'brain',
    true,
    true,
    1
  ),
  -- Psicología General
  (
    gen_random_uuid(),
    'b2c3d4e5-f6a7-8901-bcde-f12345678901'::uuid,
    NULL,
    'Psicología',
    'Psychology',
    'psicologia',
    'heart-handshake',
    true,
    true,
    2
  ),
  -- Neuropsicología
  (
    gen_random_uuid(),
    'b2c3d4e5-f6a7-8901-bcde-f12345678901'::uuid,
    NULL,
    'Neuropsicología',
    'Neuropsychology',
    'neuropsicologia',
    'brain',
    true,
    true,
    3
  ),
  -- Psicología Infantil
  (
    gen_random_uuid(),
    'b2c3d4e5-f6a7-8901-bcde-f12345678901'::uuid,
    NULL,
    'Psicología Infantil',
    'Child Psychology',
    'psicologia-infantil',
    'baby',
    true,
    true,
    4
  ),
  -- Nutrición y Dietética
  (
    gen_random_uuid(),
    'b2c3d4e5-f6a7-8901-bcde-f12345678901'::uuid,
    NULL,
    'Nutrición y Dietética',
    'Nutrition & Dietetics',
    'nutricion-dietetica',
    'apple',
    true,
    true,
    5
  ),
  -- Nutrición Deportiva
  (
    gen_random_uuid(),
    'b2c3d4e5-f6a7-8901-bcde-f12345678901'::uuid,
    NULL,
    'Nutrición Deportiva',
    'Sports Nutrition',
    'nutricion-deportiva',
    'dumbbell',
    true,
    true,
    6
  ),
  -- Fisioterapia
  (
    gen_random_uuid(),
    'b2c3d4e5-f6a7-8901-bcde-f12345678901'::uuid,
    NULL,
    'Fisioterapia',
    'Physical Therapy',
    'fisioterapia',
    'accessibility',
    true,
    true,
    7
  ),
  -- Kinesiología
  (
    gen_random_uuid(),
    'b2c3d4e5-f6a7-8901-bcde-f12345678901'::uuid,
    NULL,
    'Kinesiología',
    'Kinesiology',
    'kinesiologia',
    'person-standing',
    true,
    true,
    8
  ),
  -- Terapia Ocupacional
  (
    gen_random_uuid(),
    'b2c3d4e5-f6a7-8901-bcde-f12345678901'::uuid,
    NULL,
    'Terapia Ocupacional',
    'Occupational Therapy',
    'terapia-ocupacional',
    'hand',
    true,
    true,
    9
  ),
  -- Logopedia / Fonoaudiología
  (
    gen_random_uuid(),
    'b2c3d4e5-f6a7-8901-bcde-f12345678901'::uuid,
    NULL,
    'Fonoaudiología',
    'Speech Therapy',
    'fonoaudiologia',
    'message-circle',
    true,
    true,
    10
  ),
  -- Matronería / Obstetricia
  (
    gen_random_uuid(),
    'b2c3d4e5-f6a7-8901-bcde-f12345678901'::uuid,
    NULL,
    'Matronería',
    'Midwifery',
    'matroneria',
    'baby',
    true,
    true,
    11
  ),
  -- Enfermería
  (
    gen_random_uuid(),
    'b2c3d4e5-f6a7-8901-bcde-f12345678901'::uuid,
    NULL,
    'Enfermería',
    'Nursing',
    'enfermeria',
    'stethoscope',
    true,
    true,
    12
  ),
  -- Quiropraxia
  (
    gen_random_uuid(),
    'b2c3d4e5-f6a7-8901-bcde-f12345678901'::uuid,
    NULL,
    'Quiropraxia',
    'Chiropractic',
    'quiropraxia',
    'spine',
    true,
    true,
    13
  ),
  -- Podología
  (
    gen_random_uuid(),
    'b2c3d4e5-f6a7-8901-bcde-f12345678901'::uuid,
    NULL,
    'Podología',
    'Podiatry',
    'podologia',
    'footprints',
    true,
    true,
    14
  ),
  -- Optometría
  (
    gen_random_uuid(),
    'b2c3d4e5-f6a7-8901-bcde-f12345678901'::uuid,
    NULL,
    'Optometría',
    'Optometry',
    'optometria',
    'glasses',
    true,
    true,
    15
  ),
  -- Acupuntura (requiere certificación en muchos países)
  (
    gen_random_uuid(),
    'b2c3d4e5-f6a7-8901-bcde-f12345678901'::uuid,
    NULL,
    'Acupuntura',
    'Acupuncture',
    'acupuntura',
    'target',
    true,
    true,
    16
  ),
  -- Terapia de Pareja y Familia
  (
    gen_random_uuid(),
    'b2c3d4e5-f6a7-8901-bcde-f12345678901'::uuid,
    NULL,
    'Terapia de Pareja y Familia',
    'Couples & Family Therapy',
    'terapia-pareja-familia',
    'users',
    true,
    true,
    17
  ),
  -- Coaching de Salud
  (
    gen_random_uuid(),
    'b2c3d4e5-f6a7-8901-bcde-f12345678901'::uuid,
    NULL,
    'Coaching de Salud',
    'Health Coaching',
    'coaching-salud',
    'target',
    false,
    true,
    18
  );

-- =============================================================================
-- ESPECIALIDADES: ODONTOLOGÍA
-- =============================================================================

INSERT INTO public.specialties (id, category_id, parent_id, name_es, name_en, slug, icon, requires_license, is_active, sort_order)
VALUES
  -- Odontología General
  (
    gen_random_uuid(),
    'c3d4e5f6-a7b8-9012-cdef-123456789012'::uuid,
    NULL,
    'Odontología General',
    'General Dentistry',
    'odontologia-general',
    'smile',
    true,
    true,
    1
  ),
  -- Ortodoncia
  (
    gen_random_uuid(),
    'c3d4e5f6-a7b8-9012-cdef-123456789012'::uuid,
    NULL,
    'Ortodoncia',
    'Orthodontics',
    'ortodoncia',
    'smile',
    true,
    true,
    2
  ),
  -- Endodoncia
  (
    gen_random_uuid(),
    'c3d4e5f6-a7b8-9012-cdef-123456789012'::uuid,
    NULL,
    'Endodoncia',
    'Endodontics',
    'endodoncia',
    'scan',
    true,
    true,
    3
  ),
  -- Periodoncia
  (
    gen_random_uuid(),
    'c3d4e5f6-a7b8-9012-cdef-123456789012'::uuid,
    NULL,
    'Periodoncia',
    'Periodontics',
    'periodoncia',
    'layers',
    true,
    true,
    4
  ),
  -- Odontopediatría
  (
    gen_random_uuid(),
    'c3d4e5f6-a7b8-9012-cdef-123456789012'::uuid,
    NULL,
    'Odontopediatría',
    'Pediatric Dentistry',
    'odontopediatria',
    'baby',
    true,
    true,
    5
  ),
  -- Cirugía Oral y Maxilofacial
  (
    gen_random_uuid(),
    'c3d4e5f6-a7b8-9012-cdef-123456789012'::uuid,
    NULL,
    'Cirugía Oral y Maxilofacial',
    'Oral & Maxillofacial Surgery',
    'cirugia-maxilofacial',
    'scissors',
    true,
    true,
    6
  ),
  -- Implantología Dental
  (
    gen_random_uuid(),
    'c3d4e5f6-a7b8-9012-cdef-123456789012'::uuid,
    NULL,
    'Implantología Dental',
    'Dental Implantology',
    'implantologia-dental',
    'pin',
    true,
    true,
    7
  ),
  -- Estética Dental
  (
    gen_random_uuid(),
    'c3d4e5f6-a7b8-9012-cdef-123456789012'::uuid,
    NULL,
    'Estética Dental',
    'Cosmetic Dentistry',
    'estetica-dental',
    'sparkles',
    true,
    true,
    8
  ),
  -- Prostodoncia
  (
    gen_random_uuid(),
    'c3d4e5f6-a7b8-9012-cdef-123456789012'::uuid,
    NULL,
    'Prostodoncia',
    'Prosthodontics',
    'prostodoncia',
    'component',
    true,
    true,
    9
  ),
  -- Rehabilitación Oral
  (
    gen_random_uuid(),
    'c3d4e5f6-a7b8-9012-cdef-123456789012'::uuid,
    NULL,
    'Rehabilitación Oral',
    'Oral Rehabilitation',
    'rehabilitacion-oral',
    'refresh-cw',
    true,
    true,
    10
  );

-- =============================================================================
-- ESPECIALIDADES: SERVICIOS DE DIAGNÓSTICO
-- =============================================================================

INSERT INTO public.specialties (id, category_id, parent_id, name_es, name_en, slug, icon, requires_license, is_active, sort_order)
VALUES
  -- Radiología
  (
    gen_random_uuid(),
    'd4e5f6a7-b8c9-0123-defa-234567890123'::uuid,
    NULL,
    'Radiología',
    'Radiology',
    'radiologia',
    'scan',
    true,
    true,
    1
  ),
  -- Imagenología
  (
    gen_random_uuid(),
    'd4e5f6a7-b8c9-0123-defa-234567890123'::uuid,
    NULL,
    'Imagenología',
    'Medical Imaging',
    'imagenologia',
    'image',
    true,
    true,
    2
  ),
  -- Patología
  (
    gen_random_uuid(),
    'd4e5f6a7-b8c9-0123-defa-234567890123'::uuid,
    NULL,
    'Patología',
    'Pathology',
    'patologia',
    'microscope',
    true,
    true,
    3
  ),
  -- Genética Médica
  (
    gen_random_uuid(),
    'd4e5f6a7-b8c9-0123-defa-234567890123'::uuid,
    NULL,
    'Genética Médica',
    'Medical Genetics',
    'genetica-medica',
    'dna',
    true,
    true,
    4
  ),
  -- Laboratorio Clínico
  (
    gen_random_uuid(),
    'd4e5f6a7-b8c9-0123-defa-234567890123'::uuid,
    NULL,
    'Laboratorio Clínico',
    'Clinical Laboratory',
    'laboratorio-clinico',
    'test-tube',
    true,
    true,
    5
  ),
  -- Medicina Nuclear
  (
    gen_random_uuid(),
    'd4e5f6a7-b8c9-0123-defa-234567890123'::uuid,
    NULL,
    'Medicina Nuclear',
    'Nuclear Medicine',
    'medicina-nuclear',
    'atom',
    true,
    true,
    6
  ),
  -- Anatomía Patológica
  (
    gen_random_uuid(),
    'd4e5f6a7-b8c9-0123-defa-234567890123'::uuid,
    NULL,
    'Anatomía Patológica',
    'Anatomic Pathology',
    'anatomia-patologica',
    'microscope',
    true,
    true,
    7
  ),
  -- Electrodiagnóstico
  (
    gen_random_uuid(),
    'd4e5f6a7-b8c9-0123-defa-234567890123'::uuid,
    NULL,
    'Electrodiagnóstico',
    'Electrodiagnostic Medicine',
    'electrodiagnostico',
    'activity',
    true,
    true,
    8
  );

-- =============================================================================
-- Verificación de datos insertados
-- =============================================================================

-- Mostrar resumen
DO $$
DECLARE
  cat_count INTEGER;
  spec_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO cat_count FROM public.categories;
  SELECT COUNT(*) INTO spec_count FROM public.specialties;
  RAISE NOTICE 'Taxonomía médica creada: % categorías, % especialidades', cat_count, spec_count;
END $$;
