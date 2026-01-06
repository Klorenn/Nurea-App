import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isTestProfessional, NUREA_DOCTOR_ID } from '@/lib/mock-data'

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
    const supabase = await createClient()

    // Si es el profesional de prueba, buscar en la base de datos
    if (isTestProfessional(id)) {
      const { data: testProfessional, error: testError } = await supabase
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
        .eq('id', NUREA_DOCTOR_ID)
        .maybeSingle()

      if (testProfessional && !testError) {
        // Calcular rating y reviewsCount desde reviews
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('rating')
          .eq('professional_id', NUREA_DOCTOR_ID)

        const reviewsCount = reviewsData?.length || 0
        const averageRating = reviewsData && reviewsData.length > 0
          ? reviewsData.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviewsData.length
          : 4.9

        const formattedProfessional = {
          id: testProfessional.id,
          name: `Dr. ${testProfessional.profile?.first_name || 'Nurea'} ${testProfessional.profile?.last_name || 'Doctor'}`.trim(),
          title: testProfessional.specialty || 'Médico General',
          specialty: testProfessional.specialty || 'Médico General',
          specialtyEn: testProfessional.specialty || 'General Medicine',
          yearsExperience: testProfessional.years_experience || 5,
          location: testProfessional.location || 'Santiago, Chile',
          rating: Math.round(averageRating * 10) / 10,
          reviewsCount: reviewsCount,
          price: testProfessional.consultation_price || 35000,
          consultationPrice: testProfessional.consultation_price || 35000,
          languages: testProfessional.languages || ['Español', 'Inglés'],
          bio: testProfessional.bio || '',
          bioExtended: testProfessional.bio_extended || '',
          services: testProfessional.services || [],
          consultationTypes: testProfessional.consultation_type === 'both' 
            ? ['online', 'in-person']
            : testProfessional.consultation_type === 'online'
            ? ['online']
            : ['in-person'],
          consultationType: testProfessional.consultation_type || 'both',
          availability: testProfessional.availability || {},
          documents: [],
          professionalRegistration: {
            number: testProfessional.registration_number || 'TEST-001',
            institution: testProfessional.registration_institution || 'Colegio Médico de Prueba',
            verified: testProfessional.verified || true,
          },
          imageUrl: testProfessional.profile?.avatar_url || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&auto=format',
          verified: testProfessional.verified || true,
          isOnline: true,
          availableToday: true,
          availableUntil: '7:00 PM',
          patientsServed: 0,
        }

        return NextResponse.json({
          success: true,
          professional: formattedProfessional
        })
      }
    }

    // Buscar profesional real en Supabase
    
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

