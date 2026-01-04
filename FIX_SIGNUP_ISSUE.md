# 🔧 Solución: Problema de Registro con Base de Datos

## ✅ Cambios Realizados

He actualizado el código para que el perfil se cree automáticamente incluso si el trigger falla:

1. **`app/api/auth/signup/route.ts`**: Ahora crea el perfil manualmente después del signup como respaldo
2. **`app/api/auth/callback/route.ts`**: Ahora crea el perfil para usuarios de Google OAuth si no existe

## 🔍 Verificar Configuración en Supabase

### 1. Verificar que el Trigger Existe

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **Database** > **Functions**
3. Busca la función `handle_new_user`
4. Si no existe, ejecuta este SQL en el **SQL Editor**:

```sql
-- Función para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role, email_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN TRUE ELSE FALSE END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función cuando se crea un nuevo usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. Verificar Políticas RLS

1. Ve a **Authentication** > **Policies** en Supabase
2. Para la tabla `profiles`, verifica que existan estas políticas:

```sql
-- Los usuarios pueden insertar su propio perfil
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Los usuarios pueden ver su propio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Cualquiera puede ver perfiles públicos (para búsqueda)
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.profiles;
CREATE POLICY "Anyone can view public profiles"
  ON public.profiles FOR SELECT
  USING (true);

-- Los usuarios pueden actualizar su propio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

### 3. Verificar Variables de Entorno

Asegúrate de que tu archivo `.env.local` tenga:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Reiniciar el Servidor

```bash
# Detén el servidor (Ctrl+C)
npm run dev
```

## 🧪 Probar el Registro

1. Ve a `http://localhost:3000/signup`
2. Completa el formulario de registro
3. Verifica en Supabase:
   - Ve a **Authentication** > **Users** - Deberías ver el nuevo usuario
   - Ve a **Table Editor** > **profiles** - Deberías ver el perfil creado

## 🐛 Si Aún No Funciona

### Verificar Logs

1. En Supabase, ve a **Logs** > **Postgres Logs**
2. Busca errores relacionados con `handle_new_user` o `profiles`

### Verificar Manualmente

Ejecuta este SQL para verificar si el trigger está activo:

```sql
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table, 
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

### Crear Perfil Manualmente (Temporal)

Si necesitas crear un perfil manualmente para un usuario existente:

```sql
INSERT INTO public.profiles (id, first_name, last_name, role, email_verified)
VALUES (
  'UUID-DEL-USUARIO-AQUI',
  'Nombre',
  'Apellido',
  'patient',
  false
)
ON CONFLICT (id) DO UPDATE
SET first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;
```

## ✅ Con los Cambios Realizados

Ahora el código:
- ✅ Intenta crear el perfil automáticamente con el trigger
- ✅ Si el trigger falla, crea el perfil manualmente como respaldo
- ✅ Funciona tanto para registro con email como con Google OAuth

El registro debería funcionar correctamente ahora.

