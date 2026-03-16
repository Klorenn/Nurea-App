"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Lock, ShieldCheck, Eye, EyeOff, Loader2, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/contexts/language-context"
import { authMessages } from "@/lib/auth/messages"
import { AuthPageBackground } from "@/components/ui/login-form"
import ThemeSwitch from "@/components/ui/theme-switch"
import { LanguageSelector } from "@/components/ui/language-selector"

export default function UpdatePasswordPage() {
  const { language } = useLanguage()
  const messages = authMessages[language]
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const isDark = mounted && resolvedTheme === "dark"

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const isSpanish = language === "es"

  useEffect(() => {
    setMounted(true)
  }, [])

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
        setError(isSpanish ? messages.genericError : messages.genericError)
        return
      }

      setSuccess(true)
      setError(null)
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err) {
      console.error("[auth/update-password] exception:", err)
      setError(isSpanish ? messages.networkError : messages.networkError)
    } finally {
      setLoading(false)
    }
  }

  const cardClass = isDark
    ? "w-full max-w-sm p-10 space-y-6 bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-900/20"
    : "w-full max-w-sm p-10 space-y-6 bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-400/15"
  const titleClass = isDark
    ? "text-3xl font-bold text-white tracking-tight text-center"
    : "text-3xl font-bold text-slate-900 tracking-tight text-center"
  const subtitleClass = isDark ? "mt-2 text-sm text-slate-400 text-center" : "mt-2 text-sm text-slate-600 text-center"
  const inputClass = isDark
    ? "peer block w-full h-11 rounded-lg border border-slate-200 bg-slate-900/40 backdrop-blur py-2 px-3 text-sm text-white placeholder-transparent placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-colors"
    : "peer block w-full h-11 rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder-transparent placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-colors"
  const labelClass = isDark
    ? "absolute left-3 top-1/2 -translate-y-1/2 -z-10 origin-left transform text-xs font-medium text-slate-400 transition-all duration-200 pointer-events-none peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-teal-400 peer-[&:not(:placeholder-shown)]:-translate-y-6 peer-[&:not(:placeholder-shown)]:scale-75"
    : "absolute left-3 top-1/2 -translate-y-1/2 -z-10 origin-left transform text-xs font-medium text-slate-600 transition-all duration-200 pointer-events-none peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-teal-600 peer-[&:not(:placeholder-shown)]:-translate-y-6 peer-[&:not(:placeholder-shown)]:scale-75"
  const btnPrimaryClass =
    "group flex w-full items-center justify-center rounded-xl bg-[#009485] py-3 px-4 font-semibold text-white shadow-lg shadow-teal-500/20 transition-all duration-300 hover:bg-[#007a6e] hover:shadow-teal-500/25 disabled:bg-[#009485]/50 disabled:shadow-none disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
  const footerLinkClass = "font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition"

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-cyan-50/30 dark:bg-transparent">
      <AuthPageBackground />

      <div className="absolute top-4 left-4 right-4 sm:top-8 sm:left-8 sm:right-8 z-50 flex items-center justify-between pointer-events-none">
        <Link
          href="/login"
          className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all duration-300 backdrop-blur-sm bg-white/90 dark:bg-slate-900/80 px-4 py-2 rounded-xl border border-teal-200/60 dark:border-slate-600/60 h-10 shadow-sm hover:shadow-md pointer-events-auto text-teal-800 dark:text-teal-200 hover:text-teal-900 dark:hover:text-teal-100"
        >
          <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">{isSpanish ? 'Volver al Login' : 'Back to Login'}</span>
        </Link>
        <div className="flex items-center gap-3 pointer-events-auto">
          <LanguageSelector />
          <ThemeSwitch />
        </div>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center justify-center px-4">
        <div className={cardClass}>
          {success ? (
            <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300">
              <div className="flex justify-center">
                <div className="bg-emerald-100 dark:bg-emerald-900/40 p-3 rounded-2xl">
                  <ShieldCheck className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div>
                <h2 className={titleClass}>
                  {isSpanish ? "¡Contraseña Actualizada!" : "Password Updated!"}
                </h2>
                <p className={subtitleClass}>
                  {messages.passwordResetSuccess}
                </p>
              </div>
              <p className={isDark ? "text-sm text-slate-400" : "text-sm text-slate-600"}>
                {isSpanish
                  ? "Te redirigiremos al inicio de sesión en unos segundos."
                  : "You’ll be redirected to the sign-in page in a few seconds."}
              </p>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h1 className={titleClass}>
                  {isSpanish ? "Nueva Contraseña" : "Update Password"}
                </h1>
                <p className={subtitleClass}>
                  {isSpanish 
                    ? "Elige una nueva contraseña segura para tu cuenta."
                    : "Choose a new, secure password for your account."}
                </p>
              </div>

              {error && (
                <div className={isDark ? "bg-red-900/30 border border-red-700 rounded-xl p-3 flex items-start gap-2" : "bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2"}>
                  <AlertCircle className={`h-4 w-4 mt-0.5 ${isDark ? "text-red-400" : "text-red-500"}`} />
                  <p className={isDark ? "text-sm text-red-200" : "text-sm text-red-700"}>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative z-0">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="floating_password"
                    className={`${inputClass} pr-10`}
                    placeholder=" "
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label htmlFor="floating_password" className={labelClass}>
                    <Lock className="mr-2 -mt-1 inline-block" size={16} />
                    {isSpanish ? "Nueva Contraseña" : "New Password"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="relative z-0">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="floating_confirm_password"
                    className={`${inputClass} pr-10`}
                    placeholder=" "
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <label htmlFor="floating_confirm_password" className={labelClass}>
                    <Lock className="mr-2 -mt-1 inline-block" size={16} />
                    {isSpanish ? "Confirmar Contraseña" : "Confirm Password"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={btnPrimaryClass}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {isSpanish ? "Actualizando..." : "Updating..."}
                    </>
                  ) : (
                    <>
                      {isSpanish ? "Actualizar Contraseña" : "Update Password"}
                      <ArrowRight className="ml-2 h-5 w-5 transform transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
