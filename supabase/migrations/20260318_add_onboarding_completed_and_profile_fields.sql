-- =============================================================================
-- NUREA: Onboarding completo (Wizard v2)
-- Adds:
-- - profiles.onboarding_completed
-- - Patient health info fields (stored in profiles)
-- - Professional onboarding fields (stored in professionals)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Global onboarding flag
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed
  ON public.profiles(onboarding_completed);

COMMENT ON COLUMN public.profiles.onboarding_completed IS
  'Indica si el usuario completó el onboarding (Wizard v2) al 100%.';

-- -----------------------------------------------------------------------------
-- 2) Patient fields (stored in profiles)
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS allergies TEXT,
  ADD COLUMN IF NOT EXISTS chronic_diseases TEXT,
  ADD COLUMN IF NOT EXISTS current_medications TEXT,
  ADD COLUMN IF NOT EXISTS patient_goal TEXT;

-- -----------------------------------------------------------------------------
-- 3) Professional fields (stored in professionals)
-- -----------------------------------------------------------------------------
ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS professional_slogan TEXT,
  ADD COLUMN IF NOT EXISTS nura_ai_tone TEXT;

CREATE INDEX IF NOT EXISTS idx_professionals_nura_ai_tone
  ON public.professionals(nura_ai_tone);

-- -----------------------------------------------------------------------------
-- 4) Initialize onboarding_completed for existing users
-- -----------------------------------------------------------------------------
-- Patients: require all new required fields for Wizard v2 completion.
UPDATE public.profiles p
SET onboarding_completed = true
WHERE p.role = 'patient'
  AND p.date_of_birth IS NOT NULL
  AND p.avatar_url IS NOT NULL
  AND p.phone IS NOT NULL
  AND p.gender IN ('M', 'F')
  AND p.allergies IS NOT NULL AND p.allergies <> ''
  AND p.chronic_diseases IS NOT NULL AND p.chronic_diseases <> ''
  AND p.current_medications IS NOT NULL AND p.current_medications <> ''
  AND p.patient_goal IS NOT NULL AND p.patient_goal <> '';

-- Professionals: require all Wizard v2 fields for completion.
UPDATE public.profiles p
SET onboarding_completed = true
FROM public.professionals pr
WHERE p.id = pr.id
  AND p.role = 'professional'
  AND p.avatar_url IS NOT NULL
  AND pr.specialty_id IS NOT NULL
  AND pr.registration_number IS NOT NULL AND pr.registration_number <> ''
  AND pr.years_experience IS NOT NULL
  AND pr.consultation_type IS NOT NULL AND pr.consultation_type <> ''
  AND pr.professional_slogan IS NOT NULL AND pr.professional_slogan <> ''
  AND pr.nura_ai_tone IS NOT NULL AND pr.nura_ai_tone <> '';

