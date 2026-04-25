"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const IcoArrowBack = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
)
const IcoArrow = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
)
const IcoCheckSmall = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
    <path d="M5 13l4 4L19 7" />
  </svg>
)
const IcoGoogle = (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
  </svg>
)
const IcoMail = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
)
const IcoLock = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 1 1 8 0v4" />
  </svg>
)
const IcoEye = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)
const IcoEyeOff = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <path d="M1 1l22 22" />
  </svg>
)

const PROFESSIONS = [
  "Psicología clínica",
  "Psiquiatría",
  "Medicina general",
  "Psicopedagogía",
  "Terapia ocupacional",
  "Fisioterapia",
  "Nutrición",
  "Logopedia",
  "Enfermería",
  "Otro",
]

function getPasswordStrength(password: string): 0 | 1 | 2 | 3 {
  if (password.length === 0) return 0
  let points = 0
  if (password.length >= 8) points++
  if (password.length >= 12) points++
  if (/[A-Z]/.test(password)) points++
  if (/[a-z]/.test(password)) points++
  if (/[0-9]/.test(password)) points++
  if (/[^A-Za-z0-9]/.test(password)) points++
  // Map 0-6 points → 3 levels
  if (points <= 2) return 1   // débil
  if (points <= 4) return 2   // media
  return 3                    // fuerte
}

const PW_META: Record<number, { label: string; color: string }> = {
  0: { label: "", color: "var(--line)" },
  1: { label: "Contraseña débil", color: "#dc2626" },       // rojo
  2: { label: "Contraseña media", color: "#eab308" },       // amarillo
  3: { label: "Contraseña fuerte", color: "#22c55e" },      // verde
}

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [role, setRole] = useState<"patient" | "professional">("patient")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [profession, setProfession] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [agreedPrivacy, setAgreedPrivacy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const pwStrength = getPasswordStrength(password)
  const isProfessional = role === "professional"

  async function handleGoogleSignUp(e?: React.MouseEvent) {
    if (e) e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        queryParams: { role },
      },
    })

    if (signInError) {
      console.error("Google OAuth error:", signInError)
      setError("No se pudo iniciar el registro con Google")
      setLoading(false)
    }
  }

  async function handleEmailSignUp(e: React.FormEvent) {
    e.preventDefault()

    const isValid = firstName && lastName && email && password && password.length >= 8
    if (!isValid) {
      setError("Por favor, completa todos los campos.")
      return
    }
    if (isProfessional && (!profession || !licenseNumber)) {
      setError("Completa tu profesión y RUT.")
      return
    }
    if (!agreedTerms || !agreedPrivacy) {
      setError("Debes aceptar los términos y la política de privacidad.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password, role, profession, licenseNumber }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || data.error || "Error al crear cuenta")
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch (err) {
      console.error("Signup error:", err)
      setError("Error de conexión. Intenta de nuevo.")
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="auth">
        <aside className="auth-side">
          <div className="auth-side-blob one" />
          <div className="auth-side-blob two" />
          <Link href="/" className="auth-logo">
            <Image src="/logos/nurea-logo.svg" alt="Logo Nurea" width={32} height={32} priority />
            <span>Nurea</span>
          </Link>
        </aside>
        <main className="auth-main">
          <div className="auth-form-wrap" style={{ textAlign: "center", maxWidth: 400 }}>
            <div style={{ marginBottom: 24 }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--sage-600)" strokeWidth={1.5}>
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </div>
            <h1 className="serif" style={{ marginBottom: 12 }}>
              Revisa tu correo
            </h1>
            <p className="sub" style={{ marginBottom: 32 }}>
              Te enviamos un enlace de verificación a <strong>{email}</strong>. Haz clic en el enlace para activar tu cuenta.
            </p>
            <button type="button" className="submit-btn" onClick={() => router.push("/login")}>
              <span>Volver al inicio de sesión</span>
              {IcoArrow}
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="auth">
      {/* LEFT: brand side */}
      <aside className="auth-side">
        <div className="auth-side-blob one" />
        <div className="auth-side-blob two" />

        <Link href="/" className="auth-logo">
          <Image src="/logos/nurea-logo.svg" alt="Logo Nurea" width={32} height={32} priority />
          <span>Nurea</span>
        </Link>

        <div className="auth-quote">
          <div className="auth-quote-eyebrow">Psicóloga clínica</div>
          <blockquote>
            &quot;Un lugar <em>tranquilo</em> y <em>seguro</em> para comenzar tu proceso. <em>Nunca</em> fue tan <em>fácil</em>. ¡<em>Comienza hoy</em> desde <em>Nurea</em>!&quot;
          </blockquote>
          <div className="auth-quote-author">
            <Image
              src="/Maria San Luis.jpeg"
              alt="Ps. María San Luis"
              width={56}
              height={56}
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                objectFit: "cover",
                display: "block",
                border: "2px solid rgba(255,255,255,0.2)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
              }}
            />
            <div>
              <div className="auth-quote-name">Ps. María San Luis</div>
              <div className="auth-quote-role">Psicóloga clínica · Temuco, Chile</div>
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT: form */}
      <main className="auth-main">
        <div className="auth-top">
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", color: "var(--ink-soft)", fontWeight: 500 }}>
            {IcoArrowBack}
            Volver
          </Link>
          <div>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" style={{ color: "var(--sage-700)", fontWeight: 600, border: "none", padding: 0 }}>
              Inicia sesión
            </Link>
          </div>
        </div>

        <div className="auth-form-wrap">
          <h1 className="serif">
            Crea tu <em>cuenta</em>.
          </h1>
          <p className="sub">
            Regístrate en menos de un minuto. Sin compromiso.
          </p>

          {/* Role toggle - animated pill */}
          <div className="role-toggle" style={{ position: "relative", marginBottom: 24 }}>
            <div
              className="role-pill"
              style={{
                left: isProfessional ? "calc(50% + 2px)" : "4px",
                right: isProfessional ? "4px" : "calc(50% + 2px)",
                width: "calc(50% - 6px)",
              }}
            />
            <button
              type="button"
              onClick={() => setRole("patient")}
              className={!isProfessional ? "active" : ""}
            >
              <strong>Soy paciente</strong>
              <span>Busco profesionales</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("professional")}
              className={isProfessional ? "active" : ""}
            >
              <strong>Soy profesional</strong>
              <span>Ofrezco servicios</span>
            </button>
          </div>

          {error && (
            <div
              role="alert"
              style={{
                marginBottom: 16,
                borderRadius: 12,
                border: "1px solid color-mix(in oklab, var(--danger) 30%, transparent)",
                background: "color-mix(in oklab, var(--danger) 10%, var(--bg))",
                color: "var(--danger)",
                padding: "10px 14px",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading}
            style={{
              width: "100%",
              height: "56px",
              background: "#fff",
              border: "1px solid var(--line)",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              fontSize: 16,
              fontWeight: 500,
              color: "var(--ink)",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              marginBottom: 20,
              transition: "all 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            {IcoGoogle}
            Continuar con Google
          </button>

          <div className="divider">o regístrate con correo</div>

          <form onSubmit={handleEmailSignUp} noValidate>
            <div className="field-row">
              <div className="field" style={{ marginBottom: 12 }}>
                <label htmlFor="firstName">Nombre</label>
                <div className="field-input-wrap">
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder="Tu nombre"
                    required
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="field" style={{ marginBottom: 12 }}>
                <label htmlFor="lastName">Apellido</label>
                <div className="field-input-wrap">
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder="Tu apellido"
                    required
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="field" style={{ marginBottom: 12 }}>
              <label htmlFor="email">Correo electrónico</label>
              <div className="field-input-wrap has-icon">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="tu@email.com"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                <span className="field-icon">{IcoMail}</span>
              </div>
            </div>

            <div className="field" style={{ marginBottom: 12 }}>
              <label htmlFor="password">Contraseña</label>
              <div className="field-input-wrap has-icon">
                <input
                  type={showPw ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <span className="field-icon">{IcoLock}</span>
                <button
                  type="button"
                  className="toggle-pw"
                  aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setShowPw((v) => !v)}
                >
                  {showPw ? IcoEyeOff : IcoEye}
                </button>
              </div>
              {password.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: 4,
                          borderRadius: 2,
                          background: pwStrength >= i ? PW_META[pwStrength].color : "var(--line)",
                          transition: "background 0.3s",
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: PW_META[pwStrength].color, transition: "color 0.3s" }}>
                    {PW_META[pwStrength].label}
                  </div>
                </div>
              )}
            </div>

            {/* Professional extra fields */}
            {isProfessional && (
              <div className="pro-fields show">
                <div className="pro-section-lbl">Información profesional</div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="field" style={{ marginBottom: 14 }}>
                    <label htmlFor="profession">Profesión</label>
                    <div className="field-input-wrap">
                      <select
                        id="profession"
                        name="profession"
                        required
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        disabled={loading}
                      >
                        <option value="">Selecciona</option>
                        {PROFESSIONS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="field" style={{ marginBottom: 14 }}>
                    <label htmlFor="rut">
                      RUT
                    </label>
                    <div className="field-input-wrap">
                      <input
                        type="text"
                        id="rut"
                        name="rut"
                        placeholder="Ej. 12.345.678-5"
                        required
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Terms & Privacy */}
            <label className="check" style={{ marginBottom: 16, marginTop: 8 }}>
              <input
                type="checkbox"
                checked={agreedTerms && agreedPrivacy}
                onChange={(e) => {
                  setAgreedTerms(e.target.checked)
                  setAgreedPrivacy(e.target.checked)
                }}
                required
              />
              <span className="check-box">{IcoCheckSmall}</span>
              <span style={{ fontSize: 12.5 }}>
                Acepto los{" "}
                <Link href="/terms" target="_blank" style={{ color: "var(--sage-700)", fontWeight: 500 }}>
                  Términos y Condiciones
                </Link>
                , la{" "}
                <Link href="/privacy" target="_blank" style={{ color: "var(--sage-700)", fontWeight: 500 }}>
                  Política de Privacidad
                </Link>{" "}
                y el tratamiento de mis datos de salud.
              </span>
            </label>

            <button type="submit" className="submit-btn" disabled={loading}>
              <span>{loading ? "Creando cuenta…" : "Crear mi cuenta"}</span>
              {!loading && IcoArrow}
            </button>
          </form>
        </div>

        <div className="auth-footer">
          <div>© {new Date().getFullYear()} Nurea</div>
          <div>
            <Link href="/privacy">Privacidad</Link>
            <Link href="/terms">Términos</Link>
            <a href="mailto:hola@nurea.app">Ayuda</a>
          </div>
        </div>
      </main>
    </div>
  )
}