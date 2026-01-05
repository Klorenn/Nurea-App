import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { mockProfessionalForSearch, TEST_PROFESSIONAL_ID, shouldUseMockData } from '@/lib/mock-data'

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
    let query = supabase
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
      .eq('verified', true) // Solo profesionales verificados
      .order('created_at', { ascending: false })

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
      console.error('Error fetching professionals:', professionalsError)
      // Si hay error y estamos en desarrollo, retornar solo el profesional de prueba
      if (shouldUseMockData()) {
        return NextResponse.json({
          success: true,
          professionals: [mockProfessionalForSearch],
          count: 1
        })
      }
      // En producción, retornar error
      return NextResponse.json(
        { 
          error: 'fetch_failed',
          message: 'No pudimos obtener los profesionales. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    // Formatear profesionales reales
    const formattedProfessionals = (professionals || []).map((prof: any) => ({
      id: prof.id,
      name: `Dr. ${prof.profile?.first_name || ''} ${prof.profile?.last_name || ''}`.trim() || 'Profesional',
      specialty: prof.specialty || '',
      specialtyEn: prof.specialty || '', // TODO: agregar traducción si existe
      location: prof.location || '',
      rating: 4.8, // TODO: calcular desde reviews
      patientsServed: 0, // TODO: calcular desde appointments
      price: prof.consultation_price || 0,
      languages: ['ES'], // TODO: obtener desde perfil
      image: prof.profile?.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
      verified: prof.verified || false,
      isOnline: false, // TODO: implementar estado en tiempo real
      availableToday: true, // TODO: calcular desde disponibilidad
      availableUntil: '6:00 PM', // TODO: calcular desde disponibilidad
    }))

    // Agregar profesional de prueba al final solo en desarrollo
    const allProfessionals = shouldUseMockData() 
      ? [...formattedProfessionals, mockProfessionalForSearch]
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
          return mockProfessionalForSearch.verified // El mock siempre está disponible
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

