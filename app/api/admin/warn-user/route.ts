import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { userId, message, remove } = body

    if (!userId || !message) {
      return NextResponse.json(
        { error: "missing_fields", message: "Faltan campos requeridos: userId, message." },
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

    const notification = remove
      ? {
          user_id: userId,
          type: "admin_message",
          title: "✅ Advertencia retirada",
          message: "Tu advertencia ha sido retirada por el equipo de Nurea.",
        }
      : {
          user_id: userId,
          type: "admin_warning",
          title: "⚠️ Advertencia de Nurea",
          message,
        }

    const { error: notifError } = await adminClient.from("notifications").insert(notification)

    if (notifError) {
      console.error("[warn-user] Error inserting notification:", notifError)
      return NextResponse.json(
        { error: "insert_failed", message: "No se pudo insertar la notificación." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[warn-user] Unexpected error:", error)
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
