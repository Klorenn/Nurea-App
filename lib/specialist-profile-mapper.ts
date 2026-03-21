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
  consultation_types?: Array<{
    id?: string
    name?: string
    price?: number
    duration_minutes?: number
    modality?: 'online' | 'in-person' | 'both'
    description?: string
  }>
  bio?: string
  bio_extended?: string
  services?: Array<string | { name: string; description?: string; price?: number; durationMinutes?: number }>
  education?: Array<{ year?: string; graduation_year?: string; institution?: string; degree?: string; title?: string }>
  awards_and_courses?: string[]
  yearsExperience?: number
  patientsCount?: number
  [key: string]: unknown
}

function stripHtml(input?: string | null): string {
  if (!input) return ""
  return input
    // Remove HTML tags
    .replace(/<\/?[^>]+(>|$)/g, "")
    // Decode common HTML entities we might store
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+\n/g, "\n")
    .trim()
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
  // Build services from consultation_types array (nuevo formato del perfil profesional)
  const consultationTypesArray = api.consultation_types as ApiProfessional['consultation_types'] | undefined
  const legacyServices = api.services as ApiProfessional['services']

  let services: SpecialistService[] = []

  // Priorizar consultation_types si existe
  if (consultationTypesArray && consultationTypesArray.length > 0) {
    services = consultationTypesArray.map((ct, i) => {
      const modalityLabel = ct.modality === 'both' 
        ? '' 
        : ct.modality === 'online' 
          ? 'Online' 
          : ct.modality === 'in-person' 
            ? 'Presencial' 
            : ''
      
      const name = ct.name || (modalityLabel ? `Consulta ${modalityLabel}` : 'Consulta')
      
      return {
        id: ct.id || `ct-${i}`,
        name,
        description: ct.description || (modalityLabel ? `${modalityLabel}` : ''),
        price: ct.price ?? api.consultationPrice ?? 0,
        currency: 'CLP',
        durationMinutes: ct.duration_minutes ?? api.slotDuration ?? 60,
        modality: ct.modality,
      }
    })
  } else if (Array.isArray(legacyServices) && legacyServices.length > 0) {
    // Fallback a services legacy
    services = legacyServices.map((s, i) => {
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
        durationMinutes: (s as any).durationMinutes ?? api.slotDuration ?? 60,
      }
    })
  } else {
    // Default si no hay nada configurado
    services = [
      {
        id: 's0',
        name: 'Consulta',
        description: '',
        price: api.consultationPrice ?? 0,
        currency: 'CLP',
        durationMinutes: api.slotDuration ?? 60,
      },
    ]
  }

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

  // Normalize bios: many profiles store HTML (<p>...</p>). We want clean text paragraphs.
  const cleanedBio = stripHtml(api.bio)
  const cleanedBioExtended = stripHtml(api.bio_extended)
  const bioExtended =
    cleanedBioExtended && cleanedBioExtended !== cleanedBio ? cleanedBioExtended : undefined

  return {
    id: api.id,
    name: api.name ?? 'Profesional',
    specialty: api.specialty ?? 'Profesional de salud',
    tagline: undefined,
    imageUrl: api.imageUrl ?? '',
    location: api.city ?? api.location ?? '',
    verified: api.verified ?? false,
    rating: api.rating ?? 0,
    reviewsCount: api.reviewsCount ?? 0,
    experienceYears: api.yearsExperience ?? 0,
    patientsCount: api.patientsCount,
    certification: certifications[0],
    onlineAvailable: (() => {
      // Prefer new consultation_types array when present
      if (consultationTypesArray && consultationTypesArray.length > 0) {
        return consultationTypesArray.some(
          (ct) => ct.modality === 'online' || ct.modality === 'both'
        )
      }
      // Fallback to legacy consultationTypes string array
      return api.consultationTypes?.includes('online') ?? true
    })(),
    bio: cleanedBio,
    bioExtended,
    education,
    certifications,
    approaches: [],
    services,
    conditions: Array.isArray((api as any).conditions_treated) ? (api as any).conditions_treated as string[] : [],
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
