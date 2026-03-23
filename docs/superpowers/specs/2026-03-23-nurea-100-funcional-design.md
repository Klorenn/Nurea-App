# Spec: Nurea 100% Funcional — Bloques B y D

**Fecha:** 2026-03-23
**Estado:** v3 — corregido tras revisión de schema y layout existente

---

## Contexto

Nurea es una plataforma de telemedicina chilena. Para que un profesional pueda operar plenamente necesita:

1. **Verificación KYP** (`professionals.verification_status = 'verified'`) — aprobada por admin
2. **Suscripción activa** (`profiles.subscription_status = 'active'`) — activada por webhook MercadoPago

### Estado actual del sistema

El `ProfessionalLayout` en `app/dashboard/(main)/professional/layout.tsx` **ya existe** y ya verifica `subscription_status`. Comportamiento actual:
- `active` o `trialing` (con trial no expirado): permite todo
- `pending_approval`: permite todo (esperando aprobación del equipo)
- cualquier otro: bloquea solo `/chat` y `/patients` con un `SubscriptionPaywall` full-page

Lo que **falta**:
- El layout NO verifica `verification_status` (KYP) en absoluto
- El explore API (`/api/explore/route.ts` + RPC `search_professionals`) filtra por `verified = true` (KYP) pero NO filtra por `subscription_status = 'active'`
- No hay banners informativos para el profesional sobre su estado de activación

---

## Bloque B — Gate del Panel Profesional

### Objetivo
1. Agregar verificación KYP al layout profesional existente, con banners informativos contextuales
2. Actualizar el explore API para excluir profesionales sin suscripción activa

### Comportamiento del banner (nuevo)

El banner se muestra en la parte superior del dashboard profesional cuando el profesional no tiene acceso total. NO reemplaza el `SubscriptionPaywall` existente — lo complementa.

| verification_status | subscription_status | Banner mostrado |
|---|---|---|
| `verified` | `active` | Sin banner — acceso total |
| `verified` | `pending_approval` | "Tu suscripción está pendiente de aprobación del equipo" |
| `verified` | cualquier otro (`inactive`, `past_due`, etc.) | "Tu suscripción no está activa. [Activar →]" |
| `rejected` | cualquier cosa | "Tus credenciales fueron rechazadas: [verification_notes]. Puedes editar tu perfil y reenviar documentación." |
| `pending` o `under_review` | `active` | "Tus credenciales están en revisión. Serás notificado por email." |
| `pending` o `under_review` | cualquier otro | "Cuenta pendiente: completa la verificación de credenciales y activa tu suscripción." |

En todos los estados con banner: el profesional puede editar su perfil normalmente. No se bloquea ninguna página adicional (el `SubscriptionPaywall` existente ya bloquea chat/patients sin suscripción).

### Implementación

**1. Extender `ProfessionalLayout` existente** (`app/dashboard/(main)/professional/layout.tsx`):
- Agregar fetch de `professionals.verification_status` y `professionals.verification_notes` para el user actual
- Computar `bannerState` basado en la tabla de estados de arriba
- Renderizar `<ProfessionalAccessBanner state={bannerState} />` encima de `{children}` cuando corresponda
- Mantener intacta toda la lógica de `SubscriptionPaywall` existente

**2. Componente `ProfessionalAccessBanner`** (nuevo, en `components/professional/access-banner.tsx`):
- Banner no intrusivo (no full-page) en la parte superior del contenido
- Muestra ícono + mensaje + CTA opcional (link a precios o a perfil para reenviar docs)
- Props: `{ verificationStatus, subscriptionStatus, rejectionReason }`

**3. Explore API — filtro de suscripción**:
- Nueva migración SQL que actualice `search_professionals`:
  - Agregar `pr.slug TEXT` al `RETURNS TABLE` y al `SELECT` list (bug pre-existente: faltaba en el RPC)
  - Agregar filtro `profiles.subscription_status = 'active'` en **ambos** bloques del RPC: el COUNT sub-query y el RETURN QUERY
  - Este filtro es **siempre activo** (no parametrizable): en producción todos los profesionales visibles deben tener suscripción activa
- Actualizar `fallbackSearch()` en `/api/explore/route.ts`: agregar `.eq("profiles.subscription_status", "active")` sobre el join `profiles!inner` ya existente
- No usar post-filter en el route handler porque rompe `total_count` de paginación

---

## Bloque D — Errores de Build

### Objetivo
Asegurar que `npm run build` pasa limpiamente. El scope exacto se determina corriendo el build — no especular archivos específicos de antemano.

### Proceso
1. Correr `npm run build` y capturar todos los errores de TypeScript/compilación
2. Correr `npm run lint` y capturar errores de ESLint nivel `error` (no `warn`)
3. Corregir todos los errores que bloqueen el build
4. Errores de nivel `warn` pueden dejarse como `warn` en la config

### Criterio de aceptación
- `npm run build` pasa sin errores de TypeScript ni de compilación
- `npm run lint` no reporta ningún error de nivel `error` (warnings permitidos)

---

## Orden de implementación
1. **Bloque D** — build limpio como baseline
2. **Bloque B** — extend layout + banner + explore filter + migración SQL

---

## Validación
- `npm run build` pasa ✓
- Profesional con `verification_status = 'pending'` ve banner informativo en dashboard ✓
- Profesional con `verification_status = 'rejected'` ve banner con razón de rechazo ✓
- Profesional con `subscription_status = 'inactive'` ve banner "falta suscripción" + `SubscriptionPaywall` en chat/patients ✓
- Profesional con `verified + active` no ve ningún banner, acceso total ✓
- Profesional con `verified + active` aparece en `/explore` ✓
- Profesional con `verified` pero sin `active` NO aparece en `/explore` ✓
- Profesional no `verified` (aunque tenga suscripción) NO aparece en `/explore` ✓
