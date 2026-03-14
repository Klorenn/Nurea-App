"use client"

import { motion } from "framer-motion"
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Clock,
  Mail,
  Loader2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import { ProfessionalCalendar } from "@/components/dashboard/professional-calendar"

interface ProfessionalProfile {
  id: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
}

interface ProfessionalDashboardContentProps {
  profile: ProfessionalProfile | null
  isVerified: boolean
  userEmail?: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
}

function VerificationPendingCard({ isSpanish }: { isSpanish: boolean }) {
  return (
    <motion.div
      variants={itemVariants}
      className="flex items-center justify-center min-h-[60vh]"
    >
      <div className="relative w-full max-w-2xl mx-auto">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-teal-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-teal-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-300/10 rounded-full blur-3xl" />

        <div
          className={cn(
            "relative overflow-hidden",
            "rounded-3xl",
            "border border-teal-500/30",
            "bg-gradient-to-br from-teal-500/5 via-teal-500/[0.02] to-transparent",
            "backdrop-blur-xl",
            "shadow-2xl shadow-teal-500/10",
            "p-8 md:p-12"
          )}
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-teal-400/20 via-transparent to-teal-600/10 opacity-50" />
          
          <div className="relative z-10 text-center space-y-8">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 rounded-full border-2 border-teal-500/30 animate-ping" />
              <div className="absolute inset-2 rounded-full border border-teal-500/20 animate-pulse" />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500/20 to-teal-600/10 border border-teal-500/30 flex items-center justify-center">
                  <ShieldCheck className="h-10 w-10 text-teal-500" />
                </div>
              </div>
              
              <svg
                className="absolute inset-0 w-full h-full animate-spin-slow"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  strokeDasharray="60 200"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#0d9488" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
                {isSpanish
                  ? "Cuenta en Proceso de Verificación"
                  : "Account Verification in Progress"}{" "}
                🛡️
              </h2>
              <div className="flex items-center justify-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500" />
                </span>
                <span className="text-sm font-medium text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  {isSpanish ? "En revisión" : "Under review"}
                </span>
              </div>
            </div>

            <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto">
              {isSpanish
                ? "Para garantizar la excelencia en NUREA, estamos verificando tus credenciales con la Superintendencia de Salud. Este proceso toma menos de 24 horas. Te notificaremos por correo electrónico cuando tu agenda esté lista para recibir pacientes."
                : "To ensure excellence at NUREA, we are verifying your credentials with the Health Superintendence. This process takes less than 24 hours. We will notify you by email when your schedule is ready to receive patients."}
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <Clock className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isSpanish ? "Tiempo estimado: < 24 horas" : "Estimated time: < 24 hours"}
                </span>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <Mail className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isSpanish
                    ? "Recibirás confirmación por email"
                    : "You'll receive email confirmation"}
                </span>
              </div>
            </div>

            <div className="pt-6">
              <div className="w-full max-w-md mx-auto">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                  <span>{isSpanish ? "Verificando credenciales" : "Verifying credentials"}</span>
                  <span className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {isSpanish ? "En progreso" : "In progress"}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "65%" }}
                    transition={{ duration: 2, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function VerifiedDashboard({
  profile,
  isSpanish,
}: {
  profile: ProfessionalProfile | null
  isSpanish: boolean
}) {
  const doctorName = profile?.first_name || "Profesional"

  const metrics = [
    {
      title: isSpanish ? "Citas Hoy" : "Appointments Today",
      value: "5",
      change: "+2",
      changeLabel: isSpanish ? "vs ayer" : "vs yesterday",
      icon: Calendar,
      bgGradient: "from-blue-500/10 to-blue-600/5",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: isSpanish ? "Pacientes Activos" : "Active Patients",
      value: "127",
      change: "+12",
      changeLabel: isSpanish ? "este mes" : "this month",
      icon: Users,
      bgGradient: "from-violet-500/10 to-violet-600/5",
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-600 dark:text-violet-400",
    },
    {
      title: isSpanish ? "Ingresos del Mes" : "Monthly Revenue",
      value: "$2,450",
      change: "+18%",
      changeLabel: isSpanish ? "vs mes anterior" : "vs last month",
      icon: DollarSign,
      bgGradient: "from-emerald-500/10 to-emerald-600/5",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
  ]

  return (
    <>
      <motion.div variants={itemVariants} className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
          {isSpanish ? "Hola, Dr. " : "Hello, Dr. "}
          <span className="text-teal-600 dark:text-teal-400">{doctorName}</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          {isSpanish
            ? "Aquí tienes tu resumen de hoy"
            : "Here's your summary for today"}
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <Card
            key={metric.title}
            className={cn(
              "relative overflow-hidden border-slate-200/80 dark:border-slate-700/60",
              "hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50",
              "transition-all duration-300 cursor-default group"
            )}
          >
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-50",
                metric.bgGradient
              )}
            />
            <CardContent className="relative p-5 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {metric.title}
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-100">
                    {metric.value}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      {metric.change}
                    </span>
                    <span className="text-xs text-slate-400">
                      {metric.changeLabel}
                    </span>
                  </div>
                </div>
                <div
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    "group-hover:scale-110 transition-transform duration-300",
                    metric.iconBg
                  )}
                >
                  <metric.icon className={cn("h-6 w-6", metric.iconColor)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        <ProfessionalCalendar />
      </motion.div>
    </>
  )
}

export function ProfessionalDashboardContent({
  profile,
  isVerified,
  userEmail,
}: ProfessionalDashboardContentProps) {
  const { language } = useLanguage()
  const isSpanish = language === "es"

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 md:space-y-8"
    >
      {isVerified ? (
        <VerifiedDashboard profile={profile} isSpanish={isSpanish} />
      ) : (
        <VerificationPendingCard isSpanish={isSpanish} />
      )}
    </motion.div>
  )
}
