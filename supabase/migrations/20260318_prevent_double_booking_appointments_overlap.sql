-- Stronger protection against overlapping appointments (race-condition safe).
-- Uses an exclusion constraint on a generated time range.
--
-- Assumption: `appointment_date` + `appointment_time` represents a local timestamp
-- (stored without timezone semantics). This keeps behavior consistent with current schema.

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS starts_at TIMESTAMP GENERATED ALWAYS AS (appointment_date + appointment_time) STORED,
  ADD COLUMN IF NOT EXISTS ends_at   TIMESTAMP GENERATED ALWAYS AS (appointment_date + appointment_time + make_interval(mins => duration_minutes)) STORED;

-- Prevent overlaps for active appointments (pending/confirmed) per professional.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'appointments_no_overlap_active'
  ) THEN
    ALTER TABLE public.appointments
      ADD CONSTRAINT appointments_no_overlap_active
      EXCLUDE USING gist (
        professional_id WITH =,
        tsrange(starts_at, ends_at, '[)') WITH &&
      )
      WHERE (status IN ('pending', 'confirmed'));
  END IF;
END $$;

