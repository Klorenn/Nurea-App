import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getHumanErrorMessage } from '@/lib/auth/utils'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { 
          error: 'email_required',
          message: 'Por favor, ingresa tu email para recuperar tu contraseña.'
        },
        { status: 400 }
      )
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          error: 'invalid_email',
          message: 'Por favor, ingresa un email válido. Lo necesitamos para enviarte el enlace de recuperación.'
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Enviar email de recuperación de contraseña
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
    })

    if (error) {
      // No revelar si el email existe o no por seguridad
      // Siempre retornar éxito para evitar enumeración de emails
      console.error('Password reset error:', error)
      
      // Pero aún así retornar éxito para no revelar información
      return NextResponse.json({
        success: true,
        message: 'Si ese email está registrado, recibirás un enlace para recuperar tu contraseña.'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Si ese email está registrado, recibirás un enlace para recuperar tu contraseña. Revisa tu bandeja de entrada (y spam).'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

