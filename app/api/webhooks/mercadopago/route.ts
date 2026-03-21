import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createHmac } from "crypto"

const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Supabase credentials not configured")
  return createClient(url, key, { auth: { persistSession: false } })
}

/**
 * Validates the MercadoPago webhook signature.
 * MP sends: x-signature header → "ts=<timestamp>,v1=<hmac>"
 * The signed message is: "id:<dataId>;request-id:<xRequestId>;ts:<ts>;"
 * Ref: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 */
function validateMpSignature(request: NextRequest, dataId: string): boolean {
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  // If no secret is configured, skip validation (development mode).
  if (!webhookSecret) return true

  const xSignature = request.headers.get("x-signature") || ""
  const xRequestId = request.headers.get("x-request-id") || ""

  // Parse ts and v1 from "ts=<timestamp>,v1=<hmac>"
  const parts = Object.fromEntries(
    xSignature.split(",").map((part) => {
      const [k, v] = part.split("=")
      return [k?.trim(), v?.trim()]
    })
  )
  const ts = parts["ts"]
  const v1 = parts["v1"]

  if (!ts || !v1) return false

  const signedTemplate = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const expectedHmac = createHmac("sha256", webhookSecret)
    .update(signedTemplate)
    .digest("hex")

  return expectedHmac === v1
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { searchParams } = new URL(request.url)

    // MercadoPago sends both query params and body — normalize
    const type: string =
      body?.type || body?.topic ||
      searchParams.get("type") || searchParams.get("topic") || ""
    const dataId: string =
      body?.data?.id ||
      searchParams.get("id") || searchParams.get("data.id") || ""

    console.log(`[mp-webhook] type=${type} id=${dataId}`)

    if (!dataId || !type) {
      return NextResponse.json({ received: true })
    }

    // Validate webhook signature before processing (prevents spoofed events).
    if (!validateMpSignature(request, dataId)) {
      console.error("[mp-webhook] Invalid signature — rejecting webhook")
      return NextResponse.json({ error: "invalid_signature" }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()

    // ── Suscripción (pre-approval) ─────────────────────────────────────────
    if (type === "subscription_preapproval") {
      const res = await fetch(`https://api.mercadopago.com/preapproval/${dataId}`, {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      })
      if (!res.ok) throw new Error(`MP preapproval fetch failed: ${res.status}`)
      const preapproval = await res.json()

      const profileId: string | undefined = preapproval.external_reference
      const newStatus = preapproval.status === "authorized" ? "active" : "inactive"

      if (profileId) {
        await supabase
          .from("profiles")
          .update({
            subscription_status: newStatus,
            stripe_subscription_id: `mp_${preapproval.id}`,
          })
          .eq("id", profileId)

        // Si la suscripción se activó con un código de referido, incrementar uses_count
        if (preapproval.status === "authorized") {
          const referralCodeId: string | undefined = preapproval.metadata?.referral_code_id
          if (referralCodeId) {
            await supabase.rpc("increment_referral_uses", { p_code_id: referralCodeId })
          }
        }
      }
    }

    // ── Pago de suscripción ────────────────────────────────────────────────
    if (type === "payment") {
      const res = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      })
      if (!res.ok) throw new Error(`MP payment fetch failed: ${res.status}`)
      const payment = await res.json()

      const preapprovalId: string | undefined =
        payment.metadata?.preapproval_id || payment.preapproval_id

      // Si tiene preapproval_id es un pago de suscripción NUREA
      if (preapprovalId) {
        // Lookup profile by mp preapproval
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, email")
          .eq("stripe_subscription_id", `mp_${preapprovalId}`)
          .maybeSingle()

        const paymentStatus =
          payment.status === "approved" ? "approved" :
          payment.status === "pending"  ? "pending"  :
          payment.status === "rejected" ? "rejected" : "cancelled"

        await supabase.from("nurea_subscription_payments").insert({
          profile_id: profile?.id ?? null,
          mp_payment_id: payment.id?.toString(),
          mp_preapproval_id: preapprovalId,
          amount: payment.transaction_amount ?? 0,
          currency: (payment.currency_id ?? "CLP").toUpperCase(),
          status: paymentStatus,
          payer_email: payment.payer?.email ?? profile?.email ?? null,
        })

        // Activate profile on approved payment
        if (payment.status === "approved" && profile?.id) {
          await supabase
            .from("profiles")
            .update({ subscription_status: "active" })
            .eq("id", profile.id)
        }
      } else {
        // Legacy: appointment payment (old marketplace model — keep for safety)
        if (payment.status === "approved" && payment.external_reference) {
          const { error } = await supabase.rpc("confirm_appointment_payment", {
            p_appointment_id: payment.external_reference,
            p_stripe_session_id: `mp_${payment.id}`,
            p_payment_intent_id: payment.id?.toString(),
            p_amount_total: payment.transaction_amount ?? 0,
            p_commission_rate: 0,
          })
          if (error) console.error("[mp-webhook] confirm_appointment_payment RPC error:", error)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("[mp-webhook] error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
