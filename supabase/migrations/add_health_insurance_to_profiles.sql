-- Añade Previsión de Salud (health_insurance) al perfil del paciente
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS health_insurance TEXT;

COMMENT ON COLUMN public.profiles.health_insurance IS 'Previsión de salud: Fonasa, Cruz Blanca, Colmena, Banmédica, etc.';
