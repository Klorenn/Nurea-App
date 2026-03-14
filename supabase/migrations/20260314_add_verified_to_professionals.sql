-- ============================================================================
-- Migración: Sistema de Profesionales Verificados
-- Fecha: 2026-03-14
-- Descripción: Asegura que el campo `verified` existe en la tabla professionals
--              con valor por defecto FALSE para nuevos profesionales.
-- ============================================================================

-- 1. Añadir columna verified si no existe (default: false)
-- Solo profesionales verificados pueden atender pacientes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'professionals' 
    AND column_name = 'verified'
  ) THEN
    ALTER TABLE professionals 
    ADD COLUMN verified BOOLEAN DEFAULT FALSE NOT NULL;
    
    COMMENT ON COLUMN professionals.verified IS 
      'Indica si el profesional ha sido verificado por la Superintendencia de Salud (RNPI). Solo verificados pueden atender pacientes.';
  END IF;
END $$;

-- 2. Crear índice para búsquedas filtradas por verificación
CREATE INDEX IF NOT EXISTS idx_professionals_verified 
  ON professionals(verified) 
  WHERE verified = TRUE;

-- 3. Añadir columna verified_at para tracking de cuándo fue verificado
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'professionals' 
    AND column_name = 'verified_at'
  ) THEN
    ALTER TABLE professionals 
    ADD COLUMN verified_at TIMESTAMPTZ;
    
    COMMENT ON COLUMN professionals.verified_at IS 
      'Fecha y hora en que el profesional fue verificado por un admin.';
  END IF;
END $$;

-- 4. Añadir columna verified_by para tracking de quién verificó
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'professionals' 
    AND column_name = 'verified_by'
  ) THEN
    ALTER TABLE professionals 
    ADD COLUMN verified_by UUID REFERENCES profiles(id);
    
    COMMENT ON COLUMN professionals.verified_by IS 
      'ID del admin que verificó al profesional.';
  END IF;
END $$;

-- 5. Añadir columna rejection_reason para casos de rechazo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'professionals' 
    AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE professionals 
    ADD COLUMN rejection_reason TEXT;
    
    COMMENT ON COLUMN professionals.rejection_reason IS 
      'Razón del rechazo de verificación (si aplica).';
  END IF;
END $$;

-- 6. Función para actualizar verified_at automáticamente
CREATE OR REPLACE FUNCTION update_verified_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.verified = TRUE AND (OLD.verified IS NULL OR OLD.verified = FALSE) THEN
    NEW.verified_at = NOW();
  END IF;
  
  IF NEW.verified = FALSE THEN
    NEW.verified_at = NULL;
    NEW.verified_by = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger para actualizar verified_at
DROP TRIGGER IF EXISTS trigger_update_verified_at ON professionals;
CREATE TRIGGER trigger_update_verified_at
  BEFORE UPDATE OF verified ON professionals
  FOR EACH ROW
  EXECUTE FUNCTION update_verified_at();

-- 8. Política RLS: Solo admins pueden cambiar verificación
-- (Asumiendo que ya tienes RLS habilitado en professionals)
CREATE POLICY IF NOT EXISTS "Admins can update verification"
  ON professionals
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- Uso desde el Admin Dashboard:
-- 
-- Verificar profesional:
-- UPDATE professionals 
-- SET verified = TRUE, verified_by = auth.uid()
-- WHERE id = 'professional-uuid';
--
-- Rechazar profesional:
-- UPDATE professionals 
-- SET verified = FALSE, rejection_reason = 'Documentación incompleta'
-- WHERE id = 'professional-uuid';
-- ============================================================================
