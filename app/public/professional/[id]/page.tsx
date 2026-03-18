import { Metadata, ResolvingMetadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ProfessionalProfilePremiumClient from './ProfessionalProfilePremiumClient'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

async function getProfessionalData(id: string) {
  const supabase = await createClient()
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  
  let professional = null

  if (isUUID) {
    const { data } = await supabase
      .from('professionals')
      .select(`
        *,
        profile:profiles!professionals_id_fkey(*),
        specialty_data:specialties(*)
      `)
      .eq('id', id)
      .maybeSingle()
    professional = data
  }

  if (!professional) {
    const { data: bySlug } = await supabase
      .from('professionals')
      .select(`
        *,
        profile:profiles!professionals_id_fkey(*),
        specialty_data:specialties(*)
      `)
      .eq('slug', id)
      .maybeSingle()
    professional = bySlug
  }

  if (!professional) return null

  // Fetch verified reviews for social proof summary
  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('*, patient:profiles(*)')
    .eq('doctor_id', professional.id)
    .order('created_at', { ascending: false })

  const reviewsCount = reviewsData?.length || 0
  const averageRating = reviewsData && reviewsData.length > 0
    ? reviewsData.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviewsData.length
    : 4.9

  // Format professional for the premium client
  const formattedProfessional = {
    ...professional,
    name: `${professional.profile?.first_name || ''} ${professional.profile?.last_name || ''}`.trim(),
    imageUrl: professional.profile?.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
    consultationTypes: professional.consultation_type === 'both' ? ['online', 'in-person'] : [professional.consultation_type],
    consultationPrice: professional.consultation_price,
    rating: averageRating,
    reviewsCount: reviewsCount,
  }

  return { professional: formattedProfessional, reviews: reviewsData || [] }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params
  const data = await getProfessionalData(id)
  
  if (!data) return { title: 'Profesional | NUREA' }

  const { professional } = data
  const name = professional.name
  const specialty =
    professional.specialty_data?.name_es ||
    professional.specialty_data?.name_en ||
    professional.specialty ||
    'Profesional de salud'

  return {
    title: `${name} - ${specialty} | NUREA Premium`,
    description: `Perfil profesional de ${name} en NUREA. Agenda tu cita 100% online de forma segura vía Mercado Pago.`,
    openGraph: {
      title: `${name} | ${specialty}`,
      images: [professional.imageUrl],
    }
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params
  const data = await getProfessionalData(id)

  if (!data) {
    notFound()
  }

  return (
    <ProfessionalProfilePremiumClient 
      professionalId={data.professional.id} 
      initialProfessional={data.professional}
      initialReviews={data.reviews}
    />
  )
}
