import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * POST /api/chat/conversations
 * Crea o devuelve una conversación existente entre el profesional y un paciente.
 * Solo el profesional puede iniciar conversaciones con sus pacientes.
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const { patientId } = await req.json()
    if (!patientId) return NextResponse.json({ error: "patientId required" }, { status: 400 })

    // Verify caller is a professional
    const { data: caller } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (caller?.role !== "professional") {
      return NextResponse.json({ error: "Only professionals can initiate conversations" }, { status: 403 })
    }

    // Verify the patient has had at least one appointment with this professional
    const { data: priorAppointment } = await supabase
      .from("appointments")
      .select("id")
      .eq("professional_id", user.id)
      .eq("patient_id", patientId)
      .in("status", ["confirmed", "completed", "no_show"])
      .limit(1)
      .maybeSingle()

    if (!priorAppointment) {
      return NextResponse.json(
        { error: "Solo puedes enviar mensajes a pacientes que hayan agendado contigo anteriormente." },
        { status: 403 }
      )
    }

    // Check if a conversation already exists between these two users
    const { data: existing } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id)

    let conversationId: string | null = null

    if (existing && existing.length > 0) {
      const myConvIds = existing.map((p) => p.conversation_id)
      const { data: shared } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", patientId)
        .in("conversation_id", myConvIds)
        .limit(1)
        .maybeSingle()

      if (shared?.conversation_id) {
        conversationId = shared.conversation_id
      }
    }

    if (!conversationId) {
      // Create new conversation (auto-accepted since professional initiates)
      const { data: conv, error: convErr } = await supabase
        .from("conversations")
        .insert({
          request_status: "accepted",
          initiated_by: user.id,
        })
        .select("id")
        .single()

      if (convErr || !conv) throw new Error("Failed to create conversation")
      conversationId = conv.id

      // Add both participants
      const { error: partErr } = await supabase.from("conversation_participants").insert([
        { conversation_id: conversationId, user_id: user.id },
        { conversation_id: conversationId, user_id: patientId },
      ])
      if (partErr) throw new Error("Failed to add participants")
    }

    return NextResponse.json({ conversationId })
  } catch (err: any) {
    console.error("[chat/conversations] POST error:", err?.message ?? err)
    return NextResponse.json({ error: err.message ?? "internal_error" }, { status: 500 })
  }
}
