-- =============================================================================
-- NUREA - Add consultation_types JSONB to professionals
-- Fecha: 2026-03-20
-- Descripción: Permite a los profesionales definir sus tipos de consulta
--              con nombres personalizados, precios y modalidad.
--
-- Estructura de cada elemento en el array JSONB:
-- {
--   "id": "uuid",
--   "name": "Consulta General",
--   "price": 25000,
--   "duration_minutes": 60,
--   "modality": "online" | "in-person" | "both",
--   "description": ""   (opcional)
-- }
-- =============================================================================

ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS consultation_types JSONB DEFAULT '[]'::jsonb;

-- Índice GIN para búsquedas dentro del JSONB (opcional pero útil)
CREATE INDEX IF NOT EXISTS idx_professionals_consultation_types
  ON public.professionals USING GIN (consultation_types);

-- Comentario descriptivo
COMMENT ON COLUMN public.professionals.consultation_types IS
  'Array JSON de tipos de consulta personalizados con precios por modalidad';
