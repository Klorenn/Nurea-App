import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 3600 // Cache for 1 hour

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const includeSpecialties =
      searchParams.get("includeSpecialties") === "true" ||
      searchParams.get("include_specialties") === "true"
    const withCounts =
      searchParams.get("withCounts") === "true" ||
      searchParams.get("with_counts") === "true"

    // Fetch categories
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })

    if (catError) {
      return NextResponse.json(
        { success: false, message: catError.message },
        { status: 500 }
      )
    }

    const list = Array.isArray(categories) ? categories : []

    // If we don't need specialties, return categories in the shape the client expects
    if (!includeSpecialties) {
      return NextResponse.json(
        { success: true, categories: list },
        {
          headers: {
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        }
      )
    }

    // Fetch all active specialties
    const { data: specialties, error: specError } = await supabase
      .from("specialties")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    if (specError) {
      return NextResponse.json(
        { success: false, message: specError.message },
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

    const specialtiesList = Array.isArray(specialties) ? specialties : []

    // Group specialties by category
    const result = list.map((category) => ({
      ...category,
      specialties: specialtiesList
        .filter((s) => s.category_id === category.id)
        .map((s) => ({
          ...s,
          professional_count: withCounts ? (professionalCounts[s.id] || 0) : undefined,
        })),
    }))

    return NextResponse.json({ success: true, categories: result }, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
