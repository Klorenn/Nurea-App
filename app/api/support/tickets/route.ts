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

    // Validar categoría si se proporciona (sin categoría de facturación)
    const validCategories = ['technical', 'account', 'appointment', 'other']
    const finalCategory = category && validCategories.includes(category) ? category : 'other'

    // Validar prioridad si se proporciona
    const validPriorities = ['low', 'medium', 'high', 'urgent']
    const finalPriority = priority && validPriorities.includes(priority) ? priority : 'medium'

    // Sanitizar subject y message antes de insertar
    const { sanitizeText, sanitizeMessage } = await import('@/lib/utils/sanitize')
    const sanitizedSubject = sanitizeText(subject.trim())
    const sanitizedMessage = sanitizeMessage(message.trim())

    if (!sanitizedSubject || sanitizedSubject.length === 0) {
      return NextResponse.json(
        {
          error: 'invalid_subject',
          message: 'El asunto no puede estar vacío o contener solo caracteres no válidos.'
        },
        { status: 400 }
      )
    }

    if (!sanitizedMessage || sanitizedMessage.length === 0) {
      return NextResponse.json(
        {
          error: 'invalid_message',
          message: 'El mensaje no puede estar vacío o contener solo caracteres no válidos.'
        },
        { status: 400 }
      )
    }

    // Crear el ticket (dejamos que los defaults de la tabla manejen status/fechas)
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        user_role: profile.role,
        subject: sanitizedSubject,
        message: sanitizedMessage,
        category: finalCategory,
        priority: finalPriority,
      })
      .select()
      .single()

    if (ticketError) {
      console.error('Error creating ticket:', ticketError)
      return NextResponse.json(
        { 
          error: 'create_failed',
          message: 'No pudimos crear el ticket. Por favor, intenta nuevamente.',
          details: ticketError.message ?? ticketError.code ?? String(ticketError)
        },
        { status: 500 }
      )
    }

    // Crear el primer mensaje de la conversación
    const { error: messageError } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticket.id,
        sender_id: user.id,
        sender_role: 'user',
        message: sanitizedMessage,
      })

    if (messageError) {
      console.error('Error creating first ticket message:', messageError)
      // No fallar al usuario si solo el mensaje tiene problema
    }

    if (process.env.RESEND_API_KEY && user.email) {
      try {
        const { sendSupportTicketCreated } = await import('@/lib/email-service')
        const { data: nameProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name, role')
          .eq('id', user.id)
          .single()
        const userName = nameProfile
          ? `${nameProfile.first_name || ''} ${nameProfile.last_name || ''}`.trim() || 'Usuario'
          : 'Usuario'
        const supportUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
          ? `${process.env.NEXT_PUBLIC_SITE_URL || `https://${process.env.VERCEL_URL}`}`
          : 'http://localhost:3000'
        const supportLink = nameProfile?.role === 'professional'
          ? `${supportUrl}/professional/support`
          : `${supportUrl}/dashboard/support`
        await sendSupportTicketCreated({
          to: user.email,
          userName,
          ticketSubject: sanitizedSubject,
          supportLink,
          ticketId: ticket.id,
        })
      } catch (emailErr) {
        console.error('[support/tickets] Confirmation email error:', emailErr)
      }
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

