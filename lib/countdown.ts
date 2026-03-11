/**
 * Fecha objetivo de la cuenta regresiva: 10 de diciembre de 2026.
 * La cuenta regresiva llega a 0 al final del 10 de diciembre (23:59:59).
 * Desde hoy quedan exactamente 276 días.
 */
export const LAUNCH_TARGET_DATE = new Date(2026, 11, 10, 23, 59, 59) // 10 dic 2026, 23:59:59

export interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function getTimeLeftUntil(target: Date): TimeLeft {
  const now = Date.now()
  const diff = target.getTime() - now
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  return { days, hours, minutes, seconds }
}
