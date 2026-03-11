import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/auth/resend-verification
 * Reenv?a el email de verificaci?n al usuario en sesi?n.
 * El correo lo env?a Supabase (configura SMTP con Resend en el dashboard para mejor entrega).
 */
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        {
          error: 'not_authenticated',
          message: 'Inicia sesi?n para reenviar el email de verificaci?n.',
        },
        { status: 401 }
      )
    }

    if (user.email_confirmed_at) {
      return NextResponse.json(
        {
          error: 'already_verified',
          message: 'Tu email ya est? verificado. Puedes iniciar sesi?n normalmente.',
        },
        { status: 400 }
      )
    }

    const redirectUrl =
      process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL || `https://${process.env.VERCEL_URL}`}`
        : 'http://localhost:3000'

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email!,
      options: {
        emailRedirectTo: `${redirectUrl}/verify-email`,
      },
    })

    if (error) {
      console.error('[resend-verification] Supabase resend error:', error)
      return NextResponse.json(
        {
          error: 'send_failed',
          message: 'No pudimos enviar el email. Configura SMTP en Supabase (p. ej. Resend) o int?ntalo m?s tarde.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Te hemos enviado un nuevo email de verificaci?n. Revisa tu bandeja de entrada (y spam).',
    })
  } catch (error) {
    console.error('[resend-verification]', error)
    return NextResponse.json(
      {
        error: 'server_error',
        message: 'Algo sali? mal. Por favor, int?ntalo de nuevo en unos momentos.',
      },
      { status: 500 }
    )
  }
}
