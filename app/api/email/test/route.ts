import { NextResponse } from "next/server"
import { getResend, sendSingleWithRetry, buildIdempotencyKey } from "@/lib/resend"

/**
 * POST /api/email/test
 * Envía un email de prueba a pautelluscoop@gmail.com.
 * Con SECURITY_EMAIL_FROM (dominio verificado) Resend permite enviar a cualquier correo.
 * Idempotency: test-email/<timestamp>.
 */
export async function POST() {
  try {
    const FROM = process.env.SECURITY_EMAIL_FROM
    if (!FROM) {
      return NextResponse.json({ success: false, error: "SECURITY_EMAIL_FROM no está configurado." }, { status: 500 })
    }

    const resend = getResend()

    const { data, error } = await sendSingleWithRetry(
      resend,
      {
        from: FROM,
        to: ["pautelluscoop@gmail.com"],
        subject: "Hello World",
        html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
      },
      buildIdempotencyKey("test-email", String(Date.now()))
    )

    if (error) {
      console.error("[email/test] Resend error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to send email"
    console.error("[email/test]", e)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
