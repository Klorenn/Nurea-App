/**
 * Ranking System Utility
 * 
 * Calcula el score de ranking de un profesional considerando múltiples factores:
 * - Plan premium (opcional, boost de visibilidad)
 * - Disponibilidad cercana (slots disponibles pronto)
 * - Rating promedio (peso alto)
 * - Cantidad de reseñas (confianza)
 * - Recencia de reseñas (relevancia)
 * - Tiempo de respuesta a mensajes (engagement)
 * - Completitud del perfil (calidad)
 */

import { createClient } from '@/lib/supabase/server'

export interface RankingFactors {
  professionalId: string
  hasPremiumPlan: boolean
  availabilityScore: number // 0-1: qué tan disponible está (más slots = mejor)
  rating: number // 0-5
  reviewCount: number
  recentReviewScore: number // 0-1: qué tan recientes son las reseñas (últimos 90 días)
  averageResponseTime: number | null // minutos promedio de respuesta, null si no hay datos
  profileCompleteness: number // 0-1: qué tan completo está el perfil
}

export interface RankingScore {
  professionalId: string
  score: number // Score final (mayor = mejor posición)
  factors: RankingFactors
  breakdown: {
    premiumBoost: number
    availabilityPoints: number
    ratingPoints: number
    reviewCountPoints: number
    recencyPoints: number
    responseTimePoints: number
    completenessPoints: number
  }
}

/**
 * Calcula el score de completitud del perfil de un profesional
 */
async function calculateProfileCompleteness(
  supabase: any,
  professionalId: string,
  professional: any
): Promise<number> {
  let score = 0
  let maxScore = 0

  // Campos básicos (peso alto)
  maxScore += 3
  if (professional.specialty && professional.specialty.trim() !== '') score += 1.5
  if (professional.bio && professional.bio.trim().length >= 50) score += 1.5

  // Ubicación (peso medio)
  maxScore += 2
  if (professional.location && professional.location.trim() !== '') score += 1
  if (professional.city && professional.city.trim() !== '') score += 1

  // Precios (peso medio)
  maxScore += 2
  const consultationType = professional.consultation_type || professional.consultation_types?.[0] || 'both'
  if (consultationType === 'online' || consultationType === 'both') {
    if (professional.online_price || professional.consultation_price) score += 1
  }
  if (consultationType === 'in-person' || consultationType === 'both') {
    if (professional.in_person_price || professional.consultation_price) score += 1
  }

  // Disponibilidad (peso alto)
  maxScore += 3
  if (professional.availability && typeof professional.availability === 'object') {
    const availability = professional.availability
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const hasAvailability = days.some(day => {
      const dayData = availability[day]
      return dayData && Array.isArray(dayData.slots) && dayData.slots.length > 0
    })
    if (hasAvailability) score += 3
  }

  // Avatar (peso bajo)
  maxScore += 1
  if (professional.profile?.avatar_url) score += 1

  // Idioma (peso bajo)
  maxScore += 1
  if (professional.languages && Array.isArray(professional.languages) && professional.languages.length > 0) {
    score += 1
  }

  // Licencia y registro (peso medio)
  maxScore += 2
  if (professional.license_number && professional.license_number.trim() !== '') score += 1
  if (professional.registration_number && professional.registration_number.trim() !== '') score += 1

  return Math.min(score / maxScore, 1) // Normalizar a 0-1
}

/**
 * Calcula el score de disponibilidad cercana (slots disponibles en próximas 48 horas)
 * Usa la función checkProfessionalAvailability si está disponible
 */
async function calculateAvailabilityScore(
  supabase: any,
  professionalId: string,
  consultationType: 'online' | 'in-person' | 'both' = 'both'
): Promise<number> {
  try {
    // Intentar usar la función existente de disponibilidad
    const { checkProfessionalAvailability } = await import('@/lib/utils/check-availability')
    const availability = await checkProfessionalAvailability(professionalId, consultationType)

    if (!availability.availableToday) {
      return 0.2 // Baja disponibilidad si no está disponible hoy
    }

    // Si está disponible hoy, calcular score basado en proximidad del siguiente slot
    // Por ahora, retornamos un score medio-alto si está disponible
    // TODO: Mejorar con cálculo de slots disponibles en próximas 48 horas
    return 0.7 // Score conservador por ahora
  } catch (error) {
    console.error('Error calculando disponibilidad para ranking:', error)
    // Fallback: verificar manualmente disponibilidad básica
    try {
      const { data: professional } = await supabase
        .from('professionals')
        .select('availability')
        .eq('id', professionalId)
        .single()

      if (!professional || !professional.availability) {
        return 0.3 // Baja disponibilidad si no hay datos
      }

      const availability = professional.availability
      if (typeof availability !== 'object') {
        return 0.3
      }

      // Verificar si tiene al menos un día con slots configurados
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      const hasAnyAvailability = days.some(day => {
        const dayData = availability[day]
        return dayData && Array.isArray(dayData.slots) && dayData.slots.length > 0
      })

      return hasAnyAvailability ? 0.6 : 0.2
    } catch (fallbackError) {
      console.error('Error en fallback de disponibilidad:', fallbackError)
      return 0.3 // Valor por defecto conservador
    }
  }
}

/**
 * Calcula el score de recencia de reseñas (últimos 90 días)
 */
async function calculateRecentReviewScore(
  supabase: any,
  professionalId: string
): Promise<number> {
  try {
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const { data: recentReviews } = await supabase
      .from('reviews')
      .select('created_at')
      .eq('professional_id', professionalId)
      .gte('created_at', ninetyDaysAgo.toISOString())

    if (!recentReviews || recentReviews.length === 0) {
      return 0.3 // Sin reseñas recientes = score bajo
    }

    // Score basado en cantidad de reseñas recientes
    // 0 reseñas recientes = 0.3
    // 1-2 reseñas = 0.5
    // 3-5 reseñas = 0.7
    // 6-10 reseñas = 0.9
    // 10+ reseñas = 1.0
    const recentCount = recentReviews.length
    if (recentCount >= 10) return 1.0
    if (recentCount >= 6) return 0.9
    if (recentCount >= 3) return 0.7
    if (recentCount >= 1) return 0.5
    return 0.3
  } catch (error) {
    console.error('Error calculando recencia de reseñas:', error)
    return 0.3
  }
}

/**
 * Calcula el tiempo de respuesta promedio en minutos usando la función existente
 */
async function calculateAverageResponseTime(
  supabase: any,
  professionalId: string
): Promise<number | null> {
  try {
    const { calculateResponseTime } = await import('@/lib/utils/calculate-response-time')
    const responseTimeData = await calculateResponseTime(professionalId)

    if (responseTimeData.sampleSize === 0) {
      return null // No hay datos suficientes
    }

    // Convertir horas a minutos para el ranking
    return Math.round(responseTimeData.averageHours * 60)
  } catch (error) {
    console.error('Error calculando tiempo de respuesta:', error)
    return null
  }
}

/**
 * Verifica si el profesional tiene un plan premium activo
 */
 
async function checkPremiumPlan(
  _supabase: any,
  _professionalId: string
): Promise<boolean> {
  // TODO: Verificar tabla de suscripciones cuando se implemente
  // Por ahora, retornamos false (todos son basic)
  // const { data: subscription } = await supabase
  //   .from('subscriptions')
  //   .select('plan_type, status, expires_at')
  //   .eq('professional_id', professionalId)
  //   .eq('status', 'active')
  //   .single()
  //
  // return subscription?.plan_type === 'premium' && 
  //        new Date(subscription.expires_at) > new Date()

  return false // Temporal hasta implementar suscripciones
}

/**
 * Calcula el score de ranking completo para un profesional
 */
export async function calculateProfessionalRankingScore(
  professionalId: string,
  professional: any,
  rating: number,
  reviewCount: number
): Promise<RankingScore> {
  const supabase = await createClient()

  // Calcular factores en paralelo
  const [
    hasPremiumPlan,
    availabilityScore,
    recentReviewScore,
    averageResponseTime,
    profileCompleteness,
  ] = await Promise.all([
    checkPremiumPlan(supabase, professionalId),
    calculateAvailabilityScore(
      supabase,
      professionalId,
      professional.consultation_type || 'both'
    ),
    calculateRecentReviewScore(supabase, professionalId),
    calculateAverageResponseTime(supabase, professionalId),
    calculateProfileCompleteness(supabase, professionalId, professional),
  ])

  const factors: RankingFactors = {
    professionalId,
    hasPremiumPlan,
    availabilityScore,
    rating,
    reviewCount,
    recentReviewScore,
    averageResponseTime,
    profileCompleteness,
  }

  // Calcular puntos por factor (pesos configurables)
  const weights = {
    premiumBoost: 1.5, // Multiplicador si tiene premium
    availability: 20, // Puntos por disponibilidad (0-20)
    rating: 30, // Puntos por rating (0-30, 5 estrellas = 30 puntos)
    reviewCount: 15, // Puntos por cantidad de reseñas (máx 15)
    recency: 10, // Puntos por recencia de reseñas (0-10)
    responseTime: 15, // Puntos por tiempo de respuesta (0-15)
    completeness: 10, // Puntos por completitud de perfil (0-10)
  }

  // Premium boost (multiplicador)
  const premiumBoost = hasPremiumPlan ? weights.premiumBoost : 1.0

  // Disponibilidad (0-20 puntos)
  const availabilityPoints = availabilityScore * weights.availability

  // Rating (0-30 puntos): rating de 0-5 se convierte a 0-30 puntos
  const ratingPoints = (rating / 5) * weights.rating

  // Cantidad de reseñas (0-15 puntos): logarítmico (más reseñas = más confianza, pero con rendimientos decrecientes)
  const reviewCountPoints = Math.min(
    Math.log10(Math.max(reviewCount, 1) + 1) * 5,
    weights.reviewCount
  )

  // Recencia de reseñas (0-10 puntos)
  const recencyPoints = recentReviewScore * weights.recency

  // Tiempo de respuesta (0-15 puntos): menos tiempo = más puntos
  let responseTimePoints = 0
  if (averageResponseTime !== null) {
    // 0-30 min = 15 puntos, 30-60 min = 12 puntos, 1-2h = 8 puntos, 2-4h = 5 puntos, 4h+ = 2 puntos
    if (averageResponseTime <= 30) responseTimePoints = 15
    else if (averageResponseTime <= 60) responseTimePoints = 12
    else if (averageResponseTime <= 120) responseTimePoints = 8
    else if (averageResponseTime <= 240) responseTimePoints = 5
    else responseTimePoints = 2
  } else {
    responseTimePoints = 5 // Puntos neutros si no hay datos
  }

  // Completitud de perfil (0-10 puntos)
  const completenessPoints = profileCompleteness * weights.completeness

  // Score base (sin premium boost)
  const baseScore =
    availabilityPoints +
    ratingPoints +
    reviewCountPoints +
    recencyPoints +
    responseTimePoints +
    completenessPoints

  // Aplicar premium boost
  const finalScore = baseScore * premiumBoost

  return {
    professionalId,
    score: Math.round(finalScore * 100) / 100, // Redondear a 2 decimales
    factors,
    breakdown: {
      premiumBoost,
      availabilityPoints: Math.round(availabilityPoints * 100) / 100,
      ratingPoints: Math.round(ratingPoints * 100) / 100,
      reviewCountPoints: Math.round(reviewCountPoints * 100) / 100,
      recencyPoints: Math.round(recencyPoints * 100) / 100,
      responseTimePoints: Math.round(responseTimePoints * 100) / 100,
      completenessPoints: Math.round(completenessPoints * 100) / 100,
    },
  }
}

/**
 * Calcula scores de ranking para múltiples profesionales de forma eficiente
 */
export async function calculateMultipleRankingScores(
  professionals: Array<{
    id: string
    [key: string]: any
  }>,
  ratings: Record<string, { rating: number; reviewCount: number }>
): Promise<Record<string, RankingScore>> {
  const results: Record<string, RankingScore> = {}

  // Calcular scores en paralelo (con límite de concurrencia para no sobrecargar DB)
  const batchSize = 10
  for (let i = 0; i < professionals.length; i += batchSize) {
    const batch = professionals.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map(async (prof) => {
        const ratingData = ratings[prof.id] || { rating: 4.8, reviewCount: 0 }
        return calculateProfessionalRankingScore(
          prof.id,
          prof,
          ratingData.rating,
          ratingData.reviewCount
        )
      })
    )

    batchResults.forEach((result) => {
      results[result.professionalId] = result
    })
  }

  return results
}
