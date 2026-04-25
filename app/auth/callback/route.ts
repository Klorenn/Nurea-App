import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

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

  if (error) {
    console.error("Auth callback error:", error)
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`)
  }

  if (user) {
    const fullName = user.user_metadata?.full_name?.split(" ") || []
    const firstName = user.user_metadata?.first_name || fullName[0] || user.email?.split("@")[0] || "Usuario"
    const lastName = user.user_metadata?.last_name || fullName.slice(1).join(" ") || ""

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle()

    if (!existingProfile) {
      const provider = user.app_metadata?.provider || "email"
      const role = user.user_metadata?.role || "patient"

      await supabase.from("profiles").upsert({
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        email: user.email,
        role,
        email_verified: user.email_confirmed_at !== null,
        created_at: new Date().toISOString(),
      })

      if (role === "professional") {
        const { error: professionalError } = await supabase.from("professionals").upsert({
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
        })
        if (professionalError) {
          console.error("Professional record creation error:", professionalError)
        }
      }

      await supabase.from("notifications").insert({
        user_id: user.id,
        type: "welcome",
        title: "¡Bienvenido a NUREA!",
        message: `¡Hola ${firstName}! Gracias por unirte a NUREA.`,
        link: role === "professional" ? "/professional/onboarding" : "/explore",
      })
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}