import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isFutureDateTime, combineDateTime } from '@/lib/utils/date-helpers'
import { normalizeAvailability, getAvailabilityForType, hasAnyAvailability } from '@/lib/utils/availability-helpers'

export async function POST(request: Request) {
  try {
    const { professionalId, appointmentDate, appointmentTime, type, duration = 60, consultationReason, isFirstVisit } = await request.json()

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
      .select('consultation_price, online_price, in_person_price, consultation_type, availability, specialty, bio, registration_number, registration_institution')
      .eq('id', professionalId)
      .single()

    if (profError) {
      // Si Supabase falla (ej. por schema/columnas), no corresponde mostrar
      // "no se encontró": es un problema técnico del backend.
      console.error("Appointments create: professional lookup error:", profError)
      return NextResponse.json(
        { error: "professional_lookup_failed", message: "Error al cargar el profesional." },
        { status: 500 }
      )
    }

    if (!professional) {
      return NextResponse.json(
        {
          error: "professional_not_found",
          message: "No se encontró el profesional seleccionado."
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

    const normalizedConsultationReason =
      typeof consultationReason === "string" ? consultationReason.trim() : ""
    const normalizedIsFirstVisit: boolean | null =
      typeof isFirstVisit === "boolean"
        ? isFirstVisit
        : typeof isFirstVisit === "string"
          ? isFirstVisit === "true"
            ? true
            : isFirstVisit === "false"
              ? false
              : null
          : null

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
      const pgCode = (appointmentError as any)?.code as string | undefined
      if (pgCode === '23505' || pgCode === '23P01') {
        return NextResponse.json(
          {
            error: 'time_conflict',
            message: 'Este horario ya está ocupado. Por favor, selecciona otro horario.',
          },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { 
          error: 'creation_failed',
          message: 'No pudimos crear la cita. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    // Formatear fecha y hora para el mensaje y la caducidad
    const appointmentDateObj = new Date(`${appointmentDate}T${appointmentTime}`)

    // Si es cita online, generar meeting link automáticamente
    let meetingLink: string | null = null
    let meetingRoomId: string | null = null
    let meetingExpiresAt: Date | null = null

    if (type === 'online') {
      try {
        const { getJitsiMeetingUrl } = await import('@/lib/utils/jitsi')
        
        meetingLink = getJitsiMeetingUrl(appointment.id)
        meetingRoomId = `nurea-${appointment.id}`

        // Jitsi no tiene expiración estricta, pero ponemos 2 horas después como referencia
        const appointmentEndTime = new Date(appointmentDateObj.getTime() + duration * 60 * 1000)
        appointmentEndTime.setHours(appointmentEndTime.getHours() + 1)
        meetingExpiresAt = appointmentEndTime

        // Actualizar la cita con el meeting link
        const { error: updateError } = await supabase
          .from('appointments')
          .update({
            meeting_link: meetingLink,
            meeting_room_id: meetingRoomId,
            video_platform: 'jitsi',
            meeting_expires_at: meetingExpiresAt.toISOString(),
          })
          .eq('id', appointment.id)

        if (updateError) {
          console.error('Error actualizando cita con meeting link:', updateError)
        }
      } catch (meetingError) {
        console.error('Error generando meeting link:', meetingError)
      }
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

    const formattedDate = appointmentDateObj.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const formattedTime = appointmentTime
    const typeLabel = type === 'online' ? 'Online' : 'Presencial'
    const firstVisitLabel =
      normalizedIsFirstVisit === null
        ? "No especificado"
        : normalizedIsFirstVisit
          ? "Sí (primera vez)"
          : "No"

    // Crear mensaje predefinido en el chat
    // IMPORTANTE: El mensaje se crea DESPUÉS de intentar crear el meeting para incluir el link solo si existe
    let messageContent = `¡Hola! Tu cita ha sido confirmada exitosamente.

📅 Fecha: ${formattedDate}
🕐 Hora: ${formattedTime}
💻 Tipo: ${typeLabel}
👨‍⚕️ Profesional: ${professionalName}`

    if (normalizedConsultationReason) {
      messageContent += `\n\n📝 Motivo de consulta: ${normalizedConsultationReason}`
    }
    messageContent += `\n\n🏁 Primera vez: ${firstVisitLabel}`

    // Agregar meeting link solo si es online y el link fue creado exitosamente
    if (type === 'online') {
      if (meetingLink && meetingRoomId) {
        messageContent += `\n\n🔗 Enlace de la reunión: ${meetingLink}\n\nPuedes unirte a la reunión desde tu panel de citas o usando el enlace de arriba.`
      } else {
        // Si es online pero el meeting falló, mencionarlo pero no bloquear
        messageContent += `\n\n⚠️ El enlace de la reunión se generará próximamente. Te notificaremos cuando esté disponible.`
      }
    }

    messageContent += `\n\nTe recordaremos 24 horas antes de tu cita. Si necesitas cambiar o cancelar, puedes hacerlo desde tu panel de citas.\n\n¡Nos vemos pronto!`

    // Crear mensaje en la tabla messages (del profesional al paciente)
    // Sanitizar contenido del mensaje antes de insertar
    const { sanitizeMessage } = await import('@/lib/utils/sanitize')
    const sanitizedMessageContent = sanitizeMessage(messageContent)

    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        sender_id: professionalId,
        receiver_id: user.id,
        content: sanitizedMessageContent,
        read: false,
      })

    if (messageError) {
      console.error('Error creating message:', messageError)
      // No fallar la creación de la cita si el mensaje falla
    }

    // Enviar también los datos de la consulta como primer mensaje al sistema de chat moderno
    // (conversaciones + chat_messages), para que el especialista lo vea al aceptar.
    try {
      const { data: conversationId } = await supabase.rpc("get_or_create_conversation", {
        p_user_a: user.id,
        p_user_b: professionalId,
        p_professional_id: professionalId,
      })

      if (conversationId) {
        const systemContent =
          `Motivo de consulta: ${normalizedConsultationReason || "No especificado"}\n` +
          `Primera vez con el especialista: ${firstVisitLabel}`

        const { error: chatInsertError } = await supabase
          .from("chat_messages")
          .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            content: systemContent,
            message_type: "system",
            status: "sent",
          })

        if (chatInsertError) {
          console.error("Error inserting into chat_messages:", chatInsertError)
        }
      }
    } catch (chatConvError) {
      console.error("Error creating chat conversation/message:", chatConvError)
    }

    // Enviar email de confirmación
    if (patientProfile?.email) {
      try {
        const { appointmentConfirmedEmail } = await import('@/lib/emails/templates')
        const { sendAppointmentConfirmation } = await import('@/lib/services/email')
        
        // Obtener dirección si es presencial (se implementará después)
        let address: string | undefined = undefined
        
        // Solo incluir meetingLink en el email si fue creado exitosamente
        const emailTemplate = appointmentConfirmedEmail({
          patientName,
          professionalName,
          appointmentDate: formattedDate,
          appointmentTime: formattedTime,
          appointmentType: type,
          meetingLink: (meetingLink && meetingRoomId) ? meetingLink : undefined,
          address: address,
        })
        
        // Enviar email
        const language = patientProfile.email?.includes('@') ? 'es' : 'es' // Determinar idioma si es posible
        const { success, error: emailError } = await sendAppointmentConfirmation(
          patientProfile.email,
          emailTemplate,
          language
        )
        
        if (!success) {
          console.error('Error enviando email de confirmación:', emailError)
          // No fallar la creación de la cita si el email falla
        } else {
          console.log('Email de confirmación enviado exitosamente a:', patientProfile.email)
        }
      } catch (emailError) {
        console.error('Error preparando o enviando email:', emailError)
        // No fallar la creación de la cita si el email falla
      }
    }

    // Incluir meeting_link en la respuesta si existe (para que el frontend pueda usarlo inmediatamente)
    return NextResponse.json({
      success: true,
      appointment: {
        ...appointment,
        meeting_link: meetingLink || appointment.meeting_link || null,
        meeting_room_id: meetingRoomId || appointment.meeting_room_id || null,
      },
      meetingLink: meetingLink || null, // Incluir explícitamente para fácil acceso
      message: type === 'online' && !meetingLink
        ? 'Cita creada exitosamente. El enlace de la reunión se generará próximamente. Te enviaremos un recordatorio antes de la fecha.'
        : 'Cita creada exitosamente. Te enviaremos un recordatorio antes de la fecha.'
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

