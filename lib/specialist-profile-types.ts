/**
 * Data structure for the high-conversion specialist profile page.
 * Used by both real API data (mapped from Supabase) and mock data.
 */

export interface SpecialistService {
  id: string
  name: string
  description: string
  price: number
  currency?: string
  durationMinutes?: number
}

export interface SpecialistReview {
  id: string
  authorName: string
  authorInitials: string
  rating: number
  comment: string
  createdAt: string
  verified?: boolean
}

export interface EducationItem {
  year: string
  institution: string
  degree: string
}

export interface TrustBadgeItem {
  icon: string
  label: string
}

export interface Specialist {
  id: string
  name: string
  specialty: string
  tagline?: string
  imageUrl: string
  location: string
  verified: boolean
  rating: number
  reviewsCount: number
  experienceYears: number
  patientsCount?: number
  certification?: string
  onlineAvailable: boolean
  bio: string
  bioExtended?: string
  education: EducationItem[]
  certifications: string[]
  approaches: string[]
  services: SpecialistService[]
  conditions: string[]
  reviews: SpecialistReview[]
  faqs: { question: string; answer: string }[]
  consultationTypes: ('online' | 'in-person')[]
  consultationPrice: number
  slotDuration: number
  insuranceOptions?: string[]
  /** Fotos reales de la consulta, tomadas de professionals.clinic_images */
  clinicImages?: string[]
  /** Tipos de pacientes que atiende (ej. Adultos, Niños) */
  patientsGroups?: string[]
  /** Formas de pago aceptadas (ej. Transferencia, Efectivo) */
  paymentMethods?: string[]
}

export type BookingMode = 'online' | 'in-person'
