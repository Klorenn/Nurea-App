"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RouteGuard } from "@/components/auth/route-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Video, 
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { motion } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProfessionalSchedulePage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")

  useEffect(() => {
    loadAppointments()
  }, [statusFilter, dateFilter])

  const loadAppointments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }
      if (dateFilter === "today") {
        const today = new Date().toISOString().split("T")[0]
        params.append("dateFrom", today)
        params.append("dateTo", today)
      } else if (dateFilter === "week") {
        const today = new Date()
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay())
        params.append("dateFrom", weekStart.toISOString().split("T")[0])
        params.append("dateTo", new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
      } else if (dateFilter === "month") {
        const today = new Date()
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        params.append("dateFrom", monthStart.toISOString().split("T")[0])
        params.append("dateTo", new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0])
      }

      const response = await fetch(`/api/professional/appointments?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setAppointments(data.appointments || [])
      }
    } catch (error) {
      console.error("Error loading appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string, timeString: string) => {
    const date = new Date(`${dateString}T${timeString}`)
    return date.toLocaleDateString(
      isSpanish ? "es-ES" : "en-US",
      { 
        weekday: "long",
        day: "numeric",
        month: "long",
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

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (status === "completed") {
      return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"><CheckCircle2 className="h-3 w-3 mr-1" /> {isSpanish ? "Completada" : "Completed"}</Badge>
    }
    if (status === "cancelled") {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> {isSpanish ? "Cancelada" : "Cancelled"}</Badge>
    }
    if (status === "confirmed") {
      return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"><CheckCircle2 className="h-3 w-3 mr-1" /> {isSpanish ? "Confirmada" : "Confirmed"}</Badge>
    }
    return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" /> {isSpanish ? "Pendiente" : "Pending"}</Badge>
  }

  const groupedAppointments = appointments.reduce((acc, apt) => {
    const date = apt.appointment_date
    if (!acc[date]) acc[date] = []
    acc[date].push(apt)
    return acc
  }, {} as Record<string, any[]>)

  const sortedDates = Object.keys(groupedAppointments).sort()

  return (
    <RouteGuard requiredRole="professional">
      <DashboardLayout role="professional">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {isSpanish ? "Agenda" : "Schedule"}
              </h1>
              <p className="text-muted-foreground">
                {isSpanish 
                  ? "Gestiona tus citas y horarios"
                  : "Manage your appointments and schedule"}
              </p>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder={isSpanish ? "Estado" : "Status"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isSpanish ? "Todos los estados" : "All statuses"}</SelectItem>
                    <SelectItem value="pending">{isSpanish ? "Pendiente" : "Pending"}</SelectItem>
                    <SelectItem value="confirmed">{isSpanish ? "Confirmada" : "Confirmed"}</SelectItem>
                    <SelectItem value="completed">{isSpanish ? "Completada" : "Completed"}</SelectItem>
                    <SelectItem value="cancelled">{isSpanish ? "Cancelada" : "Cancelled"}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder={isSpanish ? "Fecha" : "Date"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isSpanish ? "Todas las fechas" : "All dates"}</SelectItem>
                    <SelectItem value="today">{isSpanish ? "Hoy" : "Today"}</SelectItem>
                    <SelectItem value="week">{isSpanish ? "Esta semana" : "This week"}</SelectItem>
                    <SelectItem value="month">{isSpanish ? "Este mes" : "This month"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Appointments List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : appointments.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {isSpanish 
                    ? "No tienes citas programadas"
                    : "You don't have any appointments scheduled"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((date) => (
                <Card key={date}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {new Date(date).toLocaleDateString(
                        isSpanish ? "es-ES" : "en-US",
                        { weekday: "long", day: "numeric", month: "long", year: "numeric" }
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {groupedAppointments[date].map((appointment) => (
                        <motion.div
                          key={appointment.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border border-border/40 hover:bg-accent/50 transition-colors gap-4"
                        >
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <User className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="font-semibold">
                                  {appointment.patient?.first_name} {appointment.patient?.last_name}
                                </p>
                                {getStatusBadge(appointment.status, appointment.payment_status)}
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {appointment.appointment_time} ({appointment.duration_minutes} {isSpanish ? "min" : "min"})
                                </div>
                                <div className="flex items-center gap-1">
                                  {appointment.type === "online" ? (
                                    <Video className="h-4 w-4" />
                                  ) : (
                                    <MapPin className="h-4 w-4" />
                                  )}
                                  {appointment.type === "online" 
                                    ? (isSpanish ? "Online" : "Online")
                                    : (appointment.address || isSpanish ? "Presencial" : "In-person")}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary mb-1">
                              {formatCurrency(parseFloat(appointment.price?.toString() || "0"))}
                            </p>
                            <Badge 
                              variant={appointment.payment_status === "paid" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {appointment.payment_status === "paid" 
                                ? (isSpanish ? "Pagado" : "Paid")
                                : (isSpanish ? "Pendiente" : "Pending")}
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </RouteGuard>
  )
}

