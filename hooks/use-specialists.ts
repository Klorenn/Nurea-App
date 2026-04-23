"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import type { SpecialistCard, SpecialistFilters, SpecialistSearchResult } from '@/types'

interface UseSpecialistsResult {
  specialists: SpecialistCard[]
  loading: boolean
  error: string | null
  total: number
  totalPages: number
  page: number
  priceRange: { min: number; max: number }
  refetch: () => Promise<void>
  setFilters: (filters: Partial<SpecialistFilters>) => void
  resetFilters: () => void
  nextPage: () => void
  prevPage: () => void
  goToPage: (page: number) => void
}

const DEFAULT_FILTERS: SpecialistFilters = {
  consultationType: 'all',
  availableToday: false,
  verified: false,
  sortBy: 'rating',
  page: 1,
  limit: 12
}

export function useSpecialists(
  initialFilters: Partial<SpecialistFilters> = {},
  lang: string = 'es',
  urlSyncKey?: string
): UseSpecialistsResult {
  const [specialists, setSpecialists] = useState<SpecialistCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 })
  const [filters, setFiltersState] = useState<SpecialistFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  // Sincronizar estado con la URL cuando el usuario navega (atrás/adelante)
  useEffect(() => {
    if (urlSyncKey === undefined) return
    const merged = { ...DEFAULT_FILTERS, ...initialFilters }
    setFiltersState(prev => ({
      ...merged,
      page: merged.page ?? prev.page ?? 1
    }))
  }, [urlSyncKey]) // eslint-disable-line @typescript-eslint/no-explicit-any -- initialFilters from URL, sync only when urlSyncKey changes

  const fetchSpecialists = useCallback(async () => {
    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({ lang })
      
      if (filters.categorySlug) params.set('category', filters.categorySlug)
      if (filters.specialtySlug) params.set('specialty', filters.specialtySlug)
      if (filters.consultationType && filters.consultationType !== 'all') {
        params.set('consultation_type', filters.consultationType)
      }
      if (filters.availableToday) params.set('available_today', 'true')
      if (filters.priceMin !== undefined) params.set('price_min', String(filters.priceMin))
      if (filters.priceMax !== undefined) params.set('price_max', String(filters.priceMax))
      if (filters.verified) params.set('verified', 'true')
      if (filters.language) params.set('language', filters.language)
      if (filters.location) params.set('location', filters.location)
      if (filters.search) params.set('search', filters.search)
      if (filters.sortBy) params.set('sort_by', filters.sortBy)
      if (filters.page) params.set('page', String(filters.page))
      if (filters.limit) params.set('limit', String(filters.limit))

      const response = await fetch(`/api/explore?${params}`, {
        signal: abortControllerRef.current.signal
      })
      
      const data: SpecialistSearchResult & { success: boolean; error?: string } = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al cargar especialistas')
      }

      setSpecialists(data.specialists || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 0)
      setPriceRange(data.priceRange || { min: 0, max: 100000 })
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return // Ignorar errores de cancelación
      }
      console.error('Error fetching specialists:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [filters, lang])

  useEffect(() => {
    fetchSpecialists()

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchSpecialists])

  const setFilters = useCallback((newFilters: Partial<SpecialistFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1 // Reset page cuando cambian filtros
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS)
  }, [])

  const nextPage = useCallback(() => {
    if (filters.page && filters.page < totalPages) {
      setFiltersState(prev => ({ ...prev, page: (prev.page || 1) + 1 }))
    }
  }, [filters.page, totalPages])

  const prevPage = useCallback(() => {
    if (filters.page && filters.page > 1) {
      setFiltersState(prev => ({ ...prev, page: (prev.page || 2) - 1 }))
    }
  }, [filters.page])

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setFiltersState(prev => ({ ...prev, page }))
    }
  }, [totalPages])

  return {
    specialists,
    loading,
    error,
    total,
    totalPages,
    page: filters.page || 1,
    priceRange,
    refetch: fetchSpecialists,
    setFilters,
    resetFilters,
    nextPage,
    prevPage,
    goToPage
  }
}

export function useSpecialist(id: string, lang: string = 'es') {
  const [specialist, setSpecialist] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    const fetchSpecialist = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/professionals/${id}?lang=${lang}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Profesional no encontrado')
        }

        setSpecialist(data.professional || data)
      } catch (err) {
        console.error('Error fetching specialist:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchSpecialist()
  }, [id, lang])

  return { specialist, loading, error }
}
