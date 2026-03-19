import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BookingClient from './BookingClient'

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
        profile:profiles!professionals_id_fkey(*)
      `)
      .eq('id', id)
      .maybeSingle()
    professional = data
  }

  if (!professional) {
    const { data } = await supabase
      .from('professionals')
      .select(`
        *,
        profile:profiles!professionals_id_fkey(*)
      `)
      .eq('slug', id)
      .maybeSingle()
    professional = data
  }

  if (!professional) return null

  return {
    id: professional.id,
    name: `${professional.profile?.first_name || ''} ${professional.profile?.last_name || ''}`.trim(),
    specialty: professional.specialty,
    imageUrl: professional.profile?.avatar_url,
    verified: professional.verified,
    stellar_wallet: professional.stellar_wallet,
    consultationTypes: professional.consultation_type === 'both' ? ['online', 'in-person'] : [professional.consultation_type],
  }
}

export default async function BookingPage({ params }: Props) {
  const { id } = await params
  const professional = await getProfessionalData(id)

  if (!professional) {
    notFound()
  }

  return <BookingClient professional={professional} />
}
