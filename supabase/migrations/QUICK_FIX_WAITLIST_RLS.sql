-- ============================================
-- FIX RÁPIDO: Políticas RLS para Waitlist
-- Copia y pega esto en el SQL Editor de Supabase
-- ============================================

-- Paso 1: Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "Allow public insert on waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Allow admin read on waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_public_insert" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_admin_select" ON public.waitlist;

-- Paso 2: Asegurarse de que RLS está habilitado
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Paso 3: Crear política de INSERT que permite a TODOS (incluyendo anónimos)
-- IMPORTANTE: Usar 'public' permite tanto usuarios anónimos como autenticados
CREATE POLICY "waitlist_public_insert"
  ON public.waitlist
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Paso 4: Verificar que la política se creó correctamente
SELECT 
  policyname,
  cmd,
  roles,
  permissive,
  with_check
FROM pg_policies 
WHERE tablename = 'waitlist';

-- Deberías ver una política con:
-- policyname: "waitlist_public_insert"
-- cmd: "INSERT"
-- roles: "{public}"
-- with_check: "true"

