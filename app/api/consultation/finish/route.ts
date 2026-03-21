import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getResend, sendSingleWithRetry, buildIdempotencyKey } from "@/lib/resend"
import { render } from "@react-email/render"
import PrescriptionEmail from "@/components/emails/PrescriptionEmail"
import { jsPDF } from "jspdf"
import QRCode from "qrcode"

/**
 * POST /api/consultation/finish
 * 
 * Finalizes a consultation:
 * 1. Generates a PDF prescription.
 * 2. Uploads it to Supabase Storage.
 * 3. Records it in the database.
 * 4. Sends an email to the patient via Resend.
 * 5. Completes the appointment and releases funds.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Auth + role check (must be before reading body to fail fast)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const { data: callerProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (callerProfile?.role !== 'professional') {
      return NextResponse.json({ error: "forbidden", message: "Solo los profesionales pueden finalizar consultas." }, { status: 403 })
    }

    const { appointmentId, evolutions, prescriptionItems } = await request.json()

    if (!appointmentId) {
      return NextResponse.json({ error: "missing_id" }, { status: 400 })
    }

    // 2. Fetch full context
    const { data: appointment, error: aptError } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:profiles!appointments_patient_id_fkey(*),
        professional:professionals(
          *,
          profile:profiles(*)
        )
      `)
      .eq('id', appointmentId)
      .single()

    if (aptError || !appointment) {
      return NextResponse.json({ error: "appointment_not_found" }, { status: 404 })
    }

    // Verify caller is the professional on this appointment
    if (appointment.professional_id !== user.id) {
      return NextResponse.json({ error: "forbidden", message: "No eres el profesional de esta cita." }, { status: 403 })
    }

    // 3. Generate PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    })

    const patientName = `${appointment.patient.first_name} ${appointment.patient.last_name}`
    const doctorName = `Dr. ${appointment.professional.profile.first_name} ${appointment.professional.profile.last_name}`
    const specialty = appointment.professional.specialty || "Médico General"
    const rnpi = appointment.professional.registration_number || "N/A"
    const dateStr = new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })
    const verificationUrl = `https://nurea.app/verify/${appointmentId}`

    // --- PDF Design ---
    // Header
    pdf.setFillColor(13, 148, 136) // Teal-600
    pdf.rect(0, 0, 210, 40, "F")
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(24)
    pdf.setFont("helvetica", "bold")
    pdf.text("NUREA", 20, 25)
    pdf.setFontSize(10)
    pdf.text("RECETA MÉDICA ELECTRÓNICA", 20, 32)

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(12)
    pdf.text(doctorName, 190, 20, { align: "right" })
    pdf.setFontSize(9)
    pdf.text(specialty, 190, 26, { align: "right" })
    pdf.text(`RNPI: ${rnpi}`, 190, 31, { align: "right" })

    // Body
    pdf.setTextColor(30, 41, 59)
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "bold")
    pdf.text("INFORMACIÓN DEL PACIENTE", 20, 55)
    pdf.setFont("helvetica", "normal")
    pdf.text(`Nombre: ${patientName}`, 20, 62)
    pdf.text(`Fecha: ${dateStr}`, 190, 62, { align: "right" })

    pdf.setDrawColor(226, 232, 240)
    pdf.line(20, 68, 190, 68)

    pdf.setFont("helvetica", "bold")
    pdf.text("PRESCRIPCIÓN", 20, 80)

    let y = 90
    if (prescriptionItems && prescriptionItems.length > 0) {
      prescriptionItems.forEach((item: any, idx: number) => {
        pdf.setFont("helvetica", "bold")
        pdf.text(`${idx + 1}. ${item.name}`, 25, y)
        pdf.setFont("helvetica", "normal")
        pdf.text(`Dosis: ${item.dosage} | Duración: ${item.duration}`, 25, y + 5)
        y += 15
        if (y > 250) {
            pdf.addPage()
            y = 20
        }
      })
    } else {
      pdf.text("No se registraron medicamentos en esta sesión.", 25, y)
    }

    // Footer & QR
    const qrDataUrl = await QRCode.toDataURL(verificationUrl)
    pdf.addImage(qrDataUrl, "PNG", 20, 260, 25, 25)
    
    pdf.setFontSize(8)
    pdf.setTextColor(100, 116, 139)
    pdf.text("Documento generado electrónicamente en la plataforma NUREA.", 50, 268)
    pdf.text("Válido sin firma manuscrita según Ley 20.584.", 50, 273)
    pdf.text(`Código de Verificación: ${appointmentId.slice(0, 8).toUpperCase()}`, 50, 278)

    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"))

    // 4. Upload to Supabase Storage
    const fileName = `${appointment.patient_id}/${appointmentId}.pdf`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('prescriptions')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) {
      console.error("Storage upload error:", uploadError)
      throw uploadError
    }

    // 5. Database: Save Prescription & Medical Record
    const { error: recordError } = await supabase
      .from('medical_records')
      .upsert({
        appointment_id: appointmentId,
        patient_id: appointment.patient_id,
        professional_id: user.id || '',
        chief_complaint: evolutions.anamnesis,
        treatment: evolutions.plan,
        vital_signs: { physical_exam: evolutions.physical_exam },
        prescription: JSON.stringify(prescriptionItems),
        is_draft: false,
        is_signed: true,
        signed_at: new Date().toISOString()
      }, { onConflict: 'appointment_id' })

    const { error: prescError } = await supabase
      .from('prescriptions')
      .upsert({
        appointment_id: appointmentId,
        patient_id: appointment.patient_id,
        professional_id: user.id || '',
        pdf_url: fileName,
        qr_code_content: verificationUrl
      }, { onConflict: 'appointment_id' })

    // 6. Send Email
    const resend = getResend()
    const emailHtml = await render(
      PrescriptionEmail({
        patientName: appointment.patient.first_name,
        doctorName: doctorName,
        appointmentDate: dateStr,
        portalUrl: `https://nurea.app/dashboard/patient/documents`,
        reviewUrl: `https://nurea.app/dashboard/patient/appointments?review=${appointmentId}`
      })
    )

    const { error: emailError } = await sendSingleWithRetry(
      resend,
      {
        from: process.env.SECURITY_EMAIL_FROM || "Nurea <salud@nurea.app>",
        to: [appointment.patient.email],
        subject: `Tu receta médica - Consulta con ${doctorName}`,
        html: emailHtml,
        attachments: [
          {
            filename: `Receta_Nurea_${appointmentId.slice(0, 8)}.pdf`,
            content: pdfBuffer,
          },
        ],
      },
      buildIdempotencyKey("prescription", appointmentId)
    )

    // 7. Complete Appointment (Release funds)
    await supabase.rpc('complete_appointment_and_release_funds', {
      p_appointment_id: appointmentId
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Error finishing consultation:", error)
    return NextResponse.json({ error: "internal_error", message: (error as any).message }, { status: 500 })
  }
}
