import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { SUBSCRIPTION_PRICES, applyDiscount } from "@/lib/pricing"

export async function POST(request: Request) {
  try {
    const { code, isYearly } = await request.json()

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Código requerido" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("referral_codes")
      .select("id, code, discount_percentage, max_uses, uses_count, is_active, description")
      .eq("code", code.trim().toUpperCase())
      .single()

    if (error || !data) {
      return NextResponse.json({ valid: false, error: "Código no encontrado" }, { status: 404 })
    }

    if (!data.is_active) {
      return NextResponse.json({ valid: false, error: "Este código ya no está activo" })
    }

    if (data.uses_count >= data.max_uses) {
      return NextResponse.json({ valid: false, error: "Este código ya alcanzó su límite de usos" })
    }

    const basePrice = isYearly ? SUBSCRIPTION_PRICES.yearly : SUBSCRIPTION_PRICES.monthly
    const discount = data.discount_percentage ?? 0
    const finalPrice = applyDiscount(basePrice, discount)

    return NextResponse.json({
      valid: true,
      code: data.code,
      description: data.description,
      discount_percentage: discount,
      base_price: basePrice,
      final_price: finalPrice,
      is_free: finalPrice === 0,
    })
  } catch (error) {
    console.error("[referral/validate] error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
