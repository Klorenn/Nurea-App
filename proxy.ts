import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  // Redirigir /paciente → /dashboard/patient (un solo espacio paciente)
  if (pathname === '/paciente' || pathname.startsWith('/paciente/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname === '/paciente' ? '/dashboard/patient' : '/dashboard/patient' + pathname.slice(9)
    return NextResponse.redirect(url)
  }
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
