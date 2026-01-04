import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId, block } = await request.json()

    if (!userId || typeof block !== 'boolean') {
      return NextResponse.json(
        { 
          error: 'missing_fields',
          message: 'Por favor, proporciona el ID del usuario y el estado de bloqueo.'
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Verificar autenticación y rol admin
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
          message: 'No tienes permiso para realizar esta acción.'
        },
        { status: 403 }
      )
    }

    // Actualizar estado de bloqueo
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        blocked: block,
        blocked_at: block ? new Date().toISOString() : null,
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user:', updateError)
      return NextResponse.json(
        { 
          error: 'update_failed',
          message: 'No se pudo actualizar el estado del usuario.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: block 
        ? 'Usuario bloqueado exitosamente.'
        : 'Usuario desbloqueado exitosamente.'
    })
  } catch (error) {
    console.error('Block user error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

