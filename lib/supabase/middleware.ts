import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { canAccessRoute } from '@/lib/auth/utils'

export async function updateSession(request: NextRequest) {
  // Skip Supabase if not configured (for development/testing)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

  // Rutas públicas (no requieren autenticación)
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/legal',
    '/test-supabase',
    '/search',
    '/pacientes',
    '/profesionales',
    '/professionals',
  ]

  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
  const isApiRoute = pathname.startsWith('/api')
  const isStaticFile = pathname.startsWith('/_next') || pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp)$/)

  // Si no hay usuario y no es ruta pública, redirigir a login
  if (!user && !isPublicRoute && !isApiRoute && !isStaticFile) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Si hay usuario, verificar acceso por rol
  if (user && !isPublicRoute && !isApiRoute && !isStaticFile) {
    // Obtener el rol del usuario desde el perfil
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = (profile?.role as 'patient' | 'professional' | 'admin') || 'patient'

    // Verificar si el usuario puede acceder a esta ruta
    if (!canAccessRoute(userRole, pathname)) {
      // Redirigir según el rol del usuario
      const redirectPath = userRole === 'professional' ? '/professional/dashboard' : '/dashboard'
      const url = request.nextUrl.clone()
      url.pathname = redirectPath
      return NextResponse.redirect(url)
    }

    // Si el usuario intenta acceder a /complete-profile pero ya completó su perfil
    if (pathname === '/complete-profile') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('date_of_birth, email_verified')
        .eq('id', user.id)
        .single()

      const emailVerified = user.email_confirmed_at !== null || profile?.email_verified
      const profileComplete = !!profile?.date_of_birth && emailVerified

      if (profileComplete) {
        const redirectPath = userRole === 'professional' ? '/professional/dashboard' : '/dashboard'
        const url = request.nextUrl.clone()
        url.pathname = redirectPath
        return NextResponse.redirect(url)
      }
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

