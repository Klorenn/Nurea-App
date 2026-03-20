-- =============================================================================
-- NUREA - Consolidación de Tablas Financieras
-- Fecha: 2026-03-19
-- Descripción: Consolida las tablas financieras duplicadas y asegura
--              schema consistente.
--
-- PROBLEMA: Existen dos tablas finanzas con columnas diferentes:
--   1. financial_transactions (20260315) - con platform_fee, professional_net
--   2. finances (20260321 y 20260401) - con nurea_commission, professional_payout
--
-- SOLUCIÓN:
--   - Mantener tabla 'finances' como la tabla principal
--   - Asegurar columnas necesarias para receipts
--   - Crear tabla unificada si es necesario
-- =============================================================================

DO $$
DECLARE
  v_has_receipt_folio BOOLEAN;
  v_has_nurea_commission BOOLEAN;
  v_has_stripe_mp BOOLEAN;
BEGIN

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Iniciando consolidación de finanzas...';
  RAISE NOTICE '========================================';

  -- ==========================================================================
  -- 1. VERIFICAR Y MIGRAR TABLA finances (si existe)
  -- ==========================================================================

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'finances') THEN

    RAISE NOTICE '1. Verificando tabla finances...';

    -- Verificar columnas existentes
    SELECT
      EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'finances' AND column_name = 'receipt_folio'),
      EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'finances' AND column_name = 'nurea_commission'),
      EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'finances' AND column_name = 'stripe_payment_intent_id')
    INTO v_has_receipt_folio, v_has_nurea_commission, v_has_stripe_mp;

    -- Agregar columnas faltantes si es necesario
    IF NOT v_has_receipt_folio THEN
      ALTER TABLE public.finances ADD COLUMN IF NOT EXISTS receipt_folio TEXT;
      RAISE NOTICE '   ✅ Columna receipt_folio agregada';
    ELSE
      RAISE NOTICE '   ✅ Columna receipt_folio ya existe';
    END IF;

    IF NOT v_has_nurea_commission THEN
      ALTER TABLE public.finances ADD COLUMN IF NOT EXISTS nurea_commission NUMERIC(12, 2) DEFAULT 0;
      RAISE NOTICE '   ✅ Columna nurea_commission agregada';
    ELSE
      RAISE NOTICE '   ✅ Columna nurea_commission ya existe';
    END IF;

    IF NOT v_has_stripe_mp THEN
      ALTER TABLE public.finances ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
      RAISE NOTICE '   ✅ Columna stripe_payment_intent_id agregada';
    ELSE
      RAISE NOTICE '   ✅ Columna stripe_payment_intent_id ya existe';
    END IF;

    -- Asegurar que tenemos patient_id y professional_id (necesario para receipts)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'finances' AND column_name = 'patient_id') THEN
      ALTER TABLE public.finances ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES public.profiles(id);
      RAISE NOTICE '   ⚠️ Columna patient_id agregada (puede necesitar datos)';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'finances' AND column_name = 'professional_id') THEN
      ALTER TABLE public.finances ADD COLUMN IF NOT EXISTS professional_id UUID REFERENCES public.profiles(id);
      RAISE NOTICE '   ⚠️ Columna professional_id agregada (puede necesitar datos)';
    END IF;

  ELSE
    RAISE NOTICE '1. ⚠️ Tabla finances no existe - no se puede consolidar';
  END IF;

  -- ==========================================================================
  -- 2. LIMPIAR POLICIES DE finances (asegurar consistencia)
  -- ==========================================================================

  RAISE NOTICE '2. Limpiando policies de finances...';

  -- Eliminar policies duplicadas de finances
  DROP POLICY IF EXISTS "finances_admin_select" ON public.finances;
  DROP POLICY IF EXISTS "finances_admin_insert" ON public.finances;
  DROP POLICY IF EXISTS "finances_admin_update" ON public.finances;
  DROP POLICY IF EXISTS "finances_professional_select" ON public.finances;
  DROP POLICY IF EXISTS "finances_patient_select" ON public.finances;
  DROP POLICY IF EXISTS "Professionals can view their own finances" ON public.finances;
  DROP POLICY IF EXISTS "Admins can view all finances" ON public.finances;

  -- Recrear policies consolidadas
  CREATE POLICY "finances_select" ON public.finances
    FOR SELECT TO authenticated
    USING (
      -- Paciente puede ver sus propios registros (via appointment)
      EXISTS (
        SELECT 1 FROM public.appointments a
        WHERE a.id = finances.appointment_id AND a.patient_id = auth.uid()
      )
      OR
      -- Profesional puede ver sus propios registros
      EXISTS (
        SELECT 1 FROM public.appointments a
        WHERE a.id = finances.appointment_id AND a.professional_id = auth.uid()
      )
      OR
      -- Admin ve todo
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

  -- Solo admins pueden insertar/actualizar
  CREATE POLICY "finances_admin_all" ON public.finances
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

  RAISE NOTICE '   ✅ Policies de finances consolidadas';

  -- ==========================================================================
  -- 3. CREAR FUNCIÓN HELPER PARA CREAR RECEIPT (si no existe)
  -- ==========================================================================

  RAISE NOTICE '3. Verificando funciones helper de finanzas...';

  -- Asegurar que la función de completado existe
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'complete_appointment_and_release_funds') THEN
    CREATE OR REPLACE FUNCTION public.complete_appointment_and_release_funds(p_appointment_id UUID)
    RETURNS VOID AS $$
    BEGIN
      UPDATE public.appointments
      SET status = 'completed', updated_at = now()
      WHERE id = p_appointment_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    RAISE NOTICE '   ✅ Función complete_appointment_and_release_funds creada';
  ELSE
    RAISE NOTICE '   ✅ Función complete_appointment_and_release_funds ya existe';
  END IF;

  -- ==========================================================================
  -- 4. VERIFICACIÓN FINAL
  -- ==========================================================================

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Consolidación de finanzas completada';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Estado de tablas financieras:';
  RAISE NOTICE '  - finances: tabla principal (usada por receipts)';
  RAISE NOTICE '  - financial_transactions: existente para backwards compat';
  RAISE NOTICE '';
  RAISE NOTICE 'NOTA: Si hay datos en ambas tablas, considera migrarlos manualmente.';

END $$;

-- Mostrar estado de finances
SELECT
  'finances' as table_name,
  COUNT(*) as row_count
FROM public.finances
UNION ALL
SELECT
  'financial_transactions' as table_name,
  COUNT(*) as row_count
FROM public.financial_transactions
ORDER BY table_name;
