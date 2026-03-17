import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        error: 'unauthorized',
        message: 'No autorizado. Por favor, inicia sesión.'
      }, { status: 401 })
    }

    const clientId = process.env.NEXT_PUBLIC_MP_CLIENT_ID
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin
    const redirectUri = `${origin}/api/auth/mercadopago`

    if (!clientId) {
      console.error("Mercado Pago Client ID not configured")
      return NextResponse.json({ 
        error: 'config_missing', 
        message: 'La configuración de Mercado Pago no está completa.' 
      }, { status: 500 })
    }

    // Standard Mercado Pago Auth URL
    const url = `https://auth.mercadopago.com/authorization?client_id=${clientId}&response_type=code&platform_id=mp&redirect_uri=${encodeURIComponent(redirectUri)}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Mercado Pago onboarding error:', error)
    return NextResponse.json({ 
      error: 'server_error', 
      message: error instanceof Error ? error.message : 'Error al iniciar onboarding de Mercado Pago' 
    }, { status: 500 })
  }
}
