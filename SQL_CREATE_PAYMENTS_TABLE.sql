-- Crear tabla de pagos para NUREA
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'clp',
  status TEXT CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled')) DEFAULT 'pending',
  payment_method TEXT CHECK (payment_method IN ('card', 'mercadopago', 'bank_transfer')) DEFAULT 'card',
  payment_intent_id TEXT, -- ID del payment intent de Stripe/MercadoPago
  paid_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  refund_amount DECIMAL(10,2),
  refund_reason TEXT,
  receipt_url TEXT, -- URL del recibo generado
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS payments_patient_idx ON public.payments(patient_id);
CREATE INDEX IF NOT EXISTS payments_professional_idx ON public.payments(professional_id);
CREATE INDEX IF NOT EXISTS payments_appointment_idx ON public.payments(appointment_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments(status);
CREATE INDEX IF NOT EXISTS payments_created_idx ON public.payments(created_at);

-- Habilitar RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Política: Los pacientes pueden ver sus propios pagos
CREATE POLICY "Patients can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = patient_id);

-- Política: Los profesionales pueden ver pagos de sus citas
CREATE POLICY "Professionals can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = professional_id);

-- Política: Los pacientes pueden crear pagos
CREATE POLICY "Patients can create payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- Política: Solo el sistema puede actualizar pagos (a través de webhooks)
-- En producción, esto debería ser más restrictivo

