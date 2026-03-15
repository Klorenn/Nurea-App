import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { 
          error: 'unauthorized',
          message: 'Por favor, inicia sesión para ver tus notificaciones.'
        },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'
    const limitParam = searchParams.get('limit')
    const limit = Math.min(Math.max(parseInt(limitParam || '50'), 1), 100) // Entre 1 y 100

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (unreadOnly) {
      query = query.eq('read', false)
    }

    const { data: notifications, error } = await query

    if (error) {
      // Si la tabla no existe o no hay permisos, devolver lista vacía para no romper el dashboard.
      if (error.code === '42P01' || error.code === '42501' || error.code === 'PGRST205') {
        console.warn('Notifications table missing or RLS blocked. Returning empty notifications.')
        return NextResponse.json({
          success: true,
          notifications: [],
          unreadCount: 0,
        })
      }
      console.error('Error fetching notifications:', error)
      return NextResponse.json(
        { 
          error: 'fetch_failed',
          message: 'Error al cargar notificaciones. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    // Contar no leídas
    const { count, error: countError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)

    if (countError) {
      if (countError.code === '42P01' || countError.code === '42501' || countError.code === 'PGRST205') {
        console.warn('Notifications count failed because table is missing or RLS blocked. Returning 0.')
        return NextResponse.json({
          success: true,
          notifications: notifications || [],
          unreadCount: 0,
        })
      }
      console.error('Error counting unread notifications:', countError)
      // No fallar si el conteo falla, retornar 0
    }

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      unreadCount: count || 0
    })
  } catch (error) {
    console.error('Error in notifications API:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Error interno del servidor. Por favor, intenta nuevamente.'
      },
      { status: 500 }
    )
  }
}

