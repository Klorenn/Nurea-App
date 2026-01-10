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
# Clonar repositorio
git clone <repository-url>
cd Nurea-App

# Instalar dependencias
npm install
# o
pnpm install

# Copiar variables de entorno
cp .env.example .env.local
```

### Variables de Entorno

Crear archivo `.env.local` con las siguientes variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Daily.co (opcional, para video calls)
DAILY_API_KEY=your-daily-api-key
DAILY_API_URL=https://api.daily.co/v1
DAILY_DOMAIN=your-daily-domain

# Resend (opcional, para emails)
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=NUREA <noreply@nurea.app>

# Feature Flags
ENABLE_PAYMENTS=false

# Vercel Cron (solo en producción)
CRON_SECRET=your-cron-secret-key

# App URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Ejecutar en Desarrollo

```bash
npm run dev
# o
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

### Seed de Datos

```bash
# Seed con datos realistas (profesionales, citas, reviews, documentos)
npm run seed:realistic

# Seed profesional de prueba
npm run seed:test-professional
```

## Migraciones de Base de Datos

Las migraciones SQL se encuentran en `supabase/migrations/`. Aplicar en este orden:

1. **Estructura base** (tablas principales)
   - `profiles`, `professionals`, `appointments`, `messages`, `reviews`, `documents`

2. **Campos de meeting** (`add_meeting_fields.sql`)
   - Agrega campos para video calls (meeting_link, meeting_room_id, etc.)

3. **Notificaciones** (`add_message_notification_trigger.sql`)
   - Crea tabla `message_notifications` y trigger para notificar nuevos mensajes

4. **Waitlist** (`create_waitlist_table.sql`)
   - Crea tabla para lista de espera

### Aplicar Migraciones

**Opción 1: Desde Supabase Dashboard (Recomendado)**
1. Ir a SQL Editor en Supabase Dashboard
2. Copiar contenido de cada archivo `.sql`
3. Ejecutar en orden

**Opción 2: Desde CLI (si tienes Supabase CLI)**
```bash
supabase db push
```

## Cron Jobs (Vercel)

Los cron jobs están configurados en `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/send-message-notifications",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### Endpoints de Cron

1. **`/api/cron/send-reminders`**
   - **Frecuencia**: Cada hora (`0 * * * *`)
   - **Función**: Envía recordatorios de citas 24h antes
   - **Auth**: Requiere `Authorization: Bearer ${CRON_SECRET}` en producción

2. **`/api/cron/send-message-notifications`**
   - **Frecuencia**: Cada 5 minutos (`*/5 * * * *`)
   - **Función**: Envía notificaciones por email de mensajes nuevos
   - **Auth**: Requiere `Authorization: Bearer ${CRON_SECRET}` en producción

### Configurar en Vercel

1. Ir a proyecto en Vercel Dashboard
2. Settings → Cron Jobs
3. Agregar cron jobs desde `vercel.json` o manualmente
4. Configurar `CRON_SECRET` en Environment Variables

## Flujos Principales

### 1. Crear Cita Online

**Ruta**: `POST /api/appointments/create`

**Flujo**:
1. Validar datos de entrada (fecha, hora, tipo)
2. Verificar autenticación del paciente
3. Validar disponibilidad del profesional
4. Verificar conflictos de horario
5. Crear cita en DB con status `pending`
6. Si es `online`, generar meeting room en Daily.co
7. Actualizar cita con `meeting_link` si se creó exitosamente
8. Crear mensaje inicial en chat del profesional al paciente
9. Enviar email de confirmación al paciente
10. Retornar cita creada

**Edge Cases Manejados**:
- Daily.co falla: cita se crea, meeting_link se puede generar después
- Email falla: cita se crea, no bloquea el flujo
- Mensaje falla: cita se crea, mensaje opcional

### 2. Cancelar Cita

**Ruta**: `POST /api/appointments/cancel`

**Flujo**:
1. Validar autenticación
2. Verificar que la cita existe y pertenece al usuario (paciente o profesional)
3. Verificar que no esté completada o ya cancelada
4. Calcular reembolso según política:
   - Si profesional cancela: reembolso completo siempre
   - Si paciente cancela: 100% >24h, 50% 12-24h, 0% <12h
5. Si es `online`, eliminar meeting room de Daily.co
6. Actualizar cita a status `cancelled`
7. Enviar email de cancelación al paciente
8. Retornar resultado

**Edge Cases Manejados**:
- No elimina room si cita pasó hace >24h (ya expiró)
- Maneja errores de Daily.co sin bloquear cancelación
- Email opcional, no bloquea cancelación

### 3. Generar Meeting Link

**Ruta**: `POST /api/appointments/[id]/meeting`

**Flujo**:
1. Validar autenticación
2. Verificar que la cita existe
3. Validar que sea tipo `online`
4. Validar que no esté cancelada
5. Validar que no haya pasado
6. Verificar si ya existe meeting_link válido (no expirado)
7. Si no existe o expiró, crear nuevo room en Daily.co
8. Guardar meeting_link en DB
9. Retornar meeting_link

**Edge Cases Manejados**:
- Race condition: verifica nuevamente antes de crear
- Room expirado: crea uno nuevo automáticamente
- Si DB update falla: elimina room creado

### 4. Reagendar Cita

**Ruta**: `POST /api/appointments/reschedule`

**Flujo**:
1. Validar autenticación y datos de entrada
2. Verificar que la cita existe y pertenece al paciente
3. Validar nueva fecha/hora (futuro, no conflictos)
4. Si es `online` y tiene meeting room, eliminarlo
5. Limpiar campos de meeting (meeting_link, meeting_room_id, etc.)
6. Actualizar fecha/hora, resetear status a `pending`
7. Retornar cita actualizada

### 5. Chat Posterior

**Flujo**:
1. Al crear cita, se crea mensaje inicial automático del profesional al paciente
2. Incluye detalles de la cita y meeting_link (si existe)
3. Mensajes subsecuentes se manejan en `/api/messages`
4. Notificaciones por email se procesan en cron job cada 5 minutos

## Estructura del Proyecto

```
Nurea-App/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── appointments/  # Endpoints de citas
│   │   ├── professionals/ # Endpoints de profesionales
│   │   ├── cron/         # Cron jobs
│   │   └── ...
│   ├── dashboard/        # Dashboard pages
│   ├── profesionales/    # Páginas públicas de profesionales
│   └── ...
├── components/           # Componentes React
│   ├── ui/              # Componentes base (Radix UI)
│   ├── appointments/    # Componentes de citas
│   ├── professionals/   # Componentes de profesionales
│   └── ...
├── lib/                 # Utilidades y helpers
│   ├── supabase/       # Clientes de Supabase
│   ├── services/       # Servicios externos (Daily, Email)
│   ├── utils/          # Utilidades generales
│   └── emails/         # Templates de emails
├── hooks/              # Custom React hooks
├── contexts/           # React Context providers
├── scripts/            # Scripts de seed y utilidades
├── supabase/
│   └── migrations/     # Migraciones SQL
└── public/            # Assets estáticos
```

## Seguridad

### Autenticación y Autorización
- **Auth**: Supabase Auth (JWT tokens)
- **RLS**: Row Level Security habilitado en todas las tablas
- **Validación de Roles**: Verificación de `role` (patient/professional/admin) en endpoints críticos

### Validaciones Implementadas
- Validación de ownership en endpoints por ID
- Sanitización de inputs de chat
- Validación de tipos de archivo en uploads
- Headers de seguridad en respuestas

### Feature Flags
- **`ENABLE_PAYMENTS`**: Controla funcionalidad de pagos
  - `false`: Pagos deshabilitados (simulado)
  - `true`: Pagos habilitados (requiere implementación de pasarela)

## Logging y Monitoreo

### Logging
- Console logs estructurados en endpoints críticos
- Logs de cron jobs con IDs únicos y duraciones
- Error logs con contexto completo

### Monitoreo (Recomendado)
- Vercel Analytics (integrado)
- Supabase Logs (Dashboard)
- Error tracking (Sentry, etc.)

## Testing

```bash
# Linting
npm run lint

# Type checking
npx tsc --noEmit
```

## Deployment

### Vercel (Recomendado)

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Configurar cron jobs desde `vercel.json`
4. Deploy automático en cada push a `main`

### Variables de Entorno en Producción

Asegurar que todas las variables estén configuradas:
- Supabase credentials
- Daily.co API key (si se usa)
- Resend API key (si se usa)
- CRON_SECRET
- ENABLE_PAYMENTS
- NEXT_PUBLIC_SITE_URL

## Troubleshooting

### Error: "Row Level Security policy violation"
- Verificar políticas RLS en Supabase Dashboard
- Usar `SUPABASE_SERVICE_ROLE_KEY` para operaciones administrativas

### Error: "Daily.co API key no configurada"
- Video calls seguirán funcionando pero sin generar rooms automáticos
- Se puede generar meeting link manualmente después

### Error: "Email service not configured"
- Emails no se enviarán pero el flujo continuará
- Configurar Resend API key para habilitar emails

### Cron Jobs no ejecutan
- Verificar configuración en Vercel Dashboard
- Verificar `CRON_SECRET` en Environment Variables
- Revisar logs en Vercel Functions

## Contribuir

1. Crear branch desde `main`
2. Implementar cambios
3. Ejecutar `npm run lint`
4. Crear PR con descripción clara
5. Esperar review y merge

## Licencia

[Especificar licencia del proyecto]
