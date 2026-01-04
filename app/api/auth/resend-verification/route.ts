import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { 
          error: 'email_required',
          message: 'Por favor, ingresa tu email.'
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verificar si el usuario existe
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    // Si no hay sesión, intentar obtener el usuario por email
    if (userError || !user) {
      // No podemos verificar el email sin sesión, pero podemos intentar
      // En producción, esto debería requerir autenticación
      return NextResponse.json(
        { 
          error: 'not_authenticated',
          message: 'Por favor, inicia sesión para reenviar el email de verificación.'
        },
        { status: 401 }
      )
    }

    // Verificar si el email ya está verificado
    if (user.email_confirmed_at) {
      return NextResponse.json(
        { 
          error: 'already_verified',
          message: 'Tu email ya está verificado. Puedes iniciar sesión normalmente.'
        },
        { status: 400 }
      )
    }

    // Reenviar email de verificación
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email!,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/verify-email`,
      },
    })

    if (error) {
      console.error('Resend verification error:', error)
      return NextResponse.json(
        { 
          error: 'send_failed',
          message: 'No pudimos enviar el email. Por favor, intenta nuevamente en unos momentos.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Te hemos enviado un nuevo email de verificación. Revisa tu bandeja de entrada (y spam).'
    })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

