import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendNewMessageEmail } from '@/lib/services/email'
import { newMessageEmail } from '@/lib/emails/templates'

/**
 * POST /api/cron/send-message-notifications
 * 
 * Cron job que procesa notificaciones pendientes de mensajes nuevos
 * y envía emails a los usuarios
 * 
 * Se ejecuta cada 5 minutos (configurar en vercel.json)
 */
export async function GET(request: Request) {
  const startTime = Date.now()
  const cronId = `message-notifications-${Date.now()}`
  
  console.log(`[CRON ${cronId}] Iniciando job de notificaciones de mensajes a las ${new Date().toISOString()}`)
  
  // Verificar autorización
  const authHeader = request.headers.get('authorization')
  
  if (process.env.NODE_ENV === 'production') {
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error(`[CRON ${cronId}] Acceso no autorizado - token inválido`)
      return NextResponse.json(
        { 
          error: 'unauthorized',
          message: 'Token de autorización inválido'
        },
        { status: 401 }
      )
    }
  }

  try {
    const supabase = await createClient()

    // Obtener notificaciones pendientes (últimas 10 minutos para evitar duplicados)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    
    const { data: notifications, error: notificationsError } = await supabase
      .from('message_notifications')
      .select(`
        id,
        message_id,
        receiver_id,
        sender_id,
        message:messages!message_notifications_message_id_fkey(
          content,
          created_at
        ),
        receiver:profiles!message_notifications_receiver_id_fkey(
          id,
          first_name,
          last_name,
          email,
          notification_preferences
        ),
        sender:profiles!message_notifications_sender_id_fkey(
          id,
          first_name,
          last_name
        )
      `)
      .is('sent_at', null)
      .gte('created_at', tenMinutesAgo)
      .limit(50) // Procesar máximo 50 a la vez

    if (notificationsError) {
      console.error(`[CRON ${cronId}] Error obteniendo notificaciones:`, notificationsError)
      return NextResponse.json(
        {
          error: 'fetch_failed',
          message: 'Error al obtener notificaciones',
        },
        { status: 500 }
      )
    }

    if (!notifications || notifications.length === 0) {
      const duration = Date.now() - startTime
      console.log(`[CRON ${cronId}] Completado en ${duration}ms - No hay notificaciones pendientes`)
      return NextResponse.json({
        success: true,
        message: 'No hay notificaciones pendientes',
        notificationsSent: 0,
        durationMs: duration,
      })
    }

    console.log(`[CRON ${cronId}] Encontradas ${notifications.length} notificaciones pendientes`)

    let notificationsSent = 0
    let notificationsFailed = 0

    // Procesar cada notificación
    for (const notification of notifications) {
      try {
        const receiver = notification.receiver as any
        const sender = notification.sender as any
        const message = notification.message as any

        if (!receiver?.email || !sender || !message) {
          // Marcar como enviada aunque falle (evitar reintentos infinitos)
          await supabase
            .from('message_notifications')
            .update({ sent_at: new Date().toISOString() })
            .eq('id', notification.id)
          continue
        }

        // Verificar preferencias de notificación (si existe el campo)
        const prefs = receiver.notification_preferences as any
        if (prefs?.email_messages === false) {
          // Usuario deshabilitó notificaciones por email
          await supabase
            .from('message_notifications')
            .update({ sent_at: new Date().toISOString() })
            .eq('id', notification.id)
          continue
        }

        const receiverName = receiver
          ? `${receiver.first_name || ''} ${receiver.last_name || ''}`.trim()
          : 'Usuario'
        const senderName = sender
          ? `${sender.first_name || ''} ${sender.last_name || ''}`.trim()
          : 'Usuario'

        // Crear preview del mensaje (primeros 100 caracteres)
        const messagePreview = message.content
          ? message.content.substring(0, 100) + (message.content.length > 100 ? '...' : '')
          : 'Nuevo mensaje'

        // Crear template de email
        const emailTemplate = newMessageEmail({
          patientName: receiverName,
          professionalName: senderName,
          messagePreview,
        })

        // Enviar email
        const language = 'es' // Determinar idioma si es posible
        const { success, error: emailError } = await sendNewMessageEmail(
          receiver.email,
          emailTemplate,
          language
        )

        if (success) {
          // Marcar como enviada
          const { error: updateError } = await supabase
            .from('message_notifications')
            .update({ sent_at: new Date().toISOString() })
            .eq('id', notification.id)

          if (updateError) {
            console.error(`[CRON ${cronId}] Error actualizando sent_at para notificación ${notification.id}:`, updateError)
          }

          notificationsSent++
          console.log(`[CRON ${cronId}] ✓ Notificación de mensaje enviada a ${receiver.email} (notificación ${notification.id})`)
        } else {
          console.error(`[CRON ${cronId}] ✗ Error enviando notificación ${notification.id}:`, emailError)
          notificationsFailed++
        }
      } catch (error) {
        console.error(`[CRON ${cronId}] ✗ Error procesando notificación ${notification.id}:`, error)
        notificationsFailed++
      }
    }

    const duration = Date.now() - startTime
    const summary = `Procesadas ${notifications.length} notificaciones. ${notificationsSent} enviadas, ${notificationsFailed} fallos. Duración: ${duration}ms`
    console.log(`[CRON ${cronId}] ${summary}`)

    return NextResponse.json({
      success: true,
      message: summary,
      notificationsSent,
      notificationsFailed,
      totalProcessed: notifications.length,
      durationMs: duration,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[CRON ${cronId}] ✗ Error fatal en cron job de notificaciones (duración: ${duration}ms):`, error)
    return NextResponse.json(
      {
        error: 'server_error',
        message: 'Error al procesar notificaciones',
        durationMs: duration,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// También permitir POST
export async function POST(request: Request) {
  return GET(request)
}
