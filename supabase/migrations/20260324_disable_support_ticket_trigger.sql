-- Disable automatic admin notification trigger for support_tickets
-- to avoid insert failures when admin_notifications schema changes.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'on_support_ticket_created'
  ) THEN
    DROP TRIGGER on_support_ticket_created ON public.support_tickets;
  END IF;
END;
$$;

DROP FUNCTION IF EXISTS public.notify_admin_on_ticket();

