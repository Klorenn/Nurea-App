"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  CalendarDays, 
  Clock, 
  Video, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  User,
  RefreshCw,
  AlertTriangle,
  DollarSign,
  Phone,
  Mail,
  ExternalLink,
  CalendarCheck,
  CalendarX,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
} from "lucide-react"
import { format, startOfMonth, endOfMonth, isSameDay, isToday, addMonths, subMonths, parseISO } from "date-fns"
import { es, enUS } from "date-fns/locale"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { getJitsiMeetingUrl } from "@/lib/utils/jitsi"

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  duration_minutes: number
  type: "online" | "in-person"
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show"
  payment_status: string
  price: number
  notes?: string
  meeting_link?: string
  patient: {
    id: string
    first_name: string
    last_name: string
    email: string
    avatar_url?: string
    phone?: string
  }
}

type ViewMode = "today" | "upcoming" | "calendar"

export default function ProfessionalAppointmentsPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const supabase = createClient()
  const locale = isSpanish ? es : enUS

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("today")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date())
  const [appointmentDates, setAppointmentDates] = useState<Set<string>>(new Set())
  
  // Actions state
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [completeDialog, setCompleteDialog] = useState<Appointment | null>(null)
  const [cancelDialog, setCancelDialog] = useState<Appointment | null>(null)
  const [detailsDialog, setDetailsDialog] = useState<Appointment | null>(null)

  const loadAppointments = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          appointment_time,
          duration_minutes,
          type,
          status,
          payment_status,
          price,
          notes,
          meeting_link,
          patient:profiles!appointments_patient_id_fkey(
            id,
            first_name,
            last_name,
            email,
            avatar_url,
            phone
          )
        `)
        .eq("professional_id", user.id)
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true })

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayStr = format(today, "yyyy-MM-dd")

      if (viewMode === "today") {
        query = query.eq("appointment_date", todayStr)
      } else if (viewMode === "upcoming") {
        query = query.gte("appointment_date", todayStr).in("status", ["pending", "confirmed"])
      } else if (viewMode === "calendar") {
        const monthStart = format(startOfMonth(calendarMonth), "yyyy-MM-dd")
        const monthEnd = format(endOfMonth(calendarMonth), "yyyy-MM-dd")
        query = query.gte("appointment_date", monthStart).lte("appointment_date", monthEnd)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error loading appointments:", error)
        toast.error(isSpanish ? "Error al cargar citas" : "Error loading appointments")
        return
      }

      const typedData = (data || []).map((apt) => ({
        ...apt,
        patient: apt.patient as unknown as Appointment["patient"],
      })) as Appointment[]

      setAppointments(typedData)

      // Get all appointment dates for calendar dots
      if (viewMode === "calendar") {
        const dates = new Set(typedData.map((a) => a.appointment_date))
        setAppointmentDates(dates)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }, [supabase, viewMode, calendarMonth, isSpanish])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  const handleCompleteAppointment = async () => {
    if (!completeDialog) return
    
    setActionLoading(completeDialog.id)
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ 
          status: "completed",
          payment_status: "released",
          updated_at: new Date().toISOString()
        })
        .eq("id", completeDialog.id)

      if (error) throw error

      toast.success(isSpanish ? "Cita marcada como completada" : "Appointment marked as complete")
      setCompleteDialog(null)
      loadAppointments()
    } catch (error) {
      console.error("Error completing appointment:", error)
      toast.error(isSpanish ? "Error al completar la cita" : "Error completing appointment")
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancelAppointment = async () => {
    if (!cancelDialog) return
    
    setActionLoading(cancelDialog.id)
    try {
      // Call cancel API which handles refunds
      const response = await fetch("/api/appointments/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          appointmentId: cancelDialog.id,
          reason: "Cancelled by professional",
          initiatedBy: "professional"
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Error cancelling appointment")
      }

      toast.success(
        isSpanish 
          ? "Cita cancelada. Se procesará el reembolso al paciente."
          : "Appointment cancelled. Refund will be processed to patient."
      )
      setCancelDialog(null)
      loadAppointments()
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      toast.error(
        error instanceof Error 
          ? error.message 
          : (isSpanish ? "Error al cancelar la cita" : "Error cancelling appointment")
      )
    } finally {
      setActionLoading(null)
    }
  }

  const openMeeting = (appointment: Appointment) => {
    const meetingUrl = appointment.meeting_link || getJitsiMeetingUrl(appointment.id)
    window.open(meetingUrl, "_blank")
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
      confirmed: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
      completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
      cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      no_show: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    }

    const labels = {
      pending: isSpanish ? "Pendiente" : "Pending",
      confirmed: isSpanish ? "Confirmada" : "Confirmed",
      completed: isSpanish ? "Completada" : "Completed",
      cancelled: isSpanish ? "Cancelada" : "Cancelled",
      no_show: isSpanish ? "No asistió" : "No show",
    }

    return (
      <Badge className={cn("font-medium", styles[status as keyof typeof styles] || styles.pending)}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  const todayAppointments = appointments.filter((a) => 
    isSameDay(parseISO(a.appointment_date), new Date()) && 
    ["pending", "confirmed"].includes(a.status)
  )

  const upcomingCount = appointments.filter((a) => 
    ["pending", "confirmed"].includes(a.status)
  ).length

  const filteredAppointments = viewMode === "calendar" && selectedDate
    ? appointments.filter((a) => isSameDay(parseISO(a.appointment_date), selectedDate))
    : appointments

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-teal-600" />
            {isSpanish ? "Mi Agenda" : "My Schedule"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {isSpanish ? "Gestiona tus citas y consultas" : "Manage your appointments and consultations"}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={loadAppointments} 
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          {isSpanish ? "Actualizar" : "Refresh"}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-teal-50 to-emerald-50/50 dark:from-teal-950/30 dark:to-emerald-950/20 border-teal-200/50 dark:border-teal-800/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center">
                <CalendarCheck className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-teal-700 dark:text-teal-300">
                  {isSpanish ? "Hoy" : "Today"}
                </p>
                <p className="text-3xl font-bold text-teal-900 dark:text-teal-100">
                  {todayAppointments.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/20 border-blue-200/50 dark:border-blue-800/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {isSpanish ? "Próximas" : "Upcoming"}
                </p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {upcomingCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-green-50/50 dark:from-emerald-950/30 dark:to-green-950/20 border-emerald-200/50 dark:border-emerald-800/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  {isSpanish ? "Ingresos del mes" : "Monthly earnings"}
                </p>
                <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                  ${appointments.filter((a) => a.status === "completed").reduce((sum, a) => sum + (a.price || 0), 0).toLocaleString("es-CL")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="today" className="gap-2">
            <CalendarCheck className="h-4 w-4" />
            {isSpanish ? "Hoy" : "Today"}
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="gap-2">
            <Clock className="h-4 w-4" />
            {isSpanish ? "Próximas" : "Upcoming"}
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            {isSpanish ? "Calendario" : "Calendar"}
          </TabsTrigger>
        </TabsList>

        {/* Calendar View Controls */}
        {viewMode === "calendar" && (
          <div className="flex flex-col lg:flex-row gap-6">
            <Card className="p-4 w-full lg:w-auto">
              <div className="flex items-center justify-between mb-4">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h3 className="font-semibold text-lg">
                  {format(calendarMonth, "MMMM yyyy", { locale })}
                </h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                month={calendarMonth}
                onMonthChange={setCalendarMonth}
                modifiers={{
                  hasAppointments: (date) => 
                    appointmentDates.has(format(date, "yyyy-MM-dd")),
                }}
                modifiersStyles={{
                  hasAppointments: {
                    fontWeight: "bold",
                    textDecoration: "underline",
                    textDecorationColor: "#0d9488",
                  },
                }}
                className="rounded-lg"
              />
            </Card>

            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-4">
                {isToday(selectedDate) 
                  ? (isSpanish ? "Citas de hoy" : "Today's appointments")
                  : format(selectedDate, "EEEE, d 'de' MMMM", { locale })}
              </h3>
              <AppointmentsList 
                appointments={filteredAppointments}
                loading={loading}
                isSpanish={isSpanish}
                formatTime={formatTime}
                getStatusBadge={getStatusBadge}
                onComplete={setCompleteDialog}
                onCancel={setCancelDialog}
                onDetails={setDetailsDialog}
                onOpenMeeting={openMeeting}
                actionLoading={actionLoading}
              />
            </div>
          </div>
        )}

        {/* Today & Upcoming Views */}
        {viewMode !== "calendar" && (
          <AppointmentsList 
            appointments={filteredAppointments}
            loading={loading}
            isSpanish={isSpanish}
            formatTime={formatTime}
            getStatusBadge={getStatusBadge}
            onComplete={setCompleteDialog}
            onCancel={setCancelDialog}
            onDetails={setDetailsDialog}
            onOpenMeeting={openMeeting}
            actionLoading={actionLoading}
          />
        )}
      </Tabs>

      {/* Complete Dialog */}
      <AlertDialog open={!!completeDialog} onOpenChange={() => setCompleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              {isSpanish ? "Marcar como Completada" : "Mark as Complete"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isSpanish 
                ? "¿Confirmas que la consulta ha sido completada? El pago será liberado a tu cuenta."
                : "Confirm that the consultation has been completed? Payment will be released to your account."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!actionLoading}>
              {isSpanish ? "Cancelar" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCompleteAppointment}
              disabled={!!actionLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {actionLoading === completeDialog?.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                isSpanish ? "Confirmar" : "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Dialog */}
      <AlertDialog open={!!cancelDialog} onOpenChange={() => setCancelDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <CalendarX className="h-5 w-5" />
              {isSpanish ? "Cancelar Cita" : "Cancel Appointment"}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                {isSpanish 
                  ? "¿Estás seguro de cancelar esta cita? Esta acción no se puede deshacer."
                  : "Are you sure you want to cancel this appointment? This action cannot be undone."}
              </p>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-sm">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  {isSpanish 
                    ? "Al cancelar, se procesará un reembolso completo al paciente."
                    : "By cancelling, a full refund will be processed to the patient."}
                </span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!actionLoading}>
              {isSpanish ? "Volver" : "Go back"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelAppointment}
              disabled={!!actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading === cancelDialog?.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                isSpanish ? "Sí, cancelar cita" : "Yes, cancel appointment"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Details Dialog */}
      <Dialog open={!!detailsDialog} onOpenChange={() => setDetailsDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-teal-600" />
              {isSpanish ? "Detalles del Paciente" : "Patient Details"}
            </DialogTitle>
          </DialogHeader>
          {detailsDialog && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={detailsDialog.patient?.avatar_url} />
                  <AvatarFallback className="bg-teal-100 text-teal-700 text-xl">
                    {detailsDialog.patient?.first_name?.[0]}{detailsDialog.patient?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {detailsDialog.patient?.first_name} {detailsDialog.patient?.last_name}
                  </h3>
                  {getStatusBadge(detailsDialog.status)}
                </div>
              </div>

              <div className="grid gap-4">
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <Mail className="h-5 w-5" />
                  <span>{detailsDialog.patient?.email}</span>
                </div>
                {detailsDialog.patient?.phone && (
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <Phone className="h-5 w-5" />
                    <span>{detailsDialog.patient.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <CalendarDays className="h-5 w-5" />
                  <span>
                    {format(parseISO(detailsDialog.appointment_date), "EEEE, d 'de' MMMM yyyy", { locale })}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <Clock className="h-5 w-5" />
                  <span>{formatTime(detailsDialog.appointment_time)} ({detailsDialog.duration_minutes} min)</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  {detailsDialog.type === "online" ? (
                    <Video className="h-5 w-5 text-teal-600" />
                  ) : (
                    <Building2 className="h-5 w-5 text-amber-600" />
                  )}
                  <span>{detailsDialog.type === "online" ? "Telemedicina" : "Presencial"}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  <span>${(detailsDialog.price || 0).toLocaleString("es-CL")} CLP</span>
                </div>
              </div>

              {detailsDialog.type === "online" && detailsDialog.status === "confirmed" && (
                <Button 
                  className="w-full gap-2 bg-teal-600 hover:bg-teal-700"
                  onClick={() => openMeeting(detailsDialog)}
                >
                  <Video className="h-4 w-4" />
                  {isSpanish ? "Iniciar Videollamada" : "Start Video Call"}
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialog(null)}>
              {isSpanish ? "Cerrar" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AppointmentsList({
  appointments,
  loading,
  isSpanish,
  formatTime,
  getStatusBadge,
  onComplete,
  onCancel,
  onDetails,
  onOpenMeeting,
  actionLoading,
}: {
  appointments: Appointment[]
  loading: boolean
  isSpanish: boolean
  formatTime: (time: string) => string
  getStatusBadge: (status: string) => React.ReactNode
  onComplete: (apt: Appointment) => void
  onCancel: (apt: Appointment) => void
  onDetails: (apt: Appointment) => void
  onOpenMeeting: (apt: Appointment) => void
  actionLoading: string | null
}) {
  const locale = isSpanish ? es : enUS

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-12 text-center">
          <CalendarX className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
            {isSpanish ? "No hay citas programadas" : "No appointments scheduled"}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            {isSpanish 
              ? "Las citas aparecerán aquí cuando los pacientes las agenden."
              : "Appointments will appear here when patients book them."}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {appointments.map((apt) => (
        <Card key={apt.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row">
              {/* Time indicator */}
              <div className={cn(
                "sm:w-24 p-4 flex flex-row sm:flex-col items-center justify-center gap-2 text-center",
                apt.type === "online" 
                  ? "bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300"
                  : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300"
              )}>
                {apt.type === "online" ? (
                  <Video className="h-5 w-5" />
                ) : (
                  <Building2 className="h-5 w-5" />
                )}
                <span className="font-bold text-lg">{formatTime(apt.appointment_time)}</span>
              </div>

              {/* Content */}
              <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div 
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                  onClick={() => onDetails(apt)}
                >
                  <Avatar>
                    <AvatarImage src={apt.patient?.avatar_url} />
                    <AvatarFallback className="bg-slate-100 dark:bg-slate-800">
                      {apt.patient?.first_name?.[0]}{apt.patient?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {apt.patient?.first_name} {apt.patient?.last_name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {format(parseISO(apt.appointment_date), "EEE, d MMM", { locale })} • {apt.duration_minutes} min
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {getStatusBadge(apt.status)}
                  
                  {apt.status === "confirmed" && (
                    <Button 
                      size="sm" 
                      className="gap-1 bg-teal-600 hover:bg-teal-700 text-white"
                      asChild
                    >
                      <a href={`/dashboard/professional/consultation/${apt.id}`}>
                        <ClipboardList className="h-3.5 w-3.5" />
                        {isSpanish ? "Iniciar Consulta" : "Start Consultation"}
                      </a>
                    </Button>
                  )}
                  
                  {apt.status === "confirmed" && apt.type === "online" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="gap-1 text-teal-600 border-teal-200 hover:bg-teal-50"
                      onClick={() => onOpenMeeting(apt)}
                    >
                      <Video className="h-3.5 w-3.5" />
                      {isSpanish ? "Video" : "Video"}
                    </Button>
                  )}

                  {apt.status === "confirmed" && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => onCancel(apt)}
                        disabled={actionLoading === apt.id}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        {isSpanish ? "Cancelar" : "Cancel"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
