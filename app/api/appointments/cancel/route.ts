import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { appointmentId, reason } = await request.json()

    if (!appointmentId) {
      return NextResponse.json(
        { 
          error: 'missing_fields',
          message: 'Por favor, proporciona el ID de la cita.'
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
          message: 'Por favor, inicia sesión para cancelar una cita.'
        },
        { status: 401 }
      )
    }

    // Verificar que la cita existe y que el usuario es paciente o profesional de la cita
    // Incluir explícitamente meeting_room_id para poder eliminarlo si es necesario
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*, meeting_room_id, type, appointment_date, appointment_time, duration_minutes, patient_id, professional_id')
      .eq('id', appointmentId)
      .single()

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { 
          error: 'appointment_not_found',
          message: 'No se encontró la cita.'
        },
        { status: 404 }
      )
    }

    // Verificar que el usuario es el paciente o el profesional de la cita
    const isPatient = appointment.patient_id === user.id
    const isProfessional = appointment.professional_id === user.id

    if (!isPatient && !isProfessional) {
      return NextResponse.json(
        { 
          error: 'unauthorized',
          message: 'No tienes permiso para cancelar esta cita.'
        },
        { status: 403 }
      )
    }

    // Verificar que la cita no esté completada
    if (appointment.status === 'completed') {
      return NextResponse.json(
        { 
          error: 'invalid_status',
          message: 'No se puede cancelar una cita que ya fue completada.'
        },
        { status: 400 }
      )
    }

    // Verificar que la cita no esté ya cancelada
    if (appointment.status === 'cancelled') {
      return NextResponse.json(
        { 
          error: 'already_cancelled',
          message: 'Esta cita ya está cancelada.'
        },
        { status: 400 }
      )
    }

    // Calcular reembolso solo si el PACIENTE cancela
    // Si el profesional cancela, el paciente siempre recibe reembolso completo
    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`)
    const now = new Date()
    const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    let refundAmount = 0
    let refundMessage = ''
    
    if (isProfessional) {
      // Si el profesional cancela, reembolso completo siempre
      refundAmount = appointment.price || 0
      refundMessage = 'Reembolso completo aplicado. El dinero será devuelto en 3-5 días hábiles.'
    } else if (isPatient) {
      // Si el paciente cancela, aplicar política de reembolso
      // Si la cita ya pasó, no debería haber reembolso (aunque esto no debería ocurrir por validación previa)
      if (hoursUntilAppointment < 0) {
        refundMessage = 'La cita ya pasó. No hay reembolso disponible para citas en el pasado.'
      } else if (hoursUntilAppointment > 24) {
        // Política: Reembolso completo si se cancela con más de 24 horas de anticipación
        refundAmount = appointment.price || 0
        refundMessage = 'Reembolso completo aplicado. El dinero será devuelto en 3-5 días hábiles.'
      } else if (hoursUntilAppointment > 12) {
        // Reembolso del 50% si se cancela entre 12-24 horas antes
        refundAmount = (appointment.price || 0) * 0.5
        refundMessage = 'Reembolso del 50% aplicado. El dinero será devuelto en 3-5 días hábiles.'
      } else {
        refundMessage = 'No hay reembolso disponible por cancelación con menos de 12 horas de anticipación.'
      }
    }

    // Actualizar la cita
    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        payment_status: refundAmount > 0 ? 'refunded' : appointment.payment_status,
        notes: reason ? `Cancelación: ${reason}` : appointment.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId)
      .select()
      .single()

    if (updateError) {
      console.error('Error cancelling appointment:', updateError)
      return NextResponse.json(
        { 
          error: 'update_failed',
          message: 'No pudimos cancelar la cita. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    // Si es cita online y tiene meeting room, no necesitamos hacer nada para Jitsi.
    // (Jitsi no requiere eliminación de rooms por API).

    // Obtener información del paciente y profesional para el email
    const { data: patientProfile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', appointment.patient_id)
      .single()

    const { data: professionalProfile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', appointment.professional_id)
      .single()

    const patientName = patientProfile ? `${patientProfile.first_name || ''} ${patientProfile.last_name || ''}`.trim() : 'Paciente'
    const professionalName = professionalProfile ? `${professionalProfile.first_name || ''} ${professionalProfile.last_name || ''}`.trim() : 'Profesional'

    // Formatear fecha para el email
    const appointmentDateObj = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`)
    const formattedDate = appointmentDateObj.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const formattedTime = appointment.appointment_time

    // Enviar email de cancelación al paciente (siempre)
    if (patientProfile?.email) {
      try {
        const { appointmentCancelledEmail } = await import('@/lib/emails/templates')
        const { sendAppointmentCancellation } = await import('@/lib/services/email')

        // Ajustar mensaje según quién canceló
        const cancellationReason = reason 
          ? (isProfessional ? `Cancelada por el profesional. Motivo: ${reason}` : reason)
          : (isProfessional ? 'Cancelada por el profesional' : undefined)

        const emailTemplate = appointmentCancelledEmail({
          patientName,
          professionalName,
          appointmentDate: formattedDate,
          appointmentTime: formattedTime,
          appointmentType: appointment.type as 'online' | 'in-person',
          refundAmount: refundAmount > 0 ? refundAmount : undefined,
          refundMessage: refundMessage || undefined,
          reason: cancellationReason,
        })

        const language = 'es' // Determinar idioma si es posible
        const { success, error: emailError } = await sendAppointmentCancellation(
          patientProfile.email,
          emailTemplate,
          language
        )

        if (!success) {
          console.error('Error enviando email de cancelación al paciente:', emailError)
          // No fallar la cancelación si el email falla
        } else {
          console.log('Email de cancelación enviado exitosamente al paciente:', patientProfile.email)
        }
      } catch (emailError) {
        console.error('Error preparando o enviando email de cancelación al paciente:', emailError)
        // No fallar la cancelación si el email falla
      }
    }

    // Enviar notificación al profesional si el paciente canceló
    if (isPatient && professionalProfile?.email) {
      try {
        // TODO: Crear template de email para notificar al profesional sobre cancelación del paciente
        console.log(`TODO: Enviar notificación de cancelación al profesional ${professionalProfile.email}`)
        // Por ahora solo logueamos, se implementará después con template específico
      } catch (emailError) {
        console.error('Error preparando notificación para profesional:', emailError)
      }
    }

    // El pago de la consulta se coordina directamente con el profesional; no hay reembolso vía plataforma.

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment,
      refundAmount,
      message: refundMessage || 'Cita cancelada exitosamente.'
    })
  } catch (error) {
    console.error('Cancel appointment error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

