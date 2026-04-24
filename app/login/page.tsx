"use client"

import Link from "next/link"
import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/contexts/language-context"

/* ============================================================================
   /login · rediseño Nurea (abril 2026)
   Layout del mockup login.html — utiliza las clases compartidas de app/auth.css
============================================================================ */

function isSafeCallbackUrl(url: string | null): boolean {
  if (!url || typeof url !== "string") return false
  const decoded = decodeURIComponent(url)
  return decoded.startsWith("/") && !decoded.startsWith("//")
}

/* ─── Icons ─────────────────────────────────────────────────────────────── */
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
const IcoArrow = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
)
const IcoArrowBack = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
)
const IcoCheckSmall = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
    <path d="M5 13l4 4L19 7" />
  </svg>
)
const IcoGoogle = (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
  </svg>
)
const IcoApple = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
)

/* ────────────────────────────────────────────────────────────────────── */

function LoginContent() {
  const { language } = useLanguage()
  const isES = language === "es"
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl")
  const queryError = searchParams.get("error")
  const queryMessage = searchParams.get("message")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(true)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!queryError) return
    if (queryError === "oauth_error") {
      setError(queryMessage || (isES ? "Error de autenticación con Google." : "Google authentication error."))
    } else if (queryError === "account-not-found") {
      setError(isES ? "No encontramos una cuenta con ese correo." : "We couldn't find an account with that email.")
    } else if (queryError === "exchange_failed") {
      setError(isES ? "No pudimos establecer tu sesión. Intenta de nuevo." : "Couldn't establish your session. Try again.")
    } else {
      setError(isES ? "Ocurrió un error. Intenta de nuevo." : "Something went wrong. Try again.")
    }
  }, [queryError, queryMessage, isES])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (authError) {
        setError(authError.message || (isES ? "Error al iniciar sesión" : "Sign in error"))
        setLoading(false)
        return
      }
      if (data.user && !data.user.email_confirmed_at) {
        setError(isES ? "Por favor verifica tu email antes de iniciar sesión" : "Please verify your email before signing in")
        setLoading(false)
        return
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user!.id)
        .single()
      const role = profile?.role || "patient"
      let redirectPath = "/dashboard"
      if (isSafeCallbackUrl(callbackUrl)) {
        redirectPath = decodeURIComponent(callbackUrl!)
      } else if (role === "professional") {
        redirectPath = "/dashboard/professional"
      } else if (role === "admin") {
        redirectPath = "/dashboard/admin"
      } else {
        redirectPath = "/dashboard/patient"
      }
      router.push(redirectPath)
      router.refresh()
    } catch (err) {
      const m = err instanceof Error ? err.message : isES ? "Error al iniciar sesión" : "Error signing in"
      setError(m)
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setLoading(true)
    try {
      const next = isSafeCallbackUrl(callbackUrl) ? callbackUrl : undefined
      window.location.href = next
        ? "/api/auth/google?next=" + encodeURIComponent(next!)
        : "/api/auth/google"
    } catch {
      setError(isES ? "No se pudo iniciar sesión con Google" : "Failed to initiate Google sign in")
      setLoading(false)
    }
  }

  return (
    <div className="auth">
      {/* LEFT: brand side */}
      <aside className="auth-side">
        <div className="auth-side-blob one" />
        <div className="auth-side-blob two" />

        <Link href="/" className="auth-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Nurea" style={{ width: 32, height: 32, objectFit: "contain" }} />
          <span>Nurea</span>
        </Link>

        <div className="auth-quote">
          <div className="auth-quote-eyebrow">{isES ? "Voces de la red" : "Voices from the network"}</div>
          <blockquote>
            {isES ? (
              <>
                &quot;Volver a Nurea es volver a <em>un lugar tranquilo</em> donde mis pacientes ya saben que los espero con tiempo.&quot;
              </>
            ) : (
              <>
                &quot;Coming back to Nurea is coming back to <em>a calm place</em> where my patients know I&apos;ll wait for them.&quot;
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
            <div className="auth-side-stat-num serif">12,400+</div>
            <div className="auth-side-stat-label">{isES ? "Profesionales" : "Professionals"}</div>
          </div>
          <div>
            <div className="auth-side-stat-num serif">340K+</div>
            <div className="auth-side-stat-label">{isES ? "Consultas" : "Consultations"}</div>
          </div>
          <div>
            <div className="auth-side-stat-num serif">98%</div>
            <div className="auth-side-stat-label">{isES ? "Satisfacción" : "Satisfaction"}</div>
          </div>
        </div>
      </aside>

      {/* RIGHT: form */}
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
            {IcoArrowBack}
            {isES ? "Volver" : "Back"}
          </Link>
          <div>
            {isES ? "¿Primera vez?" : "First time?"}{" "}
            <Link href="/signup" style={{ color: "var(--sage-700)", fontWeight: 600, border: "none", padding: 0 }}>
              {isES ? "Crear cuenta" : "Create account"}
            </Link>
          </div>
        </div>

        <div className="auth-form-wrap">
          <h1 className="serif">
            {isES ? (
              <>
                Hola de <em>nuevo</em>.
              </>
            ) : (
              <>
                Welcome <em>back</em>.
              </>
            )}
          </h1>
          <p className="sub">
            {isES
              ? "Retoma donde lo dejaste. Tus próximas citas, mensajes y notas te esperan."
              : "Pick up where you left off. Your appointments, messages and notes are waiting."}
          </p>

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

          <div className="social-row">
            <button type="button" className="social-btn" onClick={handleGoogle} disabled={loading}>
              {IcoGoogle}
              Google
            </button>
            <button type="button" className="social-btn" disabled={loading}>
              {IcoApple}
              Apple
            </button>
          </div>

          <div className="divider">{isES ? "o continúa con correo" : "or continue with email"}</div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="email">{isES ? "Correo profesional" : "Email"}</label>
              <div className="field-input-wrap has-icon">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder={isES ? "nombre@clinica.com" : "name@clinic.com"}
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                <span className="field-icon">{IcoMail}</span>
              </div>
            </div>

            <div className="field">
              <label htmlFor="pw">{isES ? "Contraseña" : "Password"}</label>
              <div className="field-input-wrap has-icon">
                <input
                  type={showPw ? "text" : "password"}
                  id="pw"
                  name="pw"
                  placeholder={isES ? "Tu contraseña" : "Your password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <span className="field-icon">{IcoLock}</span>
                <button
                  type="button"
                  className="toggle-pw"
                  aria-label={showPw ? (isES ? "Ocultar contraseña" : "Hide password") : (isES ? "Mostrar contraseña" : "Show password")}
                  onClick={() => setShowPw((v) => !v)}
                >
                  {showPw ? IcoEyeOff : IcoEye}
                </button>
              </div>
            </div>

            <div className="row-between">
              <label className="check" style={{ marginBottom: 0 }}>
                <input
                  type="checkbox"
                  name="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span className="check-box">{IcoCheckSmall}</span>
                <span>{isES ? "Mantener sesión iniciada" : "Remember me"}</span>
              </label>
              <Link href="/forgot-password" className="forgot">
                {isES ? "¿Olvidaste tu contraseña?" : "Forgot password?"}
              </Link>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              <span>
                {loading ? (isES ? "Verificando…" : "Verifying…") : isES ? "Iniciar sesión" : "Sign in"}
              </span>
              {!loading && IcoArrow}
            </button>

            <div className="swap-link">
              {isES ? "¿No tienes una cuenta?" : "Don't have an account?"}{" "}
              <Link href="/signup">{isES ? "Crear cuenta gratis" : "Create free account"}</Link>
            </div>
          </form>
        </div>

        <div className="auth-footer">
          <div>© {new Date().getFullYear()} Nurea Health</div>
          <div>
            <Link href="/privacy">{isES ? "Privacidad" : "Privacy"}</Link>
            <Link href="/terms">{isES ? "Términos" : "Terms"}</Link>
            <a href="mailto:hola@nurea.app">{isES ? "Ayuda" : "Help"}</a>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            height: "100dvh",
            display: "grid",
            placeItems: "center",
            background: "var(--bg)",
            color: "var(--ink-mute)",
          }}
        >
          <span style={{ fontSize: 13, opacity: 0.6 }}>Cargando…</span>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
