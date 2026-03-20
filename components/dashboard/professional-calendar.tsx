"use client"

import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  Video,
  Clock,
  User,
  CreditCard,
  AlertTriangle,
  X,
  Plus,
  Calendar as CalendarIcon,
  Ban,
  Search,
  Settings,
  Menu,
} from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { es, enUS } from "date-fns/locale"
import { AddAppointmentDialog } from "./add-appointment-dialog"
import { useRouter } from "next/navigation"

type SlotStatus = "available" | "occupied" | "blocked"
type PaymentStatus = "paid" | "pending" | "escrow"
type ViewMode = "monthly" | "weekly" | "daily"

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

interface TimeSlot {
  time: string
  status: SlotStatus
  appointment?: Appointment
}

type WeeklyAvailability = Record<
  string,
  {
    enabled: boolean
    startTime: string
    endTime: string
  }
>

const generateTimeSlots = (): string[] => {
  const slots: string[] = []
  for (let hour = 8; hour <= 20; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`)
    if (hour < 20) {
      slots.push(`${hour.toString().padStart(2, "0")}:30`)
    }
  }
  return slots
}

const TIME_SLOTS = generateTimeSlots()

const getWeekDates = (referenceDate: Date): Date[] => {
  const dates: Date[] = []
  const dayOfWeek = referenceDate.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

  for (let i = 0; i < 7; i++) {
    const date = new Date(referenceDate)
    date.setDate(referenceDate.getDate() + mondayOffset + i)
    dates.push(date)
  }
  return dates
}

const formatDate = (date: Date, format: "short" | "full" = "short"): string => {
  if (format === "short") {
    return date.toLocaleDateString("es-ES", { day: "numeric" })
  }
  return date.toISOString().split("T")[0]
}

const getDayName = (date: Date, isSpanish: boolean): string => {
  const days = isSpanish
    ? ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  return days[date.getDay()]
}

const getMonthDates = (referenceDate: Date): Date[] => {
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth()
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  const dates: Date[] = []

  // Get Monday of the first week of the month
  const startDay = firstDayOfMonth.getDay()
  const mondayOffset = startDay === 0 ? -6 : 1 - startDay
  const startDate = new Date(year, month, 1 + mondayOffset)

  // Always show 6 weeks (42 days) like Google Calendar
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    dates.push(date)
  }

  return dates
}

const formatMonthDay = (date: Date): string => {
  return date.getDate().toString()
}

function AppointmentModal({
  appointment,
  isOpen,
  onClose,
  isSpanish,
}: {
  appointment: Appointment | null
  isOpen: boolean
  onClose: () => void
  isSpanish: boolean
}) {
  if (!appointment) return null

  const paymentStatusConfig: Record<string, { label: string; sublabel: string; className: string }> = {
    paid: {
      label: isSpanish ? "Pagado" : "Paid",
      sublabel: isSpanish ? "Fondos liberados" : "Funds released",
      className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
    escrow: {
      label: isSpanish ? "En Garantía" : "In Escrow",
      sublabel: isSpanish ? "Depósito en garantía" : "Deposit held",
      className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    },
    pending: {
      label: isSpanish ? "Pendiente" : "Pending",
      sublabel: isSpanish ? "Esperando pago" : "Awaiting payment",
      className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    },
  }

  const paymentInfo = paymentStatusConfig[appointment.payment_status] || {
    label: appointment.payment_status,
    sublabel: "",
    className: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center">
              <CalendarIcon className="h-5 w-5 text-teal-600" />
            </div>
            <span>{isSpanish ? "Detalles de la Cita" : "Appointment Details"}</span>
          </DialogTitle>
          <DialogDescription>
            {appointment.appointment_date} • {appointment.appointment_time.slice(0, 5)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Patient Info */}
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 border-2 border-teal-500/20">
              <AvatarImage src={appointment.patient?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-teal-500 to-teal-600 text-white text-sm">
                {appointment.patient?.first_name?.[0]}{appointment.patient?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-foreground">
                {appointment.patient?.first_name} {appointment.patient?.last_name}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <User className="h-3.5 w-3.5" />
                {isSpanish ? "Paciente" : "Patient"}
              </p>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {isSpanish ? "Motivo de consulta" : "Consultation reason"}
            </p>
            <p className="text-sm text-foreground bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
              {appointment.notes || (isSpanish ? "Sin notas adicionales" : "No additional notes")}
            </p>
          </div>

          {/* Payment Status */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {isSpanish ? "Estado del pago" : "Payment status"}
            </p>
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">${appointment.price} USD</p>
                  <p className="text-xs text-muted-foreground">{paymentInfo.sublabel}</p>
                </div>
              </div>
              <Badge variant="outline" className={cn("text-xs", paymentInfo.className)}>
                {paymentInfo.label}
              </Badge>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-3 sm:flex-col">
          {/* Start Video Call Button */}
          {appointment.type === 'online' && (
            <Button
              size="lg"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-12 shadow-lg shadow-teal-600/20"
              onClick={() => appointment.meeting_link && window.open(appointment.meeting_link, '_blank')}
            >
              <Video className="h-5 w-5 mr-2" />
              {isSpanish ? "Iniciar Videollamada" : "Start Video Call"}
            </Button>
          )}

          {/* Cancel Button */}
          <div className="w-full space-y-2">
            <Button
              variant="outline"
              className="w-full text-red-500 border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 rounded-xl"
            >
              <X className="h-4 w-4 mr-2" />
              {isSpanish ? "Gestionar Cita" : "Manage Appointment"}
            </Button>
            <p className="text-[11px] text-center text-muted-foreground flex items-start justify-center gap-1.5 px-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
              {isSpanish
                ? "Las cancelaciones con menos de 48h afectan la reputación"
                : "Cancellations with less than 48h notice affect reputation"}
            </p>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Mock data removed in favor of real data props

function AppointmentSlot({
  appointment,
  isSpanish,
  onClick,
}: {
  appointment: Appointment
  isSpanish: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full h-full min-h-[48px] rounded-md px-2 py-1.5",
        appointment.status === 'confirmed' ? "bg-gradient-to-br from-teal-600 to-teal-700" :
        appointment.status === 'pending' ? "bg-gradient-to-br from-amber-500 to-amber-600" :
        appointment.status === 'completed' ? "bg-gradient-to-br from-blue-500 to-blue-600" :
        "bg-gradient-to-br from-slate-500 to-slate-600",
        "text-white text-left overflow-hidden",
        "border border-white/10",
        "shadow-sm hover:shadow-md transition-shadow",
        "cursor-pointer"
      )}
    >
      <p className="text-[11px] font-bold truncate">
        {appointment.patient?.first_name} {appointment.patient?.last_name}
      </p>
      <p className="text-[10px] opacity-80 flex items-center gap-1 font-medium">
        <Clock className="h-2.5 w-2.5" />
        {appointment.appointment_time.slice(0, 5)}
      </p>
    </motion.button>
  )
}

function AvailableSlot({
  time,
  date,
  isSpanish,
  onClick,
}: {
  time: string
  date: Date
  isSpanish: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full h-full min-h-[48px] rounded-md",
        "border-2 border-dashed border-teal-500/40 dark:border-teal-600/40",
        "bg-white dark:bg-slate-900/50",
        "hover:bg-teal-50 dark:hover:bg-teal-950/30",
        "hover:border-teal-500/60 dark:hover:border-teal-500/60",
        "transition-all duration-200",
        "group cursor-pointer"
      )}
    >
      <div className="flex items-center justify-center h-full opacity-0 group-hover:opacity-100 transition-opacity">
        <Plus className="h-4 w-4 text-teal-600 dark:text-teal-400" />
      </div>
    </button>
  )
}

function BlockedSlot({ isSpanish }: { isSpanish: boolean }) {
  return (
    <div
      className={cn(
        "w-full h-full min-h-[48px] rounded-lg",
        "bg-slate-100 dark:bg-slate-800",
        "flex items-center justify-center",
        "relative overflow-hidden"
      )}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 4px,
            currentColor 4px,
            currentColor 5px
          )`,
        }}
      />
      <Ban className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 relative z-10" />
    </div>
  )
}


function MiniCalendar({
  selectedDate,
  onDateChange,
  isSpanish,
}: {
  selectedDate: Date
  onDateChange: (date: Date | undefined) => void
  isSpanish: boolean
}) {
  return (
    <div className="p-2">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateChange}
        locale={isSpanish ? es : enUS}
        className="rounded-md border-none"
        classNames={{
          day_selected: "bg-teal-600 text-white hover:bg-teal-600 focus:bg-teal-600",
          day_today: "bg-slate-100 text-teal-600 font-bold",
        }}
      />
    </div>
  )
}

function MonthGrid({
  currentDate,
  appointments,
  isSpanish,
  onSlotClick,
  onAppointmentClick,
}: {
  currentDate: Date
  appointments: Appointment[]
  isSpanish: boolean
  onSlotClick: (date: Date) => void
  onAppointmentClick: (appointment: Appointment) => void
}) {
  const monthDates = useMemo(() => getMonthDates(currentDate), [currentDate])

  const isToday = (date: Date): boolean => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth()
  }

  return (
    <div className="grid grid-cols-7 min-w-[800px] border-l border-slate-200 dark:border-slate-800">
      {/* Week Headers */}
      {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day, i) => (
        <div
          key={day}
          className="border-b border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2 text-center"
        >
          <span className="text-xs font-semibold text-muted-foreground uppercase">
            {isSpanish ? day : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
          </span>
        </div>
      ))}

      {/* Days Grid */}
      {monthDates.map((date, i) => {
        const dateStr = date.toISOString().split("T")[0]
        const dayAppointments = appointments.filter((apt) => apt.appointment_date === dateStr)

        return (
          <div
            key={i}
            onClick={() => onSlotClick(date)}
            className={cn(
              "h-32 border-b border-r border-slate-100 dark:border-slate-800 p-1 transition-colors cursor-pointer",
              !isCurrentMonth(date) && "bg-slate-50/50 dark:bg-slate-900/50 opacity-50",
              isToday(date) && "bg-teal-50/30 dark:bg-teal-950/10",
              "hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
          >
            <div className="flex justify-center mb-1">
              <span
                className={cn(
                  "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                  isToday(date)
                    ? "bg-teal-600 text-white"
                    : "text-muted-foreground"
                )}
              >
                {date.getDate()}
              </span>
            </div>
            <div className="space-y-1 overflow-hidden h-[calc(100%-1.75rem)]">
              {dayAppointments.slice(0, 3).map((apt) => (
                <div
                  key={apt.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAppointmentClick(apt);
                  }}
                  className={cn(
                    "text-white text-[10px] px-1.5 py-0.5 rounded truncate shadow-sm mb-1",
                    apt.status === 'confirmed' ? "bg-teal-600" :
                    apt.status === 'pending' ? "bg-amber-500" :
                    apt.status === 'completed' ? "bg-blue-500" : "bg-slate-500"
                  )}
                >
                  {apt.appointment_time.slice(0, 5)} {apt.patient?.first_name}
                </div>
              ))}
              {dayAppointments.length > 3 && (
                <div className="text-[10px] text-muted-foreground pl-1.5 font-medium">
                  + {dayAppointments.length - 3} {isSpanish ? "más" : "more"}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export interface ProfessionalCalendarProps {
  appointments: Appointment[]
  isLoading?: boolean
  currentDate: Date
  onDateChange: (date: Date) => void
  viewMode: ViewMode
  onViewChange: (view: ViewMode) => void
  onAppointmentClick: (appointment: Appointment) => void
  onAddAppointment?: (date: Date, time: string) => void
  availability?: WeeklyAvailability
}

export function ProfessionalCalendar({
  appointments,
  isLoading,
  currentDate,
  onDateChange,
  viewMode,
  onViewChange,
  onAppointmentClick,
  onAddAppointment,
  availability,
}: ProfessionalCalendarProps) {
  const { language } = useLanguage()
  const router = useRouter()
  const isSpanish = language === "es"
  const { user } = useAuth()

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string } | null>(null)

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate])

  const navigate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (viewMode === "monthly") {
      newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1))
    } else if (viewMode === "weekly") {
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7))
    } else {
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1))
    }
    onDateChange(newDate)
  }

  const navigateToToday = () => {
    onDateChange(new Date())
  }

  const getSlotData = (date: Date, time: string): TimeSlot => {
    const dateStr = formatDate(date, "full")

    // Availability-based blocking: if outside configured hours, mark as blocked
    if (availability) {
      const weekday = date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
      const rawDay = availability[weekday]
      if (!rawDay) {
        return { time, status: "blocked" }
      }

      // Normalize: support both simple format {enabled, startTime, endTime}
      // and nested format {online: {available, hours}, 'in-person': ...}
      let enabled: boolean
      let startTimeStr: string
      let endTimeStr: string

      if (rawDay.enabled !== undefined) {
        // Simple format
        enabled = rawDay.enabled
        startTimeStr = rawDay.startTime ?? "00:00"
        endTimeStr = rawDay.endTime ?? "23:59"
      } else {
        // New nested format
        const nested = rawDay.online || rawDay["in-person"]
        enabled = nested?.available ?? false
        const hours: string | null | undefined = nested?.hours
        if (hours && hours.includes(" - ")) {
          const parts = hours.split(" - ")
          startTimeStr = parts[0] ?? "00:00"
          endTimeStr = parts[1] ?? "23:59"
        } else {
          startTimeStr = "00:00"
          endTimeStr = "23:59"
        }
      }

      if (!enabled) {
        return { time, status: "blocked" }
      }

      const [slotHour, slotMin] = time.split(":").map(Number)
      const [startHour, startMin] = startTimeStr.split(":").map(Number)
      const [endHour, endMin] = endTimeStr.split(":").map(Number)

      const slotMinutes = slotHour * 60 + slotMin
      const startMinutes = startHour * 60 + startMin
      const endMinutes = endHour * 60 + endMin

      if (slotMinutes < startMinutes || slotMinutes >= endMinutes) {
        return { time, status: "blocked" }
      }
    }

    const appointment = appointments.find(
      (apt) => apt.appointment_date === dateStr && apt.appointment_time.startsWith(time)
    )

    if (appointment) {
      return { time, status: "occupied", appointment }
    }

    return { time, status: "available" }
  }

  const handleSlotClick = (slot: TimeSlot, date: Date) => {
    if (slot.status === "occupied" && slot.appointment) {
      if (onAppointmentClick) {
        onAppointmentClick(slot.appointment)
      } else {
        setSelectedAppointment(slot.appointment)
        setIsModalOpen(true)
      }
    } else if (slot.status === "available") {
      if (onAddAppointment) {
        onAddAppointment(date, slot.time)
      } else {
        setSelectedSlot({ date, time: slot.time })
        setIsAddAppointmentOpen(true)
      }
    }
  }

  const recentPatients = useMemo(() => {
    const seen = new Set<string>()
    const result: { id: string; name: string }[] = []
    for (const apt of [...appointments].reverse()) {
      const p = apt.patient
      if (!p?.id || seen.has(p.id)) continue
      const name = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim()
      if (!name) continue
      seen.add(p.id)
      result.push({ id: p.id, name })
      if (result.length >= 5) break
    }
    return result
  }, [appointments])

  const dateRangeText = useMemo(() => {
    if (viewMode === "monthly") {
      return currentDate.toLocaleDateString(isSpanish ? "es-ES" : "en-US", {
        month: "long",
        year: "numeric",
      })
    }
    if (viewMode === "daily") {
      return currentDate.toLocaleDateString(isSpanish ? "es-ES" : "en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    }
    const startMonth = weekDates[0].toLocaleDateString(isSpanish ? "es-ES" : "en-US", {
      month: "short",
    })
    const endMonth = weekDates[6].toLocaleDateString(isSpanish ? "es-ES" : "en-US", {
      month: "short",
    })
    const startDay = weekDates[0].getDate()
    const endDay = weekDates[6].getDate()
    const year = weekDates[0].getFullYear()

    if (startMonth === endMonth) {
      return `${startDay} - ${endDay} ${startMonth}, ${year}`
    }
    return `${startDay} ${startMonth} - ${endDay} ${endMonth}, ${year}`
  }, [weekDates, currentDate, viewMode, isSpanish])

  const isToday = (date: Date): boolean => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  return (
    <>
      <div className="flex flex-col h-full bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
        {/* Google Style Header */}
        <header className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 z-20">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 mr-4">
              <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <CalendarIcon className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 hidden sm:block">
                {isSpanish ? "Calendario" : "Calendar"}
              </h1>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 rounded-md font-medium"
              onClick={navigateToToday}
            >
              {isSpanish ? "Hoy" : "Today"}
            </Button>

            <div className="flex items-center gap-1 ml-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => navigate("prev")}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => navigate("next")}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            
            <h2 className="text-xl font-medium text-slate-700 dark:text-slate-200 ml-2">
              {dateRangeText}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="h-5 w-5" />
            </Button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
            <Select value={viewMode} onValueChange={(v) => onViewChange(v as ViewMode)}>
              <SelectTrigger className="w-[110px] h-9 border-none bg-slate-50 dark:bg-slate-900 rounded-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">{isSpanish ? "Día" : "Day"}</SelectItem>
                <SelectItem value="weekly">{isSpanish ? "Semana" : "Week"}</SelectItem>
                <SelectItem value="monthly">{isSpanish ? "Mes" : "Month"}</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              title={isSpanish ? "Configurar horarios" : "Configure schedule"}
              onClick={() => router.push("/dashboard/professional/profile?tab=availability")}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden flex flex-col"
              >
                <div className="p-4">
                  <Button
                    onClick={() => {
                      if (onAddAppointment) {
                        onAddAppointment(new Date(), "09:00")
                      } else {
                        setSelectedSlot({ date: new Date(), time: "09:00" })
                        setIsAddAppointmentOpen(true)
                      }
                    }}
                    className="w-full h-12 rounded-full shadow-md bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-3 font-medium transition-all"
                  >
                    <div className="flex items-center justify-center">
                      <svg width="36" height="36" viewBox="0 0 36 36">
                        <path fill="#34A853" d="M16 16v14h4V20z" />
                        <path fill="#4285F4" d="M30 16H20l-4 4h14z" />
                        <path fill="#FBBC05" d="M6 16v4h10l4-4z" />
                        <path fill="#EA4335" d="M20 16V6h-4v14z" />
                        <path fill="none" d="M0 0h36v36H0z" />
                      </svg>
                    </div>
                    {isSpanish ? "Crear" : "Create"}
                  </Button>
                </div>

                <MiniCalendar
                  selectedDate={currentDate}
                  onDateChange={(date) => date && onDateChange(date)}
                  isSpanish={isSpanish}
                />

                {recentPatients.length > 0 && (
                  <div className="mt-4 px-4 space-y-4">
                    <div>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        {isSpanish ? "Pacientes Recientes" : "Recent Patients"}
                      </h3>
                      <div className="space-y-1">
                        {recentPatients.map((patient) => (
                          <div key={patient.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer group">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[10px] bg-teal-100 text-teal-700 uppercase">
                                {patient.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-teal-600 transition-colors truncate">
                              {patient.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Grid Area */}
          <main className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-900/20">
            <div className="min-w-fit">
              {viewMode === "monthly" ? (
                <MonthGrid
                  currentDate={currentDate}
                  appointments={appointments}
                  isSpanish={isSpanish}
                  onSlotClick={(date) => handleSlotClick({ time: "09:00", status: "available" }, date)}
                  onAppointmentClick={(apt) => {
                    setSelectedAppointment(apt)
                    setIsModalOpen(true)
                  }}
                />
              ) : (
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `70px repeat(${viewMode === "weekly" ? 7 : 1}, 1fr)`,
                  }}
                >
                  <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-3">
                    <span className="text-[11px] font-medium text-slate-400">
                      {isSpanish ? "HORA LOCAL (GMT-3)" : "LOCAL TIME (GMT-3)"}
                    </span>
                  </div>
                  {(viewMode === "weekly" ? weekDates : [currentDate]).map((date) => (
                    <div
                      key={date.toISOString()}
                      className={cn(
                        "sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-3 text-center",
                        isToday(date) && "text-teal-600 dark:text-teal-400"
                      )}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1">
                        {getDayName(date, isSpanish)}
                      </p>
                      <div className={cn(
                        "text-2xl font-semibold w-10 h-10 flex items-center justify-center mx-auto rounded-full transition-colors",
                        isToday(date) && "bg-teal-600 text-white"
                      )}>
                        {date.getDate()}
                      </div>
                    </div>
                  ))}

                  {TIME_SLOTS.map((time) => (
                    <React.Fragment key={`row-${time}`}>
                      <div className="border-b border-r border-slate-100 dark:border-slate-800 pr-2 flex justify-end items-start h-[60px] -mt-2">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {time}
                        </span>
                      </div>

                      {(viewMode === "weekly" ? weekDates : [currentDate]).map((date) => {
                        const slot = getSlotData(date, time)
                        return (
                          <div
                            key={`${date.toISOString()}-${time}`}
                            className={cn(
                              "border-b border-r border-slate-100 dark:border-slate-800 p-0.5 h-[60px]",
                              isToday(date) && "bg-teal-50/10 dark:bg-teal-950/5"
                            )}
                          >
                            {slot.status === "occupied" && slot.appointment ? (
                              <AppointmentSlot
                                appointment={slot.appointment}
                                isSpanish={isSpanish}
                                onClick={() => handleSlotClick(slot, date)}
                              />
                            ) : slot.status === "blocked" ? (
                              <BlockedSlot isSpanish={isSpanish} />
                            ) : (
                              <AvailableSlot
                                time={time}
                                date={date}
                                isSpanish={isSpanish}
                                onClick={() => handleSlotClick(slot, date)}
                              />
                            )}
                          </div>
                        )
                      })}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Modales */}
      <AppointmentModal
        appointment={selectedAppointment}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedAppointment(null)
        }}
        isSpanish={isSpanish}
      />
      
      <AddAppointmentDialog
        isOpen={isAddAppointmentOpen}
        onClose={() => setIsAddAppointmentOpen(false)}
        initialDate={selectedSlot?.date}
        initialTime={selectedSlot?.time}
        professionalId={user?.id || ""}
        onSuccess={() => {
          // En una app real recargaríamos la data
          window.location.reload()
        }}
      />
    </>
  )
}
