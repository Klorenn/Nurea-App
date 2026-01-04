import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/user/status
 * Obtiene el estado actual del usuario
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

    // Obtener el estado del usuario desde el perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('status')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching status:', profileError)
      return NextResponse.json(
        { 
          error: 'fetch_failed',
          message: 'No pudimos obtener tu estado. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      status: profile?.status || 'online'
    })
  } catch (error) {
    console.error('Get status error:', error)
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
 * PUT /api/user/status
 * Actualiza el estado del usuario
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

    const { status } = await request.json()

    // Validar que el estado sea válido
    const validStatuses = ['online', 'offline', 'busy']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          error: 'invalid_status',
          message: 'El estado proporcionado no es válido.'
        },
        { status: 400 }
      )
    }

    // Actualizar el estado del usuario
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', user.id)
      .select('status')
      .single()

    if (updateError) {
      console.error('Error updating status:', updateError)
      return NextResponse.json(
        { 
          error: 'update_failed',
          message: 'No pudimos actualizar tu estado. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      status: updatedProfile?.status || status,
      message: 'Estado actualizado exitosamente.'
    })
  } catch (error) {
    console.error('Update status error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

