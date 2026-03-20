import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createDynamicSubscription } from "@/lib/mercadopago";
import { SUBSCRIPTION_PRICES, applyDiscount } from "@/lib/pricing";

// Pre-defined subscription checkout URLs (no referral code — full price)
const SUBSCRIPTION_URLS = {
  professional: {
    monthly: "https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=c55649f0007c43b98ee64b4251c6369b",
    yearly: "https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=cf97d59445eb48aab64351036decd779",
  },
  graduate: {
    monthly: "https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=c55649f0007c43b98ee64b4251c6369b",
    yearly: "https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=cf97d59445eb48aab64351036decd779",
  },
};

export async function POST(request: Request) {
  try {
    const { planId, isYearly, referralCode } = await request.json();
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Sin código → URL estática (flujo normal) ─────────────────────────────
    if (!referralCode) {
      const planUrls = SUBSCRIPTION_URLS[planId as keyof typeof SUBSCRIPTION_URLS];
      if (!planUrls) {
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
      }
      return NextResponse.json({ url: isYearly ? planUrls.yearly : planUrls.monthly });
    }

    // ── Con código → validar y crear suscripción dinámica con descuento ───────
    const { data: codeData, error: codeError } = await supabase
      .from("referral_codes")
      .select("id, discount_percentage, max_uses, uses_count, is_active")
      .eq("code", referralCode.trim().toUpperCase())
      .single();

    if (codeError || !codeData) {
      return NextResponse.json({ error: "Código de referido no encontrado" }, { status: 404 });
    }
    if (!codeData.is_active) {
      return NextResponse.json({ error: "El código ya no está activo" }, { status: 400 });
    }
    if (codeData.uses_count >= codeData.max_uses) {
      return NextResponse.json({ error: "El código ha alcanzado su límite de usos" }, { status: 400 });
    }

    const basePrice = isYearly ? SUBSCRIPTION_PRICES.yearly : SUBSCRIPTION_PRICES.monthly;
    const discount = codeData.discount_percentage ?? 0;
    const finalPrice = applyDiscount(basePrice, discount);

    // Obtener email del usuario para el payer
    const { data: { user: freshUser } } = await supabase.auth.getUser();
    const payerEmail = freshUser?.email ?? "";

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://nurea.cl";

    const preapproval = await createDynamicSubscription({
      payer_email: payerEmail,
      back_url: `${appUrl}/dashboard`,
      reason: `Nurea Pro${isYearly ? " Anual" : " Mensual"} — Código ${referralCode.toUpperCase()}`,
      transaction_amount: finalPrice,
      frequency: 1,
      frequency_type: isYearly ? "months" : "months", // MP no soporta "years"; usamos 12 meses
      external_reference: user.id,
      metadata: {
        referral_code: referralCode.trim().toUpperCase(),
        referral_code_id: codeData.id,
        profile_id: user.id,
        discount_percentage: String(discount),
      },
    });

    return NextResponse.json({ url: preapproval.init_point });
  } catch (error: any) {
    console.error("Mercado Pago subscription error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
