import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { mockProfessional, isTestProfessional, shouldUseMockData } from '@/lib/mock-data'

/**
 * GET /api/professionals/[id]
 * Obtiene un profesional por ID (real o de prueba)
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Si es el profesional de prueba y estamos en desarrollo, retornar datos mock
    if (isTestProfessional(id) && shouldUseMockData()) {
      return NextResponse.json({
        success: true,
        professional: mockProfessional
      })
    }

    // Si es el profesional de prueba pero estamos en producción, no existe
    if (isTestProfessional(id) && !shouldUseMockData()) {
      return NextResponse.json(
        { 
          error: 'not_found',
          message: 'Profesional no encontrado.'
        },
        { status: 404 }
      )
    }

    // Buscar profesional real en Supabase
    const supabase = await createClient()
    
    const { data: professional, error: professionalError } = await supabase
      .from('professionals')
      .select(`
        *,
        profile:profiles!professionals_id_fkey(
          id,
          first_name,
          last_name,
          email,
          avatar_url,
          phone,
          date_of_birth
        )
      `)
      .eq('id', id)
      .single()

    if (professionalError || !professional) {
      return NextResponse.json(
        { 
          error: 'not_found',
          message: 'Profesional no encontrado.'
        },
        { status: 404 }
      )
    }

    // Calcular rating y reviewsCount desde reviews
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('rating')
      .eq('professional_id', id)

    const reviewsCount = reviewsData?.length || 0
    const averageRating = reviewsData && reviewsData.length > 0
      ? reviewsData.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviewsData.length
      : 4.8

    // Formatear profesional real
    const formattedProfessional = {
      id: professional.id,
      name: `${professional.profile?.first_name || ''} ${professional.profile?.last_name || ''}`.trim() || 'Profesional',
      title: professional.specialty || '',
      specialty: professional.specialty || '',
      specialtyEn: professional.specialty || '', // TODO: agregar traducción
      yearsExperience: professional.years_experience || 0,
      location: professional.location || '',
      rating: Math.round(averageRating * 10) / 10, // Redondear a 1 decimal
      reviewsCount: reviewsCount,
      price: professional.consultation_price || 0,
      consultationPrice: professional.consultation_price || 0,
      languages: ['Español'], // TODO: obtener desde perfil
      bio: professional.bio || '',
      bioExtended: professional.bio_extended || '',
      services: professional.services || [],
      consultationTypes: professional.consultation_type === 'both' 
        ? ['online', 'in-person']
        : professional.consultation_type === 'online'
        ? ['online']
        : ['in-person'],
      consultationType: professional.consultation_type || 'both',
      availability: professional.availability || {},
      documents: [], // TODO: cargar desde documents table
      professionalRegistration: {
        number: professional.registration_number || '',
        institution: professional.registration_institution || '',
        verified: professional.verified || false,
      },
      imageUrl: professional.profile?.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
      verified: professional.verified || false,
      isOnline: false, // TODO: implementar estado en tiempo real
      availableToday: true, // TODO: calcular desde disponibilidad
      availableUntil: '6:00 PM', // TODO: calcular desde disponibilidad
      patientsServed: 0, // TODO: contar desde appointments
    }

    return NextResponse.json({
      success: true,
      professional: formattedProfessional
    })
  } catch (error) {
    console.error('Get professional error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

