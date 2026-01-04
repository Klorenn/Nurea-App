# 🔗 URLs para Configurar Google OAuth

## 📋 Configuración Completa: Local + Producción (Vercel)

Esta guía te ayudará a configurar Google OAuth tanto para desarrollo local como para producción en Vercel.

---

# 🏠 PARTE 1: Configuración para Desarrollo Local

### ⚡ Configuración Rápida para Local

Para que funcione en **localhost**, necesitas configurar URLs en **2 lugares**:

---

## 1️⃣ Configurar en Google Cloud Console

### Paso 1: Obtener tu URL de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **Authentication** > **URL Configuration**
3. Copia tu **Site URL** (ejemplo: `https://rhzanxzoqmbxptvxgnfj.supabase.co`)

### Paso 2: Agregar URL en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** > **Credentials**
4. Haz clic en tu **OAuth 2.0 Client ID** (o créalo si no existe)
5. En la sección **Authorized redirect URIs**, agrega:

#### ✅ URL OBLIGATORIA (Solo esta necesitas)

```
https://[TU-PROYECTO-SUPABASE].supabase.co/auth/v1/callback
```

**Ejemplo:**
```
https://rhzanxzoqmbxptvxgnfj.supabase.co/auth/v1/callback
```

> ⚠️ **IMPORTANTE:** 
> - Reemplaza `[TU-PROYECTO-SUPABASE]` con el ID de tu proyecto de Supabase
> - **NO necesitas agregar** `http://localhost:3000/api/auth/callback` aquí
> - Supabase maneja todo el flujo OAuth, por eso solo necesitas la URL de Supabase

---

## 2️⃣ Configurar en Supabase (Para Local)

### Paso 1: Configurar Redirect URLs en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **Authentication** > **URL Configuration**
3. En la sección **Redirect URLs**, agrega:

```
http://localhost:3000/api/auth/callback
```

4. Haz clic en **Save**

> ✅ Esto permite que Supabase redirija de vuelta a tu aplicación local después de la autenticación con Google.

---

## 📝 Resumen para Local

### ✅ URLs que necesitas configurar:

**1. En Google Cloud Console:**
```
https://[TU-PROYECTO-SUPABASE].supabase.co/auth/v1/callback
```

**2. En Supabase (Redirect URLs):**
```
http://localhost:3000/api/auth/callback
```

### 🔄 Flujo de Autenticación:

1. Usuario hace clic en "Continuar con Google" en `http://localhost:3000`
2. Se redirige a Supabase OAuth
3. Supabase redirige a Google para autenticación
4. Google redirige de vuelta a Supabase (`https://[PROYECTO].supabase.co/auth/v1/callback`)
5. Supabase redirige a tu app local (`http://localhost:3000/api/auth/callback`)
6. Tu app procesa el callback y redirige al usuario

---

## 📝 Cómo encontrar tu URL de Supabase

### Opción 1: Desde Authentication Settings
1. En Supabase Dashboard, ve a **Authentication** > **URL Configuration**
2. La **Site URL** es la que necesitas
3. Agrega `/auth/v1/callback` al final

### Opción 2: Desde Project Settings
1. En Supabase Dashboard, ve a **Settings** > **API**
2. Copia la **Project URL** (ejemplo: `https://xxxxx.supabase.co`)
3. Agrega `/auth/v1/callback` al final

---

## ✅ Verificación para Local

Después de configurar ambas URLs:

### 1. Verificar Google Cloud Console
- ✅ URL agregada: `https://[TU-PROYECTO].supabase.co/auth/v1/callback`
- ✅ Cambios guardados

### 2. Verificar Supabase
- ✅ Ve a **Authentication** > **Providers** > **Google**
- ✅ Asegúrate de que **Google** esté activado (toggle ON)
- ✅ Verifica que el **Client ID** y **Client Secret** estén correctos
- ✅ Ve a **Authentication** > **URL Configuration**
- ✅ Verifica que `http://localhost:3000/api/auth/callback` esté en **Redirect URLs**

### 3. Verificar Variables de Entorno

Asegúrate de que tu archivo `.env.local` tenga:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[TU-PROYECTO].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Probar el Flujo

1. Inicia tu servidor local:
   ```bash
   npm run dev
   ```

2. Ve a `http://localhost:3000/login` o `http://localhost:3000/signup`

3. Haz clic en **"Continuar con Google"**

4. Deberías:
   - ✅ Ser redirigido a Google para autenticarte
   - ✅ Después de autenticarte, volver a `http://localhost:3000/api/auth/callback`
   - ✅ Ser redirigido a `/complete-profile` (si es nuevo usuario) o `/dashboard` (si ya tiene perfil completo)

---

## 🔍 Troubleshooting

### Error: "redirect_uri_mismatch"
- **Causa:** La URL en Google Cloud Console no coincide exactamente con la de Supabase
- **Solución:** Verifica que la URL sea exactamente: `https://[TU-PROYECTO].supabase.co/auth/v1/callback`
- **Nota:** Debe ser `https://` (no `http://`) y debe terminar en `/auth/v1/callback`

### Error: "access_denied"
- **Causa:** Google OAuth no está habilitado en Supabase
- **Solución:** Ve a Supabase > Authentication > Providers y habilita Google

### Error: "invalid_client"
- **Causa:** El Client ID o Client Secret son incorrectos
- **Solución:** Verifica las credenciales en Supabase > Authentication > Providers > Google

---

## 📌 Resumen Rápido para Local

### URLs que necesitas configurar:

**1. Google Cloud Console:**
```
https://[TU-PROYECTO-SUPABASE].supabase.co/auth/v1/callback
```
📍 **Dónde:** Google Cloud Console > APIs & Services > Credentials > OAuth 2.0 Client ID > Authorized redirect URIs

**2. Supabase (Redirect URLs):**
```
http://localhost:3000/api/auth/callback
```
📍 **Dónde:** Supabase Dashboard > Authentication > URL Configuration > Redirect URLs

**Cómo encontrar tu URL de Supabase:**
- Supabase Dashboard > Authentication > URL Configuration > Site URL
- O: Supabase Dashboard > Settings > API > Project URL

---

## 🎯 Credenciales de Google OAuth

Si necesitas crear un nuevo OAuth Client ID en Google Cloud Console:

1. Ve a **APIs & Services** > **Credentials**
2. Haz clic en **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Selecciona **Web application**
4. Agrega la URL de redirect de Supabase
5. Copia el **Client ID** y **Client Secret**
6. Agrégalos en Supabase > Authentication > Providers > Google

---

---

# 🚀 PARTE 2: Configuración para Producción (Vercel)

## 📋 Configuración para Vercel

### ⚡ Pasos para Deploy en Vercel

---

## 1️⃣ Deploy en Vercel

### Paso 1: Conectar tu Repositorio

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Haz clic en **Add New Project**
3. Conecta tu repositorio de GitHub/GitLab/Bitbucket
4. Vercel detectará automáticamente que es un proyecto Next.js

### Paso 2: Configurar Variables de Entorno en Vercel

En la sección **Environment Variables** de Vercel, agrega:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[TU-PROYECTO].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
NEXT_PUBLIC_SITE_URL=https://tu-proyecto.vercel.app
```

> ⚠️ **IMPORTANTE:** 
> - Reemplaza `[TU-PROYECTO]` con tu ID de proyecto de Supabase
> - Reemplaza `tu-proyecto.vercel.app` con tu URL de Vercel (o tu dominio personalizado si lo tienes)
> - Marca estas variables como disponibles para **Production**, **Preview**, y **Development**

### Paso 3: Obtener tu URL de Vercel

Después del deploy, Vercel te dará una URL como:
- `https://tu-proyecto.vercel.app` (URL por defecto)
- O tu dominio personalizado si lo configuraste

**Anota esta URL**, la necesitarás para los siguientes pasos.

---

## 2️⃣ Configurar en Supabase (Producción)

### Paso 1: Agregar URL de Producción en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **Authentication** > **URL Configuration**
3. En la sección **Redirect URLs**, agrega:

```
https://tu-proyecto.vercel.app/api/auth/callback
```

> ✅ **Nota:** Puedes tener múltiples URLs aquí. Agrega tanto la de local como la de producción:
> - `http://localhost:3000/api/auth/callback` (desarrollo)
> - `https://tu-proyecto.vercel.app/api/auth/callback` (producción)

4. Si tienes un dominio personalizado, también agrégalo:
```
https://tu-dominio.com/api/auth/callback
```

5. Haz clic en **Save**

---

## 3️⃣ Configurar en Google Cloud Console (Producción)

### ✅ Ya está configurado

**¡Buenas noticias!** La URL de Supabase que ya agregaste en Google Cloud Console funciona tanto para local como para producción:

```
https://[TU-PROYECTO-SUPABASE].supabase.co/auth/v1/callback
```

> ✅ **No necesitas agregar** la URL de Vercel directamente en Google Cloud Console, porque Supabase maneja todo el flujo OAuth.

---

## 4️⃣ Verificar Configuración en Vercel

### Checklist de Variables de Entorno

Asegúrate de que en Vercel > Settings > Environment Variables tengas:

- ✅ `NEXT_PUBLIC_SUPABASE_URL` = `https://[TU-PROYECTO].supabase.co`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `tu-anon-key-aqui`
- ✅ `NEXT_PUBLIC_SITE_URL` = `https://tu-proyecto.vercel.app` (o tu dominio personalizado)

### Después de Agregar Variables

1. Ve a **Deployments** en Vercel
2. Haz clic en los **3 puntos** del último deployment
3. Selecciona **Redeploy**
4. Esto aplicará las nuevas variables de entorno

---

## 5️⃣ Probar en Producción

### Paso 1: Verificar el Deploy

1. Ve a tu URL de Vercel: `https://tu-proyecto.vercel.app`
2. Deberías ver tu aplicación funcionando

### Paso 2: Probar Google OAuth

1. Ve a `https://tu-proyecto.vercel.app/login` o `https://tu-proyecto.vercel.app/signup`
2. Haz clic en **"Continuar con Google"**
3. Deberías:
   - ✅ Ser redirigido a Google para autenticarte
   - ✅ Después de autenticarte, volver a `https://tu-proyecto.vercel.app/api/auth/callback`
   - ✅ Ser redirigido a `/complete-profile` (si es nuevo usuario) o `/dashboard` (si ya tiene perfil completo)

---

## 📌 Resumen para Producción (Vercel)

### URLs que necesitas configurar:

**1. Supabase (Redirect URLs):**
```
https://tu-proyecto.vercel.app/api/auth/callback
```
📍 **Dónde:** Supabase Dashboard > Authentication > URL Configuration > Redirect URLs

**2. Google Cloud Console:**
```
https://[TU-PROYECTO-SUPABASE].supabase.co/auth/v1/callback
```
📍 **Ya está configurado** - No necesitas cambiarlo

**3. Variables de Entorno en Vercel:**
```env
NEXT_PUBLIC_SITE_URL=https://tu-proyecto.vercel.app
```
📍 **Dónde:** Vercel Dashboard > Settings > Environment Variables

---

## 🔄 Configuración Completa (Local + Producción)

### URLs en Supabase (Redirect URLs):

Agrega **ambas** URLs en Supabase > Authentication > URL Configuration:

```
http://localhost:3000/api/auth/callback          (desarrollo)
https://tu-proyecto.vercel.app/api/auth/callback  (producción)
```

### URLs en Google Cloud Console:

Solo necesitas **una** URL (funciona para ambos entornos):

```
https://[TU-PROYECTO-SUPABASE].supabase.co/auth/v1/callback
```

### Variables de Entorno:

**Local (`.env.local`):**
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Vercel (Environment Variables):**
```env
NEXT_PUBLIC_SITE_URL=https://tu-proyecto.vercel.app
```

---

## 🔍 Troubleshooting para Producción

### Error: "redirect_uri_mismatch" en Producción

- **Causa:** La URL de producción no está en Supabase Redirect URLs
- **Solución:** Agrega `https://tu-proyecto.vercel.app/api/auth/callback` en Supabase > Authentication > URL Configuration

### Error: Variables de entorno no funcionan

- **Causa:** Las variables no están configuradas en Vercel o no se redeployó
- **Solución:** 
  1. Verifica que las variables estén en Vercel > Settings > Environment Variables
  2. Haz un redeploy del proyecto

### Error: La app redirige a localhost en producción

- **Causa:** `NEXT_PUBLIC_SITE_URL` no está configurado correctamente en Vercel
- **Solución:** Agrega `NEXT_PUBLIC_SITE_URL=https://tu-proyecto.vercel.app` en Vercel Environment Variables

---

## 🎯 Checklist Final para Vercel

- [ ] Proyecto deployado en Vercel
- [ ] Variables de entorno configuradas en Vercel:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `NEXT_PUBLIC_SITE_URL` (con URL de Vercel)
- [ ] URL de producción agregada en Supabase Redirect URLs
- [ ] Redeploy realizado en Vercel
- [ ] Google OAuth probado y funcionando en producción

---

**¿Necesitas ayuda?** Revisa los archivos:
- `SUPABASE_SETUP.md` - Configuración completa de Supabase
- `QUICK_START.md` - Guía rápida de configuración
- `CONFIGURACION_COMPLETE.md` - Configuración paso a paso

