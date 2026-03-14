"use client"

import { useState, useMemo } from "react"
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
} from "lucide-react"
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

type SlotStatus = "available" | "occupied" | "blocked"
type PaymentStatus = "paid" | "pending" | "escrow"
type ViewMode = "weekly" | "daily"

interface Appointment {
  id: string
  patientName: string
  patientAvatar?: string
  reason: string
  date: string
  startTime: string
  endTime: string
  paymentStatus: PaymentStatus
  price: number
}

interface TimeSlot {
  time: string
  status: SlotStatus
  appointment?: Appointment
}

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

const BLOCKED_TIMES = ["12:00", "12:30", "13:00"]

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

const generateMockAppointments = (weekDates: Date[]): Appointment[] => {
  const today = new Date()
  const appointments: Appointment[] = [
    {
      id: "apt-1",
      patientName: "María González Pérez",
      reason: "Consulta de seguimiento - Ansiedad",
      date: formatDate(weekDates[0], "full"),
      startTime: "09:00",
      endTime: "09:30",
      paymentStatus: "paid",
      price: 35,
    },
    {
      id: "apt-2",
      patientName: "Carlos Rodríguez",
      reason: "Primera consulta - Evaluación inicial",
      date: formatDate(weekDates[1], "full"),
      startTime: "10:30",
      endTime: "11:00",
      paymentStatus: "escrow",
      price: 45,
    },
    {
      id: "apt-3",
      patientName: "Ana Martínez Silva",
      reason: "Terapia cognitivo-conductual",
      date: formatDate(weekDates[2], "full"),
      startTime: "15:00",
      endTime: "15:30",
      paymentStatus: "paid",
      price: 35,
    },
    {
      id: "apt-4",
      patientName: "Pedro Sánchez López",
      reason: "Seguimiento tratamiento",
      date: formatDate(weekDates[3], "full"),
      startTime: "11:00",
      endTime: "11:30",
      paymentStatus: "pending",
      price: 35,
    },
    {
      id: "apt-5",
      patientName: "Lucía Fernández",
      reason: "Control mensual",
      date: formatDate(weekDates[4], "full"),
      startTime: "16:30",
      endTime: "17:00",
      paymentStatus: "paid",
      price: 35,
    },
  ]
  return appointments
}

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
        "w-full h-full min-h-[48px] rounded-lg px-2 py-1.5",
        "bg-gradient-to-br from-teal-600 to-teal-700 dark:from-teal-700 dark:to-teal-800",
        "text-white text-left overflow-hidden",
        "border border-teal-500/30",
        "shadow-sm hover:shadow-md transition-shadow",
        "cursor-pointer"
      )}
    >
      <p className="text-[11px] font-semibold truncate">
        {appointment.patientName.split(" ").slice(0, 2).join(" ")}
      </p>
      <p className="text-[10px] opacity-80 flex items-center gap-1">
        <Clock className="h-2.5 w-2.5" />
        {appointment.startTime}
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
        "w-full h-full min-h-[48px] rounded-lg",
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

  const paymentStatusConfig = {
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

  const paymentInfo = paymentStatusConfig[appointment.paymentStatus]

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
            {appointment.date} • {appointment.startTime} - {appointment.endTime}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Patient Info */}
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12 border-2 border-teal-500/20">
              <AvatarImage src={appointment.patientAvatar} />
              <AvatarFallback className="bg-gradient-to-br from-teal-500 to-teal-600 text-white text-sm">
                {appointment.patientName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-foreground">
                {appointment.patientName}
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
              {appointment.reason}
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
          <Button
            size="lg"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-12 shadow-lg shadow-teal-600/20"
          >
            <Video className="h-5 w-5 mr-2" />
            {isSpanish ? "Iniciar Videollamada" : "Start Video Call"}
          </Button>

          {/* Cancel Button */}
          <div className="w-full space-y-2">
            <Button
              variant="outline"
              className="w-full text-red-500 border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 rounded-xl"
            >
              <X className="h-4 w-4 mr-2" />
              {isSpanish ? "Cancelar Cita" : "Cancel Appointment"}
            </Button>
            <p className="text-[11px] text-center text-muted-foreground flex items-start justify-center gap-1.5 px-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
              {isSpanish
                ? "Las cancelaciones con menos de 48h afectarán tu reputación en NUREA"
                : "Cancellations with less than 48h notice will affect your NUREA reputation"}
            </p>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ProfessionalCalendar() {
  const { language } = useLanguage()
  const isSpanish = language === "es"

  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>("weekly")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate])
  const mockAppointments = useMemo(() => generateMockAppointments(weekDates), [weekDates])

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7))
    setCurrentDate(newDate)
  }

  const getSlotData = (date: Date, time: string): TimeSlot => {
    const dateStr = formatDate(date, "full")

    if (BLOCKED_TIMES.includes(time)) {
      return { time, status: "blocked" }
    }

    const appointment = mockAppointments.find(
      (apt) => apt.date === dateStr && apt.startTime === time
    )

    if (appointment) {
      return { time, status: "occupied", appointment }
    }

    return { time, status: "available" }
  }

  const handleSlotClick = (slot: TimeSlot, date: Date) => {
    if (slot.status === "occupied" && slot.appointment) {
      setSelectedAppointment(slot.appointment)
      setIsModalOpen(true)
    } else if (slot.status === "available") {
      console.log("Open availability for:", formatDate(date, "full"), slot.time)
    }
  }

  const weekRangeText = useMemo(() => {
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
  }, [weekDates, isSpanish])

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
      <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-teal-600" />
              {isSpanish ? "Agenda de Citas" : "Appointments Schedule"}
            </CardTitle>

            <div className="flex items-center gap-3">
              {/* View Mode Selector */}
              <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <SelectTrigger className="w-[130px] h-9 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">
                    {isSpanish ? "Semanal" : "Weekly"}
                  </SelectItem>
                  <SelectItem value="daily">
                    {isSpanish ? "Diaria" : "Daily"}
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Week Navigation */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-md"
                  onClick={() => navigateWeek("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 text-sm font-medium min-w-[160px] text-center">
                  {weekRangeText}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-md"
                  onClick={() => navigateWeek("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {/* Calendar Grid */}
            <div
              className="grid min-w-[800px]"
              style={{
                gridTemplateColumns: "70px repeat(7, 1fr)",
              }}
            >
              {/* Header Row */}
              <div className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-3">
                <span className="text-xs font-medium text-muted-foreground">
                  {isSpanish ? "Hora" : "Time"}
                </span>
              </div>
              {weekDates.map((date) => (
                <div
                  key={date.toISOString()}
                  className={cn(
                    "sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-3 text-center",
                    isToday(date) && "bg-teal-50 dark:bg-teal-950/30"
                  )}
                >
                  <p className="text-xs font-medium text-muted-foreground">
                    {getDayName(date, isSpanish)}
                  </p>
                  <p
                    className={cn(
                      "text-lg font-bold",
                      isToday(date)
                        ? "text-teal-600 dark:text-teal-400"
                        : "text-foreground"
                    )}
                  >
                    {formatDate(date)}
                  </p>
                </div>
              ))}

              {/* Time Slots Grid */}
              {TIME_SLOTS.map((time) => (
                <>
                  {/* Time Label */}
                  <div
                    key={`time-${time}`}
                    className="border-b border-r border-slate-100 dark:border-slate-800 p-2 flex items-center justify-center"
                  >
                    <span className="text-xs font-medium text-muted-foreground">
                      {time}
                    </span>
                  </div>

                  {/* Day Slots */}
                  {weekDates.map((date) => {
                    const slot = getSlotData(date, time)
                    return (
                      <div
                        key={`${date.toISOString()}-${time}`}
                        className={cn(
                          "border-b border-r border-slate-100 dark:border-slate-800 p-1",
                          isToday(date) && "bg-teal-50/30 dark:bg-teal-950/10"
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
                </>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-dashed border-teal-500/50 bg-white dark:bg-slate-900" />
                <span className="text-muted-foreground">
                  {isSpanish ? "Disponible" : "Available"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-teal-600 to-teal-700" />
                <span className="text-muted-foreground">
                  {isSpanish ? "Cita agendada" : "Scheduled"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700 relative overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-50"
                    style={{
                      backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, currentColor 2px, currentColor 3px)`,
                    }}
                  />
                </div>
                <span className="text-muted-foreground">
                  {isSpanish ? "Bloqueado" : "Blocked"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Modal */}
      <AppointmentModal
        appointment={selectedAppointment}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedAppointment(null)
        }}
        isSpanish={isSpanish}
      />
    </>
  )
}
