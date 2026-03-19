/**
 * Utility functions for professional dashboard insights and metrics.
 */

export interface PerformanceInsight {
  type: "positive" | "negative" | "neutral"
  title: string
  message: string
  growth?: number
}

export function calculateWeeklyGrowth(currentWeek: number, previousWeek: number): number {
  if (previousWeek === 0) return currentWeek > 0 ? 100 : 0
  return Math.round(((currentWeek - previousWeek) / previousWeek) * 100)
}

export function getPerformanceTip(
  incomeGrowth: number,
  appointmentGrowth: number,
  isSpanish: boolean = true
): PerformanceInsight {
  if (incomeGrowth > 10) {
    return {
      type: "positive",
      title: isSpanish ? "TIPS DE RENDIMIENTO" : "PERFORMANCE TIPS",
      message: isSpanish 
        ? `Tus ingresos han subido un ${incomeGrowth}% esta semana. ¡Excelente trabajo! Considera abrir más bloques horarios para mantener el ritmo.`
        : `Your income has increased by ${incomeGrowth}% this week. Great job! Consider opening more time slots to keep the momentum.`,
      growth: incomeGrowth
    }
  }

  if (appointmentGrowth > 0) {
    return {
      type: "positive",
      title: isSpanish ? "TIPS DE RENDIMIENTO" : "PERFORMANCE TIPS",
      message: isSpanish
        ? `Tienes un ${appointmentGrowth}% más de citas esta semana. Asegúrate de revisar las fichas clínicas con antelación.`
        : `You have ${appointmentGrowth}% more appointments this week. Make sure to review clinical records in advance.`,
      growth: appointmentGrowth
    }
  }

  return {
    type: "neutral",
    title: isSpanish ? "CONSEJO DEL DÍA" : "TIP OF THE DAY",
    message: isSpanish
      ? "Mantén tu perfil actualizado y solicita reseñas a tus pacientes para mejorar tu posicionamiento en la plataforma."
      : "Keep your profile updated and ask for reviews from your patients to improve your ranking on the platform.",
  }
}
