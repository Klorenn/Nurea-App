-- =============================================================================
-- NUREA: Add gender field to profiles
-- Used to correctly genderize specialty labels (Psicólogo/Psicóloga, Médico/Médica)
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS gender TEXT;

