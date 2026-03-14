"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Star,
  Search,
  CalendarX,
  CalendarCheck,
  History,
  AlertTriangle,
  RefreshCcw,
  MessageSquare,
  ChevronRight,
  X,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VerifiedBadge } from "@/components/verified-badge"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

type AppointmentStatus = "confirmed" | "pending" | "completed" | "cancelled"
type AppointmentType = "online" | "in_person"

interface Appointment {
  id: string
  doctorName: string
  doctorAvatar?: string
  specialty: string
  date: string
  time: string
  type: AppointmentType
  status: AppointmentStatus
  isPaid: boolean
  isVerified: boolean
  price: number
  hasReview?: boolean
  cancellationReason?: string
}

const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)

const mockAppointments: Appointment[] = [
  {
    id: "1",
    doctorName: "Dra. María Fernández González",
    doctorAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
    specialty: "Psicóloga Clínica",
    date: tomorrow.toISOString().split("T")[0],
    time: "15:30",
    type: "online",
    status: "confirmed",
    isPaid: true,
    isVerified: true,
    price: 25000,
  },
  {
    id: "2",
    doctorName: "Dr. Carlos Andrés Muñoz",
    doctorAvatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face",
    specialty: "Médico General",
    date: "2026-03-05",
    time: "10:00",
    type: "online",
    status: "completed",
    isPaid: true,
    isVerified: true,
    price: 20000,
    hasReview: false,
  },
  {
    id: "3",
    doctorName: "Dra. Ana Lucía Herrera",
    doctorAvatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face",
    specialty: "Pediatra",
    date: "2026-02-20",
    time: "11:30",
    type: "in_person",
    status: "completed",
    isPaid: true,
    isVerified: true,
    price: 30000,
    hasReview: true,
  },
  {
    id: "4",
    doctorName: "Dr. Roberto Silva",
    doctorAvatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face",
    specialty: "Nutricionista",
    date: "2026-02-10",
    time: "09:00",
    type: "online",
    status: "cancelled",
    isPaid: false,
    isVerified: true,
    price: 22000,
    cancellationReason: "Cancelado por el paciente",
  },
]

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
    transition: { type: "spring", stiffness: 100, damping: 15 },
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

  return date.toLocaleDateString(isSpanish ? "es-ES" : "en-US", {
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
}: {
  appointment: Appointment
  isSpanish: boolean
  isMain?: boolean
}) {
  const dateText = formatDate(appointment.date, isSpanish)
  const isToday = dateText === (isSpanish ? "Hoy" : "Today")
  const isTomorrow = dateText === (isSpanish ? "Mañana" : "Tomorrow")

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
                    {dateText}, {appointment.time} hrs
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
                  appointment.isPaid
                    ? "bg-teal-500/10 text-teal-600 border-teal-500/20"
                    : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                )}
              >
                {appointment.isPaid
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
                <AvatarImage src={appointment.doctorAvatar} className="object-cover" />
                <AvatarFallback className="rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 text-white text-xl font-bold">
                  {appointment.doctorName.split(" ")[0][0]}
                  {appointment.doctorName.split(" ")[1]?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                    {appointment.doctorName}
                  </h3>
                  {appointment.isVerified && (
                    <VerifiedBadge variant="compact" isSpanish={isSpanish} />
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  {appointment.specialty}
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
            {/* Main Action Button */}
            {appointment.type === "online" && (
              <div className="space-y-2">
                <Button
                  size="lg"
                  className="w-full h-14 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-base font-semibold shadow-lg shadow-teal-600/20"
                  asChild
                >
                  <Link href={`/consulta/${appointment.id}`}>
                    <Video className="h-5 w-5 mr-2" />
                    {isSpanish ? "Unirse a la Videollamada" : "Join Video Call"}
                  </Link>
                </Button>
                <p className="text-center text-xs text-slate-500">
                  {isSpanish
                    ? "El enlace se habilitará 10 minutos antes de la consulta"
                    : "Link will be enabled 10 minutes before the consultation"}
                </p>
              </div>
            )}

            {/* Secondary Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-10"
                asChild
              >
                <Link href={`/appointments/${appointment.id}/reschedule`}>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  {isSpanish ? "Reprogramar" : "Reschedule"}
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl h-10"
              >
                <X className="h-4 w-4 mr-2" />
                {isSpanish ? "Cancelar Cita" : "Cancel"}
              </Button>
            </div>

            {/* Cancellation Policy Notice */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                {isSpanish
                  ? "Recuerda: Cancelaciones con menos de 48 hrs de anticipación no aplican para devolución de la garantía."
                  : "Remember: Cancellations with less than 48 hours notice are not eligible for deposit refund."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function PastAppointmentCard({
  appointment,
  isSpanish,
}: {
  appointment: Appointment
  isSpanish: boolean
}) {
  const date = new Date(appointment.date)
  const formattedDate = date.toLocaleDateString(isSpanish ? "es-ES" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 rounded-xl border border-slate-100 dark:border-slate-700">
              <AvatarImage src={appointment.doctorAvatar} className="object-cover" />
              <AvatarFallback className="rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600">
                {appointment.doctorName.split(" ")[0][0]}
                {appointment.doctorName.split(" ")[1]?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {appointment.doctorName}
                </h4>
                {appointment.isVerified && (
                  <VerifiedBadge variant="compact" isSpanish={isSpanish} />
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {appointment.specialty}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                <Calendar className="h-3 w-3" />
                {formattedDate}
                <span>•</span>
                <Clock className="h-3 w-3" />
                {appointment.time}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!appointment.hasReview && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-xs border-amber-300 text-amber-600 hover:bg-amber-50 dark:border-amber-700 dark:hover:bg-amber-950/30"
                >
                  <Star className="h-3 w-3 mr-1" />
                  {isSpanish ? "Dejar Reseña" : "Leave Review"}
                </Button>
              )}
              <Button
                size="sm"
                className="rounded-lg text-xs bg-teal-600 hover:bg-teal-700"
                asChild
              >
                <Link href={`/booking/${appointment.id}`}>
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
  appointment: Appointment
  isSpanish: boolean
}) {
  const date = new Date(appointment.date)
  const formattedDate = date.toLocaleDateString(isSpanish ? "es-ES" : "en-US", {
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
              <AvatarImage src={appointment.doctorAvatar} className="object-cover" />
              <AvatarFallback className="rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                {appointment.doctorName.split(" ")[0][0]}
                {appointment.doctorName.split(" ")[1]?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-slate-600 dark:text-slate-400 truncate">
                {appointment.doctorName}
              </h4>
              <p className="text-sm text-slate-400">
                {appointment.specialty}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[10px] text-red-500 border-red-200 dark:border-red-800">
                  <CalendarX className="h-3 w-3 mr-1" />
                  {isSpanish ? "Cancelada" : "Cancelled"}
                </Badge>
                <span className="text-xs text-slate-400">
                  {formattedDate}
                </span>
              </div>
              {appointment.cancellationReason && (
                <p className="text-xs text-slate-400 mt-1 italic">
                  {appointment.cancellationReason}
                </p>
              )}
            </div>

            <Button
              size="sm"
              variant="outline"
              className="rounded-lg text-xs shrink-0"
              asChild
            >
              <Link href={`/booking/${appointment.id}`}>
                {isSpanish ? "Reagendar" : "Rebook"}
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

  const upcomingAppointments = mockAppointments.filter(
    (a) => a.status === "confirmed" || a.status === "pending"
  )
  const pastAppointments = mockAppointments.filter((a) => a.status === "completed")
  const cancelledAppointments = mockAppointments.filter((a) => a.status === "cancelled")

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
    </motion.div>
  )
}
