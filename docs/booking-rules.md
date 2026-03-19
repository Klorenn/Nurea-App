# Reglas técnicas y validaciones obligatorias – Agendamiento NUREA

## 1. Estados de la cita (Appointment Status)

Definidos en Prisma como enum `AppointmentStatus`:

- **pending** – Creada pero aún no confirmada interacción
- **confirmed** – Conversación iniciada
- **completed** – Consulta realizada
- **cancelled** – Cancelada por paciente o profesional
- **no_show** – Paciente no asistió

No añadir nuevos estados sin migración explícita.

## 2. Prevención de doble reserva

- Validación en backend: transacción Prisma que comprueba `slot.isBooked === false` antes de actualizar.
- Verificación antes de crear la cita: dentro de la misma transacción.
- El slot se marca `isBooked: true` y se crea el appointment en un único `$transaction`.

## 3. Zona horaria

- Todas las citas y slots se almacenan en **UTC** (Prisma `DateTime`).
- La visualización se adapta a la zona del usuario (navegador o perfil).
- El profesional configura `timezone` (IANA, ej. `America/Santiago`) en su perfil; por defecto `America/Santiago`.

## 4. Permisos

- **Paciente**: ver disponibilidad, crear cita (solo para sí), acceder solo a sus citas.
- **Profesional**: gestionar disponibilidad, editar mensaje automático, ver sus citas.
- **Sistema**: crear conversación/mensaje automático tras reserva exitosa.

En `POST /api/calendar/book` se exige usuario autenticado y que `patientId` sea el id del usuario.

## 5. Mensaje automático

- Se envía **solo una vez** cuando la cita se creó correctamente y existe chat (paciente + profesional con Supabase).
- Se evita duplicado con el campo `Appointment.autoMessageSentAt` (se actualiza tras enviar).
- Si el profesional no configuró mensaje, se usa el mensaje por defecto del sistema.

## 6. Reglas de disponibilidad

- No permitir reservas en el pasado: en API de slots se filtran slots con `startTime > now` (UTC); en el calendario se deshabilitan fechas pasadas.
- Respetar la duración definida por el profesional (`slotDuration`).
- Respetar buffers entre citas: campo opcional `Professional.bufferMinutes` (por defecto 0).

## 7. Telemetría

Eventos registrados en `lib/analytics.ts`:

- `click_agendar` – Clic en Agendar (grid, perfil).
- `calendar_opened` – Se abrió el calendario con un profesional.
- `slot_selected` – El usuario eligió un horario.
- `appointment_created` – Cita creada correctamente.
- `chat_opened_after_booking` – Clic en "Ir al chat" tras confirmar.

En producción conectar a tu proveedor de analytics (PostHog, Mixpanel, GA4, etc.).
