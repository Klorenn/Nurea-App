"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card"
import { Lock, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { authMessages } from "@/lib/auth/messages"

export default function ResetPasswordPage() {
  const { language } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const messages = authMessages[language]

  useEffect(() => {
    // Verificar que hay un token en la URL (viene del email)
    const token = searchParams.get('token')
    if (!token) {
      setError('El enlace de recuperación no es válido o ha expirado. Por favor, solicita un nuevo enlace.')
    }
  }, [searchParams])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validaciones
    if (!password || !confirmPassword) {
      setError('Por favor, completa todos los campos.')
      return
    }

    if (password.length < 6) {
      setError('Tu contraseña debe tener al menos 6 caracteres para mantener tu cuenta segura.')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor, verifica que ambas sean iguales.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || "No pudimos actualizar tu contraseña")
      }

      setSuccess(true)
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push("/login?message=password_reset_success")
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal. Por favor, intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-accent/5">
        <Card className="w-full max-w-md border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden">
          <div className="bg-green-500 p-8 text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">
              {language === "es" ? "¡Contraseña Actualizada!" : "Password Updated!"}
            </CardTitle>
            <CardDescription className="text-white/80 font-medium mt-2">
              {messages.passwordResetSuccess}
            </CardDescription>
          </div>

          <CardContent className="p-8 space-y-6 text-center">
            <p className="text-muted-foreground">
              {language === "es" 
                ? "Redirigiendo al login en unos segundos..."
                : "Redirecting to login in a few seconds..."}
            </p>
          </CardContent>

          <CardFooter className="p-8 pt-0 justify-center">
            <Button className="w-full rounded-xl" asChild>
              <Link href="/login">
                {language === "es" ? "Ir al Login" : "Go to Login"}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-accent/5">
      <Link
        href="/login"
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> {language === "es" ? "Volver al Login" : "Back to Login"}
      </Link>

      <Card className="w-full max-w-md border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden">
        <div className="bg-primary p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <Lock className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            {language === "es" ? "Nueva Contraseña" : "New Password"}
          </CardTitle>
          <CardDescription className="text-white/80 font-medium mt-2">
            {language === "es" 
              ? "Crea una contraseña segura para tu cuenta"
              : "Create a secure password for your account"}
          </CardDescription>
        </div>

        <CardContent className="p-8 space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">
                {language === "es" ? "Nueva Contraseña" : "New Password"}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={language === "es" ? "Mínimo 6 caracteres" : "Minimum 6 characters"}
                  className="rounded-xl h-12 bg-accent/20 border-none pr-10"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {language === "es"
                  ? "Una contraseña fuerte protege tu información de salud. Solo tú y tus profesionales autorizados pueden acceder."
                  : "A strong password protects your health information. Only you and your authorized professionals can access it."}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {language === "es" ? "Confirmar Contraseña" : "Confirm Password"}
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={language === "es" ? "Repite tu contraseña" : "Repeat your password"}
                  className="rounded-xl h-12 bg-accent/20 border-none pr-10"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl font-bold text-lg shadow-lg shadow-primary/20"
              disabled={loading}
            >
              {loading 
                ? (language === "es" ? "Actualizando..." : "Updating...")
                : (language === "es" ? "Actualizar Contraseña" : "Update Password")}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="p-8 pt-0 justify-center">
          <p className="text-sm text-muted-foreground">
            {language === "es" ? "¿Recordaste tu contraseña?" : "Remember your password?"}{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              {language === "es" ? "Iniciar sesión" : "Sign in"}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  )
}

