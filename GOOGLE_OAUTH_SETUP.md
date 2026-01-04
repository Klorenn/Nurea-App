# Configuración de Google OAuth con Verificación de Email y Fecha de Nacimiento

## ✅ Funcionalidades Implementadas

### 1. Registro e Inicio de Sesión con Google
- ✅ Botón "Continuar con Google" en login y signup
- ✅ Flujo completo de OAuth
- ✅ Detección automática de nuevos usuarios

### 2. Completar Perfil para Nuevos Usuarios
- ✅ Página `/complete-profile` para usuarios que se registran con Google
- ✅ Captura de fecha de nacimiento (requerido)
- ✅ Validación de edad (mínimo 18 años)
- ✅ Verificación de email automática

### 3. Verificación de Email
- ✅ Envío automático de email de verificación
- ✅ Estado de verificación visible en la página de completar perfil
- ✅ Redirección automática después de verificar

## 📋 Actualización de Base de Datos

Ejecuta este SQL en el SQL Editor de Supabase para agregar los campos necesarios:

```sql
-- Agregar campos a la tabla profiles si no existen
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Actualizar email_verified cuando el usuario verifica su email
CREATE OR REPLACE FUNCTION public.handle_email_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.profiles
    SET email_verified = TRUE
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar email_verified
DROP TRIGGER IF EXISTS on_email_verified ON auth.users;
CREATE TRIGGER on_email_verified
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS DISTINCT FROM OLD.email_confirmed_at)
  EXECUTE FUNCTION public.handle_email_verification();
```

## 🔄 Flujo de Registro con Google

1. **Usuario hace clic en "Continuar con Google"**
   - Se redirige a Google para autenticación
   - Google devuelve al callback de Supabase

2. **Callback procesa la autenticación**
   - Verifica si es un nuevo usuario
   - Verifica si el perfil está completo
   - Verifica si el email está confirmado

3. **Redirección según estado:**
   - **Nuevo usuario sin perfil completo** → `/complete-profile`
   - **Email no verificado** → `/complete-profile` (con aviso)
   - **Perfil completo y email verificado** → `/dashboard`

4. **Página de Completar Perfil**
   - Muestra estado de verificación de email
   - Solicita fecha de nacimiento
   - Valida que el usuario sea mayor de 18 años
   - Guarda la información en la base de datos

## 📁 Archivos Creados/Modificados

### Nuevos Archivos
- `app/complete-profile/page.tsx` - Página para completar perfil
- `app/api/user/complete-profile/route.ts` - API para guardar fecha de nacimiento
- `app/api/user/profile/route.ts` - API para obtener perfil del usuario
- `app/api/auth/send-verification/route.ts` - API para enviar email de verificación

### Archivos Modificados
- `app/api/auth/callback/route.ts` - Detecta nuevos usuarios y redirige apropiadamente
- `lib/supabase/middleware.ts` - Permite acceso a `/complete-profile`
- `SUPABASE_SETUP.md` - Actualizado con campos nuevos

## 🧪 Pruebas

### Probar Registro con Google

1. Ve a `/login` o `/signup`
2. Haz clic en "Continuar con Google"
3. Completa la autenticación en Google
4. Deberías ser redirigido a `/complete-profile`
5. Ingresa tu fecha de nacimiento
6. Verifica tu email (revisa tu bandeja de entrada)
7. Una vez verificado y con fecha de nacimiento, serás redirigido a `/dashboard`

### Probar Login con Google (Usuario Existente)

1. Ve a `/login`
2. Haz clic en "Continuar con Google"
3. Si el perfil está completo y el email verificado, irás directo a `/dashboard`
4. Si falta información, serás redirigido a `/complete-profile`

## 🔒 Validaciones

- ✅ **Edad mínima**: 18 años
- ✅ **Fecha de nacimiento**: Requerida para nuevos usuarios
- ✅ **Email verificado**: Se muestra el estado en la página de completar perfil
- ✅ **Autenticación**: Solo usuarios autenticados pueden acceder a `/complete-profile`

## 📝 Notas Importantes

1. **Email de Verificación**: 
   - Se envía automáticamente cuando un usuario se registra con Google
   - El usuario debe hacer clic en el enlace del email para verificar
   - Una vez verificado, puede completar su perfil

2. **Fecha de Nacimiento**:
   - Se valida que el usuario sea mayor de 18 años
   - Se guarda en formato DATE en Supabase
   - Es requerida para completar el registro

3. **Seguridad**:
   - El middleware protege las rutas privadas
   - Solo usuarios autenticados pueden acceder a `/complete-profile`
   - Las validaciones se hacen tanto en el cliente como en el servidor

## 🐛 Solución de Problemas

### Usuario no es redirigido a completar perfil
- Verifica que el trigger `on_auth_user_created` esté creado
- Verifica que la tabla `profiles` tenga el campo `date_of_birth`
- Revisa los logs de Supabase

### Email de verificación no se envía
- Verifica la configuración de email en Supabase
- Revisa que el email del usuario esté correcto
- Verifica los logs de Supabase Auth

### Error al guardar fecha de nacimiento
- Verifica que el campo `date_of_birth` exista en la tabla `profiles`
- Verifica que el usuario esté autenticado
- Revisa los logs del servidor

