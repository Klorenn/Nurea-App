import { NextResponse } from "next/server"
import { Resend } from "resend"
import SecurityAlertEmail from "@/components/emails/SecurityAlertEmail"
import { createClient } from "@/lib/supabase/server"

// Initialize Resend (with a dummy key if not present)
const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key")
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "hola@nurea.cl"

export async function POST(req: Request) {
  try {
    // Auth + admin role check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    const { professionalId, doctorName } = await req.json()
    
    if (!professionalId || !doctorName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not found. Logging SecurityAlert email to console:")
      console.log(`To: ${ADMIN_EMAIL}, From: NUREA Security, Subject: ⚠️ Alerta de Seguridad Crítica - ${doctorName}`)
      return NextResponse.json({ success: true, simulated: true })
    }

    const data = await resend.emails.send({
      from: "NUREA Security <seguridad@nurea.cl>",
      to: ADMIN_EMAIL,
      subject: `⚠️ Alerta de Seguridad Crítica - ${doctorName}`,
      react: SecurityAlertEmail({ doctorName, professionalId }) as React.ReactElement,
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error sending admin notification email:", error)
    return NextResponse.json(
      { error: "Failed to send notification email" },
      { status: 500 }
    )
  }
}
