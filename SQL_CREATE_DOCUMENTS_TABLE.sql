-- Crear tabla de documentos médicos para NUREA
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL, -- en bytes
  category TEXT CHECK (category IN ('lab_results', 'prescription', 'consultation_report', 'medical_record', 'imaging', 'other')) DEFAULT 'other',
  encrypted BOOLEAN DEFAULT TRUE,
  access_level TEXT CHECK (access_level IN ('patient_only', 'patient_and_professional', 'professional_only')) DEFAULT 'patient_and_professional',
  uploaded_by UUID REFERENCES public.profiles(id) NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  access_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS documents_patient_idx ON public.documents(patient_id);
CREATE INDEX IF NOT EXISTS documents_professional_idx ON public.documents(professional_id);
CREATE INDEX IF NOT EXISTS documents_appointment_idx ON public.documents(appointment_id);
CREATE INDEX IF NOT EXISTS documents_category_idx ON public.documents(category);
CREATE INDEX IF NOT EXISTS documents_uploaded_at_idx ON public.documents(uploaded_at);

-- Habilitar RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Política: Los pacientes pueden ver sus propios documentos
CREATE POLICY "Patients can view own documents"
  ON public.documents FOR SELECT
  USING (auth.uid() = patient_id);

-- Política: Los profesionales pueden ver documentos de sus pacientes
CREATE POLICY "Professionals can view patient documents"
  ON public.documents FOR SELECT
  USING (
    auth.uid() = professional_id 
    AND access_level IN ('patient_and_professional', 'professional_only')
  );

-- Política: Los pacientes pueden crear documentos
CREATE POLICY "Patients can create own documents"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- Política: Los profesionales pueden crear documentos para sus pacientes
CREATE POLICY "Professionals can create documents for patients"
  ON public.documents FOR INSERT
  WITH CHECK (
    auth.uid() = professional_id 
    AND EXISTS (
      SELECT 1 FROM public.appointments 
      WHERE id = appointment_id 
      AND professional_id = auth.uid()
      AND patient_id = documents.patient_id
    )
  );

-- Política: Solo el propietario puede actualizar documentos
CREATE POLICY "Owners can update documents"
  ON public.documents FOR UPDATE
  USING (auth.uid() = uploaded_by);

-- Política: Solo el propietario puede eliminar documentos
CREATE POLICY "Owners can delete documents"
  ON public.documents FOR DELETE
  USING (auth.uid() = uploaded_by OR auth.uid() = patient_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION update_documents_updated_at();

-- Función para registrar acceso a documentos
CREATE OR REPLACE FUNCTION log_document_access()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.documents
  SET 
    last_accessed_at = NOW(),
    access_count = access_count + 1
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Nota: Esta función se llamará desde la aplicación cuando se acceda a un documento
-- No hay trigger automático para no sobrecargar la base de datos

