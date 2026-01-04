import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getHumanErrorMessage } from '@/lib/auth/utils'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { 
          error: 'missing_fields',
          message: 'Por favor, completa todos los campos para iniciar sesión.'
        },
        { status: 400 }
      )
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { 
          error: 'configuration_error',
          message: 'El sistema no está configurado correctamente. Por favor, contacta a soporte.'
        },
        { status: 500 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      const humanMessage = getHumanErrorMessage(error.message, 'es')
      return NextResponse.json(
        { 
          error: error.message,
          message: humanMessage
        },
        { status: 401 }
      )
    }

    // Verificar si el email está verificado
    if (data.user && !data.user.email_confirmed_at) {
      return NextResponse.json(
        { 
          error: 'email_not_verified',
          message: 'Por favor, verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada (y spam) para el enlace de verificación.',
          user: data.user,
          requiresVerification: true
        },
        { status: 403 }
      )
    }

    // Obtener el perfil para determinar el rol y redirección
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, date_of_birth')
      .eq('id', data.user.id)
      .single()

    const role = profile?.role || 'patient'
    const profileComplete = !!profile?.date_of_birth

    // Determinar la ruta de redirección
    let redirectPath = '/dashboard'
    if (role === 'professional') {
      redirectPath = profileComplete ? '/professional/dashboard' : '/complete-profile'
    } else if (role === 'admin') {
      redirectPath = '/admin'
    } else {
      redirectPath = profileComplete ? '/dashboard' : '/complete-profile'
    }

    return NextResponse.json({ 
      user: data.user, 
      session: data.session,
      redirectPath,
      role
    })
  } catch (error) {
    console.error('Sign in error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

