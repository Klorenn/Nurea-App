"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Lock, ShieldCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/contexts/language-context"
import { authMessages } from "@/lib/auth/messages"
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function UpdatePasswordPage() {
  const { language } = useLanguage()
  const messages = authMessages[language]
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isSpanish = language === "es"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!password || !confirmPassword) {
      setError(
        isSpanish
          ? "Por favor, completa ambos campos de contraseña."
          : "Please fill out both password fields."
      )
      return
    }

    if (password.length < 8) {
      setError(
        isSpanish
          ? "La nueva contraseña debe tener al menos 8 caracteres."
          : "Your new password must be at least 8 characters long."
      )
      return
    }

    if (password !== confirmPassword) {
      setError(
        isSpanish
          ? "Las contraseñas no coinciden."
          : "The passwords do not match."
      )
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        console.error("[auth/update-password] updateUser error:", updateError)
        // No exponemos el mensaje técnico al usuario final
        setError(
          isSpanish
            ? messages.genericError
            : messages.genericError
        )
        return
      }

      setSuccess(true)
      setError(null)
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err) {
      console.error("[auth/update-password] exception:", err)
      setError(
        isSpanish ? messages.networkError : messages.networkError
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-md border-border/40 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
        <div className="bg-teal-700 p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            {isSpanish ? "Actualizar contraseña" : "Update password"}
          </CardTitle>
          <CardDescription className="text-white/80 font-medium mt-2">
            {isSpanish
              ? "Elige una nueva contraseña segura para tu cuenta."
              : "Choose a new, secure password for your account."}
          </CardDescription>
        </div>

        <CardContent className="p-8 space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
              <Lock className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-slate-900">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-xl p-4 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-slate-900">
                {isSpanish
                  ? messages.passwordResetSuccess
                  : messages.passwordResetSuccess}{" "}
                {isSpanish
                  ? "Te redirigiremos al inicio de sesión en unos segundos."
                  : "You’ll be redirected to the sign-in page in a few seconds."}
              </p>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-teal-700" />
                  {isSpanish ? "Nueva contraseña" : "New password"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/70"
                  placeholder={isSpanish ? "Introduce tu nueva contraseña" : "Enter your new password"}
                  autoComplete="new-password"
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-teal-700" />
                  {isSpanish ? "Confirmar nueva contraseña" : "Confirm new password"}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/70"
                  placeholder={isSpanish ? "Vuelve a escribir la contraseña" : "Re-enter your new password"}
                  autoComplete="new-password"
                  disabled={loading}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow-lg shadow-teal-500/25"
              >
                {loading
                  ? isSpanish
                    ? messages.sendingEmail
                    : messages.sendingEmail
                  : isSpanish
                  ? "Actualizar contraseña"
                  : "Update password"}
              </Button>
            </form>
          )}

          <p className="text-xs text-slate-500 text-center">
            {isSpanish
              ? "Si no solicitaste este cambio, puedes ignorar este mensaje y tu contraseña actual seguirá siendo válida."
              : "If you didn’t request this change, you can ignore this page and your current password will remain valid."}
          </p>

          <p className="text-xs text-slate-500 text-center">
            <Link href="/login" className="text-teal-700 hover:text-teal-800 font-semibold underline-offset-2 hover:underline">
              {isSpanish ? "Volver a iniciar sesión" : "Back to sign in"}
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}

