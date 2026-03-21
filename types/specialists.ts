import type { ConsultationType, Category, Specialty, Profile } from './database'

export interface SpecialistCard {
  id: string
  slug?: string
  name: string
  specialty: string
  specialtySlug: string
  category: string
  categorySlug: string
  avatarUrl: string | null
  rating: number
  reviewCount: number
  price: number
  onlinePrice: number
  inPersonPrice: number
  consultationType: ConsultationType
  location: string | null
  verified: boolean
  yearsExperience: number
  languages: string[]
  bio: string | null
  university: string | null
  isAvailableToday: boolean
  nextAvailableSlot?: string
  latitude?: number
  longitude?: number
}

export interface SpecialistFilters {
  categorySlug?: string
  specialtySlug?: string
  consultationType?: ConsultationType | 'all'
  availableToday?: boolean
  priceMin?: number
  priceMax?: number
  language?: string
  location?: string
  verified?: boolean
  sortBy?: 'rating' | 'price_asc' | 'price_desc' | 'experience' | 'reviews'
  search?: string
  date?: string
  page?: number
  limit?: number
}

export interface SpecialistSearchResult {
  specialists: SpecialistCard[]
  total: number
  page: number
  limit: number
  totalPages: number
  filters: SpecialistFilters
  priceRange: {
    min: number
    max: number
  }
}

export interface CategoryWithSpecialties extends Category {
  specialties: Specialty[]
  professionalCount: number
  /** Computed localized name for display (set at runtime from name_es/name_en) */
  name?: string
}

export interface SpecialtyWithCount extends Specialty {
  professionalCount: number
  category?: Category
  /** Computed localized name for display (set at runtime from name_es/name_en) */
  name?: string
  /** Computed category name for display */
  categoryName?: string
}

export interface ExplorePageState {
  filters: SpecialistFilters
  view: 'grid' | 'list' | 'map'
  isFiltersOpen: boolean
}

export interface MapMarker {
  id: string
  name: string
  specialty: string
  lat: number
  lng: number
  avatarUrl: string | null
  rating: number
  price: number
}

export type SpecialistSortOption = {
  value: SpecialistFilters['sortBy']
  label: string
  labelEs: string
}

export const SORT_OPTIONS: SpecialistSortOption[] = [
  { value: 'rating', label: 'Best Rated', labelEs: 'Mejor Calificados' },
  { value: 'price_asc', label: 'Price: Low to High', labelEs: 'Precio: Menor a Mayor' },
  { value: 'price_desc', label: 'Price: High to Low', labelEs: 'Precio: Mayor a Menor' },
  { value: 'experience', label: 'Most Experienced', labelEs: 'Más Experiencia' },
  { value: 'reviews', label: 'Most Reviews', labelEs: 'Más Reseñas' },
]

export const DEFAULT_FILTERS: SpecialistFilters = {
  consultationType: 'all',
  availableToday: false,
  verified: false,
  sortBy: 'rating',
  page: 1,
  limit: 12,
}
