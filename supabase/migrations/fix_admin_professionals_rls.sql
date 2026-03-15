-- =============================================================================
-- NUREA: Fix RLS para que el admin pueda verificar profesionales
-- Ejecutar en Supabase SQL Editor
-- =============================================================================

-- Asegurar que existe la política que permite al admin actualizar professionals
DROP POLICY IF EXISTS "admins_can_update_professionals" ON public.professionals;
DROP POLICY IF EXISTS "Admins can update verification" ON public.professionals;

CREATE POLICY "admins_can_update_professionals"
  ON public.professionals
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

COMMENT ON POLICY "admins_can_update_professionals" ON public.professionals IS
  'Permite a los admins actualizar cualquier fila de professionals (necesario para verificar especialistas)';

-- Asegurar que los admins también pueden SELECT todos los professionals
DROP POLICY IF EXISTS "admins_can_select_all_professionals" ON public.professionals;

CREATE POLICY "admins_can_select_all_professionals"
  ON public.professionals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

COMMENT ON POLICY "admins_can_select_all_professionals" ON public.professionals IS
  'Permite a los admins ver todos los profesionales (verificados y no verificados)';

-- Verificar que las políticas se crearon correctamente
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'professionals'
ORDER BY policyname;
