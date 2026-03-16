import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"
import WelcomeProfessionalEmail from "@/components/emails/WelcomeProfessionalEmail"

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key")

export async function GET() {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    // Call the RPC function defined in migrations
    const { data, error } = await supabase.rpc('get_pending_verifications')

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in verifications list:", error)
    return NextResponse.json({ error: "internal_error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { professionalId, status, notes } = await request.json()

    // Auth check (RPC already does this, but good to have)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    // Call update status RPC
    const { data, error } = await supabase.rpc('update_verification_status', {
      p_professional_id: professionalId,
      p_new_status: status,
      p_notes: notes
    })

    if (error) throw error

    // Send Welcome Email if status is verified
    if (status === 'verified') {
      try {
        // Fetch user info for email
        const { data: profData, error: profError } = await supabase
          .from('profiles')
          .select('email, first_name, last_name')
          .eq('id', professionalId)
          .single()

        if (!profError && profData) {
          const doctorName = `${profData.first_name || ''} ${profData.last_name || ''}`.trim() || 'Especialista'
          
          // Try to get a slug for the profile (if exists), otherwise default to ID
          const { data: profProfile } = await supabase
            .from('professionals')
            .select('slug')
            .eq('id', professionalId)
            .single()
            
          const professionalSlug = profProfile?.slug || professionalId

          if (!process.env.RESEND_API_KEY) {
            console.log(`To: ${profData.email}, From: NUREA Welcome, Subject: ¡Tu perfil ha sido verificado!`)
          } else {
            await resend.emails.send({
              from: "NUREA <hola@nurea.cl>",
              to: profData.email,
              subject: `¡Felicidades ${doctorName}! Tu perfil en NUREA ha sido verificado`,
              react: WelcomeProfessionalEmail({ doctorName, professionalSlug }) as React.ReactElement,
            })
          }
        }
      } catch (emailError) {
        console.error("Error sending welcome verification email:", emailError)
        // Non-blocking error, we still return success for the verification itself
      }
    }

    return NextResponse.json({ success: data })
  } catch (error) {
    console.error("Error updating verification:", error)
    return NextResponse.json({ error: "internal_error" }, { status: 500 })
  }
}
