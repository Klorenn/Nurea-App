import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { SpecialistCard, SpecialistSearchResult } from '@/types'

/**
 * GET /api/explore
 * Búsqueda avanzada de profesionales con filtros
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Parámetros de filtro
    const lang = searchParams.get('lang') || 'es'
    const specialtySlug = searchParams.get('specialty') || null
    const categorySlug = searchParams.get('category') || null
    const consultationType = searchParams.get('consultation_type') || null
    const availableToday = searchParams.get('available_today') === 'true'
    const priceMin = searchParams.get('price_min') ? Number(searchParams.get('price_min')) : null
    const priceMax = searchParams.get('price_max') ? Number(searchParams.get('price_max')) : null
    // REGLA DE NEGOCIO CRÍTICA: Solo mostrar profesionales verificados a pacientes
    // Siempre true para garantizar seguridad - los no verificados no aparecen en búsqueda
    const verifiedOnly = true
    const language = searchParams.get('language') || null
    const location = searchParams.get('location') || null
    const search = searchParams.get('search') || null
    const sortBy = searchParams.get('sort_by') || 'rating'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50)

    // Usar función RPC para búsqueda optimizada
    const { data: searchResults, error: searchError } = await supabase
      .rpc('search_professionals', {
        p_lang: lang,
        p_specialty_slug: specialtySlug,
        p_category_slug: categorySlug,
        p_consultation_type: consultationType,
        p_available_today: availableToday,
        p_price_min: priceMin,
        p_price_max: priceMax,
        p_verified_only: verifiedOnly,
        p_language: language,
        p_location: location,
        p_search: search,
        p_sort_by: sortBy,
        p_page: page,
        p_limit: limit
      })

    if (searchError) {
      console.error('Error en búsqueda RPC:', searchError)
      
      // Fallback: búsqueda directa
      return await fallbackSearch(supabase, {
        lang,
        specialtySlug,
        categorySlug,
        consultationType,
        priceMin,
        priceMax,
        verifiedOnly,
        language,
        location,
        search,
        sortBy,
        page,
        limit
      })
    }

    // Obtener total de resultados del primer registro
    const totalCount = searchResults && searchResults.length > 0 
      ? Number(searchResults[0].total_count) 
      : 0

    // Formatear resultados como SpecialistCard
    const specialists: SpecialistCard[] = (searchResults || []).map((prof: any) => ({
      id: prof.id,
      name: `${prof.first_name || ''} ${prof.last_name || ''}`.trim() || 'Profesional',
      specialty: prof.specialty_name || prof.specialty || '',
      specialtySlug: prof.specialty_slug || '',
      category: prof.category_name || '',
      categorySlug: prof.category_slug || '',
      avatarUrl: prof.avatar_url,
      rating: Number(prof.rating) || 0,
      reviewCount: prof.review_count || 0,
      price: Number(prof.consultation_price) || 0,
      onlinePrice: Number(prof.online_price) || 0,
      inPersonPrice: Number(prof.in_person_price) || 0,
      consultationType: prof.consultation_type || 'both',
      location: prof.location,
      verified: prof.verified || false,
      yearsExperience: prof.years_experience || 0,
      languages: prof.languages || ['ES'],
      bio: prof.bio,
      university: prof.university,
      isAvailableToday: checkAvailability(prof.availability)
    }))

    // Obtener rango de precios para filtros
    const { data: priceRange } = await supabase
      .rpc('get_price_range', {
        p_specialty_slug: specialtySlug,
        p_category_slug: categorySlug
      })

    const result: SpecialistSearchResult = {
      specialists,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      filters: {
        categorySlug: categorySlug || undefined,
        specialtySlug: specialtySlug || undefined,
        consultationType: consultationType as any || 'all',
        availableToday,
        priceMin: priceMin || undefined,
        priceMax: priceMax || undefined,
        language: language || undefined,
        location: location || undefined,
        verified: verifiedOnly,
        sortBy: sortBy as any,
        search: search || undefined,
        page,
        limit
      },
      priceRange: {
        min: priceRange?.[0]?.min_price || 0,
        max: priceRange?.[0]?.max_price || 100000
      }
    }

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('Error en GET /api/explore:', error)
    return NextResponse.json(
      { error: 'server_error', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

function checkAvailability(availability: any): boolean {
  if (!availability) return false
  
  const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
  const today = days[new Date().getDay()]
  
  const todaySchedule = availability[today]
  return Array.isArray(todaySchedule) && todaySchedule.length > 0
}

async function fallbackSearch(
  supabase: any,
  filters: {
    lang: string
    specialtySlug: string | null
    categorySlug: string | null
    consultationType: string | null
    priceMin: number | null
    priceMax: number | null
    verifiedOnly: boolean
    language: string | null
    location: string | null
    search: string | null
    sortBy: string
    page: number
    limit: number
  }
) {
  const { lang, specialtySlug, categorySlug, consultationType, priceMin, priceMax, 
          verifiedOnly, language, location, search, sortBy, page, limit } = filters
  
  const offset = (page - 1) * limit

  let query = supabase
    .from('professionals')
    .select(`
      id,
      specialty,
      specialty_id,
      bio,
      university,
      location,
      consultation_type,
      consultation_price,
      online_price,
      in_person_price,
      rating,
      review_count,
      verified,
      years_experience,
      languages,
      availability,
      profiles!inner (
        first_name,
        last_name,
        avatar_url
      ),
      specialties (
        id,
        name_es,
        name_en,
        slug,
        icon,
        category_id,
        categories (
          id,
          name_es,
          name_en,
          slug
        )
      )
    `, { count: 'exact' })

  // REGLA DE NEGOCIO CRÍTICA: Solo profesionales verificados en búsqueda pública
  // Siempre filtrar por verified = true para garantizar seguridad de pacientes
  query = query.eq('verified', true)

  if (specialtySlug) {
    query = query.eq('specialties.slug', specialtySlug)
  }

  if (categorySlug) {
    query = query.eq('specialties.categories.slug', categorySlug)
  }

  if (consultationType && consultationType !== 'all') {
    query = query.or(`consultation_type.eq.${consultationType},consultation_type.eq.both`)
  }

  if (priceMin) {
    query = query.gte('consultation_price', priceMin)
  }

  if (priceMax) {
    query = query.lte('consultation_price', priceMax)
  }

  if (language) {
    query = query.contains('languages', [language])
  }

  if (location) {
    query = query.ilike('location', `%${location}%`)
  }

  if (search) {
    query = query.or(`profiles.first_name.ilike.%${search}%,profiles.last_name.ilike.%${search}%,specialty.ilike.%${search}%`)
  }

  // Ordenamiento
  switch (sortBy) {
    case 'price_asc':
      query = query.order('consultation_price', { ascending: true, nullsFirst: false })
      break
    case 'price_desc':
      query = query.order('consultation_price', { ascending: false, nullsFirst: false })
      break
    case 'experience':
      query = query.order('years_experience', { ascending: false, nullsFirst: false })
      break
    case 'reviews':
      query = query.order('review_count', { ascending: false, nullsFirst: false })
      break
    default:
      query = query.order('rating', { ascending: false, nullsFirst: false })
  }

  // Paginación
  query = query.range(offset, offset + limit - 1)

  const { data: professionals, count, error } = await query

  if (error) {
    console.error('Error en fallback search:', error)
    return NextResponse.json(
      { error: 'server_error', message: 'Error en la búsqueda' },
      { status: 500 }
    )
  }

  const specialists: SpecialistCard[] = (professionals || []).map((prof: any) => {
    const specialty = prof.specialties
    const category = specialty?.categories
    
    return {
      id: prof.id,
      name: `${prof.profiles?.first_name || ''} ${prof.profiles?.last_name || ''}`.trim() || 'Profesional',
      specialty: lang === 'en' ? (specialty?.name_en || prof.specialty) : (specialty?.name_es || prof.specialty) || '',
      specialtySlug: specialty?.slug || '',
      category: lang === 'en' ? (category?.name_en || '') : (category?.name_es || ''),
      categorySlug: category?.slug || '',
      avatarUrl: prof.profiles?.avatar_url,
      rating: Number(prof.rating) || 0,
      reviewCount: prof.review_count || 0,
      price: Number(prof.consultation_price) || 0,
      onlinePrice: Number(prof.online_price) || 0,
      inPersonPrice: Number(prof.in_person_price) || 0,
      consultationType: prof.consultation_type || 'both',
      location: prof.location,
      verified: prof.verified || false,
      yearsExperience: prof.years_experience || 0,
      languages: prof.languages || ['ES'],
      bio: prof.bio,
      university: prof.university,
      isAvailableToday: checkAvailability(prof.availability)
    }
  })

  return NextResponse.json({
    success: true,
    specialists,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
    filters: {
      categorySlug: categorySlug || undefined,
      specialtySlug: specialtySlug || undefined,
      consultationType: consultationType as any || 'all',
      priceMin: priceMin || undefined,
      priceMax: priceMax || undefined,
      language: language || undefined,
      location: location || undefined,
      verified: verifiedOnly,
      sortBy: sortBy as any,
      search: search || undefined,
      page,
      limit
    },
    priceRange: { min: 0, max: 100000 }
  })
}
