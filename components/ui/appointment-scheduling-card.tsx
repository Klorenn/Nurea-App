"use client"

import { motion, useReducedMotion, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Video, Home, Star, CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { generateWeekSchedule } from "@/lib/utils/schedule-generator"
import { formatShortDate, parseShortDate } from "@/lib/utils/date-helpers"

interface TimeSlot {
  time: string
  available: boolean
}

interface DaySchedule {
  date: string
  dayName: string
  dayNumber: number
  slots: TimeSlot[]
  hasAvailability: boolean
}

interface Professional {
  id: string
  name: string
  specialty: string
  location?: string
  rating: number
  reviewCount: number
  imageUrl: string
  price: number
  consultationType?: "online" | "in-person" | "both"
  availability?: any
}

interface AppointmentSchedulingProps {
  professional: Professional
  weekSchedule?: DaySchedule[]
  onTimeSlotSelect?: (day: string, time: string) => void
  onWeekChange?: (direction: "prev" | "next") => void
  onConfirm?: (day: string, time: string, type: "online" | "in-person") => void
  enableAnimations?: boolean
  className?: string
}

const defaultWeekSchedule: DaySchedule[] = [
  {
    date: "Ene 15",
    dayName: "Hoy",
    dayNumber: 15,
    hasAvailability: true,
    slots: [
      { time: "10:30", available: true },
      { time: "11:00", available: true },
      { time: "11:30", available: true },
      { time: "12:00", available: true },
      { time: "14:00", available: true },
      { time: "14:30", available: false },
      { time: "15:00", available: true },
      { time: "15:30", available: true },
      { time: "16:00", available: true },
    ],
  },
  {
    date: "Ene 16",
    dayName: "Mañana",
    dayNumber: 16,
    hasAvailability: true,
    slots: [
      { time: "09:00", available: true },
      { time: "10:00", available: true },
      { time: "11:00", available: true },
      { time: "14:00", available: true },
      { time: "15:00", available: true },
    ],
  },
  {
    date: "Ene 17",
    dayName: "Mié",
    dayNumber: 17,
    hasAvailability: true,
    slots: [
      { time: "10:00", available: true },
      { time: "11:00", available: true },
      { time: "12:00", available: true },
      { time: "14:30", available: false },
      { time: "15:00", available: true },
      { time: "16:00", available: true },
    ],
  },
  {
    date: "Ene 18",
    dayName: "Jue",
    dayNumber: 18,
    hasAvailability: false,
    slots: [],
  },
  {
    date: "Ene 19",
    dayName: "Vie",
    dayNumber: 19,
    hasAvailability: true,
    slots: [
      { time: "10:00", available: true },
      { time: "11:00", available: true },
      { time: "14:00", available: true },
    ],
  },
]

export function AppointmentSchedulingCard({
  professional,
  weekSchedule: propWeekSchedule,
  onTimeSlotSelect,
  onWeekChange,
  onConfirm,
  enableAnimations = true,
  className,
}: AppointmentSchedulingProps) {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date())
  const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>(propWeekSchedule || defaultWeekSchedule)
  const [loadingSchedule, setLoadingSchedule] = useState(!propWeekSchedule)
  const [showConfirmationView, setShowConfirmationView] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ day: string; time: string; dayName: string } | null>(null)
  const [selectedType, setSelectedType] = useState<"online" | "in-person">("online")
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const shouldReduceMotion = useReducedMotion()
  const shouldAnimate = enableAnimations && !shouldReduceMotion

  // Cargar horarios reales si no se proporcionaron
  useEffect(() => {
    if (propWeekSchedule) {
      setWeekSchedule(propWeekSchedule)
      return
    }

    const loadSchedule = async () => {
      if (!professional.availability) {
        setLoadingSchedule(false)
        return
      }

      setLoadingSchedule(true)
      try {
        // Obtener citas existentes del profesional para esta semana
        const startDate = new Date(currentWeekStart)
        startDate.setHours(0, 0, 0, 0)
        const endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 7)

        const response = await fetch(
          `/api/professionals/${professional.id}/appointments?dateFrom=${startDate.toISOString().split('T')[0]}&dateTo=${endDate.toISOString().split('T')[0]}`
        )
        
        let existingAppointments: any[] = []
        if (response.ok) {
          const data = await response.json()
          existingAppointments = data.appointments || []
        }

        // Generar horarios reales con soporte para horarios por tipo
        const schedule = generateWeekSchedule(
          professional.availability || {},
          existingAppointments,
          currentWeekStart,
          language,
          undefined, // consultationType - mostrar ambos si es "both"
          professional.consultationType || 'both'
        )

        setWeekSchedule(schedule)
      } catch (error) {
        console.error("Error loading schedule:", error)
        // En caso de error, usar horarios por defecto
        setWeekSchedule(defaultWeekSchedule)
      } finally {
        setLoadingSchedule(false)
      }
    }

    loadSchedule()
  }, [professional.id, professional.availability, currentWeekStart, language, propWeekSchedule])

  // Calcular rango de semana para mostrar
  const weekRange = weekSchedule.length > 0
    ? `${weekSchedule[0].date} - ${weekSchedule[weekSchedule.length - 1].date}`
    : ""

  const handleTimeSlotClick = async (day: string, time: string) => {
    setAvailabilityError(null)
    setCheckingAvailability(true)

    try {
      // Parsear fecha usando helper
      const dateISO = parseShortDate(day, language)

      // Determinar el tipo de consulta para este slot (si está disponible en el slot)
      const slotInfo = weekSchedule
        .find(d => d.date === day)
        ?.slots.find(s => s.time === time)
      const slotType = slotInfo?.type || (professional.consultationType === 'both' ? 'online' : professional.consultationType)
      
      // Verificar disponibilidad en tiempo real con el tipo de consulta
      const response = await fetch(
        `/api/appointments/check-availability?professionalId=${professional.id}&date=${dateISO}&time=${time}&type=${slotType}`
      )
      const data = await response.json()

      if (!response.ok || !data.available) {
        setAvailabilityError(data.message || (language === "es" ? "Este horario no está disponible" : "This time slot is not available"))
        setCheckingAvailability(false)
        return
      }

      const dayInfo = weekSchedule.find((d) => d.date === day)
      setSelectedTimeSlot({
        day,
        time,
        dayName: dayInfo?.dayName || day,
      })
      
      // Si solo hay un tipo de consulta, confirmar directamente
      if (professional.consultationType === "online" || professional.consultationType === "in-person") {
        setSelectedType(professional.consultationType)
        handleConfirmBooking(day, time, professional.consultationType)
      } else {
        setShowConfirmationView(true)
        onTimeSlotSelect?.(day, time)
      }
    } catch (error) {
      console.error("Error checking availability:", error)
      setAvailabilityError(language === "es" ? "Error al verificar disponibilidad" : "Error checking availability")
    } finally {
      setCheckingAvailability(false)
    }
  }

  const handleConfirmBooking = (day?: string, time?: string, type?: "online" | "in-person") => {
    const finalDay = day || selectedTimeSlot?.day
    const finalTime = time || selectedTimeSlot?.time
    const finalType = type || selectedType
    
    if (finalDay && finalTime && finalType) {
      onConfirm?.(finalDay, finalTime, finalType)
    }
    setShowConfirmationView(false)
    setSelectedTimeSlot(null)
  }

  const handleBackToMain = () => {
    setShowConfirmationView(false)
    setSelectedTimeSlot(null)
  }

  const handleWeekNavigation = (direction: "prev" | "next") => {
    const newWeekStart = new Date(currentWeekStart)
    if (direction === "prev") {
      newWeekStart.setDate(newWeekStart.getDate() - 7)
    } else {
      newWeekStart.setDate(newWeekStart.getDate() + 7)
    }
    setCurrentWeekStart(newWeekStart)
    onWeekChange?.(direction)
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

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 28,
      },
    },
  }

  const timeSlotVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
  }

  return (
    <motion.div
      variants={shouldAnimate ? containerVariants : {}}
      initial={shouldAnimate ? "hidden" : "visible"}
      animate="visible"
      className={cn(
        "bg-card rounded-2xl border border-teal-200/30 dark:border-teal-800/30 shadow-lg overflow-hidden max-w-2xl relative",
        className
      )}
    >
      <div className="relative h-auto">
        {/* Main Content */}
        <motion.div
          initial={false}
          animate={{
            y: showConfirmationView ? "-20px" : "0px",
            opacity: showConfirmationView ? 0.3 : 1,
            scale: showConfirmationView ? 0.95 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          className="w-full"
        >
          {/* Professional Profile Header */}
          <motion.div variants={shouldAnimate ? itemVariants : {}} className="p-6 pb-4">
            <div className="flex items-start gap-4">
              <motion.div
                whileHover={shouldAnimate ? { scale: 1.05 } : {}}
                className="flex-shrink-0"
              >
                <img
                  src={professional.imageUrl}
                  alt={professional.name}
                  className="w-16 h-16 rounded-xl object-cover ring-2 ring-teal-200 dark:ring-teal-800"
                />
              </motion.div>

              <div className="flex-1 min-w-0 space-y-2">
                <h2 className="text-xl font-bold text-foreground">{professional.name}</h2>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span className="font-medium">{professional.rating}</span>
                    <span className="text-muted-foreground">({professional.reviewCount})</span>
                  </div>
                  <span>•</span>
                  <span className="text-teal-600 dark:text-teal-400 font-medium">{professional.specialty}</span>
                </div>

                {professional.location && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>{professional.location}</span>
                  </div>
                )}
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  {language === "es" ? "Por Consulta" : "Per Session"}
                </p>
                <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                  ${professional.price.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Separator */}
          <motion.div variants={shouldAnimate ? itemVariants : {}} className="mx-6 border-t border-teal-200/20 dark:border-teal-800/20" />

          {/* Week Navigation */}
          <motion.div variants={shouldAnimate ? itemVariants : {}} className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <motion.button
                whileHover={shouldAnimate ? { scale: 1.05 } : {}}
                whileTap={shouldAnimate ? { scale: 0.95 } : {}}
                onClick={() => handleWeekNavigation("prev")}
                className="p-2 hover:bg-teal-50 dark:hover:bg-teal-950/20 rounded-lg transition-colors text-teal-600 dark:text-teal-400"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>

              <h3 className="font-semibold text-foreground">{weekRange}</h3>

              <motion.button
                whileHover={shouldAnimate ? { scale: 1.05 } : {}}
                whileTap={shouldAnimate ? { scale: 0.95 } : {}}
                onClick={() => handleWeekNavigation("next")}
                className="p-2 hover:bg-teal-50 dark:hover:bg-teal-950/20 rounded-lg transition-colors text-teal-600 dark:text-teal-400"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>

          {/* Loading State */}
          {loadingSchedule && (
            <motion.div variants={shouldAnimate ? itemVariants : {}} className="px-6 pb-6 flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-teal-600 dark:text-teal-400" />
              <span className="ml-2 text-sm text-muted-foreground">
                {language === "es" ? "Cargando horarios..." : "Loading schedule..."}
              </span>
            </motion.div>
          )}

          {/* Availability Error */}
          {availabilityError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-6 mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm"
            >
              {availabilityError}
            </motion.div>
          )}

          {/* Daily Schedule */}
          {!loadingSchedule && (
            <motion.div variants={shouldAnimate ? itemVariants : {}} className="px-6 pb-6 space-y-4">
              {weekSchedule.map((day) => (
              <motion.div key={day.date} variants={shouldAnimate ? itemVariants : {}} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">
                    {day.dayName}, {day.date}
                  </h4>
                  {!day.hasAvailability && (
                    <span className="text-sm text-muted-foreground">
                      {language === "es" ? "Sin disponibilidad" : "No Availability"}
                    </span>
                  )}
                </div>

                {day.hasAvailability && (
                  <motion.div
                    variants={shouldAnimate ? containerVariants : {}}
                    className="flex flex-wrap gap-2"
                  >
                    {day.slots.map((slot) => {
                      // Mostrar ícono solo si el profesional ofrece "both" y el slot tiene tipo definido
                      const showTypeIcon = professional.consultationType === 'both' && slot.type
                      const IconComponent = slot.type === 'online' ? Video : slot.type === 'in-person' ? Home : null
                      
                      return (
                        <motion.button
                          key={`${day.date}-${slot.time}`}
                          variants={shouldAnimate ? timeSlotVariants : {}}
                          whileHover={shouldAnimate && slot.available ? { scale: 1.05, y: -2 } : {}}
                          whileTap={shouldAnimate && slot.available ? { scale: 0.98 } : {}}
                          onClick={() => slot.available && !checkingAvailability && handleTimeSlotClick(day.date, slot.time)}
                          disabled={!slot.available || checkingAvailability}
                          className={cn(
                            "px-3 py-1.5 text-sm rounded-lg border transition-colors flex items-center gap-1.5",
                            slot.available
                              ? "bg-background border-teal-200/50 dark:border-teal-800/50 hover:border-teal-400 dark:hover:border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/20 text-foreground cursor-pointer"
                              : "bg-muted/50 border-border/30 text-muted-foreground cursor-not-allowed opacity-60"
                          )}
                          title={showTypeIcon ? (slot.type === 'online' ? (language === "es" ? "Online" : "Online") : (language === "es" ? "Presencial" : "In-Person")) : undefined}
                        >
                          {showTypeIcon && IconComponent && (
                            <IconComponent className="h-3 w-3" />
                          )}
                          {slot.time}
                        </motion.button>
                      )
                    })}
                  </motion.div>
                )}
              </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Confirmation View */}
        <AnimatePresence>
          {showConfirmationView && (
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="absolute top-0 left-0 w-full h-full bg-card rounded-2xl"
            >
              <div className="p-6 space-y-6 h-full flex flex-col">
                <div className="flex items-center justify-between">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBackToMain}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {language === "es" ? "Volver" : "Back"}
                    </span>
                  </motion.button>
                  <h3 className="text-lg font-semibold text-foreground">
                    {language === "es" ? "Confirmar tu cita" : "Confirm Appointment"}
                  </h3>
                  <div></div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-teal-50/50 dark:bg-teal-950/20 rounded-xl">
                  <img
                    src={professional.imageUrl}
                    alt={professional.name}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-teal-200 dark:ring-teal-800"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground">{professional.name}</h4>
                    <p className="text-sm text-muted-foreground">{professional.specialty}</p>
                  </div>
                </div>

                {selectedTimeSlot && (
                  <div className="space-y-4 flex-1">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        {language === "es" ? "Tu cita" : "Your Appointment"}
                      </p>
                      <div className="bg-teal-50 dark:bg-teal-950/20 border border-teal-200/50 dark:border-teal-800/50 rounded-xl p-4">
                        <p className="text-lg font-semibold text-foreground">
                          {selectedTimeSlot.dayName}, {selectedTimeSlot.day}
                        </p>
                        <p className="text-xl font-bold text-teal-600 dark:text-teal-400">
                          {selectedTimeSlot.time}
                        </p>
                      </div>
                    </div>

                    {/* Consultation Type Selection */}
                    {(professional.consultationType === "both" || !professional.consultationType) && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">
                          {language === "es" ? "¿Cómo prefieres tu consulta?" : "How would you like your consultation?"}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setSelectedType("online")}
                            className={cn(
                              "p-3 rounded-lg border transition-all",
                              selectedType === "online"
                                ? "border-teal-600 dark:border-teal-400 bg-teal-50 dark:bg-teal-950/20"
                                : "border-border hover:border-teal-200 dark:hover:border-teal-800"
                            )}
                          >
                            <Video className="w-5 h-5 mx-auto mb-1 text-teal-600 dark:text-teal-400" />
                            <span className="text-sm font-medium">
                              {language === "es" ? "Online" : "Online"}
                            </span>
                          </button>
                          <button
                            onClick={() => setSelectedType("in-person")}
                            className={cn(
                              "p-3 rounded-lg border transition-all",
                              selectedType === "in-person"
                                ? "border-teal-600 dark:border-teal-400 bg-teal-50 dark:bg-teal-950/20"
                                : "border-border hover:border-teal-200 dark:hover:border-teal-800"
                            )}
                          >
                            <MapPin className="w-5 h-5 mx-auto mb-1 text-teal-600 dark:text-teal-400" />
                            <span className="text-sm font-medium">
                              {language === "es" ? "Presencial" : "In-person"}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground">
                          {language === "es" ? "Duración:" : "Duration:"}
                        </span>
                        <span className="text-foreground font-medium">
                          {language === "es" ? "60 minutos" : "60 minutes"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground">
                          {language === "es" ? "Precio:" : "Price:"}
                        </span>
                        <span className="text-foreground font-bold text-teal-600 dark:text-teal-400">
                          ${professional.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => handleConfirmBooking()}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {language === "es" ? "Confirmar cita" : "Confirm Appointment"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

