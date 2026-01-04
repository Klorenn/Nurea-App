# 🔧 Configuración Completa de Google Cloud Console para OAuth

## 📋 APIs y Servicios que Necesitas Habilitar

Para que Google OAuth funcione correctamente, necesitas habilitar las siguientes APIs en Google Cloud Console.

---

## 1️⃣ Habilitar APIs Necesarias

### Paso 1: Ir a Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Selecciona tu proyecto (o créalo si no tienes uno)

### Paso 2: Habilitar Google+ API (OAuth 2.0)

1. Ve a **APIs & Services** > **Library** (o **Biblioteca**)
2. Busca **"Google+ API"** o **"Google Identity Services API"**
3. Haz clic en el resultado
4. Haz clic en **Enable** (Habilitar)

> ⚠️ **Nota:** Google+ API está deprecada, pero aún se usa para OAuth. Si no la encuentras, busca **"Google Identity Services API"** o **"People API"**.

### Paso 3: Habilitar OAuth 2.0 API

1. En **APIs & Services** > **Library**
2. Busca **"OAuth 2.0 API"** o **"Identity Toolkit API"**
3. Haz clic en **Enable** (Habilitar)

### Paso 4: Verificar APIs Habilitadas

1. Ve a **APIs & Services** > **Enabled APIs** (APIs Habilitadas)
2. Deberías ver:
   - ✅ **Google+ API** (o Google Identity Services API)
   - ✅ **OAuth 2.0 API** (o Identity Toolkit API)

---

## 2️⃣ Configurar OAuth Consent Screen

### Paso 1: Ir a OAuth Consent Screen

1. En Google Cloud Console, ve a **APIs & Services** > **OAuth consent screen**

### Paso 2: Configurar la Pantalla de Consentimiento

#### Si es la primera vez:

1. Selecciona el tipo de usuario:
   - **External** (para usuarios fuera de tu organización) - Recomendado para apps públicas
   - **Internal** (solo para usuarios de tu organización)

2. Haz clic en **Create**

3. Completa el formulario:

   **App information:**
   - **App name:** `NUREA` (o el nombre que prefieras)
   - **User support email:** Tu email
   - **App logo:** (Opcional) Puedes subir un logo
   - **Application home page:** `https://tu-dominio.com` o `http://localhost:3000` (para desarrollo)
   - **Application privacy policy link:** `https://tu-dominio.com/legal/privacy` (si lo tienes)
   - **Application terms of service link:** `https://tu-dominio.com/legal/terms` (si lo tienes)
   - **Authorized domains:** Agrega tu dominio (ej: `vercel.app` o tu dominio personalizado)

   **Developer contact information:**
   - **Email addresses:** Tu email

4. Haz clic en **Save and Continue**

#### Scopes (Alcances):

1. En la sección **Scopes**, haz clic en **Add or Remove Scopes**
2. Selecciona los siguientes scopes:
   - ✅ `.../auth/userinfo.email` (Ver tu dirección de correo electrónico)
   - ✅ `.../auth/userinfo.profile` (Ver tu información de perfil personal)
   - ✅ `openid` (Asociar con tu cuenta de Google)

3. Haz clic en **Update** y luego **Save and Continue**

#### Test users (Solo si la app está en modo "Testing"):

1. Si tu app está en modo "Testing", agrega usuarios de prueba
2. Haz clic en **Add Users**
3. Agrega los emails de los usuarios que quieres que prueben la app
4. Haz clic en **Save and Continue**

#### Summary:

1. Revisa toda la información
2. Haz clic en **Back to Dashboard**

---

## 3️⃣ Crear OAuth 2.0 Client ID

### Paso 1: Ir a Credentials

1. Ve a **APIs & Services** > **Credentials**

### Paso 2: Crear OAuth Client ID

1. Haz clic en **+ CREATE CREDENTIALS** > **OAuth client ID**

2. Si es la primera vez, te pedirá configurar el OAuth consent screen (sigue los pasos anteriores)

3. Selecciona **Application type:**
   - **Web application**

4. Completa el formulario:

   **Name:**
   - `NUREA Web Client` (o el nombre que prefieras)

   **Authorized JavaScript origins:**
   - `http://localhost:3000` (para desarrollo)
   - `https://tu-proyecto.vercel.app` (para producción)
   - `https://tu-dominio.com` (si tienes dominio personalizado)

   **Authorized redirect URIs:**
   - `https://[TU-PROYECTO-SUPABASE].supabase.co/auth/v1/callback`
   - Ejemplo: `https://rhzanxzoqmbxptvxgnfj.supabase.co/auth/v1/callback`

5. Haz clic en **Create**

6. **IMPORTANTE:** Copia el **Client ID** y **Client Secret** que se muestran
   - ⚠️ El Client Secret solo se muestra una vez, guárdalo bien

---

## 4️⃣ Configurar en Supabase

### Paso 1: Ir a Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto

### Paso 2: Configurar Google Provider

1. Ve a **Authentication** > **Providers**
2. Busca **Google** y haz clic en el toggle para habilitarlo
3. Ingresa las credenciales:
   - **Client ID (for OAuth):** Pega el Client ID de Google Cloud Console
   - **Client Secret (for OAuth):** Pega el Client Secret de Google Cloud Console
4. Haz clic en **Save**

### Paso 3: Configurar Redirect URLs

1. Ve a **Authentication** > **URL Configuration**
2. En **Redirect URLs**, agrega:
   ```
   http://localhost:3000/api/auth/callback
   https://tu-proyecto.vercel.app/api/auth/callback
   ```
3. Haz clic en **Save**

---

## 5️⃣ Verificar Configuración

### Checklist Completo:

- [ ] **Google Cloud Console:**
  - [ ] Google+ API o Google Identity Services API habilitada
  - [ ] OAuth 2.0 API o Identity Toolkit API habilitada
  - [ ] OAuth consent screen configurado
  - [ ] OAuth 2.0 Client ID creado
  - [ ] Authorized redirect URI configurada (URL de Supabase)

- [ ] **Supabase:**
  - [ ] Google provider habilitado (toggle ON)
  - [ ] Client ID configurado
  - [ ] Client Secret configurado
  - [ ] Redirect URLs configuradas

- [ ] **Variables de Entorno:**
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` configurado
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurado
  - [ ] `NEXT_PUBLIC_SITE_URL` configurado

---

## 🔍 Troubleshooting

### Error: "redirect_uri_mismatch"

**Causa:** La URL en Google Cloud Console no coincide con la de Supabase

**Solución:**
1. Verifica que en Google Cloud Console tengas exactamente:
   ```
   https://[TU-PROYECTO].supabase.co/auth/v1/callback
   ```
2. No debe tener espacios, debe ser `https://` (no `http://`)

### Error: "access_denied"

**Causa:** OAuth consent screen no está configurado o la app está en modo Testing sin usuarios de prueba

**Solución:**
1. Ve a **OAuth consent screen** en Google Cloud Console
2. Completa toda la información requerida
3. Si está en modo "Testing", agrega tu email como usuario de prueba
4. O cambia a modo "In production" (requiere verificación de Google)

### Error: "invalid_client"

**Causa:** Client ID o Client Secret incorrectos

**Solución:**
1. Verifica que las credenciales en Supabase coincidan exactamente con las de Google Cloud Console
2. Asegúrate de no tener espacios extra al copiar/pegar

### La URL de Supabase se abre directamente

**Causa:** Google OAuth no está configurado correctamente o las APIs no están habilitadas

**Solución:**
1. Verifica que Google+ API esté habilitada
2. Verifica que OAuth consent screen esté configurado
3. Verifica que las credenciales estén correctas en Supabase
4. Asegúrate de que el toggle de Google esté ON en Supabase

---

## 📌 Resumen de APIs Necesarias

### APIs que DEBES habilitar:

1. ✅ **Google+ API** (o Google Identity Services API)
2. ✅ **OAuth 2.0 API** (o Identity Toolkit API)

### Configuración Requerida:

1. ✅ **OAuth Consent Screen** configurado
2. ✅ **OAuth 2.0 Client ID** creado con:
   - Authorized redirect URI: `https://[PROYECTO].supabase.co/auth/v1/callback`
3. ✅ **Supabase** configurado con Client ID y Client Secret

---

## 🎯 Pasos Rápidos (Resumen)

1. **Google Cloud Console:**
   - Habilitar Google+ API
   - Configurar OAuth consent screen
   - Crear OAuth 2.0 Client ID
   - Agregar redirect URI de Supabase

2. **Supabase:**
   - Habilitar Google provider
   - Ingresar Client ID y Client Secret
   - Configurar Redirect URLs

3. **Probar:**
   - Reiniciar servidor local
   - Probar login con Google

---

**¿Necesitas más ayuda?** Revisa también:
- `FIX_GOOGLE_OAUTH_ERROR.md` - Solución de errores comunes
- `GOOGLE_OAUTH_URLS.md` - Configuración de URLs

