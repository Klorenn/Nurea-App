# 🔧 Solucionar Error: "Unsupported provider: provider is not enabled"

## ❌ Error

```
{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}
```

Este error significa que **Google OAuth no está habilitado** en Supabase.

---

## ✅ Solución Paso a Paso

### 1️⃣ Habilitar Google OAuth en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. En el menú lateral, ve a **Authentication**
3. Haz clic en **Providers**
4. Busca **Google** en la lista de proveedores
5. Haz clic en el **toggle** para habilitarlo (debe estar en verde/ON)

### 2️⃣ Configurar Credenciales de Google

Después de habilitar Google, necesitas ingresar las credenciales:

#### Opción A: Si ya tienes credenciales de Google

1. En la sección de Google, verás campos para:
   - **Client ID (for OAuth)**
   - **Client Secret (for OAuth)**

2. Ingresa las credenciales:
   ```
   Client ID: 668385245392-9ih5jbl2oiov0bvg1mpgp0p07oo1quar.apps.googleusercontent.com
   Client Secret: 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
   ```

3. Haz clic en **Save**

#### Opción B: Si necesitas crear nuevas credenciales

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** > **Credentials**
4. Haz clic en **+ CREATE CREDENTIALS** > **OAuth client ID**
5. Selecciona **Web application**
6. En **Authorized redirect URIs**, agrega:
   ```
   https://[TU-PROYECTO-SUPABASE].supabase.co/auth/v1/callback
   ```
7. Haz clic en **Create**
8. Copia el **Client ID** y **Client Secret**
9. Pégalos en Supabase > Authentication > Providers > Google
10. Haz clic en **Save**

### 3️⃣ Verificar Configuración

Asegúrate de que:

- ✅ El toggle de Google esté **ON** (verde)
- ✅ El **Client ID** esté ingresado
- ✅ El **Client Secret** esté ingresado
- ✅ Los cambios estén **guardados** (botón Save)

### 4️⃣ Configurar Redirect URLs (Si aún no lo has hecho)

1. En Supabase, ve a **Authentication** > **URL Configuration**
2. En **Redirect URLs**, agrega:
   ```
   http://localhost:3000/api/auth/callback
   ```
3. Si ya tienes deploy en Vercel, también agrega:
   ```
   https://tu-proyecto.vercel.app/api/auth/callback
   ```
4. Haz clic en **Save**

### 5️⃣ Reiniciar el Servidor Local

Si estás probando en local:

```bash
# Detén el servidor (Ctrl+C)
npm run dev
```

### 6️⃣ Probar Nuevamente

1. Ve a `http://localhost:3000/login` o `http://localhost:3000/signup`
2. Haz clic en **"Continuar con Google"**
3. Deberías ser redirigido a Google para autenticarte

---

## 🔍 Verificación Adicional

### Verificar en Supabase Dashboard

1. Ve a **Authentication** > **Providers**
2. Verifica que Google tenga:
   - ✅ Toggle **ON** (verde)
   - ✅ **Client ID** configurado
   - ✅ **Client Secret** configurado
   - ✅ Estado: **Enabled**

### Verificar Variables de Entorno

Asegúrate de que tu `.env.local` tenga:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[TU-PROYECTO].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🚨 Errores Comunes

### Error: "Invalid client credentials"

**Causa:** El Client ID o Client Secret son incorrectos

**Solución:**
1. Verifica que las credenciales estén correctamente copiadas (sin espacios)
2. Si creaste nuevas credenciales en Google Cloud Console, asegúrate de usarlas en Supabase

### Error: "redirect_uri_mismatch"

**Causa:** La URL de redirect no está configurada correctamente

**Solución:**
1. En Google Cloud Console, verifica que tengas:
   ```
   https://[TU-PROYECTO].supabase.co/auth/v1/callback
   ```
2. En Supabase, verifica que tengas:
   ```
   http://localhost:3000/api/auth/callback
   ```

### Error: El toggle no se activa

**Causa:** Faltan las credenciales

**Solución:**
1. Primero ingresa el **Client ID** y **Client Secret**
2. Luego activa el toggle
3. Haz clic en **Save**

---

## 📋 Checklist de Verificación

- [ ] Google OAuth está habilitado en Supabase (toggle ON)
- [ ] Client ID está configurado en Supabase
- [ ] Client Secret está configurado en Supabase
- [ ] Cambios guardados en Supabase
- [ ] Redirect URLs configuradas en Supabase
- [ ] URL de Supabase agregada en Google Cloud Console
- [ ] Variables de entorno configuradas correctamente
- [ ] Servidor reiniciado (si es local)

---

## 🎯 Pasos Rápidos (Resumen)

1. **Supabase** > **Authentication** > **Providers** > **Google**
2. Activa el **toggle** (ON)
3. Ingresa **Client ID** y **Client Secret**
4. Haz clic en **Save**
5. Verifica **Redirect URLs** en **URL Configuration**
6. Reinicia tu servidor
7. Prueba nuevamente

---

**¿Sigue sin funcionar?** 

1. Verifica que las credenciales de Google sean correctas
2. Asegúrate de que la URL de Supabase esté en Google Cloud Console
3. Verifica que las variables de entorno estén correctas
4. Revisa la consola del navegador para más detalles del error

