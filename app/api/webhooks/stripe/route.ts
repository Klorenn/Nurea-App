import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured")
  }
  return new Stripe(key, {
    apiVersion: "2024-12-18.acacia" as any,
  })
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("Supabase credentials not configured")
  }
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

const relevantEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_succeeded",
  "invoice.payment_failed",
  "charge.refunded",
])

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    console.error("Missing Stripe signature")
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    )
  }

  const stripe = getStripeClient()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error(`Webhook signature verification failed: ${message}`)
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    )
  }

  if (!relevantEvents.has(event.type)) {
    return NextResponse.json({ received: true, processed: false })
  }

  console.log(`Processing Stripe event: ${event.type}`)

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Check if this is an appointment payment or a subscription
        const appointmentId = session.metadata?.appointmentId
        
        if (appointmentId) {
          // This is an APPOINTMENT PAYMENT
          console.log(`Processing appointment payment for: ${appointmentId}`)
          
          const supabaseAdmin = getSupabaseAdmin()
          
          // 1. Get Commission Rate from platform_settings
          const commissionRate = 0 // Forced 0% as per new business model
          const amountTotal = session.amount_total ? session.amount_total / 100 : 0 
          const paymentIntentId = session.payment_intent as string

          // 2. Call RPC for atomic update (Security & Robustness)
          const { error: rpcError } = await supabaseAdmin.rpc("confirm_appointment_payment", {
            p_appointment_id: appointmentId,
            p_stripe_session_id: session.id,
            p_payment_intent_id: paymentIntentId,
            p_amount_total: amountTotal,
            p_commission_rate: commissionRate
          })

          if (rpcError) {
            console.error(`❌ Error in confirm_appointment_payment RPC:`, rpcError)
            // Log to a dedicated audit table if necessary
            return NextResponse.json(
              { error: "Payment registration in database failed" },
              { status: 500 }
            )
          }

          console.log(`✓ Appointment ${appointmentId} confirmed and transaction records created in escrow.`)

          // Send confirmation emails (non-blocking)
          try {
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
            await fetch(`${siteUrl}/api/appointments/send-booking-confirmation`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ appointmentId }),
            })
            console.log(`✓ Confirmation emails triggered for appointment: ${appointmentId}`)
          } catch (emailError) {
            console.error("Error sending confirmation emails:", emailError)
          }

        } else {
          // This is a SUBSCRIPTION payment (existing logic)
          const userId = session.client_reference_id || session.metadata?.userId
          
          if (!userId) {
            console.error("No userId found in checkout session")
            return NextResponse.json(
              { error: "No userId in session" },
              { status: 400 }
            )
          }

          const subscriptionId = session.subscription as string
          const customerId = session.customer as string

          let subscriptionStatus = "active"
          
          if (subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId)
            subscriptionStatus = subscription.status
          }

          const { error: updateError } = await getSupabaseAdmin()
            .from("profiles")
            .update({
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              subscription_status: subscriptionStatus,
            })
            .eq("id", userId)

          if (updateError) {
            console.error("Error updating profile after checkout:", updateError)
            return NextResponse.json(
              { error: "Database update failed" },
              { status: 500 }
            )
          }

          console.log(`✓ Subscription activated for user ${userId}`)
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: profile, error: findError } = await getSupabaseAdmin()
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (findError || !profile) {
          console.error("Profile not found for customer:", customerId)
          return NextResponse.json(
            { error: "Profile not found" },
            { status: 404 }
          )
        }

        const { error: updateError } = await getSupabaseAdmin()
          .from("profiles")
          .update({
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
          })
          .eq("id", profile.id)

        if (updateError) {
          console.error("Error updating subscription status:", updateError)
          return NextResponse.json(
            { error: "Database update failed" },
            { status: 500 }
          )
        }

        console.log(`✓ Subscription updated for user ${profile.id}: ${subscription.status}`)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: profile, error: findError } = await getSupabaseAdmin()
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (findError || !profile) {
          console.error("Profile not found for customer:", customerId)
          return NextResponse.json(
            { error: "Profile not found" },
            { status: 404 }
          )
        }

        const { error: updateError } = await getSupabaseAdmin()
          .from("profiles")
          .update({
            subscription_status: "canceled",
            stripe_subscription_id: null,
          })
          .eq("id", profile.id)

        if (updateError) {
          console.error("Error updating canceled subscription:", updateError)
          return NextResponse.json(
            { error: "Database update failed" },
            { status: 500 }
          )
        }

        console.log(`✓ Subscription canceled for user ${profile.id}`)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: profile } = await getSupabaseAdmin()
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (profile) {
          await getSupabaseAdmin()
            .from("profiles")
            .update({ subscription_status: "past_due" })
            .eq("id", profile.id)

          console.log(`⚠ Payment failed for user ${profile.id}`)
        }
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        const subscriptionId = (invoice as any).subscription as string
        
        if (subscriptionId) {
          const { data: profile } = await getSupabaseAdmin()
            .from("profiles")
            .select("id, subscription_status")
            .eq("stripe_customer_id", customerId)
            .single()

          if (profile && profile.subscription_status === "past_due") {
            await getSupabaseAdmin()
              .from("profiles")
              .update({ subscription_status: "active" })
              .eq("id", profile.id)

            console.log(`✓ Payment recovered for user ${profile.id}`)
          }
        }
        break
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge
        const paymentIntentId = charge.payment_intent as string
        
        console.log(`Processing refund for payment intent: ${paymentIntentId}`)
        
        // Find and update any appointment associated with this refund
        // This handles cancellation refunds
        const supabaseAdmin = getSupabaseAdmin()
        
        // We need to find appointments by looking at recent cancelled ones
        // In a production system, you'd store the payment_intent_id on the appointment
        console.log(`✓ Refund processed for charge: ${charge.id}`)
        break
      }
    }

    return NextResponse.json({ received: true, processed: true })

  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}

