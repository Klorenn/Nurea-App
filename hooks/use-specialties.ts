"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import type { 
  Category, 
  Specialty, 
  SpecialtyWithCategory,
  ProfessionalSpecialty 
} from "@/types/database"

// Query keys for cache management
export const specialtyKeys = {
  all: ['specialties'] as const,
  lists: () => [...specialtyKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...specialtyKeys.lists(), filters] as const,
  detail: (id: string) => [...specialtyKeys.all, 'detail', id] as const,
  byCategory: (categorySlug: string) => [...specialtyKeys.all, 'category', categorySlug] as const,
  categories: ['categories'] as const,
}

// Fetch all categories with their specialties
async function fetchCategoriesWithSpecialties(): Promise<(Category & { specialties: Specialty[] })[]> {
  const supabase = createClient()
  
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (catError) throw new Error(catError.message)

  const { data: specialties, error: specError } = await supabase
    .from('specialties')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (specError) throw new Error(specError.message)

  return (categories || []).map(category => ({
    ...category,
    specialties: (specialties || []).filter(s => s.category_id === category.id)
  }))
}

// Fetch all specialties with category info
async function fetchSpecialties(categorySlug?: string): Promise<SpecialtyWithCategory[]> {
  const supabase = createClient()
  
  let query = supabase
    .from('specialties')
    .select(`
      *,
      categories (*)
    `)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (categorySlug) {
    query = query.eq('categories.slug', categorySlug)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return data as SpecialtyWithCategory[]
}

// Fetch categories only
async function fetchCategories(): Promise<Category[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

// Fetch professional's specialties
async function fetchProfessionalSpecialties(professionalId: string): Promise<ProfessionalSpecialty[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('professional_specialties')
    .select(`
      *,
      specialties (
        *,
        categories (*)
      )
    `)
    .eq('professional_id', professionalId)
    .order('is_primary', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

// Hook: Get all categories with specialties (grouped)
export function useCategoriesWithSpecialties() {
  return useQuery({
    queryKey: [...specialtyKeys.categories, 'with-specialties'],
    queryFn: fetchCategoriesWithSpecialties,
    staleTime: 5 * 60 * 1000, // 5 minutes - specialties don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Hook: Get all categories
export function useCategories() {
  return useQuery({
    queryKey: specialtyKeys.categories,
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

// Hook: Get all specialties (optionally filtered by category)
export function useSpecialties(categorySlug?: string) {
  return useQuery({
    queryKey: categorySlug 
      ? specialtyKeys.byCategory(categorySlug) 
      : specialtyKeys.lists(),
    queryFn: () => fetchSpecialties(categorySlug),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

// Hook: Get professional's specialties
export function useProfessionalSpecialties(professionalId: string | undefined) {
  return useQuery({
    queryKey: ['professional-specialties', professionalId],
    queryFn: () => fetchProfessionalSpecialties(professionalId!),
    enabled: !!professionalId,
    staleTime: 60 * 1000,
  })
}

// Mutation: Add specialty to professional
export function useAddProfessionalSpecialty() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ 
      professionalId, 
      specialtyId, 
      isPrimary = false 
    }: { 
      professionalId: string
      specialtyId: string
      isPrimary?: boolean 
    }) => {
      const { data, error } = await supabase
        .from('professional_specialties')
        .insert({
          professional_id: professionalId,
          specialty_id: specialtyId,
          is_primary: isPrimary,
        })
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['professional-specialties', variables.professionalId] 
      })
    },
  })
}

// Mutation: Remove specialty from professional
export function useRemoveProfessionalSpecialty() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ 
      professionalId, 
      specialtyId 
    }: { 
      professionalId: string
      specialtyId: string 
    }) => {
      const { error } = await supabase
        .from('professional_specialties')
        .delete()
        .eq('professional_id', professionalId)
        .eq('specialty_id', specialtyId)

      if (error) throw new Error(error.message)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['professional-specialties', variables.professionalId] 
      })
    },
  })
}

// Mutation: Set primary specialty
export function useSetPrimarySpecialty() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ 
      professionalId, 
      specialtyId 
    }: { 
      professionalId: string
      specialtyId: string 
    }) => {
      const { error } = await supabase
        .from('professional_specialties')
        .update({ is_primary: true })
        .eq('professional_id', professionalId)
        .eq('specialty_id', specialtyId)

      if (error) throw new Error(error.message)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['professional-specialties', variables.professionalId] 
      })
    },
  })
}

// Helper: Search specialties locally (for combobox)
export function searchSpecialties(
  specialties: Specialty[],
  query: string
): Specialty[] {
  if (!query.trim()) return specialties

  const normalizedQuery = query.toLowerCase().trim()
  
  return specialties.filter(specialty => 
    specialty.name_es.toLowerCase().includes(normalizedQuery) ||
    specialty.name_en.toLowerCase().includes(normalizedQuery) ||
    specialty.slug.includes(normalizedQuery)
  )
}
