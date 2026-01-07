-- ============================================
-- SCRIPT DE CORRECCIÓN DE POLÍTICAS RLS
-- Ejecuta este script en el SQL Editor de Supabase
-- ============================================

-- Paso 1: Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Allow public insert on waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Allow admin read on waitlist" ON public.waitlist;

-- Paso 2: Crear política de INSERT para usuarios públicos (anónimos y autenticados)
-- IMPORTANTE: Usar 'public' permite tanto usuarios anónimos como autenticados
CREATE POLICY "Allow public insert on waitlist"
  ON public.waitlist
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Paso 3: Política para que solo admins puedan ver los registros individuales
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

-- Paso 4: Verificar que las políticas se crearon correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'waitlist';

-- Si todo está bien, deberías ver 2 políticas:
-- 1. "Allow public insert on waitlist" con cmd = 'INSERT' y roles = '{public}'
-- 2. "Allow admin read on waitlist" con cmd = 'SELECT' y roles = '{authenticated}'

