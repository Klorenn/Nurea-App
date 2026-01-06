/**
 * Helpers para manejar la estructura de disponibilidad
 * Soporta formato antiguo y nuevo (con horarios por tipo)
 */

export interface AvailabilityByType {
  online?: {
    available: boolean
    hours?: string
  }
  "in-person"?: {
    available: boolean
    hours?: string
  }
}

export interface LegacyAvailability {
  available: boolean
  hours?: string
}

export type AvailabilityStructure = {
  [day: string]: LegacyAvailability | AvailabilityByType
}

/**
 * Verifica si la estructura de disponibilidad es del formato antiguo
 */
export function isLegacyFormat(availability: any): boolean {
  if (!availability || typeof availability !== 'object') return true
  
  // Verificar si algún día tiene la estructura antigua
  for (const day in availability) {
    const dayData = availability[day]
    if (dayData && typeof dayData === 'object') {
      // Si tiene 'available' directamente, es formato antiguo
      if ('available' in dayData && !('online' in dayData) && !('in-person' in dayData)) {
        return true
      }
    }
  }
  return false
}

/**
 * Migra disponibilidad del formato antiguo al nuevo
 * Si el profesional ofrece "both", aplica los mismos horarios a ambos tipos
 */
export function migrateAvailability(
  legacyAvailability: { [day: string]: LegacyAvailability },
  consultationType: 'online' | 'in-person' | 'both'
): { [day: string]: AvailabilityByType } {
  const newAvailability: { [day: string]: AvailabilityByType } = {}
  
  for (const day in legacyAvailability) {
    const dayData = legacyAvailability[day]
    const newDayData: AvailabilityByType = {}
    
    if (consultationType === 'online' || consultationType === 'both') {
      newDayData.online = {
        available: dayData.available || false,
        hours: dayData.hours
      }
    }
    
    if (consultationType === 'in-person' || consultationType === 'both') {
      newDayData['in-person'] = {
        available: dayData.available || false,
        hours: dayData.hours
      }
    }
    
    newAvailability[day] = newDayData
  }
  
  return newAvailability
}

/**
 * Normaliza la disponibilidad al nuevo formato
 * Si ya está en el nuevo formato, la devuelve tal cual
 */
export function normalizeAvailability(
  availability: any,
  consultationType: 'online' | 'in-person' | 'both'
): { [day: string]: AvailabilityByType } {
  if (!availability) {
    return {}
  }
  
  if (isLegacyFormat(availability)) {
    return migrateAvailability(availability as { [day: string]: LegacyAvailability }, consultationType)
  }
  
  // Ya está en el nuevo formato, pero asegurémonos de que tenga la estructura correcta
  const normalized: { [day: string]: AvailabilityByType } = {}
  
  for (const day in availability) {
    const dayData = availability[day]
    if (dayData && typeof dayData === 'object') {
      normalized[day] = {
        online: dayData.online || { available: false },
        'in-person': dayData['in-person'] || { available: false }
      }
    }
  }
  
  return normalized
}

/**
 * Obtiene la disponibilidad para un tipo específico de consulta
 */
export function getAvailabilityForType(
  availability: { [day: string]: AvailabilityByType },
  type: 'online' | 'in-person',
  day: string
): { available: boolean; hours?: string } | null {
  const dayData = availability[day]
  if (!dayData) return null
  
  return dayData[type] || { available: false }
}

/**
 * Verifica si hay disponibilidad configurada para al menos un día
 */
export function hasAnyAvailability(availability: any, consultationType: 'online' | 'in-person' | 'both'): boolean {
  if (!availability) return false
  
  const normalized = normalizeAvailability(availability, consultationType)
  
  for (const day in normalized) {
    const dayData = normalized[day]
    
    if (consultationType === 'online' || consultationType === 'both') {
      if (dayData.online?.available && dayData.online?.hours) {
        return true
      }
    }
    
    if (consultationType === 'in-person' || consultationType === 'both') {
      if (dayData['in-person']?.available && dayData['in-person']?.hours) {
        return true
      }
    }
  }
  
  return false
}

