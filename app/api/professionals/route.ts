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

    // Formatear profesionales reales (excluyendo el de prueba para agregarlo después)
    const formattedProfessionals = (professionals || [])
      .filter((prof: any) => prof.id !== TEST_PROFESSIONAL_ID) // Excluir el de prueba de la query normal
      .map((prof: any) => ({
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
      testProfessional = {
        id: testProfData.id,
        name: `Dr. ${testProfData.profile?.first_name || 'Nurea'} ${testProfData.profile?.last_name || 'Doctor'}`.trim(),
        specialty: testProfData.specialty || 'Médico General',
        specialtyEn: testProfData.specialty || 'General Medicine',
        location: testProfData.location || 'Santiago, Chile',
        rating: 4.9,
        patientsServed: 0,
        price: testProfData.consultation_price || 35000,
        languages: ['ES', 'EN'],
        image: testProfData.profile?.avatar_url || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&auto=format',
        verified: testProfData.verified || true,
        isOnline: true,
        availableToday: true,
        availableUntil: '7:00 PM',
      }
    }

    // Agregar profesional de prueba al final si existe
    const allProfessionals = testProfessional 
      ? [...formattedProfessionals, testProfessional]
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

