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
          message: 'No se encontró la cita o no tienes permiso para cancelarla.'
        },
        { status: 404 }
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

    // Calcular si hay reembolso según política de cancelación
    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`)
    const now = new Date()
    const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    let refundAmount = 0
    let refundMessage = ''
    
    // Política: Reembolso completo si se cancela con más de 24 horas de anticipación
    if (hoursUntilAppointment > 24) {
      refundAmount = appointment.price || 0
      refundMessage = 'Reembolso completo aplicado. El dinero será devuelto en 3-5 días hábiles.'
    } else if (hoursUntilAppointment > 12) {
      // Reembolso del 50% si se cancela entre 12-24 horas antes
      refundAmount = (appointment.price || 0) * 0.5
      refundMessage = 'Reembolso del 50% aplicado. El dinero será devuelto en 3-5 días hábiles.'
    } else {
      refundMessage = 'No hay reembolso disponible por cancelación con menos de 12 horas de anticipación.'
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

    // TODO: Procesar reembolso si aplica
    // TODO: Enviar notificación al profesional

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

