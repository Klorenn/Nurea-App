# Testing Checklist - NUREA App Bug Fixes

**Fecha**: 2026-03-19
**Versión**: Sprint 1-5 Completo

---

## Prerequisites

1. Ejecutar migraciones en Supabase Dashboard > SQL Editor:
   - `20260319_consolidate_rls_policies.sql`
   - `20260319_consolidate_finances.sql`
   - `20260319_add_constraints_and_indexes.sql`
   - `20260319_consolidate_chat_system.sql`
   - `20260319_atomic_appointment_functions.sql`

2. `npm run dev` corriendo en localhost:3000

---

## Test 1: Agenda / Reservas

### T1.1: Crear cita como paciente
- [ ] Login como paciente
- [ ] Ir a perfil de profesional
- [ ] Seleccionar fecha y hora disponible
- [ ] Completar formulario de reserva
- [ ] Verificar: Toast de éxito
- [ ] Verificar: Cita aparece en "Mis Citas"
- [ ] Verificar: Email de confirmación enviado

### T1.2: Crear cita como profesional
- [ ] Login como profesional
- [ ] Ir a calendario
- [ ] Crear nueva cita manualmente
- [ ] Verificar: Cita creada sin errores
- [ ] Verificar: Visible en dashboard paciente

### T1.3: Doble reserva (RACE CONDITION)
- [ ] Abrir 2 navegadores/incanadas
- [ ] Ambos como pacientes diferentes
- [ ] Ambos seleccionando el MISMO slot
- [ ] Submit simultáneo (máximo 1 segundo de diferencia)
- [ ] Verificar: Solo 1 cita creada, otro recibe error 409

### T1.4: Reschedule con solapamiento
- [ ] Login como profesional
- [ ] Seleccionar cita existente
- [ ] Reagendar a horario que se solapa con otra
- [ ] Verificar: Error "El nuevo horario se solapa con otra cita"
- [ ] Reagendar a horario adyacente (sin solapamiento)
- [ ] Verificar: Reschedule exitoso

### T1.5: Cancelar cita
- [ ] Login como paciente
- [ ] Ir a "Mis Citas"
- [ ] Seleccionar cita pendiente
- [ ] Cancelar cita
- [ ] Verificar: Estado cambia a "cancelled"
- [ ] Verificar: Slot disponible para otros

---

## Test 2: Chat

### T2.1: Enviar mensaje (paciente → profesional)
- [ ] Login como paciente
- [ ] Ir a chat con profesional
- [ ] Escribir y enviar mensaje
- [ ] Verificar: Toast de éxito (no error)
- [ ] Verificar: Mensaje aparece instantáneamente
- [ ] Verificar: Realtime funciona (abrir en otro navegador)

### T2.2: Enviar mensaje (profesional → paciente)
- [ ] Login como profesional
- [ ] Ir a chat
- [ ] Responder al paciente
- [ ] Verificar: Mensaje visible para paciente

### T2.3: Error de red al enviar
- [ ] Desconectar red
- [ ] Intentar enviar mensaje
- [ ] Verificar: Toast de error visible ("No se pudo enviar")
- [ ] Reconectar red
- [ ] Verificar: Mensaje no se perdió (se puede reintentar)

### T2.4: Marcar como leído
- [ ] Abrir conversación con mensajes no leídos
- [ ] Verificar: Contador de no leídos se actualiza
- [ ] En otro navegador, verificar que se marcó como leído

### T2.5: Estados de realtime
- [ ] Abrir DevTools > Console
- [ ] Observar logs de `[Chat]` al conectar
- [ ] Verificar: "Conversations channel status: SUBSCRIBED"
- [ ] Simular desconexión de red
- [ ] Verificar: Toast de "Conexión de chat perdida"

---

## Test 3: CRUD Pacientes

### T3.1: Crear paciente
- [ ] Login como profesional
- [ ] Ir a "Pacientes"
- [ ] Click en "Añadir Paciente"
- [ ] Llenar formulario (nombre, apellido, email)
- [ ] Submit
- [ ] Verificar: Toast de éxito
- [ ] Verificar: Paciente aparece en lista SIN polling (inmediato)
- [ ] Verificar: Datos correctos en DB

### T3.2: Crear paciente con email duplicado
- [ ] Intentar crear paciente con email ya existente
- [ ] Verificar: Error visible con mensaje claro
- [ ] Verificar: No se crea paciente duplicado

### T3.3: Validación de campos
- [ ] Enviar formulario vacío
- [ ] Verificar: Mensajes de error en campos requeridos
- [ ] Email inválido
- [ ] Verificar: Error "Email inválido"

---

## Test 4: Editar Perfil Profesional

### T4.1: Guardar información general
- [ ] Login como profesional
- [ ] Ir a "Mi Perfil"
- [ ] Editar biografía
- [ ] Click en guardar
- [ ] Verificar: Toast de éxito
- [ ] Recargar página
- [ ] Verificar: Datos persisten

### T4.2: Guardar horarios
- [ ] En "Mi Perfil" > Horarios
- [ ] Modificar un horario
- [ ] Guardar
- [ ] Verificar: Cambios se reflejan en slots disponibles
- [ ] Recargar página
- [ ] Verificar: Horarios persisten

### T4.3: Subir foto de perfil
- [ ] En "Mi Perfil"
- [ ] Subir nueva foto
- [ ] Verificar: Foto actualizada inmediatamente
- [ ] Recargar página
- [ ] Verificar: Foto persiste

### T4.4: Invalidación de cache (múltiples secciones)
- [ ] Editar información general → guardar
- [ ] Sin recargar, editar horarios → guardar
- [ ] Verificar: Ambos cambios persisten
- [ ] Recargar página
- [ ] Verificar: Todos los cambios intactos

---

## Test 5: Estadísticas

### T5.1: Dashboard profesional
- [ ] Login como profesional
- [ ] Ir a Dashboard
- [ ] Verificar: Contador de citas de hoy correcto
- [ ] Verificar: Ingresos del mes correctos

### T5.2: Filtro por mes específico
- [ ] En "Ingresos"
- [ ] Seleccionar mes = "Febrero 2026"
- [ ] Verificar: Datos corresponden a febrero
- [ ] Cambiar a mes actual
- [ ] Verificar: Datos diferentes (mes actual)

### T5.3: Admin - Pending doctors sin duplicados
- [ ] Login como admin
- [ ] Ir a Dashboard Admin
- [ ] Verificar: Contador de pending doctors
- [ ] Comparar con lista
- [ ] Verificar: Count = elementos únicos (no duplicados)

---

## Test 6: Tickets de Soporte

### T6.1: Crear ticket como paciente
- [ ] Login como paciente
- [ ] Ir a "Soporte"
- [ ] Click en "Nuevo Ticket"
- [ ] Llenar: Asunto, mensaje
- [ ] Submit
- [ ] Verificar: Toast de éxito (NO alert nativo)
- [ ] Verificar: Ticket aparece en lista

### T6.2: Crear ticket como profesional
- [ ] Login como profesional
- [ ] Ir a "Soporte"
- [ ] Crear ticket
- [ ] Verificar: Toast de éxito
- [ ] Verificar: Ticket visible

### T6.3: Status de tickets
- [ ] En lista de tickets admin
- [ ] Verificar: Solo statuses `open`, `in_progress`, `resolved`
- [ ] No debe aparecer `closed` (migrado a `resolved`)

### T6.4: Responder ticket (admin)
- [ ] Login como admin
- [ ] Ir a Centro de Soporte
- [ ] Seleccionar ticket abierto
- [ ] Enviar respuesta
- [ ] Verificar: Ticket cambia a "resuelto" o "en progreso"
- [ ] Login como usuario original
- [ ] Verificar: Respuesta visible

---

## Test 7: RLS / Seguridad

### T7.1: Paciente no ve citas de otros
- [ ] Login como Paciente A
- [ ] Verificar: Solo ve sus propias citas
- [ ] No debe ver citas de Paciente B

### T7.2: Profesional solo ve sus citas
- [ ] Login como Profesional A
- [ ] Verificar: Solo ve citas donde es el profesional
- [ ] No debe ver citas de Profesional B

### T7.3: Chat - solo participantes
- [ ] Usuario C no es participante de conversación
- [ ] Intentar insertar mensaje directo (via API)
- [ ] Verificar: Error 42501 (RLS denied)

### T7.4: Admin ve todo
- [ ] Login como admin
- [ ] Verificar: Acceso a todas las citas
- [ ] Verificar: Acceso a todos los chats
- [ ] Verificar: Acceso a dashboard de stats

---

## Bugs Conocidos (Pre-existentes, NO related a estos fixes)

- `app/api/payments/receipt/[id]/route.ts`: Buffer type error (pre-existente)
- `app/api/nura/radiology/route.ts`: `auth` property error (pre-existente)
- `components/analytics-client.tsx`: `default` property error (pre-existente)
- `lib/email-service.ts`: `from` type errors (pre-existente)

---

## Reporte de Bugs

### Si encuentras un bug:

1. Captura screenshot
2. Anota:
   - Fecha/hora
   - Navegador
   - Rol de usuario
   - Pasos para reproducir
   - Resultado esperado vs actual
3. Reporta en GitHub Issues

---

## Sign-off

| Test Suite | Tester | Fecha | Status |
|-----------|--------|-------|--------|
| T1: Agenda | | | |
| T2: Chat | | | |
| T3: CRUD Pacientes | | | |
| T4: Perfil | | | |
| T5: Estadísticas | | | |
| T6: Tickets | | | |
| T7: RLS | | | |

**Status Final**: [ ] PASS | [ ] FAIL
