import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

    // Obtener precio del profesional
    const { data: professional, error: profError } = await supabase
      .from('professionals')
      .select('consultation_price')
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
        price: professional.consultation_price,
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

