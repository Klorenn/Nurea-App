-- =============================================================================
-- NUREA CHAT SYSTEM - Sistema de chat completo
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- =============================================================================

-- Tabla de conversaciones
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    request_status TEXT DEFAULT 'pending' CHECK (request_status IN ('pending', 'accepted', 'rejected')),
    initiated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de participantes de conversaciones
CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT now(),
    last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(conversation_id, user_id)
);

-- Tabla de mensajes de chat
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_conversations_professional ON conversations(professional_id);
CREATE INDEX IF NOT EXISTS idx_conversations_initiated_by ON conversations(initiated_by);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conv ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON chat_messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_status ON chat_messages(status);

-- Habilitar RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies para conversaciones
DROP POLICY IF EXISTS "conversations_select_participants" ON conversations;
CREATE POLICY "conversations_select_participants" ON conversations
    FOR SELECT USING (
        id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "conversations_insert_authenticated" ON conversations;
CREATE POLICY "conversations_insert_authenticated" ON conversations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "conversations_update_participants" ON conversations;
CREATE POLICY "conversations_update_participants" ON conversations
    FOR UPDATE USING (
        id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid())
    );

-- Policies para participantes
DROP POLICY IF EXISTS "conversation_participants_select" ON conversation_participants;
CREATE POLICY "conversation_participants_select" ON conversation_participants
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM conversation_participants cp2
            WHERE cp2.conversation_id = conversation_participants.conversation_id
              AND cp2.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "conversation_participants_insert" ON conversation_participants;
CREATE POLICY "conversation_participants_insert" ON conversation_participants
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "conversation_participants_update_own" ON conversation_participants;
CREATE POLICY "conversation_participants_update_own" ON conversation_participants
    FOR UPDATE USING (user_id = auth.uid());

-- Policies para mensajes
DROP POLICY IF EXISTS "chat_messages_select" ON chat_messages;
CREATE POLICY "chat_messages_select" ON chat_messages
    FOR SELECT USING (
        conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "chat_messages_insert" ON chat_messages;
CREATE POLICY "chat_messages_insert" ON chat_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "chat_messages_update_status" ON chat_messages;
CREATE POLICY "chat_messages_update_status" ON chat_messages
    FOR UPDATE USING (
        sender_id = auth.uid() OR 
        conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid())
    );

-- Grants
GRANT SELECT, INSERT, UPDATE ON conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON conversation_participants TO authenticated;
GRANT SELECT, INSERT, UPDATE ON chat_messages TO authenticated;

-- Habilitar realtime para las tablas
ALTER TABLE conversations REPLICA IDENTITY FULL;
ALTER TABLE chat_messages REPLICA IDENTITY FULL;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Re-ejecutar sin error si el trigger ya existe (u otra migración lo creó)
DROP TRIGGER IF EXISTS conversations_updated ON conversations;
CREATE TRIGGER conversations_updated
    BEFORE UPDATE ON conversations FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at();

DROP TRIGGER IF EXISTS chat_messages_updated ON chat_messages;
CREATE TRIGGER chat_messages_updated
    BEFORE UPDATE ON chat_messages FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at();

-- Agregar a publicación de realtime (si existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
        ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Realtime publication not found, skipping...';
END
$$;

SELECT 'Chat system creado exitosamente!' as resultado;