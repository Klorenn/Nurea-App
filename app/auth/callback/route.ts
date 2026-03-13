import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const next = request.nextUrl.searchParams.get("next")

  // Si no hay código, redirigir a página de error
  if (!code) {
    console.error("[auth/callback] No code provided in callback URL")
    return NextResponse.redirect(new URL("/auth/auth-code-error", request.url))
  }

  // Crear cliente de Supabase y hacer el intercambio
  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  // Si hay error en el intercambio, redirigir a página de error
  if (error) {
    console.error("[auth/callback] exchangeCodeForSession error:", error.message)
    return NextResponse.redirect(
      new URL("/login?error=Invalid+Link", request.url)
    )
  }

  // Si no hay usuario en la sesión, redirigir a página de error
  if (!data.user) {
    console.error("[auth/callback] No user returned after code exchange")
    return NextResponse.redirect(new URL("/auth/auth-code-error", request.url))
  }

  const user = data.user
  const userRole = user.user_metadata?.role as string | undefined

  // Determinar ruta de destino según el rol
  let targetPath: string

  switch (userRole) {
    case "professional": {
      // Verificar si el profesional necesita completar onboarding
      const { data: professional } = await supabase
        .from("professionals")
        .select("specialty, bio")
        .eq("id", user.id)
        .maybeSingle()

      const needsOnboarding = !professional?.specialty || !professional?.bio
      targetPath = needsOnboarding
        ? "/dashboard/professional/onboarding"
        : "/dashboard/professional"
      break
    }

    case "admin":
      targetPath = "/admin"
      break

    case "patient":
      targetPath = "/dashboard/patient"
      break

    default:
      // Si hay un parámetro "next", usarlo; sino, dashboard por defecto
      targetPath = next || "/dashboard"
      break
  }

  // Redirección absoluta usando el constructor de URL
  return NextResponse.redirect(new URL(targetPath, request.url))
}
