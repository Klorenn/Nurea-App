-- ============================================================================
-- NUREA - ADD EMERGENCY CONTACT TO PROFILES
-- ============================================================================
-- Archivo: 20260314_add_emergency_contact.sql
-- Descripción: Añade campo de contacto de emergencia a la tabla profiles
-- ============================================================================

-- Add emergency_contact column if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS emergency_contact TEXT;

COMMENT ON COLUMN public.profiles.emergency_contact IS
  'Emergency contact information (name and phone) for the patient';

-- Verification
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'emergency_contact'
  ) THEN
    RAISE NOTICE '✅ Column emergency_contact added to profiles table';
  ELSE
    RAISE EXCEPTION '❌ Error: Could not add emergency_contact column';
  END IF;
END $$;
