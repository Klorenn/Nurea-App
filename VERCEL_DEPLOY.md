# 🚀 Guía de Deploy en Vercel - NUREA

## ⚡ Deploy Rápido en 5 Pasos

### 1️⃣ Preparar el Proyecto

Asegúrate de que tu proyecto esté en un repositorio Git (GitHub, GitLab, o Bitbucket).

```bash
# Si aún no has hecho commit
git add .
git commit -m "Ready for Vercel deployment"
git push
```

---

### 2️⃣ Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en **Add New Project**
3. Conecta tu repositorio (GitHub/GitLab/Bitbucket)
4. Vercel detectará automáticamente que es Next.js

---

### 3️⃣ Configurar Variables de Entorno

En la sección **Environment Variables** de Vercel, agrega:

#### Variables Obligatorias:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[TU-PROYECTO].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
NEXT_PUBLIC_SITE_URL=https://tu-proyecto.vercel.app
```

> ⚠️ **IMPORTANTE:** 
> - Reemplaza `[TU-PROYECTO]` con tu ID de proyecto de Supabase
> - `NEXT_PUBLIC_SITE_URL` se actualizará automáticamente después del primer deploy, pero puedes configurarlo manualmente
> - Marca estas variables para **Production**, **Preview**, y **Development**

#### Cómo encontrar tus credenciales:

**Supabase:**
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **Settings** > **API**
3. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### 4️⃣ Configurar URLs en Supabase

Después del primer deploy, Vercel te dará una URL como `https://tu-proyecto.vercel.app`.

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **Authentication** > **URL Configuration**
3. En **Redirect URLs**, agrega:

```
https://tu-proyecto.vercel.app/api/auth/callback
```

> ✅ Puedes tener múltiples URLs:
> - `http://localhost:3000/api/auth/callback` (desarrollo)
> - `https://tu-proyecto.vercel.app/api/auth/callback` (producción)

---

### 5️⃣ Deploy y Verificar

1. Haz clic en **Deploy** en Vercel
2. Espera a que termine el deploy (2-3 minutos)
3. Vercel te dará una URL como `https://tu-proyecto.vercel.app`
4. Actualiza `NEXT_PUBLIC_SITE_URL` en Vercel con esta URL
5. Actualiza la Redirect URL en Supabase con esta URL
6. Haz un **Redeploy** en Vercel

---

## 🔄 Actualizar Variables Después del Deploy

### Si cambias la URL de Vercel:

1. **Actualiza en Vercel:**
   - Ve a **Settings** > **Environment Variables**
   - Edita `NEXT_PUBLIC_SITE_URL` con la nueva URL
   - Guarda los cambios

2. **Actualiza en Supabase:**
   - Ve a **Authentication** > **URL Configuration**
   - Actualiza la Redirect URL con la nueva URL de Vercel

3. **Redeploy:**
   - Ve a **Deployments** en Vercel
   - Haz clic en los 3 puntos del último deployment
   - Selecciona **Redeploy**

---

## 🌐 Dominio Personalizado (Opcional)

### Configurar Dominio Personalizado:

1. En Vercel, ve a **Settings** > **Domains**
2. Agrega tu dominio personalizado
3. Sigue las instrucciones de DNS
4. Actualiza `NEXT_PUBLIC_SITE_URL` con tu dominio personalizado
5. Agrega la Redirect URL en Supabase: `https://tu-dominio.com/api/auth/callback`
6. Haz un redeploy

---

## ✅ Checklist de Deploy

- [ ] Repositorio conectado a Vercel
- [ ] Variables de entorno configuradas:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `NEXT_PUBLIC_SITE_URL`
- [ ] Deploy completado exitosamente
- [ ] URL de producción agregada en Supabase Redirect URLs
- [ ] Google OAuth probado y funcionando
- [ ] (Opcional) Dominio personalizado configurado

---

## 🔍 Troubleshooting

### Error: "Supabase not configured"

**Solución:** Verifica que las variables de entorno estén configuradas en Vercel y que hayas hecho redeploy.

### Error: "redirect_uri_mismatch"

**Solución:** Asegúrate de que la URL de Vercel esté en Supabase > Authentication > URL Configuration > Redirect URLs.

### Error: Variables no se actualizan

**Solución:** Después de cambiar variables de entorno, siempre haz un redeploy en Vercel.

---

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Next.js en Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Variables de Entorno en Vercel](https://vercel.com/docs/environment-variables)

---

**¿Problemas?** Revisa también:
- `GOOGLE_OAUTH_URLS.md` - Configuración completa de URLs
- `SUPABASE_SETUP.md` - Configuración de Supabase

