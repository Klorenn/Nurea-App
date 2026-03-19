"use client"

import { useState, useEffect, useCallback } from 'react'
import type { CategoryWithSpecialties } from '@/types'

interface UseCategoriesResult {
  categories: CategoryWithSpecialties[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

interface UseCategoriesOptions {
  includeSpecialties?: boolean
  lang?: string
}

export function useCategories(options: UseCategoriesOptions = {}): UseCategoriesResult {
  const { includeSpecialties = true, lang = 'es' } = options
  
  const [categories, setCategories] = useState<CategoryWithSpecialties[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        lang,
        include_specialties: String(includeSpecialties)
      })

      const response = await fetch(`/api/categories?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Error al cargar categorías')
      }

      // API puede devolver { success, categories } o directamente el array (legacy)
      const list = Array.isArray(data) ? data : (data.categories ?? [])
      if (!Array.isArray(data) && data.success === false) {
        throw new Error(data.message || 'Error al cargar categorías')
      }
      setCategories(list)
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [lang, includeSpecialties])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  }
}
