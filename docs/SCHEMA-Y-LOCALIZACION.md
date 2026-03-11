# Nurea – Esquema de base de datos y localización Chile

**Desarrollador principal:** Pau Andreu Koh Cuende  
**Plataforma:** Telemedicina (MVP).  
**Stack:** Next.js 14+, Supabase (PostgreSQL), Jitsi Meet.

---

## 1. Esquema de base de datos (Supabase)

El esquema principal está en `supabase/schema-nurea.sql`. Resumen:

### 1.1 `profiles`

- Enlazada a `auth.users(id)`.
- Campos: `first_name`, `last_name`, `role` (patient | professional | admin), `date_of_birth`, `avatar_url`, `phone`, `email_verified`, `created_at`, `updated_at`.

### 1.2 `professionals`

- Referencia a `profiles(id)`.
- Campos: `specialty`, `bio`, `consultation_type`, `online_price`, `in_person_price`, `availability` (JSONB), `rating`, `review_count`, `verified`, etc.
- En el código se usa también `registration_number` (RUT o número de registro médico); si no existe en tu proyecto, añade la columna en una migración.

### 1.3 `appointments`

- Relaciona **Pacientes** y **Profesionales**.
- Campos principales: `patient_id`, `professional_id`, `appointment_date`, `appointment_time`, `duration_minutes`, `type` (online | in-person), **`status`** (pending | confirmed | cancelled | completed), `payment_status`, `price`, `meeting_link`, `meeting_room_id`, `meeting_expires_at`, `created_at`, `updated_at`.

Flujo típico: Registro → Dashboard (próxima cita) → Videollamada (Jitsi).

---

## 2. Localización Chile

### 2.1 Zona horaria

- **Zona:** `America/Santiago`.
- Uso: formatear y comparar fechas/horas de citas y recordatorios.
- Utilidades en `lib/utils/chile.ts`: `formatInChileTimeZone()`, `nowInChile()`.

### 2.2 RUT

- En registro de **profesionales** se pide “Número de Registro Médico / RUT” (`registration_number`).
- Utilidades en `lib/utils/chile.ts`: `formatRut()`, `isValidRut()` (módulo 11).
- Formato mostrado: 12.345.678-9.

### 2.3 Idioma

- Interfaz en español (Chile) e inglés; Jitsi Meet configurado en español por defecto.

---

## 3. Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/auth` | Selección “Soy Paciente” / “Soy Profesional” |
| `/auth/register?role=patient\|professional` | Formulario de registro (UI con gap 20px, labels letter-spacing normal) |
| `/dashboard` | Dashboard paciente: próxima cita + botón **Entrar a Consulta** |
| `/dashboard/appointments` | Listado de citas; botón “Entrar a Consulta” para online |
| `/consulta/[appointmentId]` | Videollamada Jitsi (External API, sala Nurea-Cita-[id]-2026) |

---

## 4. Videollamada Jitsi

- **Script:** `https://meet.jit.si/external_api.js`
- **Sala:** `Nurea-Cita-[appointmentId]-2026` (generada en `lib/utils/jitsi.ts`).
- **Config:** español, `startWithAudioMuted: true`, interfaz minimalista (marcas de agua ocultas cuando el servidor lo permita).
- **Componente:** `components/video/JitsiMeeting.tsx`.
