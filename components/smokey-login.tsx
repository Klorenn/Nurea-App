"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { User, Lock, ArrowRight, AlertCircle, Loader2, Stethoscope, CheckCircle2, Eye, EyeOff, KeyRound } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { AnimatedInput } from "@/components/ui/animated-input"
import { createClient } from "@/lib/supabase/client"
import { getHumanErrorMessage } from "@/lib/auth/utils"
import { signUp } from "@/actions/auth"
import { useTheme } from "next-themes"
import { TermsDialog } from "@/components/ui/terms-dialog"
import { PrivacyDialog } from "@/components/ui/privacy-dialog"

// Vertex shader source code
const vertexSmokeySource = `
  attribute vec4 a_position;
  void main() {
    gl_Position = a_position;
  }
`

// Fragment shader source code for the smokey background effect
const fragmentSmokeySource = `
precision mediump float;

uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;
uniform vec3 u_color;

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 uv = fragCoord / iResolution;
    vec2 centeredUV = (2.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);

    float time = iTime * 0.5;

    // Normalize mouse input (0.0 - 1.0) and remap to -1.0 ~ 1.0
    vec2 mouse = iMouse / iResolution;
    vec2 rippleCenter = 2.0 * mouse - 1.0;

    vec2 distortion = centeredUV;
    // Apply distortion for a wavy, smokey effect
    for (float i = 1.0; i < 8.0; i++) {
        distortion.x += 0.5 / i * cos(i * 2.0 * distortion.y + time + rippleCenter.x * 3.1415);
        distortion.y += 0.5 / i * cos(i * 2.0 * distortion.x + time + rippleCenter.y * 3.1415);
    }

    // Create a glowing wave pattern
    float wave = abs(sin(distortion.x + distortion.y + time));
    float glow = smoothstep(0.9, 0.2, wave);

    fragColor = vec4(u_color * glow, 1.0);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`

/**
 * Valid blur sizes supported by Tailwind CSS.
 */
type BlurSize = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl"

/**
 * Props for the SmokeyBackground component.
 */
interface SmokeyBackgroundProps {
  backdropBlurAmount?: string
  color?: string
  className?: string
}

/**
 * A mapping from blur size names to Tailwind CSS classes.
 */
const blurClassMap: Record<BlurSize, string> = {
  none: "backdrop-blur-none",
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl",
  "2xl": "backdrop-blur-2xl",
  "3xl": "backdrop-blur-3xl",
}

/**
 * A React component that renders an interactive WebGL shader background.
 */
export function SmokeyBackground({
  backdropBlurAmount = "sm",
  color = "#14B8A6", // Teal/Aqua green color
  className = "",
}: SmokeyBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  // Helper to convert hex color to RGB (0-1 range)
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
    if (!gl) {
      console.error("WebGL not supported")
      return
    }

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
    const iMouseLocation = gl.getUniformLocation(program, "iMouse")
    const uColorLocation = gl.getUniformLocation(program, "u_color")

    let startTime = Date.now()
    const [r, g, b] = hexToRgb(color)
    gl.uniform3f(uColorLocation, r, g, b)

    let animationFrameId: number | null = null
    let lastMouseUpdate = 0
    const MOUSE_THROTTLE = 16 // ~60fps

    const render = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      
      // Only resize if dimensions changed
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
      }

      // Set background color based on theme
      if (isDark) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0) // Black for dark mode
      } else {
        gl.clearColor(1.0, 1.0, 1.0, 1.0) // White for light mode
      }
      gl.clear(gl.COLOR_BUFFER_BIT)

      const currentTime = (Date.now() - startTime) / 1000

      gl.uniform2f(iResolutionLocation, width, height)
      gl.uniform1f(iTimeLocation, currentTime)
      gl.uniform2f(
        iMouseLocation,
        isHovering ? mousePosition.x : width / 2,
        isHovering ? height - mousePosition.y : height / 2,
      )

      gl.drawArrays(gl.TRIANGLES, 0, 6)
      animationFrameId = requestAnimationFrame(render)
    }

    const handleMouseMove = (event: MouseEvent) => {
      const now = Date.now()
      if (now - lastMouseUpdate < MOUSE_THROTTLE) return
      lastMouseUpdate = now
      
      const rect = canvas.getBoundingClientRect()
      setMousePosition({ x: event.clientX - rect.left, y: event.clientY - rect.top })
    }
    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseenter", handleMouseEnter)
    canvas.addEventListener("mouseleave", handleMouseLeave)

    render()

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseenter", handleMouseEnter)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [isHovering, mousePosition, color, isDark])

  const finalBlurClass = blurClassMap[backdropBlurAmount as BlurSize] || blurClassMap["sm"]

  return (
    <div className={`absolute inset-0 w-full h-full overflow-hidden bg-white dark:bg-gray-950 ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full will-change-transform pointer-events-none" />
      <div className={`absolute inset-0 ${finalBlurClass} bg-white/50 dark:bg-gray-950/50 pointer-events-none`}></div>
    </div>
  )
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
function isValidEmail(value: string): boolean {
  return emailRegex.test(value.trim())
}
function isValidPassword(value: string): boolean {
  return value.length >= 8
}

/**
 * A glassmorphism-style login form component with animated labels and Google login.
 */
export function LoginForm() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState<string | null>(null)
  const [resetError, setResetError] = useState<string | null>(null)

  const handleEmailBlur = () => {
    if (!email.trim()) {
      setEmailError(null)
      return
    }
    setEmailError(isValidEmail(email) ? null : (language === "es" ? "Introduce un email válido" : "Enter a valid email address"))
  }

  const handlePasswordBlur = () => {
    if (!password) {
      setPasswordError(null)
      return
    }
    setPasswordError(isValidPassword(password) ? null : (language === "es" ? "La contraseña debe tener al menos 8 caracteres" : "Password must be at least 8 characters"))
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const emailValid = isValidEmail(email)
    const passwordValid = isValidPassword(password)
    setEmailError(emailValid ? null : (language === "es" ? "Introduce un email válido" : "Enter a valid email address"))
    setPasswordError(passwordValid ? null : (language === "es" ? "La contraseña debe tener al menos 8 caracteres" : "Password must be at least 8 characters"))
    if (!emailValid || !passwordValid) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })

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
        .select("role, date_of_birth")
        .eq("id", data.user.id)
        .single()

      const role = profile?.role || "patient"
      const profileComplete = !!profile?.date_of_birth
      let redirectPath = "/dashboard"
      if (role === "professional") {
        redirectPath = profileComplete ? "/dashboard/professional" : "/onboarding/professional"
      } else if (role === "admin") {
        redirectPath = "/dashboard/admin"
      } else {
        redirectPath = profileComplete ? "/dashboard/patient" : "/onboarding"
      }

      router.push(redirectPath)
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : (language === "es" ? "Error al iniciar sesión" : "Error signing in")
      setError(getHumanErrorMessage(message, language === "es" ? "es" : "en") || message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      window.location.href = "/api/auth/google"
    } catch (err) {
      setError("Failed to initiate Google sign in")
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError(null)
    setResetMessage(null)

    const value = (resetEmail || email).trim()
    if (!value) {
      setResetError(
        language === "es"
          ? "Ingresa tu email para recuperar tu contraseña."
          : "Enter your email to reset your password."
      )
      return
    }
    if (!isValidEmail(value)) {
      setResetError(
        language === "es" ? "Introduce un email válido." : "Enter a valid email address."
      )
      return
    }

    setResetLoading(true)
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const message =
          typeof data?.message === "string"
            ? data.message
            : language === "es"
            ? "No pudimos enviar el enlace. Inténtalo de nuevo en unos momentos."
            : "We couldn't send the link. Please try again in a moment."
        setResetError(message)
        return
      }

      const message =
        typeof data?.message === "string"
          ? data.message
          : language === "es"
          ? "Si el correo está registrado, recibirás un enlace en unos instantes."
          : "If the email is registered, you'll receive a link shortly."
      setResetMessage(message)
    } catch {
      setResetError(
        language === "es"
          ? "Parece haber un problema de conexión. Inténtalo de nuevo en unos segundos."
          : "There seems to be a connection issue. Please try again in a few seconds."
      )
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm p-8 space-y-6 bg-white dark:bg-slate-900 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xl">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t.auth.welcomeBack}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t.auth.securePortal}</p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleEmailSignIn} className="space-y-6">
        {/* Email Input with Animated Label */}
        <div className="space-y-1.5">
          <AnimatedInput
            type="email"
            id="floating_email"
            label={t.auth.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={handleEmailBlur}
            disabled={loading}
            required
            icon={User}
            autoComplete="email"
            aria-invalid={!!emailError}
            aria-describedby={emailError ? "email-error" : undefined}
          />
          {emailError && (
            <p id="email-error" className="text-xs text-red-500 dark:text-red-400 px-1" role="alert">
              {emailError}
            </p>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 px-0">
            {language === "es" 
              ? "Tu email es tu identidad en NUREA. Lo usamos para confirmar tus citas."
              : "Your email is your identity on NUREA. We use it to confirm your appointments."}
          </p>
        </div>

        {/* Password Input with Animated Label + visibility toggle */}
        <div className="space-y-1.5">
          <div className="relative">
            <AnimatedInput
              type={showPassword ? "text" : "password"}
              id="floating_password"
              label={t.auth.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={handlePasswordBlur}
              disabled={loading}
              required
              icon={Lock}
              autoComplete="current-password"
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? "password-error" : undefined}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded p-1"
              tabIndex={0}
              aria-label={showPassword 
                ? (language === "es" ? "Ocultar contraseña" : "Hide password") 
                : (language === "es" ? "Mostrar contraseña" : "Show password")}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {passwordError && (
            <p id="password-error" className="text-xs text-red-500 dark:text-red-400 px-1" role="alert">
              {passwordError}
            </p>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 px-0">
            {language === "es" 
              ? "Una contraseña fuerte protege tu información de salud."
              : "A strong password protects your health information."}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setShowReset((prev) => !prev)
              setResetEmail(email.trim())
              setResetError(null)
              setResetMessage(null)
            }}
            className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition underline-offset-2 hover:underline"
          >
            {t.auth.forgotPassword}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group w-full flex items-center justify-center py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-600/50 disabled:cursor-not-allowed rounded-lg text-white font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500 transition-all duration-300"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {language === "es" ? "Iniciando sesión..." : "Signing in..."}
            </>
          ) : (
            <>
              {t.auth.signIn}
              <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative flex py-3 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          <span className="flex-shrink mx-4 text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
            {t.auth.orContinue}
          </span>
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="group w-full flex items-center justify-center py-3 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-300"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 8.841C34.553 4.806 29.613 2.5 24 2.5C11.983 2.5 2.5 11.983 2.5 24s9.483 21.5 21.5 21.5S45.5 36.017 45.5 24c0-1.538-.135-3.022-.389-4.417z"
            ></path>
            <path
              fill="#FF3D00"
              d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12.5 24 12.5c3.059 0 5.842 1.154 7.961 3.039l5.839-5.841C34.553 4.806 29.613 2.5 24 2.5C16.318 2.5 9.642 6.723 6.306 14.691z"
            ></path>
            <path
              fill="#4CAF50"
              d="M24 45.5c5.613 0 10.553-2.306 14.802-6.341l-5.839-5.841C30.842 35.846 27.059 38 24 38c-5.039 0-9.345-2.608-11.124-6.481l-6.571 4.819C9.642 41.277 16.318 45.5 24 45.5z"
            ></path>
            <path
              fill="#1976D2"
              d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l5.839 5.841C44.196 35.123 45.5 29.837 45.5 24c0-1.538-.135-3.022-.389-4.417z"
            ></path>
          </svg>
          <span className="text-sm">{language === "es" ? "Continuar con Google" : "Sign in with Google"}</span>
        </button>
      </form>

      {showReset && (
        <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-4 space-y-3 text-left">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
              <KeyRound className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {language === "es" ? "Recuperar contraseña" : "Reset password"}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {language === "es"
                  ? "Ingresa tu email para recibir un enlace seguro."
                  : "Enter your email to receive a secure link."}
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordReset} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                {language === "es" ? "Dirección de email" : "Email address"}
              </label>
              <input
                type="email"
                className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/60"
                placeholder="nombre@ejemplo.com"
                value={resetEmail || email}
                onChange={(e) => setResetEmail(e.target.value)}
                disabled={resetLoading}
              />
            </div>

            {resetError && (
              <p className="text-xs text-red-600 dark:text-red-400">{resetError}</p>
            )}
            {resetMessage && (
              <p className="text-xs text-teal-700 dark:text-teal-300 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {resetMessage}
              </p>
            )}

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowReset(false)
                  setResetError(null)
                  setResetMessage(null)
                }}
                className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 underline-offset-2 hover:underline"
              >
                {language === "es" ? "Cancelar" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={resetLoading}
                className="inline-flex items-center justify-center rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold px-3 py-1.5 shadow-sm disabled:bg-teal-700/60 disabled:cursor-not-allowed"
              >
                {resetLoading ? (
                  <>
                    <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                    {language === "es" ? "Enviando..." : "Sending..."}
                  </>
                ) : (
                  <>{language === "es" ? "Enviar enlace de recuperación" : "Send reset link"}</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <p className="text-center text-xs text-slate-600 dark:text-slate-300">
        {t.auth.noAccount}
      </p>

      <div className="text-center text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
        <p className="flex flex-wrap items-center justify-center gap-1">
          <span>{t.auth.bySigningIn}</span>
          <Link 
            href="/legal/terms" 
            className="font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 underline transition-colors"
          >
            {t.auth.termsOfService}
          </Link>
          <span>{t.auth.and}</span>
          <Link 
            href="/legal/privacy" 
            className="font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 underline transition-colors"
          >
            {t.auth.privacyPolicy}
          </Link>
        </p>
      </div>
    </div>
  )
}

/** Especialidades para el select de profesionales (valor guardado igual en ES/EN). */
const SPECIALTY_OPTIONS = [
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
  "Nutrición Infantil",
  "Psicopedagogía",
  "Fonoaudiología",
  "Terapia Ocupacional",
  "Matrona",
  "Otra",
]

function isAtLeast18(dateStr: string): boolean {
  if (!dateStr) return false
  const birth = new Date(dateStr)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age >= 18
}

/**
 * A glassmorphism-style signup form component with animated labels and Google signup.
 * Dynamic form based on selected role (Patient vs Professional).
 */
export function SignupForm({ initialRole, initialPlan }: { initialRole?: "patient" | "professional", initialPlan?: string | null }) {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const isSpanish = language === "es"
  
  // 1. Estado del rol - default a 'patient' si no hay initialRole
  const [role, setRole] = useState<"patient" | "professional">(initialRole || "patient")
  const [selectedPlan, setSelectedPlan] = useState<string | null>(initialPlan || null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [dateOfBirthError, setDateOfBirthError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [otherSpecialty, setOtherSpecialty] = useState("")
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [nationalId, setNationalId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")

  const isProfessional = role === "professional"

  // Handler para cambiar rol - limpia errores previos
  const handleRoleChange = (newRole: "patient" | "professional") => {
    setRole(newRole)
    setError(null)
    setFieldErrors({})
    setDateOfBirthError(null)
  }

  const validateDateOfBirth = (value: string): boolean => {
    if (!value) {
      setDateOfBirthError(null)
      return true // Opcional para pacientes
    }
    const valid = isAtLeast18(value)
    setDateOfBirthError(valid ? null : t.auth.ageError)
    return valid
  }

  const handleDateOfBirthBlur = () => {
    if (dateOfBirth) {
      validateDateOfBirth(dateOfBirth)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors: Record<string, string> = {}

    // Validación de campos base (siempre obligatorios)
    if (!firstName.trim()) {
      errors.firstName = isSpanish ? "El nombre es obligatorio" : "First name is required"
    }
    if (!lastName.trim()) {
      errors.lastName = isSpanish ? "El apellido es obligatorio" : "Last name is required"
    }
    if (!email.trim()) {
      errors.email = isSpanish ? "El correo es obligatorio" : "Email is required"
    }
    if (!password || password.length < 6) {
      errors.password = isSpanish ? "Mínimo 6 caracteres" : "Minimum 6 characters"
    }

    // Validación condicional según rol
    if (isProfessional) {
      // Profesionales: Especialidad y RUT obligatorios
      if (!specialty.trim()) {
        errors.specialty = isSpanish ? "Selecciona tu especialidad" : "Select your specialty"
      }
      if (specialty === "Otra" && !otherSpecialty.trim()) {
        errors.otherSpecialty = isSpanish ? "Especifica tu especialidad" : "Specify your specialty"
      }
      if (!registrationNumber.trim()) {
        errors.registrationNumber = isSpanish ? "El RUT o registro médico es obligatorio" : "Medical ID is required"
      }
    } else {
      // Pacientes: RUT/DNI obligatorio según petición del usuario
      if (!nationalId.trim()) {
        errors.nationalId = isSpanish ? "El RUT o DNI es obligatorio" : "National ID (RUT/DNI) is required"
      }
    }

    // Validación de fecha de nacimiento si se proporciona
    if (dateOfBirth && !isAtLeast18(dateOfBirth)) {
      setDateOfBirthError(t.auth.ageError)
      setFieldErrors(errors)
      return
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    setFieldErrors({})
    setDateOfBirthError(null)

    try {
      const result = await signUp({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dateOfBirth || undefined,
        role,
        specialty: isProfessional ? (specialty === "Otra" ? otherSpecialty : specialty) : undefined,
        registrationNumber: isProfessional ? registrationNumber.trim() : undefined,
        nationalId: nationalId.trim() || (isProfessional ? registrationNumber.trim() : undefined),
      })
      if (result.success) {
        if (role === "professional" && selectedPlan) {
          sessionStorage.setItem("pending_plan", selectedPlan)
        }
        setRegisteredEmail(email.trim())
        setRegistrationSuccess(true)
      } else {
        setError(result.error ?? (isSpanish ? "No se pudo crear la cuenta" : "Failed to create account"))
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : (isSpanish ? "Error al registrarse" : "An error occurred")
      setError(getHumanErrorMessage(msg, language === "es" ? "es" : "en") || msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setLoading(true)
    try {
      window.location.href = "/api/auth/google?next=/verify-email"
    } catch (err) {
      setError("Failed to initiate Google sign up")
      setLoading(false)
    }
  }

  if (registrationSuccess) {
    return (
      <div className="w-full max-w-md sm:max-w-lg p-6 sm:p-8 bg-white dark:bg-slate-900 backdrop-blur-xl rounded-2xl border border-gray-200/90 dark:border-slate-700/80 shadow-2xl shadow-slate-300/40 dark:shadow-black/40 relative z-20">
        <div className="space-y-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-normal">
              {isSpanish ? "¡Cuenta creada!" : "Account created!"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {isSpanish ? "Hemos enviado un enlace de verificación a:" : "We've sent a verification link to:"}
            </p>
            <p className="font-semibold text-teal-600 dark:text-teal-400 flex items-center justify-center gap-2">
              <User className="w-4 h-4" />
              {registeredEmail}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 text-left space-y-3">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <strong>{isSpanish ? "Siguiente paso:" : "Next step:"}</strong>{" "}
              {isSpanish
                ? "Abre tu correo y haz clic en el enlace para activar tu cuenta."
                : "Open your email and click the link to activate your account."}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isSpanish
                ? "Si no lo encuentras, revisa tu carpeta de spam o correo no deseado."
                : "If you can't find it, check your spam or junk folder."}
            </p>
          </div>
          <Link
            href="/login"
            className="inline-block text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 underline"
          >
            {isSpanish ? "Ir a iniciar sesión" : "Go to login"}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm sm:max-w-md p-5 sm:p-6 flex flex-col gap-4 bg-white dark:bg-slate-900 backdrop-blur-xl rounded-2xl border border-gray-200/90 dark:border-slate-700/80 shadow-2xl shadow-slate-300/40 dark:shadow-black/40 relative z-20">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-normal">{t.auth.joinNurea}</h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed tracking-normal">{t.auth.startJourney}</p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{error}</p>
            {error.includes("ya está registrado") && (
              <p className="text-xs text-slate-700 dark:text-slate-300">
                {isSpanish ? (
                  <>
                    <Link href="/login" className="font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                      Iniciar sesión
                    </Link>
                    {" — o "}
                    <Link
                      href={email ? `/verify-email?email=${encodeURIComponent(email.trim())}` : "/verify-email"}
                      className="font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      solicita reenviar el correo de verificación
                    </Link>
                    .
                  </>
                ) : (
                  <>
                    <Link href="/login" className="font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                      Log in
                    </Link>
                    {" — or "}
                    <Link
                      href={email ? `/verify-email?email=${encodeURIComponent(email.trim())}` : "/verify-email"}
                      className="font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      request a new verification email
                    </Link>
                    .
                  </>
                )}
              </p>
            )}
            {error.includes("No pudimos enviar el correo") && (
              <p className="text-xs text-slate-700 dark:text-slate-300">
                {isSpanish
                  ? "Comprueba tu conexión e inténtalo de nuevo. Si el problema continúa, usa «Iniciar sesión» y solicita reenviar el correo."
                  : "Check your connection and try again. If it continues, use Log in and request a new verification email."}
                {" "}
                <Link href="/login" className="font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                  {isSpanish ? "Iniciar sesión" : "Log in"}
                </Link>
              </p>
            )}
          </div>
        </div>
      )}

      {/* 2. Selector de Rol - Premium Segmented Control */}
      <div className="flex flex-col gap-2 relative z-30">
        <label className="text-center block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">
          {t.auth.selectAccountType}
        </label>
        <div className="flex p-1.5 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-inner overflow-hidden">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              handleRoleChange("patient")
            }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300 text-xs font-bold",
              role === "patient"
                ? "bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-[0_4px_12px_rgba(20,184,166,0.15)] ring-1 ring-teal-500/10"
                : "bg-transparent text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
            aria-pressed={role === "patient"}
          >
            <User className={cn("h-4 w-4 transition-transform", role === "patient" && "scale-110")} />
            <span>{t.auth.imPatient}</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              handleRoleChange("professional")
            }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300 text-xs font-bold",
              role === "professional"
                ? "bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-[0_4px_12px_rgba(20,184,166,0.15)] ring-1 ring-teal-500/10"
                : "bg-transparent text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
            aria-pressed={role === "professional"}
          >
            <Stethoscope className={cn("h-4 w-4 transition-transform", role === "professional" && "scale-110")} />
            <span>{t.auth.imProfessional}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSignUp} className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Área con scroll limitado y degradados de desvanecimiento */}
        <div className="relative max-h-[55vh] overflow-y-auto scrollbar-form pr-1 -mr-1">
          <div className="absolute top-0 left-0 right-2 h-4 bg-gradient-to-b from-white dark:from-slate-900 to-transparent pointer-events-none z-10" aria-hidden />
          <div className="absolute bottom-0 left-0 right-2 h-4 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none z-10" aria-hidden />
          <div className="flex flex-col gap-3 py-0.5">
            {/* 3. Campos base - Siempre visibles: Nombre, Apellido */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <AnimatedInput
                  type="text"
                  id="floating_firstname"
                  label={t.auth.firstName}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="given-name"
                  variant="stacked"
                  aria-invalid={!!fieldErrors.firstName}
                />
                {fieldErrors.firstName ? (
                  <p className="text-[10px] text-red-500 dark:text-red-400 px-0" role="alert">{fieldErrors.firstName}</p>
                ) : (
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 px-0 tracking-normal">{language === "es" ? "Tu nombre" : "Your name"}</p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <AnimatedInput
                  type="text"
                  id="floating_lastname"
                  label={t.auth.lastName}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="family-name"
                  variant="stacked"
                  aria-invalid={!!fieldErrors.lastName}
                />
                {fieldErrors.lastName ? (
                  <p className="text-[10px] text-red-500 dark:text-red-400 px-0" role="alert">{fieldErrors.lastName}</p>
                ) : (
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 px-0 tracking-normal">{language === "es" ? "Tu apellido" : "Your last name"}</p>
                )}
              </div>
            </div>

            {/* Campos base - Email y Contraseña */}
            <div className="grid grid-cols-1 gap-3">
              <div className="flex flex-col gap-1">
                <AnimatedInput
                  type="email"
                  id="floating_email_signup"
                  label={t.auth.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  variant="stacked"
                  aria-invalid={!!fieldErrors.email}
                />
                {fieldErrors.email ? (
                  <p className="text-[10px] text-red-500 dark:text-red-400 px-0" role="alert">{fieldErrors.email}</p>
                ) : (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 px-0">
                    {language === "es" 
                      ? "Tu email es tu identidad en NUREA."
                      : "Your email is your identity on NUREA."}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <AnimatedInput
                  type="password"
                  id="floating_password_signup"
                  label={t.auth.password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength={6}
                  variant="stacked"
                  aria-invalid={!!fieldErrors.password}
                />
                {fieldErrors.password && (
                  <p className="text-[10px] text-red-500 dark:text-red-400 px-0" role="alert">{fieldErrors.password}</p>
                )}
              </div>
            </div>

            {/* Campo NATIONAL ID (RUT/DNI) - Obligatorio para todos ahora según UX premium */}
            <div className="flex flex-col gap-1 pt-1">
              <AnimatedInput
                type="text"
                id="floating_national_id"
                label={isSpanish ? "RUT / DNI" : "National ID (RUT/DNI)"}
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                disabled={loading}
                required
                variant="stacked"
                className="font-medium"
                placeholder={isSpanish ? "Ej: 12.345.678-9" : "e.g. 12.345.678-9"}
                aria-invalid={!!fieldErrors.nationalId}
              />
              {fieldErrors.nationalId ? (
                <p className="text-[10px] text-red-500 dark:text-red-400 px-0" role="alert">{fieldErrors.nationalId}</p>
              ) : (
                <p className="text-[10px] text-slate-500 dark:text-slate-400 px-0">
                  {isSpanish ? "Identificación oficial requerida." : "Official identification required."}
                </p>
              )}
            </div>

            {/* Campos condicionales para PROFESIONAL */}
            {isProfessional && (
              <div className="flex flex-col gap-3 pt-4 mt-1 border-t border-slate-200 dark:border-slate-700/50 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  {isSpanish ? "Datos del Especialista" : "Specialist Details"}
                </p>
                
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="signup_specialty" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    {t.auth.mainSpecialty} *
                  </label>
                  <select
                    id="signup_specialty"
                    value={specialty}
                    onChange={(e) => {
                      setSpecialty(e.target.value)
                      if (e.target.value !== "Otra") setOtherSpecialty("")
                    }}
                    disabled={loading}
                    required={isProfessional}
                    className={cn(
                      "w-full h-10 rounded-xl border bg-white dark:bg-slate-900 py-2 px-3 text-sm text-slate-900 dark:text-slate-50 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all shadow-sm",
                      fieldErrors.specialty ? "border-red-400 dark:border-red-500" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    )}
                  >
                    <option value="">{isSpanish ? "Selecciona una especialidad" : "Select a specialty"}</option>
                    {SPECIALTY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {fieldErrors.specialty && (
                    <p className="text-[10px] text-red-500 dark:text-red-400 px-0" role="alert">{fieldErrors.specialty}</p>
                  )}
                </div>

                {/* Input condicional para "Otra" especialidad */}
                {specialty === "Otra" && (
                  <div className="flex flex-col gap-1 animate-in zoom-in-95 duration-200">
                    <AnimatedInput
                      type="text"
                      id="floating_other_specialty"
                      label={isSpanish ? "¿Cuál es tu especialidad?" : "What is your specialty?"}
                      value={otherSpecialty}
                      onChange={(e) => setOtherSpecialty(e.target.value)}
                      disabled={loading}
                      required
                      variant="stacked"
                      placeholder={isSpanish ? "Ej: Podología" : "e.g. Podiatry"}
                      aria-invalid={!!fieldErrors.otherSpecialty}
                    />
                    {fieldErrors.otherSpecialty && (
                      <p className="text-[10px] text-red-500 dark:text-red-400 px-0" role="alert">{fieldErrors.otherSpecialty}</p>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <AnimatedInput
                    type="text"
                    id="floating_registration"
                    label={isSpanish ? "Número de Registro Médico" : "Medical Registration Number"}
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    disabled={loading}
                    required={isProfessional}
                    variant="stacked"
                    placeholder={isSpanish ? "Ej: 123456" : "e.g. 123456"}
                    aria-invalid={!!fieldErrors.registrationNumber}
                  />
                  {fieldErrors.registrationNumber && (
                    <p className="text-[10px] text-red-500 dark:text-red-400 px-0" role="alert">{fieldErrors.registrationNumber}</p>
                  )}
                </div>
              </div>
            )}

            {/* Campo condicional para PACIENTE - Fecha de nacimiento (opcional) */}
            {!isProfessional && (
              <div className="flex flex-col gap-1 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label htmlFor="floating_dob" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  {t.auth.dateOfBirth} <span className="text-slate-400 font-normal">({isSpanish ? "opcional" : "optional"})</span>
                </label>
                <input
                  type="date"
                  id="floating_dob"
                  value={dateOfBirth}
                  onChange={(e) => {
                    setDateOfBirth(e.target.value)
                    if (dateOfBirthError) validateDateOfBirth(e.target.value)
                  }}
                  onBlur={handleDateOfBirthBlur}
                  disabled={loading}
                  aria-invalid={!!dateOfBirthError}
                  className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-1.5 px-3 text-sm text-slate-900 dark:text-slate-50 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all shadow-sm"
                />
                {dateOfBirthError && (
                  <p className="text-[10px] text-red-500 dark:text-red-400 px-0" role="alert">{dateOfBirthError}</p>
                )}
              </div>
            )}

            <div className="flex items-start gap-2 pt-0.5">
              <CheckCircle2 className={cn(
                "h-3 w-3 shrink-0 mt-0.5 transition-colors",
                acceptedTerms && acceptedPrivacy 
                  ? "text-teal-500 dark:text-teal-400" 
                  : "text-slate-400 dark:text-slate-600"
              )} />
              <p className="text-[9px] leading-relaxed text-slate-700 dark:text-slate-300">
                {t.auth.agreeTerms}{" "}
                <TermsDialog onAccept={() => setAcceptedTerms(true)}>
                  <button 
                    type="button"
                    className="font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 underline relative z-10 cursor-pointer"
                  >
                    {t.auth.termsOfService}
                  </button>
                </TermsDialog>{" "}
                {t.auth.and}{" "}
                <PrivacyDialog onAccept={() => setAcceptedPrivacy(true)}>
                  <button 
                    type="button"
                    className="font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 underline relative z-10 cursor-pointer"
                  >
                    {t.auth.privacyPolicy}
                  </button>
                </PrivacyDialog>
                .
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !acceptedTerms || !acceptedPrivacy}
              className="group w-full flex items-center justify-center py-2 px-4 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-600/50 disabled:cursor-not-allowed rounded-lg text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500 transition-all duration-300 relative z-10"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="text-xs">{language === "es" ? "Creando cuenta..." : "Creating account..."}</span>
                </>
              ) : (
                <>
                  <span className="text-sm">{t.auth.createAccount}</span>
                  <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>

          {/* Divider */}
          <div className="relative flex py-1.5 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            <span className="flex-shrink mx-3 text-slate-600 dark:text-slate-400 text-[9px] font-medium uppercase tracking-wider">
              {t.auth.orContinue}
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          </div>

          {/* Google Signup Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="group w-full flex items-center justify-center py-2 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-300 relative z-10"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 8.841C34.553 4.806 29.613 2.5 24 2.5C11.983 2.5 2.5 11.983 2.5 24s9.483 21.5 21.5 21.5S45.5 36.017 45.5 24c0-1.538-.135-3.022-.389-4.417z"
              ></path>
              <path
                fill="#FF3D00"
                d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12.5 24 12.5c3.059 0 5.842 1.154 7.961 3.039l5.839-5.841C34.553 4.806 29.613 2.5 24 2.5C16.318 2.5 9.642 6.723 6.306 14.691z"
              ></path>
              <path
                fill="#4CAF50"
                d="M24 45.5c5.613 0 10.553-2.306 14.802-6.341l-5.839-5.841C30.842 35.846 27.059 38 24 38c-5.039 0-9.345-2.608-11.124-6.481l-6.571 4.819C9.642 41.277 16.318 45.5 24 45.5z"
              ></path>
              <path
                fill="#1976D2"
                d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l5.839 5.841C44.196 35.123 45.5 29.837 45.5 24c0-1.538-.135-3.022-.389-4.417z"
              ></path>
            </svg>
            <span className="text-xs">{language === "es" ? "Continuar con Google" : "Sign up with Google"}</span>
          </button>
        </form>

      <p className="text-center text-[11px] text-slate-700 dark:text-slate-300">
        {t.auth.alreadyAccount}{" "}
        <Link href="/login" className="font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition">
          {t.auth.logIn}
        </Link>
      </p>
    </div>
  )
}

