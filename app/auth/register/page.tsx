"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { SmokeyBackground } from "@/components/ui/login-form"
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

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-slate-200 dark:bg-[#0EA5E9]">
      <SmokeyBackground backdropBlurAmount="lg" color="#0EA5E9" />
      
      <div className="absolute top-4 left-4 right-4 sm:top-8 sm:left-8 sm:right-8 z-50 flex items-center justify-between pointer-events-none">
        <Link
          href="/auth"
          className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-white/90 hover:text-gray-900 dark:hover:text-white transition-all duration-300 backdrop-blur-sm bg-white/90 dark:bg-white/10 px-4 py-2 rounded-xl border-2 border-teal-200/50 dark:border-white/30 h-10 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:shadow-white/50 dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] dark:hover:shadow-white/35 pointer-events-auto"
        >
          <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">{t.auth.backToHome}</span>
        </Link>
        <div className="flex items-center gap-3 pointer-events-auto">
          <LanguageSelector />
          <ThemeSwitch />
        </div>
      </div>

      <div className="relative z-10 w-full flex items-center justify-center px-4">
        <SignupForm initialRole={role as "patient" | "professional"} />
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

