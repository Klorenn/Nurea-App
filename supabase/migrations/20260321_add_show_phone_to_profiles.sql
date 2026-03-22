-- =============================================================================
-- NUREA: Add show_phone privacy control to profiles
-- Allows professionals (and patients) to choose whether their phone is visible
-- on their public profile.
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_phone BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN public.profiles.show_phone IS
  'Si el profesional/paciente desea mostrar su número de teléfono en el perfil público.';
