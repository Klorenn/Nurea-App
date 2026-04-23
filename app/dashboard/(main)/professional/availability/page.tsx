"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Clock,
  Save,
  Loader2,
  CheckCircle2,
  Calendar,
  AlertCircle,
  MessageSquare,
  ChevronRight,
} from "lucide-react"
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
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { loadingDashboardInsetClassName } from "@/lib/loading-layout"

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
  { key: "monday",    labelEs: "Lunes",      labelEn: "Monday",    isWeekend: false },
  { key: "tuesday",   labelEs: "Martes",     labelEn: "Tuesday",   isWeekend: false },
  { key: "wednesday", labelEs: "Miércoles",  labelEn: "Wednesday", isWeekend: false },
  { key: "thursday",  labelEs: "Jueves",     labelEn: "Thursday",  isWeekend: false },
  { key: "friday",    labelEs: "Viernes",    labelEn: "Friday",    isWeekend: false },
  { key: "saturday",  labelEs: "Sábado",     labelEn: "Saturday",  isWeekend: true  },
  { key: "sunday",    labelEs: "Domingo",    labelEn: "Sunday",    isWeekend: true  },
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
  monday:    { ...DEFAULT_SCHEDULE, enabled: true },
  tuesday:   { ...DEFAULT_SCHEDULE, enabled: true },
  wednesday: { ...DEFAULT_SCHEDULE, enabled: true },
  thursday:  { ...DEFAULT_SCHEDULE, enabled: true },
  friday:    { ...DEFAULT_SCHEDULE, enabled: true },
  saturday:  { ...DEFAULT_SCHEDULE },
  sunday:    { ...DEFAULT_SCHEDULE },
})

function calculateSlots(startTime: string, endTime: string, duration: number): number {
  const [startHour, startMin] = startTime.split(":").map(Number)
  const [endHour, endMin] = endTime.split(":").map(Number)
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  if (endMinutes <= startMinutes) return 0
  return Math.floor((endMinutes - startMinutes) / duration)
}

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
  const [originalMessage, setOriginalMessage] = useState("")
  const [messageLoaded, setMessageLoaded] = useState(false)
  const [messageTouched, setMessageTouched] = useState(false)
  const [showMessageError, setShowMessageError] = useState(false)

  // Load schedule
  useEffect(() => {
    const loadSchedule = async () => {
      if (!user?.id) return
      try {
        const { data: professional, error } = await supabase
          .from("professionals")
          .select("availability")
          .eq("id", user.id)
          .single()

        if (error) { console.error("Error loading schedule:", error); return }

        if (professional?.availability && Object.keys(professional.availability).length > 0) {
          const storedAvailability = professional.availability as Record<string, any>
          const parsedSchedule = getDefaultWeeklySchedule()

          DAYS_OF_WEEK.forEach(({ key }) => {
            const dayData = storedAvailability[key]
            if (dayData) {
              if (dayData.online || dayData["in-person"]) {
                const onlineData = dayData.online || dayData["in-person"]
                parsedSchedule[key as keyof WeeklySchedule] = {
                  enabled: onlineData?.available || false,
                  startTime: onlineData?.hours?.split(" - ")[0] || "09:00",
                  endTime: onlineData?.hours?.split(" - ")[1] || "18:00",
                  slotDuration: dayData.slotDuration || 60,
                }
              } else if (dayData.available !== undefined) {
                parsedSchedule[key as keyof WeeklySchedule] = {
                  enabled: dayData.available || false,
                  startTime: dayData.hours?.split(" - ")[0] || dayData.startTime || "09:00",
                  endTime: dayData.hours?.split(" - ")[1] || dayData.endTime || "18:00",
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
  }, [user?.id])

  // Load booking message
  useEffect(() => {
    const loadBookingMessage = async () => {
      try {
        const res = await fetch("/api/professional/booking-settings")
        if (res.ok) {
          const data = await res.json()
          const msg = data.bookingAutoMessage ?? ""
          setBookingAutoMessage(msg)
          setOriginalMessage(msg)
        }
      } catch { /* ignore */ }
      finally { setMessageLoaded(true) }
    }
    if (user?.id) loadBookingMessage()
  }, [user?.id])

  // Track changes
  useEffect(() => {
    if (!originalSchedule) return
    const scheduleChanged = JSON.stringify(schedule) !== JSON.stringify(originalSchedule)
    const messageChanged = bookingAutoMessage !== originalMessage
    setHasChanges(scheduleChanged || messageChanged)
  }, [schedule, originalSchedule, bookingAutoMessage, originalMessage])

  const updateDaySchedule = (day: keyof WeeklySchedule, field: keyof DaySchedule, value: any) => {
    setSchedule(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }))
  }

  const handleSave = async () => {
    if (!user?.id) return

    // Validate: message is required
    if (!bookingAutoMessage.trim()) {
      setShowMessageError(true)
      setMessageTouched(true)
      toast.error(isSpanish ? "El mensaje automático es obligatorio." : "Auto-message is required.")
      document.getElementById("booking-message-field")?.focus()
      return
    }

    setSaving(true)
    try {
      // Build availability object
      const availability: Record<string, any> = {}
      DAYS_OF_WEEK.forEach(({ key }) => {
        const daySchedule = schedule[key as keyof WeeklySchedule]
        availability[key] = {
          online: {
            available: daySchedule.enabled,
            hours: daySchedule.enabled ? `${daySchedule.startTime} - ${daySchedule.endTime}` : null,
          },
          "in-person": {
            available: daySchedule.enabled,
            hours: daySchedule.enabled ? `${daySchedule.startTime} - ${daySchedule.endTime}` : null,
          },
          slotDuration: daySchedule.slotDuration,
        }
      })

      // Save both in parallel
      const [scheduleResult, messageResult] = await Promise.all([
        supabase
          .from("professionals")
          .update({ availability, updated_at: new Date().toISOString() })
          .eq("id", user.id),
        fetch("/api/professional/booking-settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingAutoMessage: bookingAutoMessage.trim() || null }),
        }),
      ])

      if (scheduleResult.error) throw scheduleResult.error
      if (!messageResult.ok) throw new Error("message save failed")

      const msgData = await messageResult.json()
      setOriginalSchedule(schedule)
      setOriginalMessage(msgData.bookingAutoMessage ?? bookingAutoMessage)
      setBookingAutoMessage(msgData.bookingAutoMessage ?? bookingAutoMessage)
      setHasChanges(false)
      setShowMessageError(false)

      toast.success(isSpanish ? "¡Configuración guardada!" : "Configuration saved!", {
        icon: <CheckCircle2 className="h-5 w-5 text-teal-500" />,
      })
    } catch (error) {
      console.error("Error saving:", error)
      toast.error(isSpanish ? "Error al guardar. Intenta nuevamente." : "Error saving. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const enabledDaysCount = Object.values(schedule).filter(d => d.enabled).length
  const totalSlotsPerWeek = DAYS_OF_WEEK.reduce((acc, { key }) => {
    const d = schedule[key as keyof WeeklySchedule]
    return acc + (d.enabled ? calculateSlots(d.startTime, d.endTime, d.slotDuration) : 0)
  }, 0)

  const isMessageMissing = showMessageError && !bookingAutoMessage.trim()

  if (loading || !messageLoaded) {
    return (
      <div className={loadingDashboardInsetClassName("bg-background")}>
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 text-teal-600 animate-spin mx-auto" />
          <p className="text-sm text-slate-500">{isSpanish ? "Cargando configuración..." : "Loading configuration..."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-5">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-md shadow-teal-500/25 shrink-0">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {isSpanish ? "Disponibilidad" : "Availability"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isSpanish ? "Horarios de atención y mensaje de bienvenida" : "Schedule and welcome message"}
            </p>
          </div>
        </div>

        {/* Stats pills */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 rounded-lg px-3 py-1.5 text-xs font-medium">
            <Calendar className="h-3.5 w-3.5" />
            {enabledDaysCount} {isSpanish ? "días" : "days"}
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg px-3 py-1.5 text-xs font-medium">
            <Clock className="h-3.5 w-3.5" />
            {totalSlotsPerWeek} {isSpanish ? "citas/sem." : "slots/wk"}
          </div>
        </div>
      </motion.div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">

        {/* ── LEFT: Schedule ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
        >
          {/* Card header */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-teal-600" />
              <span className="text-sm font-semibold text-slate-800 dark:text-white">
                {isSpanish ? "Horario semanal" : "Weekly schedule"}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              {isSpanish ? "Activa los días que atiendes" : "Toggle the days you work"}
            </span>
          </div>

          {/* Column labels */}
          <div className="hidden sm:grid grid-cols-[140px_1fr_1fr_120px_64px] gap-3 px-5 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">{isSpanish ? "Día" : "Day"}</span>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">{isSpanish ? "Entrada" : "Start"}</span>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">{isSpanish ? "Salida" : "End"}</span>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">{isSpanish ? "Duración" : "Duration"}</span>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide text-center">{isSpanish ? "Citas" : "Slots"}</span>
          </div>

          {/* Day rows */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {DAYS_OF_WEEK.map(({ key, labelEs, labelEn, isWeekend }, index) => {
              const day = schedule[key as keyof WeeklySchedule]
              const slots = day.enabled ? calculateSlots(day.startTime, day.endTime, day.slotDuration) : 0

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + index * 0.04 }}
                  className={cn(
                    "flex flex-col sm:grid sm:grid-cols-[140px_1fr_1fr_120px_64px] gap-3 px-5 py-3 transition-colors",
                    day.enabled
                      ? "bg-white dark:bg-slate-900"
                      : "bg-slate-50/70 dark:bg-slate-900/30",
                    isWeekend && !day.enabled && "opacity-60"
                  )}
                >
                  {/* Toggle + label */}
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={day.enabled}
                      onCheckedChange={(checked) => updateDaySchedule(key as keyof WeeklySchedule, "enabled", checked)}
                      className="data-[state=checked]:bg-teal-600 shrink-0"
                    />
                    <span className={cn(
                      "text-sm font-semibold w-24",
                      day.enabled ? "text-slate-800 dark:text-white" : "text-slate-400 dark:text-slate-500"
                    )}>
                      {isSpanish ? labelEs : labelEn}
                    </span>
                  </div>

                  {/* Time inputs — disabled when day is off */}
                  <div className={cn("contents", !day.enabled && "pointer-events-none")}>
                    {/* Start */}
                    <div className="relative">
                      <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      <Input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => updateDaySchedule(key as keyof WeeklySchedule, "startTime", e.target.value)}
                        disabled={!day.enabled}
                        className={cn(
                          "pl-8 h-9 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700",
                          !day.enabled && "opacity-40"
                        )}
                      />
                    </div>

                    {/* End */}
                    <div className="relative">
                      <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      <Input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => updateDaySchedule(key as keyof WeeklySchedule, "endTime", e.target.value)}
                        disabled={!day.enabled}
                        className={cn(
                          "pl-8 h-9 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700",
                          !day.enabled && "opacity-40"
                        )}
                      />
                    </div>

                    {/* Duration */}
                    <Select
                      value={String(day.slotDuration)}
                      onValueChange={(v) => updateDaySchedule(key as keyof WeeklySchedule, "slotDuration", Number(v))}
                      disabled={!day.enabled}
                    >
                      <SelectTrigger className={cn(
                        "h-9 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700",
                        !day.enabled && "opacity-40"
                      )}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SLOT_DURATIONS.map((d) => (
                          <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Slots count */}
                  <div className="flex items-center justify-center">
                    {day.enabled ? (
                      <div className="text-center">
                        <span className="text-lg font-bold text-teal-600 dark:text-teal-400 leading-none">{slots}</span>
                        <span className="block text-[10px] text-slate-400 leading-none mt-0.5">
                          {isSpanish ? "citas" : "slots"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* ── RIGHT: Message + Save ── */}
        <div className="space-y-4">

          {/* Auto-message card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={cn(
              "rounded-2xl border bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-colors",
              isMessageMissing
                ? "border-red-300 dark:border-red-700 shadow-red-100 dark:shadow-red-900/20"
                : "border-slate-200 dark:border-slate-800"
            )}
          >
            <div className={cn(
              "px-5 py-4 border-b",
              isMessageMissing
                ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20"
                : "border-slate-100 dark:border-slate-800"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className={cn(
                    "h-4 w-4",
                    isMessageMissing ? "text-red-500" : "text-teal-600"
                  )} />
                  <span className="text-sm font-semibold text-slate-800 dark:text-white">
                    {isSpanish ? "Mensaje al agendar" : "Booking message"}
                  </span>
                </div>
                <span className={cn(
                  "text-[11px] font-semibold px-2 py-0.5 rounded-full",
                  isMessageMissing
                    ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                    : "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                )}>
                  {isSpanish ? "Obligatorio" : "Required"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                {isSpanish
                  ? "Se envía automáticamente al paciente cuando confirma una cita."
                  : "Sent automatically to the patient when they confirm a booking."}
              </p>
            </div>

            <div className="p-5 space-y-2">
              <Textarea
                id="booking-message-field"
                value={bookingAutoMessage}
                onChange={(e) => {
                  setBookingAutoMessage(e.target.value)
                  setMessageTouched(true)
                  if (e.target.value.trim()) setShowMessageError(false)
                }}
                placeholder={
                  isSpanish
                    ? "Ej: Hola, gracias por agendar. El pago se coordina por este chat..."
                    : "E.g. Hello, thanks for booking. Payment is coordinated via this chat..."
                }
                className={cn(
                  "min-h-[140px] resize-none text-sm leading-relaxed bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
                  isMessageMissing && "border-red-300 dark:border-red-700 focus-visible:ring-red-400"
                )}
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                {isMessageMissing ? (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {isSpanish ? "Este campo es obligatorio" : "This field is required"}
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-xs text-slate-400 ml-auto">
                  {bookingAutoMessage.length}/500
                </span>
              </div>
            </div>
          </motion.div>

          {/* Save card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={cn(
              "rounded-2xl border bg-white dark:bg-slate-900 p-5 shadow-sm transition-colors",
              hasChanges
                ? "border-teal-200 dark:border-teal-800 shadow-teal-100 dark:shadow-teal-900/20"
                : "border-slate-200 dark:border-slate-800"
            )}
          >
            {/* Status */}
            <div className="flex items-center gap-2 mb-4">
              {hasChanges ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    {isSpanish ? "Cambios pendientes de guardar" : "Unsaved changes"}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-teal-500" />
                  <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                    {isSpanish ? "Configuración al día" : "All saved"}
                  </span>
                </>
              )}
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                "w-full h-11 font-semibold rounded-xl text-sm",
                "bg-gradient-to-r from-teal-600 to-emerald-600",
                "hover:from-teal-700 hover:to-emerald-700",
                "shadow-md shadow-teal-500/20",
                "disabled:opacity-60 transition-all"
              )}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isSpanish ? "Guardando..." : "Saving..."}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {isSpanish ? "Guardar configuración" : "Save configuration"}
                  <ChevronRight className="h-4 w-4 ml-auto opacity-60" />
                </span>
              )}
            </Button>

            <p className="text-[11px] text-slate-400 text-center mt-3 leading-relaxed">
              {isSpanish
                ? "Guarda el horario y el mensaje juntos. El mensaje es obligatorio."
                : "Saves schedule and message together. Message is required."}
            </p>
          </motion.div>

          {/* Mobile stats */}
          <div className="sm:hidden flex gap-2">
            <div className="flex-1 flex items-center justify-center gap-1.5 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 rounded-xl px-3 py-2.5 text-xs font-medium">
              <Calendar className="h-3.5 w-3.5" />
              {enabledDaysCount} {isSpanish ? "días activos" : "active days"}
            </div>
            <div className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl px-3 py-2.5 text-xs font-medium">
              <Clock className="h-3.5 w-3.5" />
              {totalSlotsPerWeek} {isSpanish ? "citas/sem." : "slots/wk"}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
