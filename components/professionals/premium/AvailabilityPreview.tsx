"use client"

import { useEffect, useState, useRef } from "react"
import { format, addDays, isToday, isTomorrow } from "date-fns"
import { es } from "date-fns/locale"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DaySlots {
  date: string
  label: string
  shortLabel: string
  slots: string[]
}

interface AvailabilityPreviewProps {
  professionalId: string
  days?: number
  maxSlotsPerDay?: number
  isSpanish?: boolean
  className?: string
  onSlotSelect?: (date: string, time: string) => void
  /** Si true, usa /api/professionals/[id]/slots (Supabase UUID). Si false, usa /api/profesionales/[id]/slots (Prisma id). */
  useProfessionalsApi?: boolean
}

export function AvailabilityPreview({
  professionalId,
  days = 4,
  maxSlotsPerDay = 5,
  isSpanish = true,
  className,
  useProfessionalsApi = false,
}: AvailabilityPreviewProps) {
  const [daysWithSlots, setDaysWithSlots] = useState<DaySlots[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const slotsBase = useProfessionalsApi ? "/api/professionals" : "/api/profesionales"

  useEffect(() => {
    let cancelled = false
    const fetchSlots = async () => {
      const result: DaySlots[] = []
      const today = new Date()
      for (let i = 0; i < days; i++) {
        const d = addDays(today, i)
        const dateStr = format(d, "yyyy-MM-dd")
        try {
          const res = await fetch(
            `${slotsBase}/${professionalId}/slots?date=${dateStr}`
          )
          if (!res.ok) continue
          const data = await res.json()
          const rawSlots = data.slots ?? []
          const times = rawSlots
            .slice(0, maxSlotsPerDay)
            .map((s: { startTime: string }) =>
              format(new Date(s.startTime), "HH:mm")
            )
          let label: string
          let shortLabel: string
          if (isToday(d)) {
            label = isSpanish ? "Hoy" : "Today"
            shortLabel = `${label} ${format(d, "d MMM", { locale: isSpanish ? es : undefined })}`
          } else if (isTomorrow(d)) {
            label = isSpanish ? "Mañana" : "Tomorrow"
            shortLabel = `${label} ${format(d, "d MMM", { locale: isSpanish ? es : undefined })}`
          } else {
            shortLabel = format(d, "EEE d MMM", { locale: isSpanish ? es : undefined })
            label = shortLabel
          }
          result.push({ date: dateStr, label, shortLabel, slots: times })
        } catch {
          const d = addDays(today, i)
          const shortLabel = isToday(d)
            ? `${isSpanish ? "Hoy" : "Today"} ${format(d, "d MMM", { locale: isSpanish ? es : undefined })}`
            : isTomorrow(d)
              ? `${isSpanish ? "Mañana" : "Tomorrow"} ${format(d, "d MMM", { locale: isSpanish ? es : undefined })}`
              : format(d, "EEE d MMM", { locale: isSpanish ? es : undefined })
          result.push({
            date: dateStr,
            label: shortLabel,
            shortLabel,
            slots: [],
          })
        }
      }
      if (!cancelled) {
        setDaysWithSlots(result)
        setLoading(false)
      }
    }
    fetchSlots()
    return () => { cancelled = true }
  }, [professionalId, days, maxSlotsPerDay, isSpanish, slotsBase])

  if (loading) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 w-[72px] shrink-0 rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse"
              aria-hidden
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700"
      >
        {daysWithSlots.map((day) => (
          <div
            key={day.date}
            className="shrink-0 w-[80px] flex flex-col gap-1.5"
          >
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 text-center">
              {day.shortLabel}
            </p>
            {day.slots.length === 0 ? (
              <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-1">
                {isSpanish ? "Sin horarios" : "No slots"}
              </p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {day.slots.map((time) => (
                  <span
                    key={time}
                    className="inline-flex items-center justify-center h-8 rounded-md bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 text-sm font-medium"
                  >
                    {time}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        <div className="shrink-0 flex items-center pl-1 text-slate-400" aria-hidden>
          <ChevronRight className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
