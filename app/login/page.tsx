"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ThemeSwitch from "@/components/ui/theme-switch"
import { LanguageSelector } from "@/components/ui/language-selector"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { SmokeyBackground, LoginForm } from "@/components/ui/login-form"

export default function LoginPage() {
  const { language } = useLanguage()
  const t = useTranslations(language)

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-slate-200 dark:bg-[#0EA5E9]">
      <SmokeyBackground backdropBlurAmount="lg" color="#0EA5E9" />

      <div className="absolute top-4 left-4 right-4 sm:top-8 sm:left-8 sm:right-8 z-50 flex items-center justify-between pointer-events-none">
        <Link
          href="/"
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
        <LoginForm />
      </div>
    </main>
  )
}
