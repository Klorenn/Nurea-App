import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia" as any,
})

export async function POST(request: Request) {
  try {
    const { planId, isYearly } = await request.json()
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Map plan IDs to price IDs (normally these would be in DB or env)
    const priceIds: Record<string, { monthly: string; yearly: string }> = {
      professional: {
        monthly: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY || "price_professional_m",
        yearly: process.env.STRIPE_PRICE_PROFESSIONAL_YEARLY || "price_professional_y",
      },
      graduate: {
        monthly: process.env.STRIPE_PRICE_GRADUATE_MONTHLY || "price_graduate_m",
        yearly: process.env.STRIPE_PRICE_GRADUATE_YEARLY || "price_graduate_y",
      },
    }

    const priceId = isYearly ? priceIds[planId]?.yearly : priceIds[planId]?.monthly

    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/professional?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
      metadata: {
        userId: user.id,
        planId,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Stripe subscription error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
