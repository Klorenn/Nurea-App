import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

    return NextResponse.json({ success: data })
  } catch (error) {
    console.error("Error updating verification:", error)
    return NextResponse.json({ error: "internal_error" }, { status: 500 })
  }
}
