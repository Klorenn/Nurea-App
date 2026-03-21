import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== "string") {
      return NextResponse.json({ exists: false, verified: false })
    }

    const supabase = await createClient()
    const { data } = await supabase
      .from("profiles")
      .select("email_verified")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle()

    if (!data) return NextResponse.json({ exists: false, verified: false })
    return NextResponse.json({ exists: true, verified: data.email_verified === true })
  } catch {
    return NextResponse.json({ exists: false, verified: false })
  }
}
