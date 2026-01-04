# 🚀 Guía Rápida de Configuración - NUREA

## ⚡ Configuración en 5 Pasos

### 1️⃣ Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Espera a que se complete la configuración (2-3 minutos)

### 2️⃣ Ejecutar SQL en Supabase

1. En Supabase, ve a **SQL Editor**
2. Abre el archivo `SUPABASE_COMPLETE_SETUP.md`
3. Copia TODO el SQL (desde `-- ============================================` hasta el final)
4. Pégalo en el SQL Editor
5. Haz clic en **Run** o presiona `Ctrl/Cmd + Enter`
6. ✅ Deberías ver "Success. No rows returned"

### 3️⃣ Configurar Google OAuth en Supabase

1. En Supabase, ve a **Authentication** > **Providers**
2. Busca **Google** y haz clic en el toggle para habilitarlo
3. Ingresa:
   - **Client ID**: `668385245392-9ih5jbl2oiov0bvg1mpgp0p07oo1quar.apps.googleusercontent.com`
   - **Client Secret**: `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`
4. Haz clic en **Save**

### 4️⃣ Configurar Variables de Entorno

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env.local
   ```

2. Obtén tus credenciales de Supabase:
   - Ve a **Settings** > **API** en Supabase
   - Copia la **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - Copia la **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Edita `.env.local` y reemplaza los valores:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-real-aqui
   ```

### 5️⃣ Configurar Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** > **Credentials**
4. Edita tu OAuth 2.0 Client ID
5. En **Authorized redirect URIs**, agrega:
   - `https://[TU-PROYECTO-SUPABASE].supabase.co/auth/v1/callback`
   - Para encontrar esta URL: Supabase > Authentication > URL Configuration

### 6️⃣ ¡Listo! Probar

```bash
npm run dev
```

Visita:
- `http://localhost:3000/login` - Prueba login con Google
- `http://localhost:3000/signup` - Prueba registro con Google

---

## ✅ Checklist de Verificación

- [ ] Proyecto creado en Supabase
- [ ] SQL ejecutado sin errores
- [ ] Google OAuth configurado en Supabase
- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Redirect URI agregado en Google Cloud Console
- [ ] Servidor corriendo sin errores
- [ ] Puedo registrarme con Google
- [ ] Puedo iniciar sesión con Google
- [ ] Se crea el perfil automáticamente
- [ ] Puedo completar mi perfil con fecha de nacimiento

---

## 🆘 ¿Algo no funciona?

### Error: "Supabase not configured"
- Verifica que `.env.local` existe y tiene los valores correctos
- Reinicia el servidor después de crear/editar `.env.local`

### Error: "redirect_uri_mismatch"
- Verifica que la URL en Google Cloud Console sea exactamente:
  `https://[TU-PROYECTO].supabase.co/auth/v1/callback`
- No debe tener trailing slash ni parámetros adicionales

### Error: "relation does not exist"
- Verifica que ejecutaste TODO el SQL
- Revisa que estás en el esquema `public` en Supabase

### Usuarios no se crean
- Verifica que el trigger `on_auth_user_created` existe
- Revisa los logs: Supabase > Logs > Postgres Logs

---

## 📚 Documentación Completa

Para más detalles, consulta:
- `SUPABASE_COMPLETE_SETUP.md` - Configuración completa y detallada
- `GOOGLE_OAUTH_SETUP.md` - Configuración específica de OAuth

---

¡Listo para empezar! 🎉

