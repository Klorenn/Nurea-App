/**
 * Maps API/Supabase professional + reviews to the Specialist profile shape.
 * Used so the conversion page can work with real data.
 */

import type { Specialist, SpecialistService, SpecialistReview } from './specialist-profile-types'

interface ApiProfessional {
  id: string
  name: string
  specialty?: string
  imageUrl?: string
  city?: string
  location?: string
  verified?: boolean
  rating?: number
  reviewsCount?: number
  consultationPrice?: number
  slotDuration?: number
  consultationTypes?: ('online' | 'in-person')[]
  bio?: string
  bio_extended?: string
  services?: Array<string | { name: string; description?: string; price?: number; durationMinutes?: number }>
  education?: Array<{ year?: string; graduation_year?: string; institution?: string; degree?: string; title?: string }>
  awards_and_courses?: string[]
  yearsExperience?: number
  patientsCount?: number
  [key: string]: unknown
}

interface ApiReview {
  id: string
  name?: string
  rating: number
  comment?: string
  createdAt?: string
  created_at?: string
  verified?: boolean
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function mapApiProfessionalToSpecialist(
  api: ApiProfessional,
  reviews: ApiReview[] = []
): Specialist {
  const services: SpecialistService[] = Array.isArray(api.services)
    ? api.services.map((s, i) => {
        if (typeof s === 'string') {
          return {
            id: `s-${i}`,
            name: s,
            description: '',
            price: api.consultationPrice ?? 0,
            currency: 'CLP',
            durationMinutes: api.slotDuration ?? 60,
          }
        }
        return {
          id: `s-${i}`,
          name: s.name ?? 'Consulta',
          description: s.description ?? '',
          price: s.price ?? api.consultationPrice ?? 0,
          currency: 'CLP',
          durationMinutes: s.durationMinutes ?? api.slotDuration ?? 60,
        }
      })
    : [
        {
          id: 's0',
          name: 'Consulta',
          description: '',
          price: api.consultationPrice ?? 0,
          currency: 'CLP',
          durationMinutes: api.slotDuration ?? 60,
        },
      ]

  const formattedReviews: SpecialistReview[] = reviews.map((r) => ({
    id: r.id,
    authorName: r.name ?? 'Paciente',
    authorInitials: getInitials(r.name ?? 'P'),
    rating: r.rating ?? 5,
    comment: r.comment ?? '',
    createdAt: r.createdAt ?? r.created_at ?? new Date().toISOString(),
    verified: r.verified,
  }))

  const education = (api.education ?? []).map((e) => ({
    year: e.year ?? e.graduation_year ?? '',
    institution: e.institution ?? '',
    degree: e.degree ?? e.title ?? '',
  }))

  const certifications = Array.isArray(api.awards_and_courses) ? api.awards_and_courses : []

  const rawAcceptedInsurances = (api as any).accepted_insurances as string[] | null | undefined
  const insuranceOptions =
    Array.isArray(rawAcceptedInsurances) && rawAcceptedInsurances.length > 0
      ? rawAcceptedInsurances
      : []

  const clinicImages =
    Array.isArray((api as any).clinic_images) && (api as any).clinic_images.length > 0
      ? ((api as any).clinic_images as string[])
      : []

  const patientsGroups =
    Array.isArray((api as any).patients_groups) && (api as any).patients_groups.length > 0
      ? ((api as any).patients_groups as string[])
      : []

  const paymentMethods =
    Array.isArray((api as any).payment_methods) && (api as any).payment_methods.length > 0
      ? ((api as any).payment_methods as string[])
      : []

  return {
    id: api.id,
    name: api.name ?? 'Especialista',
    specialty: api.specialty ?? 'Especialista',
    tagline: undefined,
    imageUrl: api.imageUrl ?? '',
    location: api.city ?? api.location ?? '',
    verified: api.verified ?? false,
    rating: api.rating ?? 0,
    reviewsCount: api.reviewsCount ?? 0,
    experienceYears: api.yearsExperience ?? 0,
    patientsCount: api.patientsCount,
    certification: certifications[0],
    onlineAvailable: api.consultationTypes?.includes('online') ?? true,
    bio: api.bio ?? '',
    bioExtended: api.bio_extended,
    education,
    certifications,
    approaches: [],
    services,
    conditions: [],
    reviews: formattedReviews,
    faqs: [],
    consultationTypes: api.consultationTypes ?? ['online'],
    consultationPrice: api.consultationPrice ?? 0,
    slotDuration: api.slotDuration ?? 60,
    insuranceOptions,
    clinicImages,
    patientsGroups,
    paymentMethods,
  }
}
