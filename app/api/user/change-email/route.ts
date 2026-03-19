import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { newEmail, password } = body as { newEmail?: string; password?: string }

    if (!newEmail || !password) {
      return NextResponse.json(
        { error: 'invalid_request', message: 'Correo y contraseña son requeridos' },
        { status: 400 }
      )
    }

    if (newEmail === user.email) {
      return NextResponse.json(
        { success: true, message: 'El correo es el mismo que el actual' }
      )
    }

    // Verificar contraseña reautenticando al usuario
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password,
    })

    if (signInError) {
      return NextResponse.json(
        { error: 'invalid_credentials', message: 'Contraseña incorrecta' },
        { status: 401 }
      )
    }

    const { data, error: updateError } = await supabase.auth.updateUser({
      email: newEmail,
    })

    if (updateError) {
      console.error('Error updating email:', updateError)
      return NextResponse.json(
        { error: 'update_failed', message: 'No se pudo actualizar el correo' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Hemos enviado un enlace de confirmación a tu nuevo correo',
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
    })
  } catch (error) {
    console.error('Unexpected error in change-email:', error)
    return NextResponse.json(
      { error: 'server_error', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

