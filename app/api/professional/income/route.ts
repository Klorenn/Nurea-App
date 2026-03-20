import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/professional/income
 * Calcula los ingresos del profesional autenticado desde pagos reales
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
          message: 'Por favor, inicia sesión para ver tus ingresos.'
        },
        { status: 401 }
      )
    }

    // Verificar que el usuario sea profesional
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'professional') {
      return NextResponse.json(
        { 
          error: 'forbidden',
          message: 'Solo los profesionales pueden acceder a esta información.'
        },
        { status: 403 }
      )
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // 'month', 'week', 'year', 'all'
    const month = searchParams.get('month') // YYYY-MM
    const year = searchParams.get('year') // YYYY

    // Obtener todas las citas del profesional con pagos
    let query = supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        price,
        payment_status,
        status
      `)
      .eq('professional_id', user.id)
      .eq('payment_status', 'paid')
      .eq('status', 'completed')

    // Aplicar filtros de fecha según el período
    const now = new Date()
    if (period === 'month') {
      const startOfMonth = month
        ? new Date(`${month}-01T00:00:00`)
        : new Date(now.getFullYear(), now.getMonth(), 1)
      
      // Parsear correctamente el mes específico para endOfMonth
      const endOfMonth = month
        ? (() => {
            const [year, monthNum] = month.split('-').map(Number)
            // Día 0 del mes siguiente = último día del mes especificado
            return new Date(year, monthNum, 0, 23, 59, 59)
          })()
        : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      
      query = query.gte('appointment_date', startOfMonth.toISOString().split('T')[0])
      query = query.lte('appointment_date', endOfMonth.toISOString().split('T')[0])
    } else if (period === 'week') {
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      
      query = query.gte('appointment_date', startOfWeek.toISOString().split('T')[0])
    } else if (period === 'year') {
      const startOfYear = year
        ? new Date(`${year}-01-01`)
        : new Date(now.getFullYear(), 0, 1)
      const endOfYear = year
        ? new Date(`${year}-12-31`)
        : new Date(now.getFullYear(), 11, 31)
      
      query = query.gte('appointment_date', startOfYear.toISOString().split('T')[0])
      query = query.lte('appointment_date', endOfYear.toISOString().split('T')[0])
    }
    // 'all' no aplica filtros de fecha

    const { data: appointments, error: appointmentsError } = await query

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError)
      return NextResponse.json(
        { 
          error: 'fetch_failed',
          message: 'No pudimos calcular tus ingresos. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    // Calcular totales
    const totalIncome = (appointments || []).reduce((sum, apt) => {
      return sum + (parseFloat(apt.price?.toString() || '0') || 0)
    }, 0)

    const totalAppointments = appointments?.length || 0
    const averageIncome = totalAppointments > 0 ? totalIncome / totalAppointments : 0

    // Obtener también ingresos pendientes (citas pagadas pero no completadas)
    const { data: pendingAppointments } = await supabase
      .from('appointments')
      .select('price')
      .eq('professional_id', user.id)
      .eq('payment_status', 'paid')
      .in('status', ['pending', 'confirmed'])

    const pendingIncome = (pendingAppointments || []).reduce((sum, apt) => {
      return sum + (parseFloat(apt.price?.toString() || '0') || 0)
    }, 0)

    return NextResponse.json({
      success: true,
      income: {
        total: totalIncome,
        pending: pendingIncome,
        completed: totalIncome,
        count: totalAppointments,
        average: averageIncome,
        period: period,
        currency: 'CLP'
      },
      breakdown: appointments?.map(apt => ({
        date: apt.appointment_date,
        amount: parseFloat(apt.price?.toString() || '0'),
        status: apt.status
      })) || []
    })
  } catch (error) {
    console.error('Get professional income error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

