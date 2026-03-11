-- =============================================================================
-- NUREA - Esquema de base de datos para Supabase (PostgreSQL)
-- Ejecutar en el SQL Editor del panel de Supabase.
-- =============================================================================

-- Extensión para UUIDs (ya suele estar activa en Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. TABLA: profiles (enlazada a auth.users)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'professional', 'admin')),
  date_of_birth DATE,
  avatar_url TEXT,
  phone TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Perfiles de usuario; id coincide con auth.users(id).';

-- -----------------------------------------------------------------------------
-- 2. TABLA: professionals (referencia a profiles)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.professionals (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  specialty TEXT,
  bio TEXT,
  university TEXT,
  location TEXT,
  consultation_type TEXT DEFAULT 'both' CHECK (consultation_type IN ('online', 'in-person', 'both')),
  consultation_price NUMERIC(12,2) DEFAULT 0,
  online_price NUMERIC(12,2) DEFAULT 0,
  in_person_price NUMERIC(12,2) DEFAULT 0,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT false,
  years_experience INTEGER DEFAULT 0,
  languages TEXT[] DEFAULT ARRAY['ES'],
  availability JSONB DEFAULT '{}',
  stellar_wallet TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.professionals IS 'Datos profesionales; id es el mismo que profiles.id.';

-- -----------------------------------------------------------------------------
-- 3. TABLA: appointments
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  type TEXT NOT NULL DEFAULT 'online' CHECK (type IN ('online', 'in-person')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  is_online BOOLEAN NOT NULL DEFAULT true,
  payment_status TEXT,
  price NUMERIC(12,2) DEFAULT 0,
  meeting_link TEXT,
  meeting_room_id TEXT,
  video_platform TEXT,
  meeting_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.appointments IS 'Citas entre paciente y profesional.';

-- Índices útiles para consultas por paciente, profesional y fecha
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_professional_id ON public.appointments(professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON public.appointments(appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- -----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Perfiles: lectura pública (para listados y perfiles de profesionales); edición solo el propio usuario
CREATE POLICY "profiles_select_all"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Professionals: lectura pública
CREATE POLICY "professionals_select_all"
  ON public.professionals FOR SELECT
  USING (true);

CREATE POLICY "professionals_update_own"
  ON public.professionals FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "professionals_insert_own"
  ON public.professionals FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Appointments: un paciente solo ve/crea sus propias citas; profesional ve las suyas
CREATE POLICY "appointments_select_own"
  ON public.appointments FOR SELECT
  USING (
    auth.uid() = patient_id
    OR auth.uid() = professional_id
  );

CREATE POLICY "appointments_insert_patient"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "appointments_update_own"
  ON public.appointments FOR UPDATE
  USING (
    auth.uid() = patient_id
    OR auth.uid() = professional_id
  )
  WITH CHECK (
    auth.uid() = patient_id
    OR auth.uid() = professional_id
  );

-- Cancelación: paciente o profesional pueden actualizar (p. ej. status a cancelled)
-- ya cubierto por appointments_update_own.

-- -----------------------------------------------------------------------------
-- 5. Trigger: mantener updated_at en profiles
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS professionals_updated_at ON public.professionals;
CREATE TRIGGER professionals_updated_at
  BEFORE UPDATE ON public.professionals
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS appointments_updated_at ON public.appointments;
CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 6. (Opcional) Trigger: crear perfil al registrar usuario en auth.users
-- Supabase no expone auth.users directamente; se suele crear el perfil desde
-- el backend tras signUp. Si usas Database Webhooks o Edge Functions, puedes
-- crear el perfil aquí. Este trigger se ejecuta en auth.users (schema auth).
-- En proyectos Supabase estándar, el perfil se crea desde la API tras signUp.
-- =============================================================================
