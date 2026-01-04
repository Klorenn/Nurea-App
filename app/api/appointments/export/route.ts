import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json' // json, csv, pdf

    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { 
          error: 'unauthorized',
          message: 'Por favor, inicia sesión para exportar tu historial.'
        },
        { status: 401 }
      )
    }

    // Obtener perfil del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', user.id)
      .single()

    // Obtener todas las citas del usuario
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        *,
        professional:profiles!appointments_professional_id_fkey(
          id,
          first_name,
          last_name
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

    // Formatear datos según el formato solicitado
    if (format === 'csv') {
      const csvHeader = 'Fecha,Hora,Profesional,Especialidad,Tipo,Estado,Pago,Precio\n'
      const csvRows = (appointments || []).map(apt => {
        const professionalName = apt.professional 
          ? `${apt.professional.first_name} ${apt.professional.last_name}`
          : 'N/A'
        return [
          apt.appointment_date,
          apt.appointment_time,
          professionalName,
          apt.type,
          apt.status,
          apt.payment_status,
          apt.price || 0
        ].join(',')
      }).join('\n')
      
      return new NextResponse(csvHeader + csvRows, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="historial-citas-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    // JSON por defecto
    return NextResponse.json({
      patient: {
        name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
        email: profile?.email || user.email
      },
      exportDate: new Date().toISOString(),
      totalAppointments: appointments?.length || 0,
      appointments: (appointments || []).map(apt => ({
        id: apt.id,
        date: apt.appointment_date,
        time: apt.appointment_time,
        professional: apt.professional 
          ? `${apt.professional.first_name} ${apt.professional.last_name}`
          : 'N/A',
        type: apt.type,
        status: apt.status,
        paymentStatus: apt.payment_status,
        price: apt.price,
        duration: apt.duration_minutes,
      }))
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="historial-citas-${new Date().toISOString().split('T')[0]}.json"`
      }
    })
  } catch (error) {
    console.error('Export history error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

