# NUREA - Documentación Técnica

Documentación técnica para desarrolladores del proyecto NUREA.

## Stack Tecnológico

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19
- **Estilos**: Tailwind CSS 4
- **Componentes**: Radix UI
- **Animaciones**: Framer Motion
- **Validación**: Zod + React Hook Form
- **Estado**: React Hooks + Context API

### Backend
- **Runtime**: Next.js API Routes (Edge Runtime)
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Realtime**: Supabase Realtime (Presence API)
- **Storage**: Supabase Storage

### Servicios Externos
- **Video Calls**: Daily.co
- **Emails**: Resend / Supabase Email
- **Cron Jobs**: Vercel Cron
- **Hosting**: Vercel

### Herramientas
- **TypeScript**: 5.x
- **Linting**: ESLint
- **Package Manager**: npm / pnpm

## Setup Local

### Prerequisitos
- Node.js 20+
- npm, pnpm o yarn
- Cuenta de Supabase
- (Opcional) Cuenta de Daily.co para video calls
- (Opcional) Cuenta de Resend para emails

### Instalación

```bash
git clone <repository-url>
cd Nurea-App
npm install   # o pnpm install
cp .env.example .env.local
```

### Variables de Entorno

Ver `.env.example` y [VERCEL_ENV_CHECKLIST.md](./VERCEL_ENV_CHECKLIST.md) para la lista completa. Resumen mínimo para local:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Opcional: `DAILY_*`, `RESEND_*`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL`

### Ejecutar en Desarrollo

```bash
npm run dev   # o pnpm dev
```

### Seed de Datos

```bash
npm run seed:realistic
npm run seed:test-professional
```

## Migraciones de Base de Datos

Las migraciones están en `supabase/migrations/`. Aplicar desde **Supabase Dashboard → SQL Editor** (copiar y ejecutar cada `.sql` en orden) o con `supabase db push` si usas CLI.

Orden sugerido: estructura base → `add_meeting_fields.sql` → `add_message_notification_trigger.sql` → `create_waitlist_table.sql`. Si hay error de RLS en waitlist, ver los archivos `*FIX*WAITLIST*.sql` en la misma carpeta.

## Cron Jobs (Vercel)

Definidos en `vercel.json`. Endpoints: `/api/cron/send-reminders` (cada hora), `/api/cron/send-message-notifications` (cada 5 min). Requieren `CRON_SECRET` en producción.

## Estructura del Proyecto

```
app/          # App Router, API routes, páginas
components/   # UI, appointments, professionals, etc.
lib/          # supabase, services, utils, emails
hooks/        # Custom hooks
contexts/     # Providers
supabase/migrations/  # SQL
docs/         # Documentación (TECHNICAL, ESCROW_SETUP, VERCEL_ENV_CHECKLIST)
contracts/    # Contrato Soroban (escrow)
```

## Seguridad

- Auth: Supabase Auth (JWT). RLS habilitado en tablas.
- Validación de roles (patient/professional/admin) en endpoints críticos.
- Feature flag `ENABLE_PAYMENTS` para pagos.

## Deployment

Conectar repo a Vercel, configurar variables (ver [VERCEL_ENV_CHECKLIST.md](./VERCEL_ENV_CHECKLIST.md)) y cron jobs. Escrow: ver [ESCROW_SETUP.md](./ESCROW_SETUP.md).

## Troubleshooting

- **RLS violation**: Revisar políticas en Supabase; usar `SUPABASE_SERVICE_ROLE_KEY` para operaciones admin.
- **Daily.co / Resend no configurados**: Los flujos siguen; solo se desactivan video o email.
- **Cron no ejecuta**: Revisar `CRON_SECRET` y logs en Vercel.

## Contribuir

Branch desde `main`, cambios, `npm run lint`, PR.
