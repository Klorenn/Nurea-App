-- NUREA PACS - Report Templates

CREATE TABLE IF NOT EXISTS public.report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general', -- e.g. 'rx', 'tac', 'rm', 'eco', 'general'
  content TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.report_templates IS 'Plantillas de informes radiológicos personalizadas por profesional';

CREATE INDEX IF NOT EXISTS idx_report_templates_professional ON public.report_templates(professional_id);
CREATE INDEX IF NOT EXISTS idx_report_templates_category ON public.report_templates(professional_id, category);

ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;

-- Only the professional owns their templates
CREATE POLICY "templates_select_own" ON public.report_templates FOR SELECT
  USING (auth.uid() = professional_id);

CREATE POLICY "templates_insert_own" ON public.report_templates FOR INSERT
  WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "templates_update_own" ON public.report_templates FOR UPDATE
  USING (auth.uid() = professional_id)
  WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "templates_delete_own" ON public.report_templates FOR DELETE
  USING (auth.uid() = professional_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS report_templates_updated_at ON public.report_templates;
CREATE TRIGGER report_templates_updated_at BEFORE UPDATE ON public.report_templates
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- Seed some universal starter templates for all professionals
-- (These would normally be created per-professional on signup, but for demo purposes we skip foreign key constraint)
-- INSERT INTO public.report_templates (professional_id, name, category, content, is_default) VALUES...
-- NOTE: Run seeding script separately linked to actual professional UUIDs
