-- Añadir campos de registro profesional (RUT / número de registro) para Chile
-- Desarrollador: Pau Andreu Koh Cuende

ALTER TABLE public.professionals
ADD COLUMN IF NOT EXISTS registration_number TEXT;

ALTER TABLE public.professionals
ADD COLUMN IF NOT EXISTS registration_institution TEXT;

COMMENT ON COLUMN public.professionals.registration_number IS 'RUT o número de registro médico (Chile)';
COMMENT ON COLUMN public.professionals.registration_institution IS 'Institución que emite el registro (opcional)';
