import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 3600 // Cache for 1 hour

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const categorySlug = searchParams.get("category")
    const includeCategories = searchParams.get("includeCategories") === "true"
    const activeOnly = searchParams.get("activeOnly") !== "false"

    let query = supabase
      .from("specialties")
      .select(includeCategories ? "*, categories(*)" : "*")
      .order("sort_order", { ascending: true })

    if (activeOnly) {
      query = query.eq("is_active", true)
    }

    if (categorySlug) {
      const { data: category } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .single()

      if (category) {
        query = query.eq("category_id", category.id)
      }
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Error fetching specialties:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
