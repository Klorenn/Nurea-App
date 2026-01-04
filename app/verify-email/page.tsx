"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Mail, CheckCircle2, ArrowRight, AlertCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { authMessages } from "@/lib/auth/messages"

export default function VerifyEmailPage() {
  const { language } = useLanguage()
  const messages = authMessages[language]
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleResend = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || "No pudimos reenviar el email")
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal. Por favor, intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-accent/5">
      <Card className="w-full max-w-md border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden">
        <div className="bg-secondary p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            {language === "es" ? "Verifica tu Email" : "Verify Your Email"}
          </CardTitle>
          <CardDescription className="text-white/80 font-medium mt-2">
            {language === "es" 
              ? "Te hemos enviado un enlace de verificación"
              : "We've sent you a verification link"}
          </CardDescription>
        </div>

        <CardContent className="p-8 space-y-6 text-center">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  {language === "es" 
                    ? "Email reenviado. Revisa tu bandeja de entrada."
                    : "Email resent. Check your inbox."}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">
              {language === "es" ? "Revisa tu bandeja de entrada" : "Check your inbox"}
            </h3>
            <p className="text-muted-foreground">
              {language === "es"
                ? "Te hemos enviado un enlace de verificación a tu email. Por favor, haz clic en el enlace para verificar tu cuenta y completar tu registro."
                : "We've sent a verification link to your email address. Please click the link to verify your account and complete your registration."}
            </p>
          </div>
          <div className="pt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              {language === "es" ? "¿No recibiste el email?" : "Didn't receive the email?"}{" "}
              {language === "es" ? "Revisa tu carpeta de spam o" : "Check your spam folder or"}{" "}
              <button 
                onClick={handleResend}
                disabled={loading}
                className="text-primary font-bold hover:underline disabled:opacity-50"
              >
                {loading 
                  ? (language === "es" ? "enviando..." : "sending...")
                  : (language === "es" ? "reenviar email de verificación" : "resend verification email")}
              </button>
              .
            </p>
            <Button className="w-full h-12 rounded-xl font-bold text-lg" asChild>
              <Link href="/login">
                {language === "es" ? "Continuar al Login" : "Continue to Login"}{" "}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

