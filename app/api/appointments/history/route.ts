import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { 
          error: 'unauthorized',
          message: 'Por favor, inicia sesión para ver tu historial.'
        },
        { status: 401 }
      )
    }

    // Obtener todas las citas del usuario con información del profesional y su specialty
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        *,
        professional:profiles!appointments_professional_id_fkey(
          id,
          first_name,
          last_name,
          avatar_url
        ),
        professional_data:professionals!appointments_professional_id_fkey(
          id,
          specialty
        )
      `)
      .eq('patient_id', user.id)
      .order('appointment_date', { ascending: false })
      .order('appointment_time', { ascending: false })

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError)
      return NextResponse.json(
        { 
          error: 'fetch_failed',
          message: 'No pudimos obtener tu historial. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    // Formatear appointments con specialty
    const formattedAppointments = (appointments || []).map((apt: any) => ({
      ...apt,
      specialty: apt.professional_data?.specialty || null
    }))

    return NextResponse.json({
      success: true,
      appointments: formattedAppointments,
      count: formattedAppointments.length
    })
  } catch (error) {
    console.error('Get history error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

