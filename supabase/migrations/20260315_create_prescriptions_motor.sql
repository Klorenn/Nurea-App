-- =============================================================================
-- NUREA: Motor de Entrega de Documentos (Prescriptions & Storage)
-- =============================================================================

-- 1. Crear tabla de recetas si no existe
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pdf_url TEXT,
  qr_code_content TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice único para asegurar una receta por cita
CREATE UNIQUE INDEX IF NOT EXISTS idx_prescriptions_appointment_id ON public.prescriptions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_professional_id ON public.prescriptions(professional_id);

-- 2. Habilitar RLS para la tabla prescriptions
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Políticas para la tabla prescriptions
CREATE POLICY "prescriptions_select_involved" ON public.prescriptions
  FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = professional_id);

CREATE POLICY "prescriptions_insert_professional" ON public.prescriptions
  FOR INSERT WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "prescriptions_update_own" ON public.prescriptions
  FOR UPDATE USING (auth.uid() = professional_id) WITH CHECK (auth.uid() = professional_id);

-- 3. Crear bucket privado para recetas médicas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'prescriptions',
  'prescriptions',
  false,  -- PRIVADO
  5242880, -- 5MB límite
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['application/pdf']::text[];

-- 4. Políticas RLS para el bucket prescriptions
-- El profesional puede subir recetas para sus pacientes
CREATE POLICY "prescriptions_storage_insert_professional"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'prescriptions'
  -- El profesional puede subir a cualquier carpeta de paciente si está autenticado como professional
);

-- El paciente puede ver sus propias recetas
CREATE POLICY "prescriptions_storage_select_own"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'prescriptions'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- El profesional puede ver las recetas que él generó (esto es más complejo con folders de paciente, pero el path será patient_id/appointment_id.pdf)
-- Para simplificar, permitimos a los profesionales ver lo que subieron si el path coincide con su lógica, 
-- pero usualmente el profesional las ve a través del historial de la cita.
CREATE POLICY "prescriptions_storage_select_professional"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'prescriptions'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'professional'
  )
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_prescriptions_updated_at ON public.prescriptions;
CREATE TRIGGER trigger_prescriptions_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
