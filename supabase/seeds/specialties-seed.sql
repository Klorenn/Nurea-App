-- =============================================================================
-- NUREA: Seed de Categorías y Especialidades Médicas
-- Catálogo basado en estándares internacionales de salud
-- Ejecutar en Supabase SQL Editor DESPUÉS de crear las tablas
-- =============================================================================

-- Limpiar datos existentes (solo para desarrollo)
-- TRUNCATE public.specialties, public.categories CASCADE;

-- =============================================================================
-- CATEGORÍAS PRINCIPALES
-- =============================================================================

INSERT INTO public.categories (id, name_es, name_en, slug, description_es, description_en, icon, sort_order)
VALUES
  (
    'cat-medicina-001',
    'Medicina Especializada',
    'Specialized Medicine',
    'medicina-especializada',
    'Especialidades médicas que requieren cédula profesional y manejan interconsultas',
    'Medical specialties requiring professional license and handling referrals',
    '⚕️',
    1
  ),
  (
    'cat-bienestar-002',
    'Salud Integral y Bienestar',
    'Holistic Health & Wellness',
    'salud-integral',
    'Profesionales enfocados en tratamientos recurrentes y seguimiento de metas de salud',
    'Professionals focused on recurring treatments and health goal tracking',
    '🧘',
    2
  ),
  (
    'cat-diagnostico-003',
    'Servicios de Diagnóstico',
    'Diagnostic Services',
    'diagnostico',
    'Especialistas en entrega de resultados digitales y tele-interpretación',
    'Specialists in digital results delivery and tele-interpretation',
    '🔬',
    3
  )
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- ESPECIALIDADES: MEDICINA ESPECIALIZADA
-- =============================================================================

INSERT INTO public.specialties (category_id, name_es, name_en, slug, icon, requires_license, sort_order)
VALUES
  -- Medicina Interna y General
  ('cat-medicina-001', 'Medicina General', 'General Medicine', 'medicina-general', '🩺', true, 1),
  ('cat-medicina-001', 'Medicina Interna', 'Internal Medicine', 'medicina-interna', '⚕️', true, 2),
  ('cat-medicina-001', 'Medicina Familiar', 'Family Medicine', 'medicina-familiar', '👨‍👩‍👧', true, 3),
  
  -- Cardiología y Sistema Circulatorio
  ('cat-medicina-001', 'Cardiología', 'Cardiology', 'cardiologia', '❤️', true, 10),
  ('cat-medicina-001', 'Cardiología Intervencionista', 'Interventional Cardiology', 'cardiologia-intervencionista', '💓', true, 11),
  ('cat-medicina-001', 'Cirugía Cardiovascular', 'Cardiovascular Surgery', 'cirugia-cardiovascular', '🫀', true, 12),
  ('cat-medicina-001', 'Angiología', 'Angiology', 'angiologia', '🩸', true, 13),
  
  -- Dermatología
  ('cat-medicina-001', 'Dermatología', 'Dermatology', 'dermatologia', '🧴', true, 20),
  ('cat-medicina-001', 'Dermatología Pediátrica', 'Pediatric Dermatology', 'dermatologia-pediatrica', '👶🧴', true, 21),
  
  -- Pediatría
  ('cat-medicina-001', 'Pediatría', 'Pediatrics', 'pediatria', '👶', true, 30),
  ('cat-medicina-001', 'Neonatología', 'Neonatology', 'neonatologia', '🍼', true, 31),
  ('cat-medicina-001', 'Cardiología Pediátrica', 'Pediatric Cardiology', 'cardiologia-pediatrica', '👶❤️', true, 32),
  ('cat-medicina-001', 'Neurología Pediátrica', 'Pediatric Neurology', 'neurologia-pediatrica', '👶🧠', true, 33),
  
  -- Ginecología y Obstetricia
  ('cat-medicina-001', 'Ginecología y Obstetricia', 'Gynecology & Obstetrics', 'ginecologia', '👩', true, 40),
  ('cat-medicina-001', 'Ginecología Oncológica', 'Gynecologic Oncology', 'ginecologia-oncologica', '🎗️👩', true, 41),
  ('cat-medicina-001', 'Medicina Reproductiva', 'Reproductive Medicine', 'medicina-reproductiva', '🤰', true, 42),
  ('cat-medicina-001', 'Perinatología', 'Perinatology', 'perinatologia', '🤱', true, 43),
  
  -- Neurología y Psiquiatría
  ('cat-medicina-001', 'Neurología', 'Neurology', 'neurologia', '🧠', true, 50),
  ('cat-medicina-001', 'Neurocirugía', 'Neurosurgery', 'neurocirugia', '🧠🔪', true, 51),
  ('cat-medicina-001', 'Psiquiatría', 'Psychiatry', 'psiquiatria', '🧠💭', true, 52),
  ('cat-medicina-001', 'Psiquiatría Infantil', 'Child Psychiatry', 'psiquiatria-infantil', '👶💭', true, 53),
  ('cat-medicina-001', 'Psicogeriatría', 'Psychogeriatrics', 'psicogeriatria', '👴💭', true, 54),
  
  -- Oftalmología
  ('cat-medicina-001', 'Oftalmología', 'Ophthalmology', 'oftalmologia', '👁️', true, 60),
  ('cat-medicina-001', 'Oftalmología Pediátrica', 'Pediatric Ophthalmology', 'oftalmologia-pediatrica', '👶👁️', true, 61),
  ('cat-medicina-001', 'Retinología', 'Retinology', 'retinologia', '🔴', true, 62),
  
  -- Otorrinolaringología
  ('cat-medicina-001', 'Otorrinolaringología', 'Otorhinolaryngology', 'otorrinolaringologia', '👂', true, 70),
  ('cat-medicina-001', 'Audiología Médica', 'Medical Audiology', 'audiologia-medica', '🦻', true, 71),
  
  -- Traumatología y Ortopedia
  ('cat-medicina-001', 'Traumatología y Ortopedia', 'Traumatology & Orthopedics', 'traumatologia', '🦴', true, 80),
  ('cat-medicina-001', 'Cirugía de Columna', 'Spine Surgery', 'cirugia-columna', '🔙', true, 81),
  ('cat-medicina-001', 'Cirugía de Mano', 'Hand Surgery', 'cirugia-mano', '🤚', true, 82),
  ('cat-medicina-001', 'Medicina del Deporte', 'Sports Medicine', 'medicina-deportiva', '⚽', true, 83),
  
  -- Urología
  ('cat-medicina-001', 'Urología', 'Urology', 'urologia', '💧', true, 90),
  ('cat-medicina-001', 'Urología Pediátrica', 'Pediatric Urology', 'urologia-pediatrica', '👶💧', true, 91),
  ('cat-medicina-001', 'Andrología', 'Andrology', 'andrologia', '👨', true, 92),
  
  -- Gastroenterología
  ('cat-medicina-001', 'Gastroenterología', 'Gastroenterology', 'gastroenterologia', '🫃', true, 100),
  ('cat-medicina-001', 'Hepatología', 'Hepatology', 'hepatologia', '🫁', true, 101),
  ('cat-medicina-001', 'Endoscopía', 'Endoscopy', 'endoscopia', '🔍', true, 102),
  ('cat-medicina-001', 'Coloproctología', 'Coloproctology', 'coloproctologia', '🏥', true, 103),
  
  -- Neumología
  ('cat-medicina-001', 'Neumología', 'Pulmonology', 'neumologia', '🫁', true, 110),
  ('cat-medicina-001', 'Neumología Pediátrica', 'Pediatric Pulmonology', 'neumologia-pediatrica', '👶🫁', true, 111),
  
  -- Endocrinología
  ('cat-medicina-001', 'Endocrinología', 'Endocrinology', 'endocrinologia', '🦋', true, 120),
  ('cat-medicina-001', 'Endocrinología Pediátrica', 'Pediatric Endocrinology', 'endocrinologia-pediatrica', '👶🦋', true, 121),
  ('cat-medicina-001', 'Diabetología', 'Diabetology', 'diabetologia', '🩸', true, 122),
  
  -- Reumatología
  ('cat-medicina-001', 'Reumatología', 'Rheumatology', 'reumatologia', '🤲', true, 130),
  
  -- Nefrología
  ('cat-medicina-001', 'Nefrología', 'Nephrology', 'nefrologia', '🫘', true, 140),
  ('cat-medicina-001', 'Nefrología Pediátrica', 'Pediatric Nephrology', 'nefrologia-pediatrica', '👶🫘', true, 141),
  
  -- Hematología
  ('cat-medicina-001', 'Hematología', 'Hematology', 'hematologia', '🩸', true, 150),
  ('cat-medicina-001', 'Hematología Pediátrica', 'Pediatric Hematology', 'hematologia-pediatrica', '👶🩸', true, 151),
  
  -- Oncología
  ('cat-medicina-001', 'Oncología Médica', 'Medical Oncology', 'oncologia', '🎗️', true, 160),
  ('cat-medicina-001', 'Oncología Pediátrica', 'Pediatric Oncology', 'oncologia-pediatrica', '👶🎗️', true, 161),
  ('cat-medicina-001', 'Radioterapia Oncológica', 'Radiation Oncology', 'radioterapia-oncologica', '☢️', true, 162),
  
  -- Infectología
  ('cat-medicina-001', 'Infectología', 'Infectious Disease', 'infectologia', '🦠', true, 170),
  ('cat-medicina-001', 'Infectología Pediátrica', 'Pediatric Infectious Disease', 'infectologia-pediatrica', '👶🦠', true, 171),
  
  -- Geriatría
  ('cat-medicina-001', 'Geriatría', 'Geriatrics', 'geriatria', '👴', true, 180),
  
  -- Alergología e Inmunología
  ('cat-medicina-001', 'Alergología e Inmunología', 'Allergy & Immunology', 'alergologia', '🤧', true, 190),
  ('cat-medicina-001', 'Alergología Pediátrica', 'Pediatric Allergy', 'alergologia-pediatrica', '👶🤧', true, 191),
  
  -- Cirugías
  ('cat-medicina-001', 'Cirugía General', 'General Surgery', 'cirugia-general', '🔪', true, 200),
  ('cat-medicina-001', 'Cirugía Plástica', 'Plastic Surgery', 'cirugia-plastica', '✨', true, 201),
  ('cat-medicina-001', 'Cirugía Reconstructiva', 'Reconstructive Surgery', 'cirugia-reconstructiva', '🏥', true, 202),
  ('cat-medicina-001', 'Cirugía Bariátrica', 'Bariatric Surgery', 'cirugia-bariatrica', '⚖️', true, 203),
  ('cat-medicina-001', 'Cirugía Oncológica', 'Surgical Oncology', 'cirugia-oncologica', '🎗️🔪', true, 204),
  ('cat-medicina-001', 'Cirugía Torácica', 'Thoracic Surgery', 'cirugia-toracica', '🫁🔪', true, 205),
  ('cat-medicina-001', 'Cirugía Maxilofacial', 'Maxillofacial Surgery', 'cirugia-maxilofacial', '😬', true, 206),
  
  -- Anestesiología
  ('cat-medicina-001', 'Anestesiología', 'Anesthesiology', 'anestesiologia', '💉', true, 210),
  ('cat-medicina-001', 'Medicina del Dolor', 'Pain Medicine', 'medicina-dolor', '💊', true, 211),
  
  -- Urgencias y Cuidados Intensivos
  ('cat-medicina-001', 'Medicina de Urgencias', 'Emergency Medicine', 'medicina-urgencias', '🚑', true, 220),
  ('cat-medicina-001', 'Medicina Intensiva', 'Intensive Care Medicine', 'medicina-intensiva', '🏥', true, 221),
  
  -- Otras especialidades médicas
  ('cat-medicina-001', 'Medicina Física y Rehabilitación', 'Physical Medicine & Rehabilitation', 'medicina-fisica', '🏃', true, 230),
  ('cat-medicina-001', 'Medicina Legal', 'Forensic Medicine', 'medicina-legal', '⚖️', true, 231),
  ('cat-medicina-001', 'Medicina Ocupacional', 'Occupational Medicine', 'medicina-ocupacional', '👷', true, 232),
  ('cat-medicina-001', 'Medicina Preventiva', 'Preventive Medicine', 'medicina-preventiva', '🛡️', true, 233)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- ESPECIALIDADES: SALUD INTEGRAL Y BIENESTAR
-- =============================================================================

INSERT INTO public.specialties (category_id, name_es, name_en, slug, icon, requires_license, sort_order)
VALUES
  -- Psicología
  ('cat-bienestar-002', 'Psicología Clínica', 'Clinical Psychology', 'psicologia-clinica', '🛋️', true, 1),
  ('cat-bienestar-002', 'Psicología General', 'General Psychology', 'psicologia', '🧘', true, 2),
  ('cat-bienestar-002', 'Neuropsicología', 'Neuropsychology', 'neuropsicologia', '🧠', true, 3),
  ('cat-bienestar-002', 'Psicología Infantil', 'Child Psychology', 'psicologia-infantil', '👶🧘', true, 4),
  ('cat-bienestar-002', 'Psicología de Pareja y Familia', 'Couples & Family Psychology', 'psicologia-pareja', '👫', true, 5),
  ('cat-bienestar-002', 'Psicología Organizacional', 'Organizational Psychology', 'psicologia-organizacional', '👔', true, 6),
  ('cat-bienestar-002', 'Sexología', 'Sexology', 'sexologia', '❤️', true, 7),
  
  -- Nutrición
  ('cat-bienestar-002', 'Nutrición Clínica', 'Clinical Nutrition', 'nutricion', '🥗', true, 20),
  ('cat-bienestar-002', 'Nutrición Deportiva', 'Sports Nutrition', 'nutricion-deportiva', '💪', true, 21),
  ('cat-bienestar-002', 'Nutrición Pediátrica', 'Pediatric Nutrition', 'nutricion-pediatrica', '👶🥗', true, 22),
  ('cat-bienestar-002', 'Nutrición Oncológica', 'Oncology Nutrition', 'nutricion-oncologica', '🎗️🥗', true, 23),
  ('cat-bienestar-002', 'Nutrición Renal', 'Renal Nutrition', 'nutricion-renal', '🫘🥗', true, 24),
  
  -- Fisioterapia y Kinesiología
  ('cat-bienestar-002', 'Fisioterapia', 'Physical Therapy', 'fisioterapia', '🏃', true, 30),
  ('cat-bienestar-002', 'Kinesiología', 'Kinesiology', 'kinesiologia', '🤸', true, 31),
  ('cat-bienestar-002', 'Fisioterapia Deportiva', 'Sports Physical Therapy', 'fisioterapia-deportiva', '⚽', true, 32),
  ('cat-bienestar-002', 'Fisioterapia Neurológica', 'Neurological Physical Therapy', 'fisioterapia-neurologica', '🧠🏃', true, 33),
  ('cat-bienestar-002', 'Fisioterapia Respiratoria', 'Respiratory Physical Therapy', 'fisioterapia-respiratoria', '🫁🏃', true, 34),
  ('cat-bienestar-002', 'Fisioterapia Pediátrica', 'Pediatric Physical Therapy', 'fisioterapia-pediatrica', '👶🏃', true, 35),
  
  -- Odontología
  ('cat-bienestar-002', 'Odontología General', 'General Dentistry', 'odontologia', '🦷', true, 40),
  ('cat-bienestar-002', 'Ortodoncia', 'Orthodontics', 'ortodoncia', '😁', true, 41),
  ('cat-bienestar-002', 'Endodoncia', 'Endodontics', 'endodoncia', '🦷', true, 42),
  ('cat-bienestar-002', 'Periodoncia', 'Periodontics', 'periodoncia', '🦷', true, 43),
  ('cat-bienestar-002', 'Odontopediatría', 'Pediatric Dentistry', 'odontopediatria', '👶🦷', true, 44),
  ('cat-bienestar-002', 'Implantología Dental', 'Dental Implantology', 'implantologia-dental', '🔩', true, 45),
  ('cat-bienestar-002', 'Prostodoncia', 'Prosthodontics', 'prostodoncia', '🦷', true, 46),
  ('cat-bienestar-002', 'Odontología Estética', 'Cosmetic Dentistry', 'odontologia-estetica', '✨🦷', true, 47),
  
  -- Fonoaudiología y Terapias
  ('cat-bienestar-002', 'Fonoaudiología', 'Speech Therapy', 'fonoaudiologia', '🗣️', true, 50),
  ('cat-bienestar-002', 'Terapia Ocupacional', 'Occupational Therapy', 'terapia-ocupacional', '🎨', true, 51),
  ('cat-bienestar-002', 'Terapia Respiratoria', 'Respiratory Therapy', 'terapia-respiratoria', '🫁', true, 52),
  
  -- Matronería y Enfermería
  ('cat-bienestar-002', 'Matronería', 'Midwifery', 'matroneria', '🤰', true, 60),
  ('cat-bienestar-002', 'Enfermería', 'Nursing', 'enfermeria', '💊', true, 61),
  ('cat-bienestar-002', 'Enfermería Pediátrica', 'Pediatric Nursing', 'enfermeria-pediatrica', '👶💊', true, 62),
  ('cat-bienestar-002', 'Enfermería Geriátrica', 'Geriatric Nursing', 'enfermeria-geriatrica', '👴💊', true, 63),
  
  -- Terapias Complementarias
  ('cat-bienestar-002', 'Acupuntura', 'Acupuncture', 'acupuntura', '📍', false, 70),
  ('cat-bienestar-002', 'Quiropraxia', 'Chiropractic', 'quiropraxia', '🔙', true, 71),
  ('cat-bienestar-002', 'Osteopatía', 'Osteopathy', 'osteopatia', '🦴', true, 72),
  ('cat-bienestar-002', 'Naturoterapia', 'Naturopathy', 'naturoterapia', '🌿', false, 73),
  ('cat-bienestar-002', 'Homeopatía', 'Homeopathy', 'homeopatia', '💧', false, 74),
  
  -- Otras especialidades de bienestar
  ('cat-bienestar-002', 'Podología', 'Podiatry', 'podologia', '🦶', true, 80),
  ('cat-bienestar-002', 'Optometría', 'Optometry', 'optometria', '👓', true, 81),
  ('cat-bienestar-002', 'Audiología', 'Audiology', 'audiologia', '🦻', true, 82),
  ('cat-bienestar-002', 'Trabajo Social Clínico', 'Clinical Social Work', 'trabajo-social-clinico', '🤝', true, 83),
  ('cat-bienestar-002', 'Coaching de Salud', 'Health Coaching', 'coaching-salud', '🎯', false, 84)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- ESPECIALIDADES: SERVICIOS DE DIAGNÓSTICO
-- =============================================================================

INSERT INTO public.specialties (category_id, name_es, name_en, slug, icon, requires_license, sort_order)
VALUES
  -- Radiología e Imagenología
  ('cat-diagnostico-003', 'Radiología', 'Radiology', 'radiologia', '📷', true, 1),
  ('cat-diagnostico-003', 'Radiología Intervencionista', 'Interventional Radiology', 'radiologia-intervencionista', '🎯', true, 2),
  ('cat-diagnostico-003', 'Imagenología', 'Medical Imaging', 'imagenologia', '🖥️', true, 3),
  ('cat-diagnostico-003', 'Ultrasonografía', 'Ultrasonography', 'ultrasonografia', '📡', true, 4),
  ('cat-diagnostico-003', 'Tomografía', 'CT Scan', 'tomografia', '🔄', true, 5),
  ('cat-diagnostico-003', 'Resonancia Magnética', 'MRI', 'resonancia-magnetica', '🧲', true, 6),
  
  -- Patología
  ('cat-diagnostico-003', 'Patología', 'Pathology', 'patologia', '🔬', true, 10),
  ('cat-diagnostico-003', 'Anatomía Patológica', 'Anatomical Pathology', 'anatomia-patologica', '🔬', true, 11),
  ('cat-diagnostico-003', 'Patología Clínica', 'Clinical Pathology', 'patologia-clinica', '🧪', true, 12),
  ('cat-diagnostico-003', 'Citopatología', 'Cytopathology', 'citopatologia', '🔬', true, 13),
  ('cat-diagnostico-003', 'Dermatopatología', 'Dermatopathology', 'dermatopatologia', '🧴🔬', true, 14),
  
  -- Genética
  ('cat-diagnostico-003', 'Genética Médica', 'Medical Genetics', 'genetica-medica', '🧬', true, 20),
  ('cat-diagnostico-003', 'Asesoramiento Genético', 'Genetic Counseling', 'asesoria-genetica', '🧬💬', true, 21),
  
  -- Laboratorio
  ('cat-diagnostico-003', 'Laboratorio Clínico', 'Clinical Laboratory', 'laboratorio-clinico', '🧪', true, 30),
  ('cat-diagnostico-003', 'Microbiología Clínica', 'Clinical Microbiology', 'microbiologia-clinica', '🦠', true, 31),
  ('cat-diagnostico-003', 'Inmunología Clínica', 'Clinical Immunology', 'inmunologia-clinica', '🛡️', true, 32),
  ('cat-diagnostico-003', 'Bioquímica Clínica', 'Clinical Biochemistry', 'bioquimica-clinica', '⚗️', true, 33),
  ('cat-diagnostico-003', 'Hematología de Laboratorio', 'Laboratory Hematology', 'hematologia-laboratorio', '🩸🔬', true, 34),
  
  -- Medicina Nuclear
  ('cat-diagnostico-003', 'Medicina Nuclear', 'Nuclear Medicine', 'medicina-nuclear', '☢️', true, 40),
  ('cat-diagnostico-003', 'PET-CT', 'PET-CT', 'pet-ct', '☢️🔄', true, 41),
  
  -- Otros diagnósticos
  ('cat-diagnostico-003', 'Electrodiagnóstico', 'Electrodiagnosis', 'electrodiagnostico', '⚡', true, 50),
  ('cat-diagnostico-003', 'Neurofisiología Clínica', 'Clinical Neurophysiology', 'neurofisiologia-clinica', '🧠⚡', true, 51),
  ('cat-diagnostico-003', 'Cardiología Diagnóstica', 'Diagnostic Cardiology', 'cardiologia-diagnostica', '❤️📊', true, 52)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- VERIFICAR INSERCIÓN
-- =============================================================================

-- Contar registros insertados
SELECT 
  'categories' as table_name, 
  COUNT(*) as count 
FROM public.categories
UNION ALL
SELECT 
  'specialties' as table_name, 
  COUNT(*) as count 
FROM public.specialties;
