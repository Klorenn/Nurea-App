/**
 * Utilidades de validación de headers HTTP
 * 
 * Valida y sanitiza headers de seguridad
 */

import { NextRequest } from 'next/server'

/**
 * Valida Content-Type header
 */
export function validateContentType(request: NextRequest, allowedTypes: string[]): { valid: boolean; error?: string } {
  const contentType = request.headers.get('content-type')
  
  if (!contentType) {
    return { valid: false, error: 'Content-Type header is required' }
  }

  const isValid = allowedTypes.some(type => contentType.includes(type))
  
  if (!isValid) {
    return { 
      valid: false, 
      error: `Invalid Content-Type. Allowed types: ${allowedTypes.join(', ')}` 
    }
  }

  return { valid: true }
}

/**
 * Valida tamaño del body (previene DoS por payloads enormes)
 */
export async function validateBodySize(
  request: NextRequest, 
  maxSizeBytes: number = 5 * 1024 * 1024 // 5MB por defecto
): Promise<{ valid: boolean; error?: string }> {
  const contentLength = request.headers.get('content-length')
  
  if (contentLength) {
    const size = parseInt(contentLength, 10)
    if (isNaN(size) || size > maxSizeBytes) {
      return { 
        valid: false, 
        error: `Request body too large. Maximum size: ${maxSizeBytes / (1024 * 1024)}MB` 
      }
    }
  }

  return { valid: true }
}

/**
 * Valida headers de seguridad básicos
 */
export function validateSecurityHeaders(request: NextRequest): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Verificar que no sea una request sospechosa
  const userAgent = request.headers.get('user-agent')
  if (!userAgent || userAgent.length < 5) {
    errors.push('Invalid or missing User-Agent header')
  }

  // Verificar Referer (opcional, puede ser null en algunas situaciones)
  // Solo validamos si está presente que no sea sospechoso
  const referer = request.headers.get('referer')
  if (referer && referer.length > 2000) {
    errors.push('Referer header suspiciously long')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
