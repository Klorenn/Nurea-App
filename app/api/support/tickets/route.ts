import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/support/tickets
 * Obtiene los tickets del usuario autenticado
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

    // Obtener perfil del usuario para verificar rol
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { 
          error: 'profile_not_found',
          message: 'Perfil no encontrado.'
        },
        { status: 404 }
      )
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Construir query - solo tickets del usuario
    let query = supabase
      .from('support_tickets')
      .select(`
        *,
        admin:profiles!support_tickets_admin_id_fkey(
          id,
          first_name,
          last_name
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Aplicar filtro de estado si existe
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: tickets, error: ticketsError } = await query

    if (ticketsError) {
      console.error('Error fetching tickets:', ticketsError)
      return NextResponse.json(
        { 
          error: 'fetch_failed',
          message: 'No pudimos obtener tus tickets. Por favor, intenta nuevamente.'
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
 * POST /api/support/tickets
 * Crea un nuevo ticket de soporte
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
          message: 'Por favor, inicia sesión.'
        },
        { status: 401 }
      )
    }

    // Obtener perfil del usuario para obtener rol
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { 
          error: 'profile_not_found',
          message: 'Perfil no encontrado.'
        },
        { status: 404 }
      )
    }

    // Validar que el rol sea patient o professional
    if (profile.role !== 'patient' && profile.role !== 'professional') {
      return NextResponse.json(
        { 
          error: 'invalid_role',
          message: 'Solo pacientes y profesionales pueden crear tickets de soporte.'
        },
        { status: 403 }
      )
    }

    const { subject, message, category, priority } = await request.json()

    // Validar campos requeridos
    if (!subject || !message) {
      return NextResponse.json(
        { 
          error: 'missing_fields',
          message: 'Por favor, completa el asunto y el mensaje.'
        },
        { status: 400 }
      )
    }

    // Validar categoría si se proporciona
    const validCategories = ['technical', 'billing', 'account', 'appointment', 'other']
    const finalCategory = category && validCategories.includes(category) ? category : 'other'

    // Validar prioridad si se proporciona
    const validPriorities = ['low', 'medium', 'high', 'urgent']
    const finalPriority = priority && validPriorities.includes(priority) ? priority : 'medium'

    // Crear el ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        user_role: profile.role,
        subject: subject.trim(),
        message: message.trim(),
        category: finalCategory,
        priority: finalPriority,
        status: 'open'
      })
      .select()
      .single()

    if (ticketError) {
      console.error('Error creating ticket:', ticketError)
      return NextResponse.json(
        { 
          error: 'create_failed',
          message: 'No pudimos crear el ticket. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      ticket: ticket,
      message: 'Ticket creado exitosamente. Te responderemos pronto.'
    }, { status: 201 })
  } catch (error) {
    console.error('Create ticket error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

