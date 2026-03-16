-- Waitlist Table
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'professional_gate',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add invited_by_code to professionals if not exists (renaming or adding as alias)
-- We already have referral_code_used, but the user requested invited_by_code.
-- Let's add it for consistency with their request.
ALTER TABLE public.professionals 
ADD COLUMN IF NOT EXISTS invited_by_code TEXT REFERENCES public.referral_codes(code);

-- RLS for waitlist
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join the waitlist"
  ON public.waitlist
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view waitlist"
  ON public.waitlist
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
