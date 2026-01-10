/**
 * Calculate Rating Utility
 * 
 * Calcula el rating promedio de un profesional basado en sus reviews
 */

import { createClient } from '@/lib/supabase/server'

/**
 * Calcula el rating promedio de un profesional desde la tabla reviews
 * Retorna un objeto con rating (0-5) y reviewCount
 */
export async function calculateProfessionalRating(
  professionalId: string
): Promise<{ rating: number; reviewCount: number }> {
  try {
    const supabase = await createClient()

    // Obtener todas las reviews del profesional
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('professional_id', professionalId)

    if (reviewsError) {
      console.error('Error obteniendo reviews para rating:', reviewsError)
      // Retornar rating por defecto si hay error
      return {
        rating: 4.8,
        reviewCount: 0,
      }
    }

    if (!reviews || reviews.length === 0) {
      // No hay reviews aún, retornar rating por defecto
      return {
        rating: 4.8,
        reviewCount: 0,
      }
    }

    // Calcular promedio
    const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0)
    const averageRating = totalRating / reviews.length

    // Redondear a 1 decimal
    const roundedRating = Math.round(averageRating * 10) / 10

    return {
      rating: roundedRating,
      reviewCount: reviews.length,
    }
  } catch (error) {
    console.error('Error calculando rating:', error)
    return {
      rating: 4.8,
      reviewCount: 0,
    }
  }
}

/**
 * Calcula ratings para múltiples profesionales de forma eficiente
 */
export async function calculateMultipleRatings(
  professionalIds: string[]
): Promise<Record<string, { rating: number; reviewCount: number }>> {
  try {
    const supabase = await createClient()

    // Obtener todas las reviews de los profesionales en una sola query
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('professional_id, rating')
      .in('professional_id', professionalIds)

    if (reviewsError || !reviews) {
      console.error('Error obteniendo reviews:', reviewsError)
      // Retornar ratings por defecto
      return professionalIds.reduce(
        (acc, id) => {
          acc[id] = { rating: 4.8, reviewCount: 0 }
          return acc
        },
        {} as Record<string, { rating: number; reviewCount: number }>
      )
    }

    // Agrupar por professional_id y calcular promedios
    const ratingsMap: Record<string, { sum: number; count: number }> = {}

    reviews.forEach((review) => {
      const profId = review.professional_id
      if (!ratingsMap[profId]) {
        ratingsMap[profId] = { sum: 0, count: 0 }
      }
      ratingsMap[profId].sum += review.rating || 0
      ratingsMap[profId].count += 1
    })

    // Calcular promedios y crear resultado
    const result: Record<string, { rating: number; reviewCount: number }> = {}

    professionalIds.forEach((id) => {
      if (ratingsMap[id]) {
        const avg = ratingsMap[id].sum / ratingsMap[id].count
        result[id] = {
          rating: Math.round(avg * 10) / 10,
          reviewCount: ratingsMap[id].count,
        }
      } else {
        // No hay reviews para este profesional
        result[id] = {
          rating: 4.8,
          reviewCount: 0,
        }
      }
    })

    return result
  } catch (error) {
    console.error('Error calculando múltiples ratings:', error)
    // Retornar ratings por defecto
    return professionalIds.reduce(
      (acc, id) => {
        acc[id] = { rating: 4.8, reviewCount: 0 }
        return acc
      },
      {} as Record<string, { rating: number; reviewCount: number }>
    )
  }
}
