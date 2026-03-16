import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Pre-defined subscription checkout URLs from Mercado Pago
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
    const { planId, isYearly } = await request.json();
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const planUrls = SUBSCRIPTION_URLS[planId as keyof typeof SUBSCRIPTION_URLS];
    if (!planUrls) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const url = isYearly ? planUrls.yearly : planUrls.monthly;

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Mercado Pago subscription error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
