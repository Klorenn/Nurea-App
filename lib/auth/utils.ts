export type UserRole = 'patient' | 'professional' | 'admin'

/**
 * Nota importante:
 *  - Este archivo debe permanecer libre de imports específicos de servidor
 *    (como `next/headers` o `@/lib/supabase/server`) para que pueda usarse
 *    tanto en componentes cliente como servidor sin romper el build.
 *  - Funciones que necesiten `createClient` del servidor viven en
 *    `lib/auth/server.ts`.
 */

/**
 * Verifica si el usuario puede acceder a una ruta basada en su rol
 * 
 * Reglas estrictas:
 * - /dashboard/* → solo patient o admin
 * - /professional/* → solo professional o admin
 * - /admin/* → solo admin
 */
export function canAccessRoute(userRole: UserRole, route: string): boolean {
  // Rutas públicas (no requieren autenticación)
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/auth',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/legal',
    '/test-supabase',
    '/search',
    '/pacientes',
    '/profesionales',
    '/professionals',
  ]
  
  if (publicRoutes.some(publicRoute => route === publicRoute || route.startsWith(publicRoute + '/'))) {
    return true
  }

  // Rutas de paciente - SOLO patient o admin
  if (route.startsWith('/dashboard')) {
    return userRole === 'patient' || userRole === 'admin'
  }

  // Rutas de profesional - SOLO professional o admin
  if (route.startsWith('/professional')) {
    return userRole === 'professional' || userRole === 'admin'
  }

  // Rutas de admin - SOLO admin
  if (route.startsWith('/admin')) {
    return userRole === 'admin'
  }

  // Rutas de API - se validan en cada endpoint
  if (route.startsWith('/api')) {
    return true // Las APIs validan por separado
  }

  // Por defecto, denegar acceso
  return false
}

/**
 * Obtiene el mensaje de error humano basado en el código de error de Supabase
 */
export function getHumanErrorMessage(error: string, language: 'es' | 'en' = 'es'): string {
  const errorMessages: Record<string, { es: string; en: string }> = {
    'Invalid login credentials': {
      es: 'El email o la contraseña no son correctos. Por favor, verifica tus datos e intenta nuevamente.',
      en: 'Email or password is incorrect. Please check your credentials and try again.',
    },
    'Email not confirmed': {
      es: 'Por favor, verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada (y spam) para el enlace de verificación.',
      en: 'Please verify your email before signing in. Check your inbox (and spam) for the verification link.',
    },
    'User already registered': {
      es: 'Este email ya está registrado. ¿Olvidaste tu contraseña? Puedes recuperarla desde el login.',
      en: 'This email is already registered. Forgot your password? You can recover it from the login page.',
    },
    'Password should be at least 6 characters': {
      es: 'Tu contraseña debe tener al menos 6 caracteres para mantener tu cuenta segura.',
      en: 'Your password must be at least 6 characters to keep your account secure.',
    },
    'Invalid email': {
      es: 'Por favor, ingresa un email válido. Lo necesitamos para contactarte sobre tus citas.',
      en: 'Please enter a valid email address. We need it to contact you about your appointments.',
    },
    'Signup is disabled': {
      es: 'El registro está temporalmente deshabilitado. Por favor, intenta más tarde o contacta a soporte.',
      en: 'Registration is temporarily disabled. Please try again later or contact support.',
    },
    'Too many requests': {
      es: 'Has intentado demasiadas veces. Por tu seguridad, espera unos minutos antes de intentar nuevamente.',
      en: 'Too many attempts. For your security, please wait a few minutes before trying again.',
    },
  }

  const message = errorMessages[error]?.[language] || errorMessages[error]?.['es'] || error

  return message
}

