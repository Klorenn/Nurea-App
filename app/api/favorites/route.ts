import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/favorites
 * Obtiene los favoritos del usuario autenticado
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { 
          error: 'unauthorized',
          message: 'Por favor, inicia sesión para ver tus favoritos.'
        },
        { status: 401 }
      )
    }

    // Obtener favoritos del usuario
    const { data: favorites, error: favoritesError } = await supabase
      .from('favorites')
      .select(`
        id,
        professional_id,
        created_at,
        professional:professionals!favorites_professional_id_fkey(
          id,
          specialty,
          consultation_price,
          consultation_type,
          verified,
          location,
          profile:profiles!professionals_id_fkey(
            id,
            first_name,
            last_name,
            avatar_url
          ),
          reviews(rating)
        )
      `)
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false })

    if (favoritesError) {
      // Si la tabla no existe o no hay permisos, no romper el dashboard:
      // devolver simplemente una lista vacía.
      if (
        favoritesError.code === '42P01' || 
        favoritesError.code === '42501' || 
        favoritesError.code?.startsWith('PGRST')
      ) {
        console.warn('Favorites table missing or RLS blocked. Returning empty list.')
        return NextResponse.json({
          success: true,
          favorites: [],
          count: 0,
        })
      }
      console.error('Error fetching favorites:', favoritesError)
      return NextResponse.json(
        { 
          error: 'fetch_failed',
          message: 'No pudimos obtener tus favoritos. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    // Formatear favoritos
    const formattedFavorites = (favorites || []).map((fav: any) => {
      const prof = fav.professional
      
      // El profesional de prueba ahora está en la BD, se maneja como cualquier otro

      const reviewList = (prof as any)?.reviews || []
      const reviewCount = reviewList.length
      const avgRating = reviewCount > 0
        ? reviewList.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviewCount
        : null

      return {
        id: fav.id,
        professionalId: prof?.id,
        name: `Dr. ${prof?.profile?.first_name || ''} ${prof?.profile?.last_name || ''}`.trim() || 'Profesional',
        specialty: prof?.specialty || '',
        rating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        reviews: reviewCount,
        location: prof?.location || '',
        price: prof?.consultation_price || 0,
        image: prof?.profile?.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
        available: prof?.verified || false,
        consultationTypes: prof?.consultation_type === 'both' 
          ? ['Online', 'In-person']
          : prof?.consultation_type === 'online'
          ? ['Online']
          : ['In-person'],
      }
    })

    // Filtrar nulls (profesionales de prueba en producción)
    const validFavorites = formattedFavorites.filter((fav: any) => fav !== null)

    return NextResponse.json({
      success: true,
      favorites: validFavorites,
      count: validFavorites.length
    })
  } catch (error) {
    console.error('Get favorites error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/favorites
 * Agrega un profesional a favoritos
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { 
          error: 'unauthorized',
          message: 'Por favor, inicia sesión para agregar favoritos.'
        },
        { status: 401 }
      )
    }

    const { professionalId } = await request.json()

    if (!professionalId) {
      return NextResponse.json(
        { 
          error: 'missing_fields',
          message: 'Por favor, proporciona el ID del profesional.'
        },
        { status: 400 }
      )
    }

    // Verificar si ya es favorito
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('patient_id', user.id)
      .eq('professional_id', professionalId)
      .single()

    if (existing) {
      return NextResponse.json(
        { 
          error: 'already_favorite',
          message: 'Este profesional ya está en tus favoritos.'
        },
        { status: 400 }
      )
    }

    // Verificar que el profesional existe (incluye el profesional de prueba de la BD)
    const { data: professional } = await supabase
      .from('professionals')
      .select('id')
      .eq('id', professionalId)
      .maybeSingle()

    if (!professional) {
      return NextResponse.json(
        { 
          error: 'not_found',
          message: 'Profesional no encontrado.'
        },
        { status: 404 }
      )
    }

    // Agregar a favoritos
    const { data: favorite, error: favoriteError } = await supabase
      .from('favorites')
      .insert({
        patient_id: user.id,
        professional_id: professionalId,
      })
      .select()
      .single()

    if (favoriteError) {
      console.error('Error adding favorite:', favoriteError)
      return NextResponse.json(
        { 
          error: 'creation_failed',
          message: 'No pudimos agregar el favorito. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      favorite,
      message: 'Profesional agregado a favoritos.'
    })
  } catch (error) {
    console.error('Add favorite error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/favorites
 * Elimina un profesional de favoritos
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { 
          error: 'unauthorized',
          message: 'Por favor, inicia sesión para eliminar favoritos.'
        },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const professionalId = searchParams.get('professionalId')

    if (!professionalId) {
      return NextResponse.json(
        { 
          error: 'missing_fields',
          message: 'Por favor, proporciona el ID del profesional.'
        },
        { status: 400 }
      )
    }

    // El profesional de prueba ahora está en la BD, se maneja como cualquier otro

    // Eliminar de favoritos
    const { error: deleteError } = await supabase
      .from('favorites')
      .delete()
      .eq('patient_id', user.id)
      .eq('professional_id', professionalId)

    if (deleteError) {
      console.error('Error deleting favorite:', deleteError)
      return NextResponse.json(
        { 
          error: 'delete_failed',
          message: 'No pudimos eliminar el favorito. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Profesional eliminado de favoritos.'
    })
  } catch (error) {
    console.error('Delete favorite error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

