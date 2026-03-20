-- =============================================================================
-- NUREA - Consolidación de Sistema de Chat
-- Fecha: 2026-03-19
-- Descripción: Consolida políticas RLS para ambos sistemas de chat
--
-- SISTEMAS DE MENSAJES:
-- 1. chat_messages (conversations + conversation_participants)
--    - Uso: Chat conversacional entre paciente y profesional
--    - Características: Multi-participante, statuses (sent/delivered/read), archivos
--
-- 2. messages (tabla simple)
--    - Uso: Mensajes directos simples, notificaciones del sistema
--    - Características: Envío directo, sin conversación explícita
--
-- NOTA: Ambos sistemas coexisten para diferentes propósitos.
--       chat_messages es el sistema PRINCIPAL de chat.
-- =============================================================================

DO $$
BEGIN

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Consolidando sistema de chat...';
  RAISE NOTICE '========================================';

  -- ==========================================================================
  -- 1. LIMPIEZA DE POLICIESchat_messages
  -- ==========================================================================

  RAISE NOTICE '1. Limpiando policies de chat_messages...';

  -- Tabla conversations
  DROP POLICY IF EXISTS "conversations_select_participants" ON public.conversations;
  DROP POLICY IF EXISTS "conversations_insert_authenticated" ON public.conversations;
  DROP POLICY IF EXISTS "conversations_update_participants" ON public.conversations;

  -- Recrear policies consolidadas para conversations
  CREATE POLICY "conversations_select" ON public.conversations
    FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.conversation_participants
        WHERE conversation_id = conversations.id
          AND user_id = auth.uid()
      )
    );

  CREATE POLICY "conversations_insert" ON public.conversations
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

  CREATE POLICY "conversations_update" ON public.conversations
    FOR UPDATE TO authenticated
    USING (
      professional_id = auth.uid()
      OR initiated_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.conversation_participants
        WHERE conversation_id = conversations.id
          AND user_id = auth.uid()
      )
    );

  RAISE NOTICE '   ✅ conversations: policies consolidadas';

  -- Tabla conversation_participants
  DROP POLICY IF EXISTS "conv_participants_select" ON public.conversation_participants;
  DROP POLICY IF EXISTS "conv_participants_insert" ON public.conversation_participants;
  DROP POLICY IF EXISTS "conv_participants_update_own" ON public.conversation_participants;

  CREATE POLICY "conv_participants_select" ON public.conversation_participants
    FOR SELECT TO authenticated
    USING (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.conversation_participants cp2
        WHERE cp2.conversation_id = conversation_participants.conversation_id
          AND cp2.user_id = auth.uid()
      )
    );

  CREATE POLICY "conv_participants_insert" ON public.conversation_participants
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

  CREATE POLICY "conv_participants_update" ON public.conversation_participants
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

  RAISE NOTICE '   ✅ conversation_participants: policies consolidadas';

  -- Tabla chat_messages
  DROP POLICY IF EXISTS "chat_messages_select" ON public.chat_messages;
  DROP POLICY IF EXISTS "chat_messages_insert" ON public.chat_messages;
  DROP POLICY IF EXISTS "chat_messages_update_status" ON public.chat_messages;

  CREATE POLICY "chat_messages_select" ON public.chat_messages
    FOR SELECT TO authenticated
    USING (
      sender_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.conversation_participants
        WHERE conversation_id = chat_messages.conversation_id
          AND user_id = auth.uid()
      )
    );

  -- INSERT: El sender DEBE ser participante (CRÍTICO para evitar errores RLS)
  CREATE POLICY "chat_messages_insert" ON public.chat_messages
    FOR INSERT TO authenticated
    WITH CHECK (
      sender_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.conversation_participants
        WHERE conversation_id = chat_messages.conversation_id
          AND user_id = auth.uid()
      )
    );

  CREATE POLICY "chat_messages_update" ON public.chat_messages
    FOR UPDATE TO authenticated
    USING (
      sender_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.conversation_participants
        WHERE conversation_id = chat_messages.conversation_id
          AND user_id = auth.uid()
      )
    );

  RAISE NOTICE '   ✅ chat_messages: policies consolidadas';

  -- ==========================================================================
  -- 2. LIMPIEZA DE POLICIES messages (tabla simple)
  -- ==========================================================================

  RAISE NOTICE '2. Limpiando policies de messages...';

  DROP POLICY IF EXISTS "messages_select_own" ON public.messages;
  DROP POLICY IF EXISTS "messages_insert_own" ON public.messages;
  DROP POLICY IF EXISTS "messages_update_receiver" ON public.messages;

  CREATE POLICY "messages_select" ON public.messages
    FOR SELECT TO authenticated
    USING (
      sender_id = auth.uid()
      OR receiver_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

  CREATE POLICY "messages_insert" ON public.messages
    FOR INSERT TO authenticated
    WITH CHECK (sender_id = auth.uid());

  CREATE POLICY "messages_update" ON public.messages
    FOR UPDATE TO authenticated
    USING (
      receiver_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
    WITH CHECK (
      receiver_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

  RAISE NOTICE '   ✅ messages: policies consolidadas';

  -- ==========================================================================
  -- 3. FUNCIÓN HELPER: Asegurar participación antes de enviar mensaje
  -- ==========================================================================

  RAISE NOTICE '3. Creando función helper...';

  CREATE OR REPLACE FUNCTION public.ensure_chat_participant(
    p_conversation_id UUID,
    p_user_id UUID
  )
  RETURNS BOOLEAN
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  BEGIN
    -- Verificar si ya es participante
    IF EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = p_conversation_id
        AND user_id = p_user_id
    ) THEN
      RETURN TRUE;
    END IF;

    -- Si no es participante, agregarlo automáticamente
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES (p_conversation_id, p_user_id)
    ON CONFLICT (conversation_id, user_id) DO NOTHING;

    RETURN TRUE;
  END;
  $$;

  -- Otorgar permisos
  DROP POLICY IF EXISTS "ensure_participant_func" ON public.conversation_participants;
  GRANT EXECUTE ON FUNCTION public.ensure_chat_participant TO authenticated;

  RAISE NOTICE '   ✅ Función ensure_chat_participant creada';

  -- ==========================================================================
  -- 4. FUNCIÓN HELPER: Auto-unirse a conversación antes de enviar
  -- ==========================================================================

  CREATE OR REPLACE FUNCTION public.send_chat_message(
    p_conversation_id UUID,
    p_content TEXT,
    p_message_type TEXT DEFAULT 'text'
  )
  RETURNS UUID
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  DECLARE
    v_message_id UUID;
    v_user_id UUID;
  BEGIN
    v_user_id := auth.uid();

    -- Asegurar que el usuario es participante
    PERFORM public.ensure_chat_participant(p_conversation_id, v_user_id);

    -- Insertar mensaje
    INSERT INTO public.chat_messages (conversation_id, sender_id, content, message_type)
    VALUES (p_conversation_id, v_user_id, p_content, p_message_type)
    RETURNING id INTO v_message_id;

    RETURN v_message_id;
  END;
  $$;

  GRANT EXECUTE ON FUNCTION public.send_chat_message TO authenticated;

  RAISE NOTICE '   ✅ Función send_chat_message creada (RPC segura)';

  -- ==========================================================================
  -- 5. VERIFICACIÓN FINAL
  -- ==========================================================================

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Sistema de chat consolidado';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Resumen de políticas:';
  RAISE NOTICE '';
  RAISE NOTICE 'chat_messages:';
  RAISE NOTICE '  - SELECT: sender o participante de conversación';
  RAISE NOTICE '  - INSERT: sender que es participante (vía función helper)';
  RAISE NOTICE '  - UPDATE: sender o participante';
  RAISE NOTICE '';
  RAISE NOTICE 'messages (simple):';
  RAISE NOTICE '  - SELECT: sender, receiver, o admin';
  RAISE NOTICE '  - INSERT: solo sender';
  RAISE NOTICE '  - UPDATE: solo receiver o admin';
  RAISE NOTICE '';
  RAISE NOTICE 'Funciones helper disponibles:';
  RAISE NOTICE '  - ensure_chat_participant(conversation_id, user_id)';
  RAISE NOTICE '  - send_chat_message(conversation_id, content, type)';

END $$;

-- Mostrar estado final de policies
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('conversations', 'conversation_participants', 'chat_messages', 'messages')
ORDER BY tablename, policyname;
