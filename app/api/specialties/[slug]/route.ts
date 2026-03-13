import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const revalidate = 3600

/**
 * GET /api/specialties/[slug]
 * Obtiene una especialidad específica por slug
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const lang = searchParams.get('lang') || 'es'

    const { data: specialty, error } = await supabase
      .from('specialties')
      .select(`
        *,
        categories (
          id,
          name_es,
          name_en,
          slug,
          icon
        ),
        parent:specialties!parent_id (
          id,
          name_es,
          name_en,
          slug
        )
      `)
      .eq('slug', slug)
      .single()

    if (error || !specialty) {
      return NextResponse.json(
        { error: 'not_found', message: 'Especialidad no encontrada' },
        { status: 404 }
      )
    }

    // Obtener sub-especialidades si existen
    const { data: subSpecialties } = await supabase
      .from('specialties')
      .select('*')
      .eq('parent_id', specialty.id)
      .eq('is_active', true)
      .order('sort_order')

    // Contar profesionales con esta especialidad
    const { count: professionalCount } = await supabase
      .from('professionals')
      .select('*', { count: 'exact', head: true })
      .eq('specialty_id', specialty.id)
      .eq('verified', true)

    const formatted = {
      id: specialty.id,
      name: lang === 'en' ? specialty.name_en : specialty.name_es,
      nameEs: specialty.name_es,
      nameEn: specialty.name_en,
      slug: specialty.slug,
      icon: specialty.icon,
      requiresLicense: specialty.requires_license,
      category: specialty.categories ? {
        id: specialty.categories.id,
        name: lang === 'en' ? specialty.categories.name_en : specialty.categories.name_es,
        slug: specialty.categories.slug,
        icon: specialty.categories.icon
      } : null,
      parent: specialty.parent ? {
        id: specialty.parent.id,
        name: lang === 'en' ? specialty.parent.name_en : specialty.parent.name_es,
        slug: specialty.parent.slug
      } : null,
      subSpecialties: (subSpecialties || []).map((sub: any) => ({
        id: sub.id,
        name: lang === 'en' ? sub.name_en : sub.name_es,
        slug: sub.slug,
        icon: sub.icon
      })),
      professionalCount: professionalCount || 0
    }

    return NextResponse.json({
      success: true,
      specialty: formatted
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    })
  } catch (error) {
    console.error('Error en GET /api/specialties/[slug]:', error)
    return NextResponse.json(
      { error: 'server_error', message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
