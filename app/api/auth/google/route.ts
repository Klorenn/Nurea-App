import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const next = searchParams.get('next') || '/dashboard'

  const supabase = await createClient()

  // Generar URL de autorización de Google
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })

  if (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login?error=oauth_failed`
    )
  }

  if (data.url) {
    return NextResponse.redirect(data.url)
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login?error=oauth_failed`
  )
}
