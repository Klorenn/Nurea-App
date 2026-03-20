import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Resend } from "resend"
import WelcomeProfessionalEmail from "@/components/emails/WelcomeProfessionalEmail"

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key")

export async function GET() {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    // Admin role check
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

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

    // Auth + admin role check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (callerProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    const { professionalId, status, notes } = await request.json()

    // Call update status RPC
    let rpcError: any = null
    const { data, error } = await supabase.rpc('update_verification_status', {
      // Orden pensado para calzar con el overload que espera supabase-js.
      p_new_status: status,
      p_notes: notes,
      p_professional_id: professionalId,
    })

    rpcError = error

    if (rpcError) {
      const rpcMessage = String(rpcError?.message || rpcError)
      console.error('RPC update_verification_status error (admin/verifications):', rpcError)

      // Fallback directo para destrabar si el RPC no está en schema cache/DB.
      const rpcMessageLower = rpcMessage.toLowerCase()
      if (rpcMessageLower.includes('could not find the function') && rpcMessageLower.includes('update_verification_status')) {
        const adminClient = createAdminClient()
        const adminId = user.id

        const updatePayload: Record<string, any> = {
          verification_status: status,
          verified_by: adminId,
        }

        if (notes !== undefined) {
          updatePayload.verification_notes = notes ?? null
        }

        if (status === 'verified' || status === 'rejected') {
          updatePayload.verification_date = new Date().toISOString()
        }

        const { error: updateError } = await adminClient
          .from('professionals')
          .update(updatePayload)
          .eq('id', professionalId)

        if (updateError) throw updateError
      } else {
        throw rpcError
      }
    }

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
