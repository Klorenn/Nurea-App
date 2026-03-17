import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { 
          error: 'unauthorized',
          message: 'Por favor, inicia sesión para enviar una reseña.'
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { appointmentId, professionalName, rating, comment } = body

    // Validar campos requeridos
    if (!appointmentId || !professionalName || rating === undefined || rating === null) {
      return NextResponse.json(
        { 
          error: 'missing_fields',
          message: 'Faltan campos requeridos: appointmentId, professionalName, rating'
        },
        { status: 400 }
      )
    }

    // Validar rango de rating
    const numericRating = Number(rating)
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json(
        { 
          error: 'invalid_rating',
          message: 'La calificación debe estar entre 1 y 5'
        },
        { status: 400 }
      )
    }

    // Verificar que la cita existe y pertenece al paciente
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('id, patient_id, professional_id, status')
      .eq('id', appointmentId)
      .eq('patient_id', user.id)
      .single()

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { 
          error: 'appointment_not_found',
          message: 'No se encontró la cita o no tienes permiso para reseñarla.'
        },
        { status: 404 }
      )
    }

    // Verificar que la cita esté completada
    if (appointment.status !== 'completed') {
      return NextResponse.json(
        { 
          error: 'invalid_status',
          message: 'Solo puedes reseñar citas completadas.'
        },
        { status: 400 }
      )
    }

    // Verificar que no haya una reseña existente para esta cita
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('appointment_id', appointmentId)
      .eq('patient_id', user.id)
      .single()

    if (existingReview) {
      return NextResponse.json(
        { 
          error: 'review_exists',
          message: 'Ya existe una reseña para esta cita.'
        },
        { status: 400 }
      )
    }

    // Crear la reseña en la base de datos
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        appointment_id: appointmentId,
        patient_id: user.id,
        doctor_id: appointment.professional_id, // renamed from professional_id in v2 migration
        rating: numericRating,
        comment: comment?.trim() || null,
      })
      .select()
      .single()

    if (reviewError) {
      console.error('Error creando reseña:', reviewError)
      return NextResponse.json(
        { 
          error: 'create_failed',
          message: 'No pudimos guardar la reseña. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Reseña guardada exitosamente',
        review: {
          id: review.id,
          appointmentId: review.appointment_id,
          professionalId: review.doctor_id, // renamed from professional_id in v2 migration
          rating: review.rating,
          comment: review.comment,
          createdAt: review.created_at,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error processing review:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Error al procesar la reseña. Por favor intenta de nuevo.'
      },
      { status: 500 }
    )
  }
}

