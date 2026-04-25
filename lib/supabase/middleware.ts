import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Skip Supabase if not configured (for development/testing)
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !anonKey) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  /** Redirige y copia las cookies de Supabase para no perder la sesión al redirigir */
  const redirectWithCookies = (path: string) => {
    const url = request.nextUrl.clone()
    url.pathname = path
    const res = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((c) => res.cookies.set(c.name, c.value, c))
    return res
  }

  // Rutas públicas (no requieren autenticación)
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/signup',
    '/auth',
    '/verify',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/legal',
    '/test-supabase',
    '/search',
    '/pacientes',
    '/profesionales',
    '/professionals',
    '/explore',
    '/onboarding',
  ]

  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
  const isApiRoute = pathname.startsWith('/api')
  const isStaticFile = pathname.startsWith('/_next') || pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp)$/)

  // Si no hay usuario y no es ruta pública, redirigir a login
  if (!user && !isPublicRoute && !isApiRoute && !isStaticFile) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    const res = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((c) => res.cookies.set(c.name, c.value, c))
    return res
  }

  // Si hay usuario, verificar acceso por rol
  if (user && !isPublicRoute && !isApiRoute && !isStaticFile) {
    // Obtener el rol del usuario desde el perfil con fallback al JWT
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, blocked, date_of_birth, email_verified, is_onboarded')
      .eq('id', user.id)
      .maybeSingle()

    const jwtRole = user.app_metadata?.role || user.user_metadata?.role
    // IMPORTANT: do NOT default to 'patient' when role is missing.
    // A missing role means the user just signed in via OAuth and still
    // needs to pick patient vs professional in /complete-profile.
    const profileRole = profile?.role
    const effectiveRole = profileRole || jwtRole
    const rawRole = (effectiveRole || null) as
      | 'patient'
      | 'professional'
      | 'admin'
      | undefined
      | null

    console.log("[middleware] role check:", { userId: user.id, profileRole, jwtRole, rawRole, pathname })

    // Verificar si la cuenta está bloqueada
    if (profile?.blocked) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'account_blocked')
      const res = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((c) => res.cookies.set(c.name, c.value, c))
      return res
    }

    // Si está dentro del dashboard pero todavía no eligió rol, mandar a
    // /complete-profile para que escoja paciente o profesional.
    if (!rawRole && pathname.startsWith('/dashboard')) {
      const url = request.nextUrl.clone()
      url.pathname = '/complete-profile'
      url.searchParams.set('from', 'oauth')
      const res = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((c) => res.cookies.set(c.name, c.value, c))
      return res
    }

    const userRole = rawRole as 'patient' | 'professional' | 'admin' | undefined

    // Redirigir /dashboard exacto al dashboard por rol
    if (pathname === '/dashboard' && userRole) {
      const redirectPath =
        userRole === 'professional'
          ? '/dashboard/professional'
          : userRole === 'admin'
            ? '/dashboard/admin'
            : '/dashboard/patient'
      return redirectWithCookies(redirectPath)
    }

    // Route access validation moved to Clerk middleware in middleware.ts
    // Basic dashboard role-based routing
    if (
      pathname.startsWith('/dashboard/professional') &&
      userRole &&
      userRole !== 'professional' &&
      userRole !== 'admin'
    ) {
      return redirectWithCookies('/dashboard/patient')
    }
    if (
      pathname.startsWith('/dashboard/admin') &&
      userRole &&
      userRole !== 'admin'
    ) {
      return redirectWithCookies('/dashboard/patient')
    }

    if (pathname === '/complete-profile') {
      // Si el usuario todavía no tiene rol, lo dejamos pasar para que
      // pueda elegir paciente vs profesional en el role picker.
      if (!userRole) {
        return supabaseResponse
      }

      // Ya tiene rol; si además ya completó onboarding, lo mandamos al dashboard.
      const emailVerified = user.email_confirmed_at !== null || profile?.email_verified
      const onboardingCompleted = !!profile?.is_onboarded

      if (onboardingCompleted && emailVerified) {
        const redirectPath =
          userRole === 'professional'
            ? '/dashboard/professional'
            : userRole === 'admin'
              ? '/dashboard/admin'
              : '/dashboard/patient'
        return redirectWithCookies(redirectPath)
      }

      // Tiene rol pero falta completar onboarding → seguimos en /complete-profile
      // (la página tiene el formulario de DOB / datos básicos).
      return supabaseResponse
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object instead of the supabaseResponse object

  return supabaseResponse
}

