import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { notificationId, markAllAsRead } = body

    if (markAllAsRead) {
      // Marcar todas como leídas
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) {
        if (error.code === '42P01' || error.code === '42501' || error.code === 'PGRST205') {
          return NextResponse.json({ success: true })
        }
        console.error('Error marking all as read:', error)
        return NextResponse.json(
          { error: 'Error al marcar notificaciones' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true })
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: 'ID de notificación requerido' },
        { status: 400 }
      )
    }

    // Marcar una notificación específica como leída
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id)

    if (error) {
      if (error.code === '42P01' || error.code === '42501' || error.code === 'PGRST205') {
        return NextResponse.json({ success: true })
      }
      console.error('Error marking notification as read:', error)
      return NextResponse.json(
        { error: 'Error al marcar notificación' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in mark-read API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

