-- System Settings Table (Kill Switch)
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert initial kill switch setting
INSERT INTO public.system_settings (key, value, description)
VALUES (
  'payments_enabled', 
  'true'::jsonb, 
  'Global kill switch for Stripe payments'
) ON CONFLICT (key) DO NOTHING;

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  properties JSONB DEFAULT '{}',
  url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for system_settings (Admin only)
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage system_settings"
  ON public.system_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Public can view system_settings"
  ON public.system_settings
  FOR SELECT
  USING (true);

-- RLS for analytics_events (Anyone can insert, Admins can view)
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert events"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all events"
  ON public.analytics_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
