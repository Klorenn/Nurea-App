import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { code } = await req.json()

    if (!code) {
      return NextResponse.json({ message: "Code is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return NextResponse.json({ 
        valid: false, 
        message: "Código inválido o agotado. Solicita tu acceso en nuestra lista de espera." 
      }, { status: 404 })
    }

    if (data.uses_count >= data.max_uses) {
      return NextResponse.json({ 
        valid: false, 
        message: "Código inválido o agotado. Solicita tu acceso en nuestra lista de espera." 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      valid: true, 
      message: "Acceso concedido."
    })

  } catch (error) {
    console.error("Invite verification error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
