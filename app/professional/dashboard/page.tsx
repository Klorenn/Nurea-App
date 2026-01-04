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
  ArrowRight
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/hooks/use-auth"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function ProfessionalDashboardPage() {
  const { language } = useLanguage()
  const { user } = useAuth()
  const router = useRouter()
  const isSpanish = language === "es"
  
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    activePatients: 0,
    monthlyIncome: 0,
    todayAppointments: 0,
  })
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Cargar citas próximas
      const appointmentsRes = await fetch('/api/professional/appointments?status=confirmed')
      const appointmentsData = await appointmentsRes.json()
      
      if (appointmentsData.success) {
        const now = new Date()
        const upcoming = (appointmentsData.appointments || []).filter((apt: any) => {
          const aptDate = new Date(`${apt.appointment_date}T${apt.appointment_time}`)
          return aptDate >= now
        }).slice(0, 5)
        
        setUpcomingAppointments(upcoming)
        setStats(prev => ({
          ...prev,
          upcomingAppointments: appointmentsData.count || 0,
          todayAppointments: (appointmentsData.appointments || []).filter((apt: any) => {
            const aptDate = new Date(`${apt.appointment_date}T${apt.appointment_time}`)
            const today = new Date()
            return aptDate.toDateString() === today.toDateString()
          }).length
        }))
      }

      // Cargar pacientes activos
      const patientsRes = await fetch('/api/professional/patients')
      const patientsData = await patientsRes.json()
      
      if (patientsData.success) {
        setStats(prev => ({
          ...prev,
          activePatients: patientsData.count || 0
        }))
      }

      // Cargar ingresos del mes
      const incomeRes = await fetch('/api/professional/income?period=month')
      const incomeData = await incomeRes.json()
      
      if (incomeData.success) {
        setStats(prev => ({
          ...prev,
          monthlyIncome: incomeData.income?.total || 0
        }))
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
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

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <motion.div variants={itemVariants}>
                  <Card className="border-primary/10 bg-gradient-to-br from-primary/5 via-background to-transparent">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {isSpanish ? "Citas Hoy" : "Today's Appointments"}
                      </CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.todayAppointments}</div>
                      <p className="text-xs text-muted-foreground">
                        {isSpanish ? "Citas programadas para hoy" : "Scheduled for today"}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="border-primary/10 bg-gradient-to-br from-primary/5 via-background to-transparent">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {isSpanish ? "Próximas Citas" : "Upcoming Appointments"}
                      </CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
                      <p className="text-xs text-muted-foreground">
                        {isSpanish ? "Citas confirmadas" : "Confirmed appointments"}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="border-primary/10 bg-gradient-to-br from-primary/5 via-background to-transparent">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {isSpanish ? "Pacientes Activos" : "Active Patients"}
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.activePatients}</div>
                      <p className="text-xs text-muted-foreground">
                        {isSpanish ? "Pacientes con citas" : "Patients with appointments"}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="border-primary/10 bg-gradient-to-br from-primary/5 via-background to-transparent">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {isSpanish ? "Ingresos del Mes" : "Monthly Income"}
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(stats.monthlyIncome)}</div>
                      <p className="text-xs text-muted-foreground">
                        {isSpanish ? "Ingresos completados" : "Completed income"}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
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
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>
                          {isSpanish 
                            ? "No tienes citas próximas programadas"
                            : "You don't have any upcoming appointments scheduled"}
                        </p>
                      </div>
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
