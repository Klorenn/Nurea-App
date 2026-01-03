import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { appointmentId, professionalName, rating, comment } = body

    // Validate required fields
    if (!appointmentId || !professionalName || !rating) {
      return NextResponse.json(
        { message: "Faltan campos requeridos: appointmentId, professionalName, rating" },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: "La calificación debe estar entre 1 y 5" },
        { status: 400 }
      )
    }

    // Simulate saving to database
    // In production, you would save this to your database here
    console.log("Review submitted:", {
      appointmentId,
      professionalName,
      rating,
      comment: comment || null,
      timestamp: new Date().toISOString(),
    })

    // Simulate potential error (10% chance for testing)
    if (Math.random() < 0.1) {
      return NextResponse.json(
        { message: "Error temporal del servidor. Por favor intenta de nuevo." },
        { status: 500 }
      )
    }

    // Success response
    return NextResponse.json(
      {
        message: "Reseña guardada exitosamente",
        review: {
          id: `REV-${Date.now()}`,
          appointmentId,
          professionalName,
          rating,
          comment: comment || null,
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error processing review:", error)
    return NextResponse.json(
      { message: "Error al procesar la reseña. Por favor intenta de nuevo." },
      { status: 500 }
    )
  }
}

