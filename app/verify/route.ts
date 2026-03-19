import { NextResponse } from 'next/server'

/**
 * Redirige enlaces de verificación que apuntan a /verify (ej. generados por scripts o config antigua)
 * hacia /auth/confirm, que es la ruta que procesa token_hash y type.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const redirectUrl = new URL('/auth/confirm', url.origin)
  url.searchParams.forEach((value, key) => {
    redirectUrl.searchParams.set(key, value)
  })
  return NextResponse.redirect(redirectUrl.toString())
}
