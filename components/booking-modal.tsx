"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { 
  Video, 
  Home, 
  ChevronRight, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  Loader2, 
  AlertTriangle,
  CalendarDays,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { NoPhysicalConsultationDisplay } from "@/components/no-physical-consultation-display"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface TimeSlot {
  time: string
  available: boolean
  displayTime: string
}

interface DayAvailability {
  online?: { available: boolean; hours: string | null }
  "in-person"?: { available: boolean; hours: string | null }
  slotDuration?: number
}

const DAYS_MAP: Record<number, string> = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
}

function generateTimeSlots(
  startTime: string,
  endTime: string,
  duration: number
): string[] {
  const slots: string[] = []
  const [startHour, startMin] = startTime.split(":").map(Number)
  const [endHour, endMin] = endTime.split(":").map(Number)

  let currentMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin

  while (currentMinutes + duration <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60)
    const minutes = currentMinutes % 60
    slots.push(
      `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
    )
    currentMinutes += duration
  }

  return slots
}

function formatTimeDisplay(time: string): string {
  const [hours, minutes] = time.split(":").map(Number)
  const period = hours >= 12 ? "PM" : "AM"
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`
}

export function BookingModal({
  isOpen,
  onClose,
  professionalId,
  professionalName = "the specialist",
  stellarWallet = null,
  offersInPerson = true,
  isSpanish = true,
}: {
  isOpen: boolean
  onClose: () => void
  professionalId?: string
  professionalName?: string
  stellarWallet?: string | null
  offersInPerson?: boolean
  isSpanish?: boolean
}) {
  const router = useRouter()
  const supabase = createClient()
  
  const [step, setStep] = useState(1)
  const [type, setType] = useState<"online" | "in-person" | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [createdRef, setCreatedRef] = useState<string | null>(null)
  const [confirmedAt, setConfirmedAt] = useState<{ date: string; time: string } | null>(null)

  // Availability state
  const [availability, setAvailability] = useState<Record<string, DayAvailability>>({})
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set())

  // Always allow booking with Stripe payments
  const canBookWithPayment = true

  // Load professional availability
  useEffect(() => {
    const loadAvailability = async () => {
      if (!professionalId || !isOpen) return

      setLoadingAvailability(true)
      try {
        const { data: professional, error } = await supabase
          .from("professionals")
          .select("availability, online_price, in_person_price, consultation_price")
          .eq("id", professionalId)
          .single()

        if (!error && professional?.availability) {
          setAvailability(professional.availability as Record<string, DayAvailability>)
        }
      } catch (error) {
        console.error("Error loading availability:", error)
      } finally {
        setLoadingAvailability(false)
      }
    }

    loadAvailability()
  }, [professionalId, isOpen, supabase])

  // Generate slots when date is selected
  const loadSlotsForDate = useCallback(async (date: Date) => {
    if (!professionalId || !type) return

    setLoadingSlots(true)
    setTimeSlots([])
    setSelectedTime(null)

    try {
      const dayOfWeek = DAYS_MAP[date.getDay()]
      const dayAvailability = availability[dayOfWeek]

      if (!dayAvailability) {
        setTimeSlots([])
        return
      }

      // Get the hours for the selected consultation type
      const typeAvailability = type === "online" 
        ? dayAvailability.online 
        : dayAvailability["in-person"]

      if (!typeAvailability?.available || !typeAvailability.hours) {
        setTimeSlots([])
        return
      }

      // Parse hours
      const [startTime, endTime] = typeAvailability.hours.split(" - ")
      const duration = dayAvailability.slotDuration || 60

      // Generate all possible slots
      const allSlots = generateTimeSlots(startTime, endTime, duration)

      // Get existing appointments for this date
      const dateStr = date.toISOString().split("T")[0]
      const { data: existingAppointments } = await supabase
        .from("appointments")
        .select("appointment_time")
        .eq("professional_id", professionalId)
        .eq("appointment_date", dateStr)
        .in("status", ["pending", "confirmed"])

      const bookedTimes = new Set(
        existingAppointments?.map((apt) => 
          apt.appointment_time.substring(0, 5)
        ) || []
      )
      setBookedSlots(bookedTimes)

      // Mark slots as available or booked
      const slotsWithAvailability: TimeSlot[] = allSlots.map((time) => ({
        time,
        available: !bookedTimes.has(time),
        displayTime: formatTimeDisplay(time),
      }))

      setTimeSlots(slotsWithAvailability)
    } catch (error) {
      console.error("Error loading slots:", error)
    } finally {
      setLoadingSlots(false)
    }
  }, [professionalId, type, availability, supabase])

  // Reload slots when date changes
  useEffect(() => {
    if (selectedDate && type) {
      loadSlotsForDate(selectedDate)
    }
  }, [selectedDate, type, loadSlotsForDate])

  // Check if a date is available
  const isDateDisabled = useCallback((date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Past dates
    if (date < today) return true

    // Check if the day has availability for the selected type
    const dayOfWeek = DAYS_MAP[date.getDay()]
    const dayAvailability = availability[dayOfWeek]

    if (!dayAvailability) return true

    if (type === "online") {
      return !dayAvailability.online?.available
    } else if (type === "in-person") {
      return !dayAvailability["in-person"]?.available
    }

    // If no type selected yet, check if any availability exists
    return !(dayAvailability.online?.available || dayAvailability["in-person"]?.available)
  }, [availability, type])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1)
      setType(null)
      setSelectedDate(undefined)
      setSelectedTime(null)
      setSubmitError(null)
      setCreatedRef(null)
      setConfirmedAt(null)
      setTimeSlots([])
      return
    }

    // Check user auth
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        onClose()
        router.push("/login?message=" + encodeURIComponent(
          isSpanish 
            ? "Debes iniciar sesión para agendar."
            : "You must log in to book."
        ))
      }
    }
    checkUser()
  }, [isOpen, router, onClose, supabase, isSpanish])

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  const canConfirmStep2 = Boolean(selectedDate && selectedTime)

  const handleCompleteBooking = async () => {
    if (!professionalId || !type || !selectedDate || !selectedTime) {
      setSubmitError(isSpanish 
        ? "Faltan datos para confirmar la cita."
        : "Missing data to confirm appointment.")
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      onClose()
      router.push("/login?message=" + encodeURIComponent(
        isSpanish 
          ? "Debes iniciar sesión para agendar."
          : "You must log in to book."
      ))
      return
    }

    setIsLoading(true)
    setSubmitError(null)

    const appointmentDate = selectedDate.toISOString().slice(0, 10)
    const appointmentTime = selectedTime.length === 5 ? `${selectedTime}:00` : selectedTime

    try {
      // Create Mercado Pago Preference
      const response = await fetch("/api/payments/mercadopago/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalId,
          appointmentDate,
          appointmentTime,
          type,
          duration: 60,
        }),
      })
      
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al procesar el pago")
      }

      // Reutilizamos data.url que viene del backend (init_point o sandbox_init_point)
      if (data.url || data.sandbox_url) {
        // En desarrollo usamos sandbox si está disponible
        const mpUrl = (process.env.NODE_ENV === 'development' && data.sandbox_url) 
          ? data.sandbox_url 
          : data.url;
        window.location.href = mpUrl;
      } else {
        throw new Error("No se recibió URL de pago")
      }
    } catch (err) {
      const message = err instanceof Error 
        ? err.message 
        : (isSpanish 
            ? "No se pudo completar la reserva. Intenta de nuevo."
            : "Could not complete the booking. Please try again.")
      setSubmitError(message)
      setIsLoading(false)
    }
  }

  const availableSlotsCount = timeSlots.filter(s => s.available).length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="flex flex-col h-[600px]">
          {/* Header Progress */}
          <div className="bg-gradient-to-r from-teal-600/10 to-emerald-600/10 p-6 sm:p-8 border-b border-teal-500/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {isSpanish ? "Agendar Consulta" : "Book Consultation"}
              </h2>
              <Badge variant="outline" className="rounded-full border-teal-500/30 text-teal-700 dark:text-teal-300 bg-white/80 dark:bg-slate-900/80">
                {isSpanish ? `Paso ${step} de 4` : `Step ${step} of 4`}
              </Badge>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-all duration-500",
                    step >= s ? "bg-teal-600" : "bg-teal-600/20",
                  )}
                />
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            {/* Step 1: Consultation Type */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {offersInPerson ? (
                  <>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {isSpanish ? "Elige tipo de consulta" : "Select Consultation Mode"}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400">
                        {isSpanish 
                          ? "¿Cómo te gustaría reunirte con el especialista?" 
                          : "How would you like to meet with the specialist?"}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      <button
                        onClick={() => {
                          setType("online")
                          nextStep()
                        }}
                        className={cn(
                          "flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all group",
                          "border-slate-200 dark:border-slate-700",
                          "hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/30",
                        )}
                      >
                        <div className="w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                          <Video className="h-8 w-8" />
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-lg text-slate-900 dark:text-white">
                            {isSpanish ? "Consulta Online" : "Online Session"}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {isSpanish ? "Videollamada segura" : "Secure video call"}
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setType("in-person")
                          nextStep()
                        }}
                        className={cn(
                          "flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all group",
                          "border-slate-200 dark:border-slate-700",
                          "hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/30",
                        )}
                      >
                        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                          <Home className="h-8 w-8" />
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-lg text-slate-900 dark:text-white">
                            {isSpanish ? "Presencial" : "In-person Visit"}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {isSpanish ? "En consultorio" : "At clinic location"}
                          </p>
                        </div>
                      </button>
                    </div>
                  </>
                ) : (
                  <NoPhysicalConsultationDisplay
                    inModal
                    isSpanish={isSpanish}
                    onAgendarTeleconsulta={() => {
                      setType("online")
                      nextStep()
                    }}
                    variant="inline"
                  />
                )}
              </div>
            )}

            {/* Step 2: Date & Time Selection */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {isSpanish ? "Selecciona Fecha y Hora" : "Select Date & Time"}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    {isSpanish 
                      ? "Elige el momento que mejor te convenga."
                      : "Choose the time that works best for you."}
                  </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 pt-4">
                  {/* Calendar */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-2 bg-white dark:bg-slate-900">
                    {loadingAvailability ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                      </div>
                    ) : (
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={isDateDisabled}
                        className="rounded-lg"
                      />
                    )}
                  </div>

                  {/* Time Slots */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Clock className="h-4 w-4" /> 
                        {isSpanish ? "Horarios Disponibles" : "Available Slots"}
                      </p>
                      {selectedDate && !loadingSlots && (
                        <Badge variant="outline" className="text-xs">
                          {availableSlotsCount} {isSpanish ? "disponibles" : "available"}
                        </Badge>
                      )}
                    </div>

                    {!selectedDate ? (
                      <div className="h-[200px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-2">
                        <CalendarDays className="h-10 w-10" />
                        <p className="text-sm text-center">
                          {isSpanish 
                            ? "Selecciona una fecha para ver los horarios"
                            : "Select a date to see available times"}
                        </p>
                      </div>
                    ) : loadingSlots ? (
                      <div className="h-[200px] flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                      </div>
                    ) : timeSlots.length === 0 ? (
                      <div className="h-[200px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-2">
                        <AlertTriangle className="h-10 w-10" />
                        <p className="text-sm text-center">
                          {isSpanish 
                            ? "No hay horarios disponibles para este día"
                            : "No available slots for this day"}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[280px] overflow-y-auto pr-2">
                        {timeSlots.map((slot) => (
                          <Button
                            key={slot.time}
                            variant={selectedTime === slot.time ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "h-11 rounded-xl transition-all",
                              selectedTime === slot.time 
                                ? "bg-teal-600 hover:bg-teal-700 text-white border-teal-600" 
                                : "bg-white dark:bg-slate-900 hover:border-teal-500",
                              !slot.available && "opacity-40 line-through pointer-events-none"
                            )}
                            onClick={() => slot.available && setSelectedTime(slot.time)}
                            disabled={!slot.available}
                          >
                            {slot.displayTime}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {isSpanish ? "Confirmar y Pagar" : "Confirm & Pay"}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    {isSpanish 
                      ? "Serás redirigido a Mercado Pago para completar el pago de forma segura."
                      : "You'll be redirected to Mercado Pago to complete the payment securely."}
                  </p>
                </div>

                <div className="grid gap-4 pt-4">
                  <div className="h-20 flex items-center gap-4 px-6 rounded-2xl border-2 border-teal-500/30 bg-teal-50/50 dark:bg-teal-950/30">
                    <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-600">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {isSpanish ? "Pago con Mercado Pago" : "Pay with Mercado Pago"}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {isSpanish ? "Tarjetas, transferencia o saldo Mercado Pago" : "Credit/Debit cards, bank transfer or MP balance"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Booking Summary */}
                <div className="bg-teal-50 dark:bg-teal-950/30 p-5 rounded-xl border border-teal-200 dark:border-teal-800 space-y-3">
                  <p className="text-sm font-semibold text-teal-800 dark:text-teal-200">
                    {isSpanish ? "Resumen de tu cita" : "Appointment Summary"}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-teal-700 dark:text-teal-300">
                        {isSpanish ? "Fecha" : "Date"}
                      </span>
                      <span className="font-medium text-teal-900 dark:text-teal-100">
                        {selectedDate?.toLocaleDateString(isSpanish ? "es-CL" : "en-US", { 
                          weekday: "short",
                          day: "numeric", 
                          month: "short" 
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-teal-700 dark:text-teal-300">
                        {isSpanish ? "Hora" : "Time"}
                      </span>
                      <span className="font-medium text-teal-900 dark:text-teal-100">
                        {selectedTime && formatTimeDisplay(selectedTime)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-teal-700 dark:text-teal-300">
                        {isSpanish ? "Modalidad" : "Type"}
                      </span>
                      <span className="font-medium text-teal-900 dark:text-teal-100">
                        {type === "online" 
                          ? (isSpanish ? "Online" : "Online") 
                          : (isSpanish ? "Presencial" : "In-person")}
                      </span>
                    </div>
                    <div className="border-t border-teal-200 dark:border-teal-700 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-teal-800 dark:text-teal-200">
                          {isSpanish ? "Total" : "Total"}
                        </span>
                        <span className="text-xl font-bold text-teal-900 dark:text-teal-100">
                          $45,000 CLP
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {submitError && (
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    {submitError}
                  </p>
                )}
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <div className="flex flex-col items-center justify-center text-center space-y-6 py-8 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-14 w-14 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    {isSpanish ? "¡Cita Confirmada!" : "Appointment Confirmed!"}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                    {isSpanish 
                      ? `Tu cita con ${professionalName} está agendada para el ${confirmedAt?.date} a las ${confirmedAt?.time}.`
                      : `Your session with ${professionalName} is scheduled for ${confirmedAt?.date} at ${confirmedAt?.time}.`}
                  </p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      {isSpanish ? "Modalidad" : "Mode"}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {type === "online" 
                        ? (isSpanish ? "Videollamada" : "Video Call") 
                        : (isSpanish ? "Presencial" : "In-person")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      {isSpanish ? "Referencia" : "Reference"}
                    </span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">
                      {createdRef || "—"}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isSpanish 
                    ? "Recibirás un correo con los detalles y recordatorios."
                    : "You'll receive an email with details and reminders."}
                </p>
                <div className="flex gap-4 w-full pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl bg-transparent" 
                    onClick={onClose}
                  >
                    {isSpanish ? "Cerrar" : "Close"}
                  </Button>
                  <Button 
                    className="flex-1 rounded-xl bg-teal-600 hover:bg-teal-700" 
                    asChild
                  >
                    <a href="/dashboard/appointments">
                      {isSpanish ? "Ver Mis Citas" : "View My Appointments"}
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          {step < 4 && (
            <div className="p-6 sm:p-8 border-t border-slate-200 dark:border-slate-800 flex justify-between bg-white dark:bg-slate-950">
              <Button 
                variant="ghost" 
                onClick={prevStep} 
                disabled={step === 1 || isLoading} 
                className="rounded-xl font-medium"
              >
                {isSpanish ? "Atrás" : "Back"}
              </Button>
              <Button
                onClick={step === 3 ? handleCompleteBooking : nextStep}
                disabled={
                  (step === 1 && !type) || 
                  (step === 2 && !canConfirmStep2) || 
                  (step === 3 && !canBookWithPayment) || 
                  isLoading
                }
                className={cn(
                  "px-8 rounded-xl font-semibold",
                  "bg-teal-600 hover:bg-teal-700"
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : step === 3 ? (
                  isSpanish ? "Confirmar y Pagar" : "Confirm & Pay"
                ) : (
                  isSpanish ? "Siguiente" : "Next"
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
