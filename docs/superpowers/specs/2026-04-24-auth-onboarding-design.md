# Auth + Onboarding Implementation Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace Supabase auth with Clerk. Implement email verification → separate professional/patient onboarding flows with custom questions.

**Architecture:** 
- Clerk handles signup/login/email verification
- Supabase stores profile data (professional_profiles, patient_profiles tables)
- Onboarding middleware redirects incomplete users
- Separate onboarding routes for professional vs patient

**Tech Stack:** Clerk, Supabase, Next.js 16, TypeScript, React 19

---

## 1. Authentication Flow (Clerk)

**Signup Page (`/app/auth/register/page.tsx`):**
- Email + password
- Full name (nombre completo)
- RUT (Chilean ID)
- Date of birth (fecha nacimiento)
- User type selector (Profesional / Paciente)
- Terms & Conditions checkbox (link to `/terms`)
- Privacy Policy checkbox (link to `/privacy`)

**Login Page (`/app/login/page.tsx`):**
- Use Clerk's default login (email + password)
- Keep Apple button (already exists)

**Email Verification:**
- Clerk handles automatically after signup
- Redirect to `/onboarding` after verification completes

---

## 2. Onboarding Flows

### Professional Onboarding (`/app/onboarding/professional/page.tsx`)

**Questions:**
1. Género (Masculino / Femenino / No binario / Prefiero no especificarlo)
2. Especialidad/Profesión (text input)
3. Número colegiado (text input)
4. Subir archivo colegiado (optional file upload)
5. Ubicación/dirección consultorio (text input)
6. Horarios disponibles (multiselect: days + time ranges)
7. Teléfono consultorio (text input)
8. Servicios que ofrece (checkboxes: terapia, diagnóstico, seguimiento, etc.)
9. Seguros/Fonasa que acepta (checkboxes: Fonasa, Isapre A/B/C, etc.)
10. Experiencia/especialidades secundarias (textarea, optional)

**Saves to:** `professional_profiles` table in Supabase

---

### Patient Onboarding (`/app/onboarding/patient/page.tsx`)

**Questions:**
1. Género (Masculino / Femenino / No binario / Prefiero no especificarlo)
2. Edad o rango edad (number or select dropdown)
3. Alergias (text input: medicinas + otras)
4. Medicamentos actuales (textarea, optional)
5. Historia médica familiar (textarea, optional)
6. Condiciones crónicas (checkboxes: diabetes, hipertensión, asma, etc. + custom input)
7. Razón de consulta/síntomas (textarea)
8. Hábitos (checkboxes: alcohol, tabaco, drogas + exercise frequency)

**Saves to:** `patient_profiles` table in Supabase

---

## 3. Database Schema

**`profiles` table (generic):**
```
- id (UUID, PK)
- user_id (UUID, FK → auth.users from Clerk)
- user_type (ENUM: 'professional' | 'patient')
- full_name (text)
- rut (text, unique, encrypted)
- date_of_birth (date)
- gender (ENUM: 'masculino' | 'femenino' | 'no_binario' | 'prefiero_no')
- onboarding_completed (boolean, default: false)
- created_at (timestamp)
- updated_at (timestamp)
```

**`professional_profiles` table:**
```
- id (UUID, PK)
- profile_id (UUID, FK → profiles)
- specialty (text)
- license_number (text)
- license_file_url (text, nullable)
- office_location (text)
- phone (text)
- office_hours (jsonb: {monday: "09:00-17:00", ...})
- services (text[] array)
- insurance_accepted (text[] array)
- secondary_specialties (text, nullable)
```

**`patient_profiles` table:**
```
- id (UUID, PK)
- profile_id (UUID, FK → profiles)
- allergies (jsonb: {medications: [...], other: [...]})
- current_medications (text, nullable)
- family_medical_history (text, nullable)
- chronic_conditions (text[] array)
- reason_for_consultation (text)
- lifestyle_habits (jsonb: {alcohol: bool, smoking: bool, drugs: bool, exercise: text})
```

---

## 4. Middleware & Routing

**Onboarding Guard Middleware (`lib/onboarding-guard.ts`):**
- Check if user is authenticated (Clerk)
- Check if profile exists in Supabase
- Check if onboarding_completed = true
- If not: redirect to `/onboarding`
- If onboarding_completed = true: allow access to `/dashboard`

**Routes that require onboarding:**
- `/dashboard/*`
- `/explore`
- `/search`

---

## 5. Legal Pages (Already exist, update)

**`/app/terms/page.tsx`:**
- Create or update Nurea-specific terms & conditions
- Include: no commissions model, data privacy, professional verification, etc.

**`/app/privacy/page.tsx`:**
- Create or update Nurea-specific privacy policy
- Include: GDPR/LGPD compliance (if applicable), data handling, user rights

---

## 6. Clerk Integration Steps

- Update `.env.local` with Clerk keys
- Remove Supabase auth imports from `/middleware.ts`
- Add Clerk middleware to redirect unauthenticated users
- Update `/app/layout.tsx` to wrap with ClerkProvider
- Remove any Supabase session management code

---

## 7. File Changes Summary

**Create:**
- `/app/onboarding/layout.tsx`
- `/app/onboarding/professional/page.tsx`
- `/app/onboarding/patient/page.tsx`
- `/app/onboarding/professional/actions.ts`
- `/app/onboarding/patient/actions.ts`
- `/lib/onboarding-guard.ts`
- `/components/onboarding/ProfessionalForm.tsx`
- `/components/onboarding/PatientForm.tsx`

**Modify:**
- `/app/auth/register/page.tsx` (add user type selector + legal checkboxes)
- `/app/layout.tsx` (Clerk integration)
- `/middleware.ts` (Clerk auth)
- `/app/terms/page.tsx` (create if missing)
- `/app/privacy/page.tsx` (create if missing)

---

## 8. Success Criteria

- ✅ Clerk signup/login fully functional
- ✅ Email verification working
- ✅ Professional onboarding saves all data to Supabase
- ✅ Patient onboarding saves all data to Supabase
- ✅ Middleware blocks dashboard access until onboarding complete
- ✅ Terms & Privacy pages exist and linked in signup
- ✅ Mobile responsive onboarding forms
- ✅ No Supabase auth code remaining (auth is Clerk-only)

---

**Next Step:** Write detailed implementation plan (via writing-plans skill)
