-- NUREA: Sistema de Derivación Inteligente

CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL, -- to track the source appointment
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referring_professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  target_specialty_id UUID REFERENCES public.specialties(id) ON DELETE SET NULL,
  target_professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  summary_attached BOOLEAN NOT NULL DEFAULT false,
  clinical_summary_access BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'authorized', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.referrals IS 'Sistema Inteligente de Derivaciones entre Profesionales en NUREA';

CREATE INDEX IF NOT EXISTS idx_referrals_patient_id ON public.referrals(patient_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referring_professional_id ON public.referrals(referring_professional_id);
CREATE INDEX IF NOT EXISTS idx_referrals_target_professional_id ON public.referrals(target_professional_id);
CREATE INDEX IF NOT EXISTS idx_referrals_appointment_id ON public.referrals(appointment_id);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referrals_select_patient" ON public.referrals FOR SELECT 
  USING (auth.uid() = patient_id OR auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  ));

CREATE POLICY "referrals_select_referring" ON public.referrals FOR SELECT 
  USING (auth.uid() = referring_professional_id);

CREATE POLICY "referrals_select_target" ON public.referrals FOR SELECT 
  USING (auth.uid() = target_professional_id AND clinical_summary_access = true);

-- Target doctors can also read the referral if they have an appointment with the patient
CREATE POLICY "referrals_select_any_professional_with_access" ON public.referrals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE appointments.patient_id = referrals.patient_id
      AND appointments.professional_id = auth.uid()
    ) AND clinical_summary_access = true
  );

CREATE POLICY "referrals_insert_referring" ON public.referrals FOR INSERT 
  WITH CHECK (auth.uid() = referring_professional_id);

CREATE POLICY "referrals_update_patient" ON public.referrals FOR UPDATE 
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Update for referring professional (e.g. they might want to cancel/update reasoning if pending)
CREATE POLICY "referrals_update_referring" ON public.referrals FOR UPDATE 
  USING (auth.uid() = referring_professional_id AND status = 'pending')
  WITH CHECK (auth.uid() = referring_professional_id);

-- Trigger for update
DROP TRIGGER IF EXISTS referrals_updated_at ON public.referrals;
CREATE TRIGGER referrals_updated_at BEFORE UPDATE ON public.referrals
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
