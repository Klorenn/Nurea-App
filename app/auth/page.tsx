"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { SmokeyBackground } from "@/components/ui/login-form"
import ThemeSwitch from "@/components/ui/theme-switch"
import { LanguageSelector } from "@/components/ui/language-selector"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { useAuth } from "@/hooks/use-auth"
import { User, Stethoscope, ArrowRight, Heart, Shield } from "lucide-react"
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
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-slate-200 dark:bg-[#0EA5E9]">
      <SmokeyBackground color="#0EA5E9" />
      
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 sm:top-8 sm:left-8 sm:right-8 z-50 flex items-center justify-between pointer-events-none">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-white/90 hover:text-gray-900 dark:hover:text-white transition-all duration-300 backdrop-blur-sm bg-white/90 dark:bg-white/10 px-4 py-2 rounded-xl border-2 border-teal-200/50 dark:border-white/30 h-10 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:shadow-white/50 dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] dark:hover:shadow-white/35 pointer-events-auto"
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
          <motion.div variants={itemVariants} className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
            <Shield className="h-10 w-10 text-primary" />
          </motion.div>
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4"
          >
            {isSpanish ? "Bienvenido a NUREA" : "Welcome to NUREA"}
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            {isSpanish 
              ? "Selecciona tu tipo de cuenta"
              : "Choose your account type"}
          </motion.p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Patient Card */}
          <motion.div variants={itemVariants}>
            <Link
              href="/auth/register?role=patient"
              className="group block h-full"
            >
              <div className={cn(
                "relative h-full p-8 rounded-2xl border-2 transition-all duration-300",
                "bg-white/95 dark:bg-gray-900/90 backdrop-blur-xl",
                "border-teal-200/80 dark:border-teal-500/30",
                "hover:border-primary hover:shadow-2xl hover:shadow-primary/20",
                "hover:scale-[1.02] active:scale-[0.98]"
              )}>
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="w-16 h-16 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <User className="h-8 w-8 text-teal-600 dark:text-teal-400 group-hover:text-white transition-colors" />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {isSpanish ? "Soy Paciente" : "I'm a Patient"}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {isSpanish 
                        ? "Busca profesionales de la salud, agenda citas y gestiona tu salud de forma simple y segura."
                        : "Find healthcare professionals, book appointments, and manage your health simply and securely."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Heart className="h-3 w-3" />
                      <span>{isSpanish ? "Gratis" : "Free"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Shield className="h-3 w-3" />
                      <span>{isSpanish ? "Seguro" : "Secure"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Professional Card */}
          <motion.div variants={itemVariants}>
            <Link
              href="/auth/register?role=professional"
              className="group block h-full"
            >
              <div className={cn(
                "relative h-full p-8 rounded-2xl border-2 transition-all duration-300",
                "bg-white/95 dark:bg-gray-900/90 backdrop-blur-xl",
                "border-teal-200/80 dark:border-teal-500/30",
                "hover:border-primary hover:shadow-2xl hover:shadow-primary/20",
                "hover:scale-[1.02] active:scale-[0.98]"
              )}>
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="w-16 h-16 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <Stethoscope className="h-8 w-8 text-teal-600 dark:text-teal-400 group-hover:text-white transition-colors" />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {isSpanish ? "Soy Profesional" : "I'm a Professional"}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {isSpanish 
                        ? "Únete a NUREA para gestionar tu práctica, conectar con pacientes y hacer crecer tu consulta."
                        : "Join NUREA to manage your practice, connect with patients, and grow your consultation."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Shield className="h-3 w-3" />
                      <span>{isSpanish ? "Verificado" : "Verified"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Heart className="h-3 w-3" />
                      <span>{isSpanish ? "Herramientas" : "Tools"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Info Notice */}
        <motion.div 
          variants={itemVariants}
          className="mt-8 text-center"
        >
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
            {isSpanish 
              ? "Al seleccionar tu tipo de cuenta, aceptas nuestros Términos de Servicio y Política de Privacidad. El rol seleccionado quedará asociado permanentemente a tu cuenta."
              : "By selecting your account type, you agree to our Terms of Service and Privacy Policy. The selected role will be permanently associated with your account."}
          </p>
        </motion.div>

      </motion.div>
    </main>
  )
}

