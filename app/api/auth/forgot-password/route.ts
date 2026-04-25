import { NextResponse } from "next/server"

/**
 * POST /api/auth/forgot-password
 * DEPRECATED: Use Supabase password reset instead
 */
export async function POST(request: Request) {
  return NextResponse.json(
    {
      error: "deprecated",
      message: "Password reset is handled by Supabase. Please use the reset password page.",
    },
    { status: 410 }
  )
}
