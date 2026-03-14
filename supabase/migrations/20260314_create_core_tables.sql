-- ============================================================================
-- NUREA - CREACIÓN DE TABLA MEDICAL_RECORDS
-- ============================================================================
-- Archivo: 20260314_create_core_tables.sql
-- Descripción: Crea la tabla medical_records si no existe
-- NOTA: La tabla appointments ya existe en 00_nurea_blueprint_core.sql
-- EJECUTAR ANTES de security_policies.sql
-- ============================================================================

-- ============================================================================
-- TABLA: medical_records (Registros Médicos / Fichas Clínicas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referencias
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  
  -- Información clínica (visible para el paciente)
  reason_for_visit TEXT,
  chief_complaint TEXT,
  diagnosis TEXT,
  diagnosis_code TEXT, -- Código CIE-10
  treatment TEXT,
  prescription TEXT,
  follow_up_instructions TEXT,
  follow_up_date DATE,
  
  -- Signos vitales (opcional)
  vital_signs JSONB,
  
  -- Archivos adjuntos
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- Notas privadas del profesional (NUNCA visibles para el paciente)
  -- NOTA: Considera mover esto a la tabla professional_notes para mayor seguridad
  private_notes TEXT,
  
  -- Estado del registro
  is_draft BOOLEAN DEFAULT false,
  is_signed BOOLEAN DEFAULT false,
  signed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Soft delete (los registros médicos nunca se eliminan físicamente)
  deleted_at TIMESTAMPTZ
);

-- Índices para medical_records
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON public.medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_professional ON public.medical_records(professional_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_appointment ON public.medical_records(appointment_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_date ON public.medical_records(created_at);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_date ON public.medical_records(patient_id, created_at DESC);

COMMENT ON TABLE public.medical_records IS 'Registros médicos y fichas clínicas de pacientes. Datos ultra-sensibles protegidos por RLS.';


-- ============================================================================
-- TRIGGER: Actualizar updated_at automáticamente para medical_records
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_medical_records_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_medical_records_updated_at ON public.medical_records;
CREATE TRIGGER trigger_medical_records_updated_at
  BEFORE UPDATE ON public.medical_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_medical_records_timestamp();


-- ============================================================================
-- GRANT: Permisos básicos para usuarios autenticados
-- ============================================================================
GRANT SELECT, INSERT, UPDATE ON public.medical_records TO authenticated;

-- Los usuarios anónimos NO tienen acceso
REVOKE ALL ON public.medical_records FROM anon;


-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'medical_records') THEN
    RAISE NOTICE '✅ Tabla medical_records creada correctamente';
  ELSE
    RAISE EXCEPTION '❌ Error: No se pudo crear la tabla medical_records';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'appointments') THEN
    RAISE NOTICE '✅ Tabla appointments existe';
  ELSE
    RAISE NOTICE '⚠️ Advertencia: La tabla appointments no existe. Ejecuta 00_nurea_blueprint_core.sql primero.';
  END IF;
END $$;
