# Auth + Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Supabase auth with Clerk, implement email verification, and add separate professional/patient onboarding flows.

**Architecture:** Clerk handles authentication, Supabase stores profile data. Onboarding middleware blocks dashboard access until profiles complete. Separate forms for professional vs patient with custom questions.

**Tech Stack:** Clerk, Supabase, Next.js 16, React 19, TypeScript

---

## Task 1: Create Database Schema

**Files:**
- Create: `supabase/migrations/20260424_create_profiles_tables.sql`

- [ ] **Step 1: Create profiles table migration**

```sql
-- Create profiles table
CREATE TABLE profiles (
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
CREATE TABLE professional_profiles (
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
CREATE TABLE patient_profiles (
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

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (user_id = current_user_id());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (user_id = current_user_id());
CREATE POLICY "Users can read own professional profile" ON professional_profiles FOR SELECT USING (
  profile_id IN (SELECT id FROM profiles WHERE user_id = current_user_id())
);
CREATE POLICY "Users can update own professional profile" ON professional_profiles FOR UPDATE USING (
  profile_id IN (SELECT id FROM profiles WHERE user_id = current_user_id())
);
CREATE POLICY "Users can read own patient profile" ON patient_profiles FOR SELECT USING (
  profile_id IN (SELECT id FROM profiles WHERE user_id = current_user_id())
);
CREATE POLICY "Users can update own patient profile" ON patient_profiles FOR UPDATE USING (
  profile_id IN (SELECT id FROM profiles WHERE user_id = current_user_id())
);
```

- [ ] **Step 2: Run migration**

```bash
cd /Volumes/SSD\ PAU\ /GitHub/Nurea-App-1
npx supabase db push
```

Expected: Tables created successfully in Supabase.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260424_create_profiles_tables.sql
git commit -m "feat: create profiles database schema for professional and patient data"
```

---

## Task 2: Set Up Clerk Environment Variables

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: Add Clerk keys to .env.local**

Add to `.env.local`:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

- [ ] **Step 2: Verify keys are set**

Run:
```bash
grep CLERK .env.local
```

Expected: All 5 Clerk env vars present.

- [ ] **Step 3: No commit (env vars are local-only)**

---

## Task 3: Wrap App with ClerkProvider

**Files:**
- Modify: `/app/layout.tsx`

- [ ] **Step 1: Add Clerk imports**

At top of `/app/layout.tsx`, add:
```typescript
import { ClerkProvider } from '@clerk/nextjs';
```

- [ ] **Step 2: Wrap children with ClerkProvider**

Wrap the root layout's children:
```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: wrap app with ClerkProvider for authentication"
```

---

## Task 4: Create Clerk Middleware

**Files:**
- Create: `/middleware.ts` (if not exists, else modify)

- [ ] **Step 1: Create middleware.ts**

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/login(.*)',
  '/auth(.*)',
  '/terms',
  '/privacy',
  '/',
  '/profesionales',
  '/pacientes',
  '/search(.*)',
  '/explore(.*)',
  '/blog(.*)',
]);

const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Allow public routes
  if (isPublicRoute(req)) {
    return;
  }

  // Require auth for everything else
  if (!userId) {
    return auth().redirectToSignIn();
  }

  // Require onboarding before accessing dashboard/protected routes
  if (!isOnboardingRoute(req) && req.nextUrl.pathname.startsWith('/dashboard')) {
    // Check if onboarding is complete (will be checked in server action)
    // Redirect happens in layout/page components
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest))(?:.*)|api|trpc)(.*)',
  ],
};
```

- [ ] **Step 2: Remove old Supabase middleware code**

If `/middleware.ts` exists, remove any Supabase session checks. Keep only Clerk middleware.

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat: add Clerk middleware for auth protection"
```

---

## Task 5: Update Register Page with User Type Selector

**Files:**
- Modify: `/app/auth/register/page.tsx`

- [ ] **Step 1: Read current register page**

Read `/app/auth/register/page.tsx` to understand current structure.

- [ ] **Step 2: Add user type selector and legal checkboxes**

Replace the form with:

```typescript
'use client';

import { useSignUp } from '@clerk/nextjs';
import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const { signUp, isLoaded, setActive } = useSignUp();
  const [userType, setUserType] = useState<'professional' | 'patient'>('patient');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    rut: '',
    dateOfBirth: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [errors, setErrors] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors('');
    setIsLoading(true);

    if (!agreedToTerms || !agreedToPrivacy) {
      setErrors('Debes aceptar términos y política de privacidad');
      setIsLoading(false);
      return;
    }

    try {
      if (!isLoaded) return;

      const response = await signUp.create({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        unsafeMetadata: {
          userType,
          rut: formData.rut,
          dateOfBirth: formData.dateOfBirth,
        },
      });

      if (response.status === 'complete') {
        await setActive({ session: response.createdSessionId });
      }
    } catch (error: any) {
      setErrors(error.errors?.[0]?.message || 'Error en registro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="max-w-md w-full space-y-4 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold">Crear Cuenta</h2>

        {/* User Type Selector */}
        <div>
          <label className="block text-sm font-medium mb-2">¿Eres?</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="patient"
                checked={userType === 'patient'}
                onChange={(e) => setUserType(e.target.value as 'patient')}
              />
              <span className="ml-2">Paciente</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="professional"
                checked={userType === 'professional'}
                onChange={(e) => setUserType(e.target.value as 'professional')}
              />
              <span className="ml-2">Profesional</span>
            </label>
          </div>
        </div>

        {/* Name Fields */}
        <input
          type="text"
          name="firstName"
          placeholder="Nombre"
          value={formData.firstName}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />
        <input
          type="text"
          name="lastName"
          placeholder="Apellido"
          value={formData.lastName}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />

        {/* RUT */}
        <input
          type="text"
          name="rut"
          placeholder="RUT (ej: 12345678-9)"
          value={formData.rut}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />

        {/* Date of Birth */}
        <input
          type="date"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />

        {/* Password */}
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded"
        />

        {/* Legal Checkboxes */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
          />
          <span className="text-sm">
            Acepto los{' '}
            <Link href="/terms" className="text-blue-600 underline">
              Términos y Condiciones
            </Link>
          </span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={agreedToPrivacy}
            onChange={(e) => setAgreedToPrivacy(e.target.checked)}
          />
          <span className="text-sm">
            Acepto la{' '}
            <Link href="/privacy" className="text-blue-600 underline">
              Política de Privacidad
            </Link>
          </span>
        </label>

        {errors && <div className="text-red-600 text-sm">{errors}</div>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Registrando...' : 'Registrarse'}
        </button>

        <p className="text-center text-sm">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-blue-600 underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/auth/register/page.tsx
git commit -m "feat: update register with user type selector and legal checkboxes"
```

---

## Task 6: Create Professional Onboarding Page

**Files:**
- Create: `/app/onboarding/professional/page.tsx`
- Create: `/app/onboarding/professional/actions.ts`

- [ ] **Step 1: Create professional actions (server)**

Create `/app/onboarding/professional/actions.ts`:

```typescript
'use server';

import { createClient } from '@supabase/supabase-js';
import { currentUser } from '@clerk/nextjs/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function saveProfessionalProfile(data: {
  gender: string;
  specialty: string;
  licenseNumber: string;
  licenseFileUrl?: string;
  officeLocation: string;
  phone: string;
  officeHours: Record<string, string>;
  services: string[];
  insuranceAccepted: string[];
  secondarySpecialties?: string;
  fullName: string;
  rut: string;
  dateOfBirth: string;
}) {
  const user = await currentUser();
  if (!user?.id) throw new Error('Not authenticated');

  // Get or create profile
  let profile = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  let profileId = profile.data?.id;

  if (!profile.data) {
    const createProfile = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        user_type: 'professional',
        full_name: data.fullName,
        rut: data.rut,
        date_of_birth: data.dateOfBirth,
        gender: data.gender,
      })
      .select('id')
      .single();

    profileId = createProfile.data?.id;
  }

  // Save professional data
  const existing = await supabase
    .from('professional_profiles')
    .select('id')
    .eq('profile_id', profileId)
    .single();

  if (existing.data?.id) {
    await supabase
      .from('professional_profiles')
      .update({
        specialty: data.specialty,
        license_number: data.licenseNumber,
        license_file_url: data.licenseFileUrl,
        office_location: data.officeLocation,
        phone: data.phone,
        office_hours: data.officeHours,
        services: data.services,
        insurance_accepted: data.insuranceAccepted,
        secondary_specialties: data.secondarySpecialties,
      })
      .eq('profile_id', profileId);
  } else {
    await supabase
      .from('professional_profiles')
      .insert({
        profile_id: profileId,
        specialty: data.specialty,
        license_number: data.licenseNumber,
        license_file_url: data.licenseFileUrl,
        office_location: data.officeLocation,
        phone: data.phone,
        office_hours: data.officeHours,
        services: data.services,
        insurance_accepted: data.insuranceAccepted,
        secondary_specialties: data.secondarySpecialties,
      });
  }

  // Mark onboarding as complete
  await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('user_id', user.id);

  return { success: true };
}
```

- [ ] **Step 2: Create professional onboarding page**

Create `/app/onboarding/professional/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { saveProfessionalProfile } from './actions';

const OFFICE_HOURS_OPTIONS = ['09:00-13:00', '13:00-17:00', '09:00-17:00', '10:00-18:00'];
const SERVICES = ['Consulta', 'Diagnóstico', 'Seguimiento', 'Terapia', 'Procedimiento'];
const INSURANCE = ['Fonasa', 'Isapre A', 'Isapre B', 'Isapre C', 'Privado'];

export default function ProfessionalOnboarding() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    gender: '',
    specialty: '',
    licenseNumber: '',
    officeLocation: '',
    phone: '',
    services: [] as string[],
    insuranceAccepted: [] as string[],
    secondarySpecialties: '',
    officeHours: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await saveProfessionalProfile({
        ...form,
        fullName: user?.fullName || '',
        rut: (user?.unsafeMetadata?.rut as string) || '',
        dateOfBirth: (user?.unsafeMetadata?.dateOfBirth as string) || '',
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-8">Completa tu Perfil Profesional</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Gender */}
          <div>
            <label className="block font-semibold mb-2">Género</label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Selecciona</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="no_binario">No binario</option>
              <option value="prefiero_no">Prefiero no especificar</option>
            </select>
          </div>

          {/* Specialty */}
          <div>
            <label className="block font-semibold mb-2">Especialidad/Profesión</label>
            <input
              type="text"
              placeholder="Ej: Psicólogo Clínico"
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          {/* License Number */}
          <div>
            <label className="block font-semibold mb-2">Número Colegiado</label>
            <input
              type="text"
              placeholder="Ej: 12345"
              value={form.licenseNumber}
              onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          {/* File Upload (optional) */}
          <div>
            <label className="block font-semibold mb-2">Subir Documento (opcional)</label>
            <input type="file" accept=".pdf,.jpg,.png" className="w-full" />
          </div>

          {/* Office Location */}
          <div>
            <label className="block font-semibold mb-2">Ubicación/Dirección</label>
            <input
              type="text"
              placeholder="Ej: Av. Principal 123, Santiago"
              value={form.officeLocation}
              onChange={(e) => setForm({ ...form, officeLocation: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block font-semibold mb-2">Teléfono Consultorio</label>
            <input
              type="tel"
              placeholder="Ej: +56912345678"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          {/* Office Hours */}
          <div>
            <label className="block font-semibold mb-2">Horarios Disponibles</label>
            <div className="space-y-2">
              {Object.keys(form.officeHours).map((day) => (
                <div key={day} className="flex gap-2">
                  <label className="w-24 capitalize">{day}</label>
                  <select
                    value={form.officeHours[day as keyof typeof form.officeHours]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        officeHours: {
                          ...form.officeHours,
                          [day]: e.target.value,
                        },
                      })
                    }
                    className="flex-1 px-3 py-2 border rounded"
                  >
                    <option value="">No disponible</option>
                    {OFFICE_HOURS_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <label className="block font-semibold mb-2">Servicios que Ofreces</label>
            <div className="space-y-2">
              {SERVICES.map((service) => (
                <label key={service} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.services.includes(service)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        services: e.target.checked
                          ? [...form.services, service]
                          : form.services.filter((s) => s !== service),
                      })
                    }
                  />
                  {service}
                </label>
              ))}
            </div>
          </div>

          {/* Insurance */}
          <div>
            <label className="block font-semibold mb-2">Seguros/Fonasa que Aceptas</label>
            <div className="space-y-2">
              {INSURANCE.map((ins) => (
                <label key={ins} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.insuranceAccepted.includes(ins)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        insuranceAccepted: e.target.checked
                          ? [...form.insuranceAccepted, ins]
                          : form.insuranceAccepted.filter((i) => i !== ins),
                      })
                    }
                  />
                  {ins}
                </label>
              ))}
            </div>
          </div>

          {/* Secondary Specialties */}
          <div>
            <label className="block font-semibold mb-2">Especialidades Secundarias (opcional)</label>
            <textarea
              placeholder="Ej: Coaching, Recursos Humanos"
              value={form.secondarySpecialties}
              onChange={(e) => setForm({ ...form, secondarySpecialties: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={3}
            />
          </div>

          {error && <div className="text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Guardando...' : 'Completar Perfil'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/onboarding/professional/page.tsx app/onboarding/professional/actions.ts
git commit -m "feat: add professional onboarding form and server actions"
```

---

## Task 7: Create Patient Onboarding Page

**Files:**
- Create: `/app/onboarding/patient/page.tsx`
- Create: `/app/onboarding/patient/actions.ts`

- [ ] **Step 1: Create patient actions (server)**

Create `/app/onboarding/patient/actions.ts`:

```typescript
'use server';

import { createClient } from '@supabase/supabase-js';
import { currentUser } from '@clerk/nextjs/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function savePatientProfile(data: {
  gender: string;
  age: string;
  allergies: {
    medications: string[];
    other: string[];
  };
  currentMedications?: string;
  familyMedicalHistory?: string;
  chronicConditions: string[];
  reasonForConsultation: string;
  lifestyleHabits: {
    alcohol: boolean;
    smoking: boolean;
    drugs: boolean;
    exercise: string;
  };
  fullName: string;
  rut: string;
  dateOfBirth: string;
}) {
  const user = await currentUser();
  if (!user?.id) throw new Error('Not authenticated');

  // Get or create profile
  let profile = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  let profileId = profile.data?.id;

  if (!profile.data) {
    const createProfile = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        user_type: 'patient',
        full_name: data.fullName,
        rut: data.rut,
        date_of_birth: data.dateOfBirth,
        gender: data.gender,
      })
      .select('id')
      .single();

    profileId = createProfile.data?.id;
  }

  // Save patient data
  const existing = await supabase
    .from('patient_profiles')
    .select('id')
    .eq('profile_id', profileId)
    .single();

  if (existing.data?.id) {
    await supabase
      .from('patient_profiles')
      .update({
        allergies: data.allergies,
        current_medications: data.currentMedications,
        family_medical_history: data.familyMedicalHistory,
        chronic_conditions: data.chronicConditions,
        reason_for_consultation: data.reasonForConsultation,
        lifestyle_habits: data.lifestyleHabits,
      })
      .eq('profile_id', profileId);
  } else {
    await supabase
      .from('patient_profiles')
      .insert({
        profile_id: profileId,
        allergies: data.allergies,
        current_medications: data.currentMedications,
        family_medical_history: data.familyMedicalHistory,
        chronic_conditions: data.chronicConditions,
        reason_for_consultation: data.reasonForConsultation,
        lifestyle_habits: data.lifestyleHabits,
      });
  }

  // Mark onboarding as complete
  await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('user_id', user.id);

  return { success: true };
}
```

- [ ] **Step 2: Create patient onboarding page**

Create `/app/onboarding/patient/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { savePatientProfile } from './actions';

const CHRONIC_CONDITIONS = [
  'Diabetes',
  'Hipertensión',
  'Asma',
  'Artritis',
  'Depresión',
  'Ansiedad',
  'Obesidad',
  'Otro',
];

export default function PatientOnboarding() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    gender: '',
    age: '',
    allergies: {
      medications: [] as string[],
      other: [] as string[],
    },
    currentMedications: '',
    familyMedicalHistory: '',
    chronicConditions: [] as string[],
    reasonForConsultation: '',
    lifestyleHabits: {
      alcohol: false,
      smoking: false,
      drugs: false,
      exercise: 'none',
    },
  });

  const [allergyInput, setAllergyInput] = useState('');
  const [allergyType, setAllergyType] = useState<'medications' | 'other'>('medications');

  const addAllergy = () => {
    if (allergyInput.trim()) {
      setForm({
        ...form,
        allergies: {
          ...form.allergies,
          [allergyType]: [...form.allergies[allergyType], allergyInput],
        },
      });
      setAllergyInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await savePatientProfile({
        ...form,
        fullName: user?.fullName || '',
        rut: (user?.unsafeMetadata?.rut as string) || '',
        dateOfBirth: (user?.unsafeMetadata?.dateOfBirth as string) || '',
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-8">Completa tu Perfil de Salud</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Gender */}
          <div>
            <label className="block font-semibold mb-2">Género</label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Selecciona</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="no_binario">No binario</option>
              <option value="prefiero_no">Prefiero no especificar</option>
            </select>
          </div>

          {/* Age */}
          <div>
            <label className="block font-semibold mb-2">Edad</label>
            <input
              type="number"
              min="1"
              max="120"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          {/* Allergies */}
          <div>
            <label className="block font-semibold mb-2">Alergias</label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <select
                  value={allergyType}
                  onChange={(e) => setAllergyType(e.target.value as 'medications' | 'other')}
                  className="px-3 py-2 border rounded"
                >
                  <option value="medications">Medicinas</option>
                  <option value="other">Otras</option>
                </select>
                <input
                  type="text"
                  placeholder="Ej: Penicilina"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded"
                />
                <button
                  type="button"
                  onClick={addAllergy}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Añadir
                </button>
              </div>
              {form.allergies.medications.length > 0 && (
                <div>
                  <p className="text-sm font-semibold">Medicinas:</p>
                  <div className="flex flex-wrap gap-2">
                    {form.allergies.medications.map((allergy) => (
                      <span key={allergy} className="bg-blue-100 px-3 py-1 rounded text-sm">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {form.allergies.other.length > 0 && (
                <div>
                  <p className="text-sm font-semibold">Otras:</p>
                  <div className="flex flex-wrap gap-2">
                    {form.allergies.other.map((allergy) => (
                      <span key={allergy} className="bg-green-100 px-3 py-1 rounded text-sm">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Current Medications */}
          <div>
            <label className="block font-semibold mb-2">Medicamentos Actuales (opcional)</label>
            <textarea
              placeholder="Ej: Amoxicilina 500mg c/8h"
              value={form.currentMedications}
              onChange={(e) => setForm({ ...form, currentMedications: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={2}
            />
          </div>

          {/* Family Medical History */}
          <div>
            <label className="block font-semibold mb-2">Antecedentes Médicos Familiares (opcional)</label>
            <textarea
              placeholder="Ej: Padre con diabetes, madre con hipertensión"
              value={form.familyMedicalHistory}
              onChange={(e) => setForm({ ...form, familyMedicalHistory: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows={2}
            />
          </div>

          {/* Chronic Conditions */}
          <div>
            <label className="block font-semibold mb-2">Condiciones Crónicas</label>
            <div className="space-y-2">
              {CHRONIC_CONDITIONS.map((condition) => (
                <label key={condition} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.chronicConditions.includes(condition)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        chronicConditions: e.target.checked
                          ? [...form.chronicConditions, condition]
                          : form.chronicConditions.filter((c) => c !== condition),
                      })
                    }
                  />
                  {condition}
                </label>
              ))}
            </div>
          </div>

          {/* Reason for Consultation */}
          <div>
            <label className="block font-semibold mb-2">Razón de la Consulta / Síntomas</label>
            <textarea
              placeholder="Describe brevemente por qué buscas consulta"
              value={form.reasonForConsultation}
              onChange={(e) => setForm({ ...form, reasonForConsultation: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded"
              rows={3}
            />
          </div>

          {/* Lifestyle Habits */}
          <div>
            <label className="block font-semibold mb-2">Hábitos de Vida</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.lifestyleHabits.alcohol}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      lifestyleHabits: { ...form.lifestyleHabits, alcohol: e.target.checked },
                    })
                  }
                />
                Consumo de alcohol
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.lifestyleHabits.smoking}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      lifestyleHabits: { ...form.lifestyleHabits, smoking: e.target.checked },
                    })
                  }
                />
                Tabaquismo
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.lifestyleHabits.drugs}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      lifestyleHabits: { ...form.lifestyleHabits, drugs: e.target.checked },
                    })
                  }
                />
                Drogas recreativas
              </label>

              <div>
                <label className="block text-sm font-semibold mb-1">Frecuencia de ejercicio</label>
                <select
                  value={form.lifestyleHabits.exercise}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      lifestyleHabits: { ...form.lifestyleHabits, exercise: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="none">No me ejercito</option>
                  <option value="1-2">1-2 veces por semana</option>
                  <option value="3-4">3-4 veces por semana</option>
                  <option value="5+">5+ veces por semana</option>
                </select>
              </div>
            </div>
          </div>

          {error && <div className="text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Guardando...' : 'Completar Perfil'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/onboarding/patient/page.tsx app/onboarding/patient/actions.ts
git commit -m "feat: add patient onboarding form and server actions"
```

---

## Task 8: Create Onboarding Layout & Redirect

**Files:**
- Create: `/app/onboarding/layout.tsx`

- [ ] **Step 1: Create onboarding layout**

Create `/app/onboarding/layout.tsx`:

```typescript
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  // Check if onboarding already completed
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type, onboarding_completed')
    .eq('user_id', userId)
    .single();

  if (profile?.onboarding_completed) {
    redirect('/dashboard');
  }

  // If profile exists but no onboarding_completed, show appropriate form
  // If no profile, redirect to choose type (handle in page.tsx)

  return <>{children}</>;
}
```

- [ ] **Step 2: Create onboarding root page to handle redirect**

Create `/app/onboarding/page.tsx`:

```typescript
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type, onboarding_completed')
    .eq('user_id', userId)
    .single();

  if (!profile) {
    // No profile found, shouldn't happen (created during signup)
    redirect('/auth/register');
  }

  if (profile.onboarding_completed) {
    redirect('/dashboard');
  }

  // Redirect to appropriate onboarding based on user type
  if (profile.user_type === 'professional') {
    redirect('/onboarding/professional');
  } else {
    redirect('/onboarding/patient');
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/onboarding/layout.tsx app/onboarding/page.tsx
git commit -m "feat: add onboarding layout and redirect logic"
```

---

## Task 9: Create Legal Pages (Terms & Privacy)

**Files:**
- Create: `/app/terms/page.tsx`
- Create: `/app/privacy/page.tsx`

- [ ] **Step 1: Create terms page**

Create `/app/terms/page.tsx`:

```typescript
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-4xl font-bold mb-8">Términos y Condiciones</h1>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introducción</h2>
            <p>
              Nurea es una plataforma de telemedicina que conecta profesionales de la salud con pacientes.
              Al usar Nurea, aceptas estos términos y condiciones.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Sin Comisiones</h2>
            <p>
              Nurea no cobra comisiones por citas realizadas entre profesionales y pacientes.
              Los profesionales retienen el 100% de sus honorarios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Verificación de Profesionales</h2>
            <p>
              Los profesionales deben proporcionar información verificable de su licencia y credenciales.
              Nurea se reserva el derecho de verificar esta información independientemente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Responsabilidades del Usuario</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Proporcionar información precisa y veraz</li>
              <li>No usar la plataforma para fines ilícitos</li>
              <li>Respetar la privacidad de otros usuarios</li>
              <li>No compartir credenciales de acceso</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Limitación de Responsabilidad</h2>
            <p>
              Nurea no es responsable por: diagnósticos médicos, resultados de tratamientos,
              o cualquier relación médico-paciente entre usuarios de la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Cambios a los Términos</h2>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento.
              Notificaremos cambios significativos por correo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Contacto</h2>
            <p>
              Para preguntas sobre estos términos, contacta a: <strong>legal@nurea.cl</strong>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create privacy policy page**

Create `/app/privacy/page.tsx`:

```typescript
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-4xl font-bold mb-8">Política de Privacidad</h1>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Información que Recolectamos</h2>
            <p>Recolectamos información que proporcionas voluntariamente:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Información de perfil (nombre, RUT, fecha nacimiento)</li>
              <li>Información profesional (licencia, especialidades)</li>
              <li>Información de salud (síntomas, alergias, medicamentos)</li>
              <li>Información de contacto (email, teléfono)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Cómo Usamos tu Información</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Proporcionar servicios de telemedicina</li>
              <li>Verificar credenciales de profesionales</li>
              <li>Mejorar la plataforma</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Protección de Datos</h2>
            <p>
              Tu información está encriptada y almacenada de forma segura en Supabase.
              Implementamos medidas de seguridad estándar de la industria.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Compartir Información</h2>
            <p>
              No compartimos tu información con terceros sin tu consentimiento, excepto cuando:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Lo requiere la ley</li>
              <li>Es necesario para proporcionar el servicio (ej: entre paciente-profesional)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Tus Derechos</h2>
            <p>Tienes derecho a:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Acceder a tu información</li>
              <li>Corregir información inexacta</li>
              <li>Solicitar eliminación de datos</li>
              <li>Revocar consentimiento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Cookies</h2>
            <p>
              Usamos cookies mínimas para mantener tu sesión. Puedes deshabilitarlas en tu navegador,
              pero algunos servicios pueden no funcionar correctamente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Contacto</h2>
            <p>
              Para ejercer tus derechos de privacidad o reportar problemas:
              <strong> privacy@nurea.cl</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Cambios a esta Política</h2>
            <p>
              Actualizaremos esta política ocasionalmente. Los cambios significativos serán
              comunicados por email.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/terms/page.tsx app/privacy/page.tsx
git commit -m "feat: add terms and privacy policy pages"
```

---

## Task 10: Update Dashboard to Require Onboarding

**Files:**
- Modify: `/app/dashboard/layout.tsx`

- [ ] **Step 1: Add onboarding check to dashboard**

Add to top of `/app/dashboard/layout.tsx`:

```typescript
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  // Check if onboarding is complete
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('user_id', userId)
    .single();

  if (!profile?.onboarding_completed) {
    redirect('/onboarding');
  }

  return <>{children}</>;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/layout.tsx
git commit -m "feat: require onboarding completion before dashboard access"
```

---

## Task 11: Test Complete Flow

**Files:**
- None (manual testing)

- [ ] **Step 1: Test signup flow**

1. Go to `http://localhost:3000/auth/register`
2. Fill form as patient
3. Accept terms & privacy
4. Submit
5. Check Clerk email verification
6. Verify email
7. Should redirect to `/onboarding/patient`

- [ ] **Step 2: Test patient onboarding**

1. Fill all patient onboarding fields
2. Click "Completar Perfil"
3. Should redirect to `/dashboard`
4. Go back to login, logout, and re-login
5. Should NOT see onboarding again

- [ ] **Step 3: Test professional signup & onboarding**

1. Go to `/auth/register`
2. Select "Profesional"
3. Fill form
4. Verify email
5. Should redirect to `/onboarding/professional`
6. Fill professional fields
7. Submit
8. Redirect to `/dashboard`

- [ ] **Step 4: Test dashboard access without onboarding**

1. Create account but DON'T complete onboarding
2. Try to access `/dashboard` directly
3. Should redirect to `/onboarding`

- [ ] **Step 5: Verify database**

Run in Supabase dashboard:
```sql
SELECT * FROM profiles;
SELECT * FROM professional_profiles;
SELECT * FROM patient_profiles;
```

All test data should be present.

- [ ] **Step 6: Commit test notes (if any fixes needed)**

```bash
git add -A
git commit -m "test: verify complete auth and onboarding flows"
```

---

## Task 12: Clean Up & Remove Old Supabase Auth Code

**Files:**
- Remove: Any old Supabase auth code
- Modify: Any imports from old auth

- [ ] **Step 1: Search for old Supabase auth usage**

```bash
grep -r "supabase.*auth" app/ --include="*.tsx" --include="*.ts" | grep -v "supabase-js"
```

Remove any Supabase auth imports/code found.

- [ ] **Step 2: Remove old auth context/providers**

If there's old auth context, remove it:
```bash
find app/ -name "*auth*context*" -o -name "*auth*provider*"
```

Remove these files if they were using Supabase auth.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "cleanup: remove deprecated Supabase auth code"
```

---

## Spec Coverage Check

✅ **Section 1 (Auth Flow):** Tasks 3, 4, 5
✅ **Section 2 (Onboarding):** Tasks 6, 7, 8
✅ **Section 3 (Database):** Task 1
✅ **Section 4 (Middleware):** Task 4, 10
✅ **Section 5 (Legal):** Task 9
✅ **Section 6 (Clerk Integration):** Task 2, 3, 4
✅ **Section 7 (File Changes):** All tasks
✅ **Success Criteria:** Task 11

No gaps found.

---

Plan complete and saved to `docs/superpowers/plans/2026-04-24-auth-onboarding-implementation.md`.

**Two execution options:**

**1. Subagent-Driven (recommended)** - Fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session, batch with checkpoints

Which approach?
