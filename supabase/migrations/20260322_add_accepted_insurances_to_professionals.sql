-- Añade previsiones aceptadas por cada profesional
-- Campo: accepted_insurances (TEXT[])

ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS accepted_insurances TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.professionals.accepted_insurances IS
  'Listado de previsiones / seguros de salud que acepta el profesional (por ejemplo: Fonasa, Colmena, Consalud).';

