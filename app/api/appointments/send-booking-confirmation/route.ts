import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { Resend } from "resend"
import React from "react"
import { BookingConfirmation } from "@/components/emails/BookingConfirmation"
import { BookingConfirmationProfessional } from "@/components/emails/BookingConfirmationProfessional"
import { getJitsiMeetingUrl } from "@/lib/utils/jitsi"

const FROM = process.env.EMAIL_FROM || "NUREA <onboarding@resend.dev>"

/**
 * POST /api/appointments/send-booking-confirmation
 * Envía correos al paciente (recibo + link videollamada) y al profesional (nueva cita).
 * Llamado tras confirmar la cita (p. ej. después de que el Smart Contract bloquee los fondos).
 * Si Resend falla, no se devuelve error al cliente: la cita ya está guardada.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const appointmentId = body.appointmentId ?? body.appointment_id

    if (!appointmentId || typeof appointmentId !== "string") {
      return NextResponse.json(
        { message: "Falta appointmentId." },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ message: "No autorizado." }, { status: 401 })
    }

    const { data: appointment, error: appError } = await supabase
      .from("appointments")
      .select("id, patient_id, professional_id, appointment_date, appointment_time, type, status")
      .eq("id", appointmentId)
      .single()

    if (appError || !appointment) {
      return NextResponse.json({ message: "Cita no encontrada." }, { status: 404 })
    }

    const isPatient = appointment.patient_id === user.id
    const isProfessional = appointment.professional_id === user.id
    if (!isPatient && !isProfessional) {
      return NextResponse.json({ message: "No tienes permiso para esta cita." }, { status: 403 })
    }

    const { data: patientProfile } = await supabase
      .from("profiles")
      .select("first_name, last_name, email")
      .eq("id", appointment.patient_id)
      .single()

    const { data: professionalProfile } = await supabase
      .from("profiles")
      .select("first_name, last_name, email")
      .eq("id", appointment.professional_id)
      .single()

    const patientName = patientProfile
      ? `${patientProfile.first_name || ""} ${patientProfile.last_name || ""}`.trim() || "Paciente"
      : "Paciente"
    const doctorName = professionalProfile
      ? `Dr. ${professionalProfile.first_name || ""} ${professionalProfile.last_name || ""}`.trim() || "Profesional"
      : "Profesional"
    const professionalName = professionalProfile
      ? `${professionalProfile.first_name || ""} ${professionalProfile.last_name || ""}`.trim() || "Profesional"
      : "Profesional"

    const appointmentDateObj = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`)
    const date = appointmentDateObj.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    const time = String(appointment.appointment_time).slice(0, 5)

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error("[send-booking-confirmation] RESEND_API_KEY no configurada. Correos no enviados.")
      return NextResponse.json({ success: true, sent: false, reason: "email_not_configured" })
    }

    const resend = new Resend(apiKey)
    const meetingLink = appointment.type === "online" ? getJitsiMeetingUrl(appointmentId) : null

    let patientSent = false
    let professionalSent = false

    try {
      if (patientProfile?.email) {
        const { data, error } = await resend.emails.send({
          from: FROM,
          to: [patientProfile.email],
          subject: `Tu cita con ${doctorName} está confirmada — Nurea`,
          react: React.createElement(BookingConfirmation, {
            patientName,
            doctorName,
            date,
            time,
            meetingLink,
          }),
        })
        if (error) {
          console.error("[send-booking-confirmation] Error email paciente:", error)
        } else {
          patientSent = true
        }
      }
    } catch (e) {
      console.error("[send-booking-confirmation] Excepción enviando email al paciente:", e)
    }

    try {
      if (professionalProfile?.email) {
        const { error } = await resend.emails.send({
          from: FROM,
          to: [professionalProfile.email],
          subject: `Nueva cita agendada: ${patientName} — Nurea`,
          react: React.createElement(BookingConfirmationProfessional, {
            professionalName,
            patientName,
            date,
            time,
            isOnline: appointment.type === "online",
          }),
        })
        if (error) {
          console.error("[send-booking-confirmation] Error email profesional:", error)
        } else {
          professionalSent = true
        }
      }
    } catch (e) {
      console.error("[send-booking-confirmation] Excepción enviando email al profesional:", e)
    }

    return NextResponse.json({
      success: true,
      sent: patientSent || professionalSent,
      patientSent,
      professionalSent,
    })
  } catch (e) {
    console.error("[send-booking-confirmation]", e)
    return NextResponse.json({ success: true, sent: false })
  }
}
