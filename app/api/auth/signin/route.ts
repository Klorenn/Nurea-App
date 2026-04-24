import { NextResponse } from 'next/server'

/**
 * POST /api/auth/signin
 * DEPRECATED: Clerk handles sign-in via its dashboard
 * This endpoint is no longer used as authentication moved to Clerk
 */
export async function POST(request: Request) {
  return NextResponse.json(
    {
      error: 'deprecated',
      message: 'Sign in is now handled by Clerk. Please use the Clerk sign-in flow.',
    },
    { status: 410 }
  )
}

