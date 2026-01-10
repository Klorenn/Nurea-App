import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { appointmentId, newDate, newTime } = await request.json()

    if (!appointmentId || !newDate || !newTime) {
      return NextResponse.json(
        { 
          error: 'missing_fields',
          message: 'Por favor, completa todos los campos requeridos.'
        },
        { status: 400 }
      )
    }

    // Validar formato de fecha
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      return NextResponse.json(
        { 
          error: 'invalid_date_format',
          message: 'Formato de fecha inválido. Use YYYY-MM-DD.'
        },
        { status: 400 }
      )
    }

    // Validar formato de hora
    if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(newTime)) {
      return NextResponse.json(
        { 
          error: 'invalid_time_format',
          message: 'Formato de hora inválido. Use HH:MM.'
        },
        { status: 400 }
      )
    }

    // Validar que la nueva fecha/hora sea en el futuro
    const newDateTime = new Date(`${newDate}T${newTime}`)
    const now = new Date()
    if (newDateTime <= now) {
      return NextResponse.json(
        { 
          error: 'past_datetime',
          message: 'No se puede reagendar una cita en el pasado.'
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
          message: 'Por favor, inicia sesión para reagendar una cita.'
        },
        { status: 401 }
      )
    }

    // Verificar que la cita existe y pertenece al usuario
    // Incluir campos necesarios para manejo de meeting rooms si es online
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*, type, meeting_room_id, meeting_link, appointment_date, appointment_time')
      .eq('id', appointmentId)
      .eq('patient_id', user.id)
      .single()

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { 
          error: 'appointment_not_found',
          message: 'No se encontró la cita o no tienes permiso para modificarla.'
        },
        { status: 404 }
      )
    }

    // Verificar que la cita no esté completada o cancelada
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return NextResponse.json(
        { 
          error: 'invalid_status',
          message: 'No se puede reagendar una cita completada o cancelada.'
        },
        { status: 400 }
      )
    }

    // Verificar disponibilidad básica (verificar conflictos con otras citas del profesional)
    const { data: conflictingAppointments } = await supabase
      .from('appointments')
      .select('id')
      .eq('professional_id', appointment.professional_id)
      .eq('appointment_date', newDate)
      .eq('appointment_time', newTime)
      .in('status', ['pending', 'confirmed'])
      .neq('id', appointmentId)
      .limit(1)

    if (conflictingAppointments && conflictingAppointments.length > 0) {
      return NextResponse.json(
        { 
          error: 'time_conflict',
          message: 'Este horario ya está ocupado. Por favor, selecciona otro horario.'
        },
        { status: 400 }
      )
    }

    // Si es cita online y tiene meeting room, eliminar el room antiguo
    // El nuevo room se creará cuando se confirme o cuando se solicite el meeting link
    if (appointment.type === 'online' && appointment.meeting_room_id) {
      try {
        const { deleteMeetingRoom } = await import('@/lib/services/daily')
        const deleteResult = await deleteMeetingRoom(appointment.meeting_room_id)
        
        if (!deleteResult.success) {
          console.error(`Error eliminando meeting room antiguo al reagendar:`, deleteResult.error)
          // No fallar el reagendamiento si el delete falla, solo loguearlo
        } else {
          console.log(`Meeting room antiguo ${appointment.meeting_room_id} eliminado exitosamente al reagendar cita ${appointmentId}`)
        }
      } catch (deleteRoomError) {
        console.error('Error eliminando meeting room antiguo al reagendar:', deleteRoomError)
        // No fallar el reagendamiento si el delete falla
      }
    }

    // Actualizar la cita
    // Si es online, limpiar el meeting link para que se genere uno nuevo con la nueva fecha/hora
    const updateData: any = {
      appointment_date: newDate,
      appointment_time: newTime,
      status: 'pending', // Resetear a pending para que el profesional confirme
      updated_at: new Date().toISOString(),
    }

    // Si es online, limpiar el meeting link y room para que se genere uno nuevo
    if (appointment.type === 'online') {
      updateData.meeting_link = null
      updateData.meeting_room_id = null
      updateData.meeting_expires_at = null
      updateData.video_platform = null
    }

    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId)
      .select()
      .single()

    if (updateError) {
      console.error('Error rescheduling appointment:', updateError)
      return NextResponse.json(
        { 
          error: 'update_failed',
          message: 'No pudimos reagendar la cita. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    // TODO: Enviar notificación al profesional y recordatorio actualizado al paciente
    // TODO: Si es online, notificar que se generará un nuevo meeting link cuando se confirme

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment,
      message: appointment.type === 'online' 
        ? 'Cita reagendada exitosamente. El profesional confirmará la nueva fecha y se generará un nuevo enlace de reunión.'
        : 'Cita reagendada exitosamente. El profesional confirmará la nueva fecha.'
    })
  } catch (error) {
    console.error('Reschedule appointment error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

