import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './use-auth'

export interface Payment {
  id: string
  appointment: string
  appointmentId?: string
  date: string
  amount: number
  status: 'pending' | 'paid' | 'refunded' | 'failed'
  method: string
  paidAt?: string | null
  createdAt: string
  professional?: {
    id: string
    name: string
    avatar?: string
  } | null
}

export interface UsePaymentsOptions {
  status?: 'pending' | 'paid' | 'refunded' | 'failed' | 'all'
}

export function usePayments(options: UsePaymentsOptions = {}) {
  const { user } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState({
    totalPaid: 0,
    totalPending: 0,
    totalRefunded: 0,
    count: 0,
  })

  const loadPayments = useCallback(async () => {
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

      const response = await fetch(`/api/payments/list?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar pagos')
      }

      const paymentsData = data.payments || []
      setPayments(paymentsData)

      // Calculate summary
      const paid = paymentsData.filter((p: Payment) => p.status === 'paid')
      const pending = paymentsData.filter((p: Payment) => p.status === 'pending')
      const refunded = paymentsData.filter((p: Payment) => p.status === 'refunded')

      setSummary({
        totalPaid: paid.reduce((sum: number, p: Payment) => sum + p.amount, 0),
        totalPending: pending.reduce((sum: number, p: Payment) => sum + p.amount, 0),
        totalRefunded: refunded.reduce((sum: number, p: Payment) => sum + p.amount, 0),
        count: paymentsData.length,
      })
    } catch (err) {
      console.error('Error loading payments:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar pagos')
    } finally {
      setLoading(false)
    }
  }, [user, options.status])

  useEffect(() => {
    loadPayments()
  }, [loadPayments])

  const refetch = useCallback(() => {
    loadPayments()
  }, [loadPayments])

  return {
    payments,
    loading,
    error,
    summary,
    refetch,
  }
}
