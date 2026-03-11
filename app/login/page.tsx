"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ThemeSwitch from "@/components/ui/theme-switch"
import { LanguageSelector } from "@/components/ui/language-selector"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { AuthPageBackground, LoginForm } from "@/components/ui/login-form"

export default function LoginPage() {
  const { language } = useLanguage()
  const t = useTranslations(language)

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-cyan-50/30 dark:bg-transparent">
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

      <div className="relative z-10 w-full flex items-center justify-center px-4">
        <LoginForm />
      </div>
    </main>
  )
}
