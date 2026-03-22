import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { userId } = body

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "missing_fields", message: "Falta el campo requerido: userId." },
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

    // Soft-delete user from auth
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error("[delete-user] Error deleting user:", deleteError)
      return NextResponse.json(
        { error: "delete_failed", message: "No se pudo eliminar el usuario." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[delete-user] Unexpected error:", error)
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
