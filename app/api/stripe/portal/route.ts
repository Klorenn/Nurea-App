import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured")
  }
  return new Stripe(key, {
    apiVersion: "2024-12-18.acacia",
  })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single()

    if (profileError || !profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No tienes una suscripción activa" },
        { status: 400 }
      )
    }

    const stripe = getStripeClient()
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    request.headers.get("origin") || 
                    "http://localhost:3000"

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${baseUrl}/dashboard/professional/settings`,
    })

    return NextResponse.json({ url: session.url })

  } catch (error) {
    console.error("Portal session error:", error)
    return NextResponse.json(
      { error: "Error al acceder al portal de facturación" },
      { status: 500 }
    )
  }
}
