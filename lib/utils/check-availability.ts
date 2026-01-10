/**
 * Check Availability Utility
 * 
 * Calcula la disponibilidad real de un profesional basado en:
 * - Horarios configurados
 * - Citas existentes
 * - Día de la semana actual
 */

import { createClient } from '@/lib/supabase/server'
import { normalizeAvailability, getAvailabilityForType } from './availability-helpers'

interface AvailabilityResult {
  availableToday: boolean
  availableUntil: string | null
  nextAvailableSlot: string | null
  slotsAvailable: number
}

/**
 * Verifica la disponibilidad de un profesional para HOY
 */
export async function checkProfessionalAvailability(
  professionalId: string,
  consultationType: 'online' | 'in-person' | 'both' = 'both'
): Promise<AvailabilityResult> {
  try {
    const supabase = await createClient()

    // Obtener información del profesional
    const { data: professional, error: profError } = await supabase
      .from('professionals')
      .select('availability, consultation_type')
      .eq('id', professionalId)
      .single()

    if (profError || !professional) {
      return {
        availableToday: false,
        availableUntil: null,
        nextAvailableSlot: null,
        slotsAvailable: 0,
      }
    }

    const today = new Date()
    const dayOfWeek = today.getDay()
    const dayMap: Record<number, string> = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday',
    }
    const dayName = dayMap[dayOfWeek]

    // Normalizar disponibilidad
    const normalizedAvailability = normalizeAvailability(
      professional.availability || {},
      professional.consultation_type || 'both'
    )

    // Obtener disponibilidad para el tipo de consulta
    const typeToCheck = consultationType === 'both' ? 'online' : consultationType
    const dayAvailability = getAvailabilityForType(normalizedAvailability, typeToCheck, dayName)

    if (!dayAvailability || !dayAvailability.available) {
      return {
        availableToday: false,
        availableUntil: null,
        nextAvailableSlot: null,
        slotsAvailable: 0,
      }
    }

    // Obtener citas de hoy
    const todayStr = today.toISOString().split('T')[0]
    const { data: todayAppointments } = await supabase
      .from('appointments')
      .select('appointment_time, duration_minutes, type, status')
      .eq('professional_id', professionalId)
      .eq('appointment_date', todayStr)
      .in('status', ['pending', 'confirmed'])

    // Calcular horario de trabajo
    const workingHours = dayAvailability.hours
    if (!workingHours) {
      return {
        availableToday: true,
        availableUntil: '6:00 PM',
        nextAvailableSlot: null,
        slotsAvailable: 1,
      }
    }

    const [startTime, endTime] = workingHours.split(' - ')
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)

    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const nowMinutes = today.getHours() * 60 + today.getMinutes()

    // Verificar si ya pasó el horario de trabajo
    if (nowMinutes >= endMinutes) {
      return {
        availableToday: false,
        availableUntil: null,
        nextAvailableSlot: null,
        slotsAvailable: 0,
      }
    }

    // Calcular slots disponibles
    const slotDuration = 60 // minutos por defecto
    const totalSlots = Math.floor((endMinutes - startMinutes) / slotDuration)
    
    // Contar slots ocupados
    let occupiedSlots = 0
    if (todayAppointments) {
      todayAppointments.forEach((apt) => {
        if (apt.type === typeToCheck || consultationType === 'both') {
          const aptTime = apt.appointment_time.split(':').map(Number)
          const aptMinutes = aptTime[0] * 60 + aptTime[1]
          if (aptMinutes >= startMinutes && aptMinutes < endMinutes) {
            occupiedSlots += Math.ceil((apt.duration_minutes || 60) / slotDuration)
          }
        }
      })
    }

    const slotsAvailable = Math.max(0, totalSlots - occupiedSlots)

    // Calcular "available until"
    let availableUntil: string | null = endTime
    if (slotsAvailable === 0 && todayAppointments && todayAppointments.length > 0) {
      // Si no hay slots, verificar cuándo termina la última cita
      const lastAppointment = todayAppointments
        .filter((apt) => {
          const aptTime = apt.appointment_time.split(':').map(Number)
          const aptMinutes = aptTime[0] * 60 + aptTime[1]
          return aptMinutes >= nowMinutes
        })
        .sort((a, b) => {
          const aTime = a.appointment_time.split(':').map(Number)
          const bTime = b.appointment_time.split(':').map(Number)
          return aTime[0] * 60 + aTime[1] - (bTime[0] * 60 + bTime[1])
        })[0]

      if (lastAppointment) {
        const lastTime = lastAppointment.appointment_time.split(':').map(Number)
        const lastMinutes = lastTime[0] * 60 + lastTime[1]
        const lastEndMinutes = lastMinutes + (lastAppointment.duration_minutes || 60)
        const lastEndHour = Math.floor(lastEndMinutes / 60)
        const lastEndMin = lastEndMinutes % 60
        availableUntil = `${lastEndHour.toString().padStart(2, '0')}:${lastEndMin.toString().padStart(2, '0')}`
      }
    }

    // Calcular próximo slot disponible
    let nextAvailableSlot: string | null = null
    if (slotsAvailable > 0) {
      // Encontrar el primer slot libre
      const occupiedTimes = (todayAppointments || [])
        .filter((apt) => apt.type === typeToCheck || consultationType === 'both')
        .map((apt) => {
          const aptTime = apt.appointment_time.split(':').map(Number)
          return aptTime[0] * 60 + aptTime[1]
        })
        .sort((a, b) => a - b)

      // Buscar primer slot libre después de ahora
      for (let slotStart = Math.max(startMinutes, nowMinutes); slotStart < endMinutes; slotStart += slotDuration) {
        const slotEnd = slotStart + slotDuration
        const isOccupied = occupiedTimes.some((occupied) => {
          return (occupied >= slotStart && occupied < slotEnd) || (slotStart >= occupied && slotStart < occupied + slotDuration)
        })

        if (!isOccupied) {
          const slotHour = Math.floor(slotStart / 60)
          const slotMin = slotStart % 60
          nextAvailableSlot = `${slotHour.toString().padStart(2, '0')}:${slotMin.toString().padStart(2, '0')}`
          break
        }
      }
    }

    return {
      availableToday: slotsAvailable > 0,
      availableUntil,
      nextAvailableSlot,
      slotsAvailable,
    }
  } catch (error) {
    console.error('Error verificando disponibilidad:', error)
    return {
      availableToday: true,
      availableUntil: '6:00 PM',
      nextAvailableSlot: null,
      slotsAvailable: 1,
    }
  }
}
