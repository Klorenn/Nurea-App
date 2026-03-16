"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, AlertTriangle, XCircle } from "lucide-react"
import ThemeSwitch from "@/components/ui/theme-switch"
import { LanguageSelector } from "@/components/ui/language-selector"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { AuthPageBackground, LoginForm } from "@/components/ui/login-form"

function LoginContent() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const searchParams = useSearchParams()
  
  const error = searchParams.get('error')
  const email = searchParams.get('email')
  const message = searchParams.get('message')

  const getErrorAlert = () => {
    if (!error) return null

    const isSpanish = language === 'es'

    switch (error) {
      case 'account-not-found':
        return {
          type: 'warning' as const,
          title: isSpanish ? 'Cuenta no encontrada' : 'Account not found',
          message: isSpanish 
            ? `No encontramos una cuenta vinculada a ${email ? `"${email}"` : 'este correo'}. Por favor, crea una cuenta primero.`
            : `We couldn't find an account linked to ${email ? `"${email}"` : 'this email'}. Please create an account first.`,
          action: {
            label: isSpanish ? 'Crear cuenta' : 'Create account',
            href: '/auth/register'
          }
        }
      case 'oauth_error':
        return {
          type: 'error' as const,
          title: isSpanish ? 'Error de autenticación' : 'Authentication error',
          message: message || (isSpanish ? 'Ocurrió un error durante la autenticación con Google.' : 'An error occurred during Google authentication.'),
          action: null
        }
      case 'exchange_failed':
        return {
          type: 'error' as const,
          title: isSpanish ? 'Error de sesión' : 'Session error',
          message: isSpanish 
            ? 'No pudimos establecer tu sesión. Por favor, intenta de nuevo.'
            : 'We couldn\'t establish your session. Please try again.',
          action: null
        }
      case 'missing_code':
      case 'no_user':
      case 'callback_error':
        return {
          type: 'error' as const,
          title: isSpanish ? 'Error de autenticación' : 'Authentication error',
          message: isSpanish 
            ? 'Ocurrió un error durante el proceso de inicio de sesión. Por favor, intenta de nuevo.'
            : 'An error occurred during the sign-in process. Please try again.',
          action: null
        }
      default:
        return null
    }
  }

  const alertData = getErrorAlert()

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden dark:bg-transparent">
      <AuthPageBackground />

      <div className="absolute top-4 left-4 right-4 sm:top-8 sm:left-8 sm:right-8 z-50 flex items-center justify-between pointer-events-none">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all duration-300 backdrop-blur-sm bg-white/90 dark:bg-slate-900/80 px-4 py-2 rounded-xl border border-teal-200/60 dark:border-slate-600/60 h-10 shadow-sm hover:shadow-md pointer-events-auto text-teal-800 dark:text-teal-200 hover:text-teal-900 dark:hover:text-teal-100"
        >
          <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">{t.auth.backToHome}</span>
        </Link>
        <div className="flex items-center gap-3 pointer-events-auto">
          <LanguageSelector />
          <ThemeSwitch />
        </div>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center justify-center px-4 gap-4">
        {/* Error Alert Banner */}
        {alertData && (
          <div 
            className={`w-full max-w-sm p-4 rounded-xl border backdrop-blur-sm shadow-lg ${
              alertData.type === 'warning'
                ? 'bg-amber-50/95 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700'
                : 'bg-red-50/95 dark:bg-red-950/80 border-red-300 dark:border-red-700'
            }`}
          >
            <div className="flex items-start gap-3">
              {alertData.type === 'warning' ? (
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-semibold ${
                  alertData.type === 'warning'
                    ? 'text-amber-800 dark:text-amber-200'
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {alertData.title}
                </h3>
                <p className={`mt-1 text-sm ${
                  alertData.type === 'warning'
                    ? 'text-amber-700 dark:text-amber-300'
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {alertData.message}
                </p>
                {alertData.action && (
                  <Link
                    href={alertData.action.href}
                    className={`inline-flex items-center mt-3 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                      alertData.type === 'warning'
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {alertData.action.label}
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        <LoginForm />
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-cyan-50/30 dark:bg-transparent">
        <div className="animate-pulse text-slate-500">Cargando...</div>
      </main>
    }>
      <LoginContent />
    </Suspense>
  )
}
