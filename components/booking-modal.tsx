"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Video,
  Home,
  ChevronRight,
  Clock,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  CalendarDays,
  ArrowRight,
  ChevronLeft,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { NoPhysicalConsultationDisplay } from "@/components/no-physical-consultation-display"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { bookAppointment } from "@/actions/appointments"
import { format } from "date-fns"

interface TimeSlot {
  time: string
  available: boolean
  displayTime: string
}

interface PrismaSlot {
  id: string
  startTime: string
  endTime: string
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
  initialDate,
}: {
  isOpen: boolean
  onClose: () => void
  professionalId?: string
  professionalName?: string
  stellarWallet?: string | null
  offersInPerson?: boolean
  isSpanish?: boolean
  initialDate?: Date
}) {
  const router = useRouter()
  const supabase = createClient()
  const { user } = useAuth()

  const [step, setStep] = useState(1)
  const [type, setType] = useState<"online" | "in-person" | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [prismaSlots, setPrismaSlots] = useState<PrismaSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [patientName, setPatientName] = useState("")
  const [patientEmail, setPatientEmail] = useState("")
  const [patientPhone, setPatientPhone] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [createdRef, setCreatedRef] = useState<string | null>(null)
  const [confirmedAt, setConfirmedAt] = useState<{ date: string; time: string } | null>(null)
  const [prices, setPrices] = useState({ online: 45000, inPerson: 45000 })

  // Availability state
  const [availability, setAvailability] = useState<Record<string, DayAvailability>>({})
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set())

  // Load Prisma slots when date is selected (new system)
  useEffect(() => {
    if (!professionalId || !selectedDate || !isOpen) {
      setPrismaSlots([])
      setSelectedSlotId(null)
      return
    }
    const dateStr = selectedDate.toISOString().split("T")[0]
    setLoadingSlots(true)
    setPrismaSlots([])
    setSelectedSlotId(null)
    fetch(`/api/profesionales/${professionalId}/slots?date=${dateStr}`)
      .then((res) => res.json())
      .then((data) => setPrismaSlots(data.slots ?? []))
      .catch(() => setPrismaSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [professionalId, selectedDate, isOpen])

  // Prefill contact from auth
  useEffect(() => {
    if (user?.email) setPatientEmail(user.email)
    const name = user?.user_metadata?.full_name || user?.user_metadata?.name
    if (name) setPatientName(String(name))
  }, [user])

  // Only disable past dates (Prisma slots API returns availability per day)
  const isDateDisabled = useCallback((date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }, [])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1)
      setType(null)
      setCreatedRef(null)
      setConfirmedAt(null)
      setTimeSlots([])
      setPrismaSlots([])
      setSelectedSlotId(null)
      setSelectedTime(null)
      setSelectedDate(initialDate)
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

  const canConfirmStep2 = Boolean(
    selectedDate && (professionalId ? selectedSlotId : selectedTime)
  )

  const handleCompleteBooking = async () => {
    if (!professionalId || !selectedDate) {
      setSubmitError(isSpanish ? "Faltan datos." : "Missing data.")
      return
    }
    const slotId = selectedSlotId
    if (!slotId) {
      setSubmitError(isSpanish ? "Elige un horario." : "Select a time.")
      return
    }
    const name = patientName.trim()
    const email = patientEmail.trim()
    const phone = patientPhone.trim()
    if (!name || !email || !phone) {
      setSubmitError(isSpanish ? "Completa nombre, email y teléfono." : "Fill name, email and phone.")
      return
    }

    setIsLoading(true)
    setSubmitError(null)
    const formData = new FormData()
    formData.set("patientName", name)
    formData.set("patientEmail", email)
    formData.set("patientPhone", phone)

    try {
      await bookAppointment(formData, professionalId, slotId)
      const slot = prismaSlots.find((s) => s.id === slotId)
      if (slot) {
        setConfirmedAt({
          date: format(new Date(slot.startTime), "dd/MM/yyyy"),
          time: format(new Date(slot.startTime), "HH:mm"),
        })
      }
      setStep(4)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : (isSpanish ? "Error al reservar." : "Booking failed."))
    } finally {
      setIsLoading(false)
    }
  }

  const availableSlotsCount = professionalId ? prismaSlots.length : timeSlots.filter(s => s.available).length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 overflow-hidden border shadow-lg bg-card rounded-xl">
        <div className="flex flex-col max-h-[75vh] min-h-0">
          {/* Header Progress */}
          <div className="relative overflow-hidden bg-card px-4 pt-4 pb-4 border-b border-border">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="space-y-0.5">
                <DialogTitle className="text-lg font-bold text-foreground">
                  {isSpanish ? "Agendar Consulta" : "Book Consultation"}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm">
                  {isSpanish 
                    ? `Cita con ${professionalName}` 
                    : `Appointment with ${professionalName}`}
                </DialogDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant="secondary" className="rounded-full px-3 py-1 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border-none font-semibold">
                  {isSpanish ? `Paso ${step} de 4` : `Step ${step} of 4`}
                </Badge>
              </div>
            </div>

            {/* Premium Progress Bar */}
            <div className="flex gap-3 relative z-10">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ 
                      width: step >= s ? "100%" : "0%",
                      backgroundColor: step === s ? "#0d9488" : step > s ? "#14b8a6" : "#f1f5f9"
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="h-full rounded-full"
                  />
                </div>
              ))}
            </div>
            
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="p-4 sm:p-5"
              >
                {/* Step 1: Consultation Type */}
                {step === 1 && (
                  <div className="max-w-md mx-auto space-y-5">
                    {offersInPerson ? (
                      <>
                        <div className="text-center space-y-2">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                            {isSpanish ? "¿Cómo prefieres tu consulta?" : "How would you like to meet?"}
                          </h3>
                          <p className="text-slate-500 dark:text-slate-400">
                            {isSpanish 
                              ? "Selecciona la modalidad que más te acomode." 
                              : "Choose the mode that fits you best."}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                          <motion.button
                            whileHover={{ scale: 1.02, translateY: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setType("online")
                              nextStep()
                            }}
                            className={cn(
                              "relative flex flex-col items-center gap-6 p-8 rounded-[2.5rem] transition-all duration-300 overflow-hidden group",
                              "bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none",
                              "hover:border-teal-500/50 hover:shadow-teal-500/10"
                            )}
                          >
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-colors" />
                            <div className="w-20 h-20 rounded-3xl bg-teal-50 dark:bg-teal-900/40 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:rotate-6 transition-transform duration-500">
                              <Video className="h-10 w-10" />
                            </div>
                            <div className="text-center relative z-10">
                              <p className="font-bold text-xl text-slate-900 dark:text-white">
                                {isSpanish ? "Telemedicina" : "Online Video"}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                {isSpanish ? "Desde la comodidad de tu hogar mediante videollamada." : "Meet from anywhere via secure video call."}
                              </p>
                            </div>
                            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-teal-600 font-semibold text-sm gap-1">
                              {isSpanish ? "Seleccionar" : "Select"} <ChevronRight className="h-4 w-4" />
                            </div>
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.02, translateY: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setType("in-person")
                              nextStep()
                            }}
                            className={cn(
                              "relative flex flex-col items-center gap-6 p-8 rounded-[2.5rem] transition-all duration-300 overflow-hidden group",
                              "bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none",
                              "hover:border-indigo-500/50 hover:shadow-indigo-500/10"
                            )}
                          >
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
                            <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:rotate-6 transition-transform duration-500">
                              <Home className="h-10 w-10" />
                            </div>
                            <div className="text-center relative z-10">
                              <p className="font-bold text-xl text-slate-900 dark:text-white">
                                {isSpanish ? "Presencial" : "In-person"}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                {isSpanish ? "Atención directa en el centro médico o consulta." : "Visit the specialist at their physical location."}
                              </p>
                            </div>
                            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-indigo-600 font-semibold text-sm gap-1">
                              {isSpanish ? "Seleccionar" : "Select"} <ChevronRight className="h-4 w-4" />
                            </div>
                          </motion.button>
                        </div>
                      </>
                    ) : (
                      <div className="animate-in fade-in zoom-in-95 duration-500">
                        <NoPhysicalConsultationDisplay
                          inModal
                          isSpanish={isSpanish}
                          onAgendarTeleconsulta={() => {
                            setType("online")
                            nextStep()
                          }}
                          variant="inline"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Date & Time Selection */}
                {step === 2 && (
                  <div className="space-y-4 max-w-full mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="space-y-1 text-center md:text-left">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          {isSpanish ? "Selecciona Fecha y Hora" : "Select Date & Time"}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                          {isSpanish 
                            ? "Consulta de 60 minutos aproximadamente."
                            : "Approximately 60-minute consultation."}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className={cn(
                          "w-2 h-2 rounded-full animate-pulse",
                          type === "online" ? "bg-teal-500" : "bg-indigo-500"
                        )} />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                          {type === "online" ? (isSpanish ? "Telemedicina" : "Online") : (isSpanish ? "Presencial" : "In-person")}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4">
                      {/* Calendar Section */}
                      <div className="space-y-2">
                        <div className="bg-card rounded-lg p-4 border border-border">
                          {/* Decorative Glow */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-3xl rounded-full transition-all group-hover:bg-teal-500/10" />
                          <div className="relative z-10">
                            {loadingAvailability ? (
                              <div className="h-[340px] flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
                                <p className="text-sm font-medium text-slate-500 animate-pulse">{isSpanish ? "Cargando disponibilidad..." : "Loading availability..."}</p>
                              </div>
                            ) : (
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                disabled={isDateDisabled}
                                className="p-0 border-none w-full"
                                classNames={{
                                  months: "w-full",
                                  month: "w-full space-y-4",
                                  caption: "flex justify-center pt-1 relative items-center mb-4",
                                  caption_label: "text-lg font-black tracking-tight text-slate-900 dark:text-white capitalize",
                                  nav: "space-x-1 flex items-center",
                                  nav_button: "h-9 w-9 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors flex items-center justify-center text-slate-600 dark:text-slate-300",
                                  nav_button_previous: "absolute left-1",
                                  nav_button_next: "absolute right-1",
                                  table: "w-full border-collapse space-y-1",
                                  head_row: "flex w-full justify-between mb-2",
                                  head_cell: "text-slate-400 dark:text-slate-500 font-bold text-[11px] uppercase tracking-widest w-full",
                                  row: "flex w-full mt-2 justify-between",
                                  cell: "relative p-0 text-center focus-within:relative focus-within:z-20 w-12 h-12 flex items-center justify-center",
                                  day: "h-11 w-11 text-sm font-semibold rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300 opacity-90 hover:opacity-100 hover:scale-105 active:scale-95",
                                  day_selected: "bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/30 scale-110 font-bold custom-selected-day",
                                  day_today: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold",
                                  day_outside: "text-slate-300 dark:text-slate-700 opacity-50",
                                  day_disabled: "text-slate-300 dark:text-slate-700 opacity-30 hover:bg-transparent cursor-not-allowed hover:scale-100",
                                  day_hidden: "invisible",
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Time Slots Section */}
                      <div className="flex flex-col min-h-0">
                        <div className="bg-card rounded-lg p-4 border border-border flex flex-col min-h-[200px]">
                          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800/50">
                            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <Clock className="h-5 w-5 text-teal-600" /> 
                              {isSpanish ? "Horas Libres" : "Time Slots"}
                            </h4>
                            {selectedDate && !loadingSlots && (
                              <div className="flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                  {availableSlotsCount > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>}
                                  <span className={cn("relative inline-flex rounded-full h-3 w-3", availableSlotsCount > 0 ? "bg-teal-500" : "bg-slate-300 dark:bg-slate-700")}></span>
                                </span>
                                <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">
                                  {availableSlotsCount} {isSpanish ? "Disponibles" : "Available"}
                                </span>
                              </div>
                            )}
                          </div>

                          {!selectedDate ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4 py-10">
                              <div className="w-20 h-20 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm">
                                <CalendarDays className="h-10 w-10 text-slate-300" />
                              </div>
                              <p className="text-sm font-medium max-w-[180px] text-center text-slate-500">
                                {isSpanish 
                                  ? "Selecciona un día en el calendario"
                                  : "Pick a day on the calendar"}
                              </p>
                            </div>
                          ) : loadingSlots ? (
                            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                              <div className="relative">
                                <div className="absolute inset-0 rounded-full blur-xl bg-teal-500/20 animate-pulse" />
                                <Loader2 className="h-10 w-10 animate-spin text-teal-600 relative z-10" />
                              </div>
                              <p className="text-sm font-bold text-slate-500 animate-pulse">{isSpanish ? "Sincronizando..." : "Syncing..."}</p>
                            </div>
                          ) : (professionalId ? prismaSlots : timeSlots).length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4 py-6">
                              <AlertTriangle className="h-10 w-10 text-amber-500" />
                              <p className="text-sm font-medium text-center text-muted-foreground">
                                {isSpanish ? "Sin disponibilidad. Elige otra fecha." : "No slots. Pick another date."}
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto">
                              {professionalId
                                ? prismaSlots.map((slot) => (
                                    <button
                                      key={slot.id}
                                      type="button"
                                      onClick={() => setSelectedSlotId(slot.id === selectedSlotId ? null : slot.id)}
                                      className={cn(
                                        "py-3 px-3 rounded-lg text-sm font-medium transition-colors",
                                        selectedSlotId === slot.id
                                          ? "bg-teal-600 text-white"
                                          : "bg-muted hover:bg-muted/80 text-foreground"
                                      )}
                                    >
                                      {format(new Date(slot.startTime), "HH:mm")}
                                    </button>
                                  ))
                                : timeSlots.map((slot) => (
                                    <motion.button
                                      key={slot.time}
                                      type="button"
                                      disabled={!slot.available}
                                      onClick={() => slot.available && setSelectedTime(slot.time)}
                                      className={cn(
                                        "py-3 px-3 rounded-lg text-sm font-medium transition-colors",
                                        selectedTime === slot.time ? "bg-teal-600 text-white" : "bg-muted hover:bg-muted/80 text-foreground",
                                        !slot.available && "opacity-50 pointer-events-none"
                                      )}
                                    >
                                      {slot.displayTime}
                                    </motion.button>
                                  ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Resumen y datos de contacto (Prisma) */}
                {step === 3 && (
                  <div className="max-w-md mx-auto space-y-5">
                    <h3 className="text-lg font-bold text-foreground">
                      {isSpanish ? "Resumen y datos de contacto" : "Review & contact details"}
                    </h3>
                    <div className="rounded-lg border border-border bg-card p-4 space-y-2 text-sm">
                      <p><span className="text-muted-foreground">{isSpanish ? "Fecha" : "Date"}:</span> {selectedDate?.toLocaleDateString(isSpanish ? "es-CL" : "en-US", { day: "numeric", month: "long", year: "numeric" })}</p>
                      <p><span className="text-muted-foreground">{isSpanish ? "Hora" : "Time"}:</span>{" "}
                        {professionalId && selectedSlotId
                          ? (() => { const s = prismaSlots.find((x) => x.id === selectedSlotId); return s ? format(new Date(s.startTime), "HH:mm") : ""; })()
                          : selectedTime && formatTimeDisplay(selectedTime)}
                      </p>
                      <p><span className="text-muted-foreground">{isSpanish ? "Especialista" : "Specialist"}:</span> {professionalName}</p>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">{isSpanish ? "Nombre" : "Name"}</Label>
                        <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder={isSpanish ? "Tu nombre" : "Your name"} className="mt-1 bg-background" />
                      </div>
                      <div>
                        <Label className="text-sm">Email</Label>
                        <Input type="email" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} placeholder="email@ejemplo.com" className="mt-1 bg-background" />
                      </div>
                      <div>
                        <Label className="text-sm">{isSpanish ? "Teléfono" : "Phone"}</Label>
                        <Input value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} placeholder="+56 9 1234 5678" className="mt-1 bg-background" />
                      </div>
                    </div>
                    {submitError && (
                      <p className="text-sm text-destructive flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        {submitError}
                      </p>
                    )}
                  </div>
                )}

                {/* Step 4: Final Confirmation */}
                {step === 4 && (
                  <div className="max-w-md mx-auto flex flex-col items-center text-center space-y-8 py-10">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="w-32 h-32 rounded-[2.5rem] bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shadow-xl shadow-emerald-500/10"
                    >
                      <CheckCircle2 className="h-16 w-16 text-emerald-600 dark:text-emerald-400" />
                    </motion.div>
                    
                    <div className="space-y-3">
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                        {isSpanish ? "¡Todo listo!" : "Spot secured!"}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                        {isSpanish 
                          ? `Hemos agendado tu cita con ${professionalName}. Te enviamos los detalles a tu correo electrónico.`
                          : `Successfully scheduled with ${professionalName}. We've sent the details to your email.`}
                      </p>
                    </div>

                    <div className="w-full bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm">
                      <div className="flex justify-between items-center px-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{isSpanish ? "Fecha y Hora" : "Date & Time"}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{confirmedAt?.date} - {confirmedAt?.time}</span>
                      </div>
                      <div className="flex justify-between items-center px-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{isSpanish ? "Referencia" : "Reference"}</span>
                        <span className="font-mono font-bold text-teal-600 bg-teal-50 dark:bg-teal-900/30 px-3 py-1 rounded-lg text-sm">{createdRef || "NUR-4829"}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                      <Button 
                        variant="outline" 
                        className="flex-1 h-14 rounded-2xl bg-transparent border-slate-200 font-bold" 
                        onClick={onClose}
                      >
                        {isSpanish ? "CerrarVentana" : "Close Window"}
                      </Button>
                      <Button 
                        className="flex-1 h-14 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 text-white font-bold" 
                        asChild
                      >
                        <a href="/dashboard/patient/citas">
                          {isSpanish ? "Ver Mis Citas" : "Manage Appointments"}
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Controls */}
          {step < 4 && (
            <div className="px-4 py-4 border-t border-border flex justify-between items-center bg-card">
              <Button 
                variant="ghost" 
                onClick={prevStep} 
                disabled={step === 1 || isLoading} 
                className="rounded-2xl h-12 px-6 font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                {isSpanish ? "Atrás" : "Back"}
              </Button>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={step === 3 ? handleCompleteBooking : nextStep}
                  disabled={
                    (step === 1 && !type) ||
                    (step === 2 && !canConfirmStep2) ||
                    (step === 3 && isLoading) ||
                    isLoading
                  }
                  className={cn(
                    "h-14 px-10 rounded-[1.5rem] font-black text-base shadow-xl transition-all duration-300",
                    "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/20 border-none",
                    "disabled:opacity-50 disabled:grayscale disabled:scale-100"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <div className="flex items-center gap-2">
                      {step === 3 
                        ? (isSpanish ? "Confirmar Pago" : "Pay Now") 
                        : (isSpanish ? "Continuar" : "Continue")}
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
