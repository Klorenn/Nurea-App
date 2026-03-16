import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { Resend } from "npm:resend@3.2.0"

// Configure Resend
const resendApiKey = Deno.env.get('RESEND_API_KEY')
const resend = new Resend(resendApiKey)

serve(async (req) => {
  try {
    // 1. Verify Authorization
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('Unauthorized request: No Authorization header')
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 2. Initialize Supabase Admin Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 3. Find appointments starting in 60-65 minutes
    // Fetch upcoming confirmed appointments for the next 24 hours to filter in memory
    const now = new Date()
    const currentMs = now.getTime()
    const lowerBoundMs = currentMs + 60 * 60 * 1000 // 60 mins from now
    const upperBoundMs = currentMs + 65 * 60 * 1000 // 65 mins from now

    // We will fetch for today and tomorrow to cover UTC boundary
    const today = new Date(currentMs).toISOString().split('T')[0]
    const tomorrow = new Date(currentMs + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const { data: appointments, error: fetchError } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        appointment_time,
        patient:profiles!appointments_patient_id_fkey(first_name, last_name, email),
        professional:professionals!appointments_professional_id_fkey(
          profile:profiles!professionals_id_fkey(first_name, last_name)
        )
      `)
      .eq('status', 'confirmed')
      .in('appointment_date', [today, tomorrow])

    if (fetchError) {
      console.error('Error fetching appointments:', fetchError)
      throw new Error('Failed to fetch appointments')
    }

    let emailsSent = 0

    if (!appointments || appointments.length === 0) {
      console.log('No confirmed appointments found for the relevant dates.')
      return new Response(JSON.stringify({ message: 'No pending appointments', emailsSent: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    for (const appt of appointments) {
      const dateTimeStr = `${appt.appointment_date}T${appt.appointment_time || '00:00:00'}`
      // Assume local Chilean time for the stored date/time if no timezone, or UTC if timezone. 
      // For precision, here we parse it as local time if we append offset, or parse as is.
      // Easiest is to treat it as local Chilean time (UTC-3 or UTC-4).
      // Assuming the DB stores it in a way that when parsed it matches the appointment start time
      const apptMs = new Date(dateTimeStr + '-03:00').getTime() 

      if (apptMs >= lowerBoundMs && apptMs <= upperBoundMs) {
        // This appointment starts in 60-65 minutes!
        const patientData = (Array.isArray(appt.patient) ? appt.patient[0] : appt.patient) as any
        const proData = (Array.isArray(appt.professional) ? appt.professional[0] : appt.professional) as any
        const proProfile = (Array.isArray(proData?.profile) ? proData?.profile[0] : proData?.profile) as any

        const patientName = patientData?.first_name || 'Paciente'
        const patientEmail = patientData?.email
        const doctorName = proProfile?.first_name 
          ? `${proProfile.first_name} ${proProfile.last_name || ''}`.trim()
          : 'Especialista'

        if (!patientEmail) {
          console.log(`Skipping appointment ${appt.id} due to missing patient email`)
          continue
        }

        const htmlBody = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #0d9488; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">NUREA | Tu Centro de Salud Digital</h1>
          </div>
          <div style="padding: 32px 24px;">
            <p style="font-size: 16px; margin-bottom: 24px;">Hola <strong>${patientName}</strong>,</p>
            <p style="font-size: 16px; margin-bottom: 32px; line-height: 1.5;">
              Este es un recordatorio de tu cita con el/la <strong>Dr/a. ${doctorName}</strong> que comenzará en breve (1 hora). Puedes acceder a la sala de consulta desde tu panel de NUREA.
            </p>
            <div style="text-align: center;">
              <a href="https://nurea.app/dashboard/appointments" style="background-color: #0d9488; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Ver Cita</a>
            </div>
          </div>
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280; margin: 0;">NUREA Health © ${new Date().getFullYear()}. Todos los derechos reservados.</p>
          </div>
        </div>
        `

        if (resendApiKey) {
          try {
            await resend.emails.send({
              from: 'NUREA <hola@nurea.app>', // Update with your verified domain
              to: [patientEmail],
              subject: '⏳ Recordatorio: Tu cita en NUREA comienza en 1 hora',
              html: htmlBody,
            })
            console.log(`Email sent for appointment ${appt.id} to ${patientEmail}`)
            emailsSent++
          } catch (emailErr) {
            console.error(`Error sending email to ${patientEmail}:`, emailErr)
          }
        } else {
          console.warn('RESEND_API_KEY missing, skipping email send.')
        }
      }
    }

    console.log(`Cron Execution Completed. Total emails sent: ${emailsSent}`)

    return new Response(JSON.stringify({ 
      success: true, 
      emailsSent 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    console.error('Edge Function Error:', err)
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
