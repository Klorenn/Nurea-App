-- Agregar campos para meeting/video llamadas a tabla appointments
-- Fecha: 2026-01-10

-- Agregar columna meeting_link para almacenar el enlace de la reunión
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS meeting_link TEXT;

-- Agregar columna video_platform para almacenar la plataforma usada (daily, zoom, meet, etc.)
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS video_platform TEXT;

-- Agregar columna meeting_room_id para almacenar el ID del room de Daily.co
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS meeting_room_id TEXT;

-- Agregar columna meeting_expires_at para almacenar cuando expira el room
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS meeting_expires_at TIMESTAMP WITH TIME ZONE;

-- Agregar columna reminder_sent_at para rastrear cuándo se envió el recordatorio
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP WITH TIME ZONE;

-- Crear índice para búsquedas rápidas por meeting_room_id
CREATE INDEX IF NOT EXISTS idx_appointments_meeting_room_id 
ON public.appointments(meeting_room_id) 
WHERE meeting_room_id IS NOT NULL;

-- Crear índice para filtrar citas con meetings expirados
CREATE INDEX IF NOT EXISTS idx_appointments_meeting_expires_at 
ON public.appointments(meeting_expires_at) 
WHERE meeting_expires_at IS NOT NULL;

-- Comentarios para documentación
COMMENT ON COLUMN public.appointments.meeting_link IS 'Enlace de la reunión virtual (Daily.co, Zoom, Meet, etc.)';
COMMENT ON COLUMN public.appointments.video_platform IS 'Plataforma de video usada: daily, zoom, google-meet, teams, etc.';
COMMENT ON COLUMN public.appointments.meeting_room_id IS 'ID único del room en la plataforma de video (Daily.co room ID)';
COMMENT ON COLUMN public.appointments.meeting_expires_at IS 'Fecha y hora de expiración del room de video';
COMMENT ON COLUMN public.appointments.reminder_sent_at IS 'Fecha y hora en que se envió el recordatorio de la cita (24h antes)';
