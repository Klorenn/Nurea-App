/**
 * Nurea subscription pricing (CLP)
 * Update these values to match your MercadoPago plan prices.
 */
export const SUBSCRIPTION_PRICES = {
  monthly: 19900, // CLP por mes
  yearly: 199900, // CLP por año (equivale a ~2 meses gratis vs mensual)
} as const

export function applyDiscount(basePrice: number, discountPercentage: number): number {
  if (discountPercentage <= 0) return basePrice
  if (discountPercentage >= 100) return 0
  return Math.round(basePrice * (1 - discountPercentage / 100))
}
