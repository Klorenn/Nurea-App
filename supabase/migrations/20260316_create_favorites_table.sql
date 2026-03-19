-- =============================================================================
-- NUREA: Tabla de Favoritos (Favorites)
-- Permite a los pacientes guardar profesionales como favoritos
-- =============================================================================

-- Crear tabla favorites
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Un paciente no puede tener el mismo profesional más de una vez como favorito
  CONSTRAINT unique_favorite UNIQUE (patient_id, professional_id)
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_favorites_patient_id ON public.favorites(patient_id);
CREATE INDEX IF NOT EXISTS idx_favorites_professional_id ON public.favorites(professional_id);

-- Habilitar RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Los pacientes solo ven y gestionan sus propios favoritos
CREATE POLICY "favorites_select_own" ON public.favorites
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "favorites_insert_own" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "favorites_delete_own" ON public.favorites
  FOR DELETE USING (auth.uid() = patient_id);

-- Los administradores pueden verlos todos
CREATE POLICY "favorites_admin_all" ON public.favorites
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

COMMENT ON TABLE public.favorites IS 'Profesionales marcados como favoritos por los pacientes.';
