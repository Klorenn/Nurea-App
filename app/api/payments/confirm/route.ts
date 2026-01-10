import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isPaymentsEnabled } from '@/lib/utils/feature-flags'

export async function POST(request: Request) {
  try {
    // Verificar feature flag de pagos
    if (!isPaymentsEnabled()) {
      return NextResponse.json(
        {
          error: 'payments_disabled',
          message: 'Los pagos están deshabilitados actualmente.'
        },
        { status: 503 }
      )
    }

    const { paymentId, paymentIntentId } = await request.json()

    if (!paymentId) {
      return NextResponse.json(
        { 
          error: 'missing_fields',
          message: 'Por favor, proporciona el ID del pago.'
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
          message: 'Por favor, inicia sesión para confirmar el pago.'
        },
        { status: 401 }
      )
    }

    // Verificar que el pago existe y pertenece al usuario
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, appointment:appointments(*)')
      .eq('id', paymentId)
      .eq('patient_id', user.id)
      .single()

    if (paymentError || !payment) {
      return NextResponse.json(
        { 
          error: 'payment_not_found',
          message: 'No se encontró el pago o no tienes permiso para confirmarlo.'
        },
        { status: 404 }
      )
    }

    // TODO: Verificar con Stripe/MercadoPago que el pago fue exitoso
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    // const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    // if (paymentIntent.status !== 'succeeded') {
    //   return NextResponse.json({ error: 'payment_failed' }, { status: 400 })
    // }

    // Actualizar estado del pago
    const { data: updatedPayment, error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_intent_id: paymentIntentId,
      })
      .eq('id', paymentId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating payment:', updateError)
      return NextResponse.json(
        { 
          error: 'update_failed',
          message: 'No pudimos confirmar el pago. Por favor, contacta a soporte.'
        },
        { status: 500 }
      )
    }

    // Actualizar estado de pago de la cita
    await supabase
      .from('appointments')
      .update({
        payment_status: 'paid',
      })
      .eq('id', payment.appointment_id)

    return NextResponse.json({
      success: true,
      payment: updatedPayment,
      message: 'Pago confirmado exitosamente. Tu cita está confirmada.'
    })
  } catch (error) {
    console.error('Confirm payment error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

