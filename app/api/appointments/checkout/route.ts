import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"
import { getJitsiMeetingUrl } from "@/lib/utils/jitsi"

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured")
  }
  return new Stripe(key, {
    apiVersion: "2024-12-18.acacia",
  })
}

/**
 * POST /api/appointments/checkout
 * Creates a Stripe Checkout Session for an appointment payment
 * 
 * Body: {
 *   professionalId: string
 *   appointmentDate: string (YYYY-MM-DD)
 *   appointmentTime: string (HH:MM)
 *   type: "online" | "in-person"
 *   duration: number (minutes)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: "unauthorized", message: "Debes iniciar sesión para agendar." },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      professionalId, 
      appointmentDate, 
      appointmentTime, 
      type = "online",
      duration = 60 
    } = body

    if (!professionalId || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { error: "missing_fields", message: "Faltan campos requeridos." },
        { status: 400 }
      )
    }

    // Get patient profile
    const { data: patientProfile, error: patientError } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email")
      .eq("id", user.id)
      .single()

    if (patientError || !patientProfile) {
      return NextResponse.json(
        { error: "profile_not_found", message: "Perfil no encontrado." },
        { status: 404 }
      )
    }

    // Get professional info and pricing
    const { data: professional, error: proError } = await supabase
      .from("professionals")
      .select(`
        id,
        online_price,
        in_person_price,
        consultation_price,
        profile:profiles!professionals_id_fkey(first_name, last_name, email)
      `)
      .eq("id", professionalId)
      .single()

    if (proError || !professional) {
      return NextResponse.json(
        { error: "professional_not_found", message: "Profesional no encontrado." },
        { status: 404 }
      )
    }

    // Determine price
    let price = professional.consultation_price || 45000
    if (type === "online" && professional.online_price) {
      price = professional.online_price
    } else if (type === "in-person" && professional.in_person_price) {
      price = professional.in_person_price
    }

    // Convert to integer cents for Stripe
    const priceInCents = Math.round(price)

    const professionalProfile = professional.profile as { first_name: string; last_name: string } | null
    const professionalName = professionalProfile 
      ? `Dr. ${professionalProfile.first_name || ''} ${professionalProfile.last_name || ''}`.trim()
      : 'Profesional de Salud'

    const patientName = `${patientProfile.first_name || ''} ${patientProfile.last_name || ''}`.trim() || 'Paciente'

    // Create pending appointment
    const appointmentId = crypto.randomUUID()
    const meetingLink = type === "online" ? getJitsiMeetingUrl(appointmentId) : null

    const { error: appointmentError } = await supabase
      .from("appointments")
      .insert({
        id: appointmentId,
        patient_id: user.id,
        professional_id: professionalId,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime.length === 5 ? `${appointmentTime}:00` : appointmentTime,
        duration_minutes: duration,
        type,
        status: "pending",
        is_online: type === "online",
        payment_status: "pending",
        price: price,
        meeting_link: meetingLink,
      })

    if (appointmentError) {
      console.error("Error creating appointment:", appointmentError)
      return NextResponse.json(
        { error: "appointment_creation_failed", message: "No se pudo crear la cita." },
        { status: 500 }
      )
    }

    // Create Stripe Checkout Session
    const stripe = getStripeClient()
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    // Format date for display
    const dateObj = new Date(`${appointmentDate}T${appointmentTime}`)
    const formattedDate = dateObj.toLocaleDateString("es-CL", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
    const formattedTime = appointmentTime.slice(0, 5)

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "clp",
            product_data: {
              name: `Consulta con ${professionalName}`,
              description: `${type === "online" ? "Telemedicina" : "Presencial"} • ${formattedDate} a las ${formattedTime}`,
              images: ["https://nurea.app/logo-icon.png"],
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      customer_email: patientProfile.email || user.email,
      client_reference_id: appointmentId,
      metadata: {
        appointmentId,
        patientId: user.id,
        professionalId,
        appointmentDate,
        appointmentTime,
        type,
        patientName,
        professionalName,
      },
      success_url: `${baseUrl}/dashboard/appointments?payment=success&appointment=${appointmentId}`,
      cancel_url: `${baseUrl}/professionals/${professionalId}?payment=cancelled`,
      locale: "es",
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    })

    // Update appointment with Stripe session ID
    await supabase
      .from("appointments")
      .update({
        payment_status: "pending",
      })
      .eq("id", appointmentId)

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
      appointmentId,
    })

  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { 
        error: "checkout_failed", 
        message: error instanceof Error ? error.message : "Error al procesar el pago." 
      },
      { status: 500 }
    )
  }
}
