-- =============================================================================
-- NUREA: Sistema de Reseñas (Reviews & Professional Ratings)
-- =============================================================================

-- 1. Crear tabla de reseñas
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Restricción: Una sola reseña por cita
  CONSTRAINT unique_review_per_appointment UNIQUE (appointment_id)
);

-- 2. Habilitar RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "reviews_select_all" ON public.reviews
  FOR SELECT USING (true); -- Cualquiera puede ver las reseñas (público)

CREATE POLICY "reviews_insert_patient" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = patient_id 
    AND EXISTS (
      SELECT 1 FROM public.appointments 
      WHERE id = appointment_id AND status = 'completed'
    )
  );

CREATE POLICY "reviews_update_own" ON public.reviews
  FOR UPDATE USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);

-- 3. Función para actualizar automáticamente el rating y review_count del profesional
CREATE OR REPLACE FUNCTION public.update_professional_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE') OR (TG_OP = 'DELETE') THEN
    UPDATE public.professionals
    SET 
      rating = (
        SELECT COALESCE(AVG(rating), 0)::NUMERIC(3,2)
        FROM public.reviews
        WHERE professional_id = COALESCE(NEW.professional_id, OLD.professional_id)
      ),
      review_count = (
        SELECT COUNT(*)
        FROM public.reviews
        WHERE professional_id = COALESCE(NEW.professional_id, OLD.professional_id)
      )
    WHERE id = COALESCE(NEW.professional_id, OLD.professional_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS trigger_update_professional_rating ON public.reviews;
CREATE TRIGGER trigger_update_professional_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_professional_rating();

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_reviews_professional_id ON public.reviews(professional_id);
CREATE INDEX IF NOT EXISTS idx_reviews_patient_id ON public.reviews(patient_id);
