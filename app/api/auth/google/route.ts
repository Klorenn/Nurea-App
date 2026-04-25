import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const next = searchParams.get('next') || '/dashboard'
  const role = searchParams.get('role') || 'patient'

  const supabase = await createClient()
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // Generar URL de autorización de Google
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // Redirect to the actual API endpoint
      redirectTo: `${siteUrl}/api/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      // Pasar el rol en los metadatos para usuarios nuevos
      skipBrowserRedirect: false,
    },
  })

  if (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.redirect(`${siteUrl}/login?error=oauth_init_failed`)
  }

  if (data.url) {
    return NextResponse.redirect(data.url)
  }

  return NextResponse.redirect(`${siteUrl}/login?error=oauth_url_missing`)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { next = '/dashboard', role = 'patient' } = body

  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/api/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ url: data.url })
}
