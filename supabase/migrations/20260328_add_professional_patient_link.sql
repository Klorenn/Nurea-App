-- =============================================================================
-- NUREA – Add professional-patient relationship and update RLS
-- =============================================================================

-- 1. Add created_by_professional_id to profiles
-- This allows us to track which professional created a patient profile
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_by_professional_id UUID REFERENCES public.profiles(id);

-- 2. Update RLS policies for profiles
-- Allow professionals to SELECT patients they created
CREATE POLICY "profiles_select_created_by_me" ON public.profiles
FOR SELECT USING (auth.uid() = created_by_professional_id);

-- Allow professionals to UPDATE patients they created
CREATE POLICY "profiles_update_created_by_me" ON public.profiles
FOR UPDATE USING (auth.uid() = created_by_professional_id)
WITH CHECK (auth.uid() = created_by_professional_id);

-- 3. Update RLS policies for appointments
-- Allow professionals to INSERT appointments for patients they created or for themselves
-- (The existing policy only allowed patient-initiated inserts)
DROP POLICY IF EXISTS "appointments_insert_patient" ON public.appointments;
CREATE POLICY "appointments_insert_pro_or_patient" ON public.appointments 
FOR INSERT WITH CHECK (
  auth.uid() = patient_id OR 
  auth.uid() = professional_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = patient_id AND created_by_professional_id = auth.uid()
  )
);

COMMENT ON COLUMN public.profiles.created_by_professional_id IS 'ID del profesional que creó este perfil de paciente invitado.';
