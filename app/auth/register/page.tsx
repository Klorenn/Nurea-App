"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AuthPageBackground } from "@/components/ui/login-form"
import { SignupForm } from "@/components/smokey-login"
import ThemeSwitch from "@/components/ui/theme-switch"
import { LanguageSelector } from "@/components/ui/language-selector"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { useAuth } from "@/hooks/use-auth"

function RegisterPageContent() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const role = searchParams.get("role")

  useEffect(() => {
    // Si el usuario ya está autenticado, redirigir según su rol
    if (!authLoading && user) {
      router.push("/dashboard")
      return
    }

    // Si no hay rol en la URL, redirigir a la pantalla de selección
    if (!authLoading && !user && !role) {
      router.push("/auth")
      return
    }

    // Validar que el rol sea válido
    if (role && !["patient", "professional"].includes(role)) {
      router.push("/auth")
      return
    }
  }, [user, authLoading, role, router])

  // Mostrar loading mientras se verifica
  if (authLoading) {
    return (
      <main className="relative min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </main>
    )
  }

  // Si no hay rol válido, no renderizar nada (ya se redirigió)
  if (!role || !["patient", "professional"].includes(role)) {
    return null
  }

  const plan = searchParams.get("plan")

  return (
    <main className="relative min-h-screen overflow-y-auto bg-cyan-50/30 dark:bg-transparent">
      <AuthPageBackground />

      {/* Top bar */}
      <div className="sticky top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 sm:px-8">
        <Link
          href="/auth"
          className="flex items-center gap-2 text-sm font-bold text-teal-800 dark:text-teal-200 hover:text-teal-900 dark:hover:text-teal-100 transition-colors backdrop-blur-sm bg-white/90 dark:bg-slate-900/80 px-3 py-1.5 rounded-xl border border-teal-200/60 dark:border-slate-600/60 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">{t.auth.backToHome}</span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <ThemeSwitch />
        </div>
      </div>

      {/* Form centered in remaining space */}
      <div className="relative z-10 flex items-start justify-center px-4 py-4 min-h-[calc(100vh-3.5rem)]">
        <div className="flex items-center justify-center w-full">
          <SignupForm initialRole={role as "patient" | "professional"} initialPlan={plan} />
        </div>
      </div>
    </main>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <main className="relative min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </main>
    }>
      <RegisterPageContent />
    </Suspense>
  )
}

