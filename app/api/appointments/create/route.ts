import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isFutureDateTime, combineDateTime } from '@/lib/utils/date-helpers'
import { normalizeAvailability, getAvailabilityForType, hasAnyAvailability } from '@/lib/utils/availability-helpers'

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
      .select('consultation_price, online_price, in_person_price, consultation_type, availability, specialty, bio, bank_account, bank_name, registration_number, registration_institution')
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
      return NextResponse.json(
        { 
          error: 'professional_profile_incomplete',
          message: 'El profesional aún no ha completado su configuración de perfil. Por favor, contacta al profesional o intenta más tarde.',
          missingFields
        },
        { status: 400 }
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
    
    // Normalizar disponibilidad al nuevo formato
    const normalizedAvailability = normalizeAvailability(
      professional.availability || {},
      professional.consultation_type || 'both'
    )
    
    // Obtener disponibilidad para el tipo de consulta solicitado
    const dayAvailability = getAvailabilityForType(normalizedAvailability, type, dayName)

    if (!dayAvailability || !dayAvailability.available) {
      return NextResponse.json(
        { 
          error: 'day_not_available',
          message: `El profesional no tiene disponibilidad ${type === 'online' ? 'online' : 'presencial'} en este día.`
        },
        { status: 400 }
      )
    }

    // Verificar que la hora esté dentro del horario de trabajo para este tipo
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
              message: 'La hora seleccionada está fuera del horario de trabajo del profesional para este tipo de consulta.'
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

    // Obtener información del paciente y profesional para el mensaje
    const { data: patientProfile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', user.id)
      .single()

    const { data: professionalProfile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', professionalId)
      .single()

    const patientName = patientProfile ? `${patientProfile.first_name || ''} ${patientProfile.last_name || ''}`.trim() : 'Paciente'
    const professionalName = professionalProfile ? `${professionalProfile.first_name || ''} ${professionalProfile.last_name || ''}`.trim() : professional.specialty || 'Profesional'

    // Formatear fecha y hora para el mensaje
    const appointmentDateObj = new Date(`${appointmentDate}T${appointmentTime}`)
    const formattedDate = appointmentDateObj.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const formattedTime = appointmentTime
    const typeLabel = type === 'online' ? 'Online' : 'Presencial'

    // Crear mensaje predefinido en el chat
    const messageContent = `¡Hola! Tu cita ha sido confirmada exitosamente.

📅 Fecha: ${formattedDate}
🕐 Hora: ${formattedTime}
💻 Tipo: ${typeLabel}
👨‍⚕️ Profesional: ${professionalName}

Te recordaremos 24 horas antes de tu cita. Si necesitas cambiar o cancelar, puedes hacerlo desde tu panel de citas.

¡Nos vemos pronto!`

    // Crear mensaje en la tabla messages (del profesional al paciente)
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        sender_id: professionalId,
        receiver_id: user.id,
        content: messageContent,
        read: false,
      })

    if (messageError) {
      console.error('Error creating message:', messageError)
      // No fallar la creación de la cita si el mensaje falla
    }

    // Enviar email de confirmación (usando template)
    // Nota: En producción, esto debería usar un servicio de email real (SendGrid, Resend, etc.)
    // Por ahora, solo logueamos que se debería enviar
    try {
      const { appointmentConfirmedEmail } = await import('@/lib/emails/templates')
      const emailTemplate = appointmentConfirmedEmail({
        patientName,
        professionalName,
        appointmentDate: formattedDate,
        appointmentTime: formattedTime,
        appointmentType: type,
      })
      
      // TODO: Implementar envío real de email con servicio de email
      // Por ahora, solo logueamos
      console.log('Email de confirmación preparado:', {
        to: patientProfile?.email,
        subject: emailTemplate.subject,
      })
    } catch (emailError) {
      console.error('Error preparing email:', emailError)
      // No fallar la creación de la cita si el email falla
    }

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

