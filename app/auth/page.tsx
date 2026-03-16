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
      const role = user.user_metadata?.role || "patient"
      const redirectPath = role === "professional" 
        ? "/dashboard/professional" 
        : role === "admin"
        ? "/admin"
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
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden transition-colors duration-500">
      <AuthPageBackground />

      {/* Header */}
      <div className="absolute top-4 left-4 right-4 sm:top-8 sm:left-8 sm:right-8 z-50 flex items-center justify-between pointer-events-none">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-bold transition-all duration-300 backdrop-blur-md bg-white/70 dark:bg-slate-900/60 px-4 py-2 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 h-10 shadow-lg shadow-teal-500/5 pointer-events-auto text-slate-800 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 group"
        >
          <ArrowRight className="h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> 
          <span className="hidden sm:inline">{t.auth.backToHome}</span>
        </Link>
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="backdrop-blur-md bg-white/70 dark:bg-slate-900/60 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg shadow-teal-500/5 flex items-center gap-1">
            <LanguageSelector />
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
            <ThemeSwitch />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-5xl px-4 py-2"
      >
        <div className="text-center mb-6">
          <motion.div variants={itemVariants} className="inline-flex items-center justify-center w-16 h-16 rounded-[1.2rem] bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-500/20 mb-3 shadow-2xl relative group">
            <div className="absolute inset-0 bg-teal-500/10 rounded-[1.2rem] blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50" />
            <Image
              src="/logo.png"
              alt="NUREA"
              width={60}
              height={60}
              className="w-10 h-10 object-contain relative z-10 drop-shadow-sm"
              priority
              unoptimized
            />
          </motion.div>
          <motion.h1 
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-2"
          >
            {isSpanish ? "Bienvenido a " : "Welcome to "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-400">NUREA</span>
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium"
          >
            {isSpanish 
              ? "Selecciona el camino que mejor se adapte a tus necesidades"
              : "Select the path that best suits your needs"}
          </motion.p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {/* Patient Card */}
          <motion.div variants={itemVariants} className="group/card h-full">
            <div
              className={cn(
                "relative h-full flex flex-col rounded-[2.5rem] border transition-all duration-500 overflow-hidden",
                "bg-white/80 dark:bg-slate-900/40 backdrop-blur-2xl",
                "border-slate-200/60 dark:border-slate-800/60",
                "shadow-2xl shadow-slate-200/40 dark:shadow-black/20",
                "hover:border-teal-400/50 dark:hover:border-teal-500/30",
                "hover:-translate-y-2"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
              
              <div className="p-6 flex flex-col flex-1 text-center relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center mx-auto mb-4 transition-transform duration-500 group-hover/card:scale-110 shadow-inner">
                  <User className="h-7 w-7 text-teal-500" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                  {isSpanish ? "Soy Paciente" : "I'm a Patient"}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 font-medium px-2">
                  {isSpanish
                    ? "Toma las riendas de tu salud con tecnología que te entiende, te acompaña y simplifica tu vida."
                    : "Take control of your health with technology that understands, accompanies, and simplifies your life."}
                </p>
                <ul className="space-y-2 text-left flex-1 max-w-[320px] mx-auto">
                  {(
                    isSpanish
                      ? [
                          "Agenda tus citas 24/7: Reserva tu atención en segundos, desde cualquier lugar y sin llamadas ni esperas.",
                          "Tu historial siempre contigo: Accede a tus recetas, exámenes e informes médicos de forma segura y organizada.",
                          "Cercanía real con expertos: Resuelve tus dudas y mantente en contacto con tus especialistas de confianza."
                        ]
                      : [
                          "24/7 Appointment Booking: Book your care in seconds, from anywhere, without calls or waiting.",
                          "Your history always with you: Access your prescriptions, exams, and medical reports securely and organized.",
                          "Real closeness with experts: Resolve your doubts and stay in touch with your trusted specialists."
                        ]
                  ).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <div className="h-5 w-5 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-teal-500 stroke-[3px]" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 pt-0 relative z-10">
                <Link
                  href="/auth/register?role=patient"
                  className="flex w-full items-center justify-center rounded-2xl bg-teal-600 py-2.5 px-6 text-sm font-bold text-white shadow-xl shadow-teal-500/20 transition-all duration-300 hover:bg-teal-500 hover:shadow-teal-500/30 active:scale-[0.98]"
                >
                  {isSpanish ? "Comenzar como Paciente" : "Start as Patient"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/card:translate-x-1" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Professional Card */}
          <motion.div variants={itemVariants} className="group/card h-full">
            <div
              className={cn(
                "relative h-full flex flex-col rounded-[2.5rem] border transition-all duration-500 overflow-hidden",
                "bg-white/80 dark:bg-slate-900/40 backdrop-blur-2xl",
                "border-slate-200/60 dark:border-slate-800/60",
                "shadow-2xl shadow-slate-200/40 dark:shadow-black/20",
                "hover:border-emerald-400/50 dark:hover:border-emerald-500/30",
                "hover:-translate-y-2"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
              
              <div className="p-6 flex flex-col flex-1 text-center relative z-10">
                <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 transition-transform duration-500 group-hover/card:scale-110 shadow-inner">
                  <Stethoscope className="h-7 w-7 text-emerald-500" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                  {isSpanish ? "Soy Profesional" : "I'm a Professional"}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4 font-medium px-2">
                  {isSpanish
                    ? "Digitaliza tu práctica, conecta con más pacientes y dedica tu talento a lo que realmente importa."
                    : "Digitalize your practice, connect with more patients, and dedicate your talent to what really matters."}
                </p>
                <ul className="space-y-2 text-left flex-1 max-w-[320px] mx-auto">
                  {(
                    isSpanish
                      ? [
                          "Conecta con más pacientes: Hazte visible en nuestra red profesional y expande tu alcance sin esfuerzo.",
                          "Calendario inteligente 24/7: Olvida los cruces de horarios con una agenda que se organiza automáticamente por ti.",
                          "IA y Visor PACS a tu medida: Informes rápidos con Nura AI adaptada a tu especialidad y visualización médica profesional."
                        ]
                      : [
                          "Connect with more patients: Get visible in our professional network and expand your reach effortlessly.",
                          "24/7 Smart Calendar: Forget scheduling conflicts with an agenda that automatically organizes itself for you.",
                          "Custom AI & PACS Viewer: Fast reports with Nura AI tailored to your specialty and professional medical visualization."
                        ]
                  ).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-emerald-500 stroke-[3px]" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 pt-0 relative z-10">
                <Link
                  href="/auth/register?role=professional"
                  className="flex w-full items-center justify-center rounded-2xl bg-slate-900 dark:bg-emerald-600 py-2.5 px-6 text-sm font-bold text-white shadow-xl shadow-slate-900/10 dark:shadow-emerald-500/20 transition-all duration-300 hover:bg-slate-800 dark:hover:bg-emerald-500 hover:shadow-emerald-500/30 active:scale-[0.98]"
                >
                  {isSpanish ? "Comenzar como Profesional" : "Start as Professional"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/card:translate-x-1" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Info Notice */}
        <motion.div 
          variants={itemVariants}
          className="mt-4 text-center"
        >
          <div className="inline-block px-6 py-3 rounded-2xl bg-slate-200/30 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
              {isSpanish 
                ? "Al seleccionar tu tipo de cuenta, aceptas nuestros Términos de Servicio y Política de Privacidad. Tu rol será verificado tras el registro."
                : "By selecting your account type, you agree to our Terms of Service and Privacy Policy. Your role will be verified after registration."}
            </p>
          </div>
        </motion.div>

      </motion.div>
    </main>
  )
}

