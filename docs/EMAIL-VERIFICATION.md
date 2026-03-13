# Correo de verificación (Resend + Supabase)

## Cómo funciona ahora

- **Al registrarse**: Supabase envía el primer email de confirmación (usa SMTP si lo configuras en el dashboard).
- **"Reenviar email de verificación"** (página `/verify-email`): la app envía el correo **directamente con Resend** desde `notificaciones@nurea.app` usando la plantilla React Email, si tienes configurados `RESEND_API_KEY` y `SUPABASE_SERVICE_ROLE_KEY`. Si falta alguno, se usa el método de Supabase (`auth.resend()`), que depende de tener SMTP configurado en Supabase.

Para que **lleguen los correos** al hacer clic en "Reenviar", configura lo siguiente.

## 1. Resend

1. Cuenta en [resend.com](https://resend.com).
2. **API Key** en [resend.com/api-keys](https://resend.com/api-keys).
3. **Dominio verificado** en [resend.com/domains](https://resend.com/domains). Para el remitente oficial de seguridad usa `notificaciones@nurea.app` (dominio `nurea.app` verificado).

## 2. Variables de entorno

En `.env.local` (y en Vercel/producción):

| Variable | Uso |
|----------|-----|
| `RESEND_API_KEY` | Envío con Resend (verificación, recuperación, etc.). |
| `SUPABASE_SERVICE_ROLE_KEY` | Necesario para generar el enlace de verificación y enviarlo por Resend (solo backend). |
| `SECURITY_EMAIL_FROM` | **Obligatorio.** Remitente verificado en Resend (ej. `NUREA <notificaciones@nurea.app>`). El dominio debe estar verificado en el dashboard de Resend. |
| `NEXT_PUBLIC_SITE_URL` | Origen de la app (p. ej. `https://nurea.app`) para que el enlace de verificación apunte al callback correcto. |

Sin `SUPABASE_SERVICE_ROLE_KEY` o sin `RESEND_API_KEY`, el reenvío usa `supabase.auth.resend()` y depende del SMTP de Supabase (ver siguiente sección).

## 3. SMTP en Supabase (opcional)

Si quieres que **el primer email** (justo después del registro) también salga por Resend y no depender del envío por defecto de Supabase:

1. [Supabase Dashboard](https://supabase.com/dashboard) → tu proyecto → **Authentication** → **SMTP Settings**.
2. Activa **Custom SMTP**:
   - Host: `smtp.resend.com`
   - Port: `465`
   - User: `resend`
   - Password: tu **Resend API Key**
3. Sender email: un email de tu dominio verificado en Resend (p. ej. `notificaciones@nurea.app`).

Referencia: [Resend – Send with Supabase SMTP](https://resend.com/docs/send-with-supabase-smtp).

## 4. Resumen

- Para que **"Reenviar email de verificación"** envíe con Resend y llegue el correo: `RESEND_API_KEY` + `SUPABASE_SERVICE_ROLE_KEY` + `SECURITY_EMAIL_FROM` con dominio verificado en Resend.
- Textos y encoding de los mensajes de error de la API están en UTF-8 (sin `?` en lugar de tildes).
