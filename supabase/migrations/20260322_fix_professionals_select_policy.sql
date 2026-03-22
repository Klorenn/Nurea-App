-- Fix professionals SELECT policy to allow professionals to read their own row
-- regardless of verification status. Previously only verified = true OR admin.
-- This caused API routes and profile pages to silently fail for non-verified professionals.

DROP POLICY IF EXISTS "professionals_select" ON public.professionals;

CREATE POLICY "professionals_select" ON public.professionals
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR verified = true
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
