"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Search,
  CalendarX,
  CalendarCheck,
  History,
  RefreshCcw,
  X,
  Loader2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Textarea } from "@/components/ui/textarea"
import { VerifiedBadge } from "@/components/verified-badge"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { ReviewModal } from "@/components/reviews/ReviewModal"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { getJitsiMeetingUrl } from "@/lib/utils/jitsi"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 } as const,
  },
}

function formatDate(dateString: string, isSpanish: boolean): string {
  const date = new Date(dateString)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const todayStr = today.toISOString().split("T")[0]
  const tomorrowStr = tomorrow.toISOString().split("T")[0]

  if (dateString === todayStr) {
    return isSpanish ? "Hoy" : "Today"
  }
  if (dateString === tomorrowStr) {
    return isSpanish ? "Mañana" : "Tomorrow"
  }

  return date.toLocaleDateString(isSpanish ? "es-CL" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(price)
}

function EmptyState({ type, isSpanish }: { type: "upcoming" | "past" | "cancelled"; isSpanish: boolean }) {
  const config = {
    upcoming: {
      icon: Calendar,
      title: isSpanish ? "No tienes citas programadas" : "No scheduled appointments",
      description: isSpanish
        ? "Agenda una consulta con un especialista verificado"
        : "Schedule a consultation with a verified specialist",
      showButton: true,
    },
    past: {
      icon: History,
      title: isSpanish ? "Sin historial de consultas" : "No consultation history",
      description: isSpanish
        ? "Tus consultas completadas aparecerán aquí"
        : "Your completed consultations will appear here",
      showButton: false,
    },
    cancelled: {
      icon: CalendarX,
      title: isSpanish ? "Sin citas canceladas" : "No cancelled appointments",
      description: isSpanish
        ? "No tienes ninguna cita cancelada"
        : "You have no cancelled appointments",
      showButton: false,
    },
  }

  const { icon: Icon, title, description, showButton } = config[type]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-16 text-center"
    >
      <div className="relative w-24 h-24 mx-auto mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-100 to-teal-50 dark:from-teal-900/30 dark:to-teal-800/20 rounded-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="h-10 w-10 text-teal-500" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
        {description}
      </p>
      {showButton && (
        <Button
          className="rounded-xl bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20"
          asChild
        >
          <Link href="/search">
            <Search className="h-4 w-4 mr-2" />
            {isSpanish ? "Buscar un Especialista" : "Find a Specialist"}
          </Link>
        </Button>
      )}
    </motion.div>
  )
}

function UpcomingAppointmentCard({
  appointment,
  isSpanish,
  isMain = false,
  onCancelled,
}: {
  appointment: any
  isSpanish: boolean
  isMain?: boolean
  onCancelled?: () => void
}) {
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelling, setCancelling] = useState(false)

  const dateText = formatDate(appointment.appointment_date, isSpanish)
  const isToday = dateText === (isSpanish ? "Hoy" : "Today")
  const isTomorrow = dateText === (isSpanish ? "Mañana" : "Tomorrow")

  const doctor = appointment.professional?.profile || {}

  // Calcular horas hasta la cita para mostrar política de reembolso
  const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`)
  const hoursUntil = (appointmentDateTime.getTime() - Date.now()) / (1000 * 60 * 60)
  const refundPolicy = hoursUntil > 24
    ? isSpanish ? "Reembolso completo (>24 hrs)" : "Full refund (>24 hrs)"
    : hoursUntil > 12
    ? isSpanish ? "Reembolso 50% (12-24 hrs)" : "50% refund (12-24 hrs)"
    : isSpanish ? "Sin reembolso (<12 hrs)" : "No refund (<12 hrs)"

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const res = await fetch("/api/appointments/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: appointment.id,
          reason: cancelReason.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Error al cancelar")
      toast.success(data.message || (isSpanish ? "Cita cancelada exitosamente" : "Appointment cancelled"))
      setShowCancelDialog(false)
      onCancelled?.()
    } catch (err: any) {
      toast.error(err.message || (isSpanish ? "No se pudo cancelar la cita" : "Could not cancel appointment"))
    } finally {
      setCancelling(false)
    }
  }

  // URL de videollamada: usar meeting_url de la cita si existe, o generar URL Jitsi determinista
  const videoCallUrl = appointment.meeting_url
    || (appointment.meeting_room_id ? `https://meet.jit.si/${appointment.meeting_room_id}` : null)
    || getJitsiMeetingUrl(appointment.id)

  return (
    <motion.div variants={itemVariants}>
      <Card
        className={cn(
          "overflow-hidden transition-all",
          isMain
            ? "border-teal-500/30 bg-gradient-to-br from-teal-50/50 via-white to-white dark:from-teal-950/20 dark:via-slate-900 dark:to-slate-900 shadow-lg shadow-teal-500/10"
            : "border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700"
        )}
      >
        <CardContent className="p-0">
          {/* Header with Date/Time and Status */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    isToday || isTomorrow
                      ? "bg-teal-500/10 text-teal-600"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  )}
                >
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {dateText}, {appointment.appointment_time.slice(0, 5)} hrs
                  </p>
                  <p className="text-sm text-slate-500">
                    {appointment.type === "online"
                      ? isSpanish
                        ? "Consulta por videollamada"
                        : "Video consultation"
                      : isSpanish
                      ? "Consulta presencial"
                      : "In-person consultation"}
                  </p>
                </div>
              </div>
               <Badge
                 className={cn(
                   "text-xs font-semibold px-3 py-1",
                   appointment.payment_status === 'paid'
                     ? "bg-teal-500/10 text-teal-600 border-teal-500/20"
                     : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                 )}
               >
                 {appointment.payment_status === 'paid'
                   ? isSpanish
                     ? "Confirmada - Pagada"
                     : "Confirmed - Paid"
                   : isSpanish
                   ? "Pendiente de pago"
                  : "Payment pending"}
              </Badge>
            </div>
          </div>

          {/* Doctor Info */}
          <div className="px-6 py-5">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 rounded-2xl border-2 border-slate-100 dark:border-slate-700">
                <AvatarImage src={doctor.avatar_url} className="object-cover" />
                <AvatarFallback className="rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 text-white text-xl font-bold">
                  {doctor.first_name?.[0]}
                  {doctor.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                    Dr. {doctor.first_name} {doctor.last_name}
                  </h3>
                  {appointment.professional?.verified && (
                    <VerifiedBadge variant="compact" isSpanish={isSpanish} />
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  {appointment.professional?.specialty}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      appointment.type === "online"
                        ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600"
                        : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600"
                    )}
                  >
                    {appointment.type === "online" ? (
                      <>
                        <Video className="h-3 w-3 mr-1" />
                        {isSpanish ? "Telemedicina" : "Telemedicine"}
                      </>
                    ) : (
                      <>
                        <MapPin className="h-3 w-3 mr-1" />
                        {isSpanish ? "Presencial" : "In-person"}
                      </>
                    )}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">
                  {isSpanish ? "Valor consulta" : "Consultation fee"}
                </p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {formatPrice(appointment.price)}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 space-y-4">
            {/* Main Action Button — Videollamada */}
            {appointment.type === "online" && appointment.status === 'confirmed' && (
              <div className="space-y-2">
                <Button
                  size="lg"
                  className="w-full h-14 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-base font-semibold shadow-lg shadow-teal-600/20"
                  onClick={() => window.open(videoCallUrl, "_blank", "noopener,noreferrer")}
                >
                  <Video className="h-5 w-5 mr-2" />
                  {isSpanish ? "Unirse a la Videollamada" : "Join Video Call"}
                </Button>
              </div>
            )}

            {/* Secondary Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-10 opacity-50 cursor-not-allowed"
                disabled
                title={isSpanish ? "La reprogramación estará disponible próximamente" : "Rescheduling coming soon"}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                {isSpanish ? "Reprogramar" : "Reschedule"}
              </Button>
              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl h-10"
                onClick={() => setShowCancelDialog(true)}
              >
                <X className="h-4 w-4 mr-2" />
                {isSpanish ? "Cancelar Cita" : "Cancel"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isSpanish ? "¿Cancelar esta cita?" : "Cancel this appointment?"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  {isSpanish
                    ? `Cita con Dr. ${doctor.first_name} ${doctor.last_name} el ${dateText} a las ${appointment.appointment_time?.slice(0, 5)} hrs.`
                    : `Appointment with Dr. ${doctor.first_name} ${doctor.last_name} on ${dateText} at ${appointment.appointment_time?.slice(0, 5)}.`}
                </p>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  {isSpanish ? "Política de reembolso:" : "Refund policy:"} {refundPolicy}
                </p>
                <div className="space-y-1.5">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {isSpanish ? "Motivo de cancelación (opcional):" : "Cancellation reason (optional):"}
                  </p>
                  <Textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder={isSpanish ? "Ej. Tengo un imprevisto..." : "e.g. Something came up..."}
                    className="h-20 resize-none rounded-xl text-sm"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>
              {isSpanish ? "No cancelar" : "Keep appointment"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleCancel()
              }}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
            >
              {cancelling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isSpanish ? "Cancelando..." : "Cancelling..."}
                </>
              ) : (
                isSpanish ? "Sí, cancelar cita" : "Yes, cancel"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}

function PastAppointmentCard({
  appointment,
  isSpanish,
}: {
  appointment: any
  isSpanish: boolean
}) {
  const date = parseISO(appointment.appointment_date)
  const formattedDate = format(date, "d 'de' MMM, yyyy", { locale: es })
  const doctor = appointment.professional?.profile || {}

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 rounded-xl border border-slate-100 dark:border-slate-700">
              <AvatarImage src={doctor.avatar_url} className="object-cover" />
              <AvatarFallback className="rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600">
                {doctor.first_name?.[0]}
                {doctor.last_name?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                  Dr. {doctor.first_name} {doctor.last_name}
                </h4>
                {appointment.professional?.verified && (
                  <VerifiedBadge variant="compact" isSpanish={isSpanish} />
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {appointment.professional?.specialty}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                <Calendar className="h-3 w-3" />
                {formattedDate}
                <span>•</span>
                <Clock className="h-3 w-3" />
                {appointment.appointment_time.slice(0, 5)}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                className="rounded-lg text-xs text-teal-600 hover:bg-teal-50"
                asChild
              >
                <Link href={`/professionals/${appointment.professional_id}`}>
                  <RefreshCcw className="h-3 w-3 mr-1" />
                  {isSpanish ? "Volver a Agendar" : "Book Again"}
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function CancelledAppointmentCard({
  appointment,
  isSpanish,
}: {
  appointment: any
  isSpanish: boolean
}) {
  const doctor = appointment.professional?.profile || {}
  const dateStr = appointment.appointment_date || appointment.date
  const date = new Date(dateStr)
  const formattedDate = date.toLocaleDateString(isSpanish ? "es-CL" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 rounded-xl border border-slate-100 dark:border-slate-700 opacity-60">
              <AvatarImage src={doctor.avatar_url} className="object-cover" />
              <AvatarFallback className="rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                {doctor.first_name?.[0]}{doctor.last_name?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-slate-600 dark:text-slate-400 truncate">
                Dr. {doctor.first_name} {doctor.last_name}
              </h4>
              <Badge variant="secondary" className="text-[10px] p-0 font-bold text-violet-600 uppercase bg-transparent">
                {appointment.professional?.specialty}
              </Badge>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[10px] text-red-500 border-red-200 dark:border-red-800">
                  <CalendarX className="h-3 w-3 mr-1" />
                  {isSpanish ? "Cancelada" : "Cancelled"}
                </Badge>
                <span className="text-xs text-slate-400">
                  {formattedDate}
                </span>
              </div>
              {appointment.cancellation_reason && (
                <p className="text-xs text-slate-400 mt-1 italic">
                  {appointment.cancellation_reason}
                </p>
              )}
            </div>

            <Button
              size="sm"
              variant="outline"
              className="rounded-lg text-xs shrink-0"
              asChild
            >
              <Link href={`/professionals/${appointment.professional_id}`}>
                {isSpanish ? "Volver a agendar" : "Book Again"}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function PatientAppointmentsPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const [activeTab, setActiveTab] = useState("upcoming")
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { user } = useAuth()

  const loadAppointments = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          professional_id,
          professional:professionals(
            *,
            profile:profiles(*)
          ),
          reviews(*)
        `)
        .eq('patient_id', user.id)
        .order('appointment_date', { ascending: false })

      if (error) throw error
      setAppointments(data || [])
    } catch (err) {
      console.error("Error loading appointments:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) loadAppointments()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }, [user?.id])

  // Handle auto-open review from URL
  useEffect(() => {
    const reviewId = searchParams.get('review')
    if (reviewId && appointments.length > 0) {
      const apt = appointments.find(a => a.id === reviewId)
      if (apt && (!apt.reviews || apt.reviews.length === 0)) {
        setSelectedAppointment(apt)
        setIsReviewModalOpen(true)
      }
    }
  }, [searchParams, appointments])

  const upcomingAppointments = appointments.filter(
    (a) => a.status === "confirmed" || a.status === "pending"
  )
  const pastAppointments = appointments.filter((a) => a.status === "completed")
  const cancelledAppointments = appointments.filter((a) => a.status === "cancelled")

  if (loading && appointments.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
            <CalendarCheck className="h-5 w-5 text-teal-600" />
          </div>
          {isSpanish ? "Mis Consultas Médicas" : "My Medical Consultations"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {isSpanish
            ? "Gestiona tus citas y accede a tu historial de consultas"
            : "Manage your appointments and access your consultation history"}
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-xl h-auto">
            <TabsTrigger
              value="upcoming"
              className={cn(
                "rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                "data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900",
                "data-[state=active]:text-teal-600 dark:data-[state=active]:text-teal-400",
                "data-[state=active]:shadow-sm"
              )}
            >
              <CalendarCheck className="h-4 w-4 mr-2" />
              {isSpanish ? "Próximas Citas" : "Upcoming"}
              {upcomingAppointments.length > 0 && (
                <Badge className="ml-2 bg-teal-500 text-white text-[10px] px-1.5">
                  {upcomingAppointments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className={cn(
                "rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                "data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900",
                "data-[state=active]:text-teal-600 dark:data-[state=active]:text-teal-400",
                "data-[state=active]:shadow-sm"
              )}
            >
              <History className="h-4 w-4 mr-2" />
              {isSpanish ? "Historial Pasado" : "Past"}
            </TabsTrigger>
            <TabsTrigger
              value="cancelled"
              className={cn(
                "rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                "data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900",
                "data-[state=active]:text-slate-600 dark:data-[state=active]:text-slate-400",
                "data-[state=active]:shadow-sm"
              )}
            >
              <CalendarX className="h-4 w-4 mr-2" />
              {isSpanish ? "Canceladas" : "Cancelled"}
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Appointments Tab */}
          <TabsContent value="upcoming" className="mt-6 space-y-4">
            <AnimatePresence mode="wait">
              {upcomingAppointments.length > 0 ? (
                <motion.div
                  key="appointments"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {upcomingAppointments.map((appointment, index) => (
                    <UpcomingAppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      isSpanish={isSpanish}
                      isMain={index === 0}
                      onCancelled={loadAppointments}
                    />
                  ))}
                </motion.div>
              ) : (
                <EmptyState type="upcoming" isSpanish={isSpanish} />
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Past Appointments Tab */}
          <TabsContent value="past" className="mt-6 space-y-3">
            <AnimatePresence mode="wait">
              {pastAppointments.length > 0 ? (
                <motion.div
                  key="past"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {pastAppointments.map((appointment) => (
                    <PastAppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      isSpanish={isSpanish}
                    />
                  ))}
                </motion.div>
              ) : (
                <EmptyState type="past" isSpanish={isSpanish} />
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Cancelled Appointments Tab */}
          <TabsContent value="cancelled" className="mt-6 space-y-3">
            <AnimatePresence mode="wait">
              {cancelledAppointments.length > 0 ? (
                <motion.div
                  key="cancelled"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {cancelledAppointments.map((appointment) => (
                    <CancelledAppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      isSpanish={isSpanish}
                    />
                  ))}
                </motion.div>
              ) : (
                <EmptyState type="cancelled" isSpanish={isSpanish} />
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Review Modal */}
      {selectedAppointment && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          appointmentId={selectedAppointment.id}
          doctorName={`${selectedAppointment.professional?.profile?.first_name} ${selectedAppointment.professional?.profile?.last_name}`}
          onSuccess={loadAppointments}
        />
      )}
    </motion.div>
  )
}
