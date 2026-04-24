"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Mail, CheckCircle2, AlertCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

function VerifyEmailContent() {
  const { language } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [errorType, setErrorType] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const emailParam = searchParams.get("email")

  const handleResend = async () => {
    setLoading(true)
    setError(null)
    setErrorType(null)

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(
          emailParam
            ? {
                email: emailParam,
              }
            : {}
        ),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorType(data.error ?? null)
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
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                {errorType === "not_authenticated" ? (
                  <>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {language === "es"
                        ? "Inicia sesión para reenviar el email de verificación."
                        : "Log in to resend the verification email."}
                    </p>
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      {language === "es"
                        ? "Inicia sesión con tu correo y contraseña y vuelve a esta página para reenviar el email. "
                        : "Log in with your email and password, then return here to resend the email. "}
                      <Link href="/login" className="underline font-medium text-teal-600 dark:text-teal-400">
                        {language === "es" ? "Ir al login" : "Go to login"}
                      </Link>
                    </p>
                  </>
                ) : (
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{error}</p>
                )}
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
        </CardContent>
      </Card>
    </main>
  )
}

function VerifyEmailFallback() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-accent/5">
      <Card className="w-full max-w-md border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden">
        <div className="bg-secondary p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm animate-pulse">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Verifica tu Email</CardTitle>
          <CardDescription className="text-white/80 font-medium mt-2">
            Cargando…
          </CardDescription>
        </div>
        <CardContent className="p-8 space-y-6 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse" />
          <div className="h-4 bg-muted rounded w-3/4 mx-auto animate-pulse" />
          <div className="h-4 bg-muted rounded w-full animate-pulse" />
        </CardContent>
      </Card>
    </main>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  )
}

