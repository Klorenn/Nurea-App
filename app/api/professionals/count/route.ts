import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * GET /api/professionals/count
 * Devuelve el número real de profesionales (perfiles con role = 'professional')
 * y hasta 3 avatares de profesionales para mostrar en la landing.
 *
 * Importante:
 * - No se filtra por IDs estáticos no UUID (evita errores 22P02).
 * - Si hubiera lógica futura basada en slug/username, debe usar la columna de texto
 *   correspondiente (p. ej. `slug`) y nunca la columna `id` (UUID).
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // 1) Contar profesionales desde profiles (rol = 'professional')
    const { count, error } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "professional")

    if (error) {
      console.error("Error counting professionals:", error)
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      const response = NextResponse.json({
        count: 0,
        professionals: [],
        error: "Failed to count professionals",
      })
      response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
      )
      response.headers.set("Pragma", "no-cache")
      response.headers.set("Expires", "0")
      return response
    }

    // 2) Obtener hasta 3 avatares de profesionales (sin usar IDs estáticos)
    let avatars: string[] = []
    try {
      const { data: avatarProfiles, error: avatarError } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("role", "professional")
        .not("avatar_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(3)

      if (avatarError) {
        console.warn("Error fetching professional avatars:", avatarError)
      } else if (Array.isArray(avatarProfiles)) {
        avatars = avatarProfiles
          .map((p: any) => (typeof p.avatar_url === "string" ? p.avatar_url.trim() : ""))
          .filter((url) => url.length > 0)
          .slice(0, 3)
      }
    } catch (avatarError) {
      console.warn("Error fetching professional avatars:", avatarError)
      avatars = []
    }

    const result = {
      count: count || 0,
      professionals: avatars,
      timestamp: new Date().toISOString(),
    }

    const response = NextResponse.json(result)
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    )
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
    return response
  } catch (error) {
    console.error("Error in professionals count API:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    const errorResponse = NextResponse.json(
      {
        count: 0,
        professionals: [],
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
    errorResponse.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    )
    return errorResponse
  }
}

