-- Agregar campo category a support_tickets
-- Ejecutar en Supabase SQL Editor

ALTER TABLE public.support_tickets
ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN ('technical', 'billing', 'account', 'appointment', 'other')) DEFAULT 'other';

CREATE INDEX IF NOT EXISTS support_tickets_category_idx ON public.support_tickets(category);

