import { NextResponse } from "next/server"

/**
 * POST /api/auth/forgot-password
 * DEPRECATED: Clerk handles password reset via its dashboard
 * This endpoint is no longer used as authentication moved to Clerk
 */
export async function POST(request: Request) {
  return NextResponse.json(
    {
      error: "deprecated",
      message: "Password reset is now handled by Clerk. Please use the Clerk forgot password flow.",
    },
    { status: 410 }
  )
}

