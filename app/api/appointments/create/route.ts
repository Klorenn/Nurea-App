import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isFutureDateTime, combineDateTime } from '@/lib/utils/date-helpers'
import { normalizeAvailability, getAvailabilityForType, hasAnyAvailability } from '@/lib/utils/availability-helpers'
import { sanitizeMessage } from '@/lib/utils/sanitize'

export async function POST(request: Request) {
  try {
    const { professionalId, appointmentDate, appointmentTime, type, duration = 60, consultationReason, isFirstVisit } = await request.json()

    console.log("[APPOINTMENTS:CREATE]", { professionalId, patientId: "(resolved after auth)", date: appointmentDate, time: appointmentTime, type, duration })

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

    // Para agendar NO bloqueamos por campos de perfil (bio/specialty/precios).
    // La validación se centra en que el profesional tenga disponibilidad para el tipo elegido.
    if (!hasAnyAvailability(professional.availability, type)) {
      return NextResponse.json(
        {
          error: 'professional_profile_incomplete',
          message:
            'El profesional aún no ha completado su configuración de perfil. Por favor, contacta al profesional o intenta más tarde.',
          missingFields: ['availability']
        },
        { status: 400 }
      )
    }

    // Verificar que el tipo de consulta esté disponible para el profesional.
    // Si `consultation_type` viene vacío, lo tratamos como "both" para no bloquear agendamientos
    // cuando el horario sí está configurado.
    const consultationType = professional.consultation_type || 'both'

    if (type === 'online' && consultationType !== 'online' && consultationType !== 'both') {
      return NextResponse.json(
        { 
          error: 'consultation_type_not_available',
          message: 'Este profesional no ofrece consultas online.'
        },
        { status: 400 }
      )
    }

    if (type === 'in-person' && consultationType !== 'in-person' && consultationType !== 'both') {
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

    // Usar función RPC atómica para crear la cita (previene race conditions)
    // Si la RPC no existe, caer a INSERT directo
    let appointmentId: string | null = null
    let useRpc = true
    
    const { data: rpcResult, error: rpcError } = await supabase.rpc('create_appointment_atomic', {
      p_professional_id: professionalId,
      p_patient_id: user.id,
      p_appointment_date: appointmentDate,
      p_appointment_time: appointmentTime,
      p_duration_minutes: duration,
      p_status: 'pending',
      p_is_online: type === 'online',
      p_notes: normalizedConsultationReason || null,
      p_price: price,
      p_payment_status: 'pending',
    })

    // Si RPC falla (no existe la función), usar INSERT directo
    if (rpcError) {
      console.warn('RPC create_appointment_atomic not available, falling back to INSERT:', rpcError.message)
      useRpc = false
      
      const { data: insertResult, error: insertError } = await supabase
        .from('appointments')
        .insert({
          patient_id: user.id,
          professional_id: professionalId,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          duration_minutes: duration,
          status: 'pending',
          is_online: type === 'online',
          notes: normalizedConsultationReason || null,
          price: price,
          payment_status: 'pending',
        })
        .select('id')
        .single()
      
      if (insertError) {
        console.error('Error creating appointment (INSERT):', insertError)
        return NextResponse.json(
          { 
            error: 'creation_failed',
            message: 'No pudimos crear la cita. Por favor, intenta nuevamente.'
          },
          { status: 500 }
        )
      }
      
      appointmentId = insertResult.id
    }

    if (useRpc) {
      if (rpcError) {
        console.error('Error calling create_appointment_atomic RPC:', rpcError)
        return NextResponse.json(
          { 
            error: 'creation_failed',
            message: 'No pudimos crear la cita. Por favor, intenta nuevamente.'
          },
          { status: 500 }
        )
      }

      // Verificar resultado de la función RPC
      if (!rpcResult?.success) {
        console.error('Appointment creation failed:', rpcResult)
        
        const errorCodeMap: Record<string, { status: number, message: string }> = {
          'SAME_USER': { status: 400, message: 'No puedes agendar una cita contigo mismo.' },
          'PAST_DATE': { status: 400, message: 'No se pueden crear citas en fechas pasadas.' },
          'INVALID_DURATION': { status: 400, message: 'La duración debe ser entre 15 y 180 minutos.' },
          'SLOT_OCCUPIED': { status: 409, message: 'Este horario ya está ocupado. Por favor, selecciona otro horario.' },
          'INTERNAL_ERROR': { status: 500, message: 'Error interno. Por favor, intenta nuevamente.' },
        }

        const errorInfo = errorCodeMap[rpcResult?.error_code] || { status: 400, message: rpcResult?.error_message || 'Error al crear la cita.' }
        
        return NextResponse.json(
          { 
            error: rpcResult?.error_code || 'creation_failed',
            message: errorInfo.message
          },
          { status: errorInfo.status }
        )
      }

      // La cita fue creada exitosamente por la función RPC
      appointmentId = rpcResult.appointment?.id
    }

    if (!appointmentId) {
      return NextResponse.json(
        { 
          error: 'creation_failed',
          message: 'No pudimos obtener el ID de la cita creada.'
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
        
        meetingLink = getJitsiMeetingUrl(appointmentId)
        meetingRoomId = `nurea-${appointmentId}`

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
          .eq('id', appointmentId)

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

    const formattedDate = appointmentDateObj.toLocaleDateString('es-CL', {
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

    // IMPORTANTE:
    // Enviar también el "motivo de consulta" como MENSAJE hacia la doctora.
    // Esto es lo que necesita ver el/la profesional en su inbox/chat cuando el paciente agenda.
    if (normalizedConsultationReason) {
      const patientToProfessionalContent = `📝 Motivo de consulta: ${normalizedConsultationReason}\n\n📅 Fecha: ${formattedDate}\n🕐 Hora: ${formattedTime}\n💻 Tipo: ${typeLabel}\n\n👨‍⚕️ Profesional: ${professionalName}\n\nPrimera vez: ${firstVisitLabel}`

      const sanitizedPatientMessage = sanitizeMessage(patientToProfessionalContent)

      const { error: patientMsgError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id, // paciente -> profesional
          receiver_id: professionalId,
          content: sanitizedPatientMessage,
          read: false,
        })

      if (patientMsgError) {
        console.error('Error creating patient->professional consultation message:', patientMsgError)
      }
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
        const { success, error: emailError } = await sendAppointmentConfirmation(
          patientProfile.email,
          emailTemplate,
          'es'
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

    // Obtener la cita creada para incluir en la respuesta
    const { data: createdAppointment } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single()

    // Incluir meeting_link en la respuesta si existe (para que el frontend pueda usarlo inmediatamente)
    return NextResponse.json({
      success: true,
      appointment: {
        ...createdAppointment,
        meeting_link: meetingLink || createdAppointment?.meeting_link || null,
        meeting_room_id: meetingRoomId || createdAppointment?.meeting_room_id || null,
      },
      meetingLink: meetingLink || null, // Incluir explícitamente para fácil acceso
      message: type === 'online' && !meetingLink
        ? 'Cita creada exitosamente. El enlace de la reunión se generará próximamente. Te enviaremos un recordatorio antes de la fecha.'
        : 'Cita creada exitosamente. Te enviaremos un recordatorio antes de la fecha.'
    })
  } catch (error: any) {
    console.error("[APPOINTMENTS:CREATE:ERROR]", error?.message ?? error)
    return NextResponse.json(
      {
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

