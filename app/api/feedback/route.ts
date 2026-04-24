import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "50")

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, can_respond_feedback")
      .eq("id", user.id)
      .single()

    let query = supabase
      .from("feedback")
      .select("*, user:profiles(first_name, last_name, avatar_url)")
      .order("created_at", { ascending: false })

    if (profile?.role === "admin" || profile?.can_respond_feedback) {
      if (status) query = query.eq("status", status)
    } else {
      query = query.eq("user_id", user.id)
    }

    const { data: feedback, error } = await query.limit(limit)

    if (error) throw error

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error("[feedback GET]", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const { rating, comment, category } = await request.json()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("feedback")
      .insert({
        user_id: user.id,
        rating,
        comment,
        category: category || "experience",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ feedback: data })
  } catch (error) {
    console.error("[feedback POST]", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { id, status, response } = await request.json()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, can_respond_feedback")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin" && !profile?.can_respond_feedback) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (response) {
      updateData.response = response
      updateData.responded_by = user.id
      updateData.status = "responded"
    }

    const { data, error } = await supabase
      .from("feedback")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ feedback: data })
  } catch (error) {
    console.error("[feedback PATCH]", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}