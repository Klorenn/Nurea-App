import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/payments/list
 * Obtiene los pagos del paciente autenticado
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
          message: 'Por favor, inicia sesión para ver tus pagos.'
        },
        { status: 401 }
      )
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Construir query
    let query = supabase
      .from('payments')
      .select(`
        *,
        appointment:appointments(
          id,
          appointment_date,
          appointment_time,
          type,
          status,
          professional:profiles!appointments_professional_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url
          )
        )
      `)
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false })

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
          message: 'No pudimos obtener tus pagos. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    // Formatear pagos para el frontend
    const formattedPayments = (payments || []).map((payment: any) => {
      const appointment = payment.appointment
      const professional = appointment?.professional
      
      return {
        id: payment.id,
        appointment: appointment && professional
          ? `Dr. ${professional.first_name || ''} ${professional.last_name || ''}`.trim()
          : 'N/A',
        appointmentId: appointment?.id,
        date: appointment?.appointment_date 
          ? new Date(appointment.appointment_date).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          : new Date(payment.created_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }),
        amount: parseFloat(payment.amount?.toString() || '0'),
        status: payment.status,
        method: payment.payment_method || 'Credit Card',
        paidAt: payment.paid_at,
        createdAt: payment.created_at,
        professional: professional ? {
          id: professional.id,
          name: `${professional.first_name || ''} ${professional.last_name || ''}`.trim(),
          avatar: professional.avatar_url
        } : null
      }
    })

    return NextResponse.json({
      success: true,
      payments: formattedPayments,
      count: formattedPayments.length
    })
  } catch (error) {
    console.error('Get payments list error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}
