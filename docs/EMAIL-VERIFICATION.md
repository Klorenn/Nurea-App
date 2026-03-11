# Correo de verificación (Resend + Supabase)

Para que los usuarios reciban el email de verificación al registrarse (y al usar "Reenviar email" en `/verify-email`), Supabase debe enviar los correos a través de un SMTP configurado. Resend es la opción recomendada.

## 1. Resend

1. Crea cuenta en [resend.com](https://resend.com).
2. Crea una **API Key** en [resend.com/api-keys](https://resend.com/api-keys).
3. Verifica tu **dominio** en [resend.com/domains](https://resend.com/domains) (para producción; en desarrollo puedes usar el dominio de prueba de Resend).
4. En tu proyecto, añade en `.env.local`:
   - `RESEND_API_KEY=re_...` (para envíos desde la app, p. ej. confirmación de citas).
   - `EMAIL_FROM=NUREA <noreply@tudominio.com>` (dominio verificado en Resend).

## 2. SMTP en Supabase (emails de auth)

Los emails de **confirmación de cuenta** y **reenviar verificación** los envía Supabase. Para que salgan por Resend:

1. En [Supabase Dashboard](https://supabase.com/dashboard) → tu proyecto → **Authentication** → **Email Templates** (o **SMTP Settings** según la versión).
2. Activa **Custom SMTP** y usa:

   | Campo     | Valor              |
   |----------|---------------------|
   | Host     | `smtp.resend.com`   |
   | Port     | `465`               |
   | User     | `resend`            |
   | Password | Tu **Resend API Key** |

3. Configura el remitente (Sender email) con un email de tu dominio verificado en Resend (p. ej. `noreply@tudominio.com`).
4. Guarda los cambios.

Referencia: [Resend – Send with Supabase SMTP](https://resend.com/docs/send-with-supabase-smtp).

## 3. Comportamiento en la app

- **Registro**: al hacer `signUp`, Supabase envía el email de confirmación usando el SMTP configurado (Resend).
- **Página “Verifica tu email”** (`/verify-email`): el botón "Reenviar email de verificación" llama a `POST /api/auth/resend-verification`. Ese endpoint usa la sesión actual y pide a Supabase que reenvíe el correo (también vía Resend si el SMTP está configurado).
- **Tras hacer clic en el enlace**: el usuario llega a tu sitio (p. ej. `/verify-email` con tokens en la URL); Supabase confirma el email y la sesión queda verificada.

Si no configuras SMTP en Supabase, los correos de auth pueden no llegarse a enviar o tener límites muy bajos; con Resend SMTP funcionan la verificación inicial y el reenvío.
