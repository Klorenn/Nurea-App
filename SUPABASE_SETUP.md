# Configuración de Supabase y Google OAuth

## Paso 1: Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Anota la **URL del proyecto** y la **anon key** desde Settings > API

## Paso 2: Configurar Google OAuth en Supabase

1. En el dashboard de Supabase, ve a **Authentication** > **Providers**
2. Habilita **Google**
3. Ingresa las credenciales de Google:
   - **Client ID**: `668385245392-9ih5jbl2oiov0bvg1mpgp0p07oo1quar.apps.googleusercontent.com`
   - **Client Secret**: `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`
4. En **Redirect URLs**, agrega:
   - `http://localhost:3000/api/auth/callback` (desarrollo)
   - `https://tu-dominio.com/api/auth/callback` (producción)

## Paso 3: Configurar Google OAuth en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** > **Credentials**
4. Edita tu OAuth 2.0 Client ID
5. En **Authorized redirect URIs**, agrega:
   - `https://[TU-PROYECTO-SUPABASE].supabase.co/auth/v1/callback`
   - Puedes encontrar esta URL en Supabase: Authentication > URL Configuration

## Paso 4: Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui

# Google OAuth (opcional, ya configurado en Supabase)
GOOGLE_CLIENT_ID=668385245392-9ih5jbl2oiov0bvg1mpgp0p07oo1quar.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Site URL (para redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Paso 5: Crear tablas en Supabase

Ejecuta este SQL en el SQL Editor de Supabase:

```sql
-- Extender la tabla de usuarios con información adicional
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  role TEXT CHECK (role IN ('patient', 'professional', 'admin')),
  date_of_birth DATE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan leer su propio perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Política para que los usuarios puedan actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Función para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'role'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función cuando se crea un nuevo usuario
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Paso 6: Verificar la instalación

1. Reinicia el servidor de desarrollo: `npm run dev`
2. Ve a `/login` y prueba:
   - Registro con email/password
   - Login con Google
   - Verifica que los usuarios se creen en Supabase

## Notas importantes

- **Seguridad**: Nunca commitees el archivo `.env.local` al repositorio
- **Producción**: Actualiza las URLs de redirect en Google Cloud Console para producción
- **RLS**: Las políticas de Row Level Security protegen los datos de los usuarios
- **Testing**: Los usuarios de prueba de Google OAuth están configurados en Google Cloud Console

## Solución de problemas

### Error: "redirect_uri_mismatch"
- Verifica que las URLs de redirect en Google Cloud Console coincidan exactamente
- Asegúrate de incluir la URL de Supabase callback

### Error: "Invalid credentials"
- Verifica que las credenciales de Google estén correctas en Supabase
- Verifica que el Client ID y Secret sean los correctos

### Usuarios no se crean en la tabla profiles
- Verifica que el trigger esté creado correctamente
- Revisa los logs de Supabase para errores

