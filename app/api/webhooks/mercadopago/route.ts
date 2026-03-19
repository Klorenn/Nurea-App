import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase credentials not configured");
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || searchParams.get("topic");
    const id = searchParams.get("id") || searchParams.get("data.id");

    if (!id || !type) {
      return NextResponse.json({ received: true });
    }

    console.log(`Mercado Pago Webhook: Type=${type}, ID=${id}`);

    const supabaseAdmin = getSupabaseAdmin();

    if (type === "payment") {
      // 1. Fetch payment details from Mercado Pago
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      });

      if (!response.ok) throw new Error("Failed to fetch payment details");
      const payment = await response.json();

      if (payment.status === "approved") {
        const appointmentId = payment.external_reference;
        const amountTotal = payment.transaction_amount;

        if (appointmentId) {
          console.log(`Confirming appointment: ${appointmentId}`);
          
          // Use the RPC for atomic update (similar to Stripe logic)
          const { error: rpcError } = await supabaseAdmin.rpc("confirm_appointment_payment", {
            p_appointment_id: appointmentId,
            p_stripe_session_id: `mp_${payment.id}`, // Reuse field for MP
            p_payment_intent_id: payment.id.toString(),
            p_amount_total: amountTotal,
            p_commission_rate: 0.05
          });

          if (rpcError) console.error("RPC Error:", rpcError);

          // Update finances table
          await supabaseAdmin.from('finances').insert({
            appointment_id: appointmentId,
            stripe_payment_intent_id: `mp_${payment.id}`,
            total_amount: amountTotal,
            nurea_commission: amountTotal * 0.05,
            professional_payout: amountTotal * 0.95,
            status: 'completed'
          });
        }
      }
    } else if (type === "subscription_preapproval") {
      // Handle subscription updates
      const response = await fetch(`https://api.mercadopago.com/preapproval/${id}`, {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      });

      if (!response.ok) throw new Error("Failed to fetch preapproval details");
      const preapproval = await response.json();

      const userId = preapproval.external_reference;
      if (userId) {
        await supabaseAdmin.from("profiles").update({
          subscription_status: preapproval.status === "authorized" ? "active" : "inactive",
          stripe_subscription_id: `mp_${preapproval.id}`, // Reuse field
        }).eq("id", userId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Mercado Pago Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
