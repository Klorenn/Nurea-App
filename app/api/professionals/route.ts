import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const TEST_PROFESSIONAL_ID = 'nurea-doctor-test'

/**
 * GET /api/professionals
 * Obtiene profesionales públicos (reales + profesional de prueba)
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const specialty = searchParams.get('specialty')
    const location = searchParams.get('location')
    const verified = searchParams.get('verified')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const consultationType = searchParams.get('consultationType')

    // Construir query para profesionales reales
    // NO ordenar aquí - ordenaremos después usando el sistema de ranking
    let query = supabase
      .from('professionals')
      .select(`
        id,
        specialty,
        specialties,
        consultation_type,
        consultation_types,
        consultation_price,
        online_price,
        in_person_price,
        verified,
        location,
        city,
        country,
        years_experience,
        experience_years,
        availability,
        languages,
        bio,
        license_number,
        registration_number,
        registration_institution,
        profile:profiles!professionals_id_fkey(
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('verified', true) // Solo profesionales verificados

    // Aplicar filtros
    if (specialty) {
      query = query.ilike('specialty', `%${specialty}%`)
    }

    if (location) {
      query = query.ilike('location', `%${location}%`)
    }

    if (verified === 'true') {
      query = query.eq('verified', true)
    }

    if (minPrice) {
      query = query.gte('consultation_price', parseInt(minPrice))
    }

    if (maxPrice) {
      query = query.lte('consultation_price', parseInt(maxPrice))
    }

    if (consultationType && consultationType !== 'both') {
      query = query.or(`consultation_type.eq.${consultationType},consultation_type.eq.both`)
    }

    const { data: professionals, error: professionalsError } = await query

    if (professionalsError) {
      console.error('Error obteniendo profesionales:', professionalsError)
      return NextResponse.json(
        { 
          error: 'server_error',
          message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
        },
        { status: 500 }
      )
    }

    // Obtener IDs de profesionales reales (excluyendo el de prueba)
    const realProfessionalIds = (professionals || [])
      .filter((prof: any) => prof.id !== TEST_PROFESSIONAL_ID)
      .map((prof: any) => prof.id)

    // Calcular ratings y pacientes atendidos de forma eficiente
    const { calculateMultipleRatings } = await import('@/lib/utils/calculate-rating')
    const ratings = realProfessionalIds.length > 0
      ? await calculateMultipleRatings(realProfessionalIds)
      : {}

    // Contar pacientes atendidos por profesional
    const patientsServedMap: Record<string, number> = {}
    if (realProfessionalIds.length > 0) {
      const { data: completedAppointments } = await supabase
        .from('appointments')
        .select('professional_id, patient_id')
        .eq('status', 'completed')
        .in('professional_id', realProfessionalIds)

      if (completedAppointments) {
        // Contar pacientes únicos por profesional
        const patientsByProf: Record<string, Set<string>> = {}
        completedAppointments.forEach((apt: any) => {
          if (!patientsByProf[apt.professional_id]) {
            patientsByProf[apt.professional_id] = new Set()
          }
          patientsByProf[apt.professional_id].add(apt.patient_id)
        })

        Object.keys(patientsByProf).forEach((profId) => {
          patientsServedMap[profId] = patientsByProf[profId].size
        })
      }
    }

    // Filtrar profesionales reales (excluyendo el de prueba para agregarlo después)
    const realProfessionals = (professionals || [])
      .filter((prof: any) => prof.id !== TEST_PROFESSIONAL_ID)

    // Calcular scores de ranking para todos los profesionales
    const { calculateMultipleRankingScores } = await import('@/lib/utils/calculate-ranking')
    const rankingScores = realProfessionals.length > 0
      ? await calculateMultipleRankingScores(realProfessionals, ratings)
      : {}

    // Formatear profesionales reales con sus scores de ranking
    const formattedProfessionals = realProfessionals
      .map((prof: any) => {
        const ratingData = ratings[prof.id] || { rating: 4.8, reviewCount: 0 }
        const rankingData = rankingScores[prof.id]
        
        return {
          id: prof.id,
          name: `Dr. ${prof.profile?.first_name || ''} ${prof.profile?.last_name || ''}`.trim() || 'Profesional',
          specialty: prof.specialty || '',
          specialtyEn: prof.specialty || '', // Traducción se puede agregar después
          location: prof.location || '',
          rating: ratingData.rating,
          reviewCount: ratingData.reviewCount,
          patientsServed: patientsServedMap[prof.id] || 0,
          price: prof.consultation_price || prof.online_price || prof.in_person_price || 0,
          languages: (prof.languages && Array.isArray(prof.languages) && prof.languages.length > 0)
            ? prof.languages.map((lang: string) => {
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
          image: prof.profile?.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
          verified: prof.verified || false,
          isOnline: false, // Presencia en tiempo real se actualiza en el cliente
          availableToday: true, // Se calculará dinámicamente si es necesario (puede ser costoso para listas grandes)
          availableUntil: '6:00 PM', // Se calculará dinámicamente si es necesario
          // Incluir score de ranking (para debug/admin, opcional en producción)
          rankingScore: rankingData?.score || 0,
        }
      })
      // Ordenar por score de ranking (mayor = mejor posición)
      .sort((a: any, b: any) => (b.rankingScore || 0) - (a.rankingScore || 0))

    // Obtener profesional de prueba de la base de datos
    let testProfessional = null
    const { data: testProfData } = await supabase
      .from('professionals')
      .select(`
        id,
        specialty,
        consultation_type,
        consultation_price,
        verified,
        location,
        years_experience,
        profile:profiles!professionals_id_fkey(
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('id', TEST_PROFESSIONAL_ID)
      .maybeSingle()

    if (testProfData) {
      const testProfileRecord = Array.isArray(testProfData.profile)
        ? testProfData.profile[0]
        : testProfData.profile

      testProfessional = {
        id: testProfData.id,
        name: `Dr. ${testProfileRecord?.first_name || 'Nurea'} ${testProfileRecord?.last_name || 'Doctor'}`.trim(),
        specialty: testProfData.specialty || 'Médico General',
        specialtyEn: testProfData.specialty || 'General Medicine',
        location: testProfData.location || 'Temuco, Chile',
        rating: 4.9,
        patientsServed: 0,
        price: testProfData.consultation_price || 35000,
        languages: ['ES', 'EN'],
        image: testProfileRecord?.avatar_url || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&auto=format',
        verified: testProfData.verified || true,
        isOnline: true,
        availableToday: true,
        availableUntil: '7:00 PM',
      }
    }

    // Agregar profesional de prueba al final si existe (siempre al final, no afecta ranking)
    const allProfessionals = testProfessional 
      ? [...formattedProfessionals, { ...testProfessional, rankingScore: 0 }]
      : formattedProfessionals

    // Aplicar filtros al profesional de prueba también si aplica
    let filteredProfessionals = allProfessionals

    if (specialty) {
      const specialtyLower = specialty.toLowerCase()
      filteredProfessionals = allProfessionals.filter(p => 
        p.specialty.toLowerCase().includes(specialtyLower) ||
        p.specialtyEn.toLowerCase().includes(specialtyLower)
      )
    }

    if (location) {
      const locationLower = location.toLowerCase()
      filteredProfessionals = filteredProfessionals.filter(p => 
        p.location.toLowerCase().includes(locationLower)
      )
    }

    if (minPrice) {
      filteredProfessionals = filteredProfessionals.filter(p => p.price >= parseInt(minPrice))
    }

    if (maxPrice) {
      filteredProfessionals = filteredProfessionals.filter(p => p.price <= parseInt(maxPrice))
    }

    if (consultationType && consultationType !== 'both') {
      filteredProfessionals = filteredProfessionals.filter(p => {
        if (p.id === TEST_PROFESSIONAL_ID) {
          return true // El profesional de prueba siempre está disponible
        }
        return true // Para profesionales reales, ya se filtró en la query
      })
    }

    return NextResponse.json({
      success: true,
      professionals: filteredProfessionals,
      count: filteredProfessionals.length
    })
  } catch (error) {
    console.error('Get professionals error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

