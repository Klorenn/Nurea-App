"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/contexts/language-context"

const C = {
  bg: "oklch(0.985 0.008 150)",
  bgWarm: "oklch(0.97 0.015 85)",
  ink: "oklch(0.22 0.025 170)",
  inkSoft: "oklch(0.42 0.02 170)",
  inkMute: "oklch(0.58 0.015 170)",
  line: "oklch(0.88 0.015 150)",
  lineSoft: "oklch(0.93 0.012 150)",
  sage100: "oklch(0.95 0.025 170)",
  sage300: "oklch(0.78 0.06 170)",
  sage500: "oklch(0.58 0.07 170)",
  sage700: "oklch(0.38 0.05 170)",
  sage900: "oklch(0.22 0.03 170)",
  terracotta: "oklch(0.68 0.11 45)",
  amberSoft: "oklch(0.96 0.035 85)",
  amber: "oklch(0.55 0.1 70)",
}

type PostStatus = "draft" | "published" | "archived"

interface Post {
  id: string
  slug: string
  title: string
  excerpt: string | null
  status: PostStatus
  featured: boolean
  published_at: string | null
  updated_at: string
  created_at: string
  category_id: string | null
  tags: string[] | null
}

interface Category {
  id: string
  slug: string
  name_es: string
}

export default function AdminBlogPage() {
  const supabase = useMemo(() => createClient(), [])
  const { language } = useLanguage()
  const isES = language === "es"

  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filter, setFilter] = useState<"all" | PostStatus>("all")
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  async function load() {
    setLoading(true)
    const [{ data: ps }, { data: cs }] = await Promise.all([
      supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, status, featured, published_at, updated_at, created_at, category_id, tags")
        .order("updated_at", { ascending: false }),
      supabase
        .from("blog_categories")
        .select("id, slug, name_es")
        .order("sort_order", { ascending: true }),
    ])
    setPosts((ps as Post[]) || [])
    setCategories((cs as Category[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function createPost() {
    const title = prompt(isES ? "Título del artículo" : "Article title")
    if (!title || title.trim().length < 3) return
    const slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80)

    const { data, error } = await supabase
      .from("blog_posts")
      .insert({ title, slug, status: "draft" })
      .select()
      .single()

    if (error) {
      alert(error.message)
      return
    }
    window.location.href = `/dashboard/admin/blog/${data.id}`
  }

  async function togglePublish(post: Post) {
    const target: PostStatus = post.status === "published" ? "draft" : "published"
    const { error } = await supabase.rpc("publish_blog_post", {
      p_id: post.id,
      p_status: target,
    })
    if (error) {
      alert(error.message)
      return
    }
    load()
  }

  async function toggleFeatured(post: Post) {
    const { error } = await supabase
      .from("blog_posts")
      .update({ featured: !post.featured })
      .eq("id", post.id)
    if (error) return alert(error.message)
    load()
  }

  async function deletePost(post: Post) {
    if (!confirm(isES ? `¿Eliminar "${post.title}"?` : `Delete "${post.title}"?`)) return
    const { error } = await supabase.from("blog_posts").delete().eq("id", post.id)
    if (error) return alert(error.message)
    load()
  }

  const filtered = posts.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const counts = {
    all: posts.length,
    draft: posts.filter((p) => p.status === "draft").length,
    published: posts.filter((p) => p.status === "published").length,
    archived: posts.filter((p) => p.status === "archived").length,
  }

  return (
    <div
      style={{
        background: C.bgWarm,
        minHeight: "100%",
        padding: "24px 16px 60px",
        fontFamily: "var(--font-inter), ui-sans-serif, system-ui",
        color: C.ink,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
                fontSize: 11,
                color: C.sage700,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.sage500 }} />
              Admin · Blog
            </div>
            <h1
              style={{
                fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
                fontSize: 32,
                fontWeight: 500,
                color: C.sage900,
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              {isES ? "Artículos del blog" : "Blog articles"}
            </h1>
            <p style={{ fontSize: 14, color: C.inkSoft, margin: "6px 0 0" }}>
              {isES
                ? "Escribe, publica y gestiona el contenido público de Nurea."
                : "Write, publish and manage Nurea's public content."}
            </p>
          </div>
          <button
            onClick={createPost}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "none",
              background: C.sage700,
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 8px 20px -10px oklch(0.38 0.05 170 / 0.5)",
            }}
          >
            {isES ? "+ Nuevo artículo" : "+ New article"}
          </button>
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 16,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {(["all", "draft", "published", "archived"] as const).map((f) => {
            const labels = {
              all: isES ? "Todos" : "All",
              draft: isES ? "Borradores" : "Drafts",
              published: isES ? "Publicados" : "Published",
              archived: isES ? "Archivados" : "Archived",
            }
            const active = filter === f
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: `1px solid ${active ? C.sage500 : C.line}`,
                  background: active ? C.sage100 : "white",
                  color: active ? C.sage900 : C.inkSoft,
                  fontSize: 12,
                  fontWeight: active ? 600 : 500,
                  cursor: "pointer",
                }}
              >
                {labels[f]} · {counts[f]}
              </button>
            )
          })}
          <div style={{ flex: 1 }} />
          <input
            type="search"
            placeholder={isES ? "Buscar..." : "Search..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: 240,
              height: 36,
              padding: "0 12px",
              borderRadius: 10,
              border: `1px solid ${C.line}`,
              background: "white",
              fontSize: 13,
              color: C.ink,
              outline: "none",
            }}
          />
        </div>

        {/* List */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            border: `1px solid ${C.lineSoft}`,
            overflow: "hidden",
          }}
        >
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: C.inkMute }}>
              {isES ? "Cargando..." : "Loading..."}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: C.inkMute }}>
              {isES ? "No hay artículos aún." : "No articles yet."}
            </div>
          ) : (
            filtered.map((p, idx) => {
              const cat = categories.find((c) => c.id === p.category_id)
              return (
                <div
                  key={p.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 12,
                    padding: "16px 20px",
                    borderBottom:
                      idx < filtered.length - 1 ? `1px solid ${C.lineSoft}` : "none",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                      <Link
                        href={`/dashboard/admin/blog/${p.id}`}
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: C.ink,
                          textDecoration: "none",
                        }}
                      >
                        {p.title}
                      </Link>
                      <StatusBadge status={p.status} isES={isES} />
                      {p.featured && (
                        <span
                          style={{
                            fontSize: 10,
                            padding: "2px 8px",
                            borderRadius: 999,
                            background: C.amberSoft,
                            color: C.amber,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {isES ? "Destacado" : "Featured"}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: C.inkMute }}>
                      {cat && <>{cat.name_es} · </>}
                      {p.published_at
                        ? `${isES ? "Publicado" : "Published"} ${new Date(p.published_at).toLocaleDateString(isES ? "es-CL" : "en-US")}`
                        : `${isES ? "Actualizado" : "Updated"} ${new Date(p.updated_at).toLocaleDateString(isES ? "es-CL" : "en-US")}`}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => togglePublish(p)}
                      style={iconBtn(p.status === "published" ? C.amber : C.sage700)}
                      title={p.status === "published" ? "Despublicar" : "Publicar"}
                    >
                      {p.status === "published" ? (isES ? "Despublicar" : "Unpublish") : (isES ? "Publicar" : "Publish")}
                    </button>
                    <button
                      onClick={() => toggleFeatured(p)}
                      style={iconBtn(p.featured ? C.amber : C.inkSoft)}
                      title="Featured"
                    >
                      ★
                    </button>
                    <Link
                      href={`/dashboard/admin/blog/${p.id}`}
                      style={{
                        ...iconBtn(C.sage700),
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      {isES ? "Editar" : "Edit"}
                    </Link>
                    <button
                      onClick={() => deletePost(p)}
                      style={iconBtn(C.terracotta)}
                    >
                      {isES ? "Borrar" : "Delete"}
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status, isES }: { status: PostStatus; isES: boolean }) {
  const map = {
    draft: { bg: "oklch(0.95 0.01 60)", fg: "oklch(0.5 0.05 60)", label: isES ? "Borrador" : "Draft" },
    published: { bg: "oklch(0.95 0.03 170)", fg: "oklch(0.38 0.05 170)", label: isES ? "Publicado" : "Published" },
    archived: { bg: "oklch(0.94 0.015 270)", fg: "oklch(0.5 0.03 270)", label: isES ? "Archivado" : "Archived" },
  } as const
  const s = map[status]
  return (
    <span
      style={{
        fontSize: 10,
        padding: "2px 8px",
        borderRadius: 999,
        background: s.bg,
        color: s.fg,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {s.label}
    </span>
  )
}

function iconBtn(color: string): React.CSSProperties {
  return {
    padding: "6px 12px",
    borderRadius: 8,
    border: `1px solid ${color}`,
    background: "white",
    color,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  }
}
