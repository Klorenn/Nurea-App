/**
 * Sistema de autorización global para NUREA
 * Proporciona funciones para validar roles, ownership y acceso a recursos
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { UserRole } from './utils'

/**
 * Resultado de una verificación de autorización
 */
export interface AuthorizationResult {
  authorized: boolean
  error?: 'unauthorized' | 'forbidden' | 'not_found'
  message?: string
  user?: {
    id: string
    role: UserRole
  }
}

/**
 * Verifica autenticación y obtiene información del usuario
 */
export async function requireAuth(): Promise<AuthorizationResult> {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return {
      authorized: false,
      error: 'unauthorized',
      message: 'Por favor, inicia sesión para acceder a este recurso.'
    }
  }

  // Obtener perfil para verificar rol
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, blocked')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return {
      authorized: false,
      error: 'not_found',
      message: 'Perfil no encontrado.'
    }
  }

  // Verificar si la cuenta está bloqueada
  if (profile.blocked) {
    return {
      authorized: false,
      error: 'forbidden',
      message: 'Tu cuenta ha sido bloqueada. Contacta a soporte para más información.'
    }
  }

  return {
    authorized: true,
    user: {
      id: user.id,
      role: (profile.role as UserRole) || 'patient'
    }
  }
}

/**
 * Verifica que el usuario tenga el rol requerido
 */
export async function requireRole(
  requiredRole: UserRole | UserRole[]
): Promise<AuthorizationResult> {
  const authResult = await requireAuth()
  
  if (!authResult.authorized || !authResult.user) {
    return authResult
  }

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  
  if (!roles.includes(authResult.user.role)) {
    return {
      authorized: false,
      error: 'forbidden',
      message: 'No tienes permisos para acceder a este recurso.'
    }
  }

  return authResult
}

/**
 * Verifica que el usuario sea el propietario de un recurso
 */
export async function requireOwnership(
  resourceUserId: string,
  allowAdmin: boolean = false
): Promise<AuthorizationResult> {
  const authResult = await requireAuth()
  
  if (!authResult.authorized || !authResult.user) {
    return authResult
  }

  // Admin puede acceder si allowAdmin es true
  if (allowAdmin && authResult.user.role === 'admin') {
    return authResult
  }

  // Verificar ownership
  if (authResult.user.id !== resourceUserId) {
    return {
      authorized: false,
      error: 'forbidden',
      message: 'No tienes permisos para acceder a este recurso.'
    }
  }

  return authResult
}

/**
 * Verifica ownership de múltiples recursos
 */
export async function requireMultipleOwnership(
  resourceUserIds: string[],
  allowAdmin: boolean = false
): Promise<AuthorizationResult> {
  const authResult = await requireAuth()
  
  if (!authResult.authorized || !authResult.user) {
    return authResult
  }

  // Admin puede acceder si allowAdmin es true
  if (allowAdmin && authResult.user.role === 'admin') {
    return authResult
  }

  // Verificar que todos los recursos pertenezcan al usuario
  const allOwned = resourceUserIds.every(id => id === authResult.user!.id)
  
  if (!allOwned) {
    return {
      authorized: false,
      error: 'forbidden',
      message: 'No tienes permisos para acceder a este recurso.'
    }
  }

  return authResult
}

/**
 * Valida que un ID pertenezca al usuario autenticado
 */
export async function validateResourceOwnership(
  table: string,
  resourceId: string,
  userIdColumn: string = 'user_id',
  allowAdmin: boolean = false
): Promise<AuthorizationResult> {
  const authResult = await requireAuth()
  
  if (!authResult.authorized || !authResult.user) {
    return authResult
  }

  // Admin puede acceder si allowAdmin es true
  if (allowAdmin && authResult.user.role === 'admin') {
    return authResult
  }

  const supabase = await createClient()
  
  // Verificar que el recurso existe y pertenece al usuario
  const { data: resource, error } = await supabase
    .from(table)
    .select(userIdColumn)
    .eq('id', resourceId)
    .single()

  const typedResource = resource as Record<string, any> | null

  if (error || !typedResource) {
    return {
      authorized: false,
      error: 'not_found',
      message: 'Recurso no encontrado.'
    }
  }

  const resourceUserId = typedResource[userIdColumn] as string
  
  if (resourceUserId !== authResult.user.id) {
    return {
      authorized: false,
      error: 'forbidden',
      message: 'No tienes permisos para acceder a este recurso.'
    }
  }

  return authResult
}

/**
 * Valida que un ID de usuario sea válido y accesible
 */
export async function validateUserId(
  userId: string,
  allowAdmin: boolean = false
): Promise<AuthorizationResult> {
  const authResult = await requireAuth()
  
  if (!authResult.authorized || !authResult.user) {
    return authResult
  }

  // Admin puede acceder a cualquier usuario si allowAdmin es true
  if (allowAdmin && authResult.user.role === 'admin') {
    return authResult
  }

  // Verificar que el ID pertenece al usuario autenticado
  if (userId !== authResult.user.id) {
    return {
      authorized: false,
      error: 'forbidden',
      message: 'No tienes permisos para acceder a este recurso.'
    }
  }

  return authResult
}

/**
 * Crea una respuesta de error apropiada
 */
export function createErrorResponse(
  result: AuthorizationResult,
  statusCode?: number
): NextResponse {
  let status = 500
  let message = 'Error de autorización'

  if (result.error === 'unauthorized') {
    status = 401
    message = result.message || 'No autenticado'
  } else if (result.error === 'forbidden') {
    status = 403
    message = result.message || 'No autorizado'
  } else if (result.error === 'not_found') {
    status = 404
    message = result.message || 'Recurso no encontrado'
  }

  if (statusCode) {
    status = statusCode
  }

  return NextResponse.json(
    {
      error: result.error,
      message: message
    },
    { status }
  )
}

/**
 * Helper para validar acceso a rutas protegidas.
 */
export function validateRouteAccess(
  pathname: string,
  userRole: UserRole
): { allowed: boolean; redirectTo?: string } {
  // 1. Rutas de dashboard del paciente
  const isPatientDashboard = 
    pathname === '/dashboard' || 
    pathname.startsWith('/dashboard/patient') || 
    (pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/professional') && !pathname.startsWith('/dashboard/admin'))

  if (isPatientDashboard) {
    if (userRole === 'professional') {
      return { allowed: false, redirectTo: '/dashboard/professional' }
    }
    return { allowed: true }
  }

  // 2. Rutas de profesional
  if (pathname.startsWith('/dashboard/professional') || pathname.startsWith('/professional')) {
    if (userRole === 'patient') {
      return { allowed: false, redirectTo: '/dashboard/patient' }
    }
    return { allowed: true }
  }

  // 3. Rutas de admin
  if (pathname.startsWith('/dashboard/admin') || pathname.startsWith('/admin')) {
    if (userRole !== 'admin') {
      const target = userRole === 'professional' ? '/dashboard/professional' : '/dashboard/patient'
      return { allowed: false, redirectTo: target }
    }
    return { allowed: true }
  }

  return { allowed: true }
}
