"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RouteGuard } from "@/components/auth/route-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  TrendingUp,
  User,
  ArrowRight,
  AlertCircle
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/hooks/use-auth"
import { useProfessionalStats } from "@/hooks/use-professional-stats"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { LoadingState } from "@/components/dashboard/loading-state"
import { ErrorState } from "@/components/dashboard/error-state"
import { StatsCard } from "@/components/dashboard/stats-card"
import { EmptyState } from "@/components/dashboard/empty-state"

export default function ProfessionalDashboardPage() {
  const { language } = useLanguage()
  const { user } = useAuth()
  const router = useRouter()
  const isSpanish = language === "es"
  
  const { stats, upcomingAppointments, loading, error, refetch } = useProfessionalStats({ period: 'month' })
  const [onboardingStatus, setOnboardingStatus] = useState<{
    isComplete: boolean
    missingFields: string[]
  } | null>(null)

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      const response = await fetch('/api/professional/onboarding/status')
      const data = await response.json()
      
      if (response.ok && data.success) {
        setOnboardingStatus({
          isComplete: data.isComplete,
          missingFields: data.missingFields || []
        })
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error)
    }
  }

  const formatDate = (dateString: string, timeString: string) => {
    const date = new Date(`${dateString}T${timeString}`)
    return date.toLocaleDateString(
      isSpanish ? "es-ES" : "en-US",
      { 
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      }
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isSpanish ? "es-CL" : "en-US", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  return (
    <RouteGuard requiredRole="professional">
      <DashboardLayout role="professional">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {isSpanish ? "Panel Profesional" : "Professional Dashboard"}
            </h1>
            <p className="text-muted-foreground">
              {isSpanish 
                ? "Resumen de tu actividad y próximas citas"
                : "Overview of your activity and upcoming appointments"}
            </p>
          </div>

          {/* Onboarding Incomplete Alert */}
          {onboardingStatus && !onboardingStatus.isComplete && (
            <motion.div variants={itemVariants}>
              <Card className="border-amber-500/50 bg-amber-500/10">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                        {isSpanish 
                          ? "Configuración de Perfil Incompleta" 
                          : "Profile Setup Incomplete"}
                      </h3>
                      <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                        {isSpanish 
                          ? "Completa tu perfil profesional para comenzar a recibir pacientes. Faltan los siguientes campos:"
                          : "Complete your professional profile to start receiving patients. The following fields are missing:"}
                      </p>
                      <ul className="list-disc list-inside text-sm text-amber-800 dark:text-amber-200 mb-4 space-y-1">
                        {onboardingStatus.missingFields.map((field) => {
                          const fieldNames: { [key: string]: { es: string; en: string } } = {
                            specialty: { es: "Especialidad", en: "Specialty" },
                            bio: { es: "Biografía", en: "Biography" },
                            consultation_type: { es: "Tipo de Consulta", en: "Consultation Type" },
                            online_price: { es: "Precio Online", en: "Online Price" },
                            in_person_price: { es: "Precio Presencial", en: "In-Person Price" },
                            availability: { es: "Disponibilidad", en: "Availability" },
                            bank_account: { es: "Cuenta Bancaria", en: "Bank Account" },
                            bank_name: { es: "Nombre del Banco", en: "Bank Name" },
                            registration_number: { es: "Número de Registro", en: "Registration Number" },
                            registration_institution: { es: "Institución de Registro", en: "Registration Institution" },
                          }
                          const fieldName = fieldNames[field]?.[isSpanish ? "es" : "en"] || field
                          return <li key={field}>{fieldName}</li>
                        })}
                      </ul>
                      <Button
                        onClick={() => router.push("/professional/onboarding")}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        {isSpanish ? "Completar Configuración" : "Complete Setup"}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {loading ? (
            <LoadingState message={isSpanish ? "Cargando datos..." : "Loading data..."} />
          ) : error ? (
            <ErrorState 
              message={error} 
              action={{ 
                label: isSpanish ? "Reintentar" : "Retry", 
                onClick: refetch 
              }} 
            />
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title={isSpanish ? "Citas Hoy" : "Today's Appointments"}
                  value={stats.todayAppointments}
                  description={isSpanish ? "Citas programadas para hoy" : "Scheduled for today"}
                  icon={Calendar}
                  variant="gradient"
                />
                <StatsCard
                  title={isSpanish ? "Próximas Citas" : "Upcoming Appointments"}
                  value={stats.upcomingAppointments}
                  description={isSpanish ? "Citas confirmadas" : "Confirmed appointments"}
                  icon={Clock}
                  variant="gradient"
                />
                <StatsCard
                  title={isSpanish ? "Pacientes Activos" : "Active Patients"}
                  value={stats.activePatients}
                  description={isSpanish ? "Pacientes con citas" : "Patients with appointments"}
                  icon={Users}
                  variant="gradient"
                />
                <StatsCard
                  title={isSpanish ? "Ingresos del Mes" : "Monthly Income"}
                  value={formatCurrency(stats.monthlyIncome)}
                  description={isSpanish ? "Ingresos completados" : "Completed income"}
                  icon={DollarSign}
                  variant="gradient"
                />
              </div>

              {/* Upcoming Appointments */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {isSpanish ? "Próximas Citas" : "Upcoming Appointments"}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push("/professional/schedule")}
                    >
                      {isSpanish ? "Ver todas" : "View all"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {upcomingAppointments.length === 0 ? (
                      <EmptyState
                        icon={Calendar}
                        title={isSpanish 
                          ? "No tienes citas próximas programadas"
                          : "You don't have any upcoming appointments scheduled"}
                      />
                    ) : (
                      <div className="space-y-4">
                        {upcomingAppointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className="flex items-center justify-between p-4 rounded-lg border border-border/40 hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-6 w-6 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold">
                                    {appointment.patient?.first_name} {appointment.patient?.last_name}
                                  </p>
                                  <Badge variant="outline" className="text-xs">
                                    {appointment.type === "online" 
                                      ? (isSpanish ? "Online" : "Online")
                                      : (isSpanish ? "Presencial" : "In-person")}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(appointment.appointment_date, appointment.appointment_time)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-primary">
                                {formatCurrency(parseFloat(appointment.price?.toString() || "0"))}
                              </p>
                              <Badge 
                                variant={appointment.payment_status === "paid" ? "default" : "secondary"}
                                className="text-xs mt-1"
                              >
                                {appointment.payment_status === "paid" 
                                  ? (isSpanish ? "Pagado" : "Paid")
                                  : (isSpanish ? "Pendiente" : "Pending")}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {isSpanish ? "Acciones Rápidas" : "Quick Actions"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <Button
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-start gap-2"
                        onClick={() => router.push("/professional/schedule")}
                      >
                        <Calendar className="h-5 w-5" />
                        <div className="text-left">
                          <p className="font-semibold">
                            {isSpanish ? "Ver Agenda" : "View Schedule"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isSpanish ? "Gestiona tus citas" : "Manage your appointments"}
                          </p>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-start gap-2"
                        onClick={() => router.push("/professional/patients")}
                      >
                        <Users className="h-5 w-5" />
                        <div className="text-left">
                          <p className="font-semibold">
                            {isSpanish ? "Ver Pacientes" : "View Patients"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isSpanish ? "Lista de pacientes" : "Patient list"}
                          </p>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-start gap-2"
                        onClick={() => router.push("/professional/income")}
                      >
                        <DollarSign className="h-5 w-5" />
                        <div className="text-left">
                          <p className="font-semibold">
                            {isSpanish ? "Ver Ingresos" : "View Income"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isSpanish ? "Ingresos y pagos" : "Income and payments"}
                          </p>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </motion.div>
      </DashboardLayout>
    </RouteGuard>
  )
}
