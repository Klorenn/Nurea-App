/**
 * Hook para manejar presencia en tiempo real usando Supabase Presence API
 */
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface PresenceState {
  [userId: string]: {
    online: boolean
    lastSeen?: Date
  }
}

export function usePresence(userIds: string[]) {
  const [presence, setPresence] = useState<PresenceState>({})
  const supabase = createClient()
  const channelRef = useRef<any>(null)

  useEffect(() => {
    if (userIds.length === 0) return

    // Crear canal de presencia
    const channel = supabase.channel('presence', {
      config: {
        presence: {
          key: supabase.auth.getUser().then(({ data }) => data.user?.id || ''),
        },
      },
    })

    // Track presencia del usuario actual
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const presenceState: PresenceState = {}

        // Procesar estado de presencia
        Object.keys(state).forEach((userId) => {
          const userPresence = state[userId] as any[]
          if (userPresence && userPresence.length > 0) {
            presenceState[userId] = {
              online: true,
              lastSeen: new Date(),
            }
          }
        })

        // Marcar usuarios no presentes como offline
        userIds.forEach((userId) => {
          if (!presenceState[userId]) {
            presenceState[userId] = {
              online: false,
            }
          }
        })

        setPresence(presenceState)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        setPresence((prev) => ({
          ...prev,
          [key]: {
            online: true,
            lastSeen: new Date(),
          },
        }))
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        setPresence((prev) => ({
          ...prev,
          [key]: {
            online: false,
            lastSeen: new Date(),
          },
        }))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track presencia del usuario actual
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (user) {
            await channel.track({
              userId: user.id,
              online: true,
              lastSeen: new Date().toISOString(),
            })
          }
        }
      })

    channelRef.current = channel

    // Cleanup
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [userIds, supabase])

  // Función helper para verificar si un usuario está online
  const isOnline = (userId: string): boolean => {
    return presence[userId]?.online || false
  }

  // Función helper para obtener lastSeen
  const getLastSeen = (userId: string): Date | undefined => {
    return presence[userId]?.lastSeen
  }

  // Función helper para obtener el status de presencia
  const getPresenceStatus = (userId: string): 'online' | 'offline' => {
    return presence[userId]?.online ? 'online' : 'offline'
  }

  return {
    presence,
    isOnline,
    getLastSeen,
    getPresenceStatus,
  }
}
