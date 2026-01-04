/**
 * Helpers para validar autorización en API routes
 * Proporciona funciones reutilizables para proteger endpoints
 */

import { NextResponse } from 'next/server'
import {
  requireAuth,
  requireRole,
  requireOwnership,
  validateResourceOwnership,
  validateUserId,
  createErrorResponse,
  type AuthorizationResult
} from './authorization'
import type { UserRole } from './utils'

/**
 * Wrapper para proteger un endpoint API con autenticación
 */
export async function withAuth<T>(
  handler: (authResult: AuthorizationResult) => Promise<NextResponse<T>>
): Promise<NextResponse<T>> {
  const authResult = await requireAuth()
  
  if (!authResult.authorized) {
    return createErrorResponse(authResult) as NextResponse<T>
  }

  return handler(authResult)
}

/**
 * Wrapper para proteger un endpoint API con rol requerido
 */
export async function withRole<T>(
  requiredRole: UserRole | UserRole[],
  handler: (authResult: AuthorizationResult) => Promise<NextResponse<T>>
): Promise<NextResponse<T>> {
  const authResult = await requireRole(requiredRole)
  
  if (!authResult.authorized) {
    return createErrorResponse(authResult) as NextResponse<T>
  }

  return handler(authResult)
}

/**
 * Wrapper para proteger un endpoint API con ownership
 */
export async function withOwnership<T>(
  resourceUserId: string,
  handler: (authResult: AuthorizationResult) => Promise<NextResponse<T>>,
  allowAdmin: boolean = false
): Promise<NextResponse<T>> {
  const authResult = await requireOwnership(resourceUserId, allowAdmin)
  
  if (!authResult.authorized) {
    return createErrorResponse(authResult) as NextResponse<T>
  }

  return handler(authResult)
}

/**
 * Wrapper para validar ownership de un recurso por ID
 */
export async function withResourceOwnership<T>(
  table: string,
  resourceId: string,
  userIdColumn: string,
  handler: (authResult: AuthorizationResult) => Promise<NextResponse<T>>,
  allowAdmin: boolean = false
): Promise<NextResponse<T>> {
  const authResult = await validateResourceOwnership(
    table,
    resourceId,
    userIdColumn,
    allowAdmin
  )
  
  if (!authResult.authorized) {
    return createErrorResponse(authResult) as NextResponse<T>
  }

  return handler(authResult)
}

/**
 * Wrapper para validar un ID de usuario
 */
export async function withUserIdValidation<T>(
  userId: string,
  handler: (authResult: AuthorizationResult) => Promise<NextResponse<T>>,
  allowAdmin: boolean = false
): Promise<NextResponse<T>> {
  const authResult = await validateUserId(userId, allowAdmin)
  
  if (!authResult.authorized) {
    return createErrorResponse(authResult) as NextResponse<T>
  }

  return handler(authResult)
}

/**
 * Extrae y valida un ID de los parámetros de la URL
 */
export function extractIdFromPath(pathname: string, pattern: RegExp): string | null {
  const match = pathname.match(pattern)
  return match ? match[1] : null
}

/**
 * Valida formato de UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Crea respuesta de error para ID inválido
 */
export function invalidIdResponse(): NextResponse {
  return NextResponse.json(
    {
      error: 'invalid_id',
      message: 'El ID proporcionado no es válido.'
    },
    { status: 400 }
  )
}

