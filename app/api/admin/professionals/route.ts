import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/admin/professionals
 * Obtiene todos los profesionales (solo admin)
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
    const verified = searchParams.get('verified')

    // Construir query
    let query = supabase
      .from('professionals')
      .select(`
        *,
        profile:profiles!professionals_id_fkey(
          id,
          first_name,
          last_name,
          email,
          blocked,
          created_at
        )
      `)
      .order('created_at', { ascending: false })

    // Aplicar filtros
    if (verified === 'true') {
      query = query.eq('verified', true)
    } else if (verified === 'false') {
      query = query.eq('verified', false)
    }

    const { data: professionals, error: professionalsError } = await query

    if (professionalsError) {
      console.error('Error fetching professionals:', professionalsError)
      return NextResponse.json(
        { 
          error: 'fetch_failed',
          message: 'No pudimos obtener los profesionales. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      professionals: professionals || [],
      count: professionals?.length || 0
    })
  } catch (error) {
    console.error('Get professionals error:', error)
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
 * PUT /api/admin/professionals
 * Actualiza verificación de profesional
 */
export async function PUT(request: Request) {
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
          message: 'Solo los administradores pueden actualizar profesionales.'
        },
        { status: 403 }
      )
    }

    const { professionalId, verified } = await request.json()

    if (!professionalId || typeof verified !== 'boolean') {
      return NextResponse.json(
        { 
          error: 'missing_fields',
          message: 'Por favor, proporciona el ID del profesional y el estado de verificación.'
        },
        { status: 400 }
      )
    }

    // Actualizar verificación
    const { data: updatedProfessional, error: updateError } = await supabase
      .from('professionals')
      .update({ verified })
      .eq('id', professionalId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating professional:', updateError)
      return NextResponse.json(
        { 
          error: 'update_failed',
          message: 'No se pudo actualizar el profesional. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      professional: updatedProfessional
    })
  } catch (error) {
    console.error('Update professional error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

