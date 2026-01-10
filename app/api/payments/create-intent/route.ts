import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isPaymentsEnabled } from '@/lib/utils/feature-flags'

// Para Stripe, necesitarías instalar: npm install stripe
// import Stripe from 'stripe'
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-11-20.acacia' })

export async function POST(request: Request) {
  try {
    // Verificar feature flag de pagos
    if (!isPaymentsEnabled()) {
      return NextResponse.json(
        {
          error: 'payments_disabled',
          message: 'Los pagos están deshabilitados actualmente. Esta funcionalidad se activará próximamente.'
        },
        { status: 503 }
      )
    }

    const { appointmentId, amount, currency = 'clp' } = await request.json()

    if (!appointmentId || !amount) {
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
          message: 'Por favor, inicia sesión para realizar un pago.'
        },
        { status: 401 }
      )
    }

    // Verificar que la cita existe y pertenece al usuario
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*, professional:profiles!appointments_professional_id_fkey(id, first_name, last_name)')
      .eq('id', appointmentId)
      .eq('patient_id', user.id)
      .single()

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { 
          error: 'appointment_not_found',
          message: 'No se encontró la cita o no tienes permiso para pagarla.'
        },
        { status: 404 }
      )
    }

    // Verificar que la cita no esté ya pagada
    if (appointment.payment_status === 'paid') {
      return NextResponse.json(
        { 
          error: 'already_paid',
          message: 'Esta cita ya ha sido pagada.'
        },
        { status: 400 }
      )
    }

    // TODO: Integrar con Stripe o MercadoPago
    // Por ahora, simulamos la creación del intent de pago
    
    // Ejemplo con Stripe:
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(amount * 100), // Convertir a centavos
    //   currency: currency,
    //   metadata: {
    //     appointment_id: appointmentId,
    //     patient_id: user.id,
    //     professional_id: appointment.professional_id,
    //   },
    // })

    // Crear registro de pago en la base de datos
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        appointment_id: appointmentId,
        patient_id: user.id,
        professional_id: appointment.professional_id,
        amount: amount,
        currency: currency,
        status: 'pending',
        payment_method: 'card', // o 'mercadopago', etc.
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Error creating payment:', paymentError)
      return NextResponse.json(
        { 
          error: 'creation_failed',
          message: 'No pudimos crear el pago. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      clientSecret: 'pi_mock_secret_key', // En producción, usar paymentIntent.client_secret
      amount,
      currency,
      appointment: {
        id: appointment.id,
        professional: appointment.professional,
        date: appointment.appointment_date,
        time: appointment.appointment_time,
      },
    })
  } catch (error) {
    console.error('Create payment intent error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

