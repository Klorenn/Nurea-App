"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AuthPageBackground } from "@/components/ui/login-form"
import ThemeSwitch from "@/components/ui/theme-switch"
import { LanguageSelector } from "@/components/ui/language-selector"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"
import { User, Stethoscope, ArrowRight, Check } from "lucide-react"
import { motion, type Variants } from "framer-motion"
import { cn } from "@/lib/utils"

export default function AuthPage() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const isSpanish = language === "es"

  useEffect(() => {
    // Si el usuario ya está autenticado, redirigir según su rol
    if (!authLoading && user) {
      const redirectPath = user.user_metadata?.role === "professional" 
        ? "/professional/dashboard" 
        : "/dashboard"
      router.push(redirectPath)
    }
  }, [user, authLoading, router])

  // Mostrar loading mientras se verifica autenticación
  if (authLoading) {
    return (
      <main className="relative min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">
            {isSpanish ? "Cargando..." : "Loading..."}
          </p>
        </div>
      </main>
    )
  }

  // Si el usuario está autenticado, no renderizar nada (ya se redirigió)
  if (user) {
    return null
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      } as any,
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 } as any,
    },
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-cyan-50/30 dark:bg-transparent">
      <AuthPageBackground />

      {/* Header */}
      <div className="absolute top-4 left-4 right-4 sm:top-8 sm:left-8 sm:right-8 z-50 flex items-center justify-between pointer-events-none">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all duration-300 backdrop-blur-sm bg-white/90 dark:bg-slate-900/80 px-4 py-2 rounded-xl border border-teal-200/60 dark:border-slate-600/60 h-10 shadow-sm hover:shadow-md pointer-events-auto text-teal-800 dark:text-teal-200 hover:text-teal-900 dark:hover:text-teal-100"
        >
          <ArrowRight className="h-4 w-4 rotate-180" /> 
          <span className="hidden sm:inline">{t.auth.backToHome}</span>
        </Link>
        <div className="flex items-center gap-3 pointer-events-auto">
          <LanguageSelector />
          <ThemeSwitch />
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-4xl px-4"
      >
        <div className="text-center mb-12">
          <motion.div variants={itemVariants} className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white dark:bg-slate-800/80 border border-teal-200/60 dark:border-teal-500/30 mb-6 shadow-md overflow-hidden ring-2 ring-teal-100 dark:ring-teal-500/20">
            <Image
              src="/logo.png"
              alt="NUREA"
              width={80}
              height={80}
              className="w-full h-full object-contain"
              priority
              unoptimized
            />
          </motion.div>
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-950 dark:text-white mb-4"
          >
            {isSpanish ? "Bienvenido a NUREA" : "Welcome to NUREA"}
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-lg sm:text-xl text-slate-600 dark:text-slate-500 max-w-2xl mx-auto"
          >
            {isSpanish 
              ? "Selecciona tu tipo de cuenta"
              : "Choose your account type"}
          </motion.p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
          {/* Patient Card */}
          <motion.div variants={itemVariants} className="h-full">
            <div
              className={cn(
                "relative h-full flex flex-col rounded-3xl border transition-all duration-300",
                "bg-white dark:bg-slate-900/60 backdrop-blur-xl",
                "border-slate-200/90 dark:border-slate-600/50",
                "shadow-xl shadow-slate-300/20 dark:shadow-black/15",
                "hover:border-teal-300 dark:hover:border-teal-500/50",
                "hover:shadow-2xl hover:shadow-teal-500/15"
              )}
            >
              <div className="p-8 flex flex-col flex-1 text-center">
                <div className="w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-500/20 flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <User className="h-8 w-8 text-teal-500" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white mb-2">
                  {isSpanish ? "Soy Paciente" : "I'm a Patient"}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-500 leading-relaxed mb-6">
                  {isSpanish
                    ? "Accede a tu historial médico, agenda citas y comunica con tus especialistas de forma segura."
                    : "Access your medical history, book appointments, and communicate with your specialists securely."}
                </p>
                <ul className="space-y-3 text-left flex-1">
                  {(
                    isSpanish
                      ? ["Gestión de citas 24/7", "Resultados de laboratorio online", "Chat directo con tu médico"]
                      : ["24/7 appointment management", "Online lab results", "Direct chat with your doctor"]
                  ).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Check className="h-4 w-4 shrink-0 text-teal-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 pt-0">
                <Link
                  href="/auth/register?role=patient"
                  className="flex w-full items-center justify-center rounded-xl bg-[#009485] py-3.5 px-4 font-semibold text-white shadow-lg shadow-teal-500/20 transition-all duration-300 hover:bg-[#007a6e] hover:shadow-teal-500/25"
                >
                  {isSpanish ? "Continuar como Paciente" : "Continue as Patient"}
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Professional Card */}
          <motion.div variants={itemVariants} className="h-full">
            <div
              className={cn(
                "relative h-full flex flex-col rounded-3xl border transition-all duration-300",
                "bg-white dark:bg-slate-900/60 backdrop-blur-xl",
                "border-slate-200/90 dark:border-slate-600/50",
                "shadow-xl shadow-slate-300/20 dark:shadow-black/15",
                "hover:border-teal-300 dark:hover:border-teal-500/50",
                "hover:shadow-2xl hover:shadow-teal-500/15"
              )}
            >
              <div className="p-8 flex flex-col flex-1 text-center">
                <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-500/20 flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <Stethoscope className="h-8 w-8 text-teal-500" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white mb-2">
                  {isSpanish ? "Soy Profesional" : "I'm a Professional"}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-500 leading-relaxed mb-6">
                  {isSpanish
                    ? "Optimiza tu consulta, gestiona expedientes electrónicos y mejora la atención a tus pacientes."
                    : "Optimize your practice, manage electronic records, and improve care for your patients."}
                </p>
                <ul className="space-y-3 text-left flex-1">
                  {(
                    isSpanish
                      ? ["Expediente Clínico Digital", "Telemedicina integrada", "Analítica avanzada de pacientes"]
                      : ["Digital Clinical Record", "Integrated telemedicine", "Advanced patient analytics"]
                  ).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Check className="h-4 w-4 shrink-0 text-teal-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 pt-0">
                <Link
                  href="/auth/register?role=professional"
                  className="flex w-full items-center justify-center rounded-xl bg-[#009485] py-3.5 px-4 font-semibold text-white shadow-lg shadow-teal-500/20 transition-all duration-300 hover:bg-[#007a6e] hover:shadow-teal-500/25"
                >
                  {isSpanish ? "Continuar como Profesional" : "Continue as Professional"}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Info Notice */}
        <motion.div 
          variants={itemVariants}
          className="mt-10 text-center"
        >
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {isSpanish 
              ? "Al seleccionar tu tipo de cuenta, aceptas nuestros Términos de Servicio y Política de Privacidad. El rol seleccionado quedará asociado permanentemente a tu cuenta."
              : "By selecting your account type, you agree to our Terms of Service and Privacy Policy. The selected role will be permanently associated with your account."}
          </p>
        </motion.div>

      </motion.div>
    </main>
  )
}

