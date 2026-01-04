import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { 
          error: 'password_required',
          message: 'Por favor, ingresa tu nueva contraseña.'
        },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { 
          error: 'password_too_short',
          message: 'Tu contraseña debe tener al menos 6 caracteres para mantener tu cuenta segura.'
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verificar que el usuario tenga una sesión válida (desde el enlace de reset)
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { 
          error: 'invalid_session',
          message: 'El enlace de recuperación ha expirado o no es válido. Por favor, solicita un nuevo enlace.'
        },
        { status: 401 }
      )
    }

    // Actualizar la contraseña
    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      return NextResponse.json(
        { 
          error: 'update_failed',
          message: 'No pudimos actualizar tu contraseña. Por favor, intenta nuevamente o solicita un nuevo enlace.'
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión.'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

