-- ============================================================================
-- NUREA – Tabla de pagos de suscripciones (ingresos reales de la plataforma)
-- Los pagos llegan vía webhook de MercadoPago pre-approval
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.nurea_subscription_payments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  mp_payment_id  TEXT,
  mp_preapproval_id TEXT,
  amount         NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency       TEXT NOT NULL DEFAULT 'CLP',
  status         TEXT NOT NULL DEFAULT 'approved'
                 CHECK (status IN ('approved', 'pending', 'rejected', 'cancelled')),
  payer_email    TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nsp_profile_id  ON public.nurea_subscription_payments(profile_id);
CREATE INDEX IF NOT EXISTS idx_nsp_created_at  ON public.nurea_subscription_payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nsp_status      ON public.nurea_subscription_payments(status);

ALTER TABLE public.nurea_subscription_payments ENABLE ROW LEVEL SECURITY;

-- Solo admins (y service role) pueden leer/escribir
CREATE POLICY "Admins manage subscription payments" ON public.nurea_subscription_payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
