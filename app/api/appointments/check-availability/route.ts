import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isFutureDateTime, combineDateTime } from '@/lib/utils/date-helpers'

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

    if (!professionalId || !date || !time) {
      return NextResponse.json(
        { 
          error: 'missing_fields',
          message: 'Por favor, proporciona professionalId, date y time.'
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
      .select('availability, consultation_type, online_price, in_person_price, consultation_price')
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
    const availability = professional.availability || {}
    const dayAvailability = availability[dayName]

    // Verificar si el día está disponible
    if (!dayAvailability || !dayAvailability.available) {
      return NextResponse.json({
        available: false,
        reason: 'day_not_available',
        message: 'El profesional no tiene disponibilidad en este día.'
      })
    }

    // Verificar si la hora está dentro del horario de trabajo
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
            message: 'La hora seleccionada está fuera del horario de trabajo del profesional.'
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
      const duration = 60 // Duración por defecto

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

