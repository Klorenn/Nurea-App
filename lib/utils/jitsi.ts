/**
 * Utilidades para videollamadas con Jitsi Meet.
 * Sala dinámica y segura: Nurea-Cita-[appointmentId]-2026
 * Localización: Chile (español). Desarrollado por Pau Andreu Koh Cuende.
 */

const JITSI_BASE = "https://meet.jit.si"
const ROOM_PREFIX = "Nurea-Cita"
const ROOM_YEAR = "2026"

/**
 * Genera el nombre de sala único para una cita (sin caracteres problemáticos).
 * Formato: Nurea-Cita-[ID-UNICO]-2026
 */
export function getJitsiRoomName(appointmentId: string): string {
  const safeId = String(appointmentId).replace(/[^a-zA-Z0-9-]/g, "-")
  return `${ROOM_PREFIX}-${safeId}-${ROOM_YEAR}`
}

/**
 * Genera el enlace único de Jitsi Meet para una cita.
 * Solo debe mostrarse a paciente o profesional de esa cita (validar en UI/API).
 */
export function getJitsiMeetingUrl(appointmentId: string): string {
  const roomName = getJitsiRoomName(appointmentId)
  return `${JITSI_BASE}/${roomName}`
}

/** URL del script de la API externa de Jitsi */
export const JITSI_EXTERNAL_API_SCRIPT = "https://meet.jit.si/external_api.js"
