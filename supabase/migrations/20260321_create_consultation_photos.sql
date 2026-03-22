-- =============================================================================
-- NUREA: consultation_photos — photos attached to a consultation record
-- Professional can upload photos during/after a consultation.
-- Bucket: consultation-photos (private, accessed via signed URLs)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.consultation_photos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id  UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path    TEXT NOT NULL,
  description     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consultation_photos_appointment
  ON public.consultation_photos (appointment_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE public.consultation_photos ENABLE ROW LEVEL SECURITY;

-- Professional can manage photos for their own appointments
CREATE POLICY "professional_manage_consultation_photos"
  ON public.consultation_photos
  FOR ALL
  USING (professional_id = auth.uid())
  WITH CHECK (professional_id = auth.uid());

-- Patient can view photos linked to their appointments
CREATE POLICY "patient_view_consultation_photos"
  ON public.consultation_photos
  FOR SELECT
  USING (
    appointment_id IN (
      SELECT id FROM public.appointments WHERE patient_id = auth.uid()
    )
  );

-- ── Storage bucket ────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'consultation-photos',
  'consultation-photos',
  false,   -- PRIVADO: imágenes médicas, acceso por signed URL
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']::text[];

-- Storage policy: professional uploads/downloads their own folder
CREATE POLICY "professional_upload_consultation_photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'consultation-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "professional_read_consultation_photos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'consultation-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "professional_delete_consultation_photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'consultation-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
