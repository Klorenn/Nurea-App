import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { encryptToken } from "@/lib/encryption"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    
    if (!code) {
      return NextResponse.redirect(new URL("/dashboard/professional/payments?error=NoCode", request.url))
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.redirect(new URL("/login?redirectTo=/dashboard/professional/payments", request.url))
    }

    // Exchange code for tokens
    const clientId = process.env.NEXT_PUBLIC_MP_CLIENT_ID
    const clientSecret = process.env.MP_CLIENT_SECRET
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin
    const redirectUri = `${origin}/api/auth/mercadopago`
    
    if (!clientId || !clientSecret) {
      console.error("Mercado Pago credentials not configured")
      return NextResponse.redirect(new URL("/dashboard/professional/payments?error=MissingConfig", request.url))
    }

    const tokenResponse = await fetch("https://api.mercadopago.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri
      })
    })

    const tokenData = await tokenResponse.json()
    
    if (!tokenResponse.ok) {
      console.error("Mercado Pago token error:", tokenData)
      return NextResponse.redirect(new URL("/dashboard/professional/payments?error=TokenExchangeFailed", request.url))
    }

    // Encrypt tokens before saving
    const encryptedAccess = encryptToken(tokenData.access_token)
    const encryptedRefresh = encryptToken(tokenData.refresh_token)

    // Save configuration to the database (profiles table)
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        mp_access_token: encryptedAccess,
        mp_refresh_token: encryptedRefresh,
        mp_user_id: tokenData.user_id?.toString(),
        mp_public_key: tokenData.public_key,
        mp_token_updated_at: new Date().toISOString()
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Failed to save MP tokens to profile:", updateError)
      return NextResponse.redirect(new URL("/dashboard/professional/payments?error=ProfileUpdateFailed", request.url))
    }

    return NextResponse.redirect(new URL("/dashboard/professional/payments?success=MercadoPagoConnected", request.url))
    
  } catch (error) {
    console.error("Mercado Pago auth handler error:", error)
    return NextResponse.redirect(new URL("/dashboard/professional/payments?error=InternalError", request.url))
  }
}
