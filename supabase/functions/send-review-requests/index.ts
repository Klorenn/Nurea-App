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

    // 3. Find completed appointments that ended ~30-60 minutes ago
    const now = new Date()
    const currentMs = now.getTime()
    
    // We look for appointments completed today
    const today = now.toISOString().split('T')[0]

    const { data: appointments, error: fetchError } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        appointment_time,
        duration_minutes,
        status,
        review_request_sent,
        patient:profiles!appointments_patient_id_fkey(first_name, last_name, email),
        professional:professionals!appointments_professional_id_fkey(
          profile:profiles!professionals_id_fkey(first_name, last_name)
        )
      `)
      .eq('status', 'completed')
      .eq('review_request_sent', false)
      .eq('appointment_date', today)

    if (fetchError) {
      console.error('Error fetching appointments:', fetchError)
      throw new Error('Failed to fetch appointments')
    }

    let emailsSent = 0

    if (!appointments || appointments.length === 0) {
      return new Response(JSON.stringify({ message: 'No pending review requests', emailsSent: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    for (const appt of appointments) {
      const startTimeStr = `${appt.appointment_date}T${appt.appointment_time || '00:00:00'}`
      // Parse with Chilean offset (assumed matching DB logic)
      const startMs = new Date(startTimeStr + '-03:00').getTime() 
      const durationMs = (appt.duration_minutes || 60) * 60 * 1000
      const endMs = startMs + durationMs
      const thirtyMinsAfterEnd = endMs + 30 * 60 * 1000

      // If CURRENT time is at least 30 mins after end, send the request
      if (currentMs >= thirtyMinsAfterEnd) {
        const patientData = (Array.isArray(appt.patient) ? appt.patient[0] : appt.patient) as any
        const proData = (Array.isArray(appt.professional) ? appt.professional[0] : appt.professional) as any
        const proProfile = (Array.isArray(proData?.profile) ? proData?.profile[0] : proData?.profile) as any

        const patientName = patientData?.first_name || 'Paciente'
        const patientEmail = patientData?.email
        const doctorLastName = proProfile?.last_name || 'especialista'

        if (!patientEmail) continue

        const reviewLink = `https://nurea.app/dashboard/patient/appointments?review=${appt.id}`

        const htmlBody = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 24px; overflow: hidden; padding: 20px;">
          <div style="text-align: center; padding: 20px;">
            <span style="font-size: 40px;">🤩</span>
          </div>
          <div style="padding: 10px 24px; text-align: center;">
            <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 900; text-transform: uppercase;">¡Hola ${patientName}!</h1>
            <p style="font-size: 16px; margin: 16px 0; line-height: 1.5; color: #64748b;">
              ¿Cómo te fue hoy con el/la <strong>Dr/a. ${doctorLastName}</strong>? 
            </p>
            <p style="font-size: 14px; margin-bottom: 32px; color: #94a3b8;">
              Tu opinión nos ayuda a mantener la calidad y excelencia en NUREA. ¡Solo te tomará un par de segundos!
            </p>
            <div style="text-align: center;">
              <a href="${reviewLink}" style="background-color: #0d9488; color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(13, 148, 136, 0.2);">Calificar Atención</a>
            </div>
          </div>
          <div style="padding: 24px; text-align: center; border-top: 1px solid #f1f5f9; margin-top: 32px;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">NUREA Health — Calidad Humana en Salud Digital</p>
          </div>
        </div>
        `

        if (resendApiKey) {
          try {
            await resend.emails.send({
              from: 'NUREA <hola@nurea.app>',
              to: [patientEmail],
              subject: `✨ ¿Cómo estuvo tu atención con el Dr/a. ${doctorLastName}?`,
              html: htmlBody,
            })
            
            // Mark as sent
            await supabase
              .from('appointments')
              .update({ review_request_sent: true })
              .eq('id', appt.id)

            console.log(`Review request email sent for appointment ${appt.id}`)
            emailsSent++
          } catch (emailErr) {
            console.error(`Error sending email to ${patientEmail}:`, emailErr)
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true, emailsSent }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    console.error('Edge Function Error:', err)
    return new Response(JSON.stringify({ error: 'Internal Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
