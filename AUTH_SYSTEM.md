# 🔐 Sistema de Autenticación NUREA

## Arquitectura General

El sistema de autenticación de NUREA está diseñado con un enfoque en **seguridad, claridad y experiencia humana**. Utiliza Supabase Auth como backend, con protección de rutas basada en roles y mensajes empáticos para el usuario.

## Componentes Principales

### 1. Utilidades de Autenticación (`lib/auth/utils.ts`)

- `getAuthUser()`: Obtiene el usuario autenticado con su rol y estado
- `hasRole()`: Verifica si el usuario tiene un rol específico
- `canAccessRoute()`: Verifica si el usuario puede acceder a una ruta
- `getHumanErrorMessage()`: Convierte errores técnicos en mensajes humanos

### 2. Mensajes Humanos (`lib/auth/messages.ts`)

Mensajes predefinidos en español e inglés que explican:
- Por qué pedimos cada dato
- Mensajes de éxito
- Mensajes de error empáticos
- Estados de carga

### 3. Middleware de Protección (`lib/supabase/middleware.ts`)

- Verifica autenticación en cada request
- Protege rutas basado en roles
- Redirige usuarios no autenticados a `/login`
- Redirige usuarios con rol incorrecto a su dashboard apropiado

### 4. Hooks de Autenticación

#### `useAuth()` (`hooks/use-auth.ts`)
- Obtiene el usuario actual
- Maneja estados de carga
- Proporciona función `signOut()` segura

#### `useRole()` (`hooks/use-role.ts`)
- Obtiene el rol del usuario
- Proporciona helpers: `isPatient`, `isProfessional`, `isAdmin`
- Función `hasRole()` para verificar roles

### 5. Componente RouteGuard (`components/auth/route-guard.tsx`)

Protege componentes basado en:
- Rol requerido
- Verificación de email
- Perfil completo

## Flujos de Autenticación

### Login con Email + Contraseña

1. Usuario ingresa email y contraseña
2. `POST /api/auth/signin` valida credenciales
3. Verifica si el email está verificado
4. Obtiene el rol del usuario
5. Redirige según rol y estado del perfil

**Mensajes de error humanos:**
- Credenciales incorrectas: "El email o la contraseña no son correctos..."
- Email no verificado: "Por favor, verifica tu email antes de iniciar sesión..."

### Login con Google OAuth

1. Usuario hace clic en "Continuar con Google"
2. `GET /api/auth/google` inicia el flujo OAuth
3. Google redirige a `/api/auth/callback`
4. Se crea/actualiza el perfil del usuario
5. Se verifica el estado del perfil
6. Redirige según rol y estado

### Registro (Signup)

1. Usuario selecciona rol (Paciente/Profesional)
2. Completa formulario con explicaciones de cada campo
3. Acepta términos y política de privacidad
4. `POST /api/auth/signup` crea la cuenta
5. Se envía email de verificación
6. Redirige a `/complete-profile` o `/verify-email`

**Explicaciones de campos:**
- Email: "Tu email es tu identidad en NUREA. Lo usamos para confirmar tus citas..."
- Contraseña: "Una contraseña fuerte protege tu información de salud..."

### Recuperación de Contraseña

1. Usuario ingresa email en `/forgot-password`
2. `POST /api/auth/forgot-password` envía email de recuperación
3. Usuario hace clic en el enlace del email
4. Llega a `/reset-password` con token
5. Usuario ingresa nueva contraseña
6. `POST /api/auth/reset-password` actualiza la contraseña
7. Redirige a `/login` con mensaje de éxito

**Seguridad:**
- No revela si el email existe o no
- Token expira en 1 hora
- Validación de contraseña fuerte

### Verificación de Email

1. Usuario recibe email de verificación
2. Hace clic en el enlace
3. Supabase verifica automáticamente
4. Usuario puede reenviar email desde `/verify-email`
5. `POST /api/auth/resend-verification` reenvía el email

## Protección de Rutas

### Por Middleware (Automático)

El middleware protege todas las rutas automáticamente:
- Rutas públicas: `/`, `/login`, `/signup`, `/forgot-password`, `/legal`
- Rutas de paciente: `/dashboard/*`, `/search`, `/professionals/*`
- Rutas de profesional: `/professional/*`
- Rutas de admin: `/admin/*`

### Por Componente (Manual)

```tsx
import { RouteGuard } from "@/components/auth/route-guard"

<RouteGuard requiredRole="professional" requireEmailVerification>
  <ProfessionalDashboard />
</RouteGuard>
```

## Seguridad

### ✅ Implementado

- ✅ JWT/Sesiones seguras (Supabase Auth)
- ✅ No exposición de secretos (variables de entorno)
- ✅ Protección CSRF (Supabase maneja esto)
- ✅ Validación de email obligatoria
- ✅ Contraseñas mínimas de 6 caracteres
- ✅ Logout seguro con limpieza de sesión
- ✅ Protección de rutas por rol
- ✅ Row Level Security (RLS) en Supabase

### 🔒 Buenas Prácticas

1. **Nunca exponer secretos**: Todos los secretos están en `.env.local`
2. **Validación en servidor**: Todas las validaciones críticas están en API routes
3. **Mensajes de error seguros**: No revelan información sensible
4. **Sesiones seguras**: Supabase maneja las cookies HTTP-only
5. **Verificación de email**: Obligatoria para acceder a funciones completas

## Mensajes de Error Humanos

Todos los errores se convierten en mensajes comprensibles:

| Error Técnico | Mensaje Humano (ES) |
|--------------|---------------------|
| `Invalid login credentials` | "El email o la contraseña no son correctos. Por favor, verifica tus datos..." |
| `Email not confirmed` | "Por favor, verifica tu email antes de iniciar sesión. Revisa tu bandeja..." |
| `User already registered` | "Este email ya está registrado. ¿Olvidaste tu contraseña?..." |
| `Password should be at least 6 characters` | "Tu contraseña debe tener al menos 6 caracteres para mantener tu cuenta segura." |

## Estados de Carga

Todos los formularios muestran estados de carga claros:
- "Iniciando sesión..."
- "Creando tu cuenta..."
- "Enviando email..."
- "Verificando..."

## Próximos Pasos

1. ✅ Sistema completo implementado
2. ⏳ Testing de flujos completos
3. ⏳ Monitoreo de errores de autenticación
4. ⏳ Rate limiting para prevenir ataques de fuerza bruta
5. ⏳ Autenticación de dos factores (2FA) para profesionales

## Uso en Componentes

### Verificar Rol en Componente

```tsx
import { useRole } from "@/hooks/use-role"

function MyComponent() {
  const { role, isProfessional, hasRole } = useRole()
  
  if (isProfessional) {
    return <ProfessionalView />
  }
  
  return <PatientView />
}
```

### Proteger Ruta Completa

```tsx
import { RouteGuard } from "@/components/auth/route-guard"

export default function ProfessionalPage() {
  return (
    <RouteGuard requiredRole="professional" requireEmailVerification>
      <ProfessionalContent />
    </RouteGuard>
  )
}
```

## Notas Importantes

- **Pensado como producto de salud**: Todos los mensajes son empáticos y explican el "por qué"
- **Sin fricción innecesaria**: Flujos optimizados, sin pasos extra
- **Seguridad primero**: Pero sin sacrificar UX
- **Claridad sobre burocracia**: Mensajes claros, no legales interminables

