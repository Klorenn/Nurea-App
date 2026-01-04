import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointmentId')
    const category = searchParams.get('category')
    const patientId = searchParams.get('patientId')
    const professionalId = searchParams.get('professionalId')

    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { 
          error: 'unauthorized',
          message: 'Por favor, inicia sesión para ver documentos.'
        },
        { status: 401 }
      )
    }

    // Obtener rol del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { 
          error: 'profile_not_found',
          message: 'No se encontró tu perfil.'
        },
        { status: 404 }
      )
    }

    // Construir query según el rol
    let query = supabase
      .from('documents')
      .select(`
        id,
        name,
        description,
        file_name,
        file_type,
        file_size,
        category,
        uploaded_at,
        last_accessed_at,
        access_count,
        appointment_id,
        professional:profiles!documents_professional_id_fkey(id, first_name, last_name),
        appointment:appointments(id, appointment_date, appointment_time)
      `)
      .order('uploaded_at', { ascending: false })

    if (profile.role === 'admin') {
      // Admins pueden ver documentos con filtros específicos (solo metadata)
      if (professionalId) {
        query = query.eq('professional_id', professionalId)
      } else if (patientId) {
        query = query.eq('patient_id', patientId)
      } else {
        return NextResponse.json(
          { 
            error: 'missing_filter',
            message: 'Los administradores deben especificar patientId o professionalId.'
          },
          { status: 400 }
        )
      }
    } else if (profile.role === 'patient') {
      // Pacientes ven sus propios documentos
      query = query.eq('patient_id', user.id)
    } else if (profile.role === 'professional') {
      // Profesionales ven documentos de sus pacientes
      query = query.eq('professional_id', user.id)
    } else {
      return NextResponse.json(
        { 
          error: 'invalid_role',
          message: 'Solo pacientes y profesionales pueden ver documentos.'
        },
        { status: 403 }
      )
    }

    // Filtrar por cita si se especifica
    if (appointmentId) {
      query = query.eq('appointment_id', appointmentId)
    }

    // Filtrar por categoría si se especifica
    if (category) {
      query = query.eq('category', category)
    }

    const { data: documents, error: documentsError } = await query

    if (documentsError) {
      console.error('Error fetching documents:', documentsError)
      return NextResponse.json(
        { 
          error: 'fetch_failed',
          message: 'No se pudieron cargar los documentos. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      documents: documents || [],
      count: documents?.length || 0,
    })
  } catch (error) {
    console.error('List documents error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

