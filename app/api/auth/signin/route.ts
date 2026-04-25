import { NextResponse } from 'next/server'

/**
 * POST /api/auth/signin
 * DEPRECATED: Use Supabase email/password or OAuth login instead
 */
export async function POST(request: Request) {
  return NextResponse.json(
    {
      error: 'deprecated',
      message: 'Sign in is handled by Supabase. Please use the login page.',
    },
    { status: 410 }
  )
}
