"use client"

import { useState, useEffect, useMemo } from "react"
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
  User,
  ArrowRight,
  AlertCircle,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/hooks/use-auth"
import { motion, type Variants } from "framer-motion"
import { useRouter } from "next/navigation"
import { StatsCard } from "@/components/dashboard/stats-card"
import { EmptyState } from "@/components/dashboard/empty-state"
import { Progress } from "@/components/ui/progress"
import { Eye, BarChart3 } from "lucide-react"

type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled"

interface MockAppointment {
  id: string
  appointment_date: string
  appointment_time: string
  type: "online" | "in_person"
  status: AppointmentStatus
  payment_status: "pending" | "paid" | "escrow_locked"
  price: number
  patient: { first_name: string; last_name: string }
}

const todayStr = () => new Date().toISOString().slice(0, 10)
const tomorrowStr = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}
const dayAfterStr = () => {
  const d = new Date()
  d.setDate(d.getDate() + 2)
  return d.toISOString().slice(0, 10)
}

const MOCK_APPOINTMENTS_INITIAL: MockAppointment[] = [
  { id: "1", appointment_date: todayStr(), appointment_time: "09:00", type: "online", status: "confirmed", payment_status: "paid", price: 45000, patient: { first_name: "María", last_name: "González" } },
  { id: "2", appointment_date: todayStr(), appointment_time: "11:30", type: "in_person", status: "pending", payment_status: "pending", price: 50000, patient: { first_name: "Carlos", last_name: "López" } },
  { id: "3", appointment_date: todayStr(), appointment_time: "15:00", type: "online", status: "confirmed", payment_status: "escrow_locked", price: 45000, patient: { first_name: "Ana", last_name: "Martínez" } },
  { id: "4", appointment_date: tomorrowStr(), appointment_time: "10:00", type: "online", status: "confirmed", payment_status: "paid", price: 45000, patient: { first_name: "Pedro", last_name: "Sánchez" } },
  { id: "5", appointment_date: tomorrowStr(), appointment_time: "16:00", type: "in_person", status: "confirmed", payment_status: "pending", price: 55000, patient: { first_name: "María", last_name: "González" } },
  { id: "6", appointment_date: dayAfterStr(), appointment_time: "09:30", type: "online", status: "confirmed", payment_status: "paid", price: 45000, patient: { first_name: "Lucía", last_name: "Fernández" } },
]

export default function ProfessionalDashboardPage() {
  const { language } = useLanguage()
  const { user } = useAuth()
  const router = useRouter()
  const isSpanish = language === "es"

  const [appointments, setAppointments] = useState<MockAppointment[]>(MOCK_APPOINTMENTS_INITIAL)
  const [releasingId, setReleasingId] = useState<string | null>(null)
  const [onboardingStatus, setOnboardingStatus] = useState<{
    isComplete: boolean
    missingFields: string[]
  } | null>(null)

  const todayAppointments = useMemo(
    () => appointments.filter((a) => a.appointment_date === todayStr() && a.status !== "cancelled"),
    [appointments]
  )
  const upcomingAppointments = useMemo(
    () => appointments.filter((a) => a.appointment_date !== todayStr() && a.status !== "cancelled"),
    [appointments]
  )

  const stats = useMemo(() => {
    const todayCount = appointments.filter((a) => a.appointment_date === todayStr() && a.status !== "cancelled").length
    const upcomingCount = appointments.filter((a) => a.appointment_date >= todayStr() && a.status !== "cancelled").length
    const uniquePatients = new Set(
      appointments.filter((a) => a.status !== "cancelled").map((a) => `${a.patient.first_name}-${a.patient.last_name}`)
    ).size
    const monthlyIncome = appointments
      .filter((a) => a.status === "completed" && a.payment_status === "paid")
      .reduce((sum, a) => sum + a.price, 0)
    const completedCount = appointments.filter((a) => a.status === "completed").length
    return {
      todayAppointments: todayCount,
      upcomingAppointments: upcomingCount,
      activePatients: uniquePatients,
      monthlyIncome,
      completedCount,
    }
  }, [appointments])

  const profileVisitsThisMonth = 127
  const profileVisitsGoal = 200
  const completedGoal = 25
  const earningsGoalCLP = 800000
  const earningsUSDC = (stats.monthlyIncome / 950).toFixed(2)

  const markCompleted = async (id: string) => {
    const appointment = appointments.find((a) => a.id === id)
    if (!appointment) return

    if (appointment.payment_status === "escrow_locked") {
      setReleasingId(id)
      try {
        const res = await fetch("/api/escrow/release", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appointmentId: id }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          toast.error(data.message || (isSpanish ? "Error al liberar el pago" : "Error releasing payment"))
          return
        }
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, status: "completed" as AppointmentStatus, payment_status: "paid" as const } : a
          )
        )
        toast.success(isSpanish ? "Pago liberado correctamente" : "Payment released successfully")
      } finally {
        setReleasingId(null)
      }
      return
    }

    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "completed" as AppointmentStatus } : a))
    )
  }

  const cancelAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "cancelled" as AppointmentStatus } : a))
    )
  }

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

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 } as any,
    },
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      } as any,
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
              {isSpanish ? "Estadísticas" : "Statistics"}
            </h1>
            <p className="text-muted-foreground">
              {isSpanish 
                ? "Resumen de tu perfil, citas y ganancias"
                : "Overview of your profile, appointments and earnings"}
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

            <>
              {/* Stats Cards con gráficos / barras de progreso */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <motion.div variants={itemVariants}>
                  <Card className="border-primary/10 bg-gradient-to-br from-primary/5 via-background to-transparent overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {isSpanish ? "Visitas a tu perfil este mes" : "Profile visits this month"}
                      </CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{profileVisitsThisMonth}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isSpanish ? "Meta" : "Goal"}: {profileVisitsGoal}
                      </p>
                      <Progress
                        value={Math.min(100, (profileVisitsThisMonth / profileVisitsGoal) * 100)}
                        className="mt-2 h-2"
                      />
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="border-primary/10 bg-gradient-to-br from-primary/5 via-background to-transparent overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {isSpanish ? "Citas completadas" : "Completed appointments"}
                      </CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.completedCount}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isSpanish ? "Meta del mes" : "Monthly goal"}: {completedGoal}
                      </p>
                      <Progress
                        value={Math.min(100, (stats.completedCount / completedGoal) * 100)}
                        className="mt-2 h-2"
                      />
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="border-primary/10 bg-gradient-to-br from-primary/5 via-background to-transparent overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {isSpanish ? "Ganancias (CLP)" : "Earnings (CLP)"}
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(stats.monthlyIncome)}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isSpanish ? "Meta" : "Goal"}: {formatCurrency(earningsGoalCLP)}
                      </p>
                      <Progress
                        value={Math.min(100, (stats.monthlyIncome / earningsGoalCLP) * 100)}
                        className="mt-2 h-2"
                      />
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="border-primary/10 bg-gradient-to-br from-primary/5 via-background to-transparent overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {isSpanish ? "Ganancias (USDC)" : "Earnings (USDC)"}
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{earningsUSDC} USDC</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isSpanish ? "Equivalente aprox." : "Approx. equivalent"}
                      </p>
                      <div className="mt-2 h-2 rounded-full bg-primary/20 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${Math.min(100, (stats.monthlyIncome / earningsGoalCLP) * 100)}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Citas de Hoy - con acciones Marcar completada / Cancelar */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {isSpanish ? "Citas de Hoy" : "Today's Appointments"}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push("/professional/schedule")}
                    >
                      {isSpanish ? "Ver agenda" : "View schedule"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {todayAppointments.length === 0 ? (
                      <EmptyState
                        icon={CheckCircle2}
                        title={isSpanish 
                          ? "No tienes más citas por hoy, ¡buen trabajo!"
                          : "No more appointments for today, great job!"}
                      />
                    ) : (
                      <div className="space-y-4">
                        {todayAppointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border/40 hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <User className="h-6 w-6 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <p className="font-semibold">
                                    {appointment.patient.first_name} {appointment.patient.last_name}
                                  </p>
                                  <Badge variant="outline" className="text-xs">
                                    {appointment.type === "online" 
                                      ? (isSpanish ? "Online" : "Online")
                                      : (isSpanish ? "Presencial" : "In-person")}
                                  </Badge>
                                  <Badge variant={appointment.status === "completed" ? "default" : "secondary"} className="text-xs">
                                    {appointment.status === "completed" 
                                      ? (isSpanish ? "Completada" : "Completed")
                                      : appointment.status === "confirmed"
                                      ? (isSpanish ? "Confirmada" : "Confirmed")
                                      : (isSpanish ? "Pendiente" : "Pending")}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(appointment.appointment_date, appointment.appointment_time)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                              <p className="font-semibold text-primary">
                                {formatCurrency(appointment.price)}
                              </p>
                              {appointment.status !== "completed" && appointment.status !== "cancelled" && (
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => markCompleted(appointment.id)}
                                    disabled={releasingId === appointment.id}
                                  >
                                    {releasingId === appointment.id ? (
                                      <>
                                        <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                                        {isSpanish ? "Liberando fondos..." : "Releasing funds..."}
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                        {isSpanish ? "Completada" : "Complete"}
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-destructive hover:text-destructive"
                                    onClick={() => cancelAppointment(appointment.id)}
                                  >
                                    <XCircle className="h-3.5 w-3.5 mr-1" />
                                    {isSpanish ? "Cancelar" : "Cancel"}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Próximas Citas */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      {isSpanish ? "Próximos días" : "Upcoming Days"}
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
                                    {appointment.patient.first_name} {appointment.patient.last_name}
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
                            <div className="flex items-center gap-2 shrink-0">
                              <p className="font-semibold text-primary">
                                {formatCurrency(appointment.price)}
                              </p>
                              <Badge 
                                variant={appointment.payment_status === "paid" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {appointment.payment_status === "paid"
                                  ? (isSpanish ? "Pagado" : "Paid")
                                  : appointment.payment_status === "escrow_locked"
                                  ? (isSpanish ? "En garantía" : "Escrow")
                                  : (isSpanish ? "Pendiente" : "Pending")}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-destructive hover:text-destructive"
                                onClick={() => cancelAppointment(appointment.id)}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                {isSpanish ? "Cancelar" : "Cancel"}
                              </Button>
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
        </motion.div>
      </DashboardLayout>
    </RouteGuard>
  )
}
