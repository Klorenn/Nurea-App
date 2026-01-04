import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/professional/patients
 * Obtiene los pacientes que tienen al menos una cita con el profesional autenticado
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
          message: 'Por favor, inicia sesión para ver tus pacientes.'
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

    // Obtener pacientes únicos que tienen citas con este profesional
    // Usamos una subconsulta para obtener solo los patient_id únicos
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('patient_id')
      .eq('professional_id', user.id)
      .not('patient_id', 'is', null)

    if (appointmentsError) {
      console.error('Error fetching patient IDs:', appointmentsError)
      return NextResponse.json(
        { 
          error: 'fetch_failed',
          message: 'No pudimos obtener tus pacientes. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    // Obtener IDs únicos
    const uniquePatientIds = [...new Set(appointments?.map(a => a.patient_id) || [])]

    if (uniquePatientIds.length === 0) {
      return NextResponse.json({
        success: true,
        patients: [],
        count: 0
      })
    }

    // Obtener información de los pacientes
    const { data: patients, error: patientsError } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        email,
        avatar_url,
        date_of_birth,
        phone
      `)
      .in('id', uniquePatientIds)
      .eq('role', 'patient')
      .order('first_name', { ascending: true })

    if (patientsError) {
      console.error('Error fetching patients:', patientsError)
      return NextResponse.json(
        { 
          error: 'fetch_failed',
          message: 'No pudimos obtener la información de tus pacientes. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    // Para cada paciente, obtener estadísticas básicas
    const patientsWithStats = await Promise.all(
      (patients || []).map(async (patient) => {
        // Contar citas totales
        const { count: totalAppointments } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('professional_id', user.id)
          .eq('patient_id', patient.id)

        // Obtener última cita
        const { data: lastAppointment } = await supabase
          .from('appointments')
          .select('appointment_date, status')
          .eq('professional_id', user.id)
          .eq('patient_id', patient.id)
          .order('appointment_date', { ascending: false })
          .limit(1)
          .single()

        return {
          ...patient,
          totalAppointments: totalAppointments || 0,
          lastAppointment: lastAppointment?.appointment_date || null,
          lastAppointmentStatus: lastAppointment?.status || null,
        }
      })
    )

    return NextResponse.json({
      success: true,
      patients: patientsWithStats,
      count: patientsWithStats.length
    })
  } catch (error) {
    console.error('Get professional patients error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

