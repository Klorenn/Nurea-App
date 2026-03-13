-- =============================================================================
-- NUREA: Tabla puente Professional-Specialties (Many-to-Many)
-- Ejecutar en Supabase SQL Editor DESPUÉS de crear specialties
-- =============================================================================

-- Crear tabla puente para relación muchos-a-muchos
CREATE TABLE IF NOT EXISTS public.professional_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  specialty_id UUID NOT NULL REFERENCES public.specialties(id) ON DELETE RESTRICT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  certification_url TEXT,
  certified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Un profesional no puede tener la misma especialidad dos veces
  CONSTRAINT unique_professional_specialty UNIQUE (professional_id, specialty_id)
);

COMMENT ON TABLE public.professional_specialties IS 'Relación muchos-a-muchos entre profesionales y especialidades';
COMMENT ON COLUMN public.professional_specialties.is_primary IS 'Solo una especialidad debe ser la principal por profesional';
COMMENT ON COLUMN public.professional_specialties.certification_url IS 'URL al documento de certificación en Storage';
COMMENT ON COLUMN public.professional_specialties.certified_at IS 'Fecha de certificación de la especialidad';

-- Índices para consultas eficientes
CREATE INDEX IF NOT EXISTS idx_prof_spec_professional_id 
  ON public.professional_specialties(professional_id);
CREATE INDEX IF NOT EXISTS idx_prof_spec_specialty_id 
  ON public.professional_specialties(specialty_id);
CREATE INDEX IF NOT EXISTS idx_prof_spec_is_primary 
  ON public.professional_specialties(is_primary) WHERE is_primary = true;

-- =============================================================================
-- Trigger: Solo una especialidad primaria por profesional
-- =============================================================================

CREATE OR REPLACE FUNCTION public.ensure_single_primary_specialty()
RETURNS TRIGGER AS $$
BEGIN
  -- Si estamos insertando/actualizando una especialidad como primaria
  IF NEW.is_primary = true THEN
    -- Quitar el flag de primaria de las demás especialidades del mismo profesional
    UPDATE public.professional_specialties
    SET is_primary = false
    WHERE professional_id = NEW.professional_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND is_primary = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ensure_single_primary_specialty ON public.professional_specialties;
CREATE TRIGGER trigger_ensure_single_primary_specialty
  BEFORE INSERT OR UPDATE ON public.professional_specialties
  FOR EACH ROW
  WHEN (NEW.is_primary = true)
  EXECUTE FUNCTION public.ensure_single_primary_specialty();

-- =============================================================================
-- RLS Policies
-- =============================================================================

ALTER TABLE public.professional_specialties ENABLE ROW LEVEL SECURITY;

-- Lectura pública (para mostrar especialidades de profesionales)
CREATE POLICY "prof_spec_select_all"
  ON public.professional_specialties FOR SELECT
  USING (true);

-- Solo el profesional puede insertar sus propias especialidades
CREATE POLICY "prof_spec_insert_own"
  ON public.professional_specialties FOR INSERT
  WITH CHECK (auth.uid() = professional_id);

-- Solo el profesional puede actualizar sus propias especialidades
CREATE POLICY "prof_spec_update_own"
  ON public.professional_specialties FOR UPDATE
  USING (auth.uid() = professional_id)
  WITH CHECK (auth.uid() = professional_id);

-- Solo el profesional puede eliminar sus propias especialidades
CREATE POLICY "prof_spec_delete_own"
  ON public.professional_specialties FOR DELETE
  USING (auth.uid() = professional_id);

-- Admins pueden gestionar todas las especialidades de profesionales
CREATE POLICY "prof_spec_admin_all"
  ON public.professional_specialties FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
