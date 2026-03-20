-- =============================================================================
-- NUREA - Habilitar Realtime para tablas de chat
-- Fecha: 2026-03-20
-- Descripción: Añade las tablas de chat a la publicación supabase_realtime
--              y establece REPLICA IDENTITY FULL para que Realtime pueda
--              entregar eventos de cambio correctamente.
--
-- Sin esto, Supabase Realtime devuelve CHANNEL_ERROR al suscribirse con
-- postgres_changes a estas tablas.
-- =============================================================================

-- REPLICA IDENTITY FULL: necesario para que Realtime incluya los valores
-- de las columnas OLD y NEW en UPDATE/DELETE events.
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.conversation_participants REPLICA IDENTITY FULL;

-- Añadir a la publicación de Supabase Realtime.
-- DO NOTHING si ya estuvieran incluidas (idempotente).
DO $$
BEGIN
  -- chat_messages
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
    RAISE NOTICE '✅ chat_messages añadida a supabase_realtime';
  ELSE
    RAISE NOTICE '   chat_messages ya estaba en supabase_realtime';
  END IF;

  -- conversations
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
    RAISE NOTICE '✅ conversations añadida a supabase_realtime';
  ELSE
    RAISE NOTICE '   conversations ya estaba en supabase_realtime';
  END IF;

  -- conversation_participants
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'conversation_participants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;
    RAISE NOTICE '✅ conversation_participants añadida a supabase_realtime';
  ELSE
    RAISE NOTICE '   conversation_participants ya estaba en supabase_realtime';
  END IF;
END $$;
