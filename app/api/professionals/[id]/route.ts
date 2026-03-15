import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { isTestProfessional, NUREA_DOCTOR_ID } from '@/lib/mock-data'

/**
 * GET /api/professionals/[id]
 * Obtiene un profesional por ID (real o de prueba)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
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
          stellarWallet: testProfessional.stellar_wallet ?? null,
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
      // If not found by ID, try searching by slug
      const { data: bySlug, error: slugError } = await supabase
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
        .eq('slug', id)
        .maybeSingle()

      if (!bySlug || slugError) {
        return NextResponse.json(
          { 
            error: 'not_found',
            message: 'Profesional no encontrado.'
          },
          { status: 404 }
        )
      }
      
      // Use the professional found by slug
      // We need to re-assign or use a common variable
      return handleProfessionalResponse(bySlug, supabase, bySlug.id)
    }

    return handleProfessionalResponse(professional, supabase, id)
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

async function handleProfessionalResponse(professional: any, supabase: any, id: string) {
    // Calcular rating y reviewsCount desde reviews
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('rating')
      .eq('professional_id', id)

    const reviewsCount = reviewsData?.length || 0
    const averageRating = reviewsData && reviewsData.length > 0
      ? reviewsData.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviewsData.length
      : 4.8

    // Contar pacientes atendidos (citas completadas con pacientes únicos)
    const { data: completedAppointments } = await supabase
      .from('appointments')
      .select('patient_id')
      .eq('professional_id', id)
      .eq('status', 'completed')

    const uniquePatients = new Set(completedAppointments?.map((apt: any) => apt.patient_id) || [])
    const patientsServed = uniquePatients.size

    // Calcular disponibilidad real
    let availableToday = true
    let availableUntil = '6:00 PM'
    try {
      const { checkProfessionalAvailability } = await import('@/lib/utils/check-availability')
      const availability = await checkProfessionalAvailability(
        id,
        professional.consultation_type as 'online' | 'in-person' | 'both'
      )
      availableToday = availability.availableToday
      availableUntil = availability.availableUntil || '6:00 PM'
    } catch (error) {
      console.error('Error calculando disponibilidad:', error)
    }

    // Cargar documentos públicos del profesional
    let documents: any[] = []
    try {
      const { data: documentsData } = await supabase
        .from('documents')
        .select('id, name, file_url, file_type, category, created_at')
        .eq('professional_id', id)
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      documents = (documentsData || []).map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        type: doc.file_type || 'PDF',
        url: doc.file_url,
        category: doc.category,
        size: 'N/A',
      }))
    } catch (error) {
      console.error('Error cargando documentos:', error)
    }

    // Formatear profesional real
    const formattedProfessional = {
      id: professional.id,
      slug: professional.slug,
      name: `${professional.profile?.first_name || ''} ${professional.profile?.last_name || ''}`.trim() || 'Profesional',
      title: professional.specialty || '',
      specialty: professional.specialty || '',
      specialtyEn: professional.specialty || '', 
      yearsExperience: professional.years_experience || 0,
      location: professional.location || '',
      rating: Math.round(averageRating * 10) / 10, 
      reviewsCount: reviewsCount,
      price: professional.consultation_price || 0,
      consultationPrice: professional.consultation_price || 0,
      languages: (professional.languages && Array.isArray(professional.languages) && professional.languages.length > 0)
        ? professional.languages.map((lang: string) => {
            const langMap: Record<string, string> = {
              'ES': 'Español',
              'EN': 'Inglés',
              'PT': 'Portugués',
              'FR': 'Francés',
              'DE': 'Alemán',
            }
            return langMap[lang] || lang
          })
        : ['Español'],
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
      documents: documents,
      professionalRegistration: {
        number: professional.registration_number || '',
        institution: professional.registration_institution || '',
        verified: professional.verified || false,
      },
      imageUrl: professional.profile?.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
      verified: professional.verified || false,
      isOnline: false, 
      availableToday: availableToday,
      availableUntil: availableUntil,
      patientsServed: patientsServed, 
      stellarWallet: professional.stellar_wallet ?? null,
    }

    return NextResponse.json({
      success: true,
      professional: formattedProfessional
    })
}

