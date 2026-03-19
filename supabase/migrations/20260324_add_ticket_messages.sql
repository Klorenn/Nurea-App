-- Ticket messages conversation system for support tickets

-- 1. ticket_messages table
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,

  sender_id UUID NOT NULL,
  sender_role TEXT CHECK (sender_role IN ('user', 'admin')),

  message TEXT NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages of their own tickets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'ticket_messages' 
      AND policyname = 'Users can view messages of their tickets'
  ) THEN
    CREATE POLICY "Users can view messages of their tickets"
    ON public.ticket_messages
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 
        FROM public.support_tickets t
        WHERE t.id = ticket_id
          AND t.user_id = auth.uid()
      )
    );
  END IF;
END;
$$;

-- Users can send messages for their tickets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'ticket_messages' 
      AND policyname = 'Users can send messages'
  ) THEN
    CREATE POLICY "Users can send messages"
    ON public.ticket_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
      sender_id = auth.uid()
    );
  END IF;
END;
$$;

-- Admins can view all messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'ticket_messages' 
      AND policyname = 'Admins can view all messages'
  ) THEN
    CREATE POLICY "Admins can view all messages"
    ON public.ticket_messages
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 
        FROM public.profiles
        WHERE id = auth.uid()
          AND role = 'admin'
      )
    );
  END IF;
END;
$$;

-- Admins can send messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'ticket_messages' 
      AND policyname = 'Admins can send messages'
  ) THEN
    CREATE POLICY "Admins can send messages"
    ON public.ticket_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 
        FROM public.profiles
        WHERE id = auth.uid()
          AND role = 'admin'
      )
    );
  END IF;
END;
$$;

-- Optional: realtime on ticket_messages
ALTER PUBLICATION supabase_realtime ADD TABLE ticket_messages;

