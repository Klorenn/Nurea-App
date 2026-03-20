import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const { data, error } = await supabase
      .from("patient_dependents")
      .select("*")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: true })

    if (error) throw error
    return NextResponse.json({ dependents: data || [] })
  } catch (err) {
    console.error("GET /api/patient/dependents error:", err)
    return NextResponse.json({ error: "internal_error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const body = await req.json()
    const { first_name, last_name, rut, relationship, dob, document_url } = body

    if (!first_name || !last_name || !rut || !relationship) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("patient_dependents")
      .insert({
        patient_id: user.id,
        first_name,
        last_name,
        rut,
        relationship,
        dob: dob || null,
        document_url: document_url || null,
        verified: false,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ dependent: data })
  } catch (err) {
    console.error("POST /api/patient/dependents error:", err)
    return NextResponse.json({ error: "internal_error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 })

    const { error } = await supabase
      .from("patient_dependents")
      .delete()
      .eq("id", id)
      .eq("patient_id", user.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/patient/dependents error:", err)
    return NextResponse.json({ error: "internal_error" }, { status: 500 })
  }
}
