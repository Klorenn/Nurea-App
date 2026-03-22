"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { User, Lock, ArrowRight, AlertCircle, Loader2, Stethoscope, CheckCircle2, Eye, EyeOff, KeyRound, Check } from "lucide-react"
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
        .select("role, onboarding_completed")
        .eq("id", data.user.id)
        .single()

      const role = profile?.role || "patient"
      const onboardingCompleted = !!profile?.onboarding_completed
      let redirectPath = "/dashboard"
      if (role === "professional") {
        redirectPath = onboardingCompleted ? "/dashboard/professional" : "/onboarding"
      } else if (role === "admin") {
        redirectPath = "/dashboard/admin"
      } else {
        redirectPath = onboardingCompleted ? "/dashboard/patient" : "/onboarding"
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

  const [role, setRole] = useState<"patient" | "professional">(initialRole || "patient")
  const [selectedPlan] = useState<string | null>(initialPlan || null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [dateOfBirthError, setDateOfBirthError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [emailExists, setEmailExists] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [emailChecking, setEmailChecking] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
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

  const handleRoleChange = (newRole: "patient" | "professional") => {
    setRole(newRole)
    setError(null)
    setFieldErrors({})
    setDateOfBirthError(null)
  }

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

  const handleNationalIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNationalId(formatRUT(e.target.value))
  }

  const handleEmailBlur = async () => {
    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return
    setEmailChecking(true)
    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      })
      const { exists, verified } = await res.json()
      setEmailExists(!!exists)
      setEmailVerified(!!verified)
    } catch {
      setEmailExists(false)
    } finally {
      setEmailChecking(false)
    }
  }

  const validateDateOfBirth = (value: string): boolean => {
    if (!value) { setDateOfBirthError(null); return true }
    const valid = isAtLeast18(value)
    setDateOfBirthError(valid ? null : t.auth.ageError)
    return valid
  }

  const handleDateOfBirthBlur = () => {
    if (dateOfBirth) validateDateOfBirth(dateOfBirth)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors: Record<string, string> = {}

    if (!firstName.trim()) errors.firstName = isSpanish ? "El nombre es obligatorio" : "First name is required"
    if (!lastName.trim()) errors.lastName = isSpanish ? "El apellido es obligatorio" : "Last name is required"
    if (!email.trim()) errors.email = isSpanish ? "El correo es obligatorio" : "Email is required"
    
    const passwordLower = password.toLowerCase()
    const firstNameLower = firstName.toLowerCase().trim()
    const lastNameLower = lastName.toLowerCase().trim()
    
    const isPasswordStrong = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)
    const isPasswordVeryStrong = password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    if (!password || password.length < 8) {
      errors.password = isSpanish ? "Usa mínimo 8 caracteres" : "Use at least 8 characters"
    } else if (!/[A-Z]/.test(password)) {
      errors.password = isSpanish ? "Tu contraseña no es segura: falta una mayúscula" : "Password not secure: missing uppercase"
    } else if (!/[0-9]/.test(password)) {
      errors.password = isSpanish ? "Tu contraseña no es segura: falta un número" : "Password not secure: missing number"
    } else if (
      (firstNameLower && passwordLower.includes(firstNameLower)) ||
      (lastNameLower && passwordLower.includes(lastNameLower))
    ) {
      errors.password = isSpanish ? "Tu contraseña no es segura: contiene tu nombre" : "Password not secure: contains your name"
    }

    if (isProfessional) {
      if (!specialty.trim()) errors.specialty = isSpanish ? "Selecciona tu especialidad" : "Select your specialty"
      if (specialty === "Otra" && !otherSpecialty.trim()) errors.otherSpecialty = isSpanish ? "Especifica tu especialidad" : "Specify your specialty"
      if (!registrationNumber.trim()) errors.registrationNumber = isSpanish ? "El registro médico es obligatorio" : "Medical ID is required"
    } else {
      if (!nationalId.trim()) errors.nationalId = isSpanish ? "El RUT o DNI es obligatorio" : "National ID (RUT/DNI) is required"
    }

    if (dateOfBirth && !isAtLeast18(dateOfBirth)) {
      setDateOfBirthError(t.auth.ageError)
      setFieldErrors(errors)
      return
    }
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); setError(null); return }

    if (emailExists) {
      setError(isSpanish
        ? "Este correo ya está registrado. Inicia sesión o usa otro correo."
        : "This email is already registered. Log in or use a different email.")
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
        if (role === "professional" && selectedPlan) sessionStorage.setItem("pending_plan", selectedPlan)
        setRegisteredEmail(email.trim())
        setRegistrationSuccess(true)
      } else {
        const errMsg = result.error ?? (isSpanish ? "No se pudo crear la cuenta" : "Failed to create account")
        if (errMsg.toLowerCase().includes("registrado") || errMsg.toLowerCase().includes("registered")) {
          setEmailExists(true)
        }
        setError(errMsg)
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
    } catch {
      setError("Failed to initiate Google sign up")
      setLoading(false)
    }
  }

  // ── Success screen ───────────────────────────────────────────────────────
  if (registrationSuccess) {
    return (
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl relative z-20 overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        <div className="h-1 bg-gradient-to-r from-teal-400 to-teal-600" />
        <div className="p-6 space-y-5 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-teal-100 dark:bg-teal-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {isSpanish ? "¡Cuenta creada!" : "Account created!"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isSpanish ? "Enlace de verificación enviado a:" : "Verification link sent to:"}
            </p>
            <p className="text-sm font-semibold text-teal-600 dark:text-teal-400 break-all">{registeredEmail}</p>
          </div>
          <div className="text-left text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 space-y-2">
            <p>1. {isSpanish ? "Revisa tu correo y haz clic en el enlace de activación." : "Check your email and click the activation link."}</p>
            <p>2. {isSpanish ? "Completa tu perfil para empezar." : "Complete your profile to get started."}</p>
            <p className="text-slate-400">{isSpanish ? "¿No lo encuentras? Revisa spam." : "Can't find it? Check spam."}</p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {isSpanish ? "Ir a iniciar sesión" : "Go to login"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  // ── Main form ────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xl relative z-20 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600" />

      {/* Scrollable body */}
      <div className="overflow-y-auto max-h-[calc(100svh-5rem)] overscroll-contain">
        <div className="p-5 space-y-4">

          {/* Header */}
          <div className="text-center space-y-0.5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.auth.joinNurea}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isSpanish ? "Crea tu cuenta en NUREA" : "Create your NUREA account"}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-3 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-red-800 dark:text-red-200">{error}</p>
                {(error.includes("registrado") || error.includes("registered")) && (
                  <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
                    <Link href="/login" className="font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                      {isSpanish ? "Iniciar sesión" : "Log in"}
                    </Link>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Role Selector */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
            <button
              type="button"
              onClick={() => handleRoleChange("patient")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 text-xs font-semibold",
                role === "patient"
                  ? "bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
              )}
              aria-pressed={role === "patient"}
            >
              <User className="h-3.5 w-3.5" />
              <span>{t.auth.imPatient}</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange("professional")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 text-xs font-semibold",
                role === "professional"
                  ? "bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
              )}
              aria-pressed={role === "professional"}
            >
              <Stethoscope className="h-3.5 w-3.5" />
              <span>{t.auth.imProfessional}</span>
            </button>
          </div>

          <form onSubmit={handleSignUp} className="space-y-3">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
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
                {fieldErrors.firstName && (
                  <p className="mt-0.5 text-[11px] text-red-500" role="alert">{fieldErrors.firstName}</p>
                )}
              </div>
              <div>
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
                {fieldErrors.lastName && (
                  <p className="mt-0.5 text-[11px] text-red-500" role="alert">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <div className="relative">
                <AnimatedInput
                  type="email"
                  id="floating_email_signup"
                  label={t.auth.email}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailExists(false) }}
                  onBlur={handleEmailBlur}
                  disabled={loading}
                  required
                  variant="stacked"
                  aria-invalid={!!fieldErrors.email || emailExists}
                  className={emailExists ? "border-amber-400 dark:border-amber-500" : ""}
                />
                {emailChecking && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-slate-400" />
                )}
              </div>
              {fieldErrors.email && (
                <p className="mt-0.5 text-[11px] text-red-500" role="alert">{fieldErrors.email}</p>
              )}
              {emailExists && !fieldErrors.email && (
                <p className="mt-0.5 text-[11px] text-amber-600 dark:text-amber-400">
                  {emailVerified
                    ? (isSpanish ? "Este correo ya está registrado. " : "This email is already registered. ")
                    : (isSpanish
                        ? "Este correo está registrado pero no verificado. Revisa tu bandeja de entrada o "
                        : "This email is registered but not verified. Check your inbox or ")}
                  <Link href="/login" className="font-semibold underline hover:text-teal-600">
                    {isSpanish ? "Inicia sesión" : "log in"}
                  </Link>
                  {!emailVerified && "."}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <AnimatedInput
                  type={showPassword ? "text" : "password"}
                  id="floating_password_signup"
                  label={t.auth.password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength={6}
                  variant="stacked"
                  className="pr-10"
                  aria-invalid={!!fieldErrors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? (isSpanish ? "Ocultar" : "Hide") : (isSpanish ? "Mostrar" : "Show")}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-0.5 text-[11px] text-red-500" role="alert">{fieldErrors.password}</p>
              )}
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    <div className={cn(
                      "flex-1 h-1 rounded-full transition-all duration-300",
                      password.length >= 8 
                        ? "bg-rose-400" 
                        : "bg-slate-200 dark:bg-slate-600"
                    )} />
                    <div className={cn(
                      "flex-1 h-1 rounded-full transition-all duration-300",
                      password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)
                        ? "bg-amber-400" 
                        : "bg-slate-200 dark:bg-slate-600"
                    )} />
                    <div className={cn(
                      "flex-1 h-1 rounded-full transition-all duration-300",
                      password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password)
                        ? "bg-emerald-400" 
                        : "bg-slate-200 dark:bg-slate-600"
                    )} />
                  </div>
                  <div className="flex justify-center">
                    {password.length < 8 && (
                      <span className="text-[10px] text-slate-400">{isSpanish ? "Débil" : "Weak"}</span>
                    )}
                    {password.length >= 8 && !(/[A-Z]/.test(password) && /[0-9]/.test(password)) && (
                      <span className="text-[10px] text-rose-400 font-medium">{isSpanish ? "Débil" : "Weak"}</span>
                    )}
                    {password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && (
                      <span className="text-[10px] text-emerald-500 font-medium">{isSpanish ? "Segura" : "Secure"}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* National ID — only for patients */}
            {!isProfessional && (
              <div>
                <AnimatedInput
                  type="text"
                  id="floating_national_id"
                  label={isSpanish ? "RUT / DNI" : "National ID (RUT/DNI)"}
                  value={nationalId}
                  onChange={handleNationalIdChange}
                  disabled={loading}
                  required
                  variant="stacked"
                  placeholder={isSpanish ? "Ej: 12.345.678-9" : "e.g. 12.345.678-9"}
                  aria-invalid={!!fieldErrors.nationalId}
                />
                {fieldErrors.nationalId && (
                  <p className="mt-0.5 text-[11px] text-red-500" role="alert">{fieldErrors.nationalId}</p>
                )}
              </div>
            )}

            {/* Professional fields */}
            {isProfessional && (
              <div className="space-y-3 pt-1 border-t border-teal-100 dark:border-teal-900/50 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5" />
                  {isSpanish ? "Datos del especialista" : "Specialist details"}
                </p>

                <div>
                  <label htmlFor="signup_specialty" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.auth.mainSpecialty} *
                  </label>
                  <select
                    id="signup_specialty"
                    value={specialty}
                    onChange={(e) => { setSpecialty(e.target.value); if (e.target.value !== "Otra") setOtherSpecialty("") }}
                    disabled={loading}
                    required={isProfessional}
                    className={cn(
                      "w-full h-9 rounded-lg border bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all",
                      fieldErrors.specialty ? "border-red-400" : "border-slate-200 dark:border-slate-700"
                    )}
                  >
                    <option value="">{isSpanish ? "Selecciona tu especialidad" : "Select your specialty"}</option>
                    {SPECIALTY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {fieldErrors.specialty && (
                    <p className="mt-0.5 text-[11px] text-red-500" role="alert">{fieldErrors.specialty}</p>
                  )}
                </div>

                {specialty === "Otra" && (
                  <div className="animate-in fade-in duration-200">
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
                      <p className="mt-0.5 text-[11px] text-red-500" role="alert">{fieldErrors.otherSpecialty}</p>
                    )}
                  </div>
                )}

                <div>
                  <AnimatedInput
                    type="text"
                    id="floating_registration"
                    label={isSpanish ? "Nº Registro Médico" : "Medical Registration No."}
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    disabled={loading}
                    required={isProfessional}
                    variant="stacked"
                    placeholder={isSpanish ? "Ej: 123456" : "e.g. 123456"}
                    aria-invalid={!!fieldErrors.registrationNumber}
                  />
                  {fieldErrors.registrationNumber && (
                    <p className="mt-0.5 text-[11px] text-red-500" role="alert">{fieldErrors.registrationNumber}</p>
                  )}
                </div>
              </div>
            )}

            {/* Date of birth (patient only) */}
            {!isProfessional && (
              <div className="animate-in fade-in duration-200">
                <label htmlFor="floating_dob" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.auth.dateOfBirth}{" "}
                  <span className="text-slate-400 font-normal">({isSpanish ? "opcional" : "optional"})</span>
                </label>
                <input
                  type="date"
                  id="floating_dob"
                  value={dateOfBirth}
                  onChange={(e) => { setDateOfBirth(e.target.value); if (dateOfBirthError) validateDateOfBirth(e.target.value) }}
                  onBlur={handleDateOfBirthBlur}
                  disabled={loading}
                  aria-invalid={!!dateOfBirthError}
                  className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all"
                />
                {dateOfBirthError && (
                  <p className="mt-0.5 text-[11px] text-red-500" role="alert">{dateOfBirthError}</p>
                )}
              </div>
            )}

            {/* Terms */}
            <div className="flex items-start gap-2.5">
              <button
                type="button"
                onClick={() => { setAcceptedTerms(v => !v); setAcceptedPrivacy(v => !v) }}
                className={cn(
                  "w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 mt-0.5",
                  acceptedTerms ? "bg-teal-500 border-teal-500" : "border-slate-300 dark:border-slate-600 hover:border-teal-400"
                )}
              >
                {acceptedTerms && <Check className="w-2.5 h-2.5 text-white" />}
              </button>
              <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                {t.auth.agreeTerms}{" "}
                <TermsDialog onAccept={() => setAcceptedTerms(true)}>
                  <button type="button" className="font-semibold text-teal-600 dark:text-teal-400 hover:underline">{t.auth.termsOfService}</button>
                </TermsDialog>
                {" "}{t.auth.and}{" "}
                <PrivacyDialog onAccept={() => setAcceptedPrivacy(true)}>
                  <button type="button" className="font-semibold text-teal-600 dark:text-teal-400 hover:underline">{t.auth.privacyPolicy}</button>
                </PrivacyDialog>
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !acceptedTerms || !acceptedPrivacy}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /><span>{isSpanish ? "Creando cuenta..." : "Creating account..."}</span></>
              ) : (
                <><span>{t.auth.createAccount}</span><ArrowRight className="h-4 w-4" /></>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
              <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-medium">{t.auth.orContinue}</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:cursor-not-allowed rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 8.841C34.553 4.806 29.613 2.5 24 2.5C11.983 2.5 2.5 11.983 2.5 24s9.483 21.5 21.5 21.5S45.5 36.017 45.5 24c0-1.538-.135-3.022-.389-4.417z"/>
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12.5 24 12.5c3.059 0 5.842 1.154 7.961 3.039l5.839-5.841C34.553 4.806 29.613 2.5 24 2.5C16.318 2.5 9.642 6.723 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 45.5c5.613 0 10.553-2.306 14.802-6.341l-5.839-5.841C30.842 35.846 27.059 38 24 38c-5.039 0-9.345-2.608-11.124-6.481l-6.571 4.819C9.642 41.277 16.318 45.5 24 45.5z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l5.839 5.841C44.196 35.123 45.5 29.837 45.5 24c0-1.538-.135-3.022-.389-4.417z"/>
              </svg>
              <span>{isSpanish ? "Continuar con Google" : "Sign up with Google"}</span>
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            {t.auth.alreadyAccount}{" "}
            <Link href="/login" className="font-semibold text-teal-600 dark:text-teal-400 hover:underline transition-colors">
              {t.auth.logIn}
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}
