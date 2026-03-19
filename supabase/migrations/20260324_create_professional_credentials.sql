-- =============================================================================
-- NUREA: Sistema de Verificación de Credenciales Académicas
-- =============================================================================

-- 1. Crear tipo ENUM para estado de credenciales
DO $$ BEGIN
  CREATE TYPE public.credential_status AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Crear tabla professional_credentials
CREATE TABLE IF NOT EXISTS public.professional_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  institution TEXT NOT NULL,
  year TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Título', 'Diplomado', 'Magíster', 'Curso')),
  file_url TEXT NOT NULL,
  status public.credential_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Habilitar RLS
ALTER TABLE public.professional_credentials ENABLE ROW LEVEL SECURITY;

-- Políticas para professional_credentials
CREATE POLICY "professionals_view_own_credentials" ON public.professional_credentials
  FOR SELECT USING (auth.uid() = professional_id);

CREATE POLICY "professionals_insert_own_credentials" ON public.professional_credentials
  FOR INSERT WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "professionals_delete_own_pending_credentials" ON public.professional_credentials
  FOR DELETE USING (auth.uid() = professional_id AND status = 'pending');

CREATE POLICY "admins_view_all_credentials" ON public.professional_credentials
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admins_update_credentials" ON public.professional_credentials
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Búsqueda pública: Solo credenciales verificadas
CREATE POLICY "public_view_verified_credentials" ON public.professional_credentials
  FOR SELECT USING (status = 'verified');

-- 4. Storage Bucket: credentials
INSERT INTO storage.buckets (id, name, public) 
VALUES ('credentials', 'credentials', false) 
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage para bucket 'credentials'
-- El doctor puede subir y ver sus propios archivos
CREATE POLICY "professionals_upload_credentials" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'credentials' AND 
    (auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "professionals_view_own_credential_files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'credentials' AND 
    (auth.uid())::text = (storage.foldername(name))[1]
  );

-- El Admin puede ver todo en el bucket credentials
CREATE POLICY "admins_view_all_credential_files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'credentials' AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Trigger para updated_at
DROP TRIGGER IF EXISTS trigger_professional_credentials_updated_at ON public.professional_credentials;
CREATE TRIGGER trigger_professional_credentials_updated_at
  BEFORE UPDATE ON public.professional_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Comentarios
COMMENT ON TABLE public.professional_credentials IS 'Títulos y certificados de profesionales pendientes de validación admin.';
