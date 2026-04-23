import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET /api/forum/categories - Listar categorías
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: categories, error } = await supabase
      .from("forum_categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    if (error) {
      console.error("Error fetching categories:", error)
      return NextResponse.json({ error: "Error fetching categories" }, { status: 500 })
    }

    // Obtener conteo de posts por categoría
    const { data: counts } = await supabase
      .from("forum_posts")
      .select("category_id, id")
      .eq("status", "active")

    const categoryCounts: Record<string, number> = {}
    counts?.forEach((item) => {
      categoryCounts[item.category_id] = (categoryCounts[item.category_id] || 0) + 1
    })

    const categoriesWithCount = categories?.map((cat) => ({
      ...cat,
      posts_count: categoryCounts[cat.id] || 0,
    }))

    return NextResponse.json({ categories: categoriesWithCount })
  } catch (error) {
    console.error("Forum categories error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}