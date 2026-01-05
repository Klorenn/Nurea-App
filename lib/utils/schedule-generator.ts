/**
 * Generador de horarios disponibles para profesionales
 */

import { formatShortDate, getShortDayName, isToday, isTomorrow } from './date-helpers'

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

interface ProfessionalAvailability {
  [key: string]: {
    available: boolean
    hours?: string
  }
}

interface ExistingAppointment {
  appointment_date: string
  appointment_time: string
  duration_minutes: number
}

/**
 * Genera slots de tiempo entre startTime y endTime con intervalos de 30 minutos
 */
function generateTimeSlots(startTime: string, endTime: string): string[] {
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  const slots: string[] = []
  
  for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`)
  }
  
  return slots
}

/**
 * Verifica si un slot de tiempo está ocupado por una cita existente
 */
function isSlotOccupied(
  slotTime: string,
  date: string,
  existingAppointments: ExistingAppointment[]
): boolean {
  const slotMinutes = parseInt(slotTime.split(':')[0]) * 60 + parseInt(slotTime.split(':')[1])
  const slotEndMinutes = slotMinutes + 60 // Duración por defecto de 60 minutos

  for (const appointment of existingAppointments) {
    if (appointment.appointment_date !== date) continue

    const appointmentTimeParts = appointment.appointment_time.split(':')
    const appointmentMinutes = parseInt(appointmentTimeParts[0]) * 60 + parseInt(appointmentTimeParts[1])
    const appointmentEndMinutes = appointmentMinutes + (appointment.duration_minutes || 60)

    // Verificar solapamiento
    if (
      (slotMinutes >= appointmentMinutes && slotMinutes < appointmentEndMinutes) ||
      (slotEndMinutes > appointmentMinutes && slotEndMinutes <= appointmentEndMinutes) ||
      (slotMinutes <= appointmentMinutes && slotEndMinutes >= appointmentEndMinutes)
    ) {
      return true
    }
  }

  return false
}

/**
 * Genera el horario de una semana a partir de la disponibilidad del profesional
 */
export function generateWeekSchedule(
  availability: ProfessionalAvailability,
  existingAppointments: ExistingAppointment[] = [],
  startDate: Date = new Date(),
  language: "es" | "en" = "es"
): DaySchedule[] {
  const schedule: DaySchedule[] = []
  const dayMap: Record<number, string> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  }

  // Generar horarios para los próximos 7 días
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    const dayOfWeek = date.getDay()
    const dayName = dayMap[dayOfWeek]
    const dayAvailability = availability[dayName]

    const dateISO = date.toISOString().split('T')[0]
    const dateShort = formatShortDate(date, language)
    
    let dayNameLabel: string
    if (isToday(date)) {
      dayNameLabel = language === "es" ? "Hoy" : "Today"
    } else if (isTomorrow(date)) {
      dayNameLabel = language === "es" ? "Mañana" : "Tomorrow"
    } else {
      dayNameLabel = getShortDayName(date, language)
    }

    // Si el día no está disponible, agregar día sin slots
    if (!dayAvailability || !dayAvailability.available || !dayAvailability.hours) {
      schedule.push({
        date: dateShort,
        dayName: dayNameLabel,
        dayNumber: date.getDate(),
        slots: [],
        hasAvailability: false,
      })
      continue
    }

    // Generar slots de tiempo
    const [startTime, endTime] = dayAvailability.hours.split(' - ')
    const timeSlots = generateTimeSlots(startTime, endTime)
    
    // Filtrar slots ocupados
    const availableSlots: TimeSlot[] = timeSlots.map(slot => ({
      time: slot,
      available: !isSlotOccupied(slot, dateISO, existingAppointments),
    }))

    schedule.push({
      date: dateShort,
      dayName: dayNameLabel,
      dayNumber: date.getDate(),
      slots: availableSlots,
      hasAvailability: availableSlots.some(slot => slot.available),
    })
  }

  return schedule
}

/**
 * Genera slots de tiempo para un día específico
 */
export function generateDaySlots(
  availability: ProfessionalAvailability,
  date: Date,
  existingAppointments: ExistingAppointment[] = []
): TimeSlot[] {
  const dayMap: Record<number, string> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  }

  const dayOfWeek = date.getDay()
  const dayName = dayMap[dayOfWeek]
  const dayAvailability = availability[dayName]

  if (!dayAvailability || !dayAvailability.available || !dayAvailability.hours) {
    return []
  }

  const dateISO = date.toISOString().split('T')[0]
  const [startTime, endTime] = dayAvailability.hours.split(' - ')
  const timeSlots = generateTimeSlots(startTime, endTime)

  return timeSlots.map(slot => ({
    time: slot,
    available: !isSlotOccupied(slot, dateISO, existingAppointments),
  }))
}

