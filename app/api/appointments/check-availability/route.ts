import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isFutureDateTime, combineDateTime } from '@/lib/utils/date-helpers'
import { normalizeAvailability, getAvailabilityForType, hasAnyAvailability } from '@/lib/utils/availability-helpers'

/**
 * GET /api/appointments/check-availability
 * Verifica si un horario está disponible para agendar
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const professionalId = searchParams.get('professionalId')
    const date = searchParams.get('date')
    const time = searchParams.get('time')
    const type = searchParams.get('type') as 'online' | 'in-person' | null // Tipo de consulta solicitada
    const durationParam = searchParams.get('duration')
    const duration = durationParam ? Number(durationParam) : 60

    if (!professionalId || !date || !time) {
      return NextResponse.json(
        { 
          error: 'missing_fields',
          message: 'Por favor, proporciona professionalId, date y time.'
        },
        { status: 400 }
      )
    }
    
    if (!Number.isFinite(duration) || duration <= 0 || duration > 24 * 60) {
      return NextResponse.json(
        {
          error: 'invalid_duration',
          message: 'Duración inválida.',
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verificar que la fecha/hora sea en el futuro
    if (!isFutureDateTime(date, time)) {
      return NextResponse.json({
        available: false,
        reason: 'past_datetime',
        message: 'No se pueden agendar citas en el pasado.'
      })
    }

    // Obtener información del profesional
    const { data: professional, error: profError } = await supabase
      .from('professionals')
      .select('availability, consultation_type, online_price, in_person_price, consultation_price, specialty, bio, bank_account, bank_name, registration_number, registration_institution')
      .eq('id', professionalId)
      .single()

    if (profError || !professional) {
      return NextResponse.json(
        { 
          error: 'professional_not_found',
          message: 'No se encontró el profesional seleccionado.'
        },
        { status: 404 }
      )
    }

    // Verificar que el profesional tenga el perfil completo
    const missingFields: string[] = []
    
    if (!professional.specialty || professional.specialty.trim() === '') {
      missingFields.push('specialty')
    }
    if (!professional.bio || professional.bio.trim() === '') {
      missingFields.push('bio')
    }
    if (!professional.consultation_type || professional.consultation_type === '') {
      missingFields.push('consultation_type')
    }
    
    const consultationType = professional.consultation_type || 'both'
    if (consultationType === 'online' || consultationType === 'both') {
      if (!professional.online_price || professional.online_price === 0) {
        missingFields.push('online_price')
      }
    }
    if (consultationType === 'in-person' || consultationType === 'both') {
      if (!professional.in_person_price || professional.in_person_price === 0) {
        missingFields.push('in_person_price')
      }
    }
    
    // Verificar disponibilidad usando helper (soporta formato antiguo y nuevo)
    if (!hasAnyAvailability(professional.availability, professional.consultation_type || 'both')) {
      missingFields.push('availability')
    }
    
    if (!professional.bank_account || professional.bank_account.trim() === '') {
      missingFields.push('bank_account')
    }
    if (!professional.bank_name || professional.bank_name.trim() === '') {
      missingFields.push('bank_name')
    }
    if (!professional.registration_number || professional.registration_number.trim() === '') {
      missingFields.push('registration_number')
    }
    if (!professional.registration_institution || professional.registration_institution.trim() === '') {
      missingFields.push('registration_institution')
    }

    if (missingFields.length > 0) {
      return NextResponse.json({
        available: false,
        reason: 'professional_profile_incomplete',
        message: 'El profesional aún no ha completado su configuración de perfil.',
        missingFields
      })
    }

    // Verificar disponibilidad según el horario de trabajo
    const appointmentDateTime = combineDateTime(date, time)
    const dayOfWeek = appointmentDateTime.getDay()
    
    // Mapear día de la semana a nombre en availability object
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
    
    // Normalizar disponibilidad al nuevo formato
    const normalizedAvailability = normalizeAvailability(
      professional.availability || {},
      professional.consultation_type || 'both'
    )

    // Determinar el tipo de consulta a verificar
    const consultationTypeToCheck = type || (professional.consultation_type === 'both' ? 'online' : professional.consultation_type)
    
    // Obtener disponibilidad para el tipo de consulta solicitado
    const dayAvailability = getAvailabilityForType(normalizedAvailability, consultationTypeToCheck as 'online' | 'in-person', dayName)

    // Verificar si el día está disponible para este tipo de consulta
    if (!dayAvailability || !dayAvailability.available) {
      return NextResponse.json({
        available: false,
        reason: 'day_not_available',
        message: `El profesional no tiene disponibilidad ${consultationTypeToCheck === 'online' ? 'online' : 'presencial'} en este día.`
      })
    }

    // Verificar si la hora está dentro del horario de trabajo para este tipo
    if (dayAvailability.hours) {
      const [startTime, endTime] = dayAvailability.hours.split(' - ')
      const appointmentHour = parseInt(time.split(':')[0])
      const appointmentMinute = parseInt(time.split(':')[1])
      const appointmentTimeMinutes = appointmentHour * 60 + appointmentMinute

      if (startTime && endTime) {
        const [startHour, startMin] = startTime.split(':').map(Number)
        const [endHour, endMin] = endTime.split(':').map(Number)
        const startTimeMinutes = startHour * 60 + startMin
        const endTimeMinutes = endHour * 60 + endMin

        if (appointmentTimeMinutes < startTimeMinutes || appointmentTimeMinutes >= endTimeMinutes) {
          return NextResponse.json({
            available: false,
            reason: 'outside_working_hours',
            message: 'La hora seleccionada está fuera del horario de trabajo del profesional para este tipo de consulta.'
          })
        }
      }
    }

    // Verificar conflictos con citas existentes
    const { data: existingAppointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id, appointment_date, appointment_time, duration_minutes, status')
      .eq('professional_id', professionalId)
      .eq('appointment_date', date)
      .in('status', ['pending', 'confirmed'])
    
    if (appointmentsError) {
      console.error('Error checking existing appointments:', appointmentsError)
      // Continuar con la verificación aunque haya error
    }

    // Verificar si hay conflicto de horarios
    if (existingAppointments && existingAppointments.length > 0) {
      const appointmentTimeMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1])

      for (const existing of existingAppointments) {
        const existingTimeParts = existing.appointment_time.split(':')
        const existingTimeMinutes = parseInt(existingTimeParts[0]) * 60 + parseInt(existingTimeParts[1])
        const existingDuration = existing.duration_minutes || 60

        // Verificar solapamiento
        const appointmentEnd = appointmentTimeMinutes + duration
        const existingEnd = existingTimeMinutes + existingDuration

        if (
          (appointmentTimeMinutes >= existingTimeMinutes && appointmentTimeMinutes < existingEnd) ||
          (appointmentEnd > existingTimeMinutes && appointmentEnd <= existingEnd) ||
          (appointmentTimeMinutes <= existingTimeMinutes && appointmentEnd >= existingEnd)
        ) {
          return NextResponse.json({
            available: false,
            reason: 'time_conflict',
            message: 'Este horario ya está ocupado. Por favor, selecciona otro horario.'
          })
        }
      }
    }

    // Si llegamos aquí, el horario está disponible
    return NextResponse.json({
      available: true,
      message: 'Horario disponible.'
    })
  } catch (error) {
    console.error('Check availability error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal al verificar disponibilidad. Por favor, intenta nuevamente.'
      },
      { status: 500 }
    )
  }
}

