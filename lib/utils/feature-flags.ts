/**
 * Feature Flags
 * 
 * Controla funcionalidades opcionales de la aplicación
 * a través de variables de entorno
 */

/**
 * Feature flag para pagos
 * 
 * Si ENABLE_PAYMENTS=false: Pagos deshabilitados (simulado)
 * Si ENABLE_PAYMENTS=true: Pagos habilitados (requiere implementación de pasarela)
 */
export function isPaymentsEnabled(): boolean {
  return process.env.ENABLE_PAYMENTS === 'true'
}

/**
 * Feature flag para video calls (Daily.co)
 * 
 * Si no hay API key configurada, video calls están deshabilitados
 */
export function isVideoCallsEnabled(): boolean {
  return !!process.env.DAILY_API_KEY
}

/**
 * Feature flag para emails (Resend)
 * 
 * Si no hay API key configurada, emails están deshabilitados
 */
export function isEmailEnabled(): boolean {
  return !!process.env.RESEND_API_KEY
}

/**
 * Get feature flags summary (para debugging)
 */
export function getFeatureFlags() {
  return {
    payments: isPaymentsEnabled(),
    videoCalls: isVideoCallsEnabled(),
    email: isEmailEnabled(),
  }
}
