"use client"

import { useEffect, useRef, useState, type ReactElement } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useTheme } from "next-themes"
import { TermsDialog } from "@/components/ui/terms-dialog"
import { PrivacyDialog } from "@/components/ui/privacy-dialog"
import { User, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import { EyeToggleIcon } from "@/components/ui/animated-state-icons"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { createClient } from "@/lib/supabase/client"
import { getHumanErrorMessage } from "@/lib/auth/utils"

// Vertex shader source code
const vertexSmokeySource = `
  attribute vec4 a_position;
  void main() {
    gl_Position = a_position;
  }
`

// Fragment shader: movimiento turbulento / remolino (animación por tiempo).
// Estructura conservada para niebla dinámica; colores inyectados vía u_color y u_gray (paleta pálida).
const fragmentSmokeySource = `
precision mediump float;

uniform vec2 iResolution;
uniform float iTime;
uniform vec3 u_color;
uniform vec3 u_gray;

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 centeredUV = (2.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);
    float time = iTime * 0.6;

    vec2 distortion = centeredUV;
    for (float i = 1.0; i < 8.0; i++) {
        distortion.x += 0.6 / i * cos(i * 2.0 * distortion.y + time);
        distortion.y += 0.6 / i * cos(i * 2.0 * distortion.x + time * 1.1);
    }
    float wave = abs(sin(distortion.x + distortion.y + time));
    float t = smoothstep(0.08, 0.92, wave);
    vec3 color = mix(u_gray, u_color, t);
    fragColor = vec4(color, 1.0);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`

/**
 * Fondo animado turbulento para auth (login/registro).
 * WebGL con paleta de contraste: light = teal-200 / cyan-100 / blanco; dark = slate-950 + destellos teal-600.
 * El movimiento turbulento es claramente visible en ambos temas. Capa -z-10, tarjeta con shadow-2xl.
 */
export function AuthPageBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const isDark = mounted && resolvedTheme === "dark"

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Use resolvedTheme directly for the colors inside the effect
    const themeToUse = resolvedTheme === "dark"

    const gl = canvas.getContext("webgl")
    if (!gl) return

    const compileShader = (type: number, source: string): WebGLShader | null => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compilation error:", gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSmokeySource)
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSmokeySource)
    if (!vertexShader || !fragmentShader) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program linking error:", gl.getProgramInfoLog(program))
      return
    }

    gl.useProgram(program)

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    )

    const positionLocation = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    const iResolutionLocation = gl.getUniformLocation(program, "iResolution")
    const iTimeLocation = gl.getUniformLocation(program, "iTime")
    const uColorLocation = gl.getUniformLocation(program, "u_color")
    const uGrayLocation = gl.getUniformLocation(program, "u_gray")

    let startTime = Date.now()

    // Paleta con cuerpo: contraste para que el movimiento turbulento se vea claro y premium.
    // Light: teal-200, cyan-100. Dark: slate-950 base, fluido teal-600 para movimiento claramente visible.
    if (themeToUse) {
      gl.uniform3f(uGrayLocation, 0.008, 0.024, 0.09)   // slate-950 – base muy oscura
      gl.uniform3f(uColorLocation, 0.11, 0.49, 0.47)   // teal-600 – destellos vibrantes visibles
    } else {
      gl.uniform3f(uColorLocation, 0.6, 0.965, 0.894)  // teal-200 – olas/humo claramente visibles
      gl.uniform3f(uGrayLocation, 0.812, 0.98, 1.0)   // cyan-100 – base clara con cuerpo
    }

    let animationFrameId: number | null = null

    const render = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
      }
      const currentTime = (Date.now() - startTime) / 1000
      gl.uniform2f(iResolutionLocation, width, height)
      gl.uniform1f(iTimeLocation, currentTime)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      animationFrameId = requestAnimationFrame(render)
    }

    render()
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [resolvedTheme, mounted])

  return (
    <div
      className="absolute inset-0 -z-10 min-h-screen w-full overflow-hidden pointer-events-none bg-transparent dark:bg-slate-950"
      aria-hidden
    >
      <canvas ref={canvasRef} className="w-full h-full min-h-screen will-change-transform" />
      {/* Overlay mínimo: no lavar el fluido; solo un leve degradado de borde para anclar la tarjeta */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? "linear-gradient(180deg, rgba(2,6,23,0.12) 0%, transparent 50%, rgba(2,6,23,0.08) 100%)"
            : "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 40%, rgba(204,251,241,0.06) 100%)",
        }}
      />
    </div>
  )
}

interface SmokeyBackgroundProps {
  color?: string
  className?: string
  /** Ignorado: la animación ya no usa blur ni cursor */
  backdropBlurAmount?: string
}

export function SmokeyBackground({
  color = "#0EA5E9", // celeste (sky-500)
  className = "",
}: SmokeyBackgroundProps): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const hexToRgb = (hex: string): [number, number, number] => {
    const r = parseInt(hex.substring(1, 3), 16) / 255
    const g = parseInt(hex.substring(3, 5), 16) / 255
    const b = parseInt(hex.substring(5, 7), 16) / 255
    return [r, g, b]
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl")
    if (!gl) return

    const compileShader = (type: number, source: string): WebGLShader | null => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compilation error:", gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSmokeySource)
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSmokeySource)
    if (!vertexShader || !fragmentShader) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program linking error:", gl.getProgramInfoLog(program))
      return
    }

    gl.useProgram(program)

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    )

    const positionLocation = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    const iResolutionLocation = gl.getUniformLocation(program, "iResolution")
    const iTimeLocation = gl.getUniformLocation(program, "iTime")
    const uColorLocation = gl.getUniformLocation(program, "u_color")
    const uGrayLocation = gl.getUniformLocation(program, "u_gray")

    let startTime = Date.now()
    const [r, g, b] = hexToRgb(color)
    const [gr, gg, gb] = isDark ? [0.25, 0.28, 0.32] : [0.70, 0.73, 0.76]
    gl.uniform3f(uColorLocation, r, g, b)
    gl.uniform3f(uGrayLocation, gr, gg, gb)

    const render = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      canvas.width = width
      canvas.height = height
      gl.viewport(0, 0, width, height)

      const currentTime = (Date.now() - startTime) / 1000

      gl.uniform2f(iResolutionLocation, width, height)
      gl.uniform1f(iTimeLocation, currentTime)

      gl.drawArrays(gl.TRIANGLES, 0, 6)
      requestAnimationFrame(render)
    }

    render()

    return () => {}
  }, [color, isDark])

  return (
    <div className={`absolute inset-0 w-full h-full overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}

/** Si es una URL relativa segura (empieza por / y no por //) la usamos como redirect tras login */
function isSafeCallbackUrl(url: string | null): boolean {
  if (!url || typeof url !== "string") return false
  const decoded = decodeURIComponent(url)
  return decoded.startsWith("/") && !decoded.startsWith("//")
}

export function LoginForm() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl")
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const isDark = mounted && resolvedTheme === "dark"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (authError) {
        const message = getHumanErrorMessage(authError.message, language === "es" ? "es" : "en")
        setError(message)
        setLoading(false)
        return
      }

      if (data.user && !data.user.email_confirmed_at) {
        setError(getHumanErrorMessage("Email not confirmed", language === "es" ? "es" : "en"))
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
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
      const message = err instanceof Error ? err.message : language === "es" ? "Error al iniciar sesión" : "Error signing in"
      setError(getHumanErrorMessage(message, language === "es" ? "es" : "en") || message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      const next = isSafeCallbackUrl(callbackUrl) ? callbackUrl : undefined
      window.location.href = next
        ? "/api/auth/google?next=" + encodeURIComponent(next)
        : "/api/auth/google"
    } catch {
      setError(language === "es" ? "No se pudo iniciar sesión con Google" : "Failed to initiate Google sign in")
      setLoading(false)
    }
  }

  const cardClass = isDark
    ? "w-full max-w-sm p-10 space-y-5 bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-900/20"
    : "w-full max-w-sm p-10 space-y-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-400/15"
  const titleClass = isDark
    ? "text-3xl font-bold text-white tracking-tight"
    : "text-3xl font-bold text-slate-900 tracking-tight"
  const subtitleClass = isDark ? "mt-2 text-sm text-slate-400" : "mt-2 text-sm text-slate-600"
  const inputClass = isDark
    ? "block w-full h-11 rounded-lg border border-slate-600 bg-slate-800/60 backdrop-blur py-2 pl-10 pr-3 text-sm text-white placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-colors"
    : "block w-full h-11 rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-colors"
  const iconClass = "absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none " + (isDark ? "text-slate-400" : "text-slate-400")
  const linkClass = "text-sm font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition"
  const btnPrimaryClass =
    "group flex w-full items-center justify-center rounded-lg bg-[#009485] py-3 px-4 font-semibold text-white shadow-lg shadow-teal-500/20 transition-all duration-300 hover:bg-[#007a6e] hover:shadow-teal-500/25 disabled:bg-[#009485]/50 disabled:shadow-none disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
  const btnGoogleClass = isDark
    ? "flex w-full items-center justify-center rounded-lg bg-white py-2.5 px-4 text-sm font-semibold text-slate-800 border border-slate-200 transition-all duration-300 hover:bg-slate-50 hover:shadow-md border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-70"
    : "flex w-full items-center justify-center rounded-lg bg-white py-2.5 px-4 text-sm font-semibold text-slate-700 border border-slate-200 transition-all duration-300 hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-70"
  const dividerClass = isDark ? "text-xs text-slate-400" : "text-xs text-slate-500"
  const footerClass = isDark ? "text-[10px] text-slate-400" : "text-[10px] text-slate-500"
  const footerLinkClass = "font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 underline"

  return (
    <div className={cardClass}>
      <div className="text-center">
        <h2 className={titleClass}>
          {language === "es" ? "Bienvenido de nuevo" : "Welcome Back"}
        </h2>
        <p className={subtitleClass}>
          {language === "es" ? "Accede a tu portal de salud seguro" : "Sign in to continue"}
        </p>
      </div>

      {error && (
        <div className={isDark ? "bg-red-900/30 border border-red-700 rounded-xl p-3 flex items-start gap-2" : "bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2"}>
          <AlertCircle className={`h-4 w-4 mt-0.5 ${isDark ? "text-red-400" : "text-red-500"}`} />
          <p className={isDark ? "text-sm text-red-200" : "text-sm text-red-700"}>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <span className={iconClass}>
            <User size={16} />
          </span>
          <input
            type="email"
            id="floating_email"
            className={inputClass}
            placeholder={language === "es" ? "Email" : "Email Address"}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="relative">
          <span className={iconClass}>
            <Lock size={16} />
          </span>
          <input
            type={showPassword ? "text" : "password"}
            id="floating_password"
            className={`${inputClass} pr-10`}
            placeholder={language === "es" ? "Contraseña" : "Password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-400 hover:text-teal-400" : "text-slate-400 hover:text-teal-600"} transition-colors focus:outline-none`}
            title={showPassword ? (language === "es" ? "Ocultar contraseña" : "Hide password") : (language === "es" ? "Mostrar contraseña" : "Show password")}
          >
            <EyeToggleIcon visible={showPassword} className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <Link href="/forgot-password" className={linkClass}>
            {t.auth.forgotPassword}
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={btnPrimaryClass}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {language === "es" ? "Iniciando sesión..." : "Signing in..."}
            </>
          ) : (
            <>
              {t.auth.signIn}
              <ArrowRight className="ml-2 h-5 w-5 transform transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>

        <div className="relative flex items-center py-2">
          <div className={isDark ? "flex-grow border-t border-slate-600" : "flex-grow border-t border-slate-200"} />
          <span className={`mx-4 flex-shrink ${dividerClass}`}>
            {language === "es" ? "O CONTINÚA CON" : "OR CONTINUE WITH"}
          </span>
          <div className={isDark ? "flex-grow border-t border-slate-600" : "flex-grow border-t border-slate-200"} />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={btnGoogleClass}
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 8.841C34.553 4.806 29.613 2.5 24 2.5C11.983 2.5 2.5 11.983 2.5 24s9.483 21.5 21.5 21.5S45.5 36.017 45.5 24c0-1.538-.135-3.022-.389-4.417z"
            />
            <path
              fill="#FF3D00"
              d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12.5 24 12.5c3.059 0 5.842 1.154 7.961 3.039l5.839-5.841C34.553 4.806 29.613 2.5 24 2.5C16.318 2.5 9.642 6.723 6.306 14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24 45.5c5.613 0 10.553-2.306 14.802-6.341l-5.839-5.841C30.842 35.846 27.059 38 24 38c-5.039 0-9.345-2.608-11.124-6.481l-6.571 4.819C9.642 41.277 16.318 45.5 24 45.5z"
            />
            <path
              fill="#1976D2"
              d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l5.839 5.841C44.196 35.123 45.5 29.837 45.5 24c0-1.538-.135-3.022-.389-4.417z"
            />
          </svg>
          {language === "es" ? "Continuar con Google" : "Sign in with Google"}
        </button>
      </form>

      <p className={`mt-3 text-center leading-relaxed ${footerClass}`}>
        {language === "es" ? "Al iniciar sesión aceptas nuestros" : "By signing in you agree to our"}{" "}
        <TermsDialog>
          <button
            type="button"
            className={footerLinkClass}
          >
            {t.auth.termsOfService}
          </button>
        </TermsDialog>{" "}
        {language === "es" ? "y" : "and"}{" "}
        <PrivacyDialog>
          <button
            type="button"
            className={footerLinkClass}
          >
            {t.auth.privacyPolicy}
          </button>
        </PrivacyDialog>
        .
      </p>

      <p className={`mt-2 text-center text-xs ${footerClass}`}>
        {language === "es" ? "¿No tienes una cuenta?" : "Don't have an account?"}{" "}
        <a href={isSafeCallbackUrl(callbackUrl) ? `/auth/register?callbackUrl=${encodeURIComponent(callbackUrl!)}` : "/auth/register"} className={footerLinkClass}>
          {language === "es" ? "Regístrate" : "Sign Up"}
        </a>
      </p>
    </div>
  )
}

