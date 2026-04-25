"use client"
import { useUser } from "@/lib/clerk-shim"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/contexts/language-context"

/* ------------------------------------------------------------------
 *  Tokens inline (mismo sistema que el resto del nuevo UI)
 * ------------------------------------------------------------------ */
const C = {
  bg: "oklch(0.985 0.008 150)",
  bgWarm: "oklch(0.97 0.015 85)",
  ink: "oklch(0.22 0.025 170)",
  inkSoft: "oklch(0.42 0.02 170)",
  inkMute: "oklch(0.58 0.015 170)",
  line: "oklch(0.88 0.015 150)",
  lineSoft: "oklch(0.93 0.012 150)",
  sage50: "oklch(0.97 0.015 170)",
  sage100: "oklch(0.95 0.025 170)",
  sage200: "oklch(0.88 0.045 170)",
  sage300: "oklch(0.78 0.06 170)",
  sage500: "oklch(0.58 0.07 170)",
  sage700: "oklch(0.38 0.05 170)",
  sage900: "oklch(0.22 0.03 170)",
  terracotta: "oklch(0.68 0.11 45)",
  terracottaDeep: "oklch(0.52 0.13 40)",
  terracottaSoft: "oklch(0.92 0.04 55)",
  amberSoft: "oklch(0.96 0.035 85)",
  amber: "oklch(0.55 0.1 70)",
  blueSoft: "oklch(0.94 0.03 230)",
  blue: "oklch(0.4 0.1 230)",
  error: "oklch(0.55 0.18 25)",
  errorSoft: "oklch(0.96 0.04 25)",
}

/* ------------------------------------------------------------------
 *  Validación RUT chileno (módulo 11)
 * ------------------------------------------------------------------ */
function validateRut(rut: string): boolean {
  if (!rut) return false
  const cleaned = rut.replace(/[.\-\s]/g, "").toUpperCase()
  if (cleaned.length < 8 || cleaned.length > 9) return false
  const body = cleaned.slice(0, -1)
  const dv = cleaned.slice(-1)
  if (!/^\d+$/.test(body)) return false
  let sum = 0
  let mul = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const rest = 11 - (sum % 11)
  const expected = rest === 11 ? "0" : rest === 10 ? "K" : String(rest)
  return expected === dv
}

function formatRut(raw: string): string {
  const cleaned = raw.replace(/[.\-\s]/g, "").toUpperCase()
  if (cleaned.length < 2) return cleaned
  const body = cleaned.slice(0, -1)
  const dv = cleaned.slice(-1)
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return `${formattedBody}-${dv}`
}

/* ------------------------------------------------------------------
 *  Datos
 * ------------------------------------------------------------------ */
interface Specialty {
  id: string
  slug: string
  name_es: string
}

interface DayBlock {
  day_of_week: number  // 0 = domingo, 1 = lunes, ..., 6 = sábado
  start_time: string
  end_time: string
  is_active: boolean
}

const DAY_LABELS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
const DAY_LABELS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

/* ------------------------------------------------------------------
 *  Componente
 * ------------------------------------------------------------------ */
export default function ProfessionalOnboardingPage() {
  const router = useRouter()
  const { user } = useUser()
  const { language } = useLanguage()
  const isES = language === "es"
  const supabase = useMemo(() => createClient(), [])

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [specialties, setSpecialties] = useState<Specialty[]>([])

  // Paso 1 · Básico clínico
  const [rut, setRut] = useState("")
  const [specialtyId, setSpecialtyId] = useState("")
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [yearsExperience, setYearsExperience] = useState<string>("")
  const [bio, setBio] = useState("")

  // Paso 2 · Atención y precios
  const [consultationType, setConsultationType] = useState<"online" | "in-person" | "both">("both")
  const [city, setCity] = useState("Temuco")
  const [region, setRegion] = useState("Araucanía")
  const [clinicAddress, setClinicAddress] = useState("")
  const [onlinePrice, setOnlinePrice] = useState("")
  const [inPersonPrice, setInPersonPrice] = useState("")
  const [durationMinutes, setDurationMinutes] = useState(50)

  // Paso 3 · Credenciales
  const [professionalTitle, setProfessionalTitle] = useState("")
  const [university, setUniversity] = useState("")
  const [graduationYear, setGraduationYear] = useState<string>("")
  const [licenseFile, setLicenseFile] = useState<File | null>(null)
  const [licenseUploadedUrl, setLicenseUploadedUrl] = useState<string | null>(null)

  // Paso 4 · Disponibilidad (lun–vie 9–18 por defecto)
  const [availability, setAvailability] = useState<DayBlock[]>(() =>
    [1, 2, 3, 4, 5].map((d) => ({
      day_of_week: d,
      start_time: "09:00",
      end_time: "18:00",
      is_active: true,
    }))
  )

  /* --- cargar estado existente --- */
  useEffect(() => {
    if (!user?.id) return
    let cancelled = false
    ;(async () => {
      try {
        // specialties para el select
        const { data: specs } = await supabase
          .from("specialties")
          .select("id, slug, name_es")
          .order("sort_order", { ascending: true })
          .order("name_es", { ascending: true })

        // profile + professionals existentes
        const { data: profile } = await supabase
          .from("profiles")
          .select("national_id, city, region, professional_title")
          .eq("id", user.id)
          .maybeSingle()

        const { data: pro } = await supabase
          .from("professionals")
          .select(
            `id, specialty_id, bio, university, years_experience,
             registration_number, consultation_type, online_price, in_person_price,
             clinic_address, city, region, consultation_duration_minutes, graduation_year,
             license_document_url`
          )
          .eq("id", user.id)
          .maybeSingle()

        if (cancelled) return

        setSpecialties((specs as Specialty[]) || [])

        if (profile?.national_id) setRut(profile.national_id)
        if (profile?.professional_title) setProfessionalTitle(profile.professional_title)
        if (profile?.city) setCity(profile.city)
        if (profile?.region) setRegion(profile.region)

        if (pro) {
          if (pro.specialty_id) setSpecialtyId(pro.specialty_id)
          if (pro.bio) setBio(pro.bio)
          if (pro.university) setUniversity(pro.university)
          if (pro.years_experience != null) setYearsExperience(String(pro.years_experience))
          if (pro.registration_number) setRegistrationNumber(pro.registration_number)
          if (pro.consultation_type) setConsultationType(pro.consultation_type as any)
          if (pro.online_price != null) setOnlinePrice(String(pro.online_price))
          if (pro.in_person_price != null) setInPersonPrice(String(pro.in_person_price))
          if (pro.clinic_address) setClinicAddress(pro.clinic_address)
          if (pro.city) setCity(pro.city)
          if (pro.region) setRegion(pro.region)
          if (pro.consultation_duration_minutes) setDurationMinutes(pro.consultation_duration_minutes)
          if (pro.graduation_year) setGraduationYear(String(pro.graduation_year))
          if (pro.license_document_url) setLicenseUploadedUrl(pro.license_document_url)
        }

        // availability existente
        const { data: avail } = await supabase
          .from("professional_availability")
          .select("day_of_week, start_time, end_time, is_active")
          .eq("professional_id", user.id)

        if (!cancelled && avail && avail.length > 0) {
          setAvailability(
            avail.map((a: any) => ({
              day_of_week: a.day_of_week,
              start_time: (a.start_time || "09:00").slice(0, 5),
              end_time: (a.end_time || "18:00").slice(0, 5),
              is_active: a.is_active,
            }))
          )
        }
      } catch (e) {
        console.error("[onboarding] load error", e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [supabase, user?.id])

  /* --- validaciones por paso --- */
  const step1Valid =
    rut.trim().length > 0 &&
    validateRut(rut) &&
    specialtyId &&
    registrationNumber.trim().length >= 3 &&
    Number(yearsExperience) >= 0 &&
    bio.trim().length >= 50

  const step2Valid =
    city.trim().length > 0 &&
    durationMinutes >= 15 &&
    durationMinutes <= 240 &&
    (consultationType === "online"
      ? Number(onlinePrice) > 0
      : consultationType === "in-person"
      ? Number(inPersonPrice) > 0 && clinicAddress.trim().length > 0
      : Number(onlinePrice) > 0 &&
        Number(inPersonPrice) > 0 &&
        clinicAddress.trim().length > 0)

  const step3Valid =
    professionalTitle.trim().length > 0 &&
    university.trim().length > 0 &&
    Number(graduationYear) >= 1950 &&
    Number(graduationYear) <= new Date().getFullYear()

  const step4Valid = availability.some((b) => b.is_active && b.start_time < b.end_time)

  const canContinue = [step1Valid, step2Valid, step3Valid, step4Valid][step]

  /* --- handlers --- */
  function toggleDay(day: number) {
    setAvailability((prev) => {
      const exists = prev.find((b) => b.day_of_week === day)
      if (exists) {
        return prev.map((b) =>
          b.day_of_week === day ? { ...b, is_active: !b.is_active } : b
        )
      }
      return [
        ...prev,
        { day_of_week: day, start_time: "09:00", end_time: "18:00", is_active: true },
      ]
    })
  }

  function updateDayTime(day: number, field: "start_time" | "end_time", value: string) {
    setAvailability((prev) =>
      prev.map((b) => (b.day_of_week === day ? { ...b, [field]: value } : b))
    )
  }

  async function uploadLicense(): Promise<string | null> {
    if (!licenseFile || !user?.id) return licenseUploadedUrl
    const ext = licenseFile.name.split(".").pop() || "pdf"
    const path = `${user.id}/license_${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from("credentials")
      .upload(path, licenseFile, { upsert: true })
    if (error) {
      console.error("upload license error", error)
      return null
    }
    const { data } = supabase.storage.from("credentials").getPublicUrl(path)
    return data.publicUrl
  }

  async function handleFinish() {
    if (!user?.id) return
    setSaving(true)
    try {
      const licenseUrl = await uploadLicense()

      // 1) profiles
      await supabase
        .from("profiles")
        .update({
          national_id: rut,
          professional_title: professionalTitle,
          city,
          region,
          is_onboarded: true,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      // 2) professionals (upsert)
      await supabase.from("professionals").upsert({
        id: user.id,
        specialty_id: specialtyId,
        registration_number: registrationNumber,
        years_experience: Number(yearsExperience) || 0,
        bio,
        consultation_type: consultationType,
        online_price: consultationType !== "in-person" ? Number(onlinePrice) || null : null,
        in_person_price: consultationType !== "online" ? Number(inPersonPrice) || null : null,
        clinic_address: consultationType !== "online" ? clinicAddress : null,
        city,
        region,
        consultation_duration_minutes: durationMinutes,
        university,
        graduation_year: Number(graduationYear) || null,
        license_document_url: licenseUrl,
        currency: "CLP",
        updated_at: new Date().toISOString(),
      })

      // 3) availability (replace all)
      await supabase
        .from("professional_availability")
        .delete()
        .eq("professional_id", user.id)

      const rows = availability
        .filter((b) => b.is_active && b.start_time < b.end_time)
        .map((b) => ({
          professional_id: user.id,
          day_of_week: b.day_of_week,
          start_time: b.start_time,
          end_time: b.end_time,
          is_active: true,
        }))

      if (rows.length > 0) {
        await supabase.from("professional_availability").insert(rows)
      }

      router.replace("/dashboard/professional")
      router.refresh()
    } catch (e) {
      console.error("[onboarding] finish error", e)
      alert(isES ? "Error al guardar. Intenta de nuevo." : "Error saving. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  /* --- render --- */
  if (loading) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "grid",
          placeItems: "center",
          color: C.inkMute,
          fontFamily: "var(--font-inter), ui-sans-serif, system-ui",
        }}
      >
        {isES ? "Cargando..." : "Loading..."}
      </div>
    )
  }

  const stepLabels = isES
    ? ["Básico clínico", "Atención y precios", "Credenciales", "Disponibilidad"]
    : ["Clinical basics", "Service & pricing", "Credentials", "Availability"]

  return (
    <div
      style={{
        background: C.bgWarm,
        minHeight: "100%",
        padding: "32px 16px 80px",
        fontFamily: "var(--font-inter), ui-sans-serif, system-ui",
        color: C.ink,
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 12px",
              borderRadius: 999,
              background: C.sage100,
              color: C.sage700,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            <span
              style={{ width: 6, height: 6, borderRadius: "50%", background: C.sage500 }}
            />
            {isES ? "Configuración inicial" : "Initial setup"}
          </div>
          <h1
            style={{
              fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
              fontSize: "clamp(28px, 3.5vw, 36px)",
              fontWeight: 500,
              color: C.sage900,
              margin: "0 0 8px",
              lineHeight: 1.1,
            }}
          >
            {isES ? "Bienvenido/a a Nurea" : "Welcome to Nurea"}
          </h1>
          <p style={{ fontSize: 15, color: C.inkSoft, margin: 0, lineHeight: 1.5 }}>
            {isES
              ? "Completa estos 4 pasos para empezar a recibir pacientes."
              : "Complete these 4 steps to start receiving patients."}
          </p>
        </div>

        {/* Stepper */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 32,
            padding: "0 4px",
          }}
        >
          {stepLabels.map((label, idx) => {
            const active = idx === step
            const done = idx < step
            return (
              <div key={idx} style={{ flex: 1 }}>
                <div
                  style={{
                    height: 4,
                    borderRadius: 2,
                    background: done || active ? C.sage500 : C.lineSoft,
                    marginBottom: 8,
                    transition: "background 0.3s",
                  }}
                />
                <div
                  style={{
                    fontSize: 11,
                    color: active ? C.sage900 : done ? C.sage700 : C.inkMute,
                    fontWeight: active ? 600 : 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {idx + 1}. {label}
                </div>
              </div>
            )
          })}
        </div>

        {/* Card */}
        <div
          style={{
            background: "white",
            borderRadius: 20,
            border: `1px solid ${C.lineSoft}`,
            padding: 28,
            boxShadow: "0 8px 24px -16px oklch(0.22 0.025 170 / 0.1)",
          }}
        >
          {step === 0 && (
            <Step1
              isES={isES}
              rut={rut}
              setRut={setRut}
              specialties={specialties}
              specialtyId={specialtyId}
              setSpecialtyId={setSpecialtyId}
              registrationNumber={registrationNumber}
              setRegistrationNumber={setRegistrationNumber}
              yearsExperience={yearsExperience}
              setYearsExperience={setYearsExperience}
              bio={bio}
              setBio={setBio}
            />
          )}
          {step === 1 && (
            <Step2
              isES={isES}
              consultationType={consultationType}
              setConsultationType={setConsultationType}
              city={city}
              setCity={setCity}
              region={region}
              setRegion={setRegion}
              clinicAddress={clinicAddress}
              setClinicAddress={setClinicAddress}
              onlinePrice={onlinePrice}
              setOnlinePrice={setOnlinePrice}
              inPersonPrice={inPersonPrice}
              setInPersonPrice={setInPersonPrice}
              durationMinutes={durationMinutes}
              setDurationMinutes={setDurationMinutes}
            />
          )}
          {step === 2 && (
            <Step3
              isES={isES}
              professionalTitle={professionalTitle}
              setProfessionalTitle={setProfessionalTitle}
              university={university}
              setUniversity={setUniversity}
              graduationYear={graduationYear}
              setGraduationYear={setGraduationYear}
              licenseFile={licenseFile}
              setLicenseFile={setLicenseFile}
              licenseUploadedUrl={licenseUploadedUrl}
            />
          )}
          {step === 3 && (
            <Step4
              isES={isES}
              availability={availability}
              toggleDay={toggleDay}
              updateDayTime={updateDayTime}
            />
          )}
        </div>

        {/* Nav */}
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "space-between",
            marginTop: 24,
          }}
        >
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || saving}
            style={{
              padding: "12px 22px",
              borderRadius: 12,
              border: `1px solid ${C.line}`,
              background: "white",
              color: C.ink,
              fontSize: 14,
              fontWeight: 500,
              cursor: step === 0 || saving ? "not-allowed" : "pointer",
              opacity: step === 0 || saving ? 0.4 : 1,
              transition: "all 0.2s",
            }}
          >
            {isES ? "← Atrás" : "← Back"}
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => canContinue && setStep((s) => s + 1)}
              disabled={!canContinue}
              style={{
                padding: "12px 28px",
                borderRadius: 12,
                border: "none",
                background: canContinue ? C.sage700 : C.line,
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                cursor: canContinue ? "pointer" : "not-allowed",
                transition: "all 0.2s",
                boxShadow: canContinue
                  ? "0 8px 20px -10px oklch(0.38 0.05 170 / 0.6)"
                  : "none",
              }}
            >
              {isES ? "Continuar →" : "Continue →"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={!canContinue || saving}
              style={{
                padding: "12px 28px",
                borderRadius: 12,
                border: "none",
                background: canContinue && !saving ? C.sage700 : C.line,
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                cursor: canContinue && !saving ? "pointer" : "not-allowed",
                transition: "all 0.2s",
                boxShadow:
                  canContinue && !saving
                    ? "0 8px 20px -10px oklch(0.38 0.05 170 / 0.6)"
                    : "none",
              }}
            >
              {saving
                ? isES
                  ? "Guardando..."
                  : "Saving..."
                : isES
                ? "Completar onboarding"
                : "Complete onboarding"}
            </button>
          )}
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: 20,
            fontSize: 12,
            color: C.inkMute,
          }}
        >
          {isES
            ? "Tus datos quedan protegidos bajo la Ley 19.628 de Chile."
            : "Your data is protected under Chilean Law 19.628."}
        </p>
      </div>
    </div>
  )
}

/* ============================================================
 *  STEP 1 — Básico clínico
 * ============================================================ */
function Step1(props: {
  isES: boolean
  rut: string
  setRut: (v: string) => void
  specialties: Specialty[]
  specialtyId: string
  setSpecialtyId: (v: string) => void
  registrationNumber: string
  setRegistrationNumber: (v: string) => void
  yearsExperience: string
  setYearsExperience: (v: string) => void
  bio: string
  setBio: (v: string) => void
}) {
  const {
    isES,
    rut,
    setRut,
    specialties,
    specialtyId,
    setSpecialtyId,
    registrationNumber,
    setRegistrationNumber,
    yearsExperience,
    setYearsExperience,
    bio,
    setBio,
  } = props

  const rutValid = validateRut(rut)
  const rutError = rut.length > 0 && !rutValid

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <SectionTitle>{isES ? "Datos clínicos" : "Clinical data"}</SectionTitle>

      <Field label={isES ? "RUT" : "National ID (RUT)"} required>
        <input
          type="text"
          value={rut}
          onChange={(e) => setRut(formatRut(e.target.value))}
          placeholder="12.345.678-5"
          style={inputStyle(rutError)}
          maxLength={12}
        />
        {rutError && (
          <span style={{ fontSize: 12, color: C.error, marginTop: 4 }}>
            {isES
              ? "RUT inválido. Verifica el dígito verificador."
              : "Invalid RUT. Check the verification digit."}
          </span>
        )}
      </Field>

      <Field label={isES ? "Especialidad principal" : "Main specialty"} required>
        <select
          value={specialtyId}
          onChange={(e) => setSpecialtyId(e.target.value)}
          style={inputStyle()}
        >
          <option value="">
            {isES ? "Selecciona una especialidad" : "Select a specialty"}
          </option>
          {specialties.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name_es}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label={isES ? "N° registro Superintendencia de Salud" : "Health Superintendency registration"}
        required
      >
        <input
          type="text"
          value={registrationNumber}
          onChange={(e) => setRegistrationNumber(e.target.value)}
          placeholder="123456-7"
          style={inputStyle()}
        />
      </Field>

      <Field label={isES ? "Años de experiencia" : "Years of experience"} required>
        <input
          type="number"
          min={0}
          max={80}
          value={yearsExperience}
          onChange={(e) => setYearsExperience(e.target.value)}
          placeholder="5"
          style={inputStyle()}
        />
      </Field>

      <Field
        label={isES ? "Biografía profesional" : "Professional bio"}
        required
        hint={
          isES
            ? `${bio.length}/500 · mínimo 50 caracteres`
            : `${bio.length}/500 · minimum 50 characters`
        }
      >
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 500))}
          placeholder={
            isES
              ? "Cuéntale a tus pacientes sobre tu enfoque, formación y por qué amas lo que haces..."
              : "Tell patients about your approach, training, and why you love what you do..."
          }
          rows={5}
          style={{ ...inputStyle(), resize: "vertical", minHeight: 120, padding: 12 }}
        />
      </Field>
    </div>
  )
}

/* ============================================================
 *  STEP 2 — Atención y precios
 * ============================================================ */
function Step2(props: {
  isES: boolean
  consultationType: "online" | "in-person" | "both"
  setConsultationType: (v: "online" | "in-person" | "both") => void
  city: string
  setCity: (v: string) => void
  region: string
  setRegion: (v: string) => void
  clinicAddress: string
  setClinicAddress: (v: string) => void
  onlinePrice: string
  setOnlinePrice: (v: string) => void
  inPersonPrice: string
  setInPersonPrice: (v: string) => void
  durationMinutes: number
  setDurationMinutes: (n: number) => void
}) {
  const {
    isES,
    consultationType,
    setConsultationType,
    city,
    setCity,
    region,
    setRegion,
    clinicAddress,
    setClinicAddress,
    onlinePrice,
    setOnlinePrice,
    inPersonPrice,
    setInPersonPrice,
    durationMinutes,
    setDurationMinutes,
  } = props

  const showOnline = consultationType === "online" || consultationType === "both"
  const showInPerson = consultationType === "in-person" || consultationType === "both"

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <SectionTitle>{isES ? "Modalidad y precios" : "Service & pricing"}</SectionTitle>

      <Field label={isES ? "Modalidad de atención" : "Consultation mode"} required>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {(["online", "in-person", "both"] as const).map((opt) => {
            const labels = {
              online: { es: "Online", en: "Online" },
              "in-person": { es: "Presencial", en: "In-person" },
              both: { es: "Ambas", en: "Both" },
            }
            const active = consultationType === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setConsultationType(opt)}
                style={{
                  padding: "10px 8px",
                  borderRadius: 10,
                  border: `1px solid ${active ? C.sage500 : C.line}`,
                  background: active ? C.sage100 : "white",
                  color: active ? C.sage900 : C.ink,
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {labels[opt][isES ? "es" : "en"]}
              </button>
            )
          })}
        </div>
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label={isES ? "Ciudad" : "City"} required>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={inputStyle()}
          />
        </Field>
        <Field label={isES ? "Región" : "Region"}>
          <input
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            style={inputStyle()}
          />
        </Field>
      </div>

      {showInPerson && (
        <Field label={isES ? "Dirección de la consulta" : "Clinic address"} required>
          <input
            type="text"
            value={clinicAddress}
            onChange={(e) => setClinicAddress(e.target.value)}
            placeholder={isES ? "Ej: Av. Alemania 0211, Temuco" : "E.g., Av. Alemania 0211, Temuco"}
            style={inputStyle()}
          />
        </Field>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {showOnline && (
          <Field label={isES ? "Precio online (CLP)" : "Online price (CLP)"} required>
            <input
              type="number"
              min={0}
              step={1000}
              value={onlinePrice}
              onChange={(e) => setOnlinePrice(e.target.value)}
              placeholder="25000"
              style={inputStyle()}
            />
          </Field>
        )}
        {showInPerson && (
          <Field label={isES ? "Precio presencial (CLP)" : "In-person price (CLP)"} required>
            <input
              type="number"
              min={0}
              step={1000}
              value={inPersonPrice}
              onChange={(e) => setInPersonPrice(e.target.value)}
              placeholder="35000"
              style={inputStyle()}
            />
          </Field>
        )}
      </div>

      <Field
        label={isES ? "Duración de la consulta (minutos)" : "Consultation duration (minutes)"}
        required
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
          {[30, 45, 50, 60, 90].map((m) => {
            const active = durationMinutes === m
            return (
              <button
                key={m}
                type="button"
                onClick={() => setDurationMinutes(m)}
                style={{
                  padding: "10px 4px",
                  borderRadius: 10,
                  border: `1px solid ${active ? C.sage500 : C.line}`,
                  background: active ? C.sage100 : "white",
                  color: active ? C.sage900 : C.ink,
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {m}&apos;
              </button>
            )
          })}
        </div>
      </Field>
    </div>
  )
}

/* ============================================================
 *  STEP 3 — Credenciales
 * ============================================================ */
function Step3(props: {
  isES: boolean
  professionalTitle: string
  setProfessionalTitle: (v: string) => void
  university: string
  setUniversity: (v: string) => void
  graduationYear: string
  setGraduationYear: (v: string) => void
  licenseFile: File | null
  setLicenseFile: (f: File | null) => void
  licenseUploadedUrl: string | null
}) {
  const {
    isES,
    professionalTitle,
    setProfessionalTitle,
    university,
    setUniversity,
    graduationYear,
    setGraduationYear,
    licenseFile,
    setLicenseFile,
    licenseUploadedUrl,
  } = props

  const titles = [
    { value: "Dr.", label: isES ? "Dr. · Médico" : "Dr. · Physician (m)" },
    { value: "Dra.", label: isES ? "Dra. · Médica" : "Dra. · Physician (f)" },
    { value: "Ps.", label: isES ? "Ps. · Psicólogo/a" : "Ps. · Psychologist" },
    { value: "Nut.", label: isES ? "Nut. · Nutricionista" : "Nut. · Nutritionist" },
    { value: "Kines.", label: isES ? "Kines. · Kinesiólogo/a" : "Kines. · Physiotherapist" },
    { value: "Fono.", label: isES ? "Fono. · Fonoaudiólogo/a" : "Fono. · Speech therapist" },
    { value: "Matrón.", label: isES ? "Matrón/a" : "Midwife" },
    { value: "TO.", label: isES ? "TO. · Terapeuta ocupacional" : "OT · Occupational therapist" },
    { value: "Odont.", label: isES ? "Odont. · Dentista" : "Dentist" },
  ]

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <SectionTitle>{isES ? "Credenciales" : "Credentials"}</SectionTitle>

      <Field label={isES ? "Título profesional" : "Professional title"} required>
        <select
          value={professionalTitle}
          onChange={(e) => setProfessionalTitle(e.target.value)}
          style={inputStyle()}
        >
          <option value="">
            {isES ? "Selecciona tu título" : "Select your title"}
          </option>
          {titles.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label={isES ? "Universidad" : "University"} required>
        <input
          type="text"
          value={university}
          onChange={(e) => setUniversity(e.target.value)}
          placeholder={isES ? "Ej: Universidad de La Frontera" : "E.g., Universidad de La Frontera"}
          style={inputStyle()}
        />
      </Field>

      <Field label={isES ? "Año de egreso" : "Graduation year"} required>
        <input
          type="number"
          min={1950}
          max={new Date().getFullYear()}
          value={graduationYear}
          onChange={(e) => setGraduationYear(e.target.value)}
          placeholder="2020"
          style={inputStyle()}
        />
      </Field>

      <Field
        label={isES ? "Certificado de título (PDF o imagen)" : "License document (PDF or image)"}
        hint={
          isES
            ? "Opcional. Te pediremos verificarlo antes de que recibas pagos."
            : "Optional. We'll verify it before enabling payments."
        }
      >
        <label
          htmlFor="license-upload"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "18px",
            borderRadius: 12,
            border: `2px dashed ${C.line}`,
            background: C.bg,
            color: C.inkSoft,
            fontSize: 13,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          {licenseFile
            ? licenseFile.name
            : licenseUploadedUrl
            ? isES
              ? "Ya subido · haz clic para reemplazar"
              : "Already uploaded · click to replace"
            : isES
            ? "Haz clic para subir el certificado"
            : "Click to upload the document"}
          <input
            id="license-upload"
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
            style={{ display: "none" }}
          />
        </label>
      </Field>
    </div>
  )
}

/* ============================================================
 *  STEP 4 — Disponibilidad
 * ============================================================ */
function Step4(props: {
  isES: boolean
  availability: DayBlock[]
  toggleDay: (day: number) => void
  updateDayTime: (day: number, field: "start_time" | "end_time", value: string) => void
}) {
  const { isES, availability, toggleDay, updateDayTime } = props
  const labels = isES ? DAY_LABELS_ES : DAY_LABELS_EN

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <SectionTitle>{isES ? "Disponibilidad inicial" : "Initial availability"}</SectionTitle>
      <p style={{ fontSize: 13, color: C.inkSoft, margin: 0 }}>
        {isES
          ? "Marca los días que atiendes y tus horarios. Podrás ajustarlo después desde Configuración."
          : "Select the days you work and your hours. You can adjust this later from Settings."}
      </p>

      <div style={{ display: "grid", gap: 10 }}>
        {[1, 2, 3, 4, 5, 6, 0].map((dayIdx) => {
          const block = availability.find((b) => b.day_of_week === dayIdx)
          const active = block?.is_active || false
          return (
            <div
              key={dayIdx}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto auto",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                borderRadius: 12,
                border: `1px solid ${active ? C.sage200 : C.lineSoft}`,
                background: active ? C.sage50 : "white",
                transition: "all 0.2s",
              }}
            >
              <button
                type="button"
                onClick={() => toggleDay(dayIdx)}
                aria-label={`Toggle ${labels[dayIdx]}`}
                style={{
                  width: 34,
                  height: 20,
                  borderRadius: 10,
                  border: "none",
                  background: active ? C.sage500 : C.line,
                  position: "relative",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    left: active ? 16 : 2,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "white",
                    transition: "left 0.2s",
                  }}
                />
              </button>

              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: active ? C.sage900 : C.inkSoft,
                }}
              >
                {labels[dayIdx]}
              </div>

              <input
                type="time"
                value={block?.start_time || "09:00"}
                onChange={(e) => updateDayTime(dayIdx, "start_time", e.target.value)}
                disabled={!active}
                style={{
                  ...inputStyle(),
                  width: 98,
                  padding: "8px 10px",
                  fontSize: 13,
                  opacity: active ? 1 : 0.4,
                }}
              />
              <input
                type="time"
                value={block?.end_time || "18:00"}
                onChange={(e) => updateDayTime(dayIdx, "end_time", e.target.value)}
                disabled={!active}
                style={{
                  ...inputStyle(),
                  width: 98,
                  padding: "8px 10px",
                  fontSize: 13,
                  opacity: active ? 1 : 0.4,
                }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ============================================================
 *  Helpers de estilo
 * ============================================================ */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
        fontSize: 22,
        fontWeight: 500,
        color: C.sage900,
        margin: "0 0 4px",
      }}
    >
      {children}
    </h2>
  )
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: C.inkSoft,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontFamily: "var(--font-mono), ui-monospace, monospace",
        }}
      >
        {label}
        {required && <span style={{ color: C.terracotta, marginLeft: 4 }}>*</span>}
      </span>
      {children}
      {hint && (
        <span style={{ fontSize: 12, color: C.inkMute, marginTop: 2 }}>{hint}</span>
      )}
    </label>
  )
}

function inputStyle(error?: boolean): React.CSSProperties {
  return {
    width: "100%",
    height: 42,
    padding: "0 14px",
    borderRadius: 10,
    border: `1px solid ${error ? C.error : C.line}`,
    background: "white",
    color: C.ink,
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  }
}
