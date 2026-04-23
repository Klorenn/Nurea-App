import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET /api/forum/posts - Listar posts (con filtros)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get("post_id")
    const categoryId = searchParams.get("category_id")
    const authorId = searchParams.get("author_id")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    const supabase = await createClient()

    let query = supabase
      .from("forum_posts")
      .select(`
        *,
        author:profiles!forum_posts_author_id_fkey(
          id, first_name, last_name, avatar_url, role
        ),
        category:forum_categories(name, slug, color)
      `, { count: "exact" })
      .eq("status", "active")

    if (postId) {
      query = query.eq("id", postId)
    }

    if (categoryId) {
      query = query.eq("category_id", categoryId)
    }

    if (authorId) {
      query = query.eq("author_id", authorId)
    }

    const { data: posts, error, count } = await query
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Error fetching posts:", error)
      return NextResponse.json({ error: "Error fetching posts" }, { status: 500 })
    }

    return NextResponse.json({ 
      posts: posts || [], 
      total: count || 0 
    })
  } catch (error) {
    console.error("Forum posts error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

// POST /api/forum/posts - Crear nuevo post
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { category_id, title, content } = body

    if (!category_id || !title || !content) {
      return NextResponse.json(
        { error: "missing_fields", message: "Category, title and content are required" },
        { status: 400 }
      )
    }

    const categoryUuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!categoryUuidRegex.test(category_id)) {
      return NextResponse.json(
        { error: "invalid_category", message: "category_id must be a valid UUID" },
        { status: 400 }
      )
    }

    const { data: post, error } = await supabase
      .from("forum_posts")
      .insert({
        category_id,
        author_id: user.id,
        title,
        content,
        status: "active",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating post:", error)
      return NextResponse.json({ error: "Error creating post" }, { status: 500 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Forum create post error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}