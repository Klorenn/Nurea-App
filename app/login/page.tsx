"use client"

import Link from "next/link"
import Image from "next/image"
import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/contexts/language-context"

/* ============================================================================
   /login · Supabase Auth (abril 2026)
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

  const supabase = createClient()

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

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError(null)

    console.log("[login] attempting:", { email: email.trim() })

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    console.log("[login] result:", { error: signInError?.message })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    let redirectPath = "/dashboard"
    if (isSafeCallbackUrl(callbackUrl)) {
      redirectPath = decodeURIComponent(callbackUrl!)
    }
    router.push(redirectPath)
    router.refresh()
  }

  async function handleGoogle(e?: React.MouseEvent) {
    if (e) e.preventDefault()
    setLoading(true)
    setError(null)

    const next = isSafeCallbackUrl(callbackUrl) ? decodeURIComponent(callbackUrl!) : "/dashboard"

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })

    if (signInError) {
      console.error("Google auth error:", signInError)
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
          <Image src="/logos/nurea-logo.svg" alt="Logo Nurea" width={32} height={32} priority />
          <span>Nurea</span>
        </Link>

        <div className="auth-quote">
          <div className="auth-quote-eyebrow">Founder de Nurea</div>
          <blockquote>
            &quot;Nurea es un espacio <em>seguro</em> y <em>tranquilo</em> para su proceso profesional. El <em>bienestar que todos buscaban</em>.&quot;
          </blockquote>
          <div className="auth-quote-author" style={{ marginTop: -8 }}>
            <Image
              src="/Pau Koh Founder.png"
              alt="Pau Koh"
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
              <div className="auth-quote-name">Pau Koh</div>
              <div className="auth-quote-role">Founder · Temuco, Chile</div>
            </div>
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
            <Link href="/register" style={{ color: "var(--sage-700)", fontWeight: 600, border: "none", padding: 0 }}>
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

          {/* Google OAuth - BIG BUTTON */}
          <button
            type="button"
            className="social-btn"
            onClick={handleGoogle}
            disabled={loading}
            style={{
              width: "100%",
              height: "56px",
              fontSize: "16px",
              marginBottom: 0,
            }}
          >
            {IcoGoogle}
            {isES ? "Continuar con Google" : "Continue with Google"}
          </button>

          <div className="divider">{isES ? "o continúa con correo" : "or continue with email"}</div>

          <form onSubmit={handleEmailLogin} noValidate>
            <div className="field">
              <label htmlFor="email">{isES ? "Correo electrónico" : "Email"}</label>
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
              <Link href="/register">{isES ? "Crear cuenta gratis" : "Create free account"}</Link>
            </div>
          </form>
        </div>

        <div className="auth-footer">
          <div>© {new Date().getFullYear()} Nurea</div>
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