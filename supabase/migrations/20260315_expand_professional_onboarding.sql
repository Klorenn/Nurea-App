-- =============================================================================
-- NUREA: Expansión de Perfil Profesional (Onboarding v2)
-- Campos: Education, Conditions Treated, Clinic Images
-- =============================================================================

-- 1. Añadir campos a la tabla professionals
ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS conditions_treated TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS clinic_images TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS clinic_address TEXT,
  ADD COLUMN IF NOT EXISTS clinic_office TEXT,
  ADD COLUMN IF NOT EXISTS clinic_city TEXT,
  ADD COLUMN IF NOT EXISTS clinic_coordinates JSONB,
  ADD COLUMN IF NOT EXISTS patients_groups TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS payment_methods TEXT[] DEFAULT '{}'; -- {lat: 1.23, lng: 4.56}

-- 2. Comentarios para documentación
COMMENT ON COLUMN public.professionals.education IS 'Lista de títulos y formación académica [{institution, degree, graduation_year, description}]';
COMMENT ON COLUMN public.professionals.conditions_treated IS 'Enfermedades o condiciones que el doctor atiende (Tags para búsqueda)';
COMMENT ON COLUMN public.professionals.clinic_images IS 'URLs de fotos de la consulta médica';
COMMENT ON COLUMN public.professionals.clinic_address IS 'Dirección física de la consulta';
COMMENT ON COLUMN public.professionals.clinic_office IS 'Piso, oficina o detalles adicionales de la ubicación';
COMMENT ON COLUMN public.professionals.clinic_coordinates IS 'Coordenadas geográficas para el mapa {lat, lng}';
COMMENT ON COLUMN public.professionals.patients_groups IS 'Tipos de pacientes que atiende el profesional (Adultos, Niños, Parejas, etc.)';
COMMENT ON COLUMN public.professionals.payment_methods IS 'Formas de pago aceptadas (Transferencia, Efectivo, Tarjeta, etc.)';

-- 3. Crear Bucket de Storage para fotos de clínica (Solo si no existe en la config de Supabase)
-- Nota: En Supabase real, esto se hace vía dashboard o extensiones de storage.
-- Aquí dejamos la referencia para el bucket 'clinic-photos'.
-- INSERT INTO storage.buckets (id, name, public) VALUES ('clinic-photos', 'clinic-photos', true) ON CONFLICT DO NOTHING;
