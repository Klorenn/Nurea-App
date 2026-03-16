-- Add SUPPORT_TICKET to admin_notification_type
-- Note: In Postgres, adding values to enums usually requires separate transactions in plain SQL,
-- but in Supabase migrations we can use ALTER TYPE.
ALTER TYPE admin_notification_type ADD VALUE IF NOT EXISTS 'SUPPORT_TICKET';

-- Create support_tickets table
CREATE TYPE support_ticket_status AS ENUM ('open', 'in_progress', 'resolved');
CREATE TYPE support_ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status support_ticket_status NOT NULL DEFAULT 'open',
  priority support_ticket_priority NOT NULL DEFAULT 'medium',
  admin_id UUID REFERENCES profiles(id),
  admin_response TEXT,
  user_role TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can view and create their own tickets
CREATE POLICY "Users can view their own support_tickets"
  ON support_tickets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own support_tickets"
  ON support_tickets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view and update all tickets
CREATE POLICY "Admins can view and update all support_tickets"
  ON support_tickets
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger to create admin notification on new ticket
CREATE OR REPLACE FUNCTION public.notify_admin_on_ticket()
RETURNS TRIGGER AS $$
DECLARE
  v_user_name TEXT;
BEGIN
  SELECT first_name || ' ' || last_name INTO v_user_name FROM profiles WHERE id = NEW.user_id;

  INSERT INTO admin_notifications (type, message, created_at)
  VALUES (
    'SUPPORT_TICKET',
    'Nuevo Ticket de Soporte de ' || v_user_name || ': "' || NEW.subject || '"',
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_support_ticket_created
  AFTER INSERT ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_ticket();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;
