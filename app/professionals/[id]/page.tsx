import { Metadata, ResolvingMetadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ProfessionalProfileClient from './ProfessionalProfileClient'
import { notFound } from 'next/navigation'

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
    : 4.8

  // Fetch verified credentials
  const { data: verifiedCredentials } = await supabase
    .from('professional_credentials')
    .select('*')
    .eq('professional_id', professional.id)
    .eq('status', 'verified')
    .order('year', { ascending: false })

  // Format professional for the client
  const formattedProfessional = {
    ...professional,
    id: professional.id,
    slug: professional.slug,
    name: `${professional.profile?.first_name || ''} ${professional.profile?.last_name || ''}`.trim(),
    specialty: professional.specialty,
    rating: averageRating,
    reviewsCount: reviewsCount,
    imageUrl: professional.profile?.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
    consultationTypes: professional.consultation_type === 'both' ? ['online', 'in-person'] : [professional.consultation_type],
    consultationPrice: professional.consultation_price,
    languages: professional.languages || ['Español'],
    verified: professional.verified || false,
    location: professional.location,
    bio: professional.bio,
    bio_extended: professional.bio_extended,
    services: professional.services || [],
    education: professional.education || [],
    awards_and_courses: professional.awards_and_courses || [],
    verified_credentials: verifiedCredentials || [],
    availableToday: true,
    patientsServed: 0,
    professionalRegistration: {
      number: professional.registration_number,
      institution: professional.registration_institution,
      verified: professional.verified
    }
  }

  // Format reviews for client
  const formattedReviews = (reviewsData || []).slice(0, 5).map(r => ({
    id: r.id,
    name: `${r.patient?.first_name || 'Paciente'} ${r.patient?.last_name || ''}`.trim(),
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
    src: r.patient?.avatar_url
  }))

  return { professional: formattedProfessional, reviews: formattedReviews }
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
      <ProfessionalProfileClient 
        professionalId={data.professional.id} 
        initialProfessional={data.professional}
        initialReviews={data.reviews}
      />
    </>
  )
}
