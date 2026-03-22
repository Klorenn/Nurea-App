import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { userId, title, message } = body

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: "missing_fields", message: "Faltan campos requeridos: userId, title, message." },
        { status: 400 }
      )
    }

    // Verify caller is authenticated and is admin
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const { data: callerProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!callerProfile || callerProfile.role !== "admin") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const adminClient = createAdminClient()

    // Get target user's role to determine action_url
    const { data: targetProfile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single()

    const actionUrl =
      targetProfile?.role === "professional"
        ? "/dashboard/professional/chat"
        : "/dashboard/patient/chat"

    // Insert notification for the target user
    const { error: notifError } = await adminClient.from("notifications").insert({
      user_id: userId,
      type: "admin_message",
      title,
      message,
      action_url: actionUrl,
    })

    if (notifError) {
      console.error("[message-user] Error inserting notification:", notifError)
    }

    // Get or create conversation between admin and target user
    const { data: conversationId, error: rpcError } = await adminClient.rpc(
      "get_or_create_conversation",
      {
        p_user_a: user.id,
        p_user_b: userId,
        p_professional_id:
          targetProfile?.role === "professional" ? userId : user.id,
      }
    )

    if (rpcError || !conversationId) {
      console.error("[message-user] Error getting/creating conversation:", rpcError)
      return NextResponse.json({ success: true })
    }

    // Insert chat message
    const { error: msgError } = await adminClient.from("chat_messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: message,
      message_type: "system",
      status: "sent",
    })

    if (msgError) {
      console.error("[message-user] Error inserting chat message:", msgError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[message-user] Unexpected error:", error)
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
