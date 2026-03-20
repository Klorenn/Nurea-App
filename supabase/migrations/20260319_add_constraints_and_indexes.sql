-- =============================================================================
-- NUREA - Constraints e Índices Faltantes
-- Fecha: 2026-03-19
-- Descripción: Agrega constraints de negocio y índices para queries frecuentes
--
-- CONSTRAINTS AGREGADOS:
-- 1. appointments: check_future_date - previene citas en el pasado
-- 2. appointments: check_duration - duración válida (15-180 min)
-- 3. appointments: check_different_parties - profesional ≠ paciente
-- 4. referrals: check_max_uses - no exceder límite de usos
-- 5. messages: índice compuesto para historial
-- 6. appointments: índices compuestos para dashboard
-- =============================================================================

DO $$
DECLARE
  v_constraint_exists BOOLEAN;
BEGIN

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Agregando constraints e índices...';
  RAISE NOTICE '========================================';

  -- ==========================================================================
  -- 1. CONSTRAINTS EN APPOINTMENTS
  -- ==========================================================================

  RAISE NOTICE '1. Constraints en appointments...';

  -- 1a. No permitir citas en fechas pasadas
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conrelid = 'appointments'::regclass
        AND conname = 'check_future_date'
    ) INTO v_constraint_exists;

    IF NOT v_constraint_exists THEN
      -- Primero limpiar citas pasadas existentes (opcional - descomenta si es necesario)
      -- DELETE FROM public.appointments WHERE appointment_date < CURRENT_DATE AND status = 'pending';

      ALTER TABLE public.appointments
        ADD CONSTRAINT check_future_date
        CHECK (appointment_date >= CURRENT_DATE);

      RAISE NOTICE '   ✅ Constraint check_future_date creado';
    ELSE
      RAISE NOTICE '   ✅ Constraint check_future_date ya existe';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '   ⚠️ No se pudo crear check_future_date: %', SQLERRM;
  END;

  -- 1b. Duración válida (15-180 minutos)
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conrelid = 'appointments'::regclass
        AND conname = 'check_duration'
    ) INTO v_constraint_exists;

    IF NOT v_constraint_exists THEN
      ALTER TABLE public.appointments
        ADD CONSTRAINT check_duration
        CHECK (duration_minutes >= 15 AND duration_minutes <= 180);

      RAISE NOTICE '   ✅ Constraint check_duration creado';
    ELSE
      RAISE NOTICE '   ✅ Constraint check_duration ya existe';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '   ⚠️ No se pudo crear check_duration: %', SQLERRM;
  END;

  -- 1c. Profesional ≠ Paciente (evitar auto-citas)
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conrelid = 'appointments'::regclass
        AND conname = 'check_different_parties'
    ) INTO v_constraint_exists;

    IF NOT v_constraint_exists THEN
      ALTER TABLE public.appointments
        ADD CONSTRAINT check_different_parties
        CHECK (patient_id != professional_id);

      RAISE NOTICE '   ✅ Constraint check_different_parties creado';
    ELSE
      RAISE NOTICE '   ✅ Constraint check_different_parties ya existe';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '   ⚠️ No se pudo crear check_different_parties: %', SQLERRM;
  END;

  -- ==========================================================================
  -- 2. CONSTRAINTS EN referral_codes
  -- ==========================================================================

  RAISE NOTICE '2. Constraints en referral_codes...';

  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conrelid = 'referral_codes'::regclass
        AND conname = 'check_max_uses'
    ) INTO v_constraint_exists;

    IF NOT v_constraint_exists THEN
      -- Verificar que la tabla existe
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'referral_codes') THEN
        ALTER TABLE public.referral_codes
          ADD CONSTRAINT check_max_uses
          CHECK (uses_count <= max_uses OR max_uses IS NULL);

        RAISE NOTICE '   ✅ Constraint check_max_uses creado';
      ELSE
        RAISE NOTICE '   ⚠️ Tabla referral_codes no existe, omitido';
      END IF;
    ELSE
      RAISE NOTICE '   ✅ Constraint check_max_uses ya existe';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '   ⚠️ No se pudo crear check_max_uses: %', SQLERRM;
  END;

  -- ==========================================================================
  -- 3. ÍNDICES COMPUESTOS PARA QUERIES FRECUENTES
  -- ==========================================================================

  RAISE NOTICE '3. Índices compuestos...';

  -- 3a. appointments: para dashboard profesional
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'appointments'
      AND indexname = 'idx_appointments_professional_status'
  ) THEN
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_professional_status
      ON public.appointments(professional_id, status);
    RAISE NOTICE '   ✅ idx_appointments_professional_status creado';
  ELSE
    RAISE NOTICE '   ✅ idx_appointments_professional_status ya existe';
  END IF;

  -- 3b. appointments: para historial de paciente
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'appointments'
      AND indexname = 'idx_appointments_patient_date'
  ) THEN
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_patient_date
      ON public.appointments(patient_id, appointment_date DESC);
    RAISE NOTICE '   ✅ idx_appointments_patient_date creado';
  ELSE
    RAISE NOTICE '   ✅ idx_appointments_patient_date ya existe';
  END IF;

  -- 3c. appointments: para profesionales con más citas
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'appointments'
      AND indexname = 'idx_appointments_professional_date'
  ) THEN
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_professional_date
      ON public.appointments(professional_id, appointment_date DESC);
    RAISE NOTICE '   ✅ idx_appointments_professional_date creado';
  ELSE
    RAISE NOTICE '   ✅ idx_appointments_professional_date ya existe';
  END IF;

  -- 3d. messages: para historial de chat
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'messages'
      AND indexname = 'idx_messages_users_created'
  ) THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'messages') THEN
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_users_created
        ON public.messages(sender_id, receiver_id, created_at DESC);
      RAISE NOTICE '   ✅ idx_messages_users_created creado';
    ELSE
      RAISE NOTICE '   ⚠️ Tabla messages no existe, omitido';
    END IF;
  ELSE
    RAISE NOTICE '   ✅ idx_messages_users_created ya existe';
  END IF;

  -- 3e. chat_messages: para conversaciones
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'chat_messages'
      AND indexname = 'idx_chat_messages_conv_created'
  ) THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_messages') THEN
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_conv_created
        ON public.chat_messages(conversation_id, created_at DESC);
      RAISE NOTICE '   ✅ idx_chat_messages_conv_created creado';
    ELSE
      RAISE NOTICE '   ⚠️ Tabla chat_messages no existe, omitido';
    END IF;
  ELSE
    RAISE NOTICE '   ✅ idx_chat_messages_conv_created ya existe';
  END IF;

  -- 3f. profiles: índice por rol para búsquedas
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND indexname = 'idx_profiles_role'
  ) THEN
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_role
      ON public.profiles(role);
    RAISE NOTICE '   ✅ idx_profiles_role creado';
  ELSE
    RAISE NOTICE '   ✅ idx_profiles_role ya existe';
  END IF;

  -- 3g. notifications: índice para feed de usuario
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'notifications'
      AND indexname = 'idx_notifications_user_read'
  ) THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_read
        ON public.notifications(user_id, read, created_at DESC);
      RAISE NOTICE '   ✅ idx_notifications_user_read creado';
    ELSE
      RAISE NOTICE '   ⚠️ Tabla notifications no existe, omitido';
    END IF;
  ELSE
    RAISE NOTICE '   ✅ idx_notifications_user_read ya existe';
  END IF;

  -- ==========================================================================
  -- 4. ÍNDICE ÚNICO PARA PREVENIR SPAM DE NOTIFICACIONES
  -- ==========================================================================

  RAISE NOTICE '4. Constraints de unicidad...';

  -- notifications: evitar notificaciones duplicadas
  BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
      IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename = 'notifications'
          AND indexname = 'idx_notifications_user_type_metadata'
      ) THEN
        CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_type_metadata
          ON public.notifications(user_id, type, metadata)
          WHERE metadata IS NOT NULL;
        RAISE NOTICE '   ✅ Índice único para notificaciones creado';
      ELSE
        RAISE NOTICE '   ✅ Índice único para notificaciones ya existe';
      END IF;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '   ⚠️ No se pudo crear índice de notificaciones: %', SQLERRM;
  END;

  -- ==========================================================================
  -- 5. VERIFICACIÓN FINAL
  -- ==========================================================================

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Constraints e índices agregados';
  RAISE NOTICE '========================================';

  -- Mostrar constraints de appointments
  RAISE NOTICE '';
  RAISE NOTICE 'Constraints en appointments:';
  FOR const IN
    SELECT conname, contype, pg_get_constraintdef(oid)
    FROM pg_constraint
    WHERE conrelid = 'appointments'::regclass
  LOOP
    RAISE NOTICE '  - % (%)', const.conname, const.contype;
  END LOOP;

  -- Mostrar índices nuevos
  RAISE NOTICE '';
  RAISE NOTICE 'Índices creados:';
  FOR idx IN
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename IN ('appointments', 'profiles', 'messages', 'chat_messages', 'notifications')
      AND indexname LIKE 'idx_%'
    ORDER BY tablename, indexname
  LOOP
    RAISE NOTICE '  - %', idx.indexname;
  END LOOP;

END $$;
