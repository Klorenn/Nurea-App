import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 3600 // Cache for 1 hour

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const includeSpecialties = searchParams.get("includeSpecialties") === "true"
    const withCounts = searchParams.get("withCounts") === "true"

    // Fetch categories
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })

    if (catError) {
      return NextResponse.json(
        { error: catError.message },
        { status: 500 }
      )
    }

    // If we don't need specialties, return just categories
    if (!includeSpecialties) {
      return NextResponse.json(categories, {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      })
    }

    // Fetch all active specialties
    const { data: specialties, error: specError } = await supabase
      .from("specialties")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    if (specError) {
      return NextResponse.json(
        { error: specError.message },
        { status: 500 }
      )
    }

    // If we need professional counts
    let professionalCounts: Record<string, number> = {}
    if (withCounts) {
      const { data: counts, error: countError } = await supabase
        .from("professional_specialties")
        .select("specialty_id")

      if (!countError && counts) {
        counts.forEach((item) => {
          professionalCounts[item.specialty_id] = 
            (professionalCounts[item.specialty_id] || 0) + 1
        })
      }
    }

    // Group specialties by category
    const result = categories.map((category) => ({
      ...category,
      specialties: specialties
        .filter((s) => s.category_id === category.id)
        .map((s) => ({
          ...s,
          professional_count: withCounts ? (professionalCounts[s.id] || 0) : undefined,
        })),
    }))

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
