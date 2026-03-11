import React from "react"
import { getResend } from "@/lib/resend"
import { VerificationCodeEmail } from "@/components/emails/VerificationCodeEmail"
import { ResetPasswordEmail } from "@/components/emails/ResetPasswordEmail"

/**
 * Remitente oficial para correos de seguridad (verificación y recuperación de contraseña).
 * Override con SECURITY_EMAIL_FROM en .env si necesitas otro valor.
 */
const SECURITY_FROM =
  process.env.SECURITY_EMAIL_FROM ?? "NUREA Seguridad <notificaciones@nurea.app>"

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

export type EmailResult = {
  success: boolean
  error?: string
}

/**
 * Envía el correo de código de verificación (React Email).
 */
export async function sendVerificationCode(
  params: SendVerificationCodeParams
): Promise<EmailResult> {
  const { to, userName, validationCode } = params
  try {
    const resend = getResend()
    const { data, error } = await resend.emails.send({
      from: SECURITY_FROM,
      to: [to],
      subject: "Tu código de verificación — NUREA",
      react: React.createElement(VerificationCodeEmail, {
        userName,
        validationCode,
      }),
    })
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
 * Envía el correo de recuperación de contraseña con enlace (React Email).
 */
export async function sendPasswordReset(params: SendPasswordResetParams): Promise<EmailResult> {
  const { to, userName, resetLink } = params
  try {
    const resend = getResend()
    const { error } = await resend.emails.send({
      from: SECURITY_FROM,
      to: [to],
      subject: "Restablece tu contraseña — NUREA",
      react: React.createElement(ResetPasswordEmail, {
        userName,
        resetLink,
      }),
    })
    if (error) {
      console.error("[email-service] sendPasswordReset error:", error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("[email-service] sendPasswordReset exception:", err)
    return { success: false, error: message }
  }
}
