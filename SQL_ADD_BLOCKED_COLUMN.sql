-- Agregar columna de bloqueo a la tabla profiles
-- Ejecutar en Supabase SQL Editor

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS blocked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP WITH TIME ZONE;

-- Índice para búsqueda rápida de usuarios bloqueados
CREATE INDEX IF NOT EXISTS profiles_blocked_idx ON public.profiles(blocked) WHERE blocked = TRUE;

-- Comentario para documentación
COMMENT ON COLUMN public.profiles.blocked IS 'Indica si el usuario está bloqueado por un administrador';
COMMENT ON COLUMN public.profiles.blocked_at IS 'Fecha y hora en que el usuario fue bloqueado';

