-- User-facing notifications feed used by:
-- - GET  /api/notifications/list
-- - POST /api/notifications/mark-read
-- - components/notifications/notifications-dropdown

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own notifications
CREATE POLICY "notifications_select_own"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Professionals can create notifications for patients they interact with
CREATE POLICY "notifications_insert_professional"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NOT NULL AND (public.is_professional() OR public.is_admin()));

-- Admins can see/update all notifications
CREATE POLICY "notifications_admin_select"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "notifications_admin_update"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Keep updated_at consistent (reuses the helper from core schema)
DROP TRIGGER IF EXISTS notifications_updated_at ON public.notifications;
CREATE TRIGGER notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

