import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * POST /api/user/select-role
 * Body: { role: "patient" | "professional" }
 *
 * Sets the role on the user's profile. If the user picks
 * "professional", we also seed an empty `professionals` row so the
 * professional dashboard doesn't error on first load.
 *
 * Used by /complete-profile after Google OAuth.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const role = body?.role

    if (role !== "patient" && role !== "professional") {
      return NextResponse.json(
        { error: "Invalid role", message: "El rol debe ser 'patient' o 'professional'." },
        { status: 400 }
      )
    }

    // Make sure the profile exists with the correct role
    const fullName =
      (user.user_metadata?.full_name as string | undefined)?.split(" ") || []
    const firstName =
      (user.user_metadata?.first_name as string | undefined) ||
      fullName[0] ||
      user.email?.split("@")[0] ||
      "Usuario"
    const lastName =
      (user.user_metadata?.last_name as string | undefined) ||
      fullName.slice(1).join(" ") ||
      ""

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          first_name: firstName,
          last_name: lastName,
          email: user.email,
          role,
          email_verified: user.email_confirmed_at !== null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )

    if (profileError) {
      console.error("[select-role] profile upsert error:", profileError)
      return NextResponse.json(
        { error: "profile_upsert_failed", message: profileError.message },
        { status: 500 }
      )
    }

    if (role === "professional") {
      const { error: professionalError } = await supabase
        .from("professionals")
        .upsert(
          {
            id: user.id,
            specialty: "",
            bio: "",
            consultation_type: "both",
            consultation_price: 0,
            online_price: 0,
            in_person_price: 0,
            availability: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        )
      if (professionalError) {
        console.error("[select-role] professional upsert error:", professionalError)
      }
    }

    const redirectPath =
      role === "professional" ? "/dashboard/professional" : "/dashboard/patient"

    return NextResponse.json({ ok: true, role, redirectPath })
  } catch (err) {
    console.error("[select-role] error:", err)
    return NextResponse.json(
      { error: "internal_error", message: (err as Error).message },
      { status: 500 }
    )
  }
}
