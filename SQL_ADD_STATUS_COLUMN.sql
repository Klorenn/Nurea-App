-- Agregar columna de estado (online/offline/busy) a la tabla profiles
-- Ejecutar en Supabase SQL Editor

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('online', 'offline', 'busy')) DEFAULT 'online';

-- Índice para búsqueda rápida por estado
CREATE INDEX IF NOT EXISTS profiles_status_idx ON public.profiles(status) WHERE status IS NOT NULL;

-- Comentario para documentación
COMMENT ON COLUMN public.profiles.status IS 'Estado de disponibilidad del usuario: online, offline, busy';

