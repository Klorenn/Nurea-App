# Checklist de variables de entorno para Vercel (Nurea)

Configura estas variables en el panel de Vercel (**Project → Settings → Environment Variables**) antes del despliegue.

---

## Script de verificación antes de subir

En local, antes de hacer push o deploy:

```bash
# Verificación rápida: TypeScript + ESLint (no genera build)
npm run verify

# Verificación completa: TypeScript + ESLint + build de Next.js
npm run verify:full
```

- **`tsc --noEmit`**: detecta errores de TypeScript sin generar salida.
- **`next lint`**: ejecuta el linter del proyecto.
- **`next build`**: compila la app (en `verify:full`).

**Nota:** Si `npm run verify` falla por errores de TypeScript, en `next.config.mjs` está `ignoreBuildErrors: true`, por lo que `next build` puede seguir pasando. Para producción estricta, corrige los errores de tipos y considera poner `ignoreBuildErrors: false`.

---

## Supabase

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima (pública) | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (solo backend; no exponer en cliente) | `eyJhbGciOi...` |

---

## Stellar / Soroban (Escrow)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NUREA_ADMIN_SECRET_KEY` | Clave secreta de la wallet admin Nurea (firma release/refund) | `S...` (Stellar secret) |
| `NEXT_PUBLIC_ESCROW_CONTRACT_ID` | ID del contrato de escrow desplegado en Soroban | `C...` |
| `NEXT_PUBLIC_ESCROW_TOKEN_ID` | ID del token (ej. USDC testnet) usado en el escrow | `C...` |
| `NEXT_PUBLIC_SOROBAN_RPC_URL` | (Opcional) RPC de Soroban; por defecto testnet | `https://soroban-testnet.stellar.org` |

---

## Resend (emails transaccionales)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `RESEND_API_KEY` | API key de Resend para envío de correos | `re_...` |
| `EMAIL_FROM` | (Opcional) Remitente; debe estar verificado en Resend | `NUREA <noreply@tudominio.com>` |

---

## URLs / App

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | (Opcional) URL base de la app en producción | `https://nurea.app` |

---

## Opcionales (según features)

- **Daily.co (videollamadas legacy):** `DAILY_API_KEY`, `DAILY_ROOM_DOMAIN` si sigues usando meeting rooms de Daily.
- **Cron / Webhooks:** Si usas Vercel Cron para recordatorios o notificaciones, las rutas bajo `app/api/cron/*` se ejecutan con las mismas env vars.

---

## Notas

1. Marca como **Production**, **Preview** o **Development** según corresponda.
2. No subas `.env.local` al repositorio; usa solo el panel de Vercel (o Vercel CLI con `vercel env`).
3. Tras cambiar variables, redeploy para que tomen efecto.
