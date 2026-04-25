import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * OAuth callback. Distinguishes between three cases:
 *
 * 1. **Existing user with a role** → redirect to their dashboard.
 * 2. **Pre-declared role** in `?role=` (passed by the dedicated
 *    "Sign in as professional / patient" buttons) → create the profile
 *    with that role and proceed.
 * 3. **Brand-new user, no declared role** → redirect to
 *    /complete-profile?from=oauth so they choose patient or professional.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"
  const declaredRole = searchParams.get("role") // optional intent

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`)
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

  console.log("[auth/callback] code exchange:", { hasError: !!error, userId: user?.id, hasCode: !!code })

  if (error) {
    console.error("Auth callback error:", error)
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`)
  }

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`)
  }

  // Pull existing profile (if any)
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, role, is_onboarded")
    .eq("id", user.id)
    .maybeSingle()

  console.log("[auth/callback] profile lookup:", { userId: user.id, existingRole: existingProfile?.role })

  // Helpers from Google metadata
  const fullName = (user.user_metadata?.full_name as string | undefined)?.split(" ") || []
  const firstName =
    (user.user_metadata?.first_name as string | undefined) ||
    fullName[0] ||
    user.email?.split("@")[0] ||
    "Usuario"
  const lastName =
    (user.user_metadata?.last_name as string | undefined) ||
    fullName.slice(1).join(" ") ||
    ""

  // CASE 1 — existing user with a role already → just route them
  if (existingProfile && existingProfile.role) {
    const role = existingProfile.role
    let target = next
    if (next === "/dashboard") {
      if (role === "admin") target = "/dashboard/admin"
      else if (role === "professional") target = "/dashboard/professional"
      else target = "/dashboard/patient"
    }
    return NextResponse.redirect(`${origin}${target}`)
  }

  // CASE 2 — declared role in URL (signup buttons can pass ?role=patient|professional)
  const validDeclared =
    declaredRole === "patient" || declaredRole === "professional"
      ? declaredRole
      : null

  if (validDeclared) {
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        email: user.email,
        role: validDeclared,
        email_verified: user.email_confirmed_at !== null,
        is_onboarded: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )

    if (validDeclared === "professional") {
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
        console.error("Professional record creation error:", professionalError)
      }
    }

    await supabase.from("notifications").insert({
      user_id: user.id,
      type: "welcome",
      title: "¡Bienvenido a NUREA!",
      message: `¡Hola ${firstName}! Gracias por unirte a NUREA.`,
      link:
        validDeclared === "professional"
          ? "/professional/onboarding"
          : "/onboarding",
    })

    const target =
      validDeclared === "professional"
        ? "/dashboard/professional"
        : "/dashboard/patient"
    return NextResponse.redirect(`${origin}${target}`)
  }

  // CASE 3 — brand-new user without declared role → role selector.
  // Create a minimal profile (no role yet) so other pages don't crash.
  if (!existingProfile) {
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        email: user.email,
        role: "",
        email_verified: user.email_confirmed_at !== null,
        is_onboarded: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
  }

  return NextResponse.redirect(`${origin}/complete-profile?from=oauth`)
}
