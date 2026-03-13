import { NextResponse } from "next/server"
import { requestPasswordReset } from "@/actions/auth"

/**
 * POST /api/auth/forgot-password
 * Delega en la Server Action que usa supabase.auth.resetPasswordForEmail(email)
 * con redirectTo a /auth/update-password.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = typeof body?.email === "string" ? body.email.trim() : ""

    if (!email) {
      return NextResponse.json(
        {
          error: "email_required",
          message: "Por favor, ingresa tu email para recuperar tu contraseña.",
        },
        { status: 400 }
      )
    }

    const result = await requestPasswordReset(email)

    if (!result.success) {
      return NextResponse.json(
        { error: "validation_error", message: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message ?? "Si ese email está registrado, recibirás un enlace. Revisa tu bandeja de entrada (y spam).",
    })
  } catch (error) {
    console.error("[forgot-password]", error)
    return NextResponse.json(
      {
        error: "server_error",
        message: "Algo salió mal. Por favor, intenta nuevamente en unos momentos.",
      },
      { status: 500 }
    )
  }
}

