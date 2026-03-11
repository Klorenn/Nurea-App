-- Waitlist: tabla y políticas para lista de espera.
-- Aplicar desde Supabase SQL Editor. Si hay error RLS, ejecutar antes uno de los *FIX*WAITLIST*.sql de esta carpeta.
-- Crear tabla waitlist
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para búsquedas rápidas por email
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);

-- Crear índice para ordenar por fecha de creación
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist(created_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera puede insertar (para el formulario público)
-- Usar 'public' permite tanto usuarios anónimos como autenticados
CREATE POLICY "Allow public insert on waitlist"
  ON public.waitlist
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Política: Cualquiera puede leer el conteo (pero no los emails individuales)
-- Para esto, crearemos una función que solo retorne el conteo
CREATE OR REPLACE FUNCTION public.get_waitlist_count()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COUNT(*)::INTEGER FROM public.waitlist;
$$;

-- Política: Solo admins pueden ver todos los registros
CREATE POLICY "Allow admin read on waitlist"
  ON public.waitlist
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_waitlist_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_waitlist_updated_at
  BEFORE UPDATE ON public.waitlist
  FOR EACH ROW
  EXECUTE FUNCTION public.update_waitlist_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE public.waitlist IS 'Tabla para almacenar emails de la lista de espera';
COMMENT ON COLUMN public.waitlist.email IS 'Email del usuario en la lista de espera (único)';
COMMENT ON COLUMN public.waitlist.created_at IS 'Fecha y hora de registro en la lista de espera';
COMMENT ON FUNCTION public.get_waitlist_count() IS 'Función que retorna el conteo total de usuarios en la lista de espera (público)';

