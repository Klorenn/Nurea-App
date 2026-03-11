import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const professionalId = searchParams.get('professionalId')

    // Build query
    let query = supabase
      .from("reviews")
      .select(`
        id,
        rating,
        comment,
        created_at,
        patient_id,
        professional_id,
        profiles!reviews_patient_id_fkey(
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .order("created_at", { ascending: false })

    // Filter by professional if provided
    if (professionalId) {
      query = query.eq('professional_id', professionalId)
    }

    const { data: reviews, error } = await query.limit(professionalId ? 50 : 10)

    if (error) {
      // Para la landing / perfiles, las reseñas son opcionales:
      // si hay cualquier error (tabla faltante, RLS, etc.), devolvemos lista vacía.
      console.warn("Error fetching public reviews, returning empty list instead:", error)
      return NextResponse.json({ reviews: [] })
    }

    // Format reviews for display
    const formattedReviews = reviews
      ?.filter((review) => review.comment && review.comment.trim().length > 0)
      .map((review: any) => {
        const patient = review.profiles || null
        return {
          id: review.id,
          quote: review.comment || "",
          name: patient
            ? `${patient.first_name || ""} ${patient.last_name || ""}`.trim() || "Paciente"
            : "Paciente",
          designation: "Paciente",
          src: patient?.avatar_url || "/placeholder-avatar.jpg",
          rating: review.rating,
          createdAt: review.created_at,
        }
      }) || []

    return NextResponse.json({ reviews: formattedReviews })
  } catch (error) {
    // Cualquier fallo inesperado también devuelve lista vacía para no romper la landing.
    console.error("Error in public reviews API, returning empty list:", error)
    return NextResponse.json({ reviews: [] })
  }
}
