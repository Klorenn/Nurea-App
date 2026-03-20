-- =============================================================================
-- NUREA: Auditoria Completa - Tablas y Columnas Faltantes
-- Fecha: 2026-04-01
-- Descripcion: Esta migracion agrega las tablas y columnas que el codigo
--              fuente referencia pero que NO existen en la base de datos.
--
-- Tablas nuevas:
--   1. documents        (sistema de documentos medicos)
--   2. payments         (registro de pagos)
--   3. finances         (finanzas/comisiones de plataforma)
--   4. message_notifications (cola de notificaciones de mensajes por email)
--   5. system_settings  (configuracion del sistema / feature flags)
--
-- Columnas nuevas en tablas existentes:
--   6. profiles.blocked, profiles.blocked_at (suspension de cuentas)
--   7. profiles.notification_preferences (preferencias de notificacion)
--   8. professionals.bank_account, professionals.bank_name (datos bancarios)
-- =============================================================================


-- =============================================================================
-- 0. TABLA: messages (Dependencia de message_notifications)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_appointment_id ON public.messages(appointment_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "messages_select_own" ON public.messages
  FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY IF NOT EXISTS "messages_insert_own" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY IF NOT EXISTS "messages_update_receiver" ON public.messages
  FOR UPDATE TO authenticated
  USING (receiver_id = auth.uid())
  WITH CHECK (receiver_id = auth.uid());

GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
REVOKE ALL ON public.messages FROM anon;


-- =============================================================================
-- 1. TABLA: documents (Documentos Medicos)
-- Referenciada por:
--   - app/api/documents/upload/route.ts
--   - app/api/documents/list/route.ts
--   - app/api/documents/view/route.ts
--   - app/api/documents/download/route.ts
--   - app/api/professionals/[id]/route.ts
--   - app/api/admin/users/route.ts (DELETE)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relaciones
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Metadatos del documento
  name TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,

  -- Clasificacion
  category TEXT NOT NULL DEFAULT 'other'
    CHECK (category IN (
      'lab_result', 'imaging', 'prescription', 'referral',
      'insurance', 'consent', 'report', 'other'
    )),

  -- Seguridad
  encrypted BOOLEAN NOT NULL DEFAULT false,
  access_level TEXT NOT NULL DEFAULT 'patient_and_professional'
    CHECK (access_level IN ('patient_only', 'professional_only', 'patient_and_professional', 'admin_only')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices para documents
CREATE INDEX IF NOT EXISTS idx_documents_patient_id ON public.documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_documents_professional_id ON public.documents(professional_id);
CREATE INDEX IF NOT EXISTS idx_documents_appointment_id ON public.documents(appointment_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_patient_created ON public.documents(patient_id, created_at DESC);

COMMENT ON TABLE public.documents IS 'Documentos medicos subidos por pacientes y profesionales. Datos sensibles protegidos por RLS.';

-- RLS para documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Pacientes ven sus propios documentos
CREATE POLICY "documents_select_patient" ON public.documents
  FOR SELECT TO authenticated
  USING (
    patient_id = auth.uid()
    OR uploaded_by = auth.uid()
    OR professional_id = auth.uid()
  );

-- Profesionales ven documentos de sus pacientes (via citas)
CREATE POLICY "documents_select_professional" ON public.documents
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.professional_id = auth.uid()
        AND a.patient_id = documents.patient_id
    )
  );

-- Insertar: el usuario autenticado debe ser el uploaded_by
CREATE POLICY "documents_insert_own" ON public.documents
  FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

-- Actualizar: solo el que subio el documento
CREATE POLICY "documents_update_own" ON public.documents
  FOR UPDATE TO authenticated
  USING (uploaded_by = auth.uid())
  WITH CHECK (uploaded_by = auth.uid());

-- Eliminar: solo el que subio o admin
CREATE POLICY "documents_delete_own" ON public.documents
  FOR DELETE TO authenticated
  USING (uploaded_by = auth.uid());

-- Admins ven todos los documentos
CREATE POLICY "documents_admin_all" ON public.documents
  FOR ALL TO authenticated
  USING (public.is_admin());

-- Trigger updated_at
DROP TRIGGER IF EXISTS documents_updated_at ON public.documents;
CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
REVOKE ALL ON public.documents FROM anon;


-- =============================================================================
-- 2. TABLA: payments (Registro de Pagos)
-- Referenciada por:
--   - app/api/payments/create-intent/route.ts
--   - app/api/payments/confirm/route.ts
--   - app/api/payments/list/route.ts
--   - app/api/payments/refund/route.ts
--   - app/api/payments/receipt/route.ts
--   - app/api/admin/payments/route.ts
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relaciones
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Datos del pago
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'clp',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'refunded', 'cancelled')),
  payment_method TEXT
    CHECK (payment_method IS NULL OR payment_method IN ('card', 'mercadopago', 'stripe', 'transfer', 'cash', 'other')),

  -- IDs de pasarela de pago
  stripe_payment_intent_id TEXT,
  stripe_session_id TEXT,
  mercadopago_payment_id TEXT,
  mercadopago_preference_id TEXT,

  -- Timestamps de estados
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_reason TEXT,

  -- Metadatos
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices para payments
CREATE INDEX IF NOT EXISTS idx_payments_appointment_id ON public.payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_patient_id ON public.payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_professional_id ON public.payments(professional_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_patient_created ON public.payments(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_intent ON public.payments(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_mercadopago ON public.payments(mercadopago_payment_id)
  WHERE mercadopago_payment_id IS NOT NULL;

COMMENT ON TABLE public.payments IS 'Registro de pagos de consultas medicas. Soporta Stripe y MercadoPago.';

-- RLS para payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Pacientes ven sus propios pagos
CREATE POLICY "payments_select_patient" ON public.payments
  FOR SELECT TO authenticated
  USING (patient_id = auth.uid());

-- Profesionales ven pagos de sus consultas
CREATE POLICY "payments_select_professional" ON public.payments
  FOR SELECT TO authenticated
  USING (professional_id = auth.uid());

-- Solo pacientes crean pagos (para sus propias citas)
CREATE POLICY "payments_insert_patient" ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (patient_id = auth.uid());

-- Actualizaciones: solo servicio o admin (via service_role)
-- Los pacientes no pueden cambiar el status directamente
CREATE POLICY "payments_update_admin" ON public.payments
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins ven todos los pagos
CREATE POLICY "payments_admin_select" ON public.payments
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Trigger updated_at
DROP TRIGGER IF EXISTS payments_updated_at ON public.payments;
CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Grants
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
REVOKE ALL ON public.payments FROM anon;


-- =============================================================================
-- 3. TABLA: finances (Finanzas y Comisiones de Plataforma)
-- Referenciada por:
--   - app/api/webhooks/mercadopago/route.ts
--   - app/api/payments/receipt/[id]/route.ts
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.finances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relaciones
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,

  -- IDs de pasarela
  stripe_payment_intent_id TEXT,
  mercadopago_payment_id TEXT,

  -- Montos
  total_amount NUMERIC(12, 2) NOT NULL,
  nurea_commission NUMERIC(12, 2) NOT NULL DEFAULT 0,
  professional_payout NUMERIC(12, 2) NOT NULL DEFAULT 0,

  -- Estado
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),

  -- Folio para recibos (si aplica)
  receipt_folio TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices para finances
CREATE INDEX IF NOT EXISTS idx_finances_appointment_id ON public.finances(appointment_id);
CREATE INDEX IF NOT EXISTS idx_finances_status ON public.finances(status);
CREATE INDEX IF NOT EXISTS idx_finances_created ON public.finances(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_finances_stripe ON public.finances(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

COMMENT ON TABLE public.finances IS 'Registro de comisiones y payouts de la plataforma Nurea.';

-- RLS para finances
ALTER TABLE public.finances ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver finanzas
CREATE POLICY "finances_admin_select" ON public.finances
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "finances_admin_insert" ON public.finances
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "finances_admin_update" ON public.finances
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Profesionales ven sus propios registros financieros
-- (necesitan JOIN via appointment -> professional_id)
CREATE POLICY "finances_professional_select" ON public.finances
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.id = finances.appointment_id
        AND a.professional_id = auth.uid()
    )
  );

-- Pacientes ven recibos de sus pagos
CREATE POLICY "finances_patient_select" ON public.finances
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.id = finances.appointment_id
        AND a.patient_id = auth.uid()
    )
  );

-- Trigger updated_at
DROP TRIGGER IF EXISTS finances_updated_at ON public.finances;
CREATE TRIGGER finances_updated_at
  BEFORE UPDATE ON public.finances
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Grants
GRANT SELECT, INSERT, UPDATE ON public.finances TO authenticated;
REVOKE ALL ON public.finances FROM anon;


-- =============================================================================
-- 4. TABLA: message_notifications (Cola de Notificaciones por Email)
-- Referenciada por:
--   - app/api/cron/send-message-notifications/route.ts
--   - supabase/migrations/add_message_notification_trigger.sql
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.message_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relaciones
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Estado de envio
  sent_at TIMESTAMPTZ,         -- NULL = pendiente, NOT NULL = enviado
  error_message TEXT,           -- Mensaje de error si fallo el envio

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices para message_notifications
CREATE INDEX IF NOT EXISTS idx_message_notifications_receiver ON public.message_notifications(receiver_id);
CREATE INDEX IF NOT EXISTS idx_message_notifications_pending ON public.message_notifications(sent_at)
  WHERE sent_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_message_notifications_created ON public.message_notifications(created_at DESC);

COMMENT ON TABLE public.message_notifications IS 'Cola de notificaciones por email para mensajes nuevos. El cron las procesa y marca como enviadas.';

-- RLS para message_notifications
ALTER TABLE public.message_notifications ENABLE ROW LEVEL SECURITY;

-- Solo el receptor puede ver sus notificaciones
CREATE POLICY "message_notifications_select_own" ON public.message_notifications
  FOR SELECT TO authenticated
  USING (receiver_id = auth.uid());

-- Inserciones: via trigger o service_role
CREATE POLICY "message_notifications_insert_system" ON public.message_notifications
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Admins ven todo
CREATE POLICY "message_notifications_admin" ON public.message_notifications
  FOR ALL TO authenticated
  USING (public.is_admin());

-- Grants
GRANT SELECT, INSERT, UPDATE ON public.message_notifications TO authenticated;
REVOKE ALL ON public.message_notifications FROM anon;


-- =============================================================================
-- 5. TABLA: system_settings (Configuracion del Sistema / Feature Flags)
-- Referenciada por:
--   - app/api/payments/mercadopago/preference/route.ts
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Clave unica de la configuracion
  key TEXT NOT NULL UNIQUE,

  -- Valor (polimórfico via jsonb)
  value JSONB NOT NULL DEFAULT 'true'::jsonb,

  -- Descripcion para administradores
  description TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.system_settings IS 'Configuracion global del sistema y feature flags (ej: payments_enabled).';

-- Indice unico ya creado por UNIQUE en key
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings(key);

-- RLS para system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Todos los autenticados pueden leer settings (necesario para feature flags)
CREATE POLICY "system_settings_select_all" ON public.system_settings
  FOR SELECT TO authenticated
  USING (true);

-- Solo admins pueden modificar settings
CREATE POLICY "system_settings_modify_admin" ON public.system_settings
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Trigger updated_at
DROP TRIGGER IF EXISTS system_settings_updated_at ON public.system_settings;
CREATE TRIGGER system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Grants
GRANT SELECT ON public.system_settings TO authenticated;
GRANT SELECT ON public.system_settings TO anon; -- Feature flags deben ser legibles sin login

-- Seed: configuracion inicial
INSERT INTO public.system_settings (key, value, description)
VALUES
  ('payments_enabled', 'true'::jsonb, 'Kill switch global para pagos. false = desactiva todos los pagos.'),
  ('maintenance_mode', 'false'::jsonb, 'Modo mantenimiento. true = muestra pagina de mantenimiento.')
ON CONFLICT (key) DO NOTHING;


-- =============================================================================
-- 6. COLUMNAS FALTANTES EN profiles
-- Referenciadas por:
--   - app/api/admin/users/route.ts (blocked, blocked_at)
--   - app/api/cron/send-message-notifications/route.ts (notification_preferences)
-- =============================================================================

-- 6a. blocked / blocked_at: suspension de cuentas
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS blocked BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_blocked ON public.profiles(blocked)
  WHERE blocked = true;

COMMENT ON COLUMN public.profiles.blocked IS 'Indica si la cuenta esta bloqueada/suspendida por un admin.';
COMMENT ON COLUMN public.profiles.blocked_at IS 'Fecha en que se bloqueo la cuenta.';

-- 6b. notification_preferences: preferencias de notificacion por email
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email_messages": true, "email_appointments": true, "email_marketing": false}'::jsonb;

COMMENT ON COLUMN public.profiles.notification_preferences IS 'Preferencias de notificaciones del usuario (email, push, etc).';


-- =============================================================================
-- 7. COLUMNAS FALTANTES EN professionals
-- Referenciadas por:
--   - app/api/appointments/check-availability/route.ts (bank_account, bank_name)
-- =============================================================================

ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS bank_account TEXT;

ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS bank_name TEXT;

COMMENT ON COLUMN public.professionals.bank_account IS 'Numero de cuenta bancaria para payouts.';
COMMENT ON COLUMN public.professionals.bank_name IS 'Nombre del banco para payouts.';


-- =============================================================================
-- 8. TRIGGER: Crear message_notification al insertar un mensaje nuevo
-- Reemplaza/complementa add_message_notification_trigger.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION public.create_message_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo crear notificacion para mensajes normales (no sistema)
  INSERT INTO public.message_notifications (message_id, receiver_id, sender_id)
  VALUES (NEW.id, NEW.receiver_id, NEW.sender_id);

  RETURN NEW;
EXCEPTION
  WHEN undefined_table THEN
    -- Si la tabla no existe aun, no bloquear la insercion del mensaje
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_message_notification ON public.messages;
CREATE TRIGGER trigger_message_notification
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.create_message_notification();

COMMENT ON FUNCTION public.create_message_notification IS
  'Crea una notificacion pendiente por cada mensaje nuevo para procesamiento por cron.';


-- =============================================================================
-- 9. VERIFICACION FINAL
-- =============================================================================

DO $$
DECLARE
  v_tables TEXT[] := ARRAY[
    'documents', 'payments', 'finances',
    'message_notifications', 'system_settings'
  ];
  v_table TEXT;
  v_missing TEXT[] := '{}';
BEGIN
  FOREACH v_table IN ARRAY v_tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = v_table
    ) THEN
      v_missing := array_append(v_missing, v_table);
    END IF;
  END LOOP;

  IF array_length(v_missing, 1) > 0 THEN
    RAISE WARNING 'Tablas que NO se crearon: %', array_to_string(v_missing, ', ');
  ELSE
    RAISE NOTICE 'OK: Todas las tablas nuevas fueron creadas correctamente.';
  END IF;

  -- Verificar columnas nuevas en profiles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'blocked'
  ) THEN
    RAISE WARNING 'Columna profiles.blocked NO existe.';
  ELSE
    RAISE NOTICE 'OK: profiles.blocked existe.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'notification_preferences'
  ) THEN
    RAISE WARNING 'Columna profiles.notification_preferences NO existe.';
  ELSE
    RAISE NOTICE 'OK: profiles.notification_preferences existe.';
  END IF;

  -- Verificar columnas nuevas en professionals
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'professionals' AND column_name = 'bank_account'
  ) THEN
    RAISE WARNING 'Columna professionals.bank_account NO existe.';
  ELSE
    RAISE NOTICE 'OK: professionals.bank_account existe.';
  END IF;
END $$;
