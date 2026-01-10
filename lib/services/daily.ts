/**
 * Daily.co Service
 * 
 * Servicio para interactuar con la API de Daily.co
 * Funcionalidades:
 * - Crear rooms de video
 * - Obtener información de rooms
 * - Eliminar rooms
 * - Generar tokens de acceso
 */

const DAILY_API_URL = process.env.DAILY_API_URL || 'https://api.daily.co/v1'
const DAILY_API_KEY = process.env.DAILY_API_KEY || ''

interface CreateRoomOptions {
  name?: string
  privacy?: 'public' | 'private'
  properties?: {
    max_participants?: number
    nbf?: number // not before (timestamp)
    exp?: number // expiration (timestamp)
    enable_chat?: boolean
    enable_screenshare?: boolean
    enable_recording?: boolean
    owner_only_broadcast?: boolean
  }
}

interface DailyRoom {
  id: string
  name: string
  api_created: boolean
  privacy: 'public' | 'private'
  url: string
  created_at: string
  config: {
    max_participants?: number
    nbf?: number
    exp?: number
    enable_chat?: boolean
    enable_screenshare?: boolean
    enable_recording?: boolean
  }
}

interface DailyError {
  error: string
  info?: string
}

/**
 * Crea un room de video en Daily.co
 */
export async function createMeetingRoom(
  options: CreateRoomOptions = {}
): Promise<{ room: DailyRoom; error: null } | { room: null; error: string }> {
  if (!DAILY_API_KEY) {
    console.error('Daily.co API key no configurada')
    return {
      room: null,
      error: 'Daily.co API key no está configurada. Por favor, configura DAILY_API_KEY en las variables de entorno.',
    }
  }

  try {
    const defaultName = `nurea-room-${Date.now()}`
    const roomData = {
      name: options.name || defaultName,
      privacy: options.privacy || 'private',
      properties: {
        max_participants: options.properties?.max_participants || 2,
        enable_chat: options.properties?.enable_chat ?? true,
        enable_screenshare: options.properties?.enable_screenshare ?? true,
        enable_recording: options.properties?.enable_recording ?? false,
        owner_only_broadcast: options.properties?.owner_only_broadcast ?? false,
        ...(options.properties?.nbf && { nbf: options.properties.nbf }),
        ...(options.properties?.exp && { exp: options.properties.exp }),
      },
    }

    const response = await fetch(`${DAILY_API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify(roomData),
    })

    if (!response.ok) {
      const errorData: DailyError = await response.json().catch(() => ({
        error: 'Unknown error',
      }))
      console.error('Error creando room en Daily.co:', errorData)
      return {
        room: null,
        error: errorData.info || errorData.error || 'Error al crear room en Daily.co',
      }
    }

    const room: DailyRoom = await response.json()

    return {
      room,
      error: null,
    }
  } catch (error) {
    console.error('Error en createMeetingRoom:', error)
    return {
      room: null,
      error:
        error instanceof Error
          ? error.message
          : 'Error desconocido al crear room en Daily.co',
    }
  }
}

/**
 * Obtiene información de un room existente
 */
export async function getMeetingRoom(
  roomId: string
): Promise<{ room: DailyRoom | null; error: string | null }> {
  if (!DAILY_API_KEY) {
    return {
      room: null,
      error: 'Daily.co API key no está configurada',
    }
  }

  try {
    const response = await fetch(`${DAILY_API_URL}/rooms/${roomId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return {
          room: null,
          error: 'Room no encontrado',
        }
      }

      const errorData: DailyError = await response.json().catch(() => ({
        error: 'Unknown error',
      }))
      return {
        room: null,
        error: errorData.info || errorData.error || 'Error al obtener room',
      }
    }

    const room: DailyRoom = await response.json()

    return {
      room,
      error: null,
    }
  } catch (error) {
    console.error('Error en getMeetingRoom:', error)
    return {
      room: null,
      error:
        error instanceof Error
          ? error.message
          : 'Error desconocido al obtener room',
    }
  }
}

/**
 * Elimina un room de Daily.co
 */
export async function deleteMeetingRoom(
  roomId: string
): Promise<{ success: boolean; error: string | null }> {
  if (!DAILY_API_KEY) {
    return {
      success: false,
      error: 'Daily.co API key no está configurada',
    }
  }

  try {
    const response = await fetch(`${DAILY_API_URL}/rooms/${roomId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        // Room ya no existe, consideramos éxito
        return {
          success: true,
          error: null,
        }
      }

      const errorData: DailyError = await response.json().catch(() => ({
        error: 'Unknown error',
      }))
      return {
        success: false,
        error: errorData.info || errorData.error || 'Error al eliminar room',
      }
    }

    return {
      success: true,
      error: null,
    }
  } catch (error) {
    console.error('Error en deleteMeetingRoom:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error desconocido al eliminar room',
    }
  }
}

/**
 * Genera un token de acceso para un usuario específico en un room
 * Útil para restringir acceso o personalizar permisos
 */
export async function createMeetingToken(
  roomName: string,
  userId: string,
  properties?: {
    exp?: number // expiration timestamp
    is_owner?: boolean
  }
): Promise<{ token: string | null; error: string | null }> {
  if (!DAILY_API_KEY) {
    return {
      token: null,
      error: 'Daily.co API key no está configurada',
    }
  }

  try {
    const tokenData = {
      properties: {
        room_name: roomName,
        user_id: userId,
        ...(properties?.exp && { exp: properties.exp }),
        ...(properties?.is_owner !== undefined && { is_owner: properties.is_owner }),
      },
    }

    const response = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify(tokenData),
    })

    if (!response.ok) {
      const errorData: DailyError = await response.json().catch(() => ({
        error: 'Unknown error',
      }))
      return {
        token: null,
        error: errorData.info || errorData.error || 'Error al crear token',
      }
    }

    const data = await response.json()

    return {
      token: data.token,
      error: null,
    }
  } catch (error) {
    console.error('Error en createMeetingToken:', error)
    return {
      token: null,
      error:
        error instanceof Error
          ? error.message
          : 'Error desconocido al crear token',
    }
  }
}

/**
 * Calcula la fecha de expiración para un room basado en la fecha de la cita
 * Los rooms expiran 24 horas después del horario de la cita
 */
export function calculateMeetingExpiration(
  appointmentDate: string,
  appointmentTime: string,
  durationMinutes: number = 60
): Date {
  const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`)
  const endTime = new Date(appointmentDateTime.getTime() + durationMinutes * 60 * 1000)
  // Expira 24 horas después del final de la cita
  const expirationDate = new Date(endTime.getTime() + 24 * 60 * 60 * 1000)
  return expirationDate
}
