import React from "react"
import { getResend, sendSingleWithRetry, buildIdempotencyKey } from "@/lib/resend"
import { VerificationCodeEmail } from "@/components/emails/VerificationCodeEmail"
import { VerificationLinkEmail } from "@/components/emails/VerificationLinkEmail"
import { ResetPasswordEmail } from "@/components/emails/ResetPasswordEmail"
import { WelcomeEmail } from "@/components/emails/WelcomeEmail"
import { SupportTicketCreatedEmail } from "@/components/emails/SupportTicketCreatedEmail"
import { SupportTicketReplyEmail } from "@/components/emails/SupportTicketReplyEmail"
import { AppointmentReminderEmail } from "@/components/emails/AppointmentReminderEmail"

function slugEntityId(id: string): string {
  return id.replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 200)
}

/**
 * Remitente para todos los correos transaccionales de NUREA.
 * Dominio verificado: nurea.app (DNS TXT y MX configurados en Resend).
 */
const SECURITY_FROM: string = process.env.SECURITY_EMAIL_FROM ?? (() => {
  throw new Error(
    "SECURITY_EMAIL_FROM no está configurado. Añade SECURITY_EMAIL_FROM en .env.local " +
    '(ej. SECURITY_EMAIL_FROM="NUREA <notificaciones@nurea.app>")'
  )
})()

export type SendVerificationCodeParams = {
  to: string
  userName: string
  validationCode: string
}

export type SendPasswordResetParams = {
  to: string
  userName: string
  resetLink: string
}

export type SendVerificationLinkParams = {
  to: string
  userName: string
  verificationLink: string
}

export type EmailResult = {
  success: boolean
  error?: string
}

export type SendWelcomeParams = {
  to: string
  userName: string
  role: "patient" | "professional"
  dashboardLink: string
}

export type SendSupportTicketCreatedParams = {
  to: string
  userName: string
  ticketSubject: string
  supportLink: string
}

export type SendSupportTicketReplyParams = {
  to: string
  userName: string
  ticketSubject: string
  adminResponse: string
  supportLink: string
}

export type SendAppointmentReminderParams = {
  to: string
  userName: string
  professionalName: string
  appointmentDate: string
  appointmentTime: string
  patientPortalLink?: string
}

/**
 * Envía el correo de código de verificación (React Email).
 * Idempotency: verification-code/<entityId> (evita duplicados en reintentos).
 */
export async function sendVerificationCode(
  params: SendVerificationCodeParams
): Promise<EmailResult> {
  const { to, userName, validationCode } = params
  const entityId = slugEntityId(to)
  try {
    const resend = getResend()
    const { error } = await sendSingleWithRetry(
      resend,
      {
        from: SECURITY_FROM,
        to: [to],
        subject: "Tu código de verificación — NUREA",
        react: React.createElement(VerificationCodeEmail, {
          userName,
          validationCode,
        }),
      },
      buildIdempotencyKey("verification-code", entityId)
    )
    if (error) {
      console.error("[email-service] sendVerificationCode error:", error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("[email-service] sendVerificationCode exception:", err)
    return { success: false, error: message }
  }
}

/**
 * Envía el correo de verificación de cuenta con enlace (React Email).
 * Idempotency: verification-link/<entityId>.
 */
export async function sendVerificationLink(
  params: SendVerificationLinkParams
): Promise<EmailResult> {
  const { to, userName, verificationLink } = params
  const entityId = slugEntityId(to)
  try {
    const resend = getResend()
    const { data, error } = await sendSingleWithRetry(
      resend,
      {
        from: SECURITY_FROM,
        to: [to],
        subject: "Verifica tu email — NUREA",
        react: React.createElement(VerificationLinkEmail, {
          userName,
          verificationLink,
        }),
      },
      buildIdempotencyKey("verification-link", entityId)
    )
    if (error) {
      console.error("[email-service] sendVerificationLink error:", {
        to,
        message: error.message,
        statusCode: (error as { statusCode?: number })?.statusCode,
        name: (error as { name?: string })?.name,
      })
      return { success: false, error: error.message }
    }
    console.info("[email-service] sendVerificationLink sent to", to, "id:", (data as { id?: string })?.id ?? "ok")
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("[email-service] sendVerificationLink exception:", err)
    return { success: false, error: message }
  }
}

/**
 * Envía el correo de recuperación de contraseña con enlace (React Email).
 * Idempotency: password-reset/<entityId>.
 */
export async function sendPasswordReset(params: SendPasswordResetParams): Promise<EmailResult> {
  const { to, userName, resetLink } = params
  const entityId = slugEntityId(to)
  try {
    const resend = getResend()
    const { data, error } = await sendSingleWithRetry(
      resend,
      {
        from: SECURITY_FROM,
        to: [to],
        subject: "Restablece tu contraseña — NUREA",
        react: React.createElement(ResetPasswordEmail, {
          userName,
          resetLink,
        }),
      },
      buildIdempotencyKey("password-reset", entityId)
    )
    if (error) {
      console.error("[email-service] sendPasswordReset error:", {
        to,
        message: error.message,
        statusCode: (error as { statusCode?: number })?.statusCode,
      })
      return { success: false, error: error.message }
    }
    console.info("[email-service] sendPasswordReset sent to", to, "id:", (data as { id?: string })?.id ?? "ok")
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("[email-service] sendPasswordReset exception:", err)
    return { success: false, error: message }
  }
}

/**
 * Envía el correo de bienvenida tras el registro.
 * Idempotency: welcome/<entityId>.
 */
export async function sendWelcome(params: SendWelcomeParams): Promise<EmailResult> {
  const { to, userName, role, dashboardLink } = params
  const entityId = slugEntityId(to)
  try {
    const resend = getResend()
    const { error } = await sendSingleWithRetry(
      resend,
      {
        from: SECURITY_FROM,
        to: [to],
        subject: "Bienvenido a NUREA — Tu cuenta está lista",
        react: React.createElement(WelcomeEmail, {
          userName,
          role,
          dashboardLink,
        }),
      },
      buildIdempotencyKey("welcome", entityId)
    )
    if (error) {
      console.error("[email-service] sendWelcome error:", error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("[email-service] sendWelcome exception:", err)
    return { success: false, error: message }
  }
}

/**
 * Envía confirmación al usuario cuando crea un ticket de soporte.
 * Idempotency: support-ticket-created/<ticketId>.
 */
export async function sendSupportTicketCreated(
  params: SendSupportTicketCreatedParams & { ticketId: string }
): Promise<EmailResult> {
  const { to, userName, ticketSubject, supportLink, ticketId } = params
  try {
    const resend = getResend()
    const { error } = await sendSingleWithRetry(
      resend,
      {
        from: SECURITY_FROM,
        to: [to],
        subject: "Recibimos tu consulta de soporte — NUREA",
        react: React.createElement(SupportTicketCreatedEmail, {
          userName,
          ticketSubject,
          supportLink,
        }),
      },
      buildIdempotencyKey("support-ticket-created", ticketId)
    )
    if (error) {
      console.error("[email-service] sendSupportTicketCreated error:", error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("[email-service] sendSupportTicketCreated exception:", err)
    return { success: false, error: message }
  }
}

/**
 * Envía al usuario cuando el equipo de soporte responde a su ticket.
 * Idempotency: support-ticket-reply/<ticketId>.
 */
export async function sendSupportTicketReply(
  params: SendSupportTicketReplyParams & { ticketId: string }
): Promise<EmailResult> {
  const { to, userName, ticketSubject, adminResponse, supportLink, ticketId } = params
  try {
    const resend = getResend()
    const { error } = await sendSingleWithRetry(
      resend,
      {
        from: SECURITY_FROM,
        to: [to],
        subject: `Soporte NUREA te ha respondido: ${ticketSubject}`,
        react: React.createElement(SupportTicketReplyEmail, {
          userName,
          ticketSubject,
          adminResponse,
          supportLink,
        }),
      },
      buildIdempotencyKey("support-ticket-reply", ticketId)
    )
    if (error) {
      console.error("[email-service] sendSupportTicketReply error:", error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("[email-service] sendSupportTicketReply exception:", err)
    return { success: false, error: message }
  }
}

/**
 * Envía recordatorio de cita al paciente (ej. 24h antes).
 * Idempotency: appointment-reminder/<appointmentId>.
 */
export async function sendAppointmentReminder(
  params: SendAppointmentReminderParams & { appointmentId: string }
): Promise<EmailResult> {
  const { to, userName, professionalName, appointmentDate, appointmentTime, patientPortalLink, appointmentId } = params
  try {
    const resend = getResend()
    const { error } = await sendSingleWithRetry(
      resend,
      {
        from: SECURITY_FROM,
        to: [to],
        subject: `Recordatorio: tu cita con ${professionalName} — NUREA`,
        react: React.createElement(AppointmentReminderEmail, {
          userName,
          professionalName,
          appointmentDate,
          appointmentTime,
          patientPortalLink,
        }),
      },
      buildIdempotencyKey("appointment-reminder", appointmentId)
    )
    if (error) {
      console.error("[email-service] sendAppointmentReminder error:", error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("[email-service] sendAppointmentReminder exception:", err)
    return { success: false, error: message }
  }
}
