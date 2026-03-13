import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendVerificationLink } from "@/lib/email-service"

function isConnectionError(error: unknown): boolean {
  if (!error) return false
  const err = error as any
  const message = (err?.message ?? err?.toString?.() ?? "") as string
  const code = (err?.code ?? err?.status ?? "") as string

  const normalized = `${message} ${code}`.toLowerCase()

  return (
    normalized.includes("connecttimeouterror") ||
    normalized.includes("timeout") ||
    normalized.includes("timed out") ||
    normalized.includes("etimedout") ||
    normalized.includes("network error") ||
    normalized.includes("failed to fetch") ||
    normalized.includes("fetch failed") ||
    normalized.includes("getaddrinfo") ||
    normalized.includes("enotfound")
  )
}

/**
 * POST /api/auth/resend-verification
 * Reenv?a el email de verificaci?n.
 *
 * Modos de uso:
 * - Con sesi?n (flujo normal): usa la sesi?n actual para obtener el usuario.
 * - Sin sesi?n pero con `email` en el body: genera el enlace y env?a el correo
 *   usando Supabase Admin + Resend (no requiere sesi?n del usuario).
 *
 * Si faltan RESEND_API_KEY o SUPABASE_SERVICE_ROLE_KEY, hace fallback a Supabase auth.resend().
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json().catch(() => ({} as any))
    const emailFromBody =
      body && typeof body.email === "string" ? String(body.email).trim() || null : null

    let user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] | null = null
    let userError: Awaited<ReturnType<typeof supabase.auth.getUser>>["error"] | null = null

    // Si NO tenemos email en el body, usamos la sesi?n actual
    if (!emailFromBody) {
      const result = await supabase.auth.getUser()
      user = result.data.user
      userError = result.error
    }

    if (!emailFromBody && (userError || !user)) {
      return NextResponse.json(
        {
          error: "not_authenticated",
          message: "Inicia sesi?n para reenviar el email de verificaci?n.",
        },
        { status: 401 }
      )
    }

    if (!emailFromBody && user && user.email_confirmed_at) {
      return NextResponse.json(
        {
          error: "already_verified",
          message: "Tu email ya est? verificado. Puedes iniciar sesi?n normalmente.",
        },
        { status: 400 }
      )
    }

    const redirectUrl =
      process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL || `https://${process.env.VERCEL_URL}`}`
        : "http://localhost:3000"
    const redirectTo = `${redirectUrl}/api/auth/callback`

    const emailToUse = emailFromBody || (user?.email ?? null)

    if (!emailToUse) {
      return NextResponse.json(
        {
          error: "missing_email",
          message: "No se pudo determinar el email para reenviar la verificaci?n.",
        },
        { status: 400 }
      )
    }

    const hasResend = !!process.env.RESEND_API_KEY
    const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY

    if (hasResend && hasServiceRole) {
      try {
        const admin = createAdminClient()
        const { data: linkData, error: linkError } =
          await admin.auth.admin.generateLink({
            type: "magiclink",
            email: emailToUse,
            options: { redirectTo },
          })

        if (linkError) {
          console.error("[resend-verification] generateLink error:", linkError)

          if (isConnectionError(linkError)) {
            return NextResponse.json(
              {
                error: "connection_error",
                message:
                  "Error de conexi?n con el servidor de salud. Por favor, intenta de nuevo en unos segundos.",
              },
              { status: 503 }
            )
          }

          return NextResponse.json(
            {
              error: "send_failed",
              message:
                "No pudimos generar el enlace. Int?ntalo m?s tarde o configura SMTP en Supabase.",
            },
            { status: 500 }
          )
        }

        const actionLink =
          (linkData as { properties?: { action_link?: string } })?.properties
            ?.action_link ??
          (linkData as { action_link?: string })?.action_link

        if (!actionLink) {
          console.error("[resend-verification] No action_link in generateLink response:", linkData)
          return NextResponse.json(
            {
              error: "send_failed",
              message: "No pudimos preparar el enlace. Int?ntalo m?s tarde.",
            },
            { status: 500 }
          )
        }

        let userName = "Usuario"
        if (!emailFromBody && user) {
          userName =
            user.user_metadata?.first_name ||
            user.user_metadata?.full_name?.split(" ")[0] ||
            "Usuario"
        } else if (emailFromBody) {
          userName = emailFromBody.split("@")[0] || "Usuario"
        }
        const result = await sendVerificationLink({
          to: emailToUse,
          userName,
          verificationLink: actionLink,
        })

        if (!result.success) {
          console.error("[resend-verification] Resend error:", result.error)
          const isDev = process.env.NODE_ENV === "development"
          const detail = isDev && result.error ? ` Detalle: ${result.error}` : ""
          return NextResponse.json(
            {
              error: "send_failed",
              message:
                "No pudimos enviar el email. Comprueba RESEND_API_KEY y, si usas SECURITY_EMAIL_FROM con tu dominio, que est? verificado en la misma regi?n en Resend." +
                detail,
            },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          message:
            "Te hemos enviado un nuevo email de verificaci?n. Revisa tu bandeja de entrada (y spam).",
        })
      } catch (resendErr) {
        console.error("[resend-verification] Resend flow exception:", resendErr)

        if (isConnectionError(resendErr)) {
          return NextResponse.json(
            {
              error: "connection_error",
              message:
                "Error de conexi?n con el servidor de salud. Por favor, intenta de nuevo en unos segundos.",
            },
            { status: 503 }
          )
        }

        return NextResponse.json(
          {
            error: "send_failed",
            message: "Error al enviar por Resend. Int?ntalo m?s tarde.",
          },
          { status: 500 }
        )
      }
    }

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: emailToUse,
      options: { emailRedirectTo: redirectTo },
    })

    if (error) {
      console.error("[resend-verification] Supabase resend error:", error)

      if (isConnectionError(error)) {
        return NextResponse.json(
          {
            error: "connection_error",
            message:
              "Error de conexi?n con el servidor de salud. Por favor, intenta de nuevo en unos segundos.",
          },
          { status: 503 }
        )
      }

      return NextResponse.json(
        {
          error: "send_failed",
          message:
            "No pudimos enviar el email. Configura RESEND_API_KEY y SUPABASE_SERVICE_ROLE_KEY, o SMTP en Supabase (Resend), e int?ntalo m?s tarde.",
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message:
        "Te hemos enviado un nuevo email de verificaci?n. Revisa tu bandeja de entrada (y spam).",
    })
  } catch (error) {
    console.error("[resend-verification]", error)

    if (isConnectionError(error)) {
      return NextResponse.json(
        {
          error: "connection_error",
          message:
            "Error de conexi?n con el servidor de salud. Por favor, intenta de nuevo en unos segundos.",
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        error: "server_error",
        message: "Algo sali? mal. Por favor, int?ntalo de nuevo en unos momentos.",
      },
      { status: 500 }
    )
  }
}
