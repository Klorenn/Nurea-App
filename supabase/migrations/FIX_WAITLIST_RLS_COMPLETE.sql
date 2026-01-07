-- ============================================
-- FIX COMPLETO: Políticas RLS para Waitlist
-- Ejecuta esto en el SQL Editor de Supabase
-- ============================================

-- Paso 1: Verificar que la tabla existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'waitlist'
);

-- Paso 2: Ver políticas actuales
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'waitlist';

-- Paso 3: Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "Allow public insert on waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Allow admin read on waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_insert_policy" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_select_policy" ON public.waitlist;

-- Paso 4: Asegurarse de que RLS está habilitado
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Paso 5: Crear política de INSERT que permite a TODOS (incluyendo anónimos)
-- Usar 'public' permite tanto usuarios anónimos como autenticados
CREATE POLICY "waitlist_public_insert"
  ON public.waitlist
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Paso 6: Crear política para que solo admins puedan leer registros individuales
CREATE POLICY "waitlist_admin_select"
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

-- Paso 7: Verificar que las políticas se crearon
SELECT 
  policyname,
  cmd,
  roles,
  permissive
FROM pg_policies 
WHERE tablename = 'waitlist';

-- Paso 8: Probar la inserción (esto debería funcionar ahora)
-- Descomenta la siguiente línea para probar:
-- INSERT INTO public.waitlist (email) VALUES ('test@example.com') ON CONFLICT (email) DO NOTHING;

