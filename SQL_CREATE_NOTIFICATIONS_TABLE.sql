-- Crear tabla de notificaciones para NUREA
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN (
    'appointment_confirmed',
    'appointment_reminder',
    'appointment_cancelled',
    'appointment_rescheduled',
    'appointment_completed',
    'message_new',
    'payment_confirmed',
    'payment_failed',
    'document_uploaded',
    'system'
  )) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT, -- URL para redirigir cuando se hace clic
  metadata JSONB, -- Datos adicionales (appointment_id, payment_id, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON public.notifications(read);
CREATE INDEX IF NOT EXISTS notifications_type_idx ON public.notifications(type);
CREATE INDEX IF NOT EXISTS notifications_created_idx ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_user_read_idx ON public.notifications(user_id, read, created_at DESC);

-- Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propias notificaciones
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden marcar sus notificaciones como leídas
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Función para crear notificaciones automáticamente
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    action_url,
    metadata
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_action_url,
    p_metadata
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para notificar cuando se confirma una cita
CREATE OR REPLACE FUNCTION notify_appointment_confirmed()
RETURNS TRIGGER AS $$
DECLARE
  v_professional_name TEXT;
  v_day_name TEXT;
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    -- Obtener nombre del profesional
    SELECT COALESCE(first_name || ' ' || last_name, 'el profesional') INTO v_professional_name
    FROM public.profiles
    WHERE id = NEW.professional_id;
    
    -- Obtener nombre del día
    SELECT TO_CHAR(NEW.appointment_date, 'Day') INTO v_day_name;
    v_day_name := TRIM(v_day_name);
    
    PERFORM create_notification(
      NEW.patient_id,
      'appointment_confirmed',
      '¡Tu cita está confirmada!',
      'Tu cita con ' || v_professional_name || ' está lista para el ' || 
      v_day_name || ' ' || TO_CHAR(NEW.appointment_date, 'DD/MM/YYYY') || 
      ' a las ' || TO_CHAR(NEW.appointment_time, 'HH24:MI') || 
      '. Te recordaremos mañana. Si necesitas cambiar algo, puedes hacerlo desde tu panel.',
      '/dashboard/appointments',
      jsonb_build_object('appointment_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointment_confirmed_notification
  AFTER UPDATE ON public.appointments
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed' AND OLD.status != 'confirmed')
  EXECUTE FUNCTION notify_appointment_confirmed();

-- Trigger para notificar cuando se cancela una cita
CREATE OR REPLACE FUNCTION notify_appointment_cancelled()
RETURNS TRIGGER AS $$
DECLARE
  v_professional_name TEXT;
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    -- Obtener nombre del profesional
    SELECT COALESCE(first_name || ' ' || last_name, 'el profesional') INTO v_professional_name
    FROM public.profiles
    WHERE id = NEW.professional_id;
    
    PERFORM create_notification(
      NEW.patient_id,
      'appointment_cancelled',
      'Tu cita fue cancelada',
      'Tu cita del ' || TO_CHAR(NEW.appointment_date, 'DD/MM/YYYY') || 
      ' con ' || v_professional_name || ' fue cancelada. Si la cancelaste tú, todo está bien. ' ||
      'Si fue el profesional, te contactaremos pronto para reagendar. Si tienes dudas, puedes escribirle desde tu panel de mensajes.',
      '/dashboard/appointments',
      jsonb_build_object('appointment_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointment_cancelled_notification
  AFTER UPDATE ON public.appointments
  FOR EACH ROW
  WHEN (NEW.status = 'cancelled' AND OLD.status != 'cancelled')
  EXECUTE FUNCTION notify_appointment_cancelled();

-- Trigger para notificar cuando hay un nuevo mensaje
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  v_sender_name TEXT;
  v_message_preview TEXT;
BEGIN
  -- Obtener nombre del remitente
  SELECT COALESCE(first_name || ' ' || last_name, email) INTO v_sender_name
  FROM public.profiles
  WHERE id = NEW.sender_id;
  
  -- Crear preview del mensaje (primeros 50 caracteres)
  v_message_preview := LEFT(NEW.content, 50);
  IF LENGTH(NEW.content) > 50 THEN
    v_message_preview := v_message_preview || '...';
  END IF;
  
  PERFORM create_notification(
    NEW.receiver_id,
    'message_new',
    COALESCE(v_sender_name, 'Alguien') || ' te escribió',
    COALESCE(v_sender_name, 'Alguien') || ' te envió un mensaje: "' || v_message_preview || 
    '". Puedes responder desde tu panel de mensajes. Recuerda: este chat no es para emergencias médicas.',
    '/dashboard/chat',
    jsonb_build_object('message_id', NEW.id, 'sender_id', NEW.sender_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER new_message_notification
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- Trigger para notificar cuando se confirma un pago
CREATE OR REPLACE FUNCTION notify_payment_confirmed()
RETURNS TRIGGER AS $$
DECLARE
  v_appointment_date DATE;
BEGIN
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    -- Obtener fecha de la cita si existe
    SELECT appointment_date INTO v_appointment_date
    FROM public.appointments
    WHERE id = NEW.appointment_id;
    
    PERFORM create_notification(
      NEW.patient_id,
      'payment_confirmed',
      'Tu pago se procesó correctamente',
      'Tu pago de $' || TO_CHAR(NEW.amount, 'FM999,999,999') || 
      CASE 
        WHEN v_appointment_date IS NOT NULL THEN ' para tu cita del ' || TO_CHAR(v_appointment_date, 'DD/MM/YYYY')
        ELSE ''
      END || 
      ' se procesó correctamente. Puedes descargar tu recibo desde tu panel de pagos en cualquier momento.',
      '/dashboard/payments',
      jsonb_build_object('payment_id', NEW.id, 'appointment_id', NEW.appointment_id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_confirmed_notification
  AFTER UPDATE ON public.payments
  FOR EACH ROW
  WHEN (NEW.status = 'paid' AND OLD.status != 'paid')
  EXECUTE FUNCTION notify_payment_confirmed();

-- Trigger para notificar cuando falla un pago
CREATE OR REPLACE FUNCTION notify_payment_failed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'failed' AND OLD.status != 'failed' THEN
    PERFORM create_notification(
      NEW.patient_id,
      'payment_failed',
      'Tu pago no se pudo procesar',
      'Hubo un problema al procesar tu pago de $' || TO_CHAR(NEW.amount, 'FM999,999,999') || 
      '. No te preocupes, tu cita sigue reservada. Por favor, intenta nuevamente desde tu panel de pagos o contáctanos si el problema persiste.',
      '/dashboard/payments',
      jsonb_build_object('payment_id', NEW.id, 'appointment_id', NEW.appointment_id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_failed_notification
  AFTER UPDATE ON public.payments
  FOR EACH ROW
  WHEN (NEW.status = 'failed' AND OLD.status != 'failed')
  EXECUTE FUNCTION notify_payment_failed();

-- Trigger para notificar cuando se sube un documento
CREATE OR REPLACE FUNCTION notify_document_uploaded()
RETURNS TRIGGER AS $$
DECLARE
  v_uploader_name TEXT;
BEGIN
  -- Solo notificar si el documento es para el paciente (no si el paciente lo subió)
  IF NEW.uploaded_by != NEW.patient_id THEN
    -- Obtener nombre de quien subió el documento
    SELECT COALESCE(first_name || ' ' || last_name, 'el profesional') INTO v_uploader_name
    FROM public.profiles
    WHERE id = NEW.uploaded_by;
    
    PERFORM create_notification(
      NEW.patient_id,
      'document_uploaded',
      'Nuevo documento disponible',
      v_uploader_name || ' subió un documento para ti: "' || NEW.name || 
      '". Puedes verlo y descargarlo desde tu panel de documentos.',
      '/dashboard/documents',
      jsonb_build_object('document_id', NEW.id, 'appointment_id', NEW.appointment_id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER document_uploaded_notification
  AFTER INSERT ON public.documents
  FOR EACH ROW
  WHEN (NEW.uploaded_by != NEW.patient_id)
  EXECUTE FUNCTION notify_document_uploaded();

