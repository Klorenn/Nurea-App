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
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*')
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

    // Actualizar la cita
    const { data: updatedAppointment, error: updateError } = await supabase
      .from('appointments')
      .update({
        appointment_date: newDate,
        appointment_time: newTime,
        status: 'pending', // Resetear a pending para que el profesional confirme
        updated_at: new Date().toISOString(),
      })
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

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment,
      message: 'Cita reagendada exitosamente. El profesional confirmará la nueva fecha.'
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

