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
      // Filtramos patient_id en memoria para evitar diferencias de operadores
      // entre entornos/schemas.

    // Obtener IDs de pacientes desde el chat/mensajes (para que aparezca el paciente
    // incluso si el appointment todavía no refleja todo en el UI, o por demoras de sincronización)
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('sender_id, receiver_id')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)

    // Obtener IDs de pacientes creados por este profesional
    const { data: createdPatients, error: createdError } = await supabase
      .from('profiles')
      .select('id')
      .eq('created_by_professional_id', user.id)
    console.log('[patients API] createdPatients:', createdPatients, 'createdError:', createdError)
    if (appointmentsError) {
      console.error('Error fetching appointments patient IDs:', appointmentsError)
    }
    if (createdError) {
      console.error('Error fetching created patient IDs:', createdError)
    }

    const patientIdsFromAppointments = (appointments || [])
      .map((a: any) => a?.patient_id)
      .filter(Boolean)
    const patientIdsFromCreated = createdPatients?.map((p: any) => p.id) || []
    console.log('[patients API] patientIdsFromCreated:', patientIdsFromCreated)

    // Fallback/extra sync: traer el "otro participante" desde conversaciones de chat.
    // Esto ayuda cuando el appointment se refleja con retraso en la UI,
    // pero la conversación/mensajes ya existen.
    let patientIdsFromConversations: string[] = []
    try {
      const { data: myConversations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id)

      const conversationIds = (myConversations || [])
        .map((r: any) => r?.conversation_id)
        .filter(Boolean)

      if (conversationIds.length) {
        const { data: otherParticipants } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .in('conversation_id', conversationIds)
          .neq('user_id', user.id)

        patientIdsFromConversations = (otherParticipants || [])
          .map((r: any) => r?.user_id)
          .filter(Boolean)
      }
    } catch (convError) {
      console.error('Error fetching conversation participants:', convError)
    }

    const patientIdsFromMessages =
      messagesError || !messages
        ? []
        : messages.reduce<string[]>((acc, m: any) => {
            if (m?.sender_id && m.sender_id !== user.id) acc.push(m.sender_id)
            if (m?.receiver_id && m.receiver_id !== user.id) acc.push(m.receiver_id)
            return acc
          }, [])

    const uniquePatientIds = [
      ...new Set([
        ...patientIdsFromAppointments,
        ...patientIdsFromCreated,
        ...patientIdsFromMessages,
        ...patientIdsFromConversations,
      ]),
    ]
    console.log('[patients API] uniquePatientIds:', uniquePatientIds)

    if (uniquePatientIds.length === 0) {
      console.log('[patients API] No uniquePatientIds, returning empty array')
      return NextResponse.json({
        success: true,
        patients: [],
        count: 0
      })
    }

    // Obtener información de los pacientes
    // Nota: hacemos JOIN desde `appointments` hacia `profiles` para asegurar que
    // el paciente exista en el mismo esquema/relación que usa el dashboard.
    let patients: any[] = []
    try {
      const { data: joined, error: joinedError } = await supabase
        .from('appointments')
        .select(`
          patient_id,
          patient:profiles!appointments_patient_id_fkey(
            id,
            first_name,
            last_name,
            email,
            avatar_url,
            phone,
            date_of_birth,
            gender
          )
        `)
        .eq('professional_id', user.id)
        .in('status', ['confirmed', 'pending'])

      if (!joinedError && joined) {
        const mapped = (joined as any[])
          .map((row) => row?.patient)
          .filter(Boolean)

        // Si encontramos por join, usamos eso (es lo más confiable).
        if (mapped.length > 0) {
          patients = mapped
        }
      }
    } catch (e) {
      console.error('Join fetch patients error:', e)
    }

    // Fallback: si el join no trajo nada, consultamos por IDs (con fallback de columnas).
    if (patients.length === 0) {
      try {
        const r = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            email,
            avatar_url,
            date_of_birth,
            gender,
            phone
          `)
          .in('id', uniquePatientIds)
          .order('first_name', { ascending: true })
        patients = (r.data as any[]) || []
      } catch (e) {
        console.error('Error fetching patients (profiles columns):', e)
        const r2 = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            email,
            avatar_url,
            phone
          `)
          .in('id', uniquePatientIds)
          .order('first_name', { ascending: true })
        patients = (r2.data as any[]) || []
      }
    }
    console.log('[patients API] Final patients count:', patients.length, 'patients:', patients.map(p => p?.id))

    // Estadísticas: hacemos UNA query en vez de N (evita timeouts/hangs)
    const patientIdsForStats = (patients || []).map((p: any) => p?.id).filter(Boolean)
    let appointmentsForStats: any[] = []
    if (patientIdsForStats.length > 0) {
      const { data: appts, error: apptsError } = await supabase
        .from('appointments')
        .select('patient_id, appointment_date, status')
        .eq('professional_id', user.id)
        .in('patient_id', patientIdsForStats)

      if (!apptsError && appts) {
        appointmentsForStats = appts as any[]
      } else if (apptsError) {
        console.error('appointmentsForStats query error:', apptsError)
      }
    }

    const apptsByPatient = new Map<string, any[]>()
    for (const a of appointmentsForStats) {
      const pid = a?.patient_id
      if (!pid) continue
      if (!apptsByPatient.has(pid)) apptsByPatient.set(pid, [])
      apptsByPatient.get(pid)!.push(a)
    }

    const patientsWithStats = (patients || []).map((patient: any) => {
      const patientAppts = apptsByPatient.get(patient.id) || []
      let lastAppointment: any = null
      if (patientAppts.length > 0) {
        lastAppointment = patientAppts
          .slice()
          .sort((x, y) => new Date(y.appointment_date).getTime() - new Date(x.appointment_date).getTime())[0]
      }

      return {
        ...patient,
        // Guarantee string fields so frontend can safely call .toLowerCase() etc.
        first_name: patient.first_name ?? '',
        last_name: patient.last_name ?? '',
        email: patient.email ?? '',
        avatar_url: patient.avatar_url ?? null,
        phone: patient.phone ?? null,
        date_of_birth: patient.date_of_birth ?? null,
        gender: patient.gender ?? null,
        totalAppointments: patientAppts.length,
        lastAppointment: lastAppointment?.appointment_date ?? null,
        lastAppointmentStatus: lastAppointment?.status ?? null,
      }
    })

    return NextResponse.json({
      success: true,
      patients: patientsWithStats,
      count: patientsWithStats.length,
      debug: {
        uniquePatientIdsCount: uniquePatientIds.length,
        patientIdsFromCreatedCount: patientIdsFromCreated.length,
        patientIdsFromCreated: patientIdsFromCreated,
      }
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

    // Verificar rol antes de cualquier operación admin
    const { data: professionalProfile, error: professionalProfileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', professionalUser.id)
      .single()

    if (professionalProfileError || professionalProfile?.role !== 'professional') {
      return NextResponse.json(
        { error: 'forbidden', message: 'Solo los profesionales pueden crear pacientes.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { firstName, lastName, email, phone, dateOfBirth } = body

    console.log("[PATIENTS:CREATE]", { email, firstName })

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'missing_fields', message: 'Nombre, apellido y email son obligatorios.' },
        { status: 400 }
      )
    }

    // Crear cliente admin para interactuar con auth.users
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[professional/patients] Missing Supabase admin env vars')
      return NextResponse.json(
        { error: 'server_error', message: 'Configuración de servidor incompleta.' },
        { status: 500 }
      )
    }
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
