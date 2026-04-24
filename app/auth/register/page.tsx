"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useSignUp } from "@clerk/nextjs"
import { useLanguage } from "@/contexts/language-context"

/* ------------------------------------------------------------------
 *  Inline icons (no lucide-react)
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
 *  RegisterContent (Clerk-based)
 * ------------------------------------------------------------------ */
function RegisterContent() {
  const { language } = useLanguage()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { signUp } = useSignUp()
  const isES = language === "es"

  /* —— Role toggle —— */
  const initialRole: "paciente" | "profesional" =
    searchParams.get("role") === "pro" || searchParams.get("role") === "professional"
      ? "profesional"
      : "paciente"
  const [role, setRole] = useState<"paciente" | "profesional">(initialRole)

  const toggleRef = useRef<HTMLDivElement | null>(null)
  const patientBtnRef = useRef<HTMLButtonElement | null>(null)
  const proBtnRef = useRef<HTMLButtonElement | null>(null)
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number }>({ left: 4, width: 0 })

  useEffect(() => {
    const positionPill = () => {
      const btn = role === "paciente" ? patientBtnRef.current : proBtnRef.current
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
  const [rut, setRut] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const strength = useMemo(() => scorePassword(password), [password])

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

    // Validation
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError(isES ? "Completa todos los campos requeridos." : "Please complete all required fields.")
      return
    }
    if (password.length < 8) {
      setError(isES ? "La contraseña debe tener mínimo 8 caracteres." : "Password must be at least 8 characters.")
      return
    }
    if (!rut.trim()) {
      setError(isES ? "Ingresa tu RUT." : "Please enter your RUT.")
      return
    }
    if (!dateOfBirth) {
      setError(isES ? "Ingresa tu fecha de nacimiento." : "Please enter your date of birth.")
      return
    }
    if (!acceptedTerms) {
      setError(isES ? "Debes aceptar los términos para continuar." : "You must accept the terms to continue.")
      return
    }
    if (!acceptedPrivacy) {
      setError(isES ? "Debes aceptar la política de privacidad para continuar." : "You must accept the privacy policy to continue.")
      return
    }

    if (!signUp) {
      setError(isES ? "Error de autenticación." : "Authentication error.")
      return
    }

    setLoading(true)
    try {
      // Create user with Clerk
      const result = await signUp.create({
        emailAddress: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        unsafeMetadata: {
          userType: role,
          rut: rut.trim(),
          dateOfBirth: dateOfBirth,
        },
      })

      if (result) {
        setSuccess(true)
        // Redirect to onboarding after a brief delay
        setTimeout(() => {
          router.push("/onboarding")
        }, 2000)
      } else {
        setError(isES ? "No se pudo crear la cuenta." : "Failed to create account.")
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : isES ? "Error al registrarse" : "Error signing up"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    try {
      const next = role === "profesional" ? "/onboarding?role=profesional" : "/onboarding?role=paciente"
      window.location.href = `/api/auth/google?next=${encodeURIComponent(next)}`
    } catch {
      setError(isES ? "No se pudo iniciar Google." : "Could not start Google sign-up.")
      setLoading(false)
    }
  }

  /* ------------------------------------------------------------------
   *  Success / Pending screen
   * ------------------------------------------------------------------ */
  if (success) {
    return (
      <div className="auth">
        <aside className="auth-side">
          <div className="auth-side-blob one" />
          <div className="auth-side-blob two" />
          <Link href="/" className="auth-logo">
            <img src="/logo.png" alt="Nurea" style={{ width: 32, height: 32, objectFit: "contain" }} />
            <span>Nurea</span>
          </Link>
          <div className="auth-quote">
            <div className="auth-quote-eyebrow">{isES ? "Por qué Nurea" : "Why Nurea"}</div>
            <blockquote>
              {isES ? (
                <>
                  Una plataforma que entiende que el cuidado es un proceso, no una{" "}
                  <em>transacción</em>.
                </>
              ) : (
                <>
                  A platform that understands care is a process, not a <em>transaction</em>.
                </>
              )}
            </blockquote>
            <div className="auth-quote-author">
              <div className="auth-quote-av" />
              <div>
                <div className="auth-quote-name">Dra. Laura Mendoza</div>
                <div className="auth-quote-role">
                  {isES ? "Psicóloga clínica · Madrid" : "Clinical psychologist · Madrid"}
                </div>
              </div>
            </div>
          </div>
          <div className="auth-side-stats">
            <div>
              <div className="auth-side-stat-num serif">14 {isES ? "días" : "days"}</div>
              <div className="auth-side-stat-label">{isES ? "Gratis pro" : "Free pro"}</div>
            </div>
            <div>
              <div className="auth-side-stat-num serif">48h</div>
              <div className="auth-side-stat-label">{isES ? "Primera cita" : "First visit"}</div>
            </div>
            <div>
              <div className="auth-side-stat-num serif">0%</div>
              <div className="auth-side-stat-label">{isES ? "Permanencia" : "Commitment"}</div>
            </div>
          </div>
        </aside>

        <main className="auth-main">
          <div className="auth-top">
            <Link
              href="/"
              style={{
                border: "none",
                padding: 0,
                color: "var(--ink-soft)",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
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
                style={{
                  color: "var(--sage-700)",
                  fontWeight: 600,
                  border: "none",
                  padding: 0,
                }}
              >
                {isES ? "Iniciar sesión" : "Sign in"}
              </Link>
            </div>
          </div>

          <div className="auth-form-wrap">
            <div style={{ textAlign: "center", paddingTop: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>✓</div>
              <h1 className="serif" style={{ marginBottom: 16 }}>
                {isES ? "¡Cuenta creada!" : "Account created!"}
              </h1>
              <p style={{ fontSize: 15, color: "var(--ink-soft)", marginBottom: 24 }}>
                {isES
                  ? "Tu cuenta ha sido creada exitosamente. Redirigiendo a la página de perfil..."
                  : "Your account has been created successfully. Redirecting to your profile..."}
              </p>
            </div>
          </div>

          <div className="auth-footer">
            <div>© {new Date().getFullYear()} Nurea Health</div>
            <div>
              <Link href="/legal/privacy">{isES ? "Privacidad" : "Privacy"}</Link>
              <Link href="/legal/terms">{isES ? "Términos" : "Terms"}</Link>
              <Link href="/help">{isES ? "Ayuda" : "Help"}</Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  /* ------------------------------------------------------------------
   *  Main form screen
   * ------------------------------------------------------------------ */
  return (
    <div className="auth">
      {/* LEFT — brand side */}
      <aside className="auth-side">
        <div className="auth-side-blob one" />
        <div className="auth-side-blob two" />

        <Link href="/" className="auth-logo">
          <img src="/logo.png" alt="Nurea" style={{ width: 32, height: 32, objectFit: "contain" }} />
          <span>Nurea</span>
        </Link>

        <div className="auth-quote">
          <div className="auth-quote-eyebrow">{isES ? "Por qué Nurea" : "Why Nurea"}</div>
          <blockquote>
            {isES ? (
              <>
                "Una plataforma que entiende que el cuidado es un proceso, no una{" "}
                <em>transacción</em>."
              </>
            ) : (
              <>
                "A platform that understands care is a process, not a <em>transaction</em>."
              </>
            )}
          </blockquote>
          <div className="auth-quote-author">
            <div className="auth-quote-av" />
            <div>
              <div className="auth-quote-name">Dra. Laura Mendoza</div>
              <div className="auth-quote-role">
                {isES ? "Psicóloga clínica · Madrid" : "Clinical psychologist · Madrid"}
              </div>
            </div>
          </div>
        </div>

        <div className="auth-side-stats">
          <div>
            <div className="auth-side-stat-num serif">14 {isES ? "días" : "days"}</div>
            <div className="auth-side-stat-label">{isES ? "Gratis pro" : "Free pro"}</div>
          </div>
          <div>
            <div className="auth-side-stat-num serif">48h</div>
            <div className="auth-side-stat-label">{isES ? "Primera cita" : "First visit"}</div>
          </div>
          <div>
            <div className="auth-side-stat-num serif">0%</div>
            <div className="auth-side-stat-label">{isES ? "Permanencia" : "Commitment"}</div>
          </div>
        </div>
      </aside>

      {/* RIGHT — form side */}
      <main className="auth-main">
        <div className="auth-top">
          <Link
            href="/"
            style={{
              border: "none",
              padding: 0,
              color: "var(--ink-soft)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
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
              style={{
                color: "var(--sage-700)",
                fontWeight: 600,
                border: "none",
                padding: 0,
              }}
            >
              {isES ? "Iniciar sesión" : "Sign in"}
            </Link>
          </div>
        </div>

        <div className="auth-form-wrap">
          <h1 className="serif">
            {isES ? (
              <>
                Empieza tu <em>camino</em>.
              </>
            ) : (
              <>
                Begin your <em>journey</em>.
              </>
            )}
          </h1>
          <p className="sub">
            {isES
              ? "Crea tu cuenta en menos de dos minutos."
              : "Create your account in less than two minutes."}
          </p>

          {/* Role toggle */}
          <div className="role-toggle" ref={toggleRef}>
            <div
              className="role-pill"
              style={{ left: pillStyle.left, width: pillStyle.width }}
            />
            <button
              ref={patientBtnRef}
              type="button"
              className={role === "paciente" ? "active" : ""}
              onClick={() => setRole("paciente")}
              aria-pressed={role === "paciente"}
            >
              <strong>{isES ? "Soy paciente" : "I'm a patient"}</strong>
              <span>{isES ? "Busco profesionales" : "Looking for professionals"}</span>
            </button>
            <button
              ref={proBtnRef}
              type="button"
              className={role === "profesional" ? "active" : ""}
              onClick={() => setRole("profesional")}
              aria-pressed={role === "profesional"}
            >
              <strong>{isES ? "Soy profesional" : "I'm a professional"}</strong>
              <span>{isES ? "Ofrezco mis servicios" : "I offer my services"}</span>
            </button>
          </div>

          {/* Step indicator */}
          <div className="steps">
            <div className="step done" />
            <div className="step" />
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
                marginBottom: 14,
              }}
            >
              <span style={{ fontSize: 14 }}>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Social */}
          <div className="social-row">
            <button type="button" className="social-btn" onClick={handleGoogle} disabled={loading}>
              {IcoGoogle}
              {isES ? "Continuar con Google" : "Continue with Google"}
            </button>
            <button type="button" className="social-btn" onClick={handleGoogle} disabled={loading}>
              {IcoApple}
              {isES ? "Continuar con Apple" : "Continue with Apple"}
            </button>
          </div>

          <div className="divider">
            {isES ? "o regístrate con correo" : "or sign up with email"}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Names */}
            <div className="field-row">
              <div className="field">
                <label htmlFor="first">{isES ? "Nombre" : "First name"}</label>
                <div className="field-input-wrap">
                  <input
                    id="first"
                    type="text"
                    autoComplete="given-name"
                    required
                    placeholder="Laura"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="last">{isES ? "Apellido" : "Last name"}</label>
                <div className="field-input-wrap">
                  <input
                    id="last"
                    type="text"
                    autoComplete="family-name"
                    required
                    placeholder="Mendoza"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="field">
              <label htmlFor="email">{isES ? "Correo electrónico" : "Email"}</label>
              <div className="field-input-wrap has-icon">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder={isES ? "nombre@correo.com" : "name@email.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                <span className="field-icon">{IcoMail}</span>
              </div>
            </div>

            {/* Password */}
            <div className="field">
              <label htmlFor="pw">{isES ? "Contraseña" : "Password"}</label>
              <div className="field-input-wrap has-icon">
                <input
                  id="pw"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder={isES ? "Mínimo 8 caracteres" : "At least 8 characters"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <span className="field-icon">{IcoLock}</span>
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? (isES ? "Ocultar" : "Hide") : isES ? "Mostrar" : "Show"}
                >
                  {showPassword ? IcoEyeOff : IcoEye}
                </button>
              </div>
              {/* Strength */}
              <div className="pw-bars">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`pw-bar${strength >= i ? ` on-${strength}` : ""}`}
                  />
                ))}
              </div>
              <div className="pw-label">
                {password.length === 0
                  ? isES
                    ? "Elige una contraseña segura"
                    : "Choose a secure password"
                  : [
                      "",
                      isES ? "Débil — mejórala" : "Weak — improve it",
                      isES ? "Aceptable" : "Acceptable",
                      isES ? "Fuerte" : "Strong",
                      isES ? "Excelente" : "Excellent",
                    ][strength]}
              </div>
            </div>

            {/* RUT */}
            <div className="field">
              <label htmlFor="rut">{isES ? "RUT" : "RUT"}</label>
              <div className="field-input-wrap">
                <input
                  id="rut"
                  type="text"
                  required
                  placeholder={isES ? "12.345.678-9" : "e.g. 12.345.678-9"}
                  value={rut}
                  onChange={(e) => setRut(formatRUT(e.target.value))}
                  disabled={loading}
                />
              </div>
              <div className="field-hint">
                {isES ? "Tu RUT (número de identificación chileno)" : "Your RUT (Chilean ID number)"}
              </div>
            </div>

            {/* Date of Birth */}
            <div className="field">
              <label htmlFor="dob">{isES ? "Fecha de nacimiento" : "Date of birth"}</label>
              <div className="field-input-wrap">
                <input
                  id="dob"
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <label className="check">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={() => setAcceptedTerms((v) => !v)}
                disabled={loading}
                required
              />
              <span className="check-box">{IcoCheck}</span>
              <span>
                {isES ? (
                  <>
                    Acepto los <Link href="/terms">{isES ? "términos del servicio" : "terms of service"}</Link>
                  </>
                ) : (
                  <>
                    I accept the <Link href="/terms">terms of service</Link>
                  </>
                )}
              </span>
            </label>

            {/* Privacy checkbox */}
            <label className="check">
              <input
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={() => setAcceptedPrivacy((v) => !v)}
                disabled={loading}
                required
              />
              <span className="check-box">{IcoCheck}</span>
              <span>
                {isES ? (
                  <>
                    Acepto la <Link href="/privacy">{isES ? "política de privacidad" : "privacy policy"}</Link>
                  </>
                ) : (
                  <>
                    I accept the <Link href="/privacy">privacy policy</Link>
                  </>
                )}
              </span>
            </label>

            <button type="submit" className="submit-btn" disabled={loading}>
              <span>
                {loading
                  ? isES
                    ? "Creando cuenta..."
                    : "Creating account..."
                  : isES
                  ? "Crear mi cuenta"
                  : "Create my account"}
              </span>
              {!loading && IcoArrow}
            </button>

            <div className="swap-link">
              {isES ? "¿Ya tienes cuenta?" : "Already have an account?"}{" "}
              <Link href="/login">{isES ? "Iniciar sesión" : "Sign in"}</Link>
            </div>
          </form>
        </div>

        <div className="auth-footer">
          <div>© {new Date().getFullYear()} Nurea Health</div>
          <div>
            <Link href="/privacy">{isES ? "Privacidad" : "Privacy"}</Link>
            <Link href="/terms">{isES ? "Términos" : "Terms"}</Link>
            <Link href="/help">{isES ? "Ayuda" : "Help"}</Link>
          </div>
        </div>
      </main>
    </div>
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
            background: "var(--bg)",
            color: "var(--ink-soft)",
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
