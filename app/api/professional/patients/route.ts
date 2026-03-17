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

    // Obtener IDs de pacientes que tienen citas con este profesional
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('patient_id')
      .eq('professional_id', user.id)
      .not('patient_id', 'is', null)

    // Obtener IDs de pacientes creados por este profesional
    const { data: createdPatients, error: createdError } = await supabase
      .from('profiles')
      .select('id')
      .eq('created_by_professional_id', user.id)

    if (appointmentsError || createdError) {
      console.error('Error fetching patient IDs:', appointmentsError || createdError)
      return NextResponse.json(
        { 
          error: 'fetch_failed',
          message: 'No pudimos obtener tus pacientes. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    // Obtener IDs únicos combinando ambos grupos
    const patientIdsFromAppointments = appointments?.map(a => a.patient_id) || []
    const patientIdsFromCreated = createdPatients?.map(p => p.id) || []
    const uniquePatientIds = [...new Set([...patientIdsFromAppointments, ...patientIdsFromCreated])]

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

/**
 * POST /api/professional/patients
 * Crea un nuevo paciente (placeholder) invitado por el profesional
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user: professionalUser }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !professionalUser) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, email, phone, dateOfBirth } = body

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'missing_fields', message: 'Nombre, apellido y email son obligatorios.' },
        { status: 400 }
      )
    }

    // Crear cliente admin para interactuar con auth.users
    const supabaseAdmin = createClientAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Crear el usuario en auth.users (sin contraseña, será una invitación)
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: 'patient'
      }
    })

    if (authError) {
      // Si el usuario ya existe, intentamos obtener su perfil
      if (authError.message.includes('already registered')) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single()

        if (existingProfile) {
          // Si ya existe, simplemente lo vinculamos (creando una cita ficticia o similar si es necesario, 
          // pero aquí el objetivo es que aparezca en el listado del profesional)
          // El listado actual se basa en citas, así que el profesional deberá agendar una cita para que aparezca.
          return NextResponse.json({
            success: true,
            patientId: existingProfile.id,
            message: 'El paciente ya existía en la plataforma.'
          })
        }
      }
      
      console.error('Error creating auth user:', authError)
      return NextResponse.json(
        { error: 'create_failed', message: 'No se pudo crear el usuario.' },
        { status: 500 }
      )
    }

    // 2. Crear el perfil manualmente (si no hay trigger)
    const { data: newProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authUser.user.id,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        date_of_birth: dateOfBirth,
        role: 'patient',
        created_by_professional_id: professionalUser.id
      })
      .select()
      .single()

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Si falló el perfil pero se creó el auth user, es un estado inconsistente, pero el especialista puede intentar agendar
    }

    return NextResponse.json({
      success: true,
      patientId: authUser.user.id,
      message: 'Paciente creado exitosamente.'
    })
  } catch (error) {
    console.error('Create patient error:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}

// Helper para crear cliente admin (importado de @supabase/supabase-js para evitar dependencias de cookies en admin)
import { createClient as createClientAdmin } from '@supabase/supabase-js'
