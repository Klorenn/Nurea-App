import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isFutureDateTime, combineDateTime } from '@/lib/utils/date-helpers'

export async function POST(request: Request) {
  try {
    const { professionalId, appointmentDate, appointmentTime, type, duration = 60 } = await request.json()

    if (!professionalId || !appointmentDate || !appointmentTime || !type) {
      return NextResponse.json(
        { 
          error: 'missing_fields',
          message: 'Por favor, completa todos los campos requeridos.'
        },
        { status: 400 }
      )
    }

    // Validar formato de fecha y hora
    if (!/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
      return NextResponse.json(
        { 
          error: 'invalid_date_format',
          message: 'Formato de fecha inválido. Use YYYY-MM-DD.'
        },
        { status: 400 }
      )
    }

    if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(appointmentTime)) {
      return NextResponse.json(
        { 
          error: 'invalid_time_format',
          message: 'Formato de hora inválido. Use HH:MM.'
        },
        { status: 400 }
      )
    }

    // Validar que la fecha/hora sea en el futuro
    if (!isFutureDateTime(appointmentDate, appointmentTime)) {
      return NextResponse.json(
        { 
          error: 'past_datetime',
          message: 'No se pueden agendar citas en el pasado.'
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { 
          error: 'unauthorized',
          message: 'Por favor, inicia sesión para agendar una cita.'
        },
        { status: 401 }
      )
    }

    // Obtener información completa del profesional
    const { data: professional, error: profError } = await supabase
      .from('professionals')
      .select('consultation_price, online_price, in_person_price, consultation_type, availability')
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

    // Verificar que el tipo de consulta esté disponible
    if (type === 'online' && professional.consultation_type !== 'online' && professional.consultation_type !== 'both') {
      return NextResponse.json(
        { 
          error: 'consultation_type_not_available',
          message: 'Este profesional no ofrece consultas online.'
        },
        { status: 400 }
      )
    }

    if (type === 'in-person' && professional.consultation_type !== 'in-person' && professional.consultation_type !== 'both') {
      return NextResponse.json(
        { 
          error: 'consultation_type_not_available',
          message: 'Este profesional no ofrece consultas presenciales.'
        },
        { status: 400 }
      )
    }

    // Verificar disponibilidad del día
    const appointmentDateTime = combineDateTime(appointmentDate, appointmentTime)
    const dayOfWeek = appointmentDateTime.getDay()
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

    if (!dayAvailability || !dayAvailability.available) {
      return NextResponse.json(
        { 
          error: 'day_not_available',
          message: 'El profesional no tiene disponibilidad en este día.'
        },
        { status: 400 }
      )
    }

    // Verificar que la hora esté dentro del horario de trabajo
    if (dayAvailability.hours) {
      const [startTime, endTime] = dayAvailability.hours.split(' - ')
      const appointmentHour = parseInt(appointmentTime.split(':')[0])
      const appointmentMinute = parseInt(appointmentTime.split(':')[1])
      const appointmentTimeMinutes = appointmentHour * 60 + appointmentMinute

      if (startTime && endTime) {
        const [startHour, startMin] = startTime.split(':').map(Number)
        const [endHour, endMin] = endTime.split(':').map(Number)
        const startTimeMinutes = startHour * 60 + startMin
        const endTimeMinutes = endHour * 60 + endMin

        if (appointmentTimeMinutes < startTimeMinutes || appointmentTimeMinutes >= endTimeMinutes) {
          return NextResponse.json(
            { 
              error: 'outside_working_hours',
              message: 'La hora seleccionada está fuera del horario de trabajo del profesional.'
            },
            { status: 400 }
          )
        }
      }
    }

    // Verificar conflictos con citas existentes
    const { data: existingAppointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id, appointment_date, appointment_time, duration_minutes, status')
      .eq('professional_id', professionalId)
      .eq('appointment_date', appointmentDate)
      .in('status', ['pending', 'confirmed'])
    
    if (appointmentsError) {
      console.error('Error checking existing appointments:', appointmentsError)
    }

    // Verificar si hay conflicto de horarios
    if (existingAppointments && existingAppointments.length > 0) {
      const appointmentTimeMinutes = parseInt(appointmentTime.split(':')[0]) * 60 + parseInt(appointmentTime.split(':')[1])

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
          return NextResponse.json(
            { 
              error: 'time_conflict',
              message: 'Este horario ya está ocupado. Por favor, selecciona otro horario.'
            },
            { status: 400 }
          )
        }
      }
    }

    // Obtener precio correcto según el tipo de consulta
    let price = professional.consultation_price || 0
    if (type === 'online' && professional.online_price) {
      price = professional.online_price
    } else if (type === 'in-person' && professional.in_person_price) {
      price = professional.in_person_price
    }

    // Crear la cita
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        patient_id: user.id,
        professional_id: professionalId,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        duration_minutes: duration,
        type: type,
        status: 'pending',
        price: price,
        payment_status: 'pending',
      })
      .select()
      .single()

    if (appointmentError) {
      console.error('Error creating appointment:', appointmentError)
      return NextResponse.json(
        { 
          error: 'creation_failed',
          message: 'No pudimos crear la cita. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    // TODO: Enviar recordatorio automático (implementar con cron job o webhook)

    return NextResponse.json({
      success: true,
      appointment,
      message: 'Cita creada exitosamente. Te enviaremos un recordatorio antes de la fecha.'
    })
  } catch (error) {
    console.error('Create appointment error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

