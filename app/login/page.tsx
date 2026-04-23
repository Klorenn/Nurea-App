"use client"

import Link from "next/link"
import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { getHumanErrorMessage } from "@/lib/auth/utils"
import { useLanguage } from "@/contexts/language-context"

/* ============================================================================
   /login · rediseño Nurea · layout compacto sin scroll (≥720px alto).
============================================================================ */

function isSafeCallbackUrl(url: string | null): boolean {
  if (!url || typeof url !== "string") return false
  const decoded = decodeURIComponent(url)
  return decoded.startsWith("/") && !decoded.startsWith("//")
}

/* Icons */
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
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
)
const IcoGoogle = (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
  </svg>
)
const IcoCheck = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
    <path d="M5 13l4 4L19 7" />
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
        setError(getHumanErrorMessage(authError.message, isES ? "es" : "en"))
        setLoading(false)
        return
      }
      if (data.user && !data.user.email_confirmed_at) {
        setError(getHumanErrorMessage("Email not confirmed", isES ? "es" : "en"))
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
      setError(getHumanErrorMessage(m, isES ? "es" : "en") || m)
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
    <main
      style={{
        height: "100dvh",
        minHeight: 560,
        overflow: "hidden",
        background: "var(--bg)",
        color: "var(--ink)",
        fontFamily: "var(--font-inter)",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
      }}
      className="lg:grid-cols-[0.85fr_1fr]"
    >
      {/* LEFT — brand (hidden on mobile) */}
      <aside
        className="relative hidden lg:flex"
        style={{
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "28px 40px",
          background:
            "linear-gradient(165deg, oklch(0.28 0.035 170) 0%, oklch(0.20 0.03 170) 55%, oklch(0.15 0.025 165) 100%)",
          color: "var(--bg)",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage:
              "radial-gradient(circle at 18% 85%, oklch(0.58 0.07 170 / 0.25), transparent 45%), radial-gradient(circle at 85% 15%, oklch(0.68 0.11 45 / 0.15), transparent 50%)",
          }}
        />
        <Link
          href="/"
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "var(--bg)",
            fontFamily: "var(--font-fraunces)",
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: "-0.02em",
          }}
        >
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "white",
              padding: 3,
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
          <span>Nurea</span>
        </Link>

        <div style={{ position: "relative", maxWidth: 400 }}>
          <div
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 10.5,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "var(--sage-200)",
              marginBottom: 12,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ width: 20, height: 1, background: "var(--sage-200)" }} />
            {isES ? "Voces de la red" : "Voices from the network"}
          </div>
          <h2
            style={{
              fontFamily: "var(--font-fraunces)",
              fontSize: 30,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              fontWeight: 300,
              marginBottom: 16,
            }}
          >
            {isES ? (
              <>
                Volver a Nurea es volver a <em style={{ fontStyle: "italic", color: "var(--sage-200)" }}>un lugar tranquilo</em>.
              </>
            ) : (
              <>
                Coming back to Nurea is coming back to <em style={{ fontStyle: "italic", color: "var(--sage-200)" }}>a calm place</em>.
              </>
            )}
          </h2>
          <p
            style={{
              fontSize: 13.5,
              lineHeight: 1.5,
              color: "color-mix(in oklab, var(--bg) 70%, transparent)",
              margin: 0,
            }}
          >
            {isES
              ? "Un lugar tranquilo donde tus pacientes ya saben que los esperas con tiempo."
              : "A calm place where your patients already know you wait for them with time."}
          </p>
        </div>

        <div
          style={{
            position: "relative",
            fontSize: 11,
            color: "color-mix(in oklab, var(--bg) 50%, transparent)",
          }}
        >
          © {new Date().getFullYear()} Nurea Health
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginTop: 16,
            paddingTop: 16,
            borderTop: "1px solid color-mix(in oklab, var(--bg) 15%, transparent)",
          }}
        >
          {[
            { num: "12,400+", label: isES ? "Profesionales" : "Professionals" },
            { num: "340K+", label: isES ? "Consultas" : "Consultations" },
            { num: "98%", label: isES ? "Satisfacción" : "Satisfaction" },
          ].map((stat) => (
            <div key={stat.label}>
              <div
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontSize: 22,
                  fontWeight: 400,
                  marginBottom: 4,
                }}
              >
                {stat.num}
              </div>
              <div
                style={{
                  fontSize: 10.5,
                  color: "color-mix(in oklab, var(--bg) 50%, transparent)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* RIGHT — form */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100dvh",
          padding: "20px 24px",
          overflow: "hidden",
        }}
        className="sm:px-10"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 13,
            color: "var(--ink-soft)",
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 999,
              border: "1px solid var(--line)",
              color: "var(--ink)",
              textDecoration: "none",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            ← {isES ? "Volver" : "Back"}
          </Link>
          <div style={{ fontSize: 12 }}>
            {isES ? "¿Sin cuenta?" : "No account?"}{" "}
            <Link
              href="/signup"
              style={{ color: "var(--sage-700)", fontWeight: 600, textDecoration: "none" }}
            >
              {isES ? "Crear gratis" : "Create free"}
            </Link>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            maxWidth: 420,
            width: "100%",
            margin: "0 auto",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-fraunces)",
              fontSize: "clamp(28px, 3.5vw, 36px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              fontWeight: 400,
              marginBottom: 6,
              color: "var(--ink)",
            }}
          >
            {isES ? (
              <>
                Hola de{" "}
                <em style={{ fontStyle: "italic", color: "var(--sage-500)", fontWeight: 300 }}>nuevo</em>.
              </>
            ) : (
              <>
                Welcome{" "}
                <em style={{ fontStyle: "italic", color: "var(--sage-500)", fontWeight: 300 }}>back</em>.
              </>
            )}
          </h1>
          <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 16 }}>
            {isES
              ? "Retoma donde lo dejaste."
              : "Pick up where you left off."}
          </p>

          {error && (
            <div
              role="alert"
              style={{
                marginBottom: 12,
                borderRadius: 12,
                border: "1px solid color-mix(in oklab, var(--danger) 30%, transparent)",
                background: "color-mix(in oklab, var(--danger) 10%, var(--bg))",
                color: "var(--danger)",
                padding: "8px 12px",
                fontSize: 12.5,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            style={{
              width: "100%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              borderRadius: 12,
              border: "1px solid var(--line)",
              background: "var(--bg)",
              color: "var(--ink)",
              padding: "10px 16px",
              fontSize: 13.5,
              fontWeight: 500,
              cursor: loading ? "default" : "pointer",
            }}
          >
            {IcoGoogle}
            {isES ? "Continuar con Google" : "Continue with Google"}
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              margin: "12px 0",
              fontSize: 11,
              color: "var(--ink-mute)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            <span style={{ height: 1, flex: 1, background: "var(--line)" }} />
            {isES ? "o con correo" : "or with email"}
            <span style={{ height: 1, flex: 1, background: "var(--line)" }} />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: 10 }}>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  marginBottom: 5,
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--ink)",
                }}
              >
                {isES ? "Correo" : "Email"}
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isES ? "nombre@correo.cl" : "name@mail.com"}
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    border: "1px solid var(--line)",
                    background: "var(--bg)",
                    color: "var(--ink)",
                    padding: "10px 14px 10px 40px",
                    fontSize: 13.5,
                    outline: "none",
                  }}
                />
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--ink-mute)",
                    pointerEvents: "none",
                  }}
                >
                  {IcoMail}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <label
                htmlFor="pw"
                style={{
                  display: "block",
                  marginBottom: 5,
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--ink)",
                }}
              >
                {isES ? "Contraseña" : "Password"}
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="pw"
                  name="pw"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isES ? "Tu contraseña" : "Your password"}
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    border: "1px solid var(--line)",
                    background: "var(--bg)",
                    color: "var(--ink)",
                    padding: "10px 40px 10px 40px",
                    fontSize: 13.5,
                    outline: "none",
                  }}
                />
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--ink-mute)",
                    pointerEvents: "none",
                  }}
                >
                  {IcoLock}
                </span>
                <button
                  type="button"
                  aria-label={showPw ? (isES ? "Ocultar" : "Hide") : isES ? "Mostrar" : "Show"}
                  onClick={() => setShowPw((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    padding: 6,
                    borderRadius: 8,
                    border: "none",
                    background: "transparent",
                    color: "var(--ink-mute)",
                    cursor: "pointer",
                  }}
                >
                  {showPw ? IcoEyeOff : IcoEye}
                </button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                  color: "var(--ink-soft)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
                />
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    border: `1.5px solid ${remember ? "var(--sage-900)" : "var(--line)"}`,
                    background: remember ? "var(--sage-900)" : "var(--bg)",
                    color: "white",
                  }}
                >
                  {remember && IcoCheck}
                </span>
                {isES ? "Recordarme" : "Remember me"}
              </label>
              <Link
                href="/forgot-password"
                style={{ fontSize: 12, fontWeight: 500, color: "var(--sage-700)", textDecoration: "none" }}
              >
                {isES ? "¿Olvidaste tu contraseña?" : "Forgot password?"}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                borderRadius: 999,
                border: "none",
                padding: "12px 20px",
                fontSize: 14,
                fontWeight: 500,
                background: "var(--ink)",
                color: "var(--bg)",
                cursor: loading ? "default" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              <span>
                {loading
                  ? isES ? "Verificando…" : "Verifying…"
                  : isES ? "Iniciar sesión" : "Sign in"}
              </span>
              {!loading && IcoArrow}
            </button>
          </form>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            fontSize: 11,
            color: "var(--ink-mute)",
          }}
        >
          <span>© {new Date().getFullYear()} Nurea</span>
          <span style={{ display: "flex", gap: 14 }}>
            <Link href="/privacy" style={{ color: "var(--ink-mute)", textDecoration: "none" }}>
              {isES ? "Privacidad" : "Privacy"}
            </Link>
            <Link href="/terms" style={{ color: "var(--ink-mute)", textDecoration: "none" }}>
              {isES ? "Términos" : "Terms"}
            </Link>
            <a href="mailto:hola@nurea.app" style={{ color: "var(--ink-mute)", textDecoration: "none" }}>
              {isES ? "Ayuda" : "Help"}
            </a>
          </span>
        </div>
      </section>
    </main>
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
