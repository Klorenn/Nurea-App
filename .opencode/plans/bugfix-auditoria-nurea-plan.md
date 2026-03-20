# Plan: Auditoría y Corrección de Bugs Críticos - NUREA App

**Generated**: 2026-03-19
**Status**: ✅ COMPLETADO
**Completed**: 2026-03-19
**Estimated Complexity**: High
**Estimated Duration**: 5-7 horas de implementación + 3-5 horas de testing
**Actual Duration**: ~4 horas implementación + testing checklist

---

## Overview

Este plan aborda todos los problemas críticos identificados en la auditoría del sistema NUREA. Los problemas se organizan en 6 sprints, priorizando por criticidad y dependencias.

### Problemas Identificados por Módulo:

| Módulo | Problemas | Severidad |
|--------|-----------|-----------|
| **Base de Datos (RLS/Schema)** | Policies duplicadas, constraints faltantes, tablas duplicadas | 🔴 CRÍTICA |
| **Agenda/Reservas** | Race conditions, timezone, solapamientos | 🔴 CRÍTICA |
| **Chat** | RLS bloqueante, realtime sin verificar, errores silenciosos | 🔴 CRÍTICA |
| **Añadir Paciente** | Cache no invalidado, estado inconsistente | 🟠 ALTA |
| **Editar Perfil** | Mutate faltante, async mal manejado | 🟠 ALTA |
| **Estadísticas** | Cálculos incorrectos, filtrado cliente | 🟠 ALTA |
| **Tickets** | Status inconsistente, mensajes fallidos silenciosos | 🟠 ALTA |

---

## Prerequisites

- Acceso a Supabase Dashboard (para verificar migraciones)
- Permisos de ejecución en la DB
- Ambiente de desarrollo local funcional (`npm run dev`)

---

## Sprint 1: Limpieza de Base de Datos y RLS

**Goal**: Eliminar conflictos de políticas, unificar schema, agregar constraints faltantes
**Demo/Validation**: Verificar policies en Supabase Dashboard > Authentication > Policies

### Task 1.1: Crear Migración Unificada de RLS
- **Location**: `supabase/migrations/20260319_consolidate_rls_policies.sql`
- **Description**: Consolidar policies duplicadas para profiles, appointments, professionals
- **Acceptance Criteria**: `pg_policies` muestra 1 policy por tipo por tabla

### Task 1.2: Eliminar Tablas Duplicadas
- **Location**: `supabase/migrations/20260319_drop_duplicate_tables.sql`
- **Description**: Verificar y eliminar tabla `finances` (duplicado de `financial_transactions`)
- **Acceptance Criteria**: Solo existe `financial_transactions`

### Task 1.3: Agregar Constraints Faltantes
- **Location**: `supabase/migrations/20260319_add_missing_constraints.sql`
- **Description**: Agregar CHECK constraints y índices:
  - `appointments.check_future_date`
  - `appointments.check_duration`
  - `appointments.check_different_parties`
  - Índices compuestos

### Task 1.4: Consolidar Sistema de Chat
- **Location**: Análisis + migración
- **Description**: Elegir y migrar a un solo sistema (chat_messages vs messages)
- **Acceptance Criteria**: Un solo sistema activo con datos migrados

---

## Sprint 2: Corrección de Agenda/Reservas

**Goal**: Eliminar race conditions, corregir timezone, validar solapamientos
**Demo/Validation**: Crear 2 citas simultáneas para el mismo slot - solo 1 debe succeeder

### Task 2.1: Implementar Función RPC Atómica
- **Location**: `supabase/migrations/20260319_atomic_appointment_creation.sql`
- **Description**: Crear stored procedure `create_appointment_atomic` con verificación + insert atómico

### Task 2.2: Corregir API de Crear Cita para Usar RPC
- **Location**: `app/api/appointments/create/route.ts`
- **Description**: Reemplazar CHECK + INSERT por llamada RPC

### Task 2.3: Corregir Timezone en APIs y Helpers
- **Location**: `lib/utils/date-helpers.ts`, APIs de appointments
- **Description**: Estandarizar a UTC, usar timezone explícito

### Task 2.4: Corregir Reschedule para Validar Solapamientos
- **Location**: `app/api/appointments/reschedule/route.ts`
- **Description**: Usar tsrange para detectar solapamientos parciales

### Task 2.5: Eliminar Booking Modal Legacy
- **Location**: `components/booking-modal.tsx`
- **Description**: Marcar como deprecated, redirigir al flujo nuevo

---

## Sprint 3: Corrección de Chat

**Goal**: Chat funcional con realtime confiable y manejo de errores visible
**Demo/Validation**: Enviar mensaje entre 2 usuarios - aparece instantáneamente

### Task 3.1: Agregar Callback de Estado a Suscripciones Realtime
- **Location**: `hooks/use-chat.ts`
- **Description**: Verificar estado `SUBSCRIBED`, `CHANNEL_ERROR`, `TIMED_OUT`

### Task 3.2: Agregar Toast en useSendMessage
- **Location**: `hooks/use-chat.ts`
- **Description**: Notificar errores visiblemente al usuario

### Task 3.3: Verificar conversation_participants Antes de Insertar
- **Location**: `hooks/use-chat.ts`, `app/api/chat/conversations/route.ts`
- **Description**: Auto-unirse a conversación si no es participante

### Task 3.4: Manejar Errores en Marcar Leídos
- **Location**: `hooks/use-chat.ts`
- **Description**: Agregar try/catch en efecto de marcar como leído

### Task 3.5: Actualizar Componentes Chat para Sistema Unificado
- **Location**: `components/chat/*`, `components/messaging/health-chat.tsx`
- **Description**: Usar `use-chat.ts` en todos los componentes

---

## Sprint 4: Corrección de CRUD (Pacientes + Perfil)

**Goal**: Datos persistidos correctamente, cache sincronizado, errores visibles

### Task 4.1: Agregar Invalidación de Cache en Añadir Paciente
- **Location**: `components/calendar/modals/add-patient-modal.tsx`
- **Description**: `queryClient.invalidateQueries()` post-creación

### Task 4.2: Corregir Transacción en API Crear Paciente
- **Location**: `app/api/professional/patients/route.ts`
- **Description**: Rollback de auth user si falla profile

### Task 4.3: Agregar mutateProfile en Todos los Handlers
- **Location**: `app/dashboard/(main)/professional/profile/page.tsx`
- **Description**: Agregar `mutateProfile()` en onSaveGeneral, onSaveClinical, onSaveEducation, onSaveGallery

### Task 4.4: Await Notificaciones Admin en API Perfil
- **Location**: `app/api/professional/profile/route.ts`
- **Description**: Manejo correcto de async fetch

### Task 4.5: Usar useProfile Hook Consistentemente
- **Location**: `app/dashboard/(main)/professional/profile/page.tsx`
- **Description**: Reemplazar queries directas por hook

---

## Sprint 5: Corrección de Estadísticas y Tickets

**Goal**: Cálculos correctos, filtros en servidor, flujo de tickets completo

### Task 5.1: Corregir Bug Cálculo endOfMonth
- **Location**: `app/api/professional/income/route.ts`
- **Description**: Usar mes del parámetro, no `now`

### Task 5.2: Mover Filtrado de Fechas al Servidor
- **Location**: `hooks/use-professional-stats.ts`
- **Description**: Filtrar con `.eq('appointment_date', today)` en query

### Task 5.3: Corregir Double Count en Admin Dashboard
- **Location**: `app/dashboard/(main)/admin/page.tsx`
- **Description**: Usar Set para deduplicar pending doctors

### Task 5.4: Estandarizar Status de Tickets
- **Location**: Múltiples archivos
- **Description**: `closed` → `resolved`, verificar enum

### Task 5.5: Manejar Error Silencioso en Mensaje Inicial de Ticket
- **Location**: `app/api/support/tickets/route.ts`
- **Description**: Agregar nota al ticket si falla mensaje

### Task 5.6: Reemplazar alert() por toast en Support Page
- **Location**: `app/dashboard/support/page.tsx`
- **Description**: Usar `toast.success()` de sonner

---

## Sprint 6: Testing Integral

**Goal**: Verificar todos los flujos funcionan correctamente

### Task 6.1-6.7: Testing por Módulo
- Testing de Agenda/Reservas
- Testing de Chat
- Testing de CRUD Pacientes
- Testing de Perfil Profesional
- Testing de Estadísticas
- Testing de Tickets
- Verificación de RLS

---

## Testing Strategy

### Nivel 1: Smoke Tests (30 min)
- Login paciente/profesional/admin
- Crear cita básica
- Enviar mensaje chat
- Crear paciente
- Editar perfil

### Nivel 2: Functional Tests (1-2 horas)
- Todos los escenarios de Sprint 6
- Edge cases: horarios límite, timezone
- Error handling: network offline

---

## Potential Risks & Gotchas

1. **Migraciones Conflictivas**: Hacer backup antes, probar en staging
2. **Breaking Changes**: Mantener backward compatibility, actualizar juntos
3. **Datos Pre-existentes**: Limpiar antes de agregar constraints
4. **Realtime No Funciona**: Verificar Replication en Supabase Dashboard
5. **Timezone Múltiples Clientes**: UTC storage, mostrar local con indicador

---

## Rollback Plan

### Si Migración Falla:
```sql
-- Restaurar desde Supabase Dashboard
```

### Si Frontend No Funciona:
```bash
git checkout HEAD~1 -- app/ components/
```

---

## Archivos a Modificar

### Migraciones SQL (4 nuevas)
- `supabase/migrations/20260319_consolidate_rls_policies.sql`
- `supabase/migrations/20260319_drop_duplicate_tables.sql`
- `supabase/migrations/20260319_add_missing_constraints.sql`
- `supabase/migrations/20260319_atomic_appointment_creation.sql`

### APIs (7 archivos)
- `app/api/appointments/create/route.ts`
- `app/api/appointments/reschedule/route.ts`
- `app/api/professional/patients/route.ts`
- `app/api/professional/profile/route.ts`
- `app/api/professional/income/route.ts`
- `app/api/support/tickets/route.ts`
- `app/api/chat/conversations/route.ts`

### Hooks (2 archivos)
- `hooks/use-chat.ts`
- `hooks/use-professional-stats.ts`

### Componentes (8 archivos)
- `components/calendar/modals/add-patient-modal.tsx`
- `app/dashboard/(main)/professional/profile/page.tsx`
- `components/chat/chat-input.tsx`
- `components/chat/chat-interface.tsx`
- `components/messaging/health-chat.tsx`
- `components/ui/functional-chat.tsx`
- `app/dashboard/support/page.tsx`
- `app/dashboard/(main)/admin/page.tsx`

### Utils (1 archivo)
- `lib/utils/date-helpers.ts`

---

## Estimación de Tiempo

| Sprint | Tasks | Tiempo Est. |
|--------|-------|-------------|
| Sprint 1 | 4 | 45-60 min |
| Sprint 2 | 5 | 60-90 min |
| Sprint 3 | 5 | 45-60 min |
| Sprint 4 | 5 | 45-60 min |
| Sprint 5 | 6 | 45-60 min |
| Sprint 6 | 7 | 60-90 min |
| **Total** | **32** | **5-7 horas** |
