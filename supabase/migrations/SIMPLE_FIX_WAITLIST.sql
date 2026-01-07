-- ============================================
-- SOLUCIÓN SIMPLE: Deshabilitar RLS o usar función
-- Ejecuta esto en el SQL Editor de Supabase
-- ============================================

-- OPCIÓN 1: Deshabilitar RLS completamente (más simple)
ALTER TABLE public.waitlist DISABLE ROW LEVEL SECURITY;

-- OPCIÓN 2: Si prefieres mantener RLS, usa esta función en su lugar
-- (Descomenta si quieres usar función en lugar de deshabilitar RLS)

/*
-- Crear función que puede insertar sin problemas de RLS
CREATE OR REPLACE FUNCTION public.add_to_waitlist(email_text TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.waitlist (email)
  VALUES (LOWER(TRIM(email_text)))
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Permitir que cualquiera ejecute esta función
GRANT EXECUTE ON FUNCTION public.add_to_waitlist(TEXT) TO public;
*/

-- Verificar que RLS está deshabilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'waitlist';

-- Deberías ver rowsecurity = false

