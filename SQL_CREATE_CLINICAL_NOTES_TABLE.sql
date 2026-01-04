-- Tabla para notas clínicas privadas del profesional
-- Solo visible para el profesional que las creó

CREATE TABLE IF NOT EXISTS public.clinical_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  notes TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS clinical_notes_professional_idx ON public.clinical_notes(professional_id);
CREATE INDEX IF NOT EXISTS clinical_notes_patient_idx ON public.clinical_notes(patient_id);
CREATE INDEX IF NOT EXISTS clinical_notes_appointment_idx ON public.clinical_notes(appointment_id);

-- RLS Policies
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;

-- Solo el profesional que creó la nota puede verla y editarla
CREATE POLICY "Professionals can view their own clinical notes"
  ON public.clinical_notes
  FOR SELECT
  USING (auth.uid() = professional_id);

CREATE POLICY "Professionals can insert their own clinical notes"
  ON public.clinical_notes
  FOR INSERT
  WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Professionals can update their own clinical notes"
  ON public.clinical_notes
  FOR UPDATE
  USING (auth.uid() = professional_id);

CREATE POLICY "Professionals can delete their own clinical notes"
  ON public.clinical_notes
  FOR DELETE
  USING (auth.uid() = professional_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_clinical_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clinical_notes_updated_at
  BEFORE UPDATE ON public.clinical_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_clinical_notes_updated_at();

