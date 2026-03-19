"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Clock,
  Save,
  Loader2,
  CheckCircle2,
  Calendar,
  Info,
  AlertCircle,
  MessageSquare,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface DaySchedule {
  enabled: boolean
  startTime: string
  endTime: string
  slotDuration: number
}

interface WeeklySchedule {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

const DAYS_OF_WEEK = [
  { key: "monday", labelEs: "Lunes", labelEn: "Monday" },
  { key: "tuesday", labelEs: "Martes", labelEn: "Tuesday" },
  { key: "wednesday", labelEs: "Miércoles", labelEn: "Wednesday" },
  { key: "thursday", labelEs: "Jueves", labelEn: "Thursday" },
  { key: "friday", labelEs: "Viernes", labelEn: "Friday" },
  { key: "saturday", labelEs: "Sábado", labelEn: "Saturday" },
  { key: "sunday", labelEs: "Domingo", labelEn: "Sunday" },
] as const

const SLOT_DURATIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "60 min" },
]

const DEFAULT_SCHEDULE: DaySchedule = {
  enabled: false,
  startTime: "09:00",
  endTime: "18:00",
  slotDuration: 60,
}

const getDefaultWeeklySchedule = (): WeeklySchedule => ({
  monday: { ...DEFAULT_SCHEDULE, enabled: true },
  tuesday: { ...DEFAULT_SCHEDULE, enabled: true },
  wednesday: { ...DEFAULT_SCHEDULE, enabled: true },
  thursday: { ...DEFAULT_SCHEDULE, enabled: true },
  friday: { ...DEFAULT_SCHEDULE, enabled: true },
  saturday: { ...DEFAULT_SCHEDULE },
  sunday: { ...DEFAULT_SCHEDULE },
})

export default function AvailabilityPage() {
  const { language } = useLanguage()
  const { user } = useAuth()
  const supabase = createClient()
  const isSpanish = language === "es"

  const [schedule, setSchedule] = useState<WeeklySchedule>(getDefaultWeeklySchedule())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalSchedule, setOriginalSchedule] = useState<WeeklySchedule | null>(null)
  const [bookingAutoMessage, setBookingAutoMessage] = useState("")
  const [bookingMessageSaving, setBookingMessageSaving] = useState(false)
  const [bookingMessageLoaded, setBookingMessageLoaded] = useState(false)

  // Load existing schedule
  useEffect(() => {
    const loadSchedule = async () => {
      if (!user?.id) return

      try {
        const { data: professional, error } = await supabase
          .from("professionals")
          .select("availability")
          .eq("id", user.id)
          .single()

        if (error) {
          console.error("Error loading schedule:", error)
          return
        }

        if (professional?.availability && Object.keys(professional.availability).length > 0) {
          // Parse the stored availability format
          const storedAvailability = professional.availability as Record<string, any>
          const parsedSchedule = getDefaultWeeklySchedule()

          DAYS_OF_WEEK.forEach(({ key }) => {
            const dayData = storedAvailability[key]
            if (dayData) {
              // Handle both old format (simple) and new format (with online/in-person)
              if (dayData.online || dayData['in-person']) {
                // New format
                const onlineData = dayData.online || dayData['in-person']
                parsedSchedule[key as keyof WeeklySchedule] = {
                  enabled: onlineData?.available || false,
                  startTime: onlineData?.hours?.split(' - ')[0] || "09:00",
                  endTime: onlineData?.hours?.split(' - ')[1] || "18:00",
                  slotDuration: dayData.slotDuration || 60,
                }
              } else if (dayData.available !== undefined) {
                // Legacy format
                parsedSchedule[key as keyof WeeklySchedule] = {
                  enabled: dayData.available || false,
                  startTime: dayData.hours?.split(' - ')[0] || dayData.startTime || "09:00",
                  endTime: dayData.hours?.split(' - ')[1] || dayData.endTime || "18:00",
                  slotDuration: dayData.slotDuration || 60,
                }
              }
            }
          })

          setSchedule(parsedSchedule)
          setOriginalSchedule(parsedSchedule)
        } else {
          setOriginalSchedule(getDefaultWeeklySchedule())
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSchedule()
  }, [user?.id, supabase])

  // Load booking auto-message (Prisma)
  useEffect(() => {
    const loadBookingMessage = async () => {
      try {
        const res = await fetch("/api/professional/booking-settings")
        if (res.ok) {
          const data = await res.json()
          setBookingAutoMessage(data.bookingAutoMessage ?? "")
        }
      } catch {
        // ignore
      } finally {
        setBookingMessageLoaded(true)
      }
    }
    if (user?.id) loadBookingMessage()
  }, [user?.id])

  // Check for changes
  useEffect(() => {
    if (!originalSchedule) return
    const hasChanges = JSON.stringify(schedule) !== JSON.stringify(originalSchedule)
    setHasChanges(hasChanges)
  }, [schedule, originalSchedule])

  const updateDaySchedule = (day: keyof WeeklySchedule, field: keyof DaySchedule, value: any) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }))
  }

  const handleSave = async () => {
    if (!user?.id) return

    setSaving(true)

    try {
      // Convert to storage format
      const availability: Record<string, any> = {}

      DAYS_OF_WEEK.forEach(({ key }) => {
        const daySchedule = schedule[key as keyof WeeklySchedule]
        availability[key] = {
          online: {
            available: daySchedule.enabled,
            hours: daySchedule.enabled ? `${daySchedule.startTime} - ${daySchedule.endTime}` : null,
          },
          'in-person': {
            available: daySchedule.enabled,
            hours: daySchedule.enabled ? `${daySchedule.startTime} - ${daySchedule.endTime}` : null,
          },
          slotDuration: daySchedule.slotDuration,
        }
      })

      const { error } = await supabase
        .from("professionals")
        .update({
          availability,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      setOriginalSchedule(schedule)
      setHasChanges(false)

      toast.success(
        isSpanish 
          ? "¡Disponibilidad guardada exitosamente!" 
          : "Availability saved successfully!",
        {
          icon: <CheckCircle2 className="h-5 w-5 text-teal-500" />,
        }
      )
    } catch (error) {
      console.error("Error saving schedule:", error)
      toast.error(
        isSpanish 
          ? "Error al guardar. Intenta nuevamente." 
          : "Error saving. Please try again."
      )
    } finally {
      setSaving(false)
    }
  }

  const handleSaveBookingMessage = async () => {
    setBookingMessageSaving(true)
    try {
      const res = await fetch("/api/professional/booking-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingAutoMessage: bookingAutoMessage.trim() || null }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setBookingAutoMessage(data.bookingAutoMessage ?? "")
      toast.success(isSpanish ? "Mensaje guardado" : "Message saved")
    } catch {
      toast.error(isSpanish ? "Error al guardar" : "Error saving")
    } finally {
      setBookingMessageSaving(false)
    }
  }

  const enabledDaysCount = Object.values(schedule).filter(day => day.enabled).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 text-teal-600 animate-spin mx-auto" />
          <p className="text-sm text-slate-500">
            {isSpanish ? "Cargando horarios..." : "Loading schedule..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {isSpanish ? "Gestionar Disponibilidad" : "Manage Availability"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {isSpanish 
                ? "Configura tus horarios de atención semanales"
                : "Set up your weekly schedule"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Mensaje automático al agendar */}
      {bookingMessageLoaded && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-slate-200/60 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-teal-600" />
                {isSpanish ? "Mensaje automático al agendar" : "Auto-message when patient books"}
              </CardTitle>
              <CardDescription>
                {isSpanish
                  ? "Este mensaje se envía al paciente por chat cuando confirma una cita. Puedes indicar cómo coordinar el pago (transferencia, bono, etc.)."
                  : "This message is sent to the patient via chat when they confirm an appointment. You can explain how to coordinate payment."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={bookingAutoMessage}
                onChange={(e) => setBookingAutoMessage(e.target.value)}
                placeholder={
                  isSpanish
                    ? "Ej: Hola, gracias por agendar conmigo. El pago de la consulta se coordina directamente por este chat (transferencia, bono u otro medio que acordemos)."
                    : "E.g. Hello, thanks for booking. Payment is coordinated directly via this chat (transfer, voucher, etc.)."
                }
                className="min-h-[120px] resize-y"
                maxLength={500}
              />
              <Button
                onClick={handleSaveBookingMessage}
                disabled={bookingMessageSaving}
                variant="secondary"
                size="sm"
              >
                {bookingMessageSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isSpanish ? "Guardar mensaje" : "Save message"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Summary Alert */}
      <Alert className="border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/30">
        <Info className="h-4 w-4 text-teal-600" />
        <AlertDescription className="text-teal-700 dark:text-teal-300">
          {isSpanish 
            ? `Tienes ${enabledDaysCount} día${enabledDaysCount !== 1 ? 's' : ''} de atención configurado${enabledDaysCount !== 1 ? 's' : ''}.`
            : `You have ${enabledDaysCount} day${enabledDaysCount !== 1 ? 's' : ''} configured for appointments.`}
        </AlertDescription>
      </Alert>

      {/* Days Grid */}
      <div className="space-y-4">
        {DAYS_OF_WEEK.map(({ key, labelEs, labelEn }, index) => {
          const daySchedule = schedule[key as keyof WeeklySchedule]
          const isWeekend = key === "saturday" || key === "sunday"

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={cn(
                "border-slate-200/60 dark:border-slate-800 transition-all duration-300",
                daySchedule.enabled 
                  ? "shadow-md border-teal-200 dark:border-teal-800/50" 
                  : "opacity-60",
                isWeekend && !daySchedule.enabled && "bg-slate-50 dark:bg-slate-900/50"
              )}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Day Toggle */}
                    <div className="flex items-center justify-between sm:justify-start gap-4 min-w-[180px]">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={daySchedule.enabled}
                          onCheckedChange={(checked) => updateDaySchedule(key as keyof WeeklySchedule, "enabled", checked)}
                          className="data-[state=checked]:bg-teal-600"
                        />
                        <Label className={cn(
                          "font-semibold text-base",
                          daySchedule.enabled 
                            ? "text-slate-900 dark:text-white" 
                            : "text-slate-400 dark:text-slate-500"
                        )}>
                          {isSpanish ? labelEs : labelEn}
                        </Label>
                      </div>
                      {isWeekend && !daySchedule.enabled && (
                        <span className="text-xs text-slate-400 sm:hidden">
                          {isSpanish ? "Fin de semana" : "Weekend"}
                        </span>
                      )}
                    </div>

                    {/* Time Inputs */}
                    <div className={cn(
                      "flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4",
                      !daySchedule.enabled && "pointer-events-none"
                    )}>
                      {/* Start Time */}
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-500 dark:text-slate-400">
                          {isSpanish ? "Hora inicio" : "Start time"}
                        </Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            type="time"
                            value={daySchedule.startTime}
                            onChange={(e) => updateDaySchedule(key as keyof WeeklySchedule, "startTime", e.target.value)}
                            disabled={!daySchedule.enabled}
                            className={cn(
                              "pl-10 h-11 bg-white dark:bg-slate-900",
                              !daySchedule.enabled && "opacity-50"
                            )}
                          />
                        </div>
                      </div>

                      {/* End Time */}
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-500 dark:text-slate-400">
                          {isSpanish ? "Hora fin" : "End time"}
                        </Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            type="time"
                            value={daySchedule.endTime}
                            onChange={(e) => updateDaySchedule(key as keyof WeeklySchedule, "endTime", e.target.value)}
                            disabled={!daySchedule.enabled}
                            className={cn(
                              "pl-10 h-11 bg-white dark:bg-slate-900",
                              !daySchedule.enabled && "opacity-50"
                            )}
                          />
                        </div>
                      </div>

                      {/* Slot Duration */}
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-500 dark:text-slate-400">
                          {isSpanish ? "Duración sesión" : "Session duration"}
                        </Label>
                        <Select
                          value={String(daySchedule.slotDuration)}
                          onValueChange={(value) => updateDaySchedule(key as keyof WeeklySchedule, "slotDuration", Number(value))}
                          disabled={!daySchedule.enabled}
                        >
                          <SelectTrigger className={cn(
                            "h-11 bg-white dark:bg-slate-900",
                            !daySchedule.enabled && "opacity-50"
                          )}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SLOT_DURATIONS.map((duration) => (
                              <SelectItem key={duration.value} value={String(duration.value)}>
                                {duration.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Slots Preview */}
                    {daySchedule.enabled && (
                      <div className="hidden lg:flex items-center justify-center min-w-[100px]">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                            {calculateSlots(daySchedule.startTime, daySchedule.endTime, daySchedule.slotDuration)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {isSpanish ? "citas" : "slots"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="sticky bottom-4 sm:bottom-8"
      >
        <Card className={cn(
          "border-slate-200/60 dark:border-slate-800 shadow-xl",
          hasChanges && "border-teal-300 dark:border-teal-700"
        )}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {hasChanges ? (
                  <>
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {isSpanish 
                        ? "Tienes cambios sin guardar"
                        : "You have unsaved changes"}
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-teal-500" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {isSpanish 
                        ? "Todos los cambios guardados"
                        : "All changes saved"}
                    </span>
                  </>
                )}
              </div>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className={cn(
                  "w-full sm:w-auto min-w-[180px] h-12 font-semibold rounded-xl",
                  "bg-gradient-to-r from-teal-600 to-emerald-600",
                  "hover:from-teal-700 hover:to-emerald-700",
                  "shadow-lg shadow-teal-500/20",
                  "disabled:opacity-50"
                )}
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {isSpanish ? "Guardando..." : "Saving..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-5 w-5" />
                    {isSpanish ? "Guardar Cambios" : "Save Changes"}
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function calculateSlots(startTime: string, endTime: string, duration: number): number {
  const [startHour, startMin] = startTime.split(":").map(Number)
  const [endHour, endMin] = endTime.split(":").map(Number)
  
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  
  if (endMinutes <= startMinutes) return 0
  
  return Math.floor((endMinutes - startMinutes) / duration)
}
