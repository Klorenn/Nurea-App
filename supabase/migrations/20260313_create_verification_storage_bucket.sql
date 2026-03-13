-- =============================================================================
-- NUREA: Bucket de Storage para Documentos de Verificación KYP
-- Ejecutar en Supabase SQL Editor
-- =============================================================================

-- =============================================================================
-- 1. Crear bucket privado para documentos de verificación
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-documents',
  'verification-documents',
  false,  -- Bucket PRIVADO
  10485760,  -- 10MB límite por archivo
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']::text[];

-- =============================================================================
-- 2. Políticas RLS para el bucket
-- =============================================================================

-- El profesional puede subir sus propios documentos
CREATE POLICY "verification_docs_insert_own"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verification-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- El profesional puede ver sus propios documentos
CREATE POLICY "verification_docs_select_own"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- El profesional puede actualizar sus propios documentos
CREATE POLICY "verification_docs_update_own"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'verification-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- El profesional puede eliminar sus propios documentos
CREATE POLICY "verification_docs_delete_own"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'verification-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Los admins pueden ver todos los documentos
CREATE POLICY "verification_docs_admin_select"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-documents'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Los admins pueden eliminar documentos (para limpieza)
CREATE POLICY "verification_docs_admin_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'verification-documents'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =============================================================================
-- 3. Función helper para generar URL de subida
-- =============================================================================

-- Nota: La generación de signed URLs se hace desde el cliente con supabase.storage
-- Esta función es para referencia de la estructura de paths esperada

COMMENT ON TABLE storage.buckets IS 'Estructura de paths para verification-documents:
  {user_id}/{document_type}_{timestamp}.{extension}
  
  Ejemplo: 
  - a1b2c3d4-e5f6-7890-abcd-ef1234567890/license_1678901234567.pdf
  - a1b2c3d4-e5f6-7890-abcd-ef1234567890/cedula_1678901234567.jpg
';
