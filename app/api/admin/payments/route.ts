import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/admin/payments
 * Obtiene todos los pagos (solo admin, solo auditoría)
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { 
          error: 'unauthorized',
          message: 'Por favor, inicia sesión.'
        },
        { status: 401 }
      )
    }

    // Verificar que el usuario es admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { 
          error: 'forbidden',
          message: 'Solo los administradores pueden acceder a esta información.'
        },
        { status: 403 }
      )
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Construir query (solo metadata, no contenido clínico)
    let query = supabase
      .from('payments')
      .select(`
        id,
        amount,
        currency,
        status,
        payment_method,
        payment_intent_id,
        paid_at,
        refunded_at,
        refund_amount,
        created_at,
        updated_at,
        patient:profiles!payments_patient_id_fkey(
          id,
          first_name,
          last_name,
          email
        ),
        professional:profiles!payments_professional_id_fkey(
          id,
          first_name,
          last_name,
          email
        ),
        appointment:appointments(
          id,
          appointment_date,
          appointment_time,
          type,
          status
        )
      `)
      .order('created_at', { ascending: false })
      .limit(500)

    // Aplicar filtros
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: payments, error: paymentsError } = await query

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError)
      return NextResponse.json(
        { 
          error: 'fetch_failed',
          message: 'No pudimos obtener los pagos. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      payments: payments || [],
      count: payments?.length || 0
    })
  } catch (error) {
    console.error('Get payments error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

