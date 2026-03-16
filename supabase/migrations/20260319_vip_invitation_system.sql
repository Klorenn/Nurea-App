-- Referral Codes Table
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  max_uses INTEGER NOT NULL DEFAULT 1,
  uses_count INTEGER NOT NULL DEFAULT 0,
  discount_percentage INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add referral tracking to professionals
ALTER TABLE public.professionals 
ADD COLUMN IF NOT EXISTS referral_code_used TEXT REFERENCES public.referral_codes(code),
ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false;

-- Master code for founders
INSERT INTO public.referral_codes (code, description, max_uses, discount_percentage)
VALUES ('NUREA50', 'Founder Access - First 100 Doctors', 100, 50)
ON CONFLICT (code) DO NOTHING;

-- RLS for referral_codes (Admin only)
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage referral_codes"
  ON public.referral_codes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can view active referral_codes"
  ON public.referral_codes
  FOR SELECT
  USING (is_active = true);

-- Function to increment usage safely
CREATE OR REPLACE FUNCTION public.increment_referral_usage(code_param TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.referral_codes
  SET uses_count = uses_count + 1,
      updated_at = now()
  WHERE code = code_param;
END;
$$;
