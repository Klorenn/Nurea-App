import { NextResponse } from "next/server"
import { getResend, DEFAULT_FROM } from "@/lib/resend"

/**
 * POST /api/email/test
 * Sends a test "Hello World" email to pautelluscoop@gmail.com.
 * Use this to verify Resend is configured (RESEND_API_KEY in .env.local).
 */
export async function POST() {
  try {
    const resend = getResend()

    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: "pautelluscoop@gmail.com",
      subject: "Hello World",
      html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
    })

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
