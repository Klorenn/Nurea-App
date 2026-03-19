-- Migration to add national_id (DNI/RUT) to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS national_id TEXT;
COMMENT ON COLUMN public.profiles.national_id IS 'RUT o DNI del usuario (para pacientes y profesionales).';
