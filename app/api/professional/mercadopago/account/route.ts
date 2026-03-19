import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        error: 'unauthorized',
        message: 'No autorizado. Por favor, inicia sesión.'
      }, { status: 401 })
    }

    // Get MP fields from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('mp_user_id, mp_access_token, mp_token_updated_at')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ 
        error: 'profile_not_found', 
        message: 'No se encontró el perfil del usuario.' 
      }, { status: 404 })
    }

    const isConnected = !!profile.mp_user_id

    // Mock balance data for now (or fetch from MP API if needed)
    // Real implementation would use fetch("https://api.mercadopago.com/users/${profile.mp_user_id}/mercadopago_account/balance")
    const balance = {
      available: [{ amount: 0, currency_id: 'CLP' }],
      pending: [{ amount: 0, currency_id: 'CLP' }]
    }

    return NextResponse.json({
      isConnected,
      id: profile.mp_user_id,
      balance,
      payoutsEnabled: isConnected, // Simplification for MVP
      accountEmail: user.email
    })
  } catch (error) {
    console.error('Mercado Pago account status error:', error)
    return NextResponse.json({ 
      error: 'server_error', 
      message: error instanceof Error ? error.message : 'Error al obtener estado de cuenta de Mercado Pago' 
    }, { status: 500 })
  }
}
