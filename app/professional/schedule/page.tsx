"use client"

import * as React from "react"
import { useState, useEffect, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RouteGuard } from "@/components/auth/route-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Video,
  Loader2,
  Lock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const HOUR_START = 8
const HOUR_END = 20
const SLOT_MINUTES = 30
const TOTAL_SLOTS = ((HOUR_END - HOUR_START) * 60) / SLOT_MINUTES

interface ProfessionalAppointment {
  id: string
  appointment_date: string
  appointment_time: string
  duration_minutes: number
  status: string
  payment_status: string
  type: "online" | "in_person"
  price?: number
  address?: string
  patient?: { first_name?: string; last_name?: string }
}

interface BlockedSlot {
  id: string
  date: string
  startTime: string
  endTime: string
  label?: string
}

function timeToSlotIndex(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return (h - HOUR_START) * 2 + (m === 30 ? 1 : 0)
}

function slotIndexToTime(index: number): string {
  const totalMinutes = HOUR_START * 60 + index * SLOT_MINUTES
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, "0")}:${m === 0 ? "00" : "30"}`
}

export default function ProfessionalSchedulePage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"

  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<ProfessionalAppointment[]>([])
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([])
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d)
    monday.setDate(diff)
    return monday
  })
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [blockForm, setBlockForm] = useState({ date: "", startTime: "09:00", endTime: "10:00" })

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/professional/appointments")
      const data = await response.json()
      if (data.success && Array.isArray(data.appointments)) {
        setAppointments(data.appointments)
      } else {
        setAppointments([])
      }
    } catch (error) {
      console.error("Error loading appointments:", error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const weekDays = useMemo(() => {
    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      days.push(d)
    }
    return days
  }, [weekStart])

  const dateStr = (d: Date) => d.toISOString().slice(0, 10)

  const appointmentsByDateAndSlot = useMemo(() => {
    const map: Record<string, Record<number, ProfessionalAppointment>> = {}
    appointments
      .filter((a) => a.status !== "cancelled")
      .forEach((apt) => {
        const date = apt.appointment_date
        if (!map[date]) map[date] = {}
        const idx = timeToSlotIndex(apt.appointment_time)
        const durationSlots = Math.max(1, Math.ceil((apt.duration_minutes || 30) / SLOT_MINUTES))
        for (let s = 0; s < durationSlots; s++) {
          map[date][idx + s] = apt
        }
      })
    return map
  }, [appointments])

  const blockedByDateAndSlot = useMemo(() => {
    const map: Record<string, Set<number>> = {}
    blockedSlots.forEach((b) => {
      const startIdx = timeToSlotIndex(b.startTime)
      const endIdx = timeToSlotIndex(b.endTime)
      if (!map[b.date]) map[b.date] = new Set()
      for (let i = startIdx; i < endIdx; i++) map[b.date].add(i)
    })
    return map
  }, [blockedSlots])

  const addBlockedSlot = () => {
    if (!blockForm.date || !blockForm.startTime || !blockForm.endTime) return
    setBlockedSlots((prev) => [
      ...prev,
      {
        id: `block-${Date.now()}`,
        date: blockForm.date,
        startTime: blockForm.startTime,
        endTime: blockForm.endTime,
        label: isSpanish ? "No disponible" : "Unavailable",
      },
    ])
    setShowBlockModal(false)
    setBlockForm({ date: dateStr(new Date()), startTime: "09:00", endTime: "10:00" })
  }

  const removeBlockedSlot = (id: string) => {
    setBlockedSlots((prev) => prev.filter((b) => b.id !== id))
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(isSpanish ? "es-CL" : "en-US", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount)

  const timeLabels = useMemo(() => {
    const labels: string[] = []
    for (let i = 0; i <= TOTAL_SLOTS; i++) {
      labels.push(slotIndexToTime(i))
    }
    return labels
  }, [])

  const goPrevWeek = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() - 7)
    setWeekStart(d)
  }
  const goNextWeek = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    setWeekStart(d)
  }
  const goToday = () => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    setWeekStart(new Date(d.setDate(diff)))
  }

  const dayAppointments = (dateKey: string) =>
    appointments.filter((a) => a.appointment_date === dateKey && a.status !== "cancelled")

  if (loading) {
    return (
      <RouteGuard requiredRole="professional">
        <DashboardLayout role="professional">
          <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DashboardLayout>
      </RouteGuard>
    )
  }

  return (
    <RouteGuard requiredRole="professional">
      <DashboardLayout role="professional">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {isSpanish ? "Agenda" : "Agenda"}
              </h1>
              <p className="text-muted-foreground">
                {isSpanish ? "Calendario semanal de citas" : "Weekly appointment calendar"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goPrevWeek} aria-label="Previous week">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToday}>
                {isSpanish ? "Hoy" : "Today"}
              </Button>
              <Button variant="outline" size="icon" onClick={goNextWeek} aria-label="Next week">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                className="ml-2"
                onClick={() => {
                  setBlockForm((f) => ({ ...f, date: f.date || dateStr(new Date()) }))
                  setShowBlockModal(true)
                }}
              >
                <Lock className="h-4 w-4 mr-2" />
                {isSpanish ? "Bloquear Horario" : "Block time"}
              </Button>
            </div>
          </div>

          {/* Mobile: lista diaria por día */}
          <div className="block md:hidden space-y-4">
            <AnimatePresence mode="wait">
              {weekDays.map((day) => {
                const dateKey = dateStr(day)
                const dayApts = dayAppointments(dateKey)
                const dayBlocks = blockedSlots.filter((b) => b.date === dateKey)
                return (
                  <motion.div
                    key={dateKey}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-border/60 bg-card overflow-hidden"
                  >
                    <div className="px-4 py-3 bg-muted/30 border-b border-border/40 font-semibold">
                      {day.toLocaleDateString(isSpanish ? "es-ES" : "en-US", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                    <div className="p-4 space-y-2">
                      {dayApts.length === 0 && dayBlocks.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">
                          {isSpanish ? "Sin citas ni bloques" : "No appointments or blocks"}
                        </p>
                      ) : (
                        <>
                          {dayApts.map((apt) => (
                            <div
                              key={apt.id}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-lg border",
                                apt.status === "confirmed"
                                  ? "bg-primary/10 border-primary/30"
                                  : "bg-muted/30 border-border/40"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                  <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {apt.patient?.first_name} {apt.patient?.last_name}
                                  </p>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {apt.appointment_time} · {apt.duration_minutes} min
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {apt.type === "online" ? (isSpanish ? "Online" : "Online") : isSpanish ? "Presencial" : "In-person"}
                              </Badge>
                            </div>
                          ))}
                          {dayBlocks.map((b) => (
                            <div
                              key={b.id}
                              className="flex items-center justify-between p-3 rounded-lg border border-amber-500/30 bg-amber-500/10"
                            >
                              <div className="flex items-center gap-2">
                                <Lock className="h-4 w-4 text-amber-600" />
                                <span className="text-sm font-medium">{b.startTime} – {b.endTime}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => removeBlockedSlot(b.id)}
                              >
                                {isSpanish ? "Desbloquear" : "Unblock"}
                              </Button>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Desktop: grid semanal 08:00–20:00 */}
          <Card className="hidden md:block overflow-hidden">
            <CardContent className="p-0">
              <div
                className="grid border-b border-border/40"
                style={{
                  gridTemplateColumns: `80px repeat(7, minmax(0, 1fr))`,
                  gridTemplateRows: `auto repeat(${TOTAL_SLOTS}, minmax(20px, 1fr))`,
                }}
              >
                <div className="row-span-1 border-r border-border/40 bg-muted/30 p-2 text-xs font-medium text-muted-foreground" />
                {weekDays.map((day) => (
                  <div
                    key={dateStr(day)}
                    className="border-r border-border/40 last:border-r-0 bg-muted/20 p-2 text-center text-sm font-medium"
                  >
                    {day.toLocaleDateString(isSpanish ? "es-ES" : "en-US", { weekday: "short" })}
                    <br />
                    <span className="text-muted-foreground">{day.getDate()}</span>
                  </div>
                ))}
                {timeLabels.slice(0, -1).map((time, rowIdx) => (
                  <React.Fragment key={rowIdx}>
                    <div className="border-r border-t border-border/40 bg-muted/30 px-2 py-1 text-xs text-muted-foreground">
                      {time}
                    </div>
                    {weekDays.map((day) => {
                      const dateKey = dateStr(day)
                      const isBlocked = blockedByDateAndSlot[dateKey]?.has(rowIdx)
                      const apt = appointmentsByDateAndSlot[dateKey]?.[rowIdx]
                      const isFirstSlotOfApt = apt && timeToSlotIndex(apt.appointment_time) === rowIdx
                      return (
                        <div
                          key={`${dateKey}-${rowIdx}`}
                          className={cn(
                            "border-r border-t border-border/40 last:border-r-0 min-h-[20px] relative",
                            isBlocked && "bg-amber-500/20",
                            apt && isFirstSlotOfApt && "bg-primary/15"
                          )}
                        >
                          {isBlocked && !apt && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Lock className="h-3 w-3 text-amber-600" />
                            </div>
                          )}
                          {apt && isFirstSlotOfApt && (
                            <div
                              className="absolute inset-0.5 rounded flex flex-col justify-center px-1.5 overflow-hidden"
                              style={{
                                backgroundColor: "hsl(var(--primary) / 0.2)",
                                borderLeft: "3px solid hsl(var(--primary))",
                              }}
                            >
                              <p className="text-xs font-medium truncate">
                                {apt.patient?.first_name} {apt.patient?.last_name}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {apt.appointment_time} · {apt.type === "online" ? "Online" : isSpanish ? "Presencial" : "In-person"}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Modal Bloquear Horario */}
          {showBlockModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-xl border shadow-lg max-w-md w-full p-6 space-y-4"
              >
                <h3 className="text-lg font-semibold">
                  {isSpanish ? "Bloquear horario" : "Block time"}
                </h3>
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">{isSpanish ? "Fecha" : "Date"}</label>
                    <input
                      type="date"
                      value={blockForm.date || dateStr(new Date())}
                      onChange={(e) => setBlockForm((f) => ({ ...f, date: e.target.value }))}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">{isSpanish ? "Inicio" : "Start"}</label>
                      <select
                        value={blockForm.startTime}
                        onChange={(e) => setBlockForm((f) => ({ ...f, startTime: e.target.value }))}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      >
                        {Array.from({ length: 25 }, (_, i) => {
                          const h = HOUR_START + Math.floor(i / 2)
                          const m = i % 2 === 0 ? "00" : "30"
                          const t = `${String(h).padStart(2, "0")}:${m}`
                          if (h > HOUR_END) return null
                          return (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          )
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">{isSpanish ? "Fin" : "End"}</label>
                      <select
                        value={blockForm.endTime}
                        onChange={(e) => setBlockForm((f) => ({ ...f, endTime: e.target.value }))}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      >
                        {Array.from({ length: 25 }, (_, i) => {
                          const h = HOUR_START + Math.floor(i / 2)
                          const m = i % 2 === 0 ? "00" : "30"
                          const t = `${String(h).padStart(2, "0")}:${m}`
                          if (h > HOUR_END) return null
                          return (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          )
                        })}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" onClick={() => setShowBlockModal(false)}>
                    {isSpanish ? "Cancelar" : "Cancel"}
                  </Button>
                  <Button onClick={addBlockedSlot}>
                    {isSpanish ? "Bloquear" : "Block"}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </RouteGuard>
  )
}
