-- =============================================================================
-- NUREA – Blueprint Core Schema (Supabase/PostgreSQL)
-- Telemedicina premium con pagos Escrow (Stellar). Ejecutar en SQL Editor.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. profiles (conectado a auth.users)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'patient'
    CHECK (role IN ('patient', 'professional', 'admin')),
  date_of_birth DATE,
  avatar_url TEXT,
  phone TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Perfiles de usuario; id = auth.users(id).';

-- -----------------------------------------------------------------------------
-- 2. professionals (referencia a profiles; incluye stellar_wallet para Escrow)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.professionals (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  specialty TEXT,
  bio TEXT,
  university TEXT,
  location TEXT,
  consultation_type TEXT DEFAULT 'both'
    CHECK (consultation_type IN ('online', 'in-person', 'both')),
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
  registration_number TEXT,
  registration_institution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.professionals IS 'Datos profesionales; stellar_wallet para Pago Seguro (Escrow).';
COMMENT ON COLUMN public.professionals.stellar_wallet IS 'Billetera Stellar para recibir pagos en escrow.';
COMMENT ON COLUMN public.professionals.registration_number IS 'RUT o número de registro médico (Chile).';

-- -----------------------------------------------------------------------------
-- 3. appointments (patient_id, professional_id, status, payment_status, is_online, appointment_date)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  type TEXT NOT NULL DEFAULT 'online'
    CHECK (type IN ('online', 'in-person')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  is_online BOOLEAN NOT NULL DEFAULT true,
  payment_status TEXT
    CHECK (payment_status IS NULL OR payment_status IN ('pending', 'paid', 'refunded', 'held_escrow')),
  price NUMERIC(12,2) DEFAULT 0,
  meeting_link TEXT,
  meeting_room_id TEXT,
  video_platform TEXT,
  meeting_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.appointments IS 'Citas entre paciente y profesional.';
COMMENT ON COLUMN public.appointments.payment_status IS 'held_escrow = Pago Seguro (fondos retenidos hasta completar consulta).';

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_professional_id ON public.appointments(professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON public.appointments(appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- -----------------------------------------------------------------------------
-- 4. RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "professionals_select_all" ON public.professionals FOR SELECT USING (true);
CREATE POLICY "professionals_update_own" ON public.professionals FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "professionals_insert_own" ON public.professionals FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "appointments_select_own" ON public.appointments FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() = professional_id);
CREATE POLICY "appointments_insert_patient" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "appointments_update_own" ON public.appointments FOR UPDATE
  USING (auth.uid() = patient_id OR auth.uid() = professional_id)
  WITH CHECK (auth.uid() = patient_id OR auth.uid() = professional_id);

-- -----------------------------------------------------------------------------
-- 5. Triggers updated_at
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS professionals_updated_at ON public.professionals;
CREATE TRIGGER professionals_updated_at BEFORE UPDATE ON public.professionals
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

DROP TRIGGER IF EXISTS appointments_updated_at ON public.appointments;
CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
