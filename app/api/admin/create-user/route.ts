import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const adminKey = searchParams.get("key")

    if (adminKey !== "Dinopau123!") {
      return NextResponse.json({ error: "Invalid key" }, { status: 403 })
    }

    const { email, password, firstName, lastName } = await request.json()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: "admin",
        },
      },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (authData.user) {
      await supabase.from("profiles").update({
        role: "admin",
        is_founder: true,
        founder_title: "Founder & CEO",
        can_respond_feedback: true,
        email_verified: true,
      }).eq("id", authData.user.id)

      return NextResponse.json({ 
        success: true, 
        userId: authData.user.id,
        message: "Admin user created successfully" 
      })
    }

    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  } catch (error) {
    console.error("[create-admin-user]", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}