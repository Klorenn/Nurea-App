import { Metadata, ResolvingMetadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SpecialistProfileConversionPage } from '@/components/specialist-profile'
import { notFound } from 'next/navigation'
import { genderizeSpecialtyLabel } from '@/lib/utils/genderize-specialty'

interface Props {
  params: Promise<{ id: string }>
}

async function getProfessionalData(id: string) {
  const supabase = await createClient()
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  
  let professional = null
  let error = null

  if (isUUID) {
    const { data, error: idError } = await supabase
      .from('professionals')
      .select(`
        *,
        profile:profiles!professionals_id_fkey(*),
        specialty_data:specialties(*)
      `)
      .eq('id', id)
      .maybeSingle()
    professional = data
    error = idError
  }

  // If not found by ID or not a UUID, try by slug
  if (!professional) {
    const { data: bySlug, error: slugError } = await supabase
      .from('professionals')
      .select(`
        *,
        profile:profiles!professionals_id_fkey(*),
        specialty_data:specialties(*)
      `)
      .eq('slug', id)
      .maybeSingle()
    
    if (bySlug && !slugError) {
      professional = bySlug
    }
  }

  if (!professional) return null

  // Fetch reviews for counting and initial display
  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('*, patient:profiles(*)')
    .eq('doctor_id', professional.id)
    .order('created_at', { ascending: false })

  const reviewsCount = reviewsData?.length || 0
  const averageRating = reviewsData && reviewsData.length > 0
    ? reviewsData.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviewsData.length
    : 0

  // Fetch verified credentials
  const { data: verifiedCredentials } = await supabase
    .from('professional_credentials')
    .select('*')
    .eq('professional_id', professional.id)
    .eq('status', 'verified')
    .order('year', { ascending: false })

  const resolvedSpecialty =
    professional.specialty_data?.name_es ||
    professional.specialty_data?.name_en ||
    professional.specialty ||
    'Profesional de salud'

  const gender = professional.profile?.gender as "M" | "F" | undefined
  const genderedSpecialty = genderizeSpecialtyLabel(resolvedSpecialty, gender)

  // Parse consultation_types array (nuevo formato) vs legacy fields
  const consultationTypesArray = professional.consultation_types as Array<{
    modality?: string;
    price?: number;
    duration_minutes?: number;
  }> | null

  // Extraer modalidades del array o usar legacy
  let consultationTypes: string[] = []
  let consultationPrice = 0
  let slotDuration = 60

  if (consultationTypesArray && consultationTypesArray.length > 0) {
    // Usar el array nuevo
    const modalities = new Set<string>()
    let lowestPrice = Infinity

    for (const ct of consultationTypesArray) {
      if (ct.modality) {
        if (ct.modality === 'both') {
          modalities.add('online')
          modalities.add('in-person')
        } else {
          modalities.add(ct.modality)
        }
      }
      if (ct.price !== undefined && ct.price < lowestPrice) {
        lowestPrice = ct.price
      }
      if (ct.duration_minutes && slotDuration === 60) {
        slotDuration = ct.duration_minutes
      }
    }

    consultationTypes = Array.from(modalities)
    consultationPrice = lowestPrice === Infinity ? 0 : lowestPrice
  } else {
    // Fallback a campos legacy
    consultationTypes =
      professional.consultation_type === 'both'
        ? ['online', 'in-person']
        : professional.consultation_type
          ? [professional.consultation_type]
          : ['online']
    consultationPrice = professional.consultation_price ?? 0
    slotDuration = professional.slot_duration ?? 60
  }

  // Format professional for the conversion profile page (trust + booking focus)
  const formattedProfessional = {
    ...professional,
    id: professional.id,
    slug: professional.slug,
    name: `${professional.profile?.first_name || ''} ${professional.profile?.last_name || ''}`.trim() || 'Profesional',
    specialty: genderedSpecialty,
    rating: averageRating,
    reviewsCount: reviewsCount,
    imageUrl: professional.profile?.avatar_url || '',
    consultationTypes,
    consultationPrice,
    slotDuration,
    languages: professional.languages || ['Español'],
    verified: professional.verified || false,
    // Usar ciudad/dirección clínica si existen para reflejar correctamente la atención presencial.
    city:
      (professional as any).clinic_city ||
      professional.city ||
      professional.location,
    location:
      (professional as any).clinic_address ||
      professional.location ||
      professional.city ||
      (professional as any).clinic_city,
    bio: professional.bio || professional.bio_extended || '',
    bio_extended: professional.bio_extended || professional.bio || '',
    services: professional.services || [],
    education: professional.education || [],
    awards_and_courses: professional.awards_and_courses || [],
    verified_credentials: verifiedCredentials || [],
    yearsExperience: professional.years_experience ?? undefined,
    patientsCount: professional.patients_count ?? undefined,
    availableToday: true,
    registration_number: professional.registration_number,
    professionalRegistration: {
      number: professional.registration_number,
      institution: professional.registration_institution,
      verified: professional.verified
    },
    availability: professional.availability || null,
  }

  // Format reviews for conversion page
  const formattedReviews = (reviewsData || []).slice(0, 10).map((r: { id: string; patient?: { first_name?: string; last_name?: string; avatar_url?: string }; rating: number; comment?: string; created_at?: string }) => ({
    id: r.id,
    name: `${r.patient?.first_name || 'Paciente'} ${r.patient?.last_name || ''}`.trim(),
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
    created_at: r.created_at,
    src: r.patient?.avatar_url
  }))

  // Determine if the professional has any availability configured
  const availability = (professional as any).availability as Record<string, any> | null | undefined
  let noAvailability = true

  if (availability && typeof availability === "object") {
    for (const value of Object.values(availability)) {
      if (value && typeof value === "object") {
        const v = value as any

        // New format: { online: { available, hours }, 'in-person': { available, hours }, slotDuration }
        const hasOnline =
          v.online && typeof v.online === "object" && v.online.available === true
        const hasInPerson =
          v["in-person"] &&
          typeof v["in-person"] === "object" &&
          v["in-person"].available === true

        // Legacy format: { enabled, available, hours, ... }
        const hasLegacyEnabled = v.enabled === true || v.available === true

        if (hasOnline || hasInPerson || hasLegacyEnabled) {
          noAvailability = false
          break
        }
      }
    }
  }

  return { professional: formattedProfessional, reviews: formattedReviews, noAvailability }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params
  const data = await getProfessionalData(id)
  
  if (!data) return { title: 'Profesional no encontrado | NUREA' }

  const { professional } = data
  const name = professional.name
  const specialty = professional.specialty
  const services = professional.services?.slice(0, 3).join(', ') || specialty
  const rating = professional.rating.toFixed(1)
  const reviewsCount = professional.reviewsCount

  return {
    title: `${name} - ${specialty} | NUREA`,
    description: `Agenda tu cita con ${name} en NUREA. Especialista en ${services}. ${rating} estrellas (${reviewsCount} reseñas). Reserva tu consulta médica 100% online de forma segura.`,
    openGraph: {
      title: `${name} | Especialista en ${specialty}`,
      description: `Reserva una cita con ${name}. Atención profesional y personalizada en NUREA.`,
      images: [professional.imageUrl || '/og-image.jpg'],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/professionals/${professional.slug || professional.id}`,
    }
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params
  const data = await getProfessionalData(id)

  if (!data) {
    notFound()
  }

  // Schema.org JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Physician",
    "name": data.professional.name,
    "image": data.professional.imageUrl,
    "description": data.professional.bio || `Especialista en ${data.professional.specialty}`,
    "medicalSpecialty": data.professional.specialty,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": data.professional.location || "Santiago",
      "addressCountry": "CL"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": data.professional.rating.toFixed(1),
      "reviewCount": data.professional.reviewsCount
    },
    "url": `${process.env.NEXT_PUBLIC_APP_URL}/professionals/${data.professional.slug || data.professional.id}`
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SpecialistProfileConversionPage
        professionalId={data.professional.id}
        initialProfessional={data.professional}
        initialReviews={data.reviews}
        noAvailability={data.noAvailability}
      />
    </>
  )
}
