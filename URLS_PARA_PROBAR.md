# 🌐 URLs para Probar NUREA

## 🚀 Servidor Local

El servidor está corriendo en: **http://localhost:3000**

---

## 📍 Páginas Principales

### 🔐 Autenticación
- **Login**: http://localhost:3000/login
- **Registro**: http://localhost:3000/signup
- **Completar Perfil** (después de Google OAuth): http://localhost:3000/complete-profile
- **Verificar Email**: http://localhost:3000/verify-email

### 🧪 Verificación
- **Test Supabase**: http://localhost:3000/test-supabase
  - Prueba automática de todas las tablas y conexiones

### 👤 Dashboard de Paciente
- **Dashboard**: http://localhost:3000/dashboard
- **Citas**: http://localhost:3000/dashboard/appointments
- **Chat**: http://localhost:3000/dashboard/chat

### 👨‍⚕️ Dashboard de Profesional
- **Dashboard Profesional**: http://localhost:3000/professional/dashboard
- **Perfil**: http://localhost:3000/professional/profile
- **Reseñas**: http://localhost:3000/professional/reviews

### 🔍 Búsqueda
- **Buscar Profesionales**: http://localhost:3000/search
- **Perfil de Profesional**: http://localhost:3000/professionals/1

### 🏠 Páginas Públicas
- **Inicio**: http://localhost:3000/
- **404 (Error)**: http://localhost:3000/pagina-que-no-existe

---

## ✅ Flujo de Prueba Recomendado

### 1. Verificar Configuración
1. Ve a: **http://localhost:3000/test-supabase**
2. Verifica que todas las pruebas pasen ✅

### 2. Probar Registro con Google
1. Ve a: **http://localhost:3000/signup**
2. Haz clic en "Continuar con Google"
3. Completa la autenticación en Google
4. **Resultado esperado:** Redirige a `/complete-profile`

### 3. Completar Perfil
1. En `/complete-profile`, ingresa tu fecha de nacimiento
2. Haz clic en "Completar Registro"
3. **Resultado esperado:** Redirige a `/dashboard`

### 4. Probar Login con Google
1. Cierra sesión
2. Ve a: **http://localhost:3000/login**
3. Haz clic en "Continuar con Google"
4. **Resultado esperado:** Si el perfil está completo, va directo a `/dashboard`

### 5. Explorar la Aplicación
- Buscar profesionales: **http://localhost:3000/search**
- Ver perfil de profesional: **http://localhost:3000/professionals/1**
- Agendar consulta (desde el perfil del profesional)

---

## 🎯 Funcionalidades para Probar

### ✅ Autenticación
- [ ] Registro con email/password
- [ ] Registro con Google OAuth
- [ ] Login con email/password
- [ ] Login con Google OAuth
- [ ] Completar perfil con fecha de nacimiento
- [ ] Verificación de email

### ✅ Búsqueda y Filtros
- [ ] Buscar profesionales
- [ ] Filtrar por especialidad (tags)
- [ ] Sugerir nueva especialidad
- [ ] Ver tarjetas de profesionales
- [ ] Cambiar vista (grid/list)

### ✅ Perfil de Profesional
- [ ] Ver información del profesional
- [ ] Ver redes sociales
- [ ] Agendar consulta (modal)
- [ ] Seleccionar fecha y hora
- [ ] Confirmar cita

### ✅ Dashboard
- [ ] Ver estadísticas
- [ ] Ver citas
- [ ] Ver mensajes
- [ ] Ver notificaciones

---

## 🐛 Si Algo No Funciona

### Error: "Supabase not configured"
- Verifica que `.env.local` existe y tiene los valores correctos
- Reinicia el servidor

### Error: "relation does not exist"
- Ejecuta el SQL completo de `SUPABASE_COMPLETE_SETUP.md` en Supabase

### Error al registrarse con Google
- Verifica Google OAuth en Supabase Dashboard
- Verifica redirect URI en Google Cloud Console

### Página no carga
- Verifica que el servidor esté corriendo
- Revisa la consola del navegador para errores
- Revisa los logs del servidor en la terminal

---

## 📝 Notas

- El servidor se reinicia automáticamente cuando cambias archivos
- Los cambios en `.env.local` requieren reiniciar el servidor
- Usa la consola del navegador (F12) para ver errores
- Usa la terminal donde corre el servidor para ver logs del servidor

---

¡Disfruta probando NUREA! 🎉

