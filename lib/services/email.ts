/**
 * Email Service using Supabase Email
 * 
 * Este servicio utiliza Supabase para enviar emails.
 * Supabase tiene un servicio de email integrado que se puede usar
 * para envío de emails transaccionales.
 */

import { createClient } from '@/lib/supabase/server'
import type { EmailTemplate } from '@/lib/emails/templates'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text: string
  from?: string
}

/**
 * Envía un email usando Supabase
 * 
 * Nota: Supabase no tiene un servicio de email nativo como Resend o SendGrid.
 * Sin embargo, podemos usar Supabase Edge Functions o un servicio externo
 * configurado en Supabase. Por ahora, implementamos una función que intenta
 * usar la API de Supabase Admin si está disponible, o un fallback.
 * 
 * Para producción, se recomienda:
 * 1. Configurar un servicio de email (Resend, SendGrid) como Edge Function
 * 2. O usar Supabase Auth para emails de autenticación
 * 3. O configurar un webhook desde Supabase a un servicio de email
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error: string | null }> {
  try {
    // Verificar que tenemos las configuraciones necesarias
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
      return {
        success: false,
        error: 'Supabase URL no configurada',
      }
    }

    // Opción 1: Si tenemos una Edge Function configurada para emails
    // Esto requiere configurar una Edge Function en Supabase que use Resend/SendGrid
    if (process.env.EMAIL_SERVICE_ENDPOINT) {
      try {
        const response = await fetch(process.env.EMAIL_SERVICE_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseServiceKey || ''}`,
          },
          body: JSON.stringify(options),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          return {
            success: false,
            error: errorData.error || 'Error al enviar email',
          }
        }

        return {
          success: true,
          error: null,
        }
      } catch (fetchError) {
        console.error('Error enviando email vía Edge Function:', fetchError)
        // Continuar con fallback
      }
    }

    // Opción 2: Usar un servicio de email directamente (Resend recomendado)
    // Para usar esto, necesitas instalar: npm install resend
    // Y configurar: RESEND_API_KEY en .env.local
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)

        const { data, error } = await resend.emails.send({
          from: options.from || process.env.EMAIL_FROM || 'NUREA <noreply@nurea.app>',
          to: [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text,
        })

        if (error) {
          console.error('Error enviando email con Resend:', error)
          return {
            success: false,
            error: error.message || 'Error al enviar email',
          }
        }

        return {
          success: true,
          error: null,
        }
      } catch (resendError) {
        console.error('Error inicializando Resend:', resendError)
        // Continuar con fallback
      }
    }

    // Opción 3: Fallback - loggear y retornar éxito simulado
    // En desarrollo, esto permite que el código funcione sin configurar email
    // En producción, deberías tener una de las opciones anteriores configurada
    console.warn('Email service no configurado. Email no enviado:', {
      to: options.to,
      subject: options.subject,
    })

    // Retornar éxito simulado para no bloquear el flujo
    // En producción, esto debería retornar error si no hay servicio configurado
    if (process.env.NODE_ENV === 'production') {
      return {
        success: false,
        error: 'Servicio de email no configurado. Por favor, configura RESEND_API_KEY o EMAIL_SERVICE_ENDPOINT',
      }
    }

    return {
      success: true,
      error: null,
    }
  } catch (error) {
    console.error('Error en sendEmail:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al enviar email',
    }
  }
}

/**
 * Envía email de confirmación de cita
 */
export async function sendAppointmentConfirmation(
  patientEmail: string,
  template: EmailTemplate,
  language: 'es' | 'en' = 'es'
): Promise<{ success: boolean; error: string | null }> {
  return sendEmail({
    to: patientEmail,
    subject: language === 'es' ? template.subject : template.subjectEn,
    html: language === 'es' ? template.html : template.htmlEn,
    text: language === 'es' ? template.text : template.textEn,
    from: process.env.EMAIL_FROM || 'NUREA <noreply@nurea.app>',
  })
}

/**
 * Envía email de recordatorio de cita
 */
export async function sendAppointmentReminder(
  patientEmail: string,
  template: EmailTemplate,
  language: 'es' | 'en' = 'es'
): Promise<{ success: boolean; error: string | null }> {
  return sendEmail({
    to: patientEmail,
    subject: language === 'es' ? template.subject : template.subjectEn,
    html: language === 'es' ? template.html : template.htmlEn,
    text: language === 'es' ? template.text : template.textEn,
    from: process.env.EMAIL_FROM || 'NUREA <noreply@nurea.app>',
  })
}

/**
 * Envía email de cancelación de cita
 */
export async function sendAppointmentCancellation(
  patientEmail: string,
  template: EmailTemplate,
  language: 'es' | 'en' = 'es'
): Promise<{ success: boolean; error: string | null }> {
  return sendEmail({
    to: patientEmail,
    subject: language === 'es' ? template.subject : template.subjectEn,
    html: language === 'es' ? template.html : template.htmlEn,
    text: language === 'es' ? template.text : template.textEn,
    from: process.env.EMAIL_FROM || 'NUREA <noreply@nurea.app>',
  })
}

/**
 * Envía email de nuevo mensaje
 */
export async function sendNewMessageEmail(
  recipientEmail: string,
  template: EmailTemplate,
  language: 'es' | 'en' = 'es'
): Promise<{ success: boolean; error: string | null }> {
  return sendEmail({
    to: recipientEmail,
    subject: language === 'es' ? template.subject : template.subjectEn,
    html: language === 'es' ? template.html : template.htmlEn,
    text: language === 'es' ? template.text : template.textEn,
    from: process.env.EMAIL_FROM || 'NUREA <noreply@nurea.app>',
  })
}

/**
 * Envía email de confirmación de pago
 */
export async function sendPaymentConfirmationEmail(
  patientEmail: string,
  template: EmailTemplate,
  language: 'es' | 'en' = 'es'
): Promise<{ success: boolean; error: string | null }> {
  return sendEmail({
    to: patientEmail,
    subject: language === 'es' ? template.subject : template.subjectEn,
    html: language === 'es' ? template.html : template.htmlEn,
    text: language === 'es' ? template.text : template.textEn,
    from: process.env.EMAIL_FROM || 'NUREA <noreply@nurea.app>',
  })
}
