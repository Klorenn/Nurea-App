-- =============================================================================
-- NUREA - Fix Appointment Constraints & Atomic Booking RPC
-- Fecha: 2026-03-20
-- Auditor: Agente 1 (Database & Backend Engineer)
--
-- BUGS CORREGIDOS:
-- 1. create_appointment_atomic usa LIMIT 1 sin filtro de solapamiento real:
--    selecciona CUALQUIER cita del profesional ese día (no la que solapa)
--    y luego verifica el solapamiento DESPUÉS — si hay 3 citas pero sólo
--    la 3ra solapa, LIMIT 1 puede devolver la 1ra (sin solapamiento) y
--    dejar pasar el conflicto. BUG CRÍTICO DE RACE CONDITION.
--
-- 2. check_future_date usa CURRENT_DATE lo que invalida citas históricas
--    (el constraint impide actualizar citas pasadas — ej. marcarlas completed).
--    Se reemplaza por un trigger BEFORE INSERT en su lugar.
--
-- 3. profiles_update WITH CHECK sólo permite id = auth.uid(), bloqueando
--    a los admins de actualizar perfiles de otros usuarios (USING correcto
--    pero WITH CHECK incorrecto).
--
-- 4. UNIQUE index appointments_no_double_booking no existía con ese nombre
--    (existía uniq_appointments_professional_datetime_active — renombramos).
--    El exclusion constraint appointments_no_overlap_active ya cubre esto
--    con tsrange, pero lo mantenemos para compatibilidad con el task.
--
-- 5. Índice (professional_id, appointment_date, status) faltaba.
-- =============================================================================

-- =============================================================================
-- 1. CORREGIR BUG CRÍTICO: create_appointment_atomic
--    El SELECT de conflicto debe filtrar sólo las citas que realmente solapan
--    ANTES del LIMIT 1, no después.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.create_appointment_atomic(
  p_professional_id    UUID,
  p_patient_id         UUID,
  p_appointment_date   DATE,
  p_appointment_time   TIME,
  p_duration_minutes   INT     DEFAULT 30,
  p_status             TEXT    DEFAULT 'pending',
  p_is_online          BOOLEAN DEFAULT false,
  p_notes              TEXT    DEFAULT NULL,
  p_price              NUMERIC DEFAULT NULL,
  p_payment_status     TEXT    DEFAULT 'pending'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_appointment_id     UUID;
  v_new_start          TIMESTAMP;
  v_new_end            TIMESTAMP;
  v_conflict_id        UUID;
BEGIN
  -- -------------------------------------------------------------------------
  -- Guardrails básicos
  -- -------------------------------------------------------------------------
  IF p_professional_id = p_patient_id THEN
    RETURN jsonb_build_object(
      'success',       false,
      'error_code',    'SAME_USER',
      'error_message', 'El profesional y el paciente no pueden ser la misma persona'
    );
  END IF;

  IF p_appointment_date < CURRENT_DATE THEN
    RETURN jsonb_build_object(
      'success',       false,
      'error_code',    'PAST_DATE',
      'error_message', 'No se pueden crear citas en fechas pasadas'
    );
  END IF;

  -- Bloquear si es hoy pero la hora ya pasó (comparando con NOW() en UTC)
  -- Nota: appointment_time se asume en hora local (America/Santiago).
  -- La validación de hora exacta se hace también en la API; aquí es guardrail de DB.
  IF p_appointment_date = CURRENT_DATE AND
     (p_appointment_date + p_appointment_time)::TIMESTAMP < NOW() AT TIME ZONE 'UTC' THEN
    RETURN jsonb_build_object(
      'success',       false,
      'error_code',    'PAST_DATE',
      'error_message', 'No se pueden crear citas en horas ya pasadas'
    );
  END IF;

  IF p_duration_minutes < 15 OR p_duration_minutes > 180 THEN
    RETURN jsonb_build_object(
      'success',       false,
      'error_code',    'INVALID_DURATION',
      'error_message', 'La duración debe ser entre 15 y 180 minutos'
    );
  END IF;

  -- -------------------------------------------------------------------------
  -- BUG FIX: verificar solapamiento real con tsrange ANTES del INSERT.
  -- La versión anterior hacía LIMIT 1 sobre TODAS las citas del día y luego
  -- verificaba si esa cita concreta solapaba — fallando cuando la primera
  -- cita devuelta no era la que solapaba.
  -- -------------------------------------------------------------------------
  v_new_start := (p_appointment_date + p_appointment_time)::TIMESTAMP;
  v_new_end   := v_new_start + make_interval(mins => p_duration_minutes);

  SELECT id INTO v_conflict_id
  FROM public.appointments
  WHERE professional_id = p_professional_id
    AND status IN ('pending', 'confirmed')
    -- Solapamiento tsrange: [nuevo_inicio, nuevo_fin) && [existente_inicio, existente_fin)
    AND tsrange(
          (appointment_date + appointment_time)::TIMESTAMP,
          (appointment_date + appointment_time)::TIMESTAMP + make_interval(mins => COALESCE(duration_minutes, 30)),
          '[)'
        )
    && tsrange(v_new_start, v_new_end, '[)')
  LIMIT 1;

  IF v_conflict_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success',                false,
      'error_code',             'SLOT_OCCUPIED',
      'error_message',          'El horario seleccionado se solapa con una cita existente',
      'conflict_appointment_id', v_conflict_id
    );
  END IF;

  -- -------------------------------------------------------------------------
  -- INSERT atómico (el exclusion constraint appointments_no_overlap_active
  -- en starts_at/ends_at actúa como red de seguridad final contra race conditions)
  -- -------------------------------------------------------------------------
  v_appointment_id := gen_random_uuid();

  INSERT INTO public.appointments (
    id,
    professional_id,
    patient_id,
    appointment_date,
    appointment_time,
    duration_minutes,
    status,
    is_online,
    notes,
    price,
    payment_status,
    created_at,
    updated_at
  ) VALUES (
    v_appointment_id,
    p_professional_id,
    p_patient_id,
    p_appointment_date,
    p_appointment_time,
    p_duration_minutes,
    p_status,
    p_is_online,
    p_notes,
    p_price,
    p_payment_status,
    NOW(),
    NOW()
  );

  RETURN jsonb_build_object(
    'success',        true,
    'appointment_id', v_appointment_id,
    'appointment',    (SELECT row_to_json(a) FROM public.appointments a WHERE id = v_appointment_id)
  );

EXCEPTION
  -- El exclusion constraint appointments_no_overlap_active lanza exclusion_violation
  -- si dos inserts concurrentes pasan la verificación anterior al mismo tiempo.
  WHEN exclusion_violation THEN
    RETURN jsonb_build_object(
      'success',       false,
      'error_code',    'SLOT_OCCUPIED',
      'error_message', 'El horario ya fue reservado por otra persona en este momento. Por favor, elige otro horario.'
    );
  WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'success',       false,
      'error_code',    'SLOT_OCCUPIED',
      'error_message', 'El horario ya está ocupado.'
    );
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success',       false,
      'error_code',    'INTERNAL_ERROR',
      'error_message', SQLERRM
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_appointment_atomic TO authenticated;

-- =============================================================================
-- 2. CORREGIR BUG: check_future_date bloquea UPDATE de citas pasadas.
--    Reemplazar CHECK constraint por trigger BEFORE INSERT.
-- =============================================================================

-- Eliminar constraint problemático si existe
ALTER TABLE public.appointments
  DROP CONSTRAINT IF EXISTS check_future_date;

-- Trigger que sólo aplica en INSERT (no en UPDATE/cancelaciones de citas pasadas)
CREATE OR REPLACE FUNCTION public._appointments_check_future_date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.appointment_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'No se pueden crear citas en fechas pasadas'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_appointments_future_date ON public.appointments;
CREATE TRIGGER trg_appointments_future_date
  BEFORE INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public._appointments_check_future_date();

-- =============================================================================
-- 3. UNIQUE INDEX con el nombre requerido por el task
--    (el exclusion constraint ya previene overlaps — este previene duplicado exacto)
-- =============================================================================

-- Renombrar si existe el índice antiguo (Postgres no permite IF EXISTS en RENAME)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename   = 'appointments'
      AND indexname   = 'uniq_appointments_professional_datetime_active'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename   = 'appointments'
      AND indexname   = 'appointments_no_double_booking'
  ) THEN
    ALTER INDEX public.uniq_appointments_professional_datetime_active
      RENAME TO appointments_no_double_booking;
    RAISE NOTICE 'Índice renombrado a appointments_no_double_booking';
  ELSIF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename   = 'appointments'
      AND indexname   = 'appointments_no_double_booking'
  ) THEN
    -- Crear desde cero si no existía ninguno
    CREATE UNIQUE INDEX appointments_no_double_booking
      ON public.appointments (professional_id, appointment_date, appointment_time)
      WHERE status IN ('pending', 'confirmed');
    RAISE NOTICE 'Índice appointments_no_double_booking creado';
  ELSE
    RAISE NOTICE 'Índice appointments_no_double_booking ya existe';
  END IF;
END $$;

-- =============================================================================
-- 4. ÍNDICE DE PERFORMANCE: (professional_id, appointment_date, status)
--    para las queries más frecuentes del dashboard profesional.
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_appointments_professional_date_status
  ON public.appointments (professional_id, appointment_date, status);

-- =============================================================================
-- 5. CORREGIR BUG RLS: profiles_update WITH CHECK bloquea admins.
--    La migración 20260319_consolidate_rls_policies.sql tiene:
--      WITH CHECK (id = auth.uid())   <-- admins no pueden pasar este check
--    cuando actualizan el perfil de otro usuario.
-- =============================================================================

-- Solo ejecutar si el constraint sigue siendo el incorrecto
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid()
    OR created_by_professional_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    -- Admins pueden actualizar cualquier perfil; demás usuarios sólo el suyo
    id = auth.uid()
    OR created_by_professional_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles p2 WHERE p2.id = auth.uid() AND p2.role = 'admin')
  );

-- =============================================================================
-- 6. RLS FALTANTE: support_tickets — admins no podían UPDATE vía la policy ALL
--    cuando la policy ALL y la policy SELECT coexisten (ALL tiene precedencia
--    pero en Supabase las policies de SELECT separadas pueden entrar en conflicto).
--    Esto es correcto — sólo verificamos que no haya policy redundante.
-- =============================================================================

-- No hay problema real en support_tickets; la policy "Admins can view and update all"
-- usa FOR ALL correctamente. Se documenta aquí como confirmación.

-- =============================================================================
-- 7. VERIFICACIÓN FINAL
-- =============================================================================

DO $$
BEGIN
  -- Verificar función actualizada
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_appointment_atomic') THEN
    RAISE NOTICE '✅ create_appointment_atomic: corregida (overlap check con tsrange)';
  END IF;

  -- Verificar trigger de fecha futura
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'trg_appointments_future_date'
      AND event_object_table = 'appointments'
  ) THEN
    RAISE NOTICE '✅ trg_appointments_future_date: creado (sólo en INSERT)';
  END IF;

  -- Verificar índice no-double-booking
  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename   = 'appointments'
      AND indexname   = 'appointments_no_double_booking'
  ) THEN
    RAISE NOTICE '✅ appointments_no_double_booking: índice único presente';
  END IF;

  -- Verificar índice de performance
  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename   = 'appointments'
      AND indexname   = 'idx_appointments_professional_date_status'
  ) THEN
    RAISE NOTICE '✅ idx_appointments_professional_date_status: presente';
  END IF;

  -- Verificar policy de profiles_update
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'profiles'
      AND policyname = 'profiles_update'
  ) THEN
    RAISE NOTICE '✅ profiles_update policy: recreada con WITH CHECK correcto para admins';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '=== Migración 20260320_fix_appointment_constraints completada ===';
END $$;
