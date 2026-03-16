-- Create admin_notifications table
CREATE TYPE admin_notification_type AS ENUM ('NEW_DOCTOR', 'SECURITY_ALERT', 'INFO');

CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type admin_notification_type NOT NULL,
  message TEXT NOT NULL,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Admins can view and update all notifications
CREATE POLICY "Admins can view admin_notifications"
  ON admin_notifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update admin_notifications"
  ON admin_notifications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Service role can insert notifications
CREATE POLICY "Service role can insert admin_notifications"
  ON admin_notifications
  FOR INSERT
  WITH CHECK (true);

-- Turn on realtime for admin_notifications
ALTER PUBLICATION supabase_realtime ADD TABLE admin_notifications;
