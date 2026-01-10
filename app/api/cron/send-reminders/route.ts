import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendAppointmentReminder } from '@/lib/services/email'
import { appointmentReminderEmail } from '@/lib/emails/templates'

/**
 * POST /api/cron/send-reminders
 * 
 * Cron job que se ejecuta cada hora para enviar recordatorios de citas
 * Busca citas confirmadas en las próximas 24-25 horas y envía emails de recordatorio
 * 
 * Para configurar en Vercel, agregar en vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/send-reminders",
 *     "schedule": "0 * * * *"  // Cada hora
 *   }]
 * }
 */
export async function GET(request: Request) {
  const startTime = Date.now()
  const cronId = `reminders-${Date.now()}`
  
  console.log(`[CRON ${cronId}] Iniciando job de recordatorios a las ${new Date().toISOString()}`)
  
  // Verificar que la request viene de Vercel Cron o tiene el header correcto
  const authHeader = request.headers.get('authorization')
  
  // En producción, verificar el token de Vercel Cron
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

    // Calcular rango de tiempo: citas en próximas 24-25 horas
    const now = new Date()
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000)

    // Buscar citas confirmadas o pending en ese rango
    // Filtrar solo las que aún no han recibido recordatorio
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        id,
        patient_id,
        professional_id,
        appointment_date,
        appointment_time,
        type,
        meeting_link,
        meeting_expires_at,
        reminder_sent_at,
        patient:profiles!appointments_patient_id_fkey(
          id,
          first_name,
          last_name,
          email
        ),
        professional:profiles!appointments_professional_id_fkey(
          id,
          first_name,
          last_name
        )
      `)
      .in('status', ['confirmed', 'pending'])
      .gte('appointment_date', in24Hours.toISOString().split('T')[0])
      .lte('appointment_date', in25Hours.toISOString().split('T')[0])
      .is('reminder_sent_at', null) // Solo las que no han recibido recordatorio

    if (appointmentsError) {
      console.error(`[CRON ${cronId}] Error obteniendo citas para recordatorio:`, appointmentsError)
      return NextResponse.json(
        {
          error: 'fetch_failed',
          message: 'Error al obtener citas para recordatorio',
        },
        { status: 500 }
      )
    }

    if (!appointments || appointments.length === 0) {
      const duration = Date.now() - startTime
      console.log(`[CRON ${cronId}] Completado en ${duration}ms - No hay citas que requieran recordatorio`)
      return NextResponse.json({
        success: true,
        message: 'No hay citas que requieran recordatorio en este momento',
        remindersSent: 0,
        durationMs: duration,
      })
    }

    console.log(`[CRON ${cronId}] Encontradas ${appointments.length} citas candidatas para recordatorio`)

    // Filtrar citas que están realmente en el rango de 24-25 horas
    const appointmentsInRange = appointments.filter((apt: any) => {
      const appointmentDateTime = new Date(`${apt.appointment_date}T${apt.appointment_time}`)
      const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
      return hoursUntilAppointment >= 24 && hoursUntilAppointment <= 25
    })

    let remindersSent = 0
    let remindersFailed = 0

    // Enviar recordatorios
    for (const appointment of appointmentsInRange) {
      try {
        const patient = appointment.patient
        const professional = appointment.professional

        if (!patient?.email) {
          console.warn(`Paciente sin email para cita ${appointment.id}`)
          continue
        }

        const patientName = patient
          ? `${patient.first_name || ''} ${patient.last_name || ''}`.trim()
          : 'Paciente'
        const professionalName = professional
          ? `${professional.first_name || ''} ${professional.last_name || ''}`.trim()
          : 'Profesional'

        // Formatear fecha y hora
        const appointmentDateObj = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`)
        const formattedDate = appointmentDateObj.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
        const formattedTime = appointment.appointment_time

        // Obtener meeting link si existe
        let meetingLink: string | undefined = undefined
        if (appointment.type === 'online' && appointment.meeting_link) {
          // Verificar que el meeting no haya expirado
          if (appointment.meeting_expires_at) {
            const expiresAt = new Date(appointment.meeting_expires_at)
            if (expiresAt > now) {
              meetingLink = appointment.meeting_link
            }
          } else {
            meetingLink = appointment.meeting_link
          }
        }

        // Obtener dirección si es presencial (se implementará después)
        let address: string | undefined = undefined

        // Crear template de email
        const emailTemplate = appointmentReminderEmail({
          patientName,
          professionalName,
          appointmentDate: formattedDate,
          appointmentTime: formattedTime,
          appointmentType: appointment.type as 'online' | 'in-person',
          meetingLink,
          address,
        })

        // Enviar email
        const language = 'es' // Determinar idioma si es posible
        const { success, error: emailError } = await sendAppointmentReminder(
          patient.email,
          emailTemplate,
          language
        )

        if (success) {
          // Marcar que se envió el recordatorio
          const { error: updateError } = await supabase
            .from('appointments')
            .update({
              reminder_sent_at: new Date().toISOString(),
            })
            .eq('id', appointment.id)

          if (updateError) {
            console.error(`[CRON ${cronId}] Error actualizando reminder_sent_at para cita ${appointment.id}:`, updateError)
          }

          remindersSent++
          console.log(`[CRON ${cronId}] ✓ Recordatorio enviado exitosamente para cita ${appointment.id} -> ${patient.email}`)
        } else {
          console.error(`[CRON ${cronId}] ✗ Error enviando recordatorio para cita ${appointment.id}:`, emailError)
          remindersFailed++
        }
      } catch (error) {
        console.error(`[CRON ${cronId}] ✗ Error procesando recordatorio para cita ${appointment.id}:`, error)
        remindersFailed++
      }
    }

    const duration = Date.now() - startTime
    const summary = `Procesadas ${appointmentsInRange.length} citas. ${remindersSent} recordatorios enviados, ${remindersFailed} fallos. Duración: ${duration}ms`
    console.log(`[CRON ${cronId}] ${summary}`)

    return NextResponse.json({
      success: true,
      message: summary,
      remindersSent,
      remindersFailed,
      totalProcessed: appointmentsInRange.length,
      durationMs: duration,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[CRON ${cronId}] ✗ Error fatal en cron job de recordatorios (duración: ${duration}ms):`, error)
    return NextResponse.json(
      {
        error: 'server_error',
        message: 'Error al procesar recordatorios',
        durationMs: duration,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// También permitir POST por si acaso
export async function POST(request: Request) {
  return GET(request)
}
