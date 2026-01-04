# Autenticación con Supabase y Google OAuth

## ✅ Configuración Completada

### Archivos Creados

1. **Cliente de Supabase**
   - `lib/supabase/client.ts` - Cliente para uso en componentes del cliente
   - `lib/supabase/server.ts` - Cliente para uso en Server Components y API routes
   - `lib/supabase/middleware.ts` - Middleware para manejo de sesiones

2. **API Routes**
   - `app/api/auth/signin/route.ts` - Login con email/password
   - `app/api/auth/signup/route.ts` - Registro con email/password
   - `app/api/auth/google/route.ts` - Login/Registro con Google OAuth
   - `app/api/auth/callback/route.ts` - Callback de OAuth
   - `app/api/auth/signout/route.ts` - Cerrar sesión

3. **Hooks**
   - `hooks/use-auth.ts` - Hook para usar autenticación en componentes

4. **Middleware**
   - `middleware.ts` - Protege rutas y maneja sesiones

### Componentes Actualizados

- ✅ `app/login/page.tsx` - Integrado con autenticación
- ✅ `app/signup/page.tsx` - Integrado con autenticación y Google OAuth
- ✅ `components/dashboard-layout.tsx` - Usa hook de autenticación

## 🚀 Próximos Pasos

### 1. Configurar Supabase

Sigue las instrucciones en `SUPABASE_SETUP.md`:

1. Crea un proyecto en Supabase
2. Configura Google OAuth en Supabase
3. Crea las tablas necesarias (SQL incluido en SUPABASE_SETUP.md)
4. Obtén las credenciales (URL y anon key)

### 2. Crear archivo .env.local

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Configurar Google Cloud Console

1. Ve a tu proyecto en Google Cloud Console
2. En **APIs & Services** > **Credentials**
3. Edita tu OAuth 2.0 Client ID
4. Agrega la URL de redirect de Supabase:
   - `https://[TU-PROYECTO-SUPABASE].supabase.co/auth/v1/callback`

### 4. Probar la Autenticación

```bash
npm run dev
```

Visita:
- `/login` - Prueba login con email/password o Google
- `/signup` - Prueba registro con email/password o Google

## 🔐 Funcionalidades Implementadas

### Email/Password
- ✅ Registro de usuarios
- ✅ Login de usuarios
- ✅ Validación de formularios
- ✅ Manejo de errores
- ✅ Redirección después del login

### Google OAuth
- ✅ Botón de "Continuar con Google"
- ✅ Flujo completo de OAuth
- ✅ Callback handler
- ✅ Creación automática de perfil

### Seguridad
- ✅ Middleware protege rutas privadas
- ✅ Row Level Security (RLS) en Supabase
- ✅ Variables de entorno para credenciales
- ✅ Validación de sesiones

## 📝 Notas Importantes

1. **Variables de Entorno**: Nunca commitees `.env.local` al repositorio
2. **Producción**: Actualiza las URLs de redirect en Google Cloud Console
3. **Testing**: Los usuarios de prueba están configurados en Google Cloud Console
4. **Base de Datos**: Ejecuta el SQL en `SUPABASE_SETUP.md` para crear las tablas

## 🐛 Solución de Problemas

### Error: "redirect_uri_mismatch"
- Verifica que las URLs en Google Cloud Console coincidan exactamente
- Debe incluir la URL de Supabase callback

### Usuarios no se crean
- Verifica que el trigger esté creado en Supabase
- Revisa los logs de Supabase

### Middleware no funciona
- Verifica que `middleware.ts` esté en la raíz del proyecto
- Asegúrate de que las rutas estén en el `matcher`

## 📚 Recursos

- [Documentación de Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase OAuth Providers](https://supabase.com/docs/guides/auth/social-login)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

