import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')
  const error_description = searchParams.get('error_description')

  // Si el proveedor OAuth devolvió un error explícito
  if (error_description) {
    console.error('[auth/callback] OAuth provider error:', error_description)
    return NextResponse.redirect(
      `${origin}/login?error=oauth_error&message=${encodeURIComponent(error_description)}`
    )
  }

  // Si no hay código de autorización
  if (!code) {
    console.error('[auth/callback] No authorization code provided')
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createClient()

  try {
    // 1. Intercambiar el código por una sesión válida
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('[auth/callback] Error exchanging code:', exchangeError.message)
      return NextResponse.redirect(`${origin}/login?error=exchange_failed`)
    }

    const user = sessionData?.user

    if (!user) {
      console.error('[auth/callback] No user in session after exchange')
      return NextResponse.redirect(`${origin}/login?error=no_user`)
    }

    // 2. VALIDACIÓN CRÍTICA: Verificar si el usuario tiene un perfil registrado
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, first_name, last_name')
      .eq('id', user.id)
      .maybeSingle()

    // 3. SI NO EXISTE EL PERFIL: No permitir acceso
    if (!existingProfile) {
      console.warn(`[auth/callback] User ${user.id} (${user.email}) attempted login without registered profile`)
      
      // Cerrar la sesión inmediatamente - no debe tener acceso
      await supabase.auth.signOut()

      // Redirigir al registro con mensaje de error
      return NextResponse.redirect(
        `${origin}/auth/register?error=account-not-found&email=${encodeURIComponent(user.email || '')}`
      )
    }

    // 4. SI EXISTE EL PERFIL: Proceder con el login
    const role = existingProfile.role || 'patient'

    console.log(`[auth/callback] User ${user.id} authenticated successfully as ${role}`)

    // 5. Determinar la ruta de destino
    const roleDashboard = role === 'professional'
      ? '/dashboard/professional'
      : role === 'admin'
        ? '/admin'
        : '/dashboard/patient'

    // Normalizar next: asegurar que sea un path seguro con / al inicio
    const rawNext = typeof next === 'string' ? next.trim() : ''
    const normalizedNext = rawNext
      ? (rawNext.startsWith('/') ? rawNext : `/${rawNext}`).replace(/\/+$/, '') || '/'
      : ''

    // Rutas permitidas tras el login (evita open redirect)
    const allowedPaths = [
      '/verify-email',
      '/dashboard',
      '/dashboard/patient',
      '/dashboard/professional',
      '/admin',
      '/dashboard/appointments',
      '/dashboard/profile',
      '/dashboard/settings',
      '/precios',
      '/explore',
    ]
    const isAllowed = (path: string) =>
      allowedPaths.includes(path) || path.startsWith('/dashboard/')

    let redirectTo: string
    if (normalizedNext && normalizedNext !== '/' && isAllowed(normalizedNext)) {
      redirectTo = normalizedNext
    } else {
      redirectTo = roleDashboard
    }

    // Nunca redirigir al dashboard genérico (puede dar 404)
    if (redirectTo === '/dashboard') {
      redirectTo = roleDashboard
    }

    const finalUrl = `${origin}${redirectTo}`
    console.log(`[auth/callback] Redirecting to ${finalUrl}`)

    // 6. Redirección exitosa
    return NextResponse.redirect(finalUrl)

  } catch (err) {
    console.error('[auth/callback] Unexpected error:', err)
    
    // Intentar cerrar sesión por seguridad en caso de error
    try {
      await supabase.auth.signOut()
    } catch {}

    return NextResponse.redirect(`${origin}/login?error=callback_error`)
  }
}
