import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { getJitsiMeetingUrl } from '@/lib/utils/jitsi'

/**
 * POST /api/appointments/[id]/meeting
 * Genera y almacena el enlace de Jitsi Meet para una cita online
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: appointmentId } = await context.params

    if (!appointmentId) {
      return NextResponse.json(
        {
          error: 'missing_appointment_id',
          message: 'ID de cita requerido',
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verificar autenticación
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        {
          error: 'unauthorized',
          message: 'Por favor, inicia sesión para acceder a esta funcionalidad.',
        },
        { status: 401 }
      )
    }

    // Obtener información de la cita
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('id, patient_id, professional_id, appointment_date, appointment_time, duration_minutes, type, status, meeting_link, meeting_room_id')
      .eq('id', appointmentId)
      .single()

    if (appointmentError || !appointment) {
      console.error('Error obteniendo cita:', appointmentError)
      return NextResponse.json(
        {
          error: 'appointment_not_found',
          message: 'Cita no encontrada',
        },
        { status: 404 }
      )
    }

    // Validar que la cita sea de tipo online
    if (appointment.type !== 'online') {
      return NextResponse.json(
        {
          error: 'not_online_appointment',
          message: 'Esta cita no es de tipo online. Solo las citas online requieren meeting links.',
        },
        { status: 400 }
      )
    }

    // Validar que la cita no esté cancelada
    if (appointment.status === 'cancelled') {
      return NextResponse.json(
        {
          error: 'appointment_cancelled',
          message: 'No se puede generar un meeting link para una cita cancelada.',
        },
        { status: 400 }
      )
    }

    // Validar que la cita no haya pasado
    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`)
    const appointmentEndTime = new Date(appointmentDateTime.getTime() + (appointment.duration_minutes || 60) * 60 * 1000)
    const now = new Date()
    
    if (appointmentEndTime < now) {
      return NextResponse.json(
        {
          error: 'appointment_past',
          message: 'No se puede generar un meeting link para una cita que ya pasó.',
        },
        { status: 400 }
      )
    }

    // Validar que el usuario tenga acceso (paciente o profesional)
    const isPatient = appointment.patient_id === user.id
    const isProfessional = appointment.professional_id === user.id

    if (!isPatient && !isProfessional) {
      return NextResponse.json(
        {
          error: 'unauthorized',
          message: 'No tienes permiso para acceder a esta cita.',
        },
        { status: 403 }
      )
    }

    // Si ya existe un meeting_link, verificar si es válido
    if (appointment.meeting_link && appointment.meeting_room_id) {
      // Verificar si el room aún es válido (no expirado y cita no pasó)
      const { data: roomData } = await supabase
        .from('appointments')
        .select('meeting_expires_at, appointment_date, appointment_time, duration_minutes')
        .eq('id', appointmentId)
        .single()

      if (roomData?.meeting_expires_at) {
        const expirationDate = new Date(roomData.meeting_expires_at)
        const now = new Date()
        
        // Verificar que no haya expirado
        if (expirationDate > now) {
          // Verificar también que la cita no haya pasado completamente
          const appointmentDateTime = new Date(`${roomData.appointment_date}T${roomData.appointment_time}`)
          const appointmentEndTime = new Date(appointmentDateTime.getTime() + (roomData.duration_minutes || 60) * 60 * 1000)
          
          // Si la cita ya pasó hace más de 24 horas, el room no debería ser válido
          // Pero como la expiración ya está configurada, confiamos en ella
          if (expirationDate > now) {
            // Room aún válido
            return NextResponse.json({
              success: true,
              meeting_link: appointment.meeting_link,
              meeting_room_id: appointment.meeting_room_id,
              expires_at: roomData.meeting_expires_at,
              message: 'Meeting link ya existe y es válido',
            })
          }
        }
        // Room expirado, continuar para crear uno nuevo
      } else {
        // No hay expiración configurada, verificar que la cita no haya pasado
        if (roomData?.appointment_date && roomData?.appointment_time) {
          const appointmentDateTime = new Date(`${roomData.appointment_date}T${roomData.appointment_time}`)
          const appointmentEndTime = new Date(appointmentDateTime.getTime() + (roomData.duration_minutes || 60) * 60 * 1000)
          const now = new Date()
          
          // Si la cita ya pasó hace más de 24 horas, el link no debería ser válido
          const hoursSinceAppointment = (now.getTime() - appointmentEndTime.getTime()) / (1000 * 60 * 60)
          if (hoursSinceAppointment > 24) {
            // Cita pasó hace más de 24h, crear nuevo room
          } else {
            // Retornar el existente
            return NextResponse.json({
              success: true,
              meeting_link: appointment.meeting_link,
              meeting_room_id: appointment.meeting_room_id,
              message: 'Meeting link ya existe',
            })
          }
        } else {
          // Sin información de fecha, retornar el existente
          return NextResponse.json({
            success: true,
            meeting_link: appointment.meeting_link,
            meeting_room_id: appointment.meeting_room_id,
            message: 'Meeting link ya existe',
          })
        }
      }
    }

    // Verificar nuevamente que no se haya creado un room mientras procesábamos
    // (protección contra race conditions)
    const { data: appointmentCheck, error: checkError } = await supabase
      .from('appointments')
      .select('meeting_link, meeting_room_id, meeting_expires_at')
      .eq('id', appointmentId)
      .single()

    if (!checkError && appointmentCheck?.meeting_link && appointmentCheck?.meeting_room_id) {
      // Verificar si el room es válido (no expirado)
      if (appointmentCheck.meeting_expires_at) {
        const expirationDate = new Date(appointmentCheck.meeting_expires_at)
        if (expirationDate > new Date()) {
          // Room válido creado por otra request, retornarlo
          return NextResponse.json({
            success: true,
            meeting_link: appointmentCheck.meeting_link,
            meeting_room_id: appointmentCheck.meeting_room_id,
            expires_at: appointmentCheck.meeting_expires_at,
            message: 'Meeting link ya existe y es válido (creado por otra solicitud)',
          })
        }
      } else if (appointmentCheck.meeting_link) {
        // Existe meeting_link pero sin expiración, retornarlo
        return NextResponse.json({
          success: true,
          meeting_link: appointmentCheck.meeting_link,
          meeting_room_id: appointmentCheck.meeting_room_id,
          message: 'Meeting link ya existe',
        })
      }
    }

    // Crear nuevo enlace en Jitsi
    // Para Jitsi, no hay "expiración" estricta, pero ponemos una fecha de caducidad
    // de 2 horas después de la cita como límite lógico
    const expirationDate = appointmentEndTime
    expirationDate.setHours(expirationDate.getHours() + 1) // +1 hora extra de margen

    const jitsiUrl = getJitsiMeetingUrl(appointmentId)

    // Guardar meeting link en la cita
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        meeting_link: jitsiUrl,
        meeting_room_id: `nurea-${appointmentId}`, // ID auxiliar
        video_platform: 'jitsi',
        meeting_expires_at: expirationDate.toISOString(),
      })
      .eq('id', appointmentId)

    if (updateError) {
      console.error('Error actualizando cita con meeting link:', updateError)
      return NextResponse.json(
        {
          error: 'update_failed',
          message:
            'Se generó el enlace pero no pudimos guardarlo. Por favor, intenta de nuevo.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      meeting_link: jitsiUrl,
      meeting_room_id: `nurea-${appointmentId}`,
      expires_at: expirationDate.toISOString(),
      message: 'Meeting link creado exitosamente',
    })
  } catch (error) {
    console.error('Error en POST /api/appointments/[id]/meeting:', error)
    return NextResponse.json(
      {
        error: 'server_error',
        message:
          'Algo salió mal. Por favor, intenta nuevamente en unos momentos.',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/appointments/[id]/meeting
 * Obtiene el meeting link de una cita
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: appointmentId } = await context.params

    if (!appointmentId) {
      return NextResponse.json(
        {
          error: 'missing_appointment_id',
          message: 'ID de cita requerido',
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verificar autenticación
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        {
          error: 'unauthorized',
          message: 'Por favor, inicia sesión para acceder a esta funcionalidad.',
        },
        { status: 401 }
      )
    }

    // Obtener información de la cita
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('id, patient_id, professional_id, type, meeting_link, meeting_room_id, meeting_expires_at, video_platform')
      .eq('id', appointmentId)
      .single()

    if (appointmentError || !appointment) {
      return NextResponse.json(
        {
          error: 'appointment_not_found',
          message: 'Cita no encontrada',
        },
        { status: 404 }
      )
    }

    // Validar acceso
    const isPatient = appointment.patient_id === user.id
    const isProfessional = appointment.professional_id === user.id

    if (!isPatient && !isProfessional) {
      return NextResponse.json(
        {
          error: 'unauthorized',
          message: 'No tienes permiso para acceder a esta cita.',
        },
        { status: 403 }
      )
    }

    // Validar que sea cita online
    if (appointment.type !== 'online') {
      return NextResponse.json(
        {
          error: 'not_online_appointment',
          message: 'Esta cita no es de tipo online',
        },
        { status: 400 }
      )
    }

    // Verificar si el meeting expiró
    let isExpired = false
    if (appointment.meeting_expires_at) {
      const expirationDate = new Date(appointment.meeting_expires_at)
      isExpired = expirationDate <= new Date()
    }

    if (!appointment.meeting_link) {
      return NextResponse.json(
        {
          error: 'no_meeting_link',
          message: 'Esta cita no tiene un meeting link asociado aún.',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      meeting_link: appointment.meeting_link,
      meeting_room_id: appointment.meeting_room_id,
      video_platform: appointment.video_platform || 'jitsi',
      expires_at: appointment.meeting_expires_at,
      is_expired: isExpired,
    })
  } catch (error) {
    console.error('Error en GET /api/appointments/[id]/meeting:', error)
    return NextResponse.json(
      {
        error: 'server_error',
        message:
          'Algo salió mal. Por favor, intenta nuevamente en unos momentos.',
      },
      { status: 500 }
    )
  }
}
