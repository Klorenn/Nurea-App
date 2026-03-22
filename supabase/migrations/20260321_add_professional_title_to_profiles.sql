-- =============================================================================
-- NUREA: Add professional_title to profiles
-- Stores the abbreviated professional title (Dr., Dra., Ps., Nut., etc.)
-- shown next to the professional's name across the platform.
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS professional_title TEXT;

COMMENT ON COLUMN public.profiles.professional_title IS
  'Título profesional abreviado del especialista (Dr., Dra., Ps., Nut., Kines., etc.)';
