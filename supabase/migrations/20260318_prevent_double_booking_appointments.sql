-- Prevent double booking for the same professional/date/time in active states.
-- This is a minimal safety net against race conditions in /api/appointments/create.
--
-- Note: This only prevents exact same start time (not partial overlaps).
CREATE UNIQUE INDEX IF NOT EXISTS uniq_appointments_professional_datetime_active
ON public.appointments (professional_id, appointment_date, appointment_time)
WHERE status IN ('pending', 'confirmed');

