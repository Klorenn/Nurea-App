-- =============================================================================
-- NUREA: Enhanced Reviews System Migration
-- =============================================================================

-- 1. Actualizar tabla professionals para incluir average_rating
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'professionals' AND column_name = 'rating') THEN
        ALTER TABLE public.professionals RENAME COLUMN rating TO average_rating;
    ELSE
        ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0;
    END IF;
END $$;

-- 2. Asegurar que la tabla reviews use doctor_id como alias o nombre principal
-- Si ya existe professional_id, lo renombramos o añadimos doctor_id
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM public.reviews LIMIT 1) THEN
        -- Si hay datos, renombramos professional_id a doctor_id
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'professional_id') THEN
            ALTER TABLE public.reviews RENAME COLUMN professional_id TO doctor_id;
        END IF;
    ELSE
        -- Si no hay tabla o está vacía, nos aseguramos que esté correcta
        CREATE TABLE IF NOT EXISTS public.reviews (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
            patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
            doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT unique_review_per_appointment UNIQUE (appointment_id)
        );
    END IF;
END $$;

-- 3. Añadir flag para control de notificaciones en appointments
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS review_request_sent BOOLEAN DEFAULT false;

-- 4. Actualizar la función del Trigger para usar los nuevos nombres
CREATE OR REPLACE FUNCTION public.update_professional_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE') OR (TG_OP = 'DELETE') THEN
    UPDATE public.professionals
    SET 
      average_rating = (
        SELECT COALESCE(AVG(rating), 0)::NUMERIC(3,2)
        FROM public.reviews
        WHERE doctor_id = COALESCE(NEW.doctor_id, OLD.doctor_id)
      ),
      review_count = (
        SELECT COUNT(*)
        FROM public.reviews
        WHERE doctor_id = COALESCE(NEW.doctor_id, OLD.doctor_id)
      )
    WHERE id = COALESCE(NEW.doctor_id, OLD.doctor_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Aseguramos que el trigger esté vinculado a doctor_id
DROP TRIGGER IF EXISTS trigger_update_professional_rating ON public.reviews;
CREATE TRIGGER trigger_update_professional_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_professional_rating();

-- Índices actualizados
CREATE INDEX IF NOT EXISTS idx_reviews_doctor_id ON public.reviews(doctor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_patient_id ON public.reviews(patient_id);
