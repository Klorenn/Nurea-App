import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { decryptToken } from "@/lib/encryption"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { appointment_id } = await request.json()

    if (!appointment_id) {
      return NextResponse.json({ error: "Missing appointment_id" }, { status: 400 })
    }

    // Fetch appointment and professional details
    const { data: appointment, error: aptError } = await supabase
      .from("appointments")
      .select(`
        *,
        professional:professionals(
          id,
          profiles(
            mp_access_token
          )
        )
      `)
      .eq("id", appointment_id)
      .single()

    if (aptError || !appointment) {
      console.error("Error fetching appointment:", aptError)
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    const doctorProfile = appointment.professional?.profiles
    const encryptedToken = doctorProfile?.mp_access_token

    if (!encryptedToken) {
      return NextResponse.json({ error: "Este doctor aún no acepta pagos por Mercado Pago (cuenta no vinculada)." }, { status: 400 })
    }

    // Decrypt the doctor's token
    const accessToken = decryptToken(encryptedToken)
    if (!accessToken || accessToken === encryptedToken) {
        return NextResponse.json({ error: "Error de configuración de pagos del profesional." }, { status: 500 })
    }

    // Calculate marketplace fee (5%)
    const price = Number(appointment.price)
    const marketplaceFee = Number((price * 0.05).toFixed(2))

    const origin = process.env.NEXT_PUBLIC_SITE_URL || request.headers.get("origin") || "http://localhost:3000"

    // Create Preference
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        items: [
          {
            title: `Cita NUREA - ${appointment.type === 'online' ? 'Teleconsulta' : 'Presencial'}`,
            description: `Consulta médica reservada para NUREA`,
            quantity: 1,
            unit_price: price,
            currency_id: "CLP"
          }
        ],
        marketplace_fee: marketplaceFee,
        back_urls: {
          success: `${origin}/dashboard/patient/appointments?payment=success&apt=${appointment_id}`,
          failure: `${origin}/dashboard/patient/appointments?payment=failure`,
          pending: `${origin}/dashboard/patient/appointments?payment=pending`
        },
        auto_return: "approved",
        metadata: {
          appointment_id,
          patient_id: user.id
        }
      })
    })

    const preference = await response.json()

    if (!response.ok) {
      console.error("Error creating Mercado Pago Preference:", preference)
      return NextResponse.json({ error: "Failed to create payment preference", details: preference }, { status: response.status })
    }

    // Wait, is "init_point" or "sandbox_init_point" returned? Yes.
    return NextResponse.json({
      id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point // usually good to pass back for UI handling
    })
    
  } catch (error) {
    console.error("Split payment Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
