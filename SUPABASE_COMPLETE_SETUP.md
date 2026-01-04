# Configuración Completa de Supabase para NUREA

Este documento contiene TODO lo necesario para configurar Supabase desde cero.

## 📋 Tabla de Contenidos

1. [Configuración Inicial](#configuración-inicial)
2. [SQL Completo para Base de Datos](#sql-completo-para-base-de-datos)
3. [Configuración de Google OAuth](#configuración-de-google-oauth)
4. [Variables de Entorno](#variables-de-entorno)
5. [Verificación](#verificación)

---

## 🚀 Configuración Inicial

### Paso 1: Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Anota:
   - **URL del proyecto**: `https://xxxxx.supabase.co`
   - **anon key**: Desde Settings > API > Project API keys > `anon` `public`
   - **service_role key**: Desde Settings > API > Project API keys > `service_role` `secret` (⚠️ NO lo expongas en el frontend)

---

## 💾 SQL Completo para Base de Datos

Ejecuta este SQL completo en el **SQL Editor** de Supabase (puedes ejecutarlo todo de una vez):

```sql
-- ============================================
-- 1. TABLA DE PERFILES DE USUARIOS
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  role TEXT CHECK (role IN ('patient', 'professional', 'admin')) DEFAULT 'patient',
  date_of_birth DATE,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_email_verified_idx ON public.profiles(email_verified);

-- ============================================
-- 2. TABLA DE PROFESIONALES (Información adicional)
-- ============================================

CREATE TABLE IF NOT EXISTS public.professionals (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  specialty TEXT NOT NULL,
  specialties TEXT[], -- Array de especialidades
  license_number TEXT,
  education TEXT[],
  experience_years INTEGER,
  consultation_price INTEGER, -- Precio en CLP
  consultation_types TEXT[] DEFAULT ARRAY['online', 'in-person'], -- ['online', 'in-person']
  languages TEXT[] DEFAULT ARRAY['ES'], -- ['ES', 'EN', etc.]
  location TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Chile',
  availability JSONB, -- Horarios de disponibilidad
  verified BOOLEAN DEFAULT FALSE,
  rating_average DECIMAL(3,2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  total_patients_served INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. TABLA DE CITAS/APPOINTMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  type TEXT CHECK (type IN ('online', 'in-person')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
  price DECIMAL(10,2),
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded')) DEFAULT 'pending',
  meeting_link TEXT, -- Para consultas online
  address TEXT, -- Para consultas presenciales
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS appointments_patient_idx ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS appointments_professional_idx ON public.appointments(professional_id);
CREATE INDEX IF NOT EXISTS appointments_status_idx ON public.appointments(status);
CREATE INDEX IF NOT EXISTS appointments_date_idx ON public.appointments(appointment_date);

-- ============================================
-- 4. TABLA DE RESEÑAS/REVIEWS
-- ============================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(appointment_id) -- Una reseña por cita
);

CREATE INDEX IF NOT EXISTS reviews_professional_idx ON public.reviews(professional_id);
CREATE INDEX IF NOT EXISTS reviews_rating_idx ON public.reviews(rating);

-- ============================================
-- 5. TABLA DE MENSAJES/CHAT
-- ============================================

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS messages_sender_idx ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_receiver_idx ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS messages_appointment_idx ON public.messages(appointment_id);
CREATE INDEX IF NOT EXISTS messages_created_idx ON public.messages(created_at);

-- ============================================
-- 6. TABLA DE FAVORITOS
-- ============================================

CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(patient_id, professional_id) -- Un favorito único por paciente-profesional
);

CREATE INDEX IF NOT EXISTS favorites_patient_idx ON public.favorites(patient_id);

-- ============================================
-- 7. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. POLÍTICAS RLS PARA PROFILES
-- ============================================

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Los usuarios pueden ver perfiles públicos (para búsqueda)
CREATE POLICY "Anyone can view public profiles"
  ON public.profiles FOR SELECT
  USING (true);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Los usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 9. POLÍTICAS RLS PARA PROFESSIONALS
-- ============================================

-- Cualquiera puede ver profesionales (para búsqueda)
CREATE POLICY "Anyone can view professionals"
  ON public.professionals FOR SELECT
  USING (true);

-- Solo el profesional puede actualizar su información
CREATE POLICY "Professionals can update own info"
  ON public.professionals FOR UPDATE
  USING (auth.uid() = id);

-- Solo el profesional puede insertar su información
CREATE POLICY "Professionals can insert own info"
  ON public.professionals FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 10. POLÍTICAS RLS PARA APPOINTMENTS
-- ============================================

-- Los pacientes pueden ver sus propias citas
CREATE POLICY "Patients can view own appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() = patient_id);

-- Los profesionales pueden ver sus citas
CREATE POLICY "Professionals can view own appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() = professional_id);

-- Los pacientes pueden crear citas
CREATE POLICY "Patients can create appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- Los pacientes pueden actualizar sus citas (cancelar, etc.)
CREATE POLICY "Patients can update own appointments"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = patient_id);

-- Los profesionales pueden actualizar sus citas (confirmar, completar, etc.)
CREATE POLICY "Professionals can update own appointments"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = professional_id);

-- ============================================
-- 11. POLÍTICAS RLS PARA REVIEWS
-- ============================================

-- Cualquiera puede ver reseñas (públicas)
CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

-- Los pacientes pueden crear reseñas para sus citas completadas
CREATE POLICY "Patients can create reviews for own appointments"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = patient_id AND
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE appointments.id = reviews.appointment_id
      AND appointments.patient_id = auth.uid()
      AND appointments.status = 'completed'
    )
  );

-- Los pacientes pueden actualizar sus propias reseñas
CREATE POLICY "Patients can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = patient_id);

-- ============================================
-- 12. POLÍTICAS RLS PARA MESSAGES
-- ============================================

-- Los usuarios pueden ver mensajes donde son remitente o receptor
CREATE POLICY "Users can view own messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Los usuarios pueden enviar mensajes
CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Los usuarios pueden actualizar sus mensajes (marcar como leído, etc.)
CREATE POLICY "Users can update own messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

-- ============================================
-- 13. POLÍTICAS RLS PARA FAVORITES
-- ============================================

-- Los pacientes pueden ver sus favoritos
CREATE POLICY "Patients can view own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = patient_id);

-- Los pacientes pueden agregar favoritos
CREATE POLICY "Patients can add favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- Los pacientes pueden eliminar sus favoritos
CREATE POLICY "Patients can delete own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = patient_id);

-- ============================================
-- 14. FUNCIONES Y TRIGGERS
-- ============================================

-- Función para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función cuando se crea un nuevo usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para actualizar email_verified cuando se verifica el email
CREATE OR REPLACE FUNCTION public.handle_email_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at) THEN
    UPDATE public.profiles
    SET email_verified = TRUE, updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar email_verified
DROP TRIGGER IF EXISTS on_email_verified ON auth.users;
CREATE TRIGGER on_email_verified
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS DISTINCT FROM OLD.email_confirmed_at)
  EXECUTE FUNCTION public.handle_email_verification();

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at en todas las tablas
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_professionals_updated_at
  BEFORE UPDATE ON public.professionals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Función para actualizar rating promedio del profesional cuando se crea una reseña
CREATE OR REPLACE FUNCTION public.update_professional_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL;
  total_reviews_count INTEGER;
BEGIN
  -- Calcular rating promedio y total de reseñas
  SELECT 
    COALESCE(AVG(rating)::DECIMAL(3,2), 0.0),
    COUNT(*)
  INTO avg_rating, total_reviews_count
  FROM public.reviews
  WHERE professional_id = NEW.professional_id;

  -- Actualizar profesional
  UPDATE public.professionals
  SET 
    rating_average = avg_rating,
    total_reviews = total_reviews_count,
    updated_at = NOW()
  WHERE id = NEW.professional_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar rating cuando se crea/actualiza una reseña
DROP TRIGGER IF EXISTS on_review_created ON public.reviews;
CREATE TRIGGER on_review_created
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_professional_rating();

-- Trigger para actualizar rating cuando se elimina una reseña
DROP TRIGGER IF EXISTS on_review_deleted ON public.reviews;
CREATE TRIGGER on_review_deleted
  AFTER DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_professional_rating();

-- Función para actualizar total_patients_served cuando se completa una cita
CREATE OR REPLACE FUNCTION public.update_patients_served()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.professionals
    SET 
      total_patients_served = COALESCE(total_patients_served, 0) + 1,
      updated_at = NOW()
    WHERE id = NEW.professional_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar pacientes atendidos
DROP TRIGGER IF EXISTS on_appointment_completed ON public.appointments;
CREATE TRIGGER on_appointment_completed
  AFTER UPDATE ON public.appointments
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed'))
  EXECUTE FUNCTION public.update_patients_served();
```

---

## 🔐 Configuración de Google OAuth

### Paso 1: Configurar en Supabase

1. En el dashboard de Supabase, ve a **Authentication** > **Providers**
2. Habilita **Google**
3. Ingresa las credenciales:
   - **Client ID**: `668385245392-9ih5jbl2oiov0bvg1mpgp0p07oo1quar.apps.googleusercontent.com`
   - **Client Secret**: `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`
4. Guarda los cambios

### Paso 2: Configurar en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** > **Credentials**
4. Edita tu OAuth 2.0 Client ID
5. En **Authorized redirect URIs**, agrega:
   - `https://[TU-PROYECTO-SUPABASE].supabase.co/auth/v1/callback`
   - Puedes encontrar esta URL en Supabase: **Authentication** > **URL Configuration** > **Site URL**

---

## 🔑 Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui

# Site URL (para redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Opcional: Google OAuth (ya configurado en Supabase)
GOOGLE_CLIENT_ID=668385245392-9ih5jbl2oiov0bvg1mpgp0p07oo1quar.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### Cómo obtener las credenciales:

1. **NEXT_PUBLIC_SUPABASE_URL**: 
   - Ve a Settings > API en Supabase
   - Copia la "Project URL"

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**:
   - Ve a Settings > API en Supabase
   - Copia la "anon" "public" key

---

## ✅ Verificación

### 1. Verificar que las tablas se crearon

Ejecuta en el SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Deberías ver:
- `profiles`
- `professionals`
- `appointments`
- `reviews`
- `messages`
- `favorites`

### 2. Verificar que RLS está habilitado

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

Todas las tablas deben tener `rowsecurity = true`

### 3. Verificar que los triggers están creados

```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

Deberías ver varios triggers listados.

### 4. Probar el flujo completo

1. Reinicia el servidor: `npm run dev`
2. Ve a `/signup` y prueba:
   - Registro con email/password
   - Registro con Google
3. Verifica en Supabase:
   - **Authentication** > **Users**: Deberías ver el nuevo usuario
   - **Table Editor** > **profiles**: Deberías ver el perfil creado

---

## 📊 Estructura de Datos

### Profiles (Perfiles de Usuarios)
- Información básica de todos los usuarios (pacientes y profesionales)
- Se crea automáticamente al registrarse

### Professionals (Información de Profesionales)
- Información adicional solo para profesionales
- Especialidades, precios, ubicación, etc.

### Appointments (Citas)
- Relación entre pacientes y profesionales
- Estado, fecha, hora, tipo, precio

### Reviews (Reseñas)
- Reseñas de pacientes sobre profesionales
- Rating y comentario

### Messages (Mensajes)
- Sistema de chat entre pacientes y profesionales
- Solo disponible después de tener una cita

### Favorites (Favoritos)
- Profesionales guardados por pacientes

---

## 🚨 Notas Importantes

1. **Seguridad**:
   - ⚠️ NUNCA commitees `.env.local` al repositorio
   - ⚠️ NUNCA expongas el `service_role` key en el frontend
   - ✅ RLS está habilitado en todas las tablas
   - ✅ Las políticas protegen los datos de los usuarios

2. **Producción**:
   - Actualiza `NEXT_PUBLIC_SITE_URL` en producción
   - Agrega la URL de producción en Google Cloud Console
   - Configura el email SMTP en Supabase para emails de verificación

3. **Testing**:
   - Los usuarios de prueba de Google OAuth están configurados
   - Puedes crear usuarios de prueba en Supabase: Authentication > Users > Add User

---

## 🐛 Solución de Problemas

### Error: "relation does not exist"
- Verifica que ejecutaste todo el SQL
- Revisa que estás en el esquema `public`

### Error: "permission denied"
- Verifica que RLS está configurado correctamente
- Revisa las políticas RLS

### Error: "trigger does not exist"
- Algunos triggers pueden fallar si las tablas no existen
- Ejecuta el SQL en orden o ejecuta solo las partes que fallan

### Usuarios no se crean en profiles
- Verifica que el trigger `on_auth_user_created` existe
- Revisa los logs de Supabase: Logs > Postgres Logs

### Email de verificación no funciona
- Configura SMTP en Supabase: Settings > Auth > SMTP Settings
- O usa el servicio de email de Supabase (limitado)

---

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase SQL Functions](https://supabase.com/docs/guides/database/functions)

---

¡Listo! Con esto tienes todo configurado para que NUREA funcione completamente con Supabase. 🎉

