# 🛡️ Panel de Administración NUREA

## Arquitectura General

El panel de administración de NUREA está diseñado para ser **simple, funcional y enfocado en control y soporte**. No es un ERP complejo, es un panel de control esencial para gestionar la plataforma.

## Características Implementadas

### 1. Layout Simple

**Componente:** `AdminLayout`

**Características:**
- Header fijo con logo y botón de salir
- Sidebar colapsable en móvil
- Navegación clara con iconos
- Sin dashboards inflados
- Enfoque en funcionalidad

**Navegación:**
- Usuarios
- Citas
- Pagos
- Soporte

### 2. Ver Usuarios

**Página:** `/admin/users`

**Funcionalidades:**
- Lista de todos los usuarios
- Búsqueda por nombre, email o rol
- Información visible:
  - Nombre completo
  - Email
  - Rol (patient/professional/admin)
  - Estado de verificación
  - Estado de bloqueo
  - Fecha de registro
- Acción: Bloquear/Desbloquear usuarios

**Características:**
- Sin información innecesaria
- Acciones claras
- Confirmación antes de bloquear

### 3. Ver Citas

**Página:** `/admin/appointments`

**Funcionalidades:**
- Lista de todas las citas
- Búsqueda por paciente o profesional
- Filtros por estado:
  - Todas
  - Pendientes
  - Confirmadas
  - Completadas
  - Canceladas
- Información visible:
  - Fecha y hora
  - Paciente (nombre y email)
  - Profesional (nombre)
  - Tipo (online/presencial)
  - Estado de pago
  - Precio

**Características:**
- Vista clara y ordenada
- Filtros útiles
- Sin información técnica innecesaria

### 4. Ver Pagos

**Página:** `/admin/payments`

**Funcionalidades:**
- Lista de todos los pagos
- Búsqueda por paciente o ID de pago
- Filtros por estado:
  - Todos
  - Pendientes
  - Pagados
  - Fallidos
  - Reembolsados
- Información visible:
  - Paciente
  - Monto y moneda
  - Método de pago
  - Estado
  - Fecha de pago
  - Cita asociada
- Total de pagos exitosos visible

**Características:**
- Resumen de totales
- Estados claros con iconos
- Información esencial

### 5. Bloquear Cuentas

**API:** `POST /api/admin/block-user`

**Funcionalidades:**
- Bloquear usuario desde panel
- Desbloquear usuario
- Confirmación antes de bloquear
- Actualización en tiempo real

**Seguridad:**
- Solo admins pueden bloquear
- Verificación de rol en API
- Registro de fecha de bloqueo

### 6. Soporte Básico

**Página:** `/admin/support`

**Funcionalidades:**
- Lista de tickets de soporte
- Búsqueda por usuario, email o asunto
- Estados: Abierto / Resuelto
- Responder tickets por email
- Marcar como resuelto

**Características:**
- Interfaz simple
- Respuestas directas
- Sin sistema complejo de tickets

## Estructura de Archivos

```
app/admin/
  ├── page.tsx              # Dashboard principal
  ├── users/page.tsx        # Gestión de usuarios
  ├── appointments/page.tsx  # Ver citas
  ├── payments/page.tsx     # Ver pagos
  └── support/page.tsx      # Soporte básico

components/admin/
  └── admin-layout.tsx      # Layout del panel

app/api/admin/
  └── block-user/route.ts   # API para bloquear usuarios
```

## Protección de Rutas

**Middleware:**
- Verifica autenticación
- Verifica rol admin
- Redirige si no es admin

**Componente:**
- `RouteGuard` con `requiredRole="admin"`
- Protección en cada página

## UX: Simple y Funcional

### Sin Dashboards Inflados

**Evitar:**
- ❌ Gráficos complejos
- ❌ Métricas innecesarias
- ❌ Widgets decorativos
- ❌ Información redundante

**Incluir:**
- ✅ Listas claras
- ✅ Búsqueda simple
- ✅ Filtros útiles
- ✅ Acciones directas

### Enfocado en Control

**Características:**
- Acciones visibles y claras
- Sin pasos innecesarios
- Confirmaciones cuando es necesario
- Feedback inmediato

### Enfocado en Soporte

**Características:**
- Ver información rápidamente
- Responder directamente
- Resolver problemas sin fricción
- Sin sistemas complejos

## Base de Datos

### Columna `blocked` en `profiles`

```sql
ALTER TABLE public.profiles 
ADD COLUMN blocked BOOLEAN DEFAULT FALSE,
ADD COLUMN blocked_at TIMESTAMP WITH TIME ZONE;
```

### Próximos Pasos (Opcional)

1. ⏳ Tabla de tickets de soporte
2. ⏳ Sistema de notificaciones para admins
3. ⏳ Logs de acciones administrativas
4. ⏳ Exportar datos (CSV/JSON)

## Características Destacadas

- **Simple:** Sin complejidad innecesaria
- **Funcional:** Acciones directas y claras
- **Control:** Bloquear usuarios, ver todo
- **Soporte:** Responder tickets fácilmente
- **Protegido:** Solo admins pueden acceder
- **Claro:** Información esencial, sin ruido

El panel está listo para uso y cumple con los requisitos de simplicidad y funcionalidad para gestión básica de la plataforma.

