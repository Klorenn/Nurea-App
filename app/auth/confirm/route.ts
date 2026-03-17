import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Maneja el enlace de verificación de email que Supabase envía con token_hash y type.
 * Es la ruta que debe usarse en plantillas de email (ej: {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type={{ .TokenType }}).
 * Sin esta ruta, esos enlaces devuelven 404.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next')

  if (!token_hash || !type) {
    console.error('[auth/confirm] Missing token_hash or type')
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  const supabase = await createClient()

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'signup' | 'email' | 'magiclink' | 'recovery' | 'email_change' | 'invite',
    })

    if (error) {
      console.error('[auth/confirm] verifyOtp error:', error.message)
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }

    const user = data?.user
    if (!user) {
      console.error('[auth/confirm] No user after verifyOtp')
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }

    // Misma lógica que auth/callback: verificar perfil y redirigir
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, first_name, last_name')
      .eq('id', user.id)
      .maybeSingle()

    if (!existingProfile) {
      await supabase.auth.signOut()
      return NextResponse.redirect(
        `${origin}/auth/register?error=account-not-found&email=${encodeURIComponent(user.email || '')}`
      )
    }

    const role = existingProfile.role || 'patient'
    const roleDashboard =
      role === 'professional'
        ? '/dashboard/professional'
        : role === 'admin'
          ? '/dashboard/admin'
          : '/dashboard/patient'

    const rawNext = typeof next === 'string' ? next.trim() : ''
    const normalizedNext = rawNext
      ? (rawNext.startsWith('/') ? rawNext : `/${rawNext}`).replace(/\/+$/, '') || '/'
      : ''

    const allowedPaths = [
      '/verify-email',
      '/dashboard',
      '/dashboard/patient',
      '/dashboard/professional',
      '/dashboard/admin',
      '/complete-profile',
    ]
    const isAllowed = (path: string) =>
      allowedPaths.includes(path) || path.startsWith('/dashboard/')

    let redirectTo: string
    if (normalizedNext && normalizedNext !== '/' && isAllowed(normalizedNext)) {
      redirectTo = normalizedNext
    } else {
      redirectTo = roleDashboard
    }

    if (redirectTo === '/dashboard') {
      redirectTo = roleDashboard
    }

    const finalUrl = `${origin}${redirectTo}`
    return NextResponse.redirect(finalUrl)
  } catch (err) {
    console.error('[auth/confirm] Unexpected error:', err)
    try {
      await supabase.auth.signOut()
    } catch {}
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }
}
