import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/admin/tickets
 * Obtiene todos los tickets de soporte (solo admin)
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
          message: 'Por favor, inicia sesión.'
        },
        { status: 401 }
      )
    }

    // Verificar que el usuario es admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { 
          error: 'forbidden',
          message: 'Solo los administradores pueden acceder a esta información.'
        },
        { status: 403 }
      )
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const role = searchParams.get('role')

    // Construir query
    let query = supabase
      .from('support_tickets')
      .select(`
        *,
        user:profiles!support_tickets_user_id_fkey(
          id,
          first_name,
          last_name,
          email,
          role
        ),
        admin:profiles!support_tickets_admin_id_fkey(
          id,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false })

    // Aplicar filtros
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (priority && priority !== 'all') {
      query = query.eq('priority', priority)
    }

    if (role && role !== 'all') {
      query = query.eq('user_role', role)
    }

    const { data: tickets, error: ticketsError } = await query

    if (ticketsError) {
      console.error('Error fetching tickets:', ticketsError)
      return NextResponse.json(
        { 
          error: 'fetch_failed',
          message: 'No pudimos obtener los tickets. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      tickets: tickets || [],
      count: tickets?.length || 0
    })
  } catch (error) {
    console.error('Get tickets error:', error)
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
 * PUT /api/admin/tickets
 * Actualiza un ticket (responder, cerrar, escalar)
 */
export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { 
          error: 'unauthorized',
          message: 'Por favor, inicia sesión.'
        },
        { status: 401 }
      )
    }

    // Verificar que el usuario es admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { 
          error: 'forbidden',
          message: 'Solo los administradores pueden actualizar tickets.'
        },
        { status: 403 }
      )
    }

    const { ticketId, action, response, status: newStatus, priority: newPriority } = await request.json()

    if (!ticketId || !action) {
      return NextResponse.json(
        { 
          error: 'missing_fields',
          message: 'Por favor, proporciona el ID del ticket y la acción.'
        },
        { status: 400 }
      )
    }

    // Construir objeto de actualización
    const updateData: any = {
      admin_id: user.id,
    }

    if (action === 'respond' && response) {
      updateData.admin_response = response
      updateData.status = 'in_progress'
    } else if (action === 'close') {
      updateData.status = 'closed'
      updateData.resolved_at = new Date().toISOString()
    } else if (action === 'resolve') {
      updateData.status = 'resolved'
      updateData.resolved_at = new Date().toISOString()
    } else if (action === 'update') {
      if (newStatus) updateData.status = newStatus
      if (newPriority) updateData.priority = newPriority
      if (response) updateData.admin_response = response
    }

    // Actualizar el ticket
    const { data: ticket, error: updateError } = await supabase
      .from('support_tickets')
      .update(updateData)
      .eq('id', ticketId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating ticket:', updateError)
      return NextResponse.json(
        { 
          error: 'update_failed',
          message: 'No se pudo actualizar el ticket. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      ticket: ticket
    })
  } catch (error) {
    console.error('Update ticket error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

