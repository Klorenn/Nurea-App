-- =============================================================================
-- NUREA: Specialist 2.0 - Profile Enhancements
-- Adds awards_and_courses and ensures bio_extended exists
-- =============================================================================

ALTER TABLE public.professionals 
  ADD COLUMN IF NOT EXISTS awards_and_courses JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS bio_extended TEXT;

COMMENT ON COLUMN public.professionals.awards_and_courses IS 'Certificaciones, cursos y premios del profesional [{title, institution, year}]';
COMMENT ON COLUMN public.professionals.bio_extended IS 'Biografía profesional detallada para el perfil público';
