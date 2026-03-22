-- supabase/migrations/20260322_add_review_reply_to_reviews.sql
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS reply_text TEXT,
  ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;

-- Allow professionals to update reply_text/replied_at on their own reviews
-- doctor_id is canonical since migration 20260315 renamed professional_id → doctor_id
CREATE POLICY "professionals_can_reply_own_reviews"
  ON public.reviews
  FOR UPDATE
  USING (auth.uid() = doctor_id)
  WITH CHECK (auth.uid() = doctor_id);
