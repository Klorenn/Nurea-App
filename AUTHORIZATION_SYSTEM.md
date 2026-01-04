# Sistema de Autorización Global - NUREA

## ✅ Implementación Completada

Sistema completo de autorización con protección por roles, validación de ownership y protección de IDs.

---

## Estructura

### 1. Middleware Global (`lib/supabase/middleware.ts`)

**Protección de Rutas:**
- ✅ `/dashboard/*` → Solo `patient` o `admin`
- ✅ `/professional/*` → Solo `professional` o `admin`
- ✅ `/admin/*` → Solo `admin`
- ✅ Verificación de cuenta bloqueada
- ✅ Doble validación (validateRouteAccess + canAccessRoute)

**Errores:**
- 401: No autenticado → Redirige a `/login`
- 403: No autorizado → Redirige según rol

---

### 2. Autorización (`lib/auth/authorization.ts`)

**Funciones Principales:**

#### `requireAuth()`
Verifica autenticación y obtiene información del usuario.
```typescript
const result = await requireAuth()
if (!result.authorized) {
  return createErrorResponse(result) // 401
}
```

#### `requireRole(requiredRole)`
Verifica que el usuario tenga el rol requerido.
```typescript
const result = await requireRole('admin')
if (!result.authorized) {
  return createErrorResponse(result) // 403
}
```

#### `requireOwnership(resourceUserId, allowAdmin)`
Verifica que el usuario sea propietario del recurso.
```typescript
const result = await requireOwnership(appointment.patient_id)
if (!result.authorized) {
  return createErrorResponse(result) // 403
}
```

#### `validateResourceOwnership(table, resourceId, userIdColumn, allowAdmin)`
Valida ownership consultando la base de datos.
```typescript
const result = await validateResourceOwnership(
  'appointments',
  appointmentId,
  'patient_id'
)
if (!result.authorized) {
  return createErrorResponse(result) // 403 o 404
}
```

#### `validateUserId(userId, allowAdmin)`
Valida que un ID de usuario sea accesible.
```typescript
const result = await validateUserId(userId)
if (!result.authorized) {
  return createErrorResponse(result) // 403
}
```

---

### 3. Helpers para APIs (`lib/auth/api-helpers.ts`)

**Wrappers Reutilizables:**

#### `withAuth(handler)`
Protege endpoint con autenticación.
```typescript
export async function GET(request: Request) {
  return withAuth(async (authResult) => {
    // authResult.user está disponible
    return NextResponse.json({ data: '...' })
  })
}
```

#### `withRole(requiredRole, handler)`
Protege endpoint con rol requerido.
```typescript
export async function GET(request: Request) {
  return withRole('admin', async (authResult) => {
    // Solo admins pueden acceder
    return NextResponse.json({ data: '...' })
  })
}
```

#### `withOwnership(resourceUserId, handler, allowAdmin)`
Protege endpoint con ownership.
```typescript
export async function GET(request: Request) {
  const { appointmentId } = await request.json()
  const appointment = await getAppointment(appointmentId)
  
  return withOwnership(
    appointment.patient_id,
    async (authResult) => {
      // Solo el propietario puede acceder
      return NextResponse.json({ appointment })
    }
  )
}
```

#### `withResourceOwnership(table, resourceId, userIdColumn, handler, allowAdmin)`
Valida ownership desde la base de datos.
```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const appointmentId = searchParams.get('id')
  
  if (!appointmentId || !isValidUUID(appointmentId)) {
    return invalidIdResponse() // 400
  }
  
  return withResourceOwnership(
    'appointments',
    appointmentId,
    'patient_id',
    async (authResult) => {
      // Ownership validado
      const appointment = await getAppointment(appointmentId)
      return NextResponse.json({ appointment })
    }
  )
}
```

---

## Ejemplos de Uso

### Ejemplo 1: API Protegida por Rol

```typescript
// app/api/admin/users/route.ts
import { withRole } from '@/lib/auth/api-helpers'

export async function GET(request: Request) {
  return withRole('admin', async (authResult) => {
    // Solo admins pueden acceder
    const users = await getUsers()
    return NextResponse.json({ users })
  })
}
```

### Ejemplo 2: API con Ownership

```typescript
// app/api/appointments/[id]/route.ts
import { withResourceOwnership, isValidUUID, invalidIdResponse } from '@/lib/auth/api-helpers'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  
  if (!isValidUUID(id)) {
    return invalidIdResponse()
  }
  
  return withResourceOwnership(
    'appointments',
    id,
    'patient_id',
    async (authResult) => {
      const appointment = await getAppointment(id)
      return NextResponse.json({ appointment })
    }
  )
}
```

### Ejemplo 3: API con Validación Manual

```typescript
// app/api/documents/list/route.ts
import { requireAuth, createErrorResponse } from '@/lib/auth/authorization'

export async function GET(request: Request) {
  const authResult = await requireAuth()
  
  if (!authResult.authorized || !authResult.user) {
    return createErrorResponse(authResult)
  }
  
  // Validación adicional según rol
  if (authResult.user.role === 'patient') {
    // Solo documentos del paciente
    const documents = await getPatientDocuments(authResult.user.id)
    return NextResponse.json({ documents })
  } else if (authResult.user.role === 'professional') {
    // Solo documentos de pacientes del profesional
    const documents = await getProfessionalDocuments(authResult.user.id)
    return NextResponse.json({ documents })
  }
  
  return createErrorResponse({
    authorized: false,
    error: 'forbidden',
    message: 'Rol no permitido'
  })
}
```

---

## Validaciones Implementadas

### 1. Protección de Rutas

**Middleware:**
- Verifica autenticación
- Verifica rol
- Verifica cuenta bloqueada
- Redirige apropiadamente

**Rutas Protegidas:**
- `/dashboard/*` → `patient` o `admin`
- `/professional/*` → `professional` o `admin`
- `/admin/*` → `admin` únicamente

### 2. Ownership de Recursos

**Validaciones:**
- Usuario solo puede acceder a sus propios recursos
- Admin puede acceder si `allowAdmin = true`
- Validación server-side obligatoria
- Consulta a base de datos para verificar ownership

**Tablas Protegidas:**
- `appointments` → `patient_id` o `professional_id`
- `documents` → `patient_id` o `professional_id`
- `messages` → `sender_id` o `receiver_id`
- `support_tickets` → `user_id`
- `payments` → `patient_id`

### 3. Protección de IDs

**Validaciones:**
- Formato UUID válido
- ID existe en base de datos
- ID pertenece al usuario autenticado
- Respuestas de error apropiadas (400, 403, 404)

---

## Códigos de Error

### 401 Unauthorized
- Usuario no autenticado
- Sesión expirada
- Token inválido

**Respuesta:**
```json
{
  "error": "unauthorized",
  "message": "Por favor, inicia sesión para acceder a este recurso."
}
```

### 403 Forbidden
- Usuario autenticado pero sin permisos
- Rol incorrecto
- No es propietario del recurso

**Respuesta:**
```json
{
  "error": "forbidden",
  "message": "No tienes permisos para acceder a este recurso."
}
```

### 404 Not Found
- Recurso no existe
- ID inválido

**Respuesta:**
```json
{
  "error": "not_found",
  "message": "Recurso no encontrado."
}
```

### 400 Bad Request
- ID inválido (formato incorrecto)
- Parámetros faltantes

**Respuesta:**
```json
{
  "error": "invalid_id",
  "message": "El ID proporcionado no es válido."
}
```

---

## Reglas de Seguridad

### 1. Server-Side Checks Obligatorios

✅ **Todas las validaciones se hacen en el servidor**
- No confiar en validaciones del cliente
- Verificar en cada request
- Consultar base de datos cuando sea necesario

### 2. Protección de IDs

✅ **Validar formato y ownership**
- Verificar formato UUID
- Verificar existencia en BD
- Verificar ownership antes de acceder

### 3. Principio de Menor Privilegio

✅ **Solo permisos necesarios**
- Admin puede acceder solo si `allowAdmin = true`
- Usuarios solo acceden a sus recursos
- Roles específicos para cada ruta

### 4. Doble Validación

✅ **Middleware + API**
- Middleware protege rutas
- APIs validan ownership
- RLS en base de datos como última línea

---

## Archivos Creados/Modificados

### Nuevos
- `lib/auth/authorization.ts` - Sistema de autorización completo
- `lib/auth/api-helpers.ts` - Helpers para APIs
- `AUTHORIZATION_SYSTEM.md` - Este documento

### Modificados
- `lib/supabase/middleware.ts` - Middleware mejorado con validaciones estrictas
- `lib/auth/utils.ts` - `canAccessRoute` actualizado con reglas estrictas

---

## Migración de APIs Existentes

### Antes:
```typescript
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Validación manual...
}
```

### Después:
```typescript
import { withAuth } from '@/lib/auth/api-helpers'

export async function GET(request: Request) {
  return withAuth(async (authResult) => {
    // authResult.user está disponible
    // Validación automática
  })
}
```

---

## Notas Importantes

✅ **Todas las validaciones son server-side**
✅ **RLS en base de datos como última línea de defensa**
✅ **Errores claros y consistentes (401, 403, 404)**
✅ **Protección de IDs con validación de formato**
✅ **Ownership validado en cada request**

El sistema de autorización está completo y listo para producción.

