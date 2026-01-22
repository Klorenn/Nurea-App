import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './use-auth'

export interface ProfessionalStats {
  upcomingAppointments: number
  activePatients: number
  monthlyIncome: number
  todayAppointments: number
}

export interface ProfessionalAppointment {
  id: string
  appointment_date: string
  appointment_time: string
  type: 'online' | 'in_person'
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'refunded'
  price: number
  patient?: {
    id: string
    first_name: string
    last_name: string
    email?: string
    avatar_url?: string
  }
  duration_minutes?: number
  address?: string
}

export interface UseProfessionalStatsOptions {
  period?: 'month' | 'week' | 'year' | 'all'
}

export function useProfessionalStats(options: UseProfessionalStatsOptions = {}) {
  const { user } = useAuth()
  const [stats, setStats] = useState<ProfessionalStats>({
    upcomingAppointments: 0,
    activePatients: 0,
    monthlyIncome: 0,
    todayAppointments: 0,
  })
  const [upcomingAppointments, setUpcomingAppointments] = useState<ProfessionalAppointment[]>([])
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
      // Load upcoming appointments
      const appointmentsRes = await fetch('/api/professional/appointments?status=confirmed')
      const appointmentsData = await appointmentsRes.json()
      
      if (appointmentsData.success) {
        const now = new Date()
        const upcoming = (appointmentsData.appointments || []).filter((apt: any) => {
          const aptDate = new Date(`${apt.appointment_date}T${apt.appointment_time}`)
          return aptDate >= now
        }).slice(0, 5)
        
        setUpcomingAppointments(upcoming)
        setStats(prev => ({
          ...prev,
          upcomingAppointments: appointmentsData.count || 0,
          todayAppointments: (appointmentsData.appointments || []).filter((apt: any) => {
            const aptDate = new Date(`${apt.appointment_date}T${apt.appointment_time}`)
            const today = new Date()
            return aptDate.toDateString() === today.toDateString()
          }).length
        }))
      }

      // Load active patients
      const patientsRes = await fetch('/api/professional/patients')
      const patientsData = await patientsRes.json()
      
      if (patientsData.success) {
        setStats(prev => ({
          ...prev,
          activePatients: patientsData.count || 0
        }))
      }

      // Load monthly income
      const period = options.period || 'month'
      const incomeRes = await fetch(`/api/professional/income?period=${period}`)
      const incomeData = await incomeRes.json()
      
      if (incomeData.success) {
        setStats(prev => ({
          ...prev,
          monthlyIncome: incomeData.income?.total || 0
        }))
      }
    } catch (err) {
      console.error('Error loading professional stats:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas')
    } finally {
      setLoading(false)
    }
  }, [user, options.period])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const refetch = useCallback(() => {
    loadStats()
  }, [loadStats])

  return {
    stats,
    upcomingAppointments,
    loading,
    error,
    refetch,
  }
}
