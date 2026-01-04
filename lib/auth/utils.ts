/**
 * Utilidades de autenticación para NUREA
 * Proporciona funciones para verificar roles y manejar autenticación
 */

import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

export type UserRole = 'patient' | 'professional' | 'admin'

export interface AuthUser {
  user: User
  role: UserRole
  profileComplete: boolean
  emailVerified: boolean
}

/**
 * Obtiene el usuario autenticado con su rol y estado
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return null
  }

  // Obtener el perfil para verificar el rol
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, date_of_birth, email_verified')
    .eq('id', user.id)
    .single()

  const role = (profile?.role as UserRole) || 'patient'
  const emailVerified = user.email_confirmed_at !== null || profile?.email_verified || false
  const profileComplete = !!profile?.date_of_birth && emailVerified

  return {
    user,
    role,
    profileComplete,
    emailVerified,
  }
}

/**
 * Verifica si el usuario tiene el rol requerido
 */
export async function hasRole(requiredRole: UserRole | UserRole[]): Promise<boolean> {
  const authUser = await getAuthUser()
  
  if (!authUser) {
    return false
  }

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  return roles.includes(authUser.role)
}

/**
 * Verifica si el usuario puede acceder a una ruta basada en su rol
 */
export function canAccessRoute(userRole: UserRole, route: string): boolean {
  // Rutas públicas
  const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/verify-email', '/legal']
  if (publicRoutes.some(route => route.startsWith(route))) {
    return true
  }

  // Rutas de paciente
  if (route.startsWith('/dashboard') || route.startsWith('/search') || route.startsWith('/professionals')) {
    return userRole === 'patient' || userRole === 'admin'
  }

  // Rutas de profesional
  if (route.startsWith('/professional')) {
    return userRole === 'professional' || userRole === 'admin'
  }

  // Rutas de admin
  if (route.startsWith('/admin')) {
    return userRole === 'admin'
  }

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

