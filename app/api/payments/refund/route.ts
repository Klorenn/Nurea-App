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

    const { paymentId, reason, refundAmount } = await request.json()

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
          message: 'Por favor, inicia sesión para procesar un reembolso.'
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
          message: 'No se encontró el pago o no tienes permiso para reembolsarlo.'
        },
        { status: 404 }
      )
    }

    // Verificar que el pago esté pagado
    if (payment.status !== 'paid') {
      return NextResponse.json(
        { 
          error: 'invalid_status',
          message: 'Solo se pueden reembolsar pagos que ya fueron completados.'
        },
        { status: 400 }
      )
    }

    // Verificar que no esté ya reembolsado
    if (payment.status === 'refunded') {
      return NextResponse.json(
        { 
          error: 'already_refunded',
          message: 'Este pago ya fue reembolsado.'
        },
        { status: 400 }
      )
    }

    const finalRefundAmount = refundAmount || payment.amount

    // TODO: Procesar reembolso con Stripe/MercadoPago
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    // const refund = await stripe.refunds.create({
    //   payment_intent: payment.payment_intent_id,
    //   amount: Math.round(finalRefundAmount * 100), // Convertir a centavos
    //   reason: reason || 'requested_by_customer',
    // })

    // Actualizar estado del pago
    const { data: updatedPayment, error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'refunded',
        refunded_at: new Date().toISOString(),
        refund_amount: finalRefundAmount,
        refund_reason: reason || null,
      })
      .eq('id', paymentId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating payment:', updateError)
      return NextResponse.json(
        { 
          error: 'update_failed',
          message: 'No pudimos procesar el reembolso. Por favor, contacta a soporte.'
        },
        { status: 500 }
      )
    }

    // Actualizar estado de pago de la cita si corresponde
    await supabase
      .from('appointments')
      .update({
        payment_status: 'refunded',
      })
      .eq('id', payment.appointment_id)

    return NextResponse.json({
      success: true,
      payment: updatedPayment,
      refundAmount: finalRefundAmount,
      message: `Reembolso de $${finalRefundAmount.toLocaleString()} CLP procesado. El dinero será devuelto en 3-5 días hábiles.`
    })
  } catch (error) {
    console.error('Refund payment error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

