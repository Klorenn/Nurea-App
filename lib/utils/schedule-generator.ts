/**
 * Generador de horarios disponibles para profesionales
 */

import { formatShortDate, getShortDayName, isToday, isTomorrow } from './date-helpers'
import { normalizeAvailability, getAvailabilityForType, AvailabilityByType } from './availability-helpers'

export interface TimeSlot {
  time: string
  available: boolean
  type?: 'online' | 'in-person' // Tipo de consulta para este slot
}

export interface DaySchedule {
  date: string
  dayName: string
  dayNumber: number
  slots: TimeSlot[]
  hasAvailability: boolean
}

// Formato antiguo (legacy)
interface LegacyProfessionalAvailability {
  [key: string]: {
    available: boolean
    hours?: string
  }
}

// Formato nuevo (con horarios por tipo)
export interface ProfessionalAvailability {
  [key: string]: AvailabilityByType
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
 * @param availability - Disponibilidad del profesional (formato nuevo o legacy)
 * @param existingAppointments - Citas existentes
 * @param startDate - Fecha de inicio
 * @param language - Idioma
 * @param consultationType - Tipo de consulta que se está agendando ('online', 'in-person', o 'both' para mostrar ambos)
 * @param professionalConsultationType - Tipo de consulta que ofrece el profesional ('online', 'in-person', 'both')
 */
export function generateWeekSchedule(
  availability: ProfessionalAvailability | LegacyProfessionalAvailability,
  existingAppointments: ExistingAppointment[] = [],
  startDate: Date = new Date(),
  language: "es" | "en" = "es",
  consultationType?: 'online' | 'in-person' | 'both',
  professionalConsultationType: 'online' | 'in-person' | 'both' = 'both'
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

  // Normalizar disponibilidad al nuevo formato
  const normalizedAvailability = normalizeAvailability(availability, professionalConsultationType)
  
  // Determinar qué tipos mostrar
  const typesToShow: Array<'online' | 'in-person'> = []
  if (consultationType === 'both' || !consultationType) {
    if (professionalConsultationType === 'both') {
      typesToShow.push('online', 'in-person')
    } else if (professionalConsultationType === 'online') {
      typesToShow.push('online')
    } else {
      typesToShow.push('in-person')
    }
  } else {
    typesToShow.push(consultationType)
  }

  // Generar horarios para los próximos 7 días
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    const dayOfWeek = date.getDay()
    const dayName = dayMap[dayOfWeek]

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

    // Recopilar slots de todos los tipos disponibles
    const allSlots: TimeSlot[] = []

    for (const type of typesToShow) {
      const typeAvailability = getAvailabilityForType(normalizedAvailability, type, dayName)
      
      if (typeAvailability && typeAvailability.available && typeAvailability.hours) {
        // Generar slots de tiempo para este tipo
        const [startTime, endTime] = typeAvailability.hours.split(' - ')
        const timeSlots = generateTimeSlots(startTime, endTime)
        
        // Filtrar slots ocupados y agregar tipo
        const typeSlots: TimeSlot[] = timeSlots.map(slot => ({
          time: slot,
          available: !isSlotOccupied(slot, dateISO, existingAppointments),
          type: type,
        }))
        
        allSlots.push(...typeSlots)
      }
    }

    // Eliminar duplicados (mismo horario para ambos tipos) y ordenar
    const uniqueSlots = new Map<string, TimeSlot>()
    for (const slot of allSlots) {
      const existing = uniqueSlots.get(slot.time)
      if (!existing || !existing.available) {
        uniqueSlots.set(slot.time, slot)
      } else if (slot.available && !existing.available) {
        uniqueSlots.set(slot.time, slot)
      }
    }

    const finalSlots = Array.from(uniqueSlots.values()).sort((a, b) => {
      const [aHour, aMin] = a.time.split(':').map(Number)
      const [bHour, bMin] = b.time.split(':').map(Number)
      return aHour * 60 + aMin - (bHour * 60 + bMin)
    })

    schedule.push({
      date: dateShort,
      dayName: dayNameLabel,
      dayNumber: date.getDate(),
      slots: finalSlots,
      hasAvailability: finalSlots.some(slot => slot.available),
    })
  }

  return schedule
}

/**
 * Genera slots de tiempo para un día específico
 */
export function generateDaySlots(
  availability: ProfessionalAvailability | LegacyProfessionalAvailability,
  date: Date,
  existingAppointments: ExistingAppointment[] = [],
  consultationType?: 'online' | 'in-person' | 'both',
  professionalConsultationType: 'online' | 'in-person' | 'both' = 'both'
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
  const dateISO = date.toISOString().split('T')[0]

  // Normalizar disponibilidad
  const normalizedAvailability = normalizeAvailability(availability, professionalConsultationType)
  
  // Determinar qué tipos mostrar
  const typesToShow: Array<'online' | 'in-person'> = []
  if (consultationType === 'both' || !consultationType) {
    if (professionalConsultationType === 'both') {
      typesToShow.push('online', 'in-person')
    } else if (professionalConsultationType === 'online') {
      typesToShow.push('online')
    } else {
      typesToShow.push('in-person')
    }
  } else {
    typesToShow.push(consultationType)
  }

  const allSlots: TimeSlot[] = []

  for (const type of typesToShow) {
    const typeAvailability = getAvailabilityForType(normalizedAvailability, type, dayName)
    
    if (typeAvailability && typeAvailability.available && typeAvailability.hours) {
      const [startTime, endTime] = typeAvailability.hours.split(' - ')
      const timeSlots = generateTimeSlots(startTime, endTime)
      
      const typeSlots: TimeSlot[] = timeSlots.map(slot => ({
        time: slot,
        available: !isSlotOccupied(slot, dateISO, existingAppointments),
        type: type,
      }))
      
      allSlots.push(...typeSlots)
    }
  }

  // Eliminar duplicados y ordenar
  const uniqueSlots = new Map<string, TimeSlot>()
  for (const slot of allSlots) {
    const existing = uniqueSlots.get(slot.time)
    if (!existing || !existing.available) {
      uniqueSlots.set(slot.time, slot)
    } else if (slot.available && !existing.available) {
      uniqueSlots.set(slot.time, slot)
    }
  }

  return Array.from(uniqueSlots.values()).sort((a, b) => {
    const [aHour, aMin] = a.time.split(':').map(Number)
    const [bHour, bMin] = b.time.split(':').map(Number)
    return aHour * 60 + aMin - (bHour * 60 + bMin)
  })
}

