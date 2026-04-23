import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './use-auth'

export interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  type: 'online' | 'in_person'
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'refunded'
  price: number
  professional?: {
    id: string
    first_name: string
    last_name: string
    avatar_url?: string
  }
  specialty?: string
  meeting_link?: string | null
  meeting_expires_at?: string | null
}

export interface UseAppointmentsOptions {
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'all'
  dateFrom?: string
  dateTo?: string
  limit?: number
}

export function useAppointments(options: UseAppointmentsOptions = {}) {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAppointments = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (options.status && options.status !== 'all') {
        params.append('status', options.status)
      }
      if (options.dateFrom) {
        params.append('dateFrom', options.dateFrom)
      }
      if (options.dateTo) {
        params.append('dateTo', options.dateTo)
      }
      if (options.limit) {
        params.append('limit', options.limit.toString())
      }

      const response = await fetch(`/api/appointments/history?${params.toString()}`)
      const data = await response.json() ?? {}

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar citas')
      }

      // Format appointments
      const formattedAppointments = (data.appointments || []).map((apt: any) => ({
        id: apt.id,
        appointment_date: apt.appointment_date,
        appointment_time: apt.appointment_time,
        type: apt.type,
        status: apt.status,
        payment_status: apt.payment_status,
        price: apt.price || 0,
        professional: apt.professional,
        specialty: apt.specialty || '',
        meeting_link: apt.meeting_link || null,
        meeting_expires_at: apt.meeting_expires_at || null,
      }))

      setAppointments(formattedAppointments)
    } catch (err) {
      console.error('Error loading appointments:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar citas')
    } finally {
      setLoading(false)
    }
  }, [user, options.status, options.dateFrom, options.dateTo, options.limit])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  const refetch = useCallback(() => {
    loadAppointments()
  }, [loadAppointments])

  return {
    appointments,
    loading,
    error,
    refetch,
  }
}
