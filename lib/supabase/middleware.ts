import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { validateRouteAccess } from '@/lib/auth/auth-logic'

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
      .select('role, blocked, date_of_birth, email_verified, onboarding_completed')
      .eq('id', user.id)
      .maybeSingle()

    const jwtRole = user.app_metadata?.role || user.user_metadata?.role
    const userRole = (profile?.role || jwtRole || 'patient') as 'patient' | 'professional' | 'admin'

    // Verificar si la cuenta está bloqueada
    if (profile?.blocked) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'account_blocked')
      const res = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((c) => res.cookies.set(c.name, c.value, c))
      return res
    }

    // Redirigir /dashboard exacto al dashboard por rol
    if (pathname === '/dashboard') {
      const redirectPath = userRole === 'professional' 
        ? '/dashboard/professional' 
        : userRole === 'admin' 
          ? '/dashboard/admin' 
          : '/dashboard/patient'
      return redirectWithCookies(redirectPath)
    }

    // Verificar acceso a la ruta con validación estricta
    const routeValidation = validateRouteAccess(pathname, userRole)
    
    if (!routeValidation.allowed) {
      const redirectPath = routeValidation.redirectTo ||
        (userRole === 'professional' ? '/dashboard/professional' : (userRole === 'admin' ? '/dashboard/admin' : '/dashboard/patient'))
      return redirectWithCookies(redirectPath)
    }

    if (pathname === '/complete-profile') {
      const emailVerified = user.email_confirmed_at !== null || profile?.email_verified
      const onboardingCompleted = !!profile?.onboarding_completed

      if (onboardingCompleted && emailVerified) {
        const redirectPath =
          userRole === 'professional'
            ? '/dashboard/professional'
            : userRole === 'admin'
              ? '/dashboard/admin'
              : '/dashboard/patient'
        return redirectWithCookies(redirectPath)
      }

      // Wizard v2 will handle the rest.
      return redirectWithCookies('/onboarding')
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

