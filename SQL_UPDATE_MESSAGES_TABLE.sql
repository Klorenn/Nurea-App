-- Actualizar tabla de mensajes para soportar archivos adjuntos
-- Ejecutar en Supabase SQL Editor

-- Agregar columnas para archivos si no existen
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_type TEXT;

-- Crear bucket de storage para mensajes si no existe
-- Nota: Esto debe hacerse desde el dashboard de Supabase Storage
-- O usar la API de Supabase Storage

-- Crear política RLS para que los usuarios solo puedan ver sus propios archivos
-- (Las políticas de mensajes ya cubren esto, pero podemos ser más específicos)

-- Índice para búsqueda rápida de mensajes con archivos
CREATE INDEX IF NOT EXISTS messages_file_url_idx ON public.messages(file_url) WHERE file_url IS NOT NULL;

