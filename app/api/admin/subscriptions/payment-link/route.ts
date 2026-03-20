import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createDynamicSubscription } from "@/lib/mercadopago"
import { SUBSCRIPTION_PRICES } from "@/lib/pricing"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Admin-only
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const { data: caller } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
    if (caller?.role !== "admin") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    const { profileId, isYearly = false } = await req.json()
    if (!profileId) return NextResponse.json({ error: "missing profileId" }, { status: 400 })

    // Get professional's email and name
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", profileId)
      .single()

    if (profileErr || !profile?.email) {
      return NextResponse.json({ error: "profile_not_found" }, { status: 404 })
    }

    const amount = isYearly ? SUBSCRIPTION_PRICES.yearly : SUBSCRIPTION_PRICES.monthly
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://nurea.cl"

    const preapproval = await createDynamicSubscription({
      payer_email: profile.email,
      back_url: `${appUrl}/dashboard/professional`,
      reason: `Nurea Pro${isYearly ? " Anual" : " Mensual"} — ${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim(),
      transaction_amount: amount,
      frequency: isYearly ? 12 : 1,
      frequency_type: "months",
      external_reference: profileId,
      metadata: {
        profile_id: profileId,
        plan: isYearly ? "yearly" : "monthly",
        created_by_admin: user.id,
      },
    })

    // Mark profile as pending payment so we can track it
    await supabase
      .from("profiles")
      .update({ subscription_status: "pending_payment" })
      .eq("id", profileId)

    return NextResponse.json({
      url: preapproval.init_point,
      preapprovalId: preapproval.id,
      amount,
      currency: "CLP",
      isYearly,
      professionalEmail: profile.email,
    })
  } catch (err: any) {
    console.error("[admin/subscriptions/payment-link]", err?.message ?? err)
    return NextResponse.json({ error: err.message ?? "internal_error" }, { status: 500 })
  }
}
