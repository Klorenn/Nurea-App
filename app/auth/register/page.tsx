"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"
import { signUp } from "@/actions/auth"
import { getHumanErrorMessage } from "@/lib/auth/utils"

/* ------------------------------------------------------------------
 *  Iconos inline (sin lucide-react)
 * ------------------------------------------------------------------ */
const IcoArrowLeft = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
)
const IcoArrow = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
)
const IcoMail = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
)
const IcoLock = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 1 1 8 0v4" />
  </svg>
)
const IcoShield = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 2l8.5 4.5v5c0 5-3.5 9.5-8.5 10.5-5-1-8.5-5.5-8.5-10.5v-5L12 2z" />
  </svg>
)
const IcoIdCard = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M7 10h4M7 14h8M15 10h2" />
  </svg>
)
const IcoEye = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)
const IcoEyeOff = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <path d="M1 1l22 22" />
  </svg>
)
const IcoCheck = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M5 13l4 4L19 7" />
  </svg>
)
const IcoCheckCircle = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
)
const IcoGoogle = (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
    />
  </svg>
)
const IcoApple = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
)

/* ------------------------------------------------------------------
 *  Data
 * ------------------------------------------------------------------ */
const SPECIALTIES = [
  "Medicina General",
  "Psicología",
  "Psiquiatría",
  "Nutrición",
  "Kinesiología",
  "Odontología",
  "Dermatología",
  "Ginecología y Obstetricia",
  "Pediatría",
  "Cardiología",
  "Traumatología y Ortopedia",
  "Oftalmología",
  "Otorrinolaringología",
  "Urología",
  "Neurología",
  "Endocrinología",
  "Gastroenterología",
  "Oncología",
  "Reumatología",
  "Neumología",
  "Fisiatría",
  "Medicina Interna",
  "Medicina Deportiva",
  "Medicina Estética",
  "Fonoaudiología",
  "Terapia Ocupacional",
  "Matrona",
  "Otra",
]

/* ------------------------------------------------------------------
 *  Password strength
 * ------------------------------------------------------------------ */
function scorePassword(v: string): number {
  let score = 0
  if (v.length >= 8) score++
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++
  if (/\d/.test(v)) score++
  if (/[^A-Za-z0-9]/.test(v) && v.length >= 10) score++
  return score
}

/* ------------------------------------------------------------------
 *  Componentes auxiliares
 * ------------------------------------------------------------------ */
function Logo() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-3"
      style={{ color: "white", textDecoration: "none" }}
    >
      <span
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: "white",
          padding: 4,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 20px -12px oklch(0 0 0 / 0.35)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Nurea"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </span>
      <span style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 22, fontWeight: 500 }}>
        Nurea
      </span>
    </Link>
  )
}

function RegisterContent() {
  const { language } = useLanguage()
  const searchParams = useSearchParams()
  const isES = language === "es"

  /* —— Role toggle —— */
  const initialRole: "patient" | "professional" =
    searchParams.get("role") === "pro" || searchParams.get("role") === "professional"
      ? "professional"
      : "patient"
  const [role, setRole] = useState<"patient" | "professional">(initialRole)

  const toggleRef = useRef<HTMLDivElement | null>(null)
  const patientBtnRef = useRef<HTMLButtonElement | null>(null)
  const proBtnRef = useRef<HTMLButtonElement | null>(null)
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number }>({ left: 4, width: 0 })

  useEffect(() => {
    const positionPill = () => {
      const btn = role === "patient" ? patientBtnRef.current : proBtnRef.current
      if (!btn) return
      setPillStyle({ left: btn.offsetLeft, width: btn.offsetWidth })
    }
    positionPill()
    const id = window.setTimeout(positionPill, 50)
    window.addEventListener("resize", positionPill)
    return () => {
      window.clearTimeout(id)
      window.removeEventListener("resize", positionPill)
    }
  }, [role])

  /* —— Form state —— */
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [specialty, setSpecialty] = useState("")
  const [otherSpecialty, setOtherSpecialty] = useState("")
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [nationalId, setNationalId] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [newsletter, setNewsletter] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const strength = useMemo(() => scorePassword(password), [password])
  const isProfessional = role === "professional"

  /* —— Helpers —— */
  const formatRUT = (value: string): string => {
    const cleaned = value.replace(/[^0-9kK]/g, "").toUpperCase()
    if (cleaned.length <= 1) return cleaned
    const body = cleaned.slice(0, -1)
    const dv = cleaned.slice(-1)
    let formatted = ""
    for (let i = 0; i < body.length; i++) {
      if (i > 0 && (body.length - i) % 3 === 0) formatted += "."
      formatted += body[i]
    }
    return `${formatted}-${dv}`
  }

  /* —— Submit —— */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError(isES ? "Completa todos los campos requeridos." : "Please complete all required fields.")
      return
    }
    if (password.length < 8) {
      setError(isES ? "La contraseña debe tener mínimo 8 caracteres." : "Password must be at least 8 characters.")
      return
    }
    if (!acceptedTerms) {
      setError(isES ? "Debes aceptar los términos para continuar." : "You must accept the terms to continue.")
      return
    }
    if (isProfessional) {
      if (!specialty.trim()) {
        setError(isES ? "Selecciona tu especialidad principal." : "Please select your main specialty.")
        return
      }
      if (specialty === "Otra" && !otherSpecialty.trim()) {
        setError(isES ? "Indica cuál es tu especialidad." : "Please specify your specialty.")
        return
      }
      if (!registrationNumber.trim()) {
        setError(isES ? "Ingresa tu número de registro profesional." : "Please enter your professional registration number.")
        return
      }
    } else {
      if (!nationalId.trim()) {
        setError(isES ? "Ingresa tu RUT o DNI." : "Please enter your national ID.")
        return
      }
    }

    setLoading(true)
    try {
      const result = await signUp({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
        specialty: isProfessional ? (specialty === "Otra" ? otherSpecialty.trim() : specialty) : undefined,
        registrationNumber: isProfessional ? registrationNumber.trim() : undefined,
        nationalId: nationalId.trim() || undefined,
      })

      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error || (isES ? "No se pudo crear la cuenta." : "Failed to create account."))
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : (isES ? "Error al registrarse" : "Error signing up")
      setError(getHumanErrorMessage(msg, isES ? "es" : "en") || msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    try {
      const next = role === "professional" ? "/onboarding?role=professional" : "/onboarding?role=patient"
      window.location.href = `/api/auth/google?next=${encodeURIComponent(next)}`
    } catch {
      setError(isES ? "No se pudo iniciar Google." : "Could not start Google sign-up.")
      setLoading(false)
    }
  }

  /* ------------------------------------------------------------------
   *  Pantalla de éxito
   * ------------------------------------------------------------------ */
  if (success) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "oklch(0.985 0.005 90)",
          padding: 24,
          fontFamily: "var(--font-inter), ui-sans-serif, system-ui",
          color: "oklch(0.25 0.03 170)",
        }}
      >
        <div
          style={{
            maxWidth: 460,
            width: "100%",
            background: "white",
            borderRadius: 24,
            border: "1px solid oklch(0.92 0.01 90)",
            padding: "40px 32px",
            textAlign: "center",
            boxShadow: "0 20px 60px -30px oklch(0.3 0.04 170 / 0.2)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              margin: "0 auto 20px",
              background: "oklch(0.94 0.04 150)",
              color: "oklch(0.45 0.09 150)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {IcoCheckCircle}
          </div>
          <h1
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontSize: "clamp(28px, 4vw, 36px)",
              fontWeight: 400,
              lineHeight: 1.1,
              margin: "0 0 10px",
              color: "oklch(0.20 0.03 170)",
            }}
          >
            {isES ? "¡Casi listo!" : "Almost there!"}
          </h1>
          <p style={{ color: "oklch(0.45 0.03 170)", fontSize: 15, lineHeight: 1.55, margin: "0 0 18px" }}>
            {isES
              ? "Te enviamos un enlace de verificación a"
              : "We sent a verification link to"}
            <br />
            <strong style={{ color: "oklch(0.45 0.09 150)" }}>{email.trim()}</strong>
          </p>
          <div
            style={{
              textAlign: "left",
              background: "oklch(0.97 0.01 90)",
              borderRadius: 14,
              padding: 16,
              fontSize: 13,
              color: "oklch(0.35 0.03 170)",
              lineHeight: 1.6,
              marginBottom: 22,
            }}
          >
            <p style={{ margin: 0 }}>
              1. {isES ? "Abre tu correo y haz clic en el enlace." : "Open your email and click the link."}
            </p>
            <p style={{ margin: "6px 0 0" }}>
              2. {isES ? "Completa tu perfil para comenzar." : "Complete your profile to get started."}
            </p>
            <p style={{ margin: "10px 0 0", color: "oklch(0.55 0.02 170)", fontSize: 12 }}>
              {isES ? "¿No lo ves? Revisa spam o promociones." : "Don't see it? Check spam or promotions."}
            </p>
          </div>
          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 22px",
              background: "oklch(0.20 0.03 170)",
              color: "white",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {isES ? "Ir a iniciar sesión" : "Go to sign in"} {IcoArrow}
          </Link>
        </div>
      </main>
    )
  }

  /* ------------------------------------------------------------------
   *  Layout principal — split aside + form
   * ------------------------------------------------------------------ */
  return (
    <main
      style={{
        minHeight: "100vh",
        fontFamily: "var(--font-inter), ui-sans-serif, system-ui",
        color: "oklch(0.25 0.03 170)",
        background: "oklch(0.985 0.005 90)",
      }}
      className="grid grid-cols-1 lg:grid-cols-2"
    >
      {/* ------------ ASIDE ------------ */}
      <aside
        className="hidden lg:flex"
        style={{
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(165deg, oklch(0.28 0.035 170) 0%, oklch(0.20 0.03 170) 50%, oklch(0.15 0.025 165) 100%)",
          color: "white",
          padding: "56px 56px 48px",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Blobs animadas */}
        <div
          className="animate-nurea-drift"
          aria-hidden
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            borderRadius: "50%",
            top: "-120px",
            right: "-140px",
            background: "radial-gradient(circle, oklch(0.72 0.12 150 / 0.35) 0%, transparent 65%)",
            filter: "blur(6px)",
            pointerEvents: "none",
          }}
        />
        <div
          className="animate-nurea-drift-rev"
          aria-hidden
          style={{
            position: "absolute",
            width: 440,
            height: 440,
            borderRadius: "50%",
            bottom: "-120px",
            left: "-100px",
            background: "radial-gradient(circle, oklch(0.65 0.12 45 / 0.22) 0%, transparent 70%)",
            filter: "blur(4px)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <Logo />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 440 }}>
          <div
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "oklch(0.72 0.12 150)",
              marginBottom: 18,
            }}
          >
            {isES ? "Por qué Nurea" : "Why Nurea"}
          </div>
          <blockquote
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontSize: "clamp(22px, 2.4vw, 30px)",
              lineHeight: 1.35,
              fontWeight: 400,
              margin: 0,
              color: "oklch(0.96 0.01 90)",
            }}
          >
            {isES ? (
              <>
                Un mercado de salud que respeta el tiempo del cuidado.{" "}
                <em style={{ color: "oklch(0.72 0.12 150)", fontStyle: "italic" }}>Sin fricciones</em>, sin marketing
                agresivo — solo encuentros reales entre quien cuida y quien busca ser cuidado.
              </>
            ) : (
              <>
                A health marketplace that respects the time it takes to care.{" "}
                <em style={{ color: "oklch(0.72 0.12 150)", fontStyle: "italic" }}>Without friction</em>, without
                aggressive marketing — just real encounters between carers and those seeking care.
              </>
            )}
          </blockquote>
        </div>

        {/* Stats */}
        {isES && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
              marginTop: 24,
              paddingTop: 20,
              borderTop: "1px solid oklch(1 0 0 0 / 0.15)",
            }}
          >
            {[
              { num: "14 días", label: "Prueba gratis" },
              { num: "48h", label: "Primera cita" },
              { num: "0%", label: "Permanencia" },
            ].map((stat) => (
              <div key={stat.label}>
                <div
                  style={{
                    fontFamily: "var(--font-fraunces), serif",
                    fontSize: 26,
                    fontWeight: 400,
                    marginBottom: 4,
                    color: "white",
                  }}
                >
                  {stat.num}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "oklch(0.72 0.03 170 / 0.6)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            position: "relative",
            zIndex: 1,
            fontSize: 11,
            color: "oklch(0.72 0.03 170)",
          }}
        >
          © {new Date().getFullYear()} Nurea · Plataforma de cuidado y bienestar
        </div>
      </aside>

      {/* ------------ FORM ------------ */}
      <section
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          padding: "20px clamp(18px, 4vw, 44px) 24px",
          height: "100dvh",
          overflowY: "auto",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 13,
            color: "oklch(0.45 0.03 170)",
            marginBottom: 16,
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "oklch(0.45 0.03 170)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            {IcoArrowLeft}
            {isES ? "Volver" : "Back"}
          </Link>
          <div>
            {isES ? "¿Ya tienes cuenta?" : "Already have an account?"}{" "}
            <Link
              href="/login"
              style={{ color: "oklch(0.45 0.09 150)", fontWeight: 600, textDecoration: "none" }}
            >
              {isES ? "Iniciar sesión" : "Sign in"}
            </Link>
          </div>
        </div>

        <div style={{ maxWidth: 460, width: "100%", margin: "0 auto", flex: 1 }}>
          <h1
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontSize: "clamp(22px, 2.8vw, 28px)",
              lineHeight: 1.05,
              fontWeight: 400,
              margin: "0 0 4px",
              color: "oklch(0.20 0.03 170)",
              letterSpacing: "-0.01em",
            }}
          >
            {isES ? (
              <>
                Empieza tu{" "}
                <em style={{ color: "oklch(0.45 0.09 150)", fontStyle: "italic" }}>camino</em>.
              </>
            ) : (
              <>
                Begin your{" "}
                <em style={{ color: "oklch(0.45 0.09 150)", fontStyle: "italic" }}>journey</em>.
              </>
            )}
          </h1>
          <p style={{ color: "oklch(0.45 0.03 170)", fontSize: 12.5, lineHeight: 1.35, marginBottom: 10 }}>
            {isES
              ? "Crea tu cuenta en menos de un minuto. Sin tarjeta, sin permanencia."
              : "Create your account in under a minute. No credit card, no lock-in."}
          </p>

          {/* Role toggle */}
          <div
            ref={toggleRef}
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              padding: 3,
              background: "oklch(0.97 0.005 90)",
              border: "1px solid oklch(0.92 0.01 90)",
              borderRadius: 12,
              marginBottom: 14,
            }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: 4,
                bottom: 4,
                left: pillStyle.left,
                width: pillStyle.width,
                background: "white",
                borderRadius: 10,
                boxShadow: "0 4px 10px -4px oklch(0.3 0.04 170 / 0.15)",
                transition: "all 0.35s cubic-bezier(0.2, 0.9, 0.3, 1)",
                zIndex: 1,
              }}
            />
            <button
              ref={patientBtnRef}
              type="button"
              onClick={() => setRole("patient")}
              aria-pressed={role === "patient"}
              style={{
                position: "relative",
                zIndex: 2,
                padding: "7px 10px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                textAlign: "center",
                color: role === "patient" ? "oklch(0.20 0.03 170)" : "oklch(0.45 0.03 170)",
                transition: "color 0.3s",
                fontFamily: "inherit",
              }}
            >
              <strong style={{ display: "block", fontSize: 13, fontWeight: 600 }}>
                {isES ? "Soy paciente" : "I'm a patient"}
              </strong>
            </button>
            <button
              ref={proBtnRef}
              type="button"
              onClick={() => setRole("professional")}
              aria-pressed={role === "professional"}
              style={{
                position: "relative",
                zIndex: 2,
                padding: "7px 10px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                textAlign: "center",
                color: role === "professional" ? "oklch(0.20 0.03 170)" : "oklch(0.45 0.03 170)",
                transition: "color 0.3s",
                fontFamily: "inherit",
              }}
            >
              <strong style={{ display: "block", fontSize: 13, fontWeight: 600 }}>
                {isES ? "Soy profesional" : "I'm a professional"}
              </strong>
            </button>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "10px 12px",
                background: "oklch(0.96 0.04 25)",
                border: "1px solid oklch(0.85 0.08 25)",
                color: "oklch(0.40 0.15 25)",
                borderRadius: 10,
                fontSize: 12.5,
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 14 }}>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Social row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "9px 12px",
                background: "white",
                border: "1px solid oklch(0.92 0.01 90)",
                borderRadius: 10,
                fontSize: 12.5,
                fontWeight: 500,
                color: "oklch(0.25 0.03 170)",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                transition: "all 0.2s",
              }}
            >
              {IcoGoogle}
              Google
            </button>
            <button
              type="button"
              disabled
              title={isES ? "Próximamente" : "Coming soon"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "9px 12px",
                background: "oklch(0.97 0.005 90)",
                border: "1px solid oklch(0.92 0.01 90)",
                borderRadius: 10,
                fontSize: 12.5,
                fontWeight: 500,
                color: "oklch(0.55 0.02 170)",
                cursor: "not-allowed",
              }}
            >
              {IcoApple}
              Apple
            </button>
          </div>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 11,
              color: "oklch(0.55 0.02 170)",
              margin: "8px 0 12px",
            }}
          >
            <div style={{ flex: 1, height: 1, background: "oklch(0.92 0.01 90)" }} />
            <span>{isES ? "o regístrate con correo" : "or sign up with email"}</span>
            <div style={{ flex: 1, height: 1, background: "oklch(0.92 0.01 90)" }} />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Nombres */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <Field
                label={isES ? "Nombre" : "First name"}
                htmlFor="first"
                input={
                  <input
                    id="first"
                    type="text"
                    autoComplete="given-name"
                    required
                    placeholder="Laura"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={loading}
                    style={inputStyle()}
                  />
                }
              />
              <Field
                label={isES ? "Apellido" : "Last name"}
                htmlFor="last"
                input={
                  <input
                    id="last"
                    type="text"
                    autoComplete="family-name"
                    required
                    placeholder="Mendoza"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={loading}
                    style={inputStyle()}
                  />
                }
              />
            </div>

            {/* Email */}
            <Field
              label={isES ? "Correo electrónico" : "Email"}
              htmlFor="email"
              icon={IcoMail}
              input={
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder={isES ? "nombre@correo.com" : "name@email.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  style={inputStyle(true)}
                />
              }
              mb={10}
            />

            {/* RUT/DNI — sólo paciente */}
            {!isProfessional && (
              <Field
                label={isES ? "RUT / DNI" : "National ID"}
                htmlFor="national-id"
                icon={IcoIdCard}
                input={
                  <input
                    id="national-id"
                    type="text"
                    required
                    placeholder={isES ? "Ej: 12.345.678-9" : "e.g. 12.345.678-9"}
                    value={nationalId}
                    onChange={(e) => setNationalId(formatRUT(e.target.value))}
                    disabled={loading}
                    style={inputStyle(true)}
                  />
                }
                mb={10}
              />
            )}

            {/* Profesional */}
            {isProfessional && (
              <>
                <Field
                  label={isES ? "Especialidad principal" : "Main specialty"}
                  htmlFor="specialty"
                  icon={IcoShield}
                  input={
                    <select
                      id="specialty"
                      required
                      value={specialty}
                      onChange={(e) => {
                        setSpecialty(e.target.value)
                        if (e.target.value !== "Otra") setOtherSpecialty("")
                      }}
                      disabled={loading}
                      style={{
                        ...inputStyle(true),
                        appearance: "none",
                        background:
                          "white url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23234e3f' stroke-width='2'><path d='m6 9 6 6 6-6'/></svg>\") no-repeat right 14px center",
                      }}
                    >
                      <option value="">
                        {isES ? "Selecciona una especialidad" : "Select a specialty"}
                      </option>
                      {SPECIALTIES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  }
                  hint={
                    isES
                      ? "Verificaremos tu registro profesional antes de publicar tu perfil."
                      : "We'll verify your professional registration before publishing your profile."
                  }
                  mb={specialty === "Otra" ? 12 : 16}
                />

                {specialty === "Otra" && (
                  <Field
                    label={isES ? "¿Cuál es tu especialidad?" : "What is your specialty?"}
                    htmlFor="other-specialty"
                    input={
                      <input
                        id="other-specialty"
                        type="text"
                        required
                        placeholder={isES ? "Ej: Podología" : "e.g. Podiatry"}
                        value={otherSpecialty}
                        onChange={(e) => setOtherSpecialty(e.target.value)}
                        disabled={loading}
                        style={inputStyle()}
                      />
                    }
                    mb={10}
                  />
                )}

                <Field
                  label={isES ? "Nº de registro profesional" : "Professional registration No."}
                  htmlFor="registration"
                  input={
                    <input
                      id="registration"
                      type="text"
                      required
                      placeholder={isES ? "Ej: 123456" : "e.g. 123456"}
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      disabled={loading}
                      style={inputStyle()}
                    />
                  }
                  mb={10}
                />
              </>
            )}

            {/* Password */}
            <div style={{ marginBottom: 12 }}>
              <label
                htmlFor="pw"
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "oklch(0.35 0.03 170)",
                  marginBottom: 4,
                }}
              >
                {isES ? "Crear contraseña" : "Create password"}
              </label>
              <div style={{ position: "relative" }}>
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "oklch(0.55 0.02 170)",
                    pointerEvents: "none",
                  }}
                >
                  {IcoLock}
                </span>
                <input
                  id="pw"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder={isES ? "Mínimo 8 caracteres" : "At least 8 characters"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  style={{
                    ...inputStyle(true),
                    paddingRight: 44,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? (isES ? "Ocultar" : "Hide") : (isES ? "Mostrar" : "Show")}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 32,
                    height: 32,
                    background: "transparent",
                    border: "none",
                    borderRadius: 8,
                    color: "oklch(0.55 0.02 170)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {showPassword ? IcoEyeOff : IcoEye}
                </button>
              </div>

              {/* Strength */}
              <div style={{ marginTop: 6 }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                  {[1, 2, 3, 4].map((i) => {
                    const on = strength >= i
                    const colors = [
                      "oklch(0.65 0.18 25)", // 1 — danger
                      "oklch(0.72 0.12 70)", // 2 — amber
                      "oklch(0.68 0.11 120)", // 3 — olive
                      "oklch(0.72 0.12 150)", // 4 — sage-500
                    ]
                    return (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: 3,
                          borderRadius: 2,
                          background: on ? colors[strength - 1] : "oklch(0.92 0.01 90)",
                          transition: "background 0.3s",
                        }}
                      />
                    )
                  })}
                </div>
                <div style={{ fontSize: 12, color: "oklch(0.55 0.02 170)" }}>
                  {password.length === 0
                    ? (isES ? "Escribe una contraseña para ver su fortaleza" : "Type a password to see its strength")
                    : [
                        "",
                        isES ? "Débil — mejórala un poco" : "Weak — improve it",
                        isES ? "Aceptable" : "Acceptable",
                        isES ? "Fuerte" : "Strong",
                        isES ? "Excelente" : "Excellent",
                      ][strength]}
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <CheckLine
              checked={acceptedTerms}
              onChange={() => setAcceptedTerms((v) => !v)}
              disabled={loading}
            >
              {isES ? (
                <>
                  Acepto los{" "}
                  <Link href="/legal/terms" style={linkStyle}>
                    términos del servicio
                  </Link>{" "}
                  y la{" "}
                  <Link href="/legal/privacy" style={linkStyle}>
                    política de privacidad
                  </Link>{" "}
                  de Nurea.
                </>
              ) : (
                <>
                  I accept Nurea's{" "}
                  <Link href="/legal/terms" style={linkStyle}>
                    terms of service
                  </Link>{" "}
                  and{" "}
                  <Link href="/legal/privacy" style={linkStyle}>
                    privacy policy
                  </Link>
                  .
                </>
              )}
            </CheckLine>

            <CheckLine
              checked={newsletter}
              onChange={() => setNewsletter((v) => !v)}
              disabled={loading}
            >
              {isES
                ? "Recibir el Diario de Nurea — una carta mensual, nunca spam."
                : "Get the Nurea Journal — a monthly letter, never spam."}
            </CheckLine>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 6,
                width: "100%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "11px 18px",
                background: loading ? "oklch(0.45 0.09 150)" : "oklch(0.20 0.03 170)",
                color: "white",
                border: "none",
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.25s",
                boxShadow: "0 10px 24px -14px oklch(0.3 0.04 170 / 0.5)",
              }}
            >
              {loading ? (
                <>{isES ? "Creando tu cuenta…" : "Creating account…"}</>
              ) : (
                <>
                  {isES ? "Crear mi cuenta" : "Create my account"}
                  {IcoArrow}
                </>
              )}
            </button>

          </form>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 11,
            color: "oklch(0.55 0.02 170)",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div>© {new Date().getFullYear()} Nurea</div>
          <div style={{ display: "flex", gap: 14 }}>
            <Link href="/legal/privacy" style={{ color: "inherit", textDecoration: "none" }}>
              {isES ? "Privacidad" : "Privacy"}
            </Link>
            <Link href="/legal/terms" style={{ color: "inherit", textDecoration: "none" }}>
              {isES ? "Términos" : "Terms"}
            </Link>
            <Link href="/help" style={{ color: "inherit", textDecoration: "none" }}>
              {isES ? "Ayuda" : "Help"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

/* ------------------------------------------------------------------
 *  Field wrapper
 * ------------------------------------------------------------------ */
function Field({
  label,
  htmlFor,
  icon,
  input,
  hint,
  mb = 0,
}: {
  label: string
  htmlFor: string
  icon?: React.ReactNode
  input: React.ReactNode
  hint?: string
  mb?: number
}) {
  return (
    <div style={{ marginBottom: mb }}>
      <label
        htmlFor={htmlFor}
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 500,
          color: "oklch(0.35 0.03 170)",
          marginBottom: 4,
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        {icon && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "oklch(0.55 0.02 170)",
              pointerEvents: "none",
            }}
          >
            {icon}
          </span>
        )}
        {input}
      </div>
      {hint && (
        <div style={{ marginTop: 6, fontSize: 12, color: "oklch(0.55 0.02 170)" }}>{hint}</div>
      )}
    </div>
  )
}

function inputStyle(withIcon = false): React.CSSProperties {
  return {
    width: "100%",
    height: 40,
    border: "1px solid oklch(0.92 0.01 90)",
    background: "oklch(0.98 0.005 90)",
    borderRadius: 10,
    padding: withIcon ? "0 14px 0 40px" : "0 14px",
    fontSize: 13.5,
    color: "oklch(0.20 0.03 170)",
    outline: "none",
    transition: "all 0.2s",
    fontFamily: "inherit",
  }
}

const linkStyle: React.CSSProperties = {
  color: "oklch(0.45 0.09 150)",
  textDecoration: "none",
  fontWeight: 500,
}

/* ------------------------------------------------------------------
 *  Checkbox
 * ------------------------------------------------------------------ */
function CheckLine({
  checked,
  onChange,
  disabled,
  children,
}: {
  checked: boolean
  onChange: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 9,
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: 12.5,
        color: "oklch(0.35 0.03 170)",
        lineHeight: 1.4,
        marginBottom: 8,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
      />
      <span
        aria-hidden
        style={{
          width: 18,
          height: 18,
          border: `1.5px solid ${checked ? "oklch(0.20 0.03 170)" : "oklch(0.92 0.01 90)"}`,
          borderRadius: 5,
          background: checked ? "oklch(0.20 0.03 170)" : "white",
          flexShrink: 0,
          marginTop: 1,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          transition: "all 0.2s",
        }}
      >
        {checked && IcoCheck}
      </span>
      <span>{children}</span>
    </label>
  )
}

/* ------------------------------------------------------------------
 *  Default export + Suspense
 * ------------------------------------------------------------------ */
export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            background: "oklch(0.985 0.005 90)",
            color: "oklch(0.35 0.03 170)",
            fontFamily: "var(--font-inter), ui-sans-serif, system-ui",
            fontSize: 14,
          }}
        >
          <span>Cargando…</span>
        </main>
      }
    >
      <RegisterContent />
    </Suspense>
  )
}
