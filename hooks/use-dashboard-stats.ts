import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './use-auth'
import { createClient } from '@/lib/supabase/client'
import { isPaymentsEnabled } from '@/lib/utils/feature-flags'

export interface DashboardStats {
  todayAppointments: number
  upcomingAppointments: number
  unreadMessages: number
  pendingPayments: number
}

export function useDashboardStats() {
  const { user } = useAuth()
  const supabase = createClient()
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    upcomingAppointments: 0,
    unreadMessages: 0,
    pendingPayments: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const today = new Date().toISOString().split('T')[0]
      const paymentsEnabled = isPaymentsEnabled()

      // Load all stats in parallel for mejor rendimiento.
      // Si pagos están deshabilitados o la tabla no existe en este proyecto,
      // evitamos llamar a la tabla `payments` para no generar 404 en Supabase.
      const paymentsPromise = paymentsEnabled
        ? supabase
            .from('payments')
            .select('id', { count: 'exact', head: true })
            .eq('patient_id', user.id)
            .eq('status', 'pending')
        : Promise.resolve({ count: 0 } as { count: number })

      const [todayResponse, upcomingResponse, messagesResponse, paymentsResponse] = await Promise.all([
        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('patient_id', user.id)
          .eq('appointment_date', today)
          .in('status', ['confirmed', 'pending']),
        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('patient_id', user.id)
          .gte('appointment_date', today)
          .in('status', ['confirmed', 'pending']),
        supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('receiver_id', user.id)
          .eq('read', false),
        paymentsPromise,
      ])

      setStats({
        todayAppointments: todayResponse.count || 0,
        upcomingAppointments: upcomingResponse.count || 0,
        unreadMessages: messagesResponse.count || 0,
        pendingPayments: paymentsResponse.count || 0,
      })
    } catch (err) {
      console.error('Error loading stats:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas')
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const refetch = useCallback(() => {
    loadStats()
  }, [loadStats])

  return { stats, loading, error, refetch }
}
