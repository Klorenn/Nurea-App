# NUREA

> Plataforma de telemedicina que conecta pacientes y profesionales de la salud de forma simple, segura y humana. Pensada para Chile.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8)](https://tailwindcss.com/)

## Visión

NUREA es una plataforma de telemedicina y gestión de consultas que prioriza claridad, confianza y seguridad. Conecta pacientes con profesionales verificados, con **videollamadas integradas** (Jitsi Meet) y **pagos seguros** (Escrow vía Stellar) para que la experiencia sea fluida y confiable.

**Desarrollador principal:** Pau Andreu Koh Cuende · **Localización:** Chile (RUT, zona horaria America/Santiago).

---

## Características principales

### Para pacientes
- Búsqueda de profesionales por especialidad y ubicación (mapa + lista)
- Gestión de citas con recordatorios automáticos
- **Entrar a Consulta:** videollamada en el navegador (Jitsi, sala por cita)
- Mensajería segura con profesionales
- Pagos integrados y **Pago Seguro** (Escrow)
- Documentos médicos y sistema de favoritos y reseñas

### Para profesionales
- Dashboard con métricas y agenda
- Gestión de pacientes e historial clínico
- Videollamadas desde el mismo flujo de citas
- Seguimiento de ingresos y notificaciones
- Perfil verificable (especialidad, RUT/registro médico)

### Stack técnico
- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript (strict)
- **Estilos:** Tailwind CSS 4
- **Base de datos y auth:** Supabase (PostgreSQL + Auth)
- **UI:** Radix UI, shadcn/ui, Lucide, Framer Motion
- **Videollamada:** Jitsi Meet (External API), salas `Nurea-Cita-[id]-2026`
- **Pagos Escrow:** Stellar (Soroban) — ver [docs/ESCROW_SETUP.md](docs/ESCROW_SETUP.md)

---

## Inicio rápido

### Prerrequisitos
- Node.js 18+
- npm, yarn o pnpm
- Cuenta [Supabase](https://supabase.com)

### Instalación

```bash
git clone https://github.com/Klorenn/Nurea-App.git
cd Nurea-App

npm install
cp .env.example .env.local
```

Edita `.env.local` con tu proyecto Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Verificación y build

```bash
npm run verify    # tsc --noEmit (sin errores de tipos)
npm run build     # build de producción
npm run start     # servidor de producción
npm run lint      # ESLint
```

---

## Estructura del proyecto

```
├── app/
│   ├── api/              # API routes (auth, appointments, escrow, etc.)
│   ├── auth/             # Selección de rol y registro (Paciente/Profesional)
│   ├── consulta/[id]     # Página de videollamada Jitsi por cita
│   ├── dashboard/        # Panel paciente (citas, favoritos, documentos, etc.)
│   ├── professional/     # Panel profesional
│   ├── admin/            # Panel administración
│   └── search/           # Búsqueda con mapa y lista
├── components/
│   ├── ui/               # Componentes reutilizables (shadcn, inputs, etc.)
│   ├── video/            # JitsiMeeting (External API)
│   ├── Map.tsx           # Mapa de profesionales (Leaflet)
│   └── auth-form.tsx     # Formulario de login/registro condicional
├── lib/
│   ├── auth/             # Autenticación y autorización
│   ├── supabase/         # Clientes Supabase (client, server, middleware)
│   ├── utils/
│   │   ├── geo.ts        # Coordenadas ciudades Chile (mapa)
│   │   ├── chile.ts      # Zona horaria, RUT (formato y validación)
│   │   └── jitsi.ts      # Salas y URL Jitsi por cita
│   └── services/         # Stellar / Escrow
├── supabase/
│   ├── schema-nurea.sql  # Esquema de referencia
│   └── migrations/       # Migraciones (profiles, professionals, appointments, etc.)
├── docs/
│   ├── SCHEMA-Y-LOCALIZACION.md   # Esquema DB y Chile (RUT, timezone)
│   ├── TECHNICAL.md               # Stack, cron, deployment
│   ├── ESCROW_SETUP.md            # Configuración Escrow Stellar
│   └── VERCEL_ENV_CHECKLIST.md    # Variables en Vercel
└── types/                 # Tipos globales (p. ej. Jitsi)
```

---

## Base de datos (Supabase)

Esquema principal: **profiles** (auth.users), **professionals** (incl. `stellar_wallet`, `registration_number`), **appointments** (patient_id, professional_id, status, payment_status, is_online, appointment_date, etc.). RLS y políticas por rol.

- Referencia: [supabase/schema-nurea.sql](supabase/schema-nurea.sql) y [docs/SCHEMA-Y-LOCALIZACION.md](docs/SCHEMA-Y-LOCALIZACION.md)
- Blueprint ejecutable: [supabase/migrations/00_nurea_blueprint_core.sql](supabase/migrations/00_nurea_blueprint_core.sql)

---

## Autenticación y roles

- **Email + contraseña** (verificación de email)
- **Google OAuth**
- **Roles:** Paciente, Profesional, Administrador
- Registro condicional: “Soy Paciente” / “Soy Profesional” con campos específicos (especialidad, RUT/registro médico para profesionales)

---

## Videollamada (Jitsi)

- Componente: [components/video/JitsiMeeting.tsx](components/video/JitsiMeeting.tsx) (carga dinámica de `external_api.js`)
- Salas: `Nurea-Cita-[appointmentId]-2026`
- Config: español, micrófono muteado al entrar, interfaz minimalista
- Flujo: Dashboard → “Entrar a Consulta” → [app/consulta/[appointmentId]](app/consulta)

---

## Internacionalización y Chile

- Idiomas: español (por defecto) e inglés
- Zona horaria: `America/Santiago` ([lib/utils/chile.ts](lib/utils/chile.ts))
- RUT: formato y validación módulo 11 en registro de profesionales

---

## Documentación adicional

| Documento | Descripción |
|-----------|-------------|
| [docs/TECHNICAL.md](docs/TECHNICAL.md) | Stack, migraciones, cron, deployment |
| [docs/ESCROW_SETUP.md](docs/ESCROW_SETUP.md) | Configuración Escrow (Stellar) |
| [docs/VERCEL_ENV_CHECKLIST.md](docs/VERCEL_ENV_CHECKLIST.md) | Variables de entorno en Vercel |

---

## Licencia y contacto

Proyecto privado y propietario. Para soporte: soporte@nurea.app.

**NUREA** — Atención médica que se siente humana.
