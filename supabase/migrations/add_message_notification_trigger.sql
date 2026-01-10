-- Trigger para notificar por email cuando se recibe un mensaje nuevo
-- Este trigger se ejecuta después de insertar un mensaje en la tabla messages

-- Función que envía notificación (se llamará desde Edge Function o webhook)
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insertar en tabla de notificaciones pendientes
  -- Una Edge Function o webhook procesará estas notificaciones
  INSERT INTO public.message_notifications (
    message_id,
    receiver_id,
    sender_id,
    created_at
  ) VALUES (
    NEW.id,
    NEW.receiver_id,
    NEW.sender_id,
    NOW()
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- Crear tabla para notificaciones pendientes si no existe
CREATE TABLE IF NOT EXISTS public.message_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, receiver_id)
);

-- Crear índice para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_message_notifications_receiver 
ON public.message_notifications(receiver_id, sent_at) 
WHERE sent_at IS NULL;

-- Crear trigger
DROP TRIGGER IF EXISTS trigger_notify_new_message ON public.messages;
CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_message();

-- Habilitar RLS
ALTER TABLE public.message_notifications ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios solo pueden ver sus propias notificaciones
CREATE POLICY "Users can view own notifications"
  ON public.message_notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = receiver_id);

-- Comentarios
COMMENT ON TABLE public.message_notifications IS 'Notificaciones pendientes de mensajes nuevos';
COMMENT ON FUNCTION public.notify_new_message() IS 'Trigger function que crea notificación cuando se recibe mensaje nuevo';
