-- Create finances table for tracking payments and splits
CREATE TABLE IF NOT EXISTS public.finances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id),
  professional_id UUID REFERENCES public.professionals(id),
  patient_id UUID REFERENCES public.profiles(id),
  stripe_payment_intent_id TEXT,
  total_amount DECIMAL(12, 2) NOT NULL,
  nurea_commission DECIMAL(12, 2) NOT NULL, -- 5%
  professional_payout DECIMAL(12, 2) NOT NULL, -- 95%
  currency TEXT DEFAULT 'CLP',
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for finances
ALTER TABLE public.finances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view their own finances"
  ON public.finances
  FOR SELECT
  USING (professional_id = auth.uid());

CREATE POLICY "Admins can view all finances"
  ON public.finances
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to check if professional has payouts enabled
CREATE OR REPLACE FUNCTION public.is_payouts_enabled(professional_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT COALESCE(payouts_enabled, FALSE)
  FROM public.professionals
  WHERE id = professional_uuid;
$$ LANGUAGE sql SECURITY DEFINER;
