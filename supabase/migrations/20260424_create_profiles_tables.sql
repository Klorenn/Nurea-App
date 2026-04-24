-- Create profiles table (base user data for Clerk auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  user_type TEXT CHECK (user_type IN ('professional', 'patient')) NOT NULL,
  full_name TEXT NOT NULL,
  rut TEXT UNIQUE NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT CHECK (gender IN ('masculino', 'femenino', 'no_binario', 'prefiero_no')) NOT NULL,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create professional_profiles table
CREATE TABLE IF NOT EXISTS professional_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL,
  license_number TEXT NOT NULL,
  license_file_url TEXT,
  office_location TEXT NOT NULL,
  phone TEXT NOT NULL,
  office_hours JSONB DEFAULT '{}',
  services TEXT[] DEFAULT '{}',
  insurance_accepted TEXT[] DEFAULT '{}',
  secondary_specialties TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create patient_profiles table
CREATE TABLE IF NOT EXISTS patient_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  allergies JSONB DEFAULT '{}',
  current_medications TEXT,
  family_medical_history TEXT,
  chronic_conditions TEXT[] DEFAULT '{}',
  reason_for_consultation TEXT NOT NULL,
  lifestyle_habits JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles table
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.jwt() ->> 'sub' = user_id)
  WITH CHECK (auth.jwt() ->> 'sub' = user_id);

-- Create RLS policies for professional_profiles table
CREATE POLICY "Users can read own professional profile" ON professional_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = professional_profiles.profile_id
      AND profiles.user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can update own professional profile" ON professional_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = professional_profiles.profile_id
      AND profiles.user_id = auth.jwt() ->> 'sub'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = professional_profiles.profile_id
      AND profiles.user_id = auth.jwt() ->> 'sub'
    )
  );

-- Create RLS policies for patient_profiles table
CREATE POLICY "Users can read own patient profile" ON patient_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = patient_profiles.profile_id
      AND profiles.user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can update own patient profile" ON patient_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = patient_profiles.profile_id
      AND profiles.user_id = auth.jwt() ->> 'sub'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = patient_profiles.profile_id
      AND profiles.user_id = auth.jwt() ->> 'sub'
    )
  );
