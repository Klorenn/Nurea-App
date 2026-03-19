-- =============================================================================
-- NUREA - Sistema de Chat (Conversaciones entre Paciente y Profesional)
-- Migración: 20260318_create_chat_system.sql
-- Ejecutar en: Supabase > SQL Editor
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. AJUSTES A PROFILES (añadir campos de presencia y chat)
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'offline'
    CHECK (status IN ('online', 'offline', 'away')),
  ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS response_time TEXT DEFAULT '2-4 horas';

-- =============================================================================
-- 2. TABLA: conversations
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Control de acceso: el paciente solicita (pending), el profesional acepta o rechaza
  request_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (request_status IN ('pending', 'accepted', 'rejected')),

  initiated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  professional_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  request_message TEXT,
  responded_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.conversations IS 'Conversaciones de chat entre pacientes y profesionales.';

CREATE INDEX IF NOT EXISTS idx_conversations_professional ON public.conversations(professional_id);
CREATE INDEX IF NOT EXISTS idx_conversations_initiated_by ON public.conversations(initiated_by);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON public.conversations(updated_at DESC);

-- =============================================================================
-- 3. TABLA: conversation_participants
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(conversation_id, user_id)
);

COMMENT ON TABLE public.conversation_participants IS 'Participantes de cada conversación.';

CREATE INDEX IF NOT EXISTS idx_conv_participants_conv ON public.conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conv_participants_user ON public.conversation_participants(user_id);

-- =============================================================================
-- 4. TABLA: chat_messages (separada de messages para no colisionar)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  content TEXT NOT NULL DEFAULT '',
  message_type TEXT NOT NULL DEFAULT 'text'
    CHECK (message_type IN ('text', 'image', 'file', 'audio', 'system')),

  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  file_type TEXT,

  status TEXT NOT NULL DEFAULT 'sent'
    CHECK (status IN ('sent', 'delivered', 'read')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.chat_messages IS 'Mensajes de chat entre pacientes y profesionales.';

CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON public.chat_messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_status ON public.chat_messages(status);

-- =============================================================================
-- 5. TRIGGERS updated_at
-- =============================================================================

DROP TRIGGER IF EXISTS conversations_updated_at ON public.conversations;
CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS chat_messages_updated_at ON public.chat_messages;
CREATE TRIGGER chat_messages_updated_at
  BEFORE UPDATE ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger para actualizar conversations.updated_at cuando llega un nuevo mensaje
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
    SET updated_at = now()
    WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS chat_messages_update_conv ON public.chat_messages;
CREATE TRIGGER chat_messages_update_conv
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_conversation_on_message();

-- =============================================================================
-- 6. RLS
-- =============================================================================

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- conversations: solo participantes pueden ver
DROP POLICY IF EXISTS "conversations_select_participants" ON public.conversations;
CREATE POLICY "conversations_select_participants" ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = conversations.id
        AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "conversations_insert_authenticated" ON public.conversations;
CREATE POLICY "conversations_insert_authenticated" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "conversations_update_participants" ON public.conversations;
CREATE POLICY "conversations_update_participants" ON public.conversations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = conversations.id
        AND user_id = auth.uid()
    )
  );

-- conversation_participants
DROP POLICY IF EXISTS "conv_participants_select" ON public.conversation_participants;
CREATE POLICY "conv_participants_select" ON public.conversation_participants
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp2
      WHERE cp2.conversation_id = conversation_participants.conversation_id
        AND cp2.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "conv_participants_insert" ON public.conversation_participants;
CREATE POLICY "conv_participants_insert" ON public.conversation_participants
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "conv_participants_update_own" ON public.conversation_participants;
CREATE POLICY "conv_participants_update_own" ON public.conversation_participants
  FOR UPDATE USING (user_id = auth.uid());

-- chat_messages: solo participantes de la conversación
DROP POLICY IF EXISTS "chat_messages_select" ON public.chat_messages;
CREATE POLICY "chat_messages_select" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = chat_messages.conversation_id
        AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "chat_messages_insert" ON public.chat_messages;
CREATE POLICY "chat_messages_insert" ON public.chat_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = chat_messages.conversation_id
        AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "chat_messages_update_status" ON public.chat_messages;
CREATE POLICY "chat_messages_update_status" ON public.chat_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = chat_messages.conversation_id
        AND user_id = auth.uid()
    )
  );

-- =============================================================================
-- 7. GRANTS
-- =============================================================================

GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.conversation_participants TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.chat_messages TO authenticated;

-- =============================================================================
-- 8. REALTIME: habilitar para las 3 tablas
-- =============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- =============================================================================
-- 9. STORAGE BUCKET para archivos del chat
-- =============================================================================

-- Nota: Si recibes error "already exists" en el bucket, es correcto, omítelo.
INSERT INTO storage.buckets (id, name, public)
  VALUES ('message-files', 'message-files', false)
  ON CONFLICT (id) DO NOTHING;

-- Policy: solo usuarios autenticados pueden subir archivos
DROP POLICY IF EXISTS "message_files_upload" ON storage.objects;
CREATE POLICY "message_files_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'message-files' AND auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "message_files_select" ON storage.objects;
CREATE POLICY "message_files_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'message-files' AND auth.uid() IS NOT NULL
  );

-- =============================================================================
-- 10. FUNCIÓN HELPER: obtener o crear conversación entre dos usuarios
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_or_create_conversation(
  p_user_a UUID,
  p_user_b UUID,
  p_professional_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_conv_id UUID;
  v_role_a TEXT;
  v_request_status TEXT;
BEGIN
  -- Buscar conversación existente entre los dos usuarios
  SELECT cp1.conversation_id INTO v_conv_id
  FROM public.conversation_participants cp1
  JOIN public.conversation_participants cp2
    ON cp1.conversation_id = cp2.conversation_id
  WHERE cp1.user_id = p_user_a
    AND cp2.user_id = p_user_b
  LIMIT 1;

  -- Si no existe, crear una nueva
  IF v_conv_id IS NULL THEN
    
    -- Determinar el rol del usuario que inicia
    SELECT role INTO v_role_a FROM public.profiles WHERE id = p_user_a;
    
    -- Si es paciente, queda pendiente. Si es profesional u otro, queda aceptada.
    IF v_role_a = 'patient' THEN
      v_request_status := 'pending';
    ELSE
      v_request_status := 'accepted';
    END IF;

    -- Asumir p_professional_id o buscar si no se provee y el que recibe es profesional
    INSERT INTO public.conversations (initiated_by, professional_id, request_status)
    VALUES (p_user_a, COALESCE(p_professional_id, p_user_b), v_request_status)
    RETURNING id INTO v_conv_id;

    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES (v_conv_id, p_user_a), (v_conv_id, p_user_b);
  END IF;

  RETURN v_conv_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_or_create_conversation TO authenticated;

-- Función adiccional para aceptar/rechazar chat
CREATE OR REPLACE FUNCTION public.update_conversation_request_status(
  p_conversation_id UUID,
  p_status TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_status NOT IN ('accepted', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  -- Solo el profesional de la conversación puede aceptar/rechazar.
  UPDATE public.conversations
  SET request_status = p_status, responded_at = now()
  WHERE id = p_conversation_id
    AND professional_id = auth.uid()
    AND request_status = 'pending';
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_conversation_request_status TO authenticated;

-- =============================================================================
-- VERIFICACIÓN
-- =============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversations') THEN
    RAISE NOTICE '✅ Tabla conversations creada correctamente';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversation_participants') THEN
    RAISE NOTICE '✅ Tabla conversation_participants creada correctamente';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_messages') THEN
    RAISE NOTICE '✅ Tabla chat_messages creada correctamente';
  END IF;
  RAISE NOTICE '✅ Sistema de chat Nurea instalado correctamente';
END $$;
