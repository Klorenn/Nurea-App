"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card"
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react"
import { useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { authMessages } from "@/lib/auth/messages"

export default function ForgotPasswordPage() {
  const { language } = useLanguage()
  const messages = authMessages[language]
  const [email, setEmail] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (emailSent) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-accent/5">
        <Link
          href="/login"
          className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Login
        </Link>

        <Card className="w-full max-w-md border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden">
          <div className="bg-secondary p-8 text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">
              {language === "es" ? "Revisa tu Email" : "Check Your Email"}
            </CardTitle>
            <CardDescription className="text-white/80 font-medium mt-2">
              {messages.passwordResetSent}
            </CardDescription>
          </div>

          <CardContent className="p-8 space-y-6 text-center">
            <p className="text-muted-foreground">
              {language === "es"
                ? "Te hemos enviado un enlace seguro a tu email. Revisa tu bandeja de entrada (y spam) y sigue las instrucciones para recuperar tu contraseña."
                : "We've sent a secure link to your email. Check your inbox (and spam) and follow the instructions to reset your password."}
            </p>
            <p className="text-sm text-muted-foreground">
              {language === "es" ? "¿No recibiste el email?" : "Didn't receive the email?"}{" "}
              {language === "es" ? "Revisa tu carpeta de spam o" : "Check your spam folder or"}{" "}
              <button 
                onClick={() => {
                  setEmailSent(false)
                  setEmail("")
                }}
                className="text-primary font-bold hover:underline"
              >
                {language === "es" ? "intenta nuevamente" : "try again"}
              </button>
              .
            </p>
          </CardContent>

          <CardFooter className="p-8 pt-0 justify-center">
            <Button variant="outline" className="w-full rounded-xl" asChild>
              <Link href="/login">Back to Login</Link>
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
        <ArrowLeft className="h-4 w-4" /> Back to Login
      </Link>

      <Card className="w-full max-w-md border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden">
        <div className="bg-primary p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            {language === "es" ? "Recuperar Contraseña" : "Reset Password"}
          </CardTitle>
          <CardDescription className="text-white/80 font-medium mt-2">
            {language === "es" 
              ? "Ingresa tu email para recibir un enlace de recuperación"
              : "Enter your email to receive a reset link"}
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

          <div className="space-y-2">
            <Label htmlFor="email">
              {language === "es" ? "Dirección de Email" : "Email Address"}
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@ejemplo.com"
              className="rounded-xl h-12 bg-accent/20 border-none"
              disabled={loading}
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {language === "es"
              ? "Te enviaremos un enlace seguro para recuperar tu contraseña. Este enlace expirará en 1 hora."
              : "We'll send you a secure link to reset your password. This link will expire in 1 hour."}
          </p>
          <p className="text-xs text-muted-foreground">
            {language === "es"
              ? "Tu email es tu identidad en NUREA. Lo usamos para confirmar tus citas y mantener tu información segura."
              : "Your email is your identity on NUREA. We use it to confirm your appointments and keep your information secure."}
          </p>
          <Button
            className="w-full h-12 rounded-xl font-bold text-lg shadow-lg shadow-primary/20"
            onClick={async () => {
              if (!email) {
                setError(language === "es" ? "Por favor, ingresa tu email." : "Please enter your email.")
                return
              }

              setLoading(true)
              setError(null)

              try {
                const response = await fetch("/api/auth/forgot-password", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email }),
                })

                const data = await response.json()

                if (!response.ok) {
                  throw new Error(data.message || data.error || "No pudimos enviar el email")
                }

                setEmailSent(true)
              } catch (err) {
                setError(err instanceof Error ? err.message : "Algo salió mal. Por favor, intenta nuevamente.")
              } finally {
                setLoading(false)
              }
            }}
            disabled={loading}
          >
            {loading 
              ? (language === "es" ? "Enviando..." : "Sending...")
              : (language === "es" ? "Enviar Enlace de Recuperación" : "Send Reset Link")}
          </Button>
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

