import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // Si no hay código, algo salió mal con el link, enviamos a login con error
  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=Invalid_Verification_Link`)
  }

  const supabase = await createClient()

  try {
    // 1. Intercambiar el código por una sesión válida (esto activa la cuenta)
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) throw error

    // 2. Obtener los datos del usuario para saber su rol
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const role = user?.user_metadata?.role || 'patient' // Fallback a paciente por seguridad

    // 3. Enrutamiento inteligente según el rol
    let redirectTo = '/dashboard'

    if (role === 'professional') {
      redirectTo = '/dashboard/professional'
    } else if (role === 'patient') {
      redirectTo = '/dashboard/patient'
    } else if (role === 'admin') {
      redirectTo = '/admin'
    }

    // 4. Redirección ABSOLUTA (Crucial para que Next.js no falle)
    return NextResponse.redirect(`${origin}${redirectTo}`)
  } catch (error) {
    console.error('Error en auth callback:', error)
    // Redirigir a una página de error amigable
    return NextResponse.redirect(`${origin}/login?error=Verification_Failed`)
  }
}
