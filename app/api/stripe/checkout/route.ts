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
        { error: "No autenticado. Por favor inicia sesión." },
        { status: 401 }
      )
    }

    const { priceId } = await request.json()

    if (!priceId) {
      return NextResponse.json(
        { error: "Se requiere el ID del plan (priceId)" },
        { status: 400 }
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, first_name, last_name, stripe_customer_id")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Perfil no encontrado" },
        { status: 404 }
      )
    }

    if (profile.role !== "professional") {
      return NextResponse.json(
        { error: "Solo los profesionales pueden suscribirse a planes" },
        { status: 403 }
      )
    }

    const stripe = getStripeClient()
    let stripeCustomerId = profile.stripe_customer_id

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || undefined,
        metadata: {
          supabase_user_id: user.id,
          role: profile.role,
        },
      })
      stripeCustomerId = customer.id

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", user.id)

      if (updateError) {
        console.error("Error updating stripe_customer_id:", updateError)
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    request.headers.get("origin") || 
                    "http://localhost:3000"

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard/professional?subscription=success`,
      cancel_url: `${baseUrl}/precios?subscription=canceled`,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        userEmail: user.email || "",
        userName: `${profile.first_name || ""} ${profile.last_name || ""}`.trim(),
      },
      subscription_data: {
        metadata: {
          userId: user.id,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      locale: "es",
    })

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id 
    })

  } catch (error) {
    console.error("Stripe checkout error:", error)
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Error de Stripe: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
