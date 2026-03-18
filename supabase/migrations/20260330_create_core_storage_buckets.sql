-- =============================================================================
-- NUREA: Buckets de Storage principales (avatars, clinic-photos, credentials, messages)
-- Crea los buckets usados por el frontend y APIs para subir fotos y archivos.
-- Ejecutar vía CLI de Supabase o como parte de las migraciones.
-- =============================================================================

-- ============================================================================
-- 1. Bucket público para avatares de usuarios y profesionales
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,  -- Bucket PÚBLICO: las fotos de perfil se muestran en la web
  5242880,  -- 5MB por archivo
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']::text[];

-- ============================================================================
-- 2. Bucket público para fotos de clínica / galería de profesionales
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'clinic-photos',
  'clinic-photos',
  true,  -- PÚBLICO: se muestran en los perfiles
  10485760,  -- 10MB por archivo
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']::text[];

-- ============================================================================
-- 3. Bucket privado para credenciales profesionales (PDFs de títulos, diplomas, etc.)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'credentials',
  'credentials',
  false,  -- PRIVADO: solo para verificación interna
  10485760,  -- 10MB por archivo
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf']::text[];

-- ============================================================================
-- 4. Bucket privado para archivos adjuntos en mensajes (chat)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'messages',
  'messages',
  false,  -- PRIVADO: solo accesible vía políticas / signed URLs
  10485760,  -- 10MB por archivo
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'text/plain'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'text/plain'
  ]::text[];

