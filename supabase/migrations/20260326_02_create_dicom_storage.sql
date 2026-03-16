-- Create storage bucket for DICOM studies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dicom-studies',
  'dicom-studies',
  false,
  1048576000, -- 1GB limit for bulk uploads
  '{application/dicom}'
)
ON CONFLICT (id) DO UPDATE
SET 
  public = false,
  file_size_limit = 1048576000,
  allowed_mime_types = '{application/dicom}';

-- Enable Row Level Security on the bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Delete any existing policies for the bucket to avoid conflicts during testing
DROP POLICY IF EXISTS "Professionals can upload dicom files" ON storage.objects;
DROP POLICY IF EXISTS "Professionals can view dicom files" ON storage.objects;
DROP POLICY IF EXISTS "Patients can view their own dicom files" ON storage.objects;

-- Policy 1: Only verified professionals can upload files
CREATE POLICY "Professionals can upload dicom files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'dicom-studies' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('professional', 'admin')
  )
);

-- Policy 2: Professionals can view files they uploaded or from their patients
CREATE POLICY "Professionals can view dicom files" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'dicom-studies' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('professional', 'admin')
  )
);

-- Policy 3: Patients can view files associated with their ID
-- (Assuming the folder structure maps to patient ID, e.g., 'patient_id/study_id/image.dcm')
CREATE POLICY "Patients can view their own dicom files" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'dicom-studies' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
