import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isTestProfessional, shouldUseMockData } from '@/lib/mock-data'

/**
 * GET /api/professionals/[id]/appointments
 * Obtiene las citas de un profesional (solo fechas y horas, sin información sensible)
 * Para uso público en generación de horarios disponibles
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Si es el profesional de prueba y estamos en desarrollo, retornar array vacío
    if (isTestProfessional(id) && shouldUseMockData()) {
      return NextResponse.json({
        success: true,
        appointments: []
      })
    }

    const supabase = await createClient()

    // Construir query - solo obtener fechas, horas y duración
    let query = supabase
      .from('appointments')
      .select('appointment_date, appointment_time, duration_minutes, status')
      .eq('professional_id', id)
      .in('status', ['pending', 'confirmed'])
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })

    // Aplicar filtros de fecha si se proporcionan
    if (dateFrom) {
      query = query.gte('appointment_date', dateFrom)
    }

    if (dateTo) {
      query = query.lte('appointment_date', dateTo)
    }

    const { data: appointments, error: appointmentsError } = await query

    if (appointmentsError) {
      console.error('Error fetching professional appointments:', appointmentsError)
      return NextResponse.json(
        { 
          error: 'fetch_failed',
          message: 'No pudimos obtener los horarios. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    // Formatear para el generador de horarios
    const formattedAppointments = (appointments || []).map((apt: any) => ({
      appointment_date: apt.appointment_date,
      appointment_time: apt.appointment_time,
      duration_minutes: apt.duration_minutes || 60,
    }))

    return NextResponse.json({
      success: true,
      appointments: formattedAppointments
    })
  } catch (error) {
    console.error('Get professional appointments error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

