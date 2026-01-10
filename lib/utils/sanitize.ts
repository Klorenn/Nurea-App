/**
 * Utilidades de sanitización y validación de inputs
 * 
 * Previene XSS, inyección SQL y otros ataques
 */

/**
 * Sanitiza texto simple (remueve HTML, scripts, etc.)
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  // Remover HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '')

  // Remover caracteres de control (excepto espacios y saltos de línea)
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '')

  // Limitar longitud (prevenir DoS por strings enormes)
  const MAX_LENGTH = 10000
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH)
  }

  // Trim espacios al inicio y fin
  sanitized = sanitized.trim()

  return sanitized
}

/**
 * Sanitiza contenido de chat/mensajes
 * Permite saltos de línea pero remueve HTML peligroso
 */
export function sanitizeMessage(content: string): string {
  if (!content || typeof content !== 'string') {
    return ''
  }

  // Remover HTML tags peligrosos (script, iframe, object, embed, etc.)
  let sanitized = content.replace(/<(script|iframe|object|embed|form|input|button)[^>]*>.*?<\/\1>/gi, '')
  
  // Remover atributos peligrosos de tags permitidos
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // onclick, onerror, etc.
  sanitized = sanitized.replace(/javascript:/gi, '') // javascript: URLs
  sanitized = sanitized.replace(/data:/gi, '') // data: URLs (pueden contener scripts)

  // Limitar longitud
  const MAX_LENGTH = 5000
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH)
  }

  // Preservar saltos de línea
  sanitized = sanitized.replace(/\n/g, '\n')

  return sanitized.trim()
}

/**
 * Sanitiza nombre (solo letras, espacios, guiones, apóstrofes)
 */
export function sanitizeName(name: string): string {
  if (!name || typeof name !== 'string') {
    return ''
  }

  // Solo letras, espacios, guiones, apóstrofes, y caracteres acentuados
  let sanitized = name.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-']/g, '')
  
  // Limitar longitud
  const MAX_LENGTH = 100
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH)
  }

  // Normalizar espacios múltiples a uno solo
  sanitized = sanitized.replace(/\s+/g, ' ')

  return sanitized.trim()
}

/**
 * Sanitiza email (formato básico)
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return ''
  }

  // Remover espacios
  let sanitized = email.trim().toLowerCase()

  // Validar formato básico de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(sanitized)) {
    return ''
  }

  // Limitar longitud
  const MAX_LENGTH = 255
  if (sanitized.length > MAX_LENGTH) {
    return ''
  }

  return sanitized
}

/**
 * Sanitiza URL (solo http/https)
 */
export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null
  }

  let sanitized = url.trim()

  // Solo permitir http/https
  if (!/^https?:\/\//i.test(sanitized)) {
    return null
  }

  // Validar formato de URL
  try {
    const parsedUrl = new URL(sanitized)
    
    // Solo permitir http/https
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return null
    }

    // Limitar longitud
    const MAX_LENGTH = 2048
    if (sanitized.length > MAX_LENGTH) {
      return null
    }

    return sanitized
  } catch {
    return null
  }
}

/**
 * Sanitiza número de teléfono (solo dígitos, espacios, guiones, paréntesis, +)
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return ''
  }

  // Solo dígitos, espacios, guiones, paréntesis, y +
  let sanitized = phone.replace(/[^\d\s\-()+]/g, '')
  
  // Limitar longitud
  const MAX_LENGTH = 20
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH)
  }

  return sanitized.trim()
}

/**
 * Sanitiza ID (UUID o string alfanumérico)
 */
export function sanitizeId(id: string): string | null {
  if (!id || typeof id !== 'string') {
    return null
  }

  // Solo caracteres alfanuméricos, guiones, y guiones bajos
  const sanitized = id.replace(/[^a-zA-Z0-9\-_]/g, '')

  // Validar formato UUID básico o alfanumérico
  if (sanitized.length === 0 || sanitized.length > 100) {
    return null
  }

  return sanitized
}

/**
 * Escapa caracteres especiales para prevenir SQL injection
 * NOTA: Supabase usa parámetros preparados, pero esto es una capa adicional
 */
export function escapeSqlString(str: string): string {
  if (!str || typeof str !== 'string') {
    return ''
  }

  // Escapar comillas simples y dobles
  return str.replace(/'/g, "''").replace(/"/g, '""')
}

/**
 * Valida y sanitiza input de búsqueda
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return ''
  }

  // Remover caracteres especiales peligrosos pero permitir espacios y caracteres acentuados
  let sanitized = query.replace(/[<>'"\\]/g, '')
  
  // Limitar longitud
  const MAX_LENGTH = 200
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH)
  }

  // Normalizar espacios
  sanitized = sanitized.replace(/\s+/g, ' ')

  return sanitized.trim()
}
