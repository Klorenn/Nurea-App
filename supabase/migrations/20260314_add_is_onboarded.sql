-- ============================================================================
-- Migration: Add is_onboarded column to profiles
-- Purpose: Track whether a professional has completed their initial profile setup
-- ============================================================================

-- Add is_onboarded column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.is_onboarded IS 
  'Indicates whether the professional has completed the initial onboarding process (photo, specialty, RNPI, bio)';

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_profiles_is_onboarded 
ON public.profiles(is_onboarded) 
WHERE role = 'professional';

-- Update existing professionals who have completed their profile
-- A professional is considered onboarded if they have specialty and bio filled
UPDATE public.profiles p
SET is_onboarded = true
FROM public.professionals pr
WHERE p.id = pr.id 
  AND p.role = 'professional'
  AND pr.specialty IS NOT NULL 
  AND pr.specialty != ''
  AND pr.bio IS NOT NULL 
  AND pr.bio != '';

-- Verification
DO $$
DECLARE
  col_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'is_onboarded'
  ) INTO col_exists;
  
  IF NOT col_exists THEN
    RAISE EXCEPTION 'Column is_onboarded was not created successfully';
  END IF;
  
  RAISE NOTICE '✓ Column is_onboarded added to profiles table';
END $$;
