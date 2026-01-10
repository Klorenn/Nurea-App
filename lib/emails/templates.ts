/**
 * Email Templates for NUREA
 * 
 * Estas son las plantillas de emails que se enviarán a los usuarios.
 * El envío real se implementará con un servicio de email (SendGrid, Resend, etc.)
 * 
 * Principios:
 * - Lenguaje humano y tranquilizador
 * - No alarmista
 * - Claro sobre qué hacer
 * - Incluir información de contacto
 */

export interface EmailTemplate {
  subject: string
  subjectEn: string
  html: string
  htmlEn: string
  text: string
  textEn: string
}

/**
 * Email de confirmación de cita
 */
export function appointmentConfirmedEmail(data: {
  patientName: string
  professionalName: string
  appointmentDate: string
  appointmentTime: string
  appointmentType: 'online' | 'in-person'
  meetingLink?: string
  address?: string
}): EmailTemplate {
  return {
    subject: `Tu cita con ${data.professionalName} está confirmada`,
    subjectEn: `Your appointment with ${data.professionalName} is confirmed`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .info-box { background: #f0fdfa; border-left: 4px solid #14b8a6; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .button { display: inline-block; background: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 12px 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Cita Confirmada</h1>
          </div>
          <div class="content">
            <p>Hola ${data.patientName},</p>
            <p>¡Tu cita está confirmada! Tu cita con <strong>${data.professionalName}</strong> está lista.</p>
            
            <div class="info-box">
              <p><strong>Fecha:</strong> ${data.appointmentDate}</p>
              <p><strong>Hora:</strong> ${data.appointmentTime}</p>
              <p><strong>Tipo:</strong> ${data.appointmentType === 'online' ? 'Consulta Online' : 'Consulta Presencial'}</p>
              ${data.meetingLink ? `<p><strong>Enlace:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></p>` : ''}
              ${data.address ? `<p><strong>Dirección:</strong> ${data.address}</p>` : ''}
            </div>
            
            <p>Te recordaremos mañana, 24 horas antes de tu cita. Si necesitas cambiar algo, puedes hacerlo desde tu panel en cualquier momento.</p>
            
            <a href="https://nurea.app/dashboard/appointments" class="button">Ver mis citas</a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              <strong>¿Necesitas ayuda?</strong><br>
              Escríbenos a soporte@nurea.app o desde tu panel de paciente.
            </p>
          </div>
          <div class="footer">
            <p>NUREA - Conectando pacientes con profesionales de la salud</p>
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    htmlEn: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .info-box { background: #f0fdfa; border-left: 4px solid #14b8a6; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .button { display: inline-block; background: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 12px 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Appointment Confirmed</h1>
          </div>
          <div class="content">
            <p>Hello ${data.patientName},</p>
            <p>Your appointment is confirmed! Your appointment with <strong>${data.professionalName}</strong> is set.</p>
            
            <div class="info-box">
              <p><strong>Date:</strong> ${data.appointmentDate}</p>
              <p><strong>Time:</strong> ${data.appointmentTime}</p>
              <p><strong>Type:</strong> ${data.appointmentType === 'online' ? 'Online Consultation' : 'In-person Visit'}</p>
              ${data.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></p>` : ''}
              ${data.address ? `<p><strong>Address:</strong> ${data.address}</p>` : ''}
            </div>
            
            <p>We'll remind you tomorrow, 24 hours before your appointment. If you need to change anything, you can do it from your dashboard at any time.</p>
            
            <a href="https://nurea.app/dashboard/appointments" class="button">View my appointments</a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              <strong>Need help?</strong><br>
              Contact us at soporte@nurea.app or from your patient dashboard.
            </p>
          </div>
          <div class="footer">
            <p>NUREA - Connecting patients with healthcare professionals</p>
            <p>This is an automated email, please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hola ${data.patientName},\n\nTu cita con ${data.professionalName} ha sido confirmada.\n\nFecha: ${data.appointmentDate}\nHora: ${data.appointmentTime}\nTipo: ${data.appointmentType === 'online' ? 'Consulta Online' : 'Consulta Presencial'}\n\nTe recordaremos 24 horas antes. Si necesitas cambiar o cancelar, puedes hacerlo desde tu panel.\n\nVer mis citas: https://nurea.app/dashboard/appointments\n\n¿Necesitas ayuda? Escríbenos a soporte@nurea.app`,
    textEn: `Hello ${data.patientName},\n\nYour appointment with ${data.professionalName} has been confirmed.\n\nDate: ${data.appointmentDate}\nTime: ${data.appointmentTime}\nType: ${data.appointmentType === 'online' ? 'Online Consultation' : 'In-person Visit'}\n\nWe'll remind you 24 hours before. If you need to change or cancel, you can do so from your dashboard.\n\nView my appointments: https://nurea.app/dashboard/appointments\n\nNeed help? Contact us at soporte@nurea.app`
  }
}

/**
 * Email de recordatorio de cita (24 horas antes)
 */
export function appointmentReminderEmail(data: {
  patientName: string
  professionalName: string
  appointmentDate: string
  appointmentTime: string
  appointmentType: 'online' | 'in-person'
  meetingLink?: string
  address?: string
}): EmailTemplate {
  return {
    subject: `Recordatorio: Tu cita es mañana a las ${data.appointmentTime}`,
    subjectEn: `Reminder: Your appointment is tomorrow at ${data.appointmentTime}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 12px 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Recordatorio de Cita</h1>
          </div>
          <div class="content">
            <p>Hola ${data.patientName},</p>
            <p>Te recordamos que mañana a las <strong>${data.appointmentTime}</strong> tienes tu cita con <strong>${data.professionalName}</strong>.</p>
            
            <div class="info-box">
              <p><strong>Fecha:</strong> ${data.appointmentDate}</p>
              <p><strong>Hora:</strong> ${data.appointmentTime}</p>
              <p><strong>Tipo:</strong> ${data.appointmentType === 'online' ? 'Consulta Online' : 'Consulta Presencial'}</p>
              ${data.meetingLink ? `<p><strong>Enlace:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></p>` : ''}
              ${data.address ? `<p><strong>Dirección:</strong> ${data.address}</p>` : ''}
            </div>
            
            <p>Si es online, encontrarás el enlace en tu panel. Si es presencial, la dirección es <strong>${data.address || 'la que aparece en tu panel'}</strong>. Si necesitas cambiar algo, puedes hacerlo desde tu panel. ¡Nos vemos pronto!</p>
            
            <a href="https://nurea.app/dashboard/appointments" class="button">Ver detalles de la cita</a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              <strong>¿Tienes dudas?</strong><br>
              Escríbenos a soporte@nurea.app
            </p>
          </div>
          <div class="footer">
            <p>NUREA - Conectando pacientes con profesionales de la salud</p>
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    htmlEn: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 12px 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Appointment Reminder</h1>
          </div>
          <div class="content">
            <p>Hello ${data.patientName},</p>
            <p>Just a reminder that tomorrow at <strong>${data.appointmentTime}</strong> you have your appointment with <strong>${data.professionalName}</strong>.</p>
            
            <div class="info-box">
              <p><strong>Date:</strong> ${data.appointmentDate}</p>
              <p><strong>Time:</strong> ${data.appointmentTime}</p>
              <p><strong>Type:</strong> ${data.appointmentType === 'online' ? 'Online Consultation' : 'In-person Visit'}</p>
              ${data.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></p>` : ''}
              ${data.address ? `<p><strong>Address:</strong> ${data.address}</p>` : ''}
            </div>
            
            <p>If it's online, you'll find the link in your dashboard. If it's in-person, the address is <strong>${data.address || 'the one shown in your dashboard'}</strong>. If you need to change anything, you can do it from your dashboard. See you soon!</p>
            
            <a href="https://nurea.app/dashboard/appointments" class="button">View appointment details</a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              <strong>Have questions?</strong><br>
              Contact us at soporte@nurea.app
            </p>
          </div>
          <div class="footer">
            <p>NUREA - Connecting patients with healthcare professionals</p>
            <p>This is an automated email, please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hola ${data.patientName},\n\nTe recordamos que tienes una cita mañana con ${data.professionalName}.\n\nFecha: ${data.appointmentDate}\nHora: ${data.appointmentTime}\n\nSi necesitas cambiar o cancelar, puedes hacerlo desde tu panel.\n\nVer detalles: https://nurea.app/dashboard/appointments`,
    textEn: `Hello ${data.patientName},\n\nThis is a reminder that you have an appointment tomorrow with ${data.professionalName}.\n\nDate: ${data.appointmentDate}\nTime: ${data.appointmentTime}\n\nIf you need to change or cancel, you can do so from your dashboard.\n\nView details: https://nurea.app/dashboard/appointments`
  }
}

/**
 * Email de cancelación de cita
 */
export function appointmentCancelledEmail(data: {
  patientName: string
  professionalName: string
  appointmentDate: string
  appointmentTime: string
  appointmentType: 'online' | 'in-person'
  refundAmount?: number
  refundMessage?: string
  reason?: string
}): EmailTemplate {
  const refundInfo = data.refundAmount && data.refundAmount > 0
    ? `<div class="info-box">
        <p><strong>Reembolso:</strong> $${data.refundAmount.toLocaleString()} CLP</p>
        <p>${data.refundMessage || 'El reembolso será procesado en 3-5 días hábiles.'}</p>
      </div>`
    : ''

  return {
    subject: `Tu cita del ${data.appointmentDate} ha sido cancelada`,
    subjectEn: `Your appointment on ${data.appointmentDate} has been cancelled`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .info-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .button { display: inline-block; background: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 12px 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✕ Cita Cancelada</h1>
          </div>
          <div class="content">
            <p>Hola ${data.patientName},</p>
            <p>Tu cita con <strong>${data.professionalName}</strong> ha sido cancelada.</p>
            
            <div class="info-box">
              <p><strong>Fecha:</strong> ${data.appointmentDate}</p>
              <p><strong>Hora:</strong> ${data.appointmentTime}</p>
              <p><strong>Tipo:</strong> ${data.appointmentType === 'online' ? 'Consulta Online' : 'Consulta Presencial'}</p>
              ${data.reason ? `<p><strong>Razón:</strong> ${data.reason}</p>` : ''}
            </div>
            
            ${refundInfo}
            
            <p>Si deseas reagendar una nueva cita, puedes hacerlo desde tu panel en cualquier momento.</p>
            
            <a href="https://nurea.app/dashboard/appointments" class="button">Ver mis citas</a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              <strong>¿Necesitas ayuda?</strong><br>
              Escríbenos a soporte@nurea.app o desde tu panel de paciente.
            </p>
          </div>
          <div class="footer">
            <p>NUREA - Conectando pacientes con profesionales de la salud</p>
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    htmlEn: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .info-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .button { display: inline-block; background: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 12px 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✕ Appointment Cancelled</h1>
          </div>
          <div class="content">
            <p>Hello ${data.patientName},</p>
            <p>Your appointment with <strong>${data.professionalName}</strong> has been cancelled.</p>
            
            <div class="info-box">
              <p><strong>Date:</strong> ${data.appointmentDate}</p>
              <p><strong>Time:</strong> ${data.appointmentTime}</p>
              <p><strong>Type:</strong> ${data.appointmentType === 'online' ? 'Online Consultation' : 'In-person Visit'}</p>
              ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
            </div>
            
            ${refundInfo}
            
            <p>If you'd like to reschedule, you can do so from your dashboard at any time.</p>
            
            <a href="https://nurea.app/dashboard/appointments" class="button">View my appointments</a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              <strong>Need help?</strong><br>
              Contact us at soporte@nurea.app or from your patient dashboard.
            </p>
          </div>
          <div class="footer">
            <p>NUREA - Connecting patients with healthcare professionals</p>
            <p>This is an automated email, please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hola ${data.patientName},\n\nTu cita con ${data.professionalName} ha sido cancelada.\n\nFecha: ${data.appointmentDate}\nHora: ${data.appointmentTime}\n${data.reason ? `\nRazón: ${data.reason}` : ''}\n\n${data.refundAmount && data.refundAmount > 0 ? `Reembolso: $${data.refundAmount.toLocaleString()} CLP\n${data.refundMessage || ''}\n` : ''}Si deseas reagendar, puedes hacerlo desde tu panel.\n\nVer mis citas: https://nurea.app/dashboard/appointments`,
    textEn: `Hello ${data.patientName},\n\nYour appointment with ${data.professionalName} has been cancelled.\n\nDate: ${data.appointmentDate}\nTime: ${data.appointmentTime}\n${data.reason ? `\nReason: ${data.reason}` : ''}\n\n${data.refundAmount && data.refundAmount > 0 ? `Refund: $${data.refundAmount.toLocaleString()} CLP\n${data.refundMessage || ''}\n` : ''}If you'd like to reschedule, you can do so from your dashboard.\n\nView my appointments: https://nurea.app/dashboard/appointments`
  }
}

/**
 * Email de nuevo mensaje
 */
export function newMessageEmail(data: {
  patientName: string
  professionalName: string
  messagePreview: string
}): EmailTemplate {
  return {
    subject: `Nuevo mensaje de ${data.professionalName}`,
    subjectEn: `New message from ${data.professionalName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .message-box { background: #f0fdfa; border-left: 4px solid #14b8a6; padding: 15px; margin: 20px 0; border-radius: 4px; font-style: italic; }
          .button { display: inline-block; background: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 12px 12px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 Nuevo Mensaje</h1>
          </div>
          <div class="content">
            <p>Hola ${data.patientName},</p>
            <p><strong>${data.professionalName}</strong> te escribió:</p>
            
            <div class="message-box">
              "${data.messagePreview}"
            </div>
            
            <a href="https://nurea.app/dashboard/chat" class="button">Ver conversación</a>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong> Este chat no es para emergencias médicas. Si tienes una emergencia, llama al 131 o acude a urgencias inmediatamente.
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              Puedes responder desde tu panel de paciente en cualquier momento.
            </p>
          </div>
          <div class="footer">
            <p>NUREA - Conectando pacientes con profesionales de la salud</p>
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    htmlEn: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .message-box { background: #f0fdfa; border-left: 4px solid #14b8a6; padding: 15px; margin: 20px 0; border-radius: 4px; font-style: italic; }
          .button { display: inline-block; background: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 12px 12px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 New Message</h1>
          </div>
          <div class="content">
            <p>Hello ${data.patientName},</p>
            <p><strong>${data.professionalName}</strong> wrote to you:</p>
            
            <div class="message-box">
              "${data.messagePreview}"
            </div>
            
            <a href="https://nurea.app/dashboard/chat" class="button">View conversation</a>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> This chat is not for medical emergencies. If you have an emergency, call 131 or go to the emergency room immediately.
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              You can reply from your patient dashboard at any time.
            </p>
          </div>
          <div class="footer">
            <p>NUREA - Connecting patients with healthcare professionals</p>
            <p>This is an automated email, please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hola ${data.patientName},\n\n${data.professionalName} te envió un mensaje:\n\n"${data.messagePreview}"\n\nVer conversación: https://nurea.app/dashboard/chat\n\n⚠️ Importante: Este chat no es para emergencias médicas. Si tienes una emergencia, llama al 131.`,
    textEn: `Hello ${data.patientName},\n\n${data.professionalName} sent you a message:\n\n"${data.messagePreview}"\n\nView conversation: https://nurea.app/dashboard/chat\n\n⚠️ Important: This chat is not for medical emergencies. If you have an emergency, call 131.`
  }
}

/**
 * Email de pago confirmado
 */
export function paymentConfirmedEmail(data: {
  patientName: string
  amount: number
  currency: string
  appointmentDate?: string
}): EmailTemplate {
  return {
    subject: `Pago confirmado - $${data.amount.toLocaleString()} ${data.currency.toUpperCase()}`,
    subjectEn: `Payment confirmed - $${data.amount.toLocaleString()} ${data.currency.toUpperCase()}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .info-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 12px 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Pago Confirmado</h1>
          </div>
          <div class="content">
            <p>Hola ${data.patientName},</p>
            <p>Tu pago se procesó correctamente.</p>
            
            <div class="info-box">
              <p><strong>Monto:</strong> $${data.amount.toLocaleString()} ${data.currency.toUpperCase()}</p>
              ${data.appointmentDate ? `<p><strong>Para cita del:</strong> ${data.appointmentDate}</p>` : ''}
            </div>
            
            <p>Puedes descargar tu recibo desde tu panel de pagos en cualquier momento.</p>
            
            <a href="https://nurea.app/dashboard/payments" class="button">Ver mis pagos</a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              <strong>Nota importante:</strong> NUREA actúa como intermediario tecnológico. No prestamos servicios médicos directos.
            </p>
          </div>
          <div class="footer">
            <p>NUREA - Conectando pacientes con profesionales de la salud</p>
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    htmlEn: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .info-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 12px 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Payment Confirmed</h1>
          </div>
          <div class="content">
            <p>Hello ${data.patientName},</p>
            <p>Your payment was processed successfully.</p>
            
            <div class="info-box">
              <p><strong>Amount:</strong> $${data.amount.toLocaleString()} ${data.currency.toUpperCase()}</p>
              ${data.appointmentDate ? `<p><strong>For appointment on:</strong> ${data.appointmentDate}</p>` : ''}
            </div>
            
            <p>You can download your receipt from your payments dashboard at any time.</p>
            
            <a href="https://nurea.app/dashboard/payments" class="button">View my payments</a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              <strong>Important note:</strong> NUREA acts as a technology intermediary. We do not provide direct medical services.
            </p>
          </div>
          <div class="footer">
            <p>NUREA - Connecting patients with healthcare professionals</p>
            <p>This is an automated email, please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hola ${data.patientName},\n\nTu pago de $${data.amount.toLocaleString()} ${data.currency.toUpperCase()} ha sido procesado exitosamente.\n\nPuedes descargar tu recibo desde tu panel de pagos.\n\nVer mis pagos: https://nurea.app/dashboard/payments`,
    textEn: `Hello ${data.patientName},\n\nYour payment of $${data.amount.toLocaleString()} ${data.currency.toUpperCase()} has been processed successfully.\n\nYou can download your receipt from your payments dashboard.\n\nView my payments: https://nurea.app/dashboard/payments`
  }
}

