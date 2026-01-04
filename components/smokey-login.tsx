"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { User, Lock, ArrowRight, AlertCircle, Loader2, Stethoscope, CheckCircle2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { AnimatedInput } from "@/components/ui/animated-input"
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
}: SmokeyBackgroundProps): JSX.Element {
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

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Usar mensaje humano si está disponible
        const errorMessage = data.message || data.error || "No pudimos iniciar sesión"
        throw new Error(errorMessage)
      }

      // Verificar si requiere verificación de email
      if (data.requiresVerification) {
        router.push("/verify-email")
        return
      }

      // Redirigir según el rol y estado del perfil
      const redirectPath = data.redirectPath || "/dashboard"
      router.push(redirectPath)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
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

  return (
    <div className="w-full max-w-sm p-8 space-y-6 bg-white/95 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-200/80 dark:border-teal-500/30 shadow-2xl">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t.auth.welcomeBack}</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{t.auth.securePortal}</p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-300 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleEmailSignIn} className="space-y-8">
        {/* Email Input with Animated Label */}
        <div className="space-y-1">
          <AnimatedInput
            type="email"
            id="floating_email"
            label={t.auth.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            icon={User}
          />
          <p className="text-[10px] text-muted-foreground px-1">
            {language === "es" 
              ? "Tu email es tu identidad en NUREA. Lo usamos para confirmar tus citas."
              : "Your email is your identity on NUREA. We use it to confirm your appointments."}
          </p>
        </div>

        {/* Password Input with Animated Label */}
        <div className="space-y-1">
          <AnimatedInput
            type="password"
            id="floating_password"
            label={t.auth.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            icon={Lock}
          />
          <p className="text-[10px] text-muted-foreground px-1">
            {language === "es" 
              ? "Una contraseña fuerte protege tu información de salud."
              : "A strong password protects your health information."}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <a
            href="/forgot-password"
            className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition"
          >
            {t.auth.forgotPassword}
          </a>
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
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
          <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">
            {t.auth.orContinue}
          </span>
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="group w-full flex items-center justify-center py-3 px-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-300"
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

      <p className="text-center text-xs text-gray-600 dark:text-gray-300">
        {t.auth.noAccount}{" "}
        <a href="/signup" className="font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition">
          {t.auth.signUp}
        </a>
      </p>

      <div className="text-center text-[10px] leading-relaxed text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
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

/**
 * A glassmorphism-style signup form component with animated labels and Google signup.
 */
export function SignupForm() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const router = useRouter()
  const [role, setRole] = useState<"patient" | "professional" | null>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Usar mensaje humano si está disponible
        const errorMessage = data.message || data.error || (language === "es" ? "No pudimos crear tu cuenta" : "Failed to create account")
        throw new Error(errorMessage)
      }

      // Wait a moment for the session to be established
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Force a page reload to ensure session is established
      window.location.href = "/complete-profile"
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
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

  return (
    <div className="w-full max-w-sm p-6 space-y-5 bg-white/95 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-200/80 dark:border-teal-500/30 shadow-2xl relative z-20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.auth.joinNurea}</h2>
        <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{t.auth.startJourney}</p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-300 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-200">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <label className="text-center block text-xs font-semibold text-gray-700 dark:text-teal-300">
          {t.auth.selectAccountType}
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setRole("patient")
            }}
            className={cn(
              "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all relative z-10",
              role === "patient"
                ? "border-teal-500 bg-teal-50 dark:bg-teal-500/20"
                : "border-teal-200 dark:border-teal-300/30 bg-gray-50 dark:bg-white/5 hover:border-teal-300 dark:hover:border-teal-300/50",
            )}
          >
            <div
              className={cn(
                "p-1.5 rounded-lg",
                role === "patient" 
                  ? "bg-teal-500 text-white" 
                  : "bg-teal-100 dark:bg-white/10 text-teal-600 dark:text-teal-300",
              )}
            >
              <User className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{t.auth.imPatient}</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setRole("professional")
            }}
            className={cn(
              "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all relative z-10",
              role === "professional"
                ? "border-teal-500 bg-teal-50 dark:bg-teal-500/20"
                : "border-teal-200 dark:border-teal-300/30 bg-gray-50 dark:bg-white/5 hover:border-teal-300 dark:hover:border-teal-300/50",
            )}
          >
            <div
              className={cn(
                "p-1.5 rounded-lg",
                role === "professional" 
                  ? "bg-teal-500 text-white" 
                  : "bg-teal-100 dark:bg-white/10 text-teal-600 dark:text-teal-300",
              )}
            >
              <Stethoscope className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{t.auth.imProfessional}</span>
          </button>
        </div>
      </div>

      {role && (
        <form onSubmit={handleSignUp} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-2 gap-3">
            {/* First Name Input */}
            <div className="space-y-1">
              <AnimatedInput
                type="text"
                id="floating_firstname"
                label={t.auth.firstName}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={loading}
                required
              />
              <p className="text-[9px] text-muted-foreground px-1">
                {language === "es" ? "Tu nombre" : "Your name"}
              </p>
            </div>

            {/* Last Name Input */}
            <div className="space-y-1">
              <AnimatedInput
                type="text"
                id="floating_lastname"
                label={t.auth.lastName}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={loading}
                required
              />
              <p className="text-[9px] text-muted-foreground px-1">
                {language === "es" ? "Tu apellido" : "Your last name"}
              </p>
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-1">
            <AnimatedInput
              type="email"
              id="floating_email_signup"
              label={t.auth.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              icon={User}
            />
            <p className="text-[10px] text-muted-foreground px-1">
              {language === "es" 
                ? "Tu email es tu identidad en NUREA. Lo usamos para confirmar tus citas y mantener tu información segura."
                : "Your email is your identity on NUREA. We use it to confirm your appointments and keep your information secure."}
            </p>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <AnimatedInput
              type="password"
              id="floating_password_signup"
              label={t.auth.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              minLength={6}
              icon={Lock}
            />
            <p className="text-[10px] text-muted-foreground px-1">
              {language === "es" 
                ? "Una contraseña fuerte protege tu información de salud. Solo tú y tus profesionales autorizados pueden acceder."
                : "A strong password protects your health information. Only you and your authorized professionals can access it."}
            </p>
          </div>

          <div className="flex items-start gap-2 pt-1">
            <CheckCircle2 className={cn(
              "h-3.5 w-3.5 shrink-0 mt-0.5 transition-colors",
              acceptedTerms && acceptedPrivacy 
                ? "text-teal-500 dark:text-teal-400" 
                : "text-gray-400 dark:text-gray-600"
            )} />
            <p className="text-[10px] leading-relaxed text-gray-600 dark:text-gray-300">
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
            disabled={loading || !role || !acceptedTerms || !acceptedPrivacy}
            className="group w-full flex items-center justify-center py-2.5 px-4 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-600/50 disabled:cursor-not-allowed rounded-lg text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500 transition-all duration-300 relative z-10"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span className="text-sm">{language === "es" ? "Creando cuenta..." : "Creating account..."}</span>
              </>
            ) : (
              <>
                <span>{t.auth.createAccount}</span>
                <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
            <span className="flex-shrink mx-3 text-gray-500 dark:text-gray-400 text-[10px] font-medium uppercase tracking-wider">
              {t.auth.orContinue}
            </span>
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
          </div>

          {/* Google Signup Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="group w-full flex items-center justify-center py-2.5 px-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-300 relative z-10"
          >
            <svg className="w-4 h-4 mr-2.5" viewBox="0 0 48 48">
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
            <span className="text-sm">{language === "es" ? "Continuar con Google" : "Sign up with Google"}</span>
          </button>
        </form>
      )}

      <p className="text-center text-xs text-gray-600 dark:text-gray-300">
        {t.auth.alreadyAccount}{" "}
        <Link href="/login" className="font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition">
          {t.auth.logIn}
        </Link>
      </p>
    </div>
  )
}

