# 📍 Guía Visual: Dónde Encontrar Todo en Supabase Dashboard

## 🎯 Acceso Rápido

1. Ve a: **https://supabase.com/dashboard**
2. Selecciona tu proyecto (ej: "Website- María")

---

## 1️⃣ VERIFICAR EL TRIGGER (Función Automática)

### Ubicación:
**Menú Lateral** → **Database** → **Functions**

### Pasos:
1. Haz clic en **"Database"** en el menú lateral izquierdo
2. Haz clic en **"Functions"** (o "Funciones")
3. Busca la función llamada **`handle_new_user`**

### Si NO existe:
- Ve a **"SQL Editor"** (en el menú lateral)
- Copia y pega el SQL del archivo `FIX_SIGNUP_ISSUE.md`
- Haz clic en **"Run"** o presiona `Ctrl/Cmd + Enter`

---

## 2️⃣ VERIFICAR POLÍTICAS RLS (Permisos)

### Ubicación:
**Menú Lateral** → **Authentication** → **Policies**

### Pasos:
1. Haz clic en **"Authentication"** en el menú lateral
2. Haz clic en **"Policies"** (o "Políticas")
3. Selecciona la tabla **`profiles`** del dropdown
4. Deberías ver políticas como:
   - "Users can insert own profile"
   - "Users can view own profile"
   - "Anyone can view public profiles"
   - "Users can update own profile"

### Si NO existen:
- Ve a **"SQL Editor"**
- Ejecuta el SQL de políticas del archivo `FIX_SIGNUP_ISSUE.md`

---

## 3️⃣ VERIFICAR LA TABLA PROFILES

### Ubicación:
**Menú Lateral** → **Table Editor** → **profiles**

### Pasos:
1. Haz clic en **"Table Editor"** en el menú lateral
2. Selecciona **`profiles`** de la lista de tablas
3. Deberías ver columnas como:
   - `id`
   - `first_name`
   - `last_name`
   - `role`
   - `date_of_birth`
   - `email_verified`
   - etc.

### Si la tabla NO existe:
- Ve a **"SQL Editor"**
- Ejecuta el SQL completo de `SUPABASE_COMPLETE_SETUP.md`

---

## 4️⃣ VERIFICAR USUARIOS CREADOS

### Ubicación:
**Menú Lateral** → **Authentication** → **Users**

### Pasos:
1. Haz clic en **"Authentication"** en el menú lateral
2. Haz clic en **"Users"** (o "Usuarios")
3. Verás la lista de todos los usuarios registrados
4. Puedes hacer clic en un usuario para ver sus detalles

---

## 5️⃣ VER LOGS DE ERRORES

### Ubicación:
**Menú Lateral** → **Logs** → **Postgres Logs**

### Pasos:
1. Haz clic en **"Logs"** en el menú lateral
2. Haz clic en **"Postgres Logs"**
3. Busca errores relacionados con:
   - `handle_new_user`
   - `profiles`
   - `INSERT`

---

## 6️⃣ SQL EDITOR (Para Ejecutar Código)

### Ubicación:
**Menú Lateral** → **SQL Editor**

### Pasos:
1. Haz clic en **"SQL Editor"** en el menú lateral
2. Verás un editor de código
3. Pega el SQL que necesites ejecutar
4. Haz clic en **"Run"** (botón verde) o presiona `Ctrl/Cmd + Enter`

---

## 7️⃣ CONFIGURAR GOOGLE OAUTH

### Ubicación:
**Menú Lateral** → **Authentication** → **Providers**

### Pasos:
1. Haz clic en **"Authentication"** en el menú lateral
2. Haz clic en **"Providers"** (o "Proveedores")
3. Busca **"Google"** en la lista
4. Haz clic en el **toggle** para habilitarlo (debe estar verde/ON)
5. Ingresa:
   - **Client ID**: `668385245392-9ih5jbl2oiov0bvg1mpgp0p07oo1quar.apps.googleusercontent.com`
   - **Client Secret**: `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`
6. Haz clic en **"Save"**

---

## 8️⃣ VERIFICAR VARIABLES DE ENTORNO

### Ubicación:
**En tu proyecto local** → Archivo `.env.local` (en la raíz del proyecto)

### Pasos:
1. Abre tu proyecto en el editor de código
2. Busca el archivo `.env.local` en la raíz
3. Debe contener:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

### Para obtener las credenciales:
1. En Supabase Dashboard → **Settings** (icono de engranaje ⚙️)
2. Haz clic en **"API"**
3. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🎯 Resumen Visual del Menú Lateral

```
📊 Dashboard
📁 Table Editor          ← Ver tablas y datos
🔧 SQL Editor            ← Ejecutar código SQL
🔐 Authentication
   ├── Users             ← Ver usuarios
   ├── Providers         ← Configurar Google OAuth
   └── Policies          ← Ver políticas RLS
📊 Database
   └── Functions         ← Ver triggers/funciones
📋 Logs                  ← Ver errores
⚙️ Settings              ← Configuración general
```

---

## ❓ ¿Qué Verificar Primero?

**Si el registro no funciona, verifica en este orden:**

1. ✅ **Variables de entorno** (`.env.local`)
2. ✅ **Tabla `profiles` existe** (Table Editor)
3. ✅ **Trigger `handle_new_user` existe** (Database → Functions)
4. ✅ **Políticas RLS configuradas** (Authentication → Policies)
5. ✅ **Google OAuth habilitado** (Authentication → Providers)
6. ✅ **Logs de errores** (Logs → Postgres Logs)

---

## 🆘 Si No Encuentras Algo

1. **Trigger no existe**: Ejecuta el SQL del archivo `FIX_SIGNUP_ISSUE.md` en SQL Editor
2. **Políticas no existen**: Ejecuta el SQL de políticas en SQL Editor
3. **Tabla no existe**: Ejecuta TODO el SQL de `SUPABASE_COMPLETE_SETUP.md` en SQL Editor

