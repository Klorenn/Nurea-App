-- =============================================================================
-- NUREA: Añadir specialty_id a professionals
-- Ejecutar en Supabase SQL Editor DESPUÉS de crear specialties
-- =============================================================================

-- Añadir columna specialty_id (FK a specialties)
-- Mantenemos 'specialty' TEXT para compatibilidad durante migración
ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS specialty_id UUID REFERENCES public.specialties(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.professionals.specialty_id IS 'FK a la tabla specialties (sistema nuevo)';
COMMENT ON COLUMN public.professionals.specialty IS 'Campo legacy - será deprecado tras migración completa';

-- Índice para búsquedas por especialidad
CREATE INDEX IF NOT EXISTS idx_professionals_specialty_id ON public.professionals(specialty_id);

-- Índice compuesto para filtros comunes
CREATE INDEX IF NOT EXISTS idx_professionals_filters 
  ON public.professionals(specialty_id, verified, consultation_type) 
  WHERE verified = true;

-- Vista materializada para conteo de profesionales por especialidad (opcional, ejecutar si se necesita performance)
-- CREATE MATERIALIZED VIEW IF NOT EXISTS public.specialty_professional_counts AS
-- SELECT 
--   s.id as specialty_id,
--   s.slug as specialty_slug,
--   s.category_id,
--   COUNT(p.id) as professional_count
-- FROM public.specialties s
-- LEFT JOIN public.professionals p ON p.specialty_id = s.id AND p.verified = true
-- GROUP BY s.id, s.slug, s.category_id;
-- 
-- CREATE UNIQUE INDEX ON public.specialty_professional_counts(specialty_id);
