-- NUREA PACS - Imaging Studies

CREATE TABLE IF NOT EXISTS public.imaging_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- Referrer and/or reporting radiologist
  professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
  referral_id UUID REFERENCES public.referrals(id) ON DELETE SET NULL,
  
  study_type TEXT NOT NULL CHECK (study_type IN ('RX', 'TAC', 'RM', 'PET', 'US', 'OTHER')),
  modality TEXT NOT NULL,
  accession_number TEXT,
  dicom_web_endpoint TEXT NOT NULL, -- URL to WADO-RS or static DICOM file
  
  -- RIS
  report_text TEXT,
  report_status TEXT NOT NULL DEFAULT 'pending' CHECK (report_status IN ('pending', 'draft', 'final')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.imaging_studies IS 'PACs - Estudios de imagen médica vinculados a DICOM Web';

CREATE INDEX IF NOT EXISTS idx_imaging_studies_patient ON public.imaging_studies(patient_id);
CREATE INDEX IF NOT EXISTS idx_imaging_studies_professional ON public.imaging_studies(professional_id);
CREATE INDEX IF NOT EXISTS idx_imaging_studies_referral ON public.imaging_studies(referral_id);

ALTER TABLE public.imaging_studies ENABLE ROW LEVEL SECURITY;

-- Policies for Patient
CREATE POLICY "imaging_patient_select" ON public.imaging_studies FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Policies for Professional (Treating or Radiologist)
-- A professional can view if they are the designated professional, or if they have an appointment with the patient
CREATE POLICY "imaging_professional_select" ON public.imaging_studies FOR SELECT
  USING (
    auth.uid() = professional_id OR 
    EXISTS (
      SELECT 1 FROM public.appointments 
      WHERE appointments.patient_id = imaging_studies.patient_id 
      AND appointments.professional_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.referrals
      WHERE referrals.id = imaging_studies.referral_id
      AND (referrals.referring_professional_id = auth.uid() OR referrals.target_professional_id = auth.uid())
    )
  );

-- Professional can update the report if they are assigned to it
CREATE POLICY "imaging_professional_update" ON public.imaging_studies FOR UPDATE
  USING (auth.uid() = professional_id)
  WITH CHECK (auth.uid() = professional_id);

-- Trigger for update
DROP TRIGGER IF EXISTS imaging_studies_updated_at ON public.imaging_studies;
CREATE TRIGGER imaging_studies_updated_at BEFORE UPDATE ON public.imaging_studies
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
