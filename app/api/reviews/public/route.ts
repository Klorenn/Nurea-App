import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get public reviews with patient information
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select(`
        id,
        rating,
        comment,
        created_at,
        patient_id,
        profiles!reviews_patient_id_fkey(
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error fetching reviews:", error)
      return NextResponse.json(
        { error: "Error al obtener reseñas" },
        { status: 500 }
      )
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
    console.error("Error in public reviews API:", error)
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    )
  }
}
