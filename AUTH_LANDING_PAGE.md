# Pantalla Inicial de Acceso - NUREA

## ✅ Implementación Completada

### Principios Aplicados

✅ **Solo para No Autenticados**: Se muestra únicamente si el usuario NO está autenticado  
✅ **Selección de Rol Inicial**: Define el rol que se persiste permanentemente  
✅ **Branding Consistente**: Mantiene identidad visual de NUREA  
✅ **Accesible y Responsive**: Diseño mobile-first y accesible

---

## Estructura

### 1. Pantalla de Selección (`/auth`)

**Archivo**: `app/auth/page.tsx`

**Características**:
- ✅ Solo se muestra si el usuario NO está autenticado
- ✅ Redirige automáticamente si el usuario ya está autenticado
- ✅ Dos opciones claras:
  - **Soy Paciente** → `/auth/register?role=patient`
  - **Soy Profesional** → `/auth/register?role=professional`
- ✅ Diseño con cards grandes y claros
- ✅ Animaciones con Framer Motion
- ✅ Información sobre cada tipo de cuenta
- ✅ Link a login para usuarios existentes

**Protección**:
- Verifica autenticación con `useAuth`
- Redirige según rol si ya está autenticado
- Muestra loading mientras verifica

---

### 2. Página de Registro (`/auth/register`)

**Archivo**: `app/auth/register/page.tsx`

**Características**:
- ✅ Lee el parámetro `role` de la URL
- ✅ Valida que el rol sea válido (patient/professional)
- ✅ Redirige a `/auth` si no hay rol
- ✅ Pasa el rol inicial al `SignupForm`
- ✅ Redirige si el usuario ya está autenticado

**Flujo**:
1. Usuario selecciona rol en `/auth`
2. Redirige a `/auth/register?role=patient` o `/auth/register?role=professional`
3. El formulario se pre-rellena con el rol seleccionado
4. El rol se persiste en el backend durante el registro

---

### 3. SignupForm Actualizado

**Archivo**: `components/smokey-login.tsx`

**Cambios**:
- ✅ Acepta prop `initialRole`
- ✅ Si hay `initialRole`, no muestra selector de rol
- ✅ Muestra badge indicando el rol seleccionado
- ✅ El rol se envía al API durante el registro
- ✅ El rol queda persistido en backend

**Comportamiento**:
- Si `initialRole` está presente: muestra badge, no permite cambiar
- Si `initialRole` no está presente: muestra selector como antes

---

## Persistencia del Rol

### Backend

**API**: `POST /api/auth/signup`

**Flujo**:
1. El rol se envía en el body: `{ email, password, firstName, lastName, role }`
2. Se guarda en `raw_user_meta_data` de Supabase Auth
3. El trigger `handle_new_user()` crea el perfil con el rol
4. Si el trigger falla, se crea manualmente con el rol correcto

**Validación**:
- El rol debe ser `"patient"` o `"professional"`
- Se valida en el API antes de crear el usuario
- Se persiste en la tabla `profiles.role`

### Reglas

- ✅ **El rol queda persistido permanentemente**
- ✅ **No se puede cambiar desde el frontend público**
- ✅ **Solo admin puede cambiar roles** (desde `/admin/users`)

---

## Protección de Rutas

### Middleware

**Archivo**: `lib/supabase/middleware.ts`

**Cambios**:
- ✅ Agregado `/auth` a rutas públicas
- ✅ Permite acceso sin autenticación

### Verificación en Cliente

**Archivo**: `app/auth/page.tsx`

**Lógica**:
- Usa `useAuth` para verificar autenticación
- Si está autenticado, redirige según rol
- Si no está autenticado, muestra la pantalla de selección

---

## Diseño

### Branding

- ✅ Usa `SmokeyBackground` (mismo que login/signup)
- ✅ Colores teal/primary de NUREA
- ✅ Tipografía consistente
- ✅ Iconos: `User` para paciente, `Stethoscope` para profesional

### Accesibilidad

- ✅ Contraste adecuado
- ✅ Textos descriptivos
- ✅ Navegación por teclado
- ✅ Estados hover claros
- ✅ Responsive mobile-first

### Responsive

- ✅ Grid adaptativo (1 columna móvil, 2 columnas desktop)
- ✅ Textos escalables
- ✅ Espaciado consistente
- ✅ Botones táctiles (mínimo 44x44px)

---

## Flujo Completo

### Usuario Nuevo

1. Usuario visita `/auth`
2. Ve dos opciones: "Soy Paciente" o "Soy Profesional"
3. Hace clic en una opción
4. Redirige a `/auth/register?role=patient` o `/auth/register?role=professional`
5. Ve el formulario de registro con el rol pre-seleccionado
6. Completa el formulario
7. El rol se persiste en backend
8. Redirige a `/complete-profile`

### Usuario Autenticado

1. Usuario autenticado visita `/auth`
2. Se detecta autenticación
3. Redirige automáticamente según rol:
   - `professional` → `/professional/dashboard`
   - `patient` → `/dashboard`

### Usuario Existente

1. Usuario visita `/auth`
2. Ve link "¿Ya tienes una cuenta? Inicia sesión"
3. Hace clic y va a `/login`

---

## Archivos Creados/Modificados

### Nuevos
- `app/auth/page.tsx` - Pantalla inicial de selección de rol
- `app/auth/register/page.tsx` - Página de registro con rol pre-seleccionado
- `AUTH_LANDING_PAGE.md` - Este documento

### Modificados
- `components/smokey-login.tsx` - SignupForm acepta `initialRole`
- `lib/supabase/middleware.ts` - Agregado `/auth` a rutas públicas

---

## Validaciones

### Frontend

- ✅ Verifica que el rol sea válido (`patient` o `professional`)
- ✅ Redirige si no hay rol en la URL
- ✅ No permite cambiar rol si viene de `/auth`

### Backend

- ✅ Valida que el rol sea válido en el API
- ✅ Persiste el rol en `profiles.role`
- ✅ El trigger también persiste el rol

---

## Notas Importantes

✅ **Rol Permanente**: Una vez seleccionado, el rol no se puede cambiar sin admin

✅ **Protección**: Solo usuarios no autenticados ven la pantalla de selección

✅ **Branding**: Mantiene identidad visual consistente con el resto de NUREA

✅ **Accesible**: Diseño accesible y responsive

La pantalla inicial de acceso está completa y lista para producción.

