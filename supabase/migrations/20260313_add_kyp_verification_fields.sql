-- =============================================================================
-- NUREA: Sistema KYP (Know Your Professional) - Campos de Verificación
-- Ejecutar en Supabase SQL Editor
-- =============================================================================

-- =============================================================================
-- 1. Crear tipo ENUM para estado de verificación
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE public.verification_status AS ENUM ('pending', 'under_review', 'verified', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE public.verification_status IS 'Estado del proceso de verificación KYP';

-- =============================================================================
-- 2. Añadir campos de verificación a professionals
-- =============================================================================

-- Número de licencia profesional (Cédula/Número de Colegiado)
ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS professional_license_number TEXT;

-- Estado de verificación
ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS verification_status public.verification_status NOT NULL DEFAULT 'pending';

-- Fecha de verificación
ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS verification_date TIMESTAMPTZ;

-- URL del documento de verificación (Supabase Storage)
ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS verification_document_url TEXT;

-- Nombre del archivo original (para UI)
ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS verification_document_name TEXT;

-- Notas internas del admin sobre la verificación
ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- ID del admin que realizó la verificación
ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.profiles(id);

-- Fecha de expiración del documento (si aplica)
ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS license_expiry_date DATE;

-- Institución emisora de la licencia
ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS license_issuing_institution TEXT;

-- País de emisión de la licencia
ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS license_country TEXT DEFAULT 'CL';

-- Comentarios sobre documentos
COMMENT ON COLUMN public.professionals.professional_license_number IS 'Número de cédula profesional o registro en colegio médico';
COMMENT ON COLUMN public.professionals.verification_status IS 'Estado actual del proceso KYP: pending, under_review, verified, rejected';
COMMENT ON COLUMN public.professionals.verification_date IS 'Fecha en que se completó la verificación';
COMMENT ON COLUMN public.professionals.verification_document_url IS 'URL al documento escaneado en Supabase Storage (bucket privado)';
COMMENT ON COLUMN public.professionals.verification_document_name IS 'Nombre original del archivo subido';
COMMENT ON COLUMN public.professionals.verification_notes IS 'Notas internas del equipo de verificación';
COMMENT ON COLUMN public.professionals.verified_by IS 'Admin que aprobó/rechazó la verificación';
COMMENT ON COLUMN public.professionals.license_expiry_date IS 'Fecha de vencimiento de la licencia (si aplica)';
COMMENT ON COLUMN public.professionals.license_issuing_institution IS 'Institución que emitió la licencia (ej: Colegio Médico de Chile)';
COMMENT ON COLUMN public.professionals.license_country IS 'País de emisión de la licencia';

-- =============================================================================
-- 3. Índices para búsquedas eficientes
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_professionals_verification_status 
  ON public.professionals(verification_status);

CREATE INDEX IF NOT EXISTS idx_professionals_license_number 
  ON public.professionals(professional_license_number) 
  WHERE professional_license_number IS NOT NULL;

-- Índice parcial para profesionales verificados (búsquedas públicas)
CREATE INDEX IF NOT EXISTS idx_professionals_verified 
  ON public.professionals(id) 
  WHERE verification_status = 'verified';

-- =============================================================================
-- 4. Trigger: Actualizar verified y verification_date automáticamente
-- =============================================================================

CREATE OR REPLACE FUNCTION public.sync_verification_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Si cambia a 'verified', actualizar el campo legacy 'verified' y fecha
  IF NEW.verification_status = 'verified' AND OLD.verification_status != 'verified' THEN
    NEW.verified = true;
    NEW.verification_date = COALESCE(NEW.verification_date, now());
  -- Si cambia desde 'verified' a otro estado, quitar verificación
  ELSIF NEW.verification_status != 'verified' AND OLD.verification_status = 'verified' THEN
    NEW.verified = false;
    NEW.verification_date = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_verification_status ON public.professionals;
CREATE TRIGGER trigger_sync_verification_status
  BEFORE UPDATE ON public.professionals
  FOR EACH ROW
  WHEN (NEW.verification_status IS DISTINCT FROM OLD.verification_status)
  EXECUTE FUNCTION public.sync_verification_status();

-- =============================================================================
-- 5. Función RPC: Obtener profesionales pendientes de verificación (para admins)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_pending_verifications()
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  specialty TEXT,
  professional_license_number TEXT,
  verification_document_url TEXT,
  verification_document_name TEXT,
  license_issuing_institution TEXT,
  created_at TIMESTAMPTZ
) 
SECURITY DEFINER
AS $$
BEGIN
  -- Solo admins pueden ver esta información
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin only';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    pr.first_name,
    pr.last_name,
    (SELECT email FROM auth.users WHERE auth.users.id = p.id) as email,
    p.specialty,
    p.professional_license_number,
    p.verification_document_url,
    p.verification_document_name,
    p.license_issuing_institution,
    p.created_at
  FROM public.professionals p
  JOIN public.profiles pr ON pr.id = p.id
  WHERE p.verification_status IN ('pending', 'under_review')
  ORDER BY p.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 6. Función RPC: Aprobar/Rechazar verificación (para admins)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_verification_status(
  p_professional_id UUID,
  p_new_status public.verification_status,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id UUID;
BEGIN
  v_admin_id := auth.uid();
  
  -- Verificar que el usuario es admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = v_admin_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin only';
  END IF;

  -- Actualizar estado
  UPDATE public.professionals
  SET 
    verification_status = p_new_status,
    verification_notes = COALESCE(p_notes, verification_notes),
    verified_by = v_admin_id,
    verification_date = CASE 
      WHEN p_new_status IN ('verified', 'rejected') THEN now()
      ELSE verification_date
    END
  WHERE id = p_professional_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.update_verification_status IS 'Permite a admins aprobar o rechazar verificaciones KYP';
