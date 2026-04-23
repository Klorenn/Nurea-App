"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

/**
 * Fecha objetivo por defecto (fallback) de la cuenta regresiva.
 * La fuente de verdad es `platform_settings.launch_date` en Supabase;
 * este valor se usa solo si la tabla no responde a tiempo o está vacía.
 */
export const LAUNCH_TARGET_DATE = new Date(2026, 11, 10, 23, 59, 59) // 10 dic 2026, 23:59:59

export interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  /** total milliseconds remaining (0 cuando ya se lanzó) */
  totalMs: number
  /** true cuando la fecha objetivo ya pasó */
  isOver: boolean
}

export function getTimeLeftUntil(target: Date): TimeLeft {
  const now = Date.now()
  const diff = target.getTime() - now
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, isOver: true }
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  return { days, hours, minutes, seconds, totalMs: diff, isOver: false }
}

/**
 * Hook client-side: trae la fecha real desde platform_settings y
 * mantiene el tiempo restante actualizado cada segundo.
 */
export function useLaunchCountdown(fallback: Date = LAUNCH_TARGET_DATE): {
  target: Date
  timeLeft: TimeLeft
  loading: boolean
} {
  const [target, setTarget] = useState<Date>(fallback)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeftUntil(fallback))
  const [loading, setLoading] = useState(true)

  // Cargar launch_date desde platform_settings (public read habilitado)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("platform_settings")
          .select("value")
          .eq("key", "launch_date")
          .maybeSingle()

        if (cancelled) return
        if (!error && data?.value) {
          // value se guarda como jsonb string con formato ISO
          const raw = typeof data.value === "string" ? data.value : String(data.value)
          const parsed = new Date(raw)
          if (!isNaN(parsed.getTime())) {
            setTarget(parsed)
          }
        }
      } catch (e) {
        // silencioso, usamos fallback
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Tick por segundo
  useEffect(() => {
    setTimeLeft(getTimeLeftUntil(target))
    const id = setInterval(() => {
      setTimeLeft(getTimeLeftUntil(target))
    }, 1000)
    return () => clearInterval(id)
  }, [target])

  return { target, timeLeft, loading }
}
