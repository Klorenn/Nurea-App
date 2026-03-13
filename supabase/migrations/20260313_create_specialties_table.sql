-- =============================================================================
-- NUREA: Tabla de Especialidades Médicas
-- Ejecutar en Supabase SQL Editor DESPUÉS de crear categories
-- =============================================================================

-- Crear tabla de especialidades
CREATE TABLE IF NOT EXISTS public.specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  parent_id UUID REFERENCES public.specialties(id) ON DELETE SET NULL,
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  requires_license BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.specialties IS 'Especialidades médicas con soporte para sub-especialidades y multilenguaje';

-- Índices para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_specialties_category_id ON public.specialties(category_id);
CREATE INDEX IF NOT EXISTS idx_specialties_parent_id ON public.specialties(parent_id);
CREATE INDEX IF NOT EXISTS idx_specialties_slug ON public.specialties(slug);
CREATE INDEX IF NOT EXISTS idx_specialties_is_active ON public.specialties(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_specialties_sort_order ON public.specialties(sort_order);

-- Índice de texto completo para búsqueda
CREATE INDEX IF NOT EXISTS idx_specialties_name_search 
  ON public.specialties USING gin(to_tsvector('spanish', name_es || ' ' || name_en));

-- RLS: Lectura pública, escritura solo admin
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "specialties_select_all"
  ON public.specialties FOR SELECT
  USING (true);

CREATE POLICY "specialties_insert_admin"
  ON public.specialties FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "specialties_update_admin"
  ON public.specialties FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "specialties_delete_admin"
  ON public.specialties FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
