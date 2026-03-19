-- Add policy for patients to view their own finances
CREATE POLICY "Patients can view their own finances"
  ON public.finances
  FOR SELECT
  USING (patient_id = auth.uid());
