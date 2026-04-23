import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET /api/forum/replies - Listar respuestas de un post
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get("post_id")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    if (!postId) {
      return NextResponse.json({ error: "post_id required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: replies, error } = await supabase
      .from("forum_replies")
      .select(`
        *,
        author:profiles!forum_replies_author_id_fkey(
          id, first_name, last_name, avatar_url, role
        )
      `)
      .eq("post_id", postId)
      .order("is_best_answer", { ascending: false })
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Error fetching replies:", error)
      return NextResponse.json({ error: "Error fetching replies" }, { status: 500 })
    }

    return NextResponse.json({ replies: replies || [] })
  } catch (error) {
    console.error("Forum replies error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

// POST /api/forum/replies - Crear respuesta
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { post_id, content } = body

    if (!post_id || !content) {
      return NextResponse.json(
        { error: "missing_fields", message: "post_id and content are required" },
        { status: 400 }
      )
    }

    // Crear la respuesta y devolver autor para pintar inmediatamente en UI
    const { data: reply, error } = await supabase
      .from("forum_replies")
      .insert({
        post_id,
        author_id: user.id,
        content,
      })
      .select(`
        *,
        author:profiles!forum_replies_author_id_fkey(
          id, first_name, last_name, avatar_url, role
        )
      `)
      .single()

    if (error) {
      console.error("Error creating reply:", error)
      return NextResponse.json({ error: "Error creating reply" }, { status: 500 })
    }

    // Actualizar conteo de respuestas en el post (sin depender de RPC opcional)
    const { data: postCountData } = await supabase
      .from("forum_posts")
      .select("replies_count")
      .eq("id", post_id)
      .single()

    if (typeof postCountData?.replies_count === "number") {
      await supabase
        .from("forum_posts")
        .update({ replies_count: postCountData.replies_count + 1 })
        .eq("id", post_id)
    }

    // Obtener info del autor del post para la notificación
    const { data: post } = await supabase
      .from("forum_posts")
      .select("author_id, title")
      .eq("id", post_id)
      .single()

    // Notificar al autor del post (si no es el mismo que responde)
    if (post?.author_id && post.author_id !== user.id) {
      const { data: author } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .single()

      const responderName = author?.first_name || "Alguien"

      await supabase.from("notifications").insert({
        user_id: post.author_id,
        type: "forum_reply",
        title: "Nueva respuesta en tu pregunta",
        message: `${responderName} ha respondido a "${post.title.slice(0, 50)}..."`,
        action_url: `/dashboard/forum/post/${post_id}`,
      })
    }

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("Forum create reply error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}