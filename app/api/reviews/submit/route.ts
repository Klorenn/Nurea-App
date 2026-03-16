import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * POST /api/reviews/submit
 * Submits a new review for a completed appointment.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { appointmentId, rating, comment } = await request.json()

    if (!appointmentId || !rating) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 })
    }

    // 1. Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    // 2. Verify appointment exists, is completed and belongs to the user
    const { data: appointment, error: aptError } = await supabase
      .from("appointments")
      .select("id, patient_id, professional_id, status")
      .eq("id", appointmentId)
      .single()

    if (aptError || !appointment) {
      return NextResponse.json({ error: "appointment_not_found" }, { status: 404 })
    }

    if (appointment.patient_id !== user.id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    if (appointment.status !== 'completed') {
      return NextResponse.json({ error: "appointment_not_completed" }, { status: 400 })
    }

    // 3. Insert review
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .insert({
        appointment_id: appointmentId,
        patient_id: user.id,
        doctor_id: appointment.professional_id, // Map professional_id from appointment to doctor_id in reviews
        rating: rating,
        comment: comment
      })
      .select()
      .single()

    if (reviewError) {
      if (reviewError.code === '23505') {
        return NextResponse.json({ error: "already_reviewed" }, { status: 400 })
      }
      throw reviewError
    }

    return NextResponse.json({ success: true, review })

  } catch (error) {
    console.error("Error submitting review:", error)
    return NextResponse.json({ error: "internal_error" }, { status: 500 })
  }
}
