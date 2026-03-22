import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const { review_id, reply_text } = body ?? {}

  if (!review_id || typeof review_id !== "string") {
    return NextResponse.json({ error: "review_id required" }, { status: 400 })
  }
  if (!reply_text || typeof reply_text !== "string" || reply_text.trim().length === 0) {
    return NextResponse.json({ error: "reply_text required" }, { status: 400 })
  }
  if (reply_text.trim().length > 500) {
    return NextResponse.json({ error: "reply_text max 500 characters" }, { status: 400 })
  }

  // Verify review belongs to this professional (doctor_id = canonical column)
  const { data: review, error: fetchError } = await supabase
    .from("reviews")
    .select("id, doctor_id")
    .eq("id", review_id)
    .eq("doctor_id", user.id)
    .single()

  if (fetchError || !review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 })
  }

  const { error } = await supabase
    .from("reviews")
    .update({ reply_text: reply_text.trim(), replied_at: new Date().toISOString() })
    .eq("id", review_id)
    .eq("doctor_id", user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
