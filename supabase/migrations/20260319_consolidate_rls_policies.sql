-- =============================================================================
-- NUREA - Consolidación de Políticas RLS
-- Fecha: 2026-03-19
-- Descripción: Elimina políticas duplicadas/conflictivas y consolida
--              en un juego único de políticas por tabla.
--
-- PROBLEMAS RESUELTOS:
-- 1. appointments_insert_patient duplicada (security_policies + 20260328)
-- 2. profiles_select_all vs profiles_select_own (core vs security_policies)
-- 3. profiles_update_own con definiciones diferentes
-- =============================================================================

DO $$
DECLARE
  v_notice TEXT;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Iniciando consolidación de RLS...';
  RAISE NOTICE '========================================';

  -- ==========================================================================
  -- 1. ELIMINAR POLICIES DUPLICADAS/CONFLICTIVAS EN APPOINTMENTS
  -- ==========================================================================

  RAISE NOTICE '1. Limpiando policies de appointments...';

  -- Eliminar todas las policies de appointments excepto las que vamos a recrear
  DROP POLICY IF EXISTS "appointments_select_patient" ON public.appointments;
  DROP POLICY IF EXISTS "appointments_select_professional" ON public.appointments;
  DROP POLICY IF EXISTS "appointments_select_own" ON public.appointments;
  DROP POLICY IF EXISTS "appointments_insert_patient" ON public.appointments;
  DROP POLICY IF EXISTS "appointments_insert_pro_or_patient" ON public.appointments;
  DROP POLICY IF EXISTS "appointments_update_own" ON public.appointments;
  DROP POLICY IF EXISTS "appointments_admin_full_access" ON public.appointments;
  DROP POLICY IF EXISTS "appointments_delete_admin" ON public.appointments;

  -- Recrear policies consolidadas para appointments
  -- SELECT: Pacientes ven sus citas, profesionales ven sus citas
  CREATE POLICY "appointments_select" ON public.appointments
    FOR SELECT TO authenticated
    USING (
      patient_id = auth.uid()
      OR professional_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

  -- INSERT: Pacientes, profesionales o admins pueden crear
  CREATE POLICY "appointments_insert" ON public.appointments
    FOR INSERT TO authenticated
    WITH CHECK (
      auth.uid() = patient_id
      OR auth.uid() = professional_id
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = patient_id AND p.created_by_professional_id = auth.uid()
      )
    );

  -- UPDATE: Las partes involucradas o admins
  CREATE POLICY "appointments_update" ON public.appointments
    FOR UPDATE TO authenticated
    USING (
      patient_id = auth.uid()
      OR professional_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
    WITH CHECK (
      patient_id = auth.uid()
      OR professional_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

  -- DELETE: Solo admins (auditoría médica)
  CREATE POLICY "appointments_delete" ON public.appointments
    FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

  RAISE NOTICE '   ✅ appointments: 4 policies consolidadas';

  -- ==========================================================================
  -- 2. ELIMINAR POLICIES DUPLICADAS/CONFLICTIVAS EN PROFILES
  -- ==========================================================================

  RAISE NOTICE '2. Limpiando policies de profiles...';

  DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_select_created_by_me" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_select_verified_professionals" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_update_created_by_me" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_admin_full_access" ON public.profiles;

  -- Recrear policies consolidadas para profiles
  -- SELECT: Uno mismo, profesionales verificados (para buscador), o admins
  CREATE POLICY "profiles_select" ON public.profiles
    FOR SELECT TO authenticated
    USING (
      id = auth.uid()
      OR (
        role = 'professional'
        AND EXISTS (SELECT 1 FROM public.professionals WHERE id = profiles.id AND verified = true)
      )
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      OR created_by_professional_id = auth.uid()
    );

  -- INSERT: Solo para sí mismo
  CREATE POLICY "profiles_insert" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid());

  -- UPDATE: Uno mismo o admins (con restricciones)
  CREATE POLICY "profiles_update" ON public.profiles
    FOR UPDATE TO authenticated
    USING (
      id = auth.uid()
      OR created_by_professional_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
    WITH CHECK (id = auth.uid());

  RAISE NOTICE '   ✅ profiles: 3 policies consolidadas';

  -- ==========================================================================
  -- 3. ELIMINAR POLICIES DUPLICADAS/CONFLICTIVAS EN PROFESSIONALS
  -- ==========================================================================

  RAISE NOTICE '3. Limpiando policies de professionals...';

  DROP POLICY IF EXISTS "professionals_select_all" ON public.professionals;
  DROP POLICY IF EXISTS "professionals_select_verified" ON public.professionals;
  DROP POLICY IF EXISTS "professionals_update_own" ON public.professionals;
  DROP POLICY IF EXISTS "professionals_insert_own" ON public.professionals;
  DROP POLICY IF EXISTS "admins_can_update_professionals" ON public.professionals;
  DROP POLICY IF EXISTS "admins_can_select_all_professionals" ON public.professionals;

  -- Recrear policies consolidadas para professionals
  -- SELECT: Todos pueden ver profesionales (para buscador), pero solo verificados
  CREATE POLICY "professionals_select" ON public.professionals
    FOR SELECT TO authenticated
    USING (verified = true OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

  -- INSERT/UPDATE: Solo el propio profesional o admins
  CREATE POLICY "professionals_insert" ON public.professionals
    FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid());

  CREATE POLICY "professionals_update" ON public.professionals
    FOR UPDATE TO authenticated
    USING (
      id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
    WITH CHECK (
      id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

  RAISE NOTICE '   ✅ professionals: 3 policies consolidadas';

  -- ==========================================================================
  -- 4. ASEGURAR FUNCIONES HELPER EXISTEN
  -- ==========================================================================

  RAISE NOTICE '4. Verificando funciones helper...';

  -- Verificar que is_admin existe
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    CREATE OR REPLACE FUNCTION public.is_admin()
    RETURNS BOOLEAN AS $$
    BEGIN
      RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
    GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
    RAISE NOTICE '   ✅ Función is_admin() creada';
  ELSE
    RAISE NOTICE '   ✅ Función is_admin() ya existe';
  END IF;

  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Consolidación de RLS completada';
  RAISE NOTICE '========================================';

END $$;

-- Verificación final
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('appointments', 'profiles', 'professionals')
ORDER BY tablename, policyname;
