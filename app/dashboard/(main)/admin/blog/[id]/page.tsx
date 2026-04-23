"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/contexts/language-context"

const C = {
  bgWarm: "oklch(0.97 0.015 85)",
  ink: "oklch(0.22 0.025 170)",
  inkSoft: "oklch(0.42 0.02 170)",
  inkMute: "oklch(0.58 0.015 170)",
  line: "oklch(0.88 0.015 150)",
  lineSoft: "oklch(0.93 0.012 150)",
  sage100: "oklch(0.95 0.025 170)",
  sage500: "oklch(0.58 0.07 170)",
  sage700: "oklch(0.38 0.05 170)",
  sage900: "oklch(0.22 0.03 170)",
  terracotta: "oklch(0.68 0.11 45)",
}

interface Category {
  id: string
  slug: string
  name_es: string
}

// Convertidor markdown -> HTML muy simple (para preview y almacenamiento paralelo)
function mdToHtml(md: string): string {
  if (!md) return ""
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  // Headings
  html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>")
  html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>")
  html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>")

  // Bold / italic
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>")

  // Images ![alt](url)
  html = html.replace(
    /!\[(.*?)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" style="max-width:100%;border-radius:12px;margin:16px 0;" />'
  )

  // Links
  html = html.replace(/\[(.+?)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')

  // Unordered lists
  html = html.replace(/(^|\n)([-*]\s+.+(?:\n[-*]\s+.+)*)/g, (_m, pre, block) => {
    const items = block
      .split("\n")
      .map((l: string) => l.replace(/^[-*]\s+/, "").trim())
      .filter(Boolean)
      .map((i: string) => `<li>${i}</li>`)
      .join("")
    return `${pre}<ul>${items}</ul>`
  })

  // Paragraphs (two newlines)
  const blocks = html.split(/\n{2,}/).map((b) => {
    const t = b.trim()
    if (!t) return ""
    if (/^<(h\d|ul|ol|p|img|blockquote)/.test(t)) return t
    return `<p>${t.replace(/\n/g, "<br/>")}</p>`
  })
  return blocks.join("\n")
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80)
}

function estimateReadingMinutes(md: string): number {
  const words = md.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

export default function AdminBlogEditorPage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id
  const { language } = useLanguage()
  const isES = language === "es"

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [contentMd, setContentMd] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [tagsInput, setTagsInput] = useState("")
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [seoTitle, setSeoTitle] = useState("")
  const [seoDescription, setSeoDescription] = useState("")
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft")
  const [featured, setFeatured] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      const [{ data: post }, { data: cats }] = await Promise.all([
        supabase.from("blog_posts").select("*").eq("id", id).maybeSingle(),
        supabase
          .from("blog_categories")
          .select("id, slug, name_es")
          .order("sort_order", { ascending: true }),
      ])
      setCategories((cats as Category[]) || [])
      if (post) {
        setTitle(post.title || "")
        setSlug(post.slug || "")
        setExcerpt(post.excerpt || "")
        setContentMd(post.content_md || "")
        setCategoryId(post.category_id || "")
        setTagsInput((post.tags || []).join(", "))
        setCoverUrl(post.cover_url || null)
        setSeoTitle(post.seo_title || "")
        setSeoDescription(post.seo_description || "")
        setStatus(post.status || "draft")
        setFeatured(!!post.featured)
      }
      setLoading(false)
    })()
  }, [id, supabase])

  async function save(nextStatus?: "draft" | "published" | "archived") {
    if (!id) return
    setSaving(true)
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)

      const html = mdToHtml(contentMd)

      const payload: any = {
        title,
        slug: slug || slugify(title),
        excerpt,
        content_md: contentMd,
        content_html: html,
        cover_url: coverUrl,
        category_id: categoryId || null,
        tags,
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
        featured,
        reading_minutes: estimateReadingMinutes(contentMd),
      }

      const { error: updErr } = await supabase.from("blog_posts").update(payload).eq("id", id)
      if (updErr) throw updErr

      if (nextStatus && nextStatus !== status) {
        const { error: pubErr } = await supabase.rpc("publish_blog_post", {
          p_id: id,
          p_status: nextStatus,
        })
        if (pubErr) throw pubErr
        setStatus(nextStatus)
      }

      alert(isES ? "Guardado ✓" : "Saved ✓")
    } catch (e: any) {
      alert(e.message || "Error")
    } finally {
      setSaving(false)
    }
  }

  async function uploadCover(file: File) {
    if (!id) return
    setUploadingCover(true)
    try {
      const ext = file.name.split(".").pop() || "jpg"
      const path = `covers/${id}_${Date.now()}.${ext}`
      const { error } = await supabase.storage.from("blog").upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from("blog").getPublicUrl(path)
      setCoverUrl(data.publicUrl)
    } catch (e: any) {
      alert(e.message || "Error subiendo portada")
    } finally {
      setUploadingCover(false)
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "grid",
          placeItems: "center",
          color: C.inkMute,
          fontFamily: "var(--font-inter), ui-sans-serif, system-ui",
        }}
      >
        {isES ? "Cargando..." : "Loading..."}
      </div>
    )
  }

  return (
    <div
      style={{
        background: C.bgWarm,
        minHeight: "100%",
        padding: "24px 16px 80px",
        fontFamily: "var(--font-inter), ui-sans-serif, system-ui",
        color: C.ink,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Top toolbar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <Link
            href="/dashboard/admin/blog"
            style={{ color: C.inkSoft, fontSize: 13, textDecoration: "none" }}
          >
            ← {isES ? "Volver a artículos" : "Back to articles"}
          </Link>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setPreviewMode((v) => !v)} style={btnGhost}>
              {previewMode ? (isES ? "Editar" : "Edit") : (isES ? "Preview" : "Preview")}
            </button>
            <button onClick={() => save()} disabled={saving} style={btnSecondary}>
              {saving ? (isES ? "Guardando..." : "Saving...") : (isES ? "Guardar borrador" : "Save draft")}
            </button>
            {status !== "published" ? (
              <button onClick={() => save("published")} disabled={saving} style={btnPrimary}>
                {isES ? "Publicar" : "Publish"}
              </button>
            ) : (
              <button onClick={() => save("draft")} disabled={saving} style={btnSecondary}>
                {isES ? "Despublicar" : "Unpublish"}
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
          {/* Main editor */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              border: `1px solid ${C.lineSoft}`,
              padding: 24,
            }}
          >
            {!previewMode ? (
              <>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    if (!slug) setSlug(slugify(e.target.value))
                  }}
                  placeholder={isES ? "Título del artículo" : "Article title"}
                  style={{
                    width: "100%",
                    border: "none",
                    outline: "none",
                    fontFamily: "var(--font-fraunces), serif",
                    fontSize: 28,
                    fontWeight: 500,
                    color: C.sage900,
                    marginBottom: 10,
                    background: "transparent",
                  }}
                />
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="mi-articulo-slug"
                  style={{
                    ...textInput,
                    fontFamily: "var(--font-mono), ui-monospace, monospace",
                    fontSize: 12,
                    color: C.inkMute,
                    marginBottom: 18,
                  }}
                />
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value.slice(0, 280))}
                  placeholder={isES ? "Resumen corto (máx 280 caracteres)" : "Short excerpt (max 280 chars)"}
                  rows={2}
                  style={{ ...textInput, minHeight: 60, resize: "vertical", marginBottom: 18 }}
                />

                <div style={{ fontSize: 11, color: C.inkMute, marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
                  {isES ? "Contenido" : "Content"} (markdown)
                </div>
                <textarea
                  value={contentMd}
                  onChange={(e) => setContentMd(e.target.value)}
                  placeholder={isES ? "# Título\n\nEscribe tu artículo en markdown. Soporta **negrita**, *itálica*, listas, enlaces, imágenes..." : "# Title\n\nWrite your article in markdown. Supports **bold**, *italic*, lists, links, images..."}
                  rows={20}
                  style={{
                    ...textInput,
                    fontFamily: "var(--font-mono), ui-monospace, monospace",
                    fontSize: 14,
                    lineHeight: 1.6,
                    minHeight: 400,
                    resize: "vertical",
                  }}
                />
                <div style={{ fontSize: 12, color: C.inkMute, marginTop: 6 }}>
                  {estimateReadingMinutes(contentMd)} {isES ? "min de lectura · ~" : "min read · ~"}
                  {contentMd.trim().split(/\s+/).length} {isES ? "palabras" : "words"}
                </div>
              </>
            ) : (
              <div>
                {coverUrl && (
                  <img
                    src={coverUrl}
                    alt={title}
                    style={{ width: "100%", borderRadius: 12, marginBottom: 20 }}
                  />
                )}
                <h1
                  style={{
                    fontFamily: "var(--font-fraunces), serif",
                    fontSize: 36,
                    fontWeight: 500,
                    color: C.sage900,
                    margin: "0 0 8px",
                  }}
                >
                  {title || (isES ? "Sin título" : "Untitled")}
                </h1>
                {excerpt && (
                  <p style={{ fontSize: 16, color: C.inkSoft, lineHeight: 1.5, marginBottom: 20 }}>
                    {excerpt}
                  </p>
                )}
                <article
                  style={{ fontSize: 16, lineHeight: 1.7, color: C.ink }}
                  dangerouslySetInnerHTML={{ __html: mdToHtml(contentMd) }}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside style={{ display: "grid", gap: 16 }}>
            <SidebarCard title={isES ? "Estado" : "Status"}>
              <StatusBadge status={status} isES={isES} />
            </SidebarCard>

            <SidebarCard title={isES ? "Portada" : "Cover"}>
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt="Cover"
                  style={{
                    width: "100%",
                    borderRadius: 10,
                    marginBottom: 8,
                    aspectRatio: "16 / 9",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "16 / 9",
                    borderRadius: 10,
                    background: C.lineSoft,
                    display: "grid",
                    placeItems: "center",
                    color: C.inkMute,
                    fontSize: 12,
                    marginBottom: 8,
                  }}
                >
                  {isES ? "Sin portada" : "No cover"}
                </div>
              )}
              <label
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "8px",
                  borderRadius: 8,
                  border: `1px dashed ${C.line}`,
                  cursor: "pointer",
                  fontSize: 12,
                  color: C.inkSoft,
                }}
              >
                {uploadingCover ? (isES ? "Subiendo..." : "Uploading...") : (isES ? "Subir imagen" : "Upload image")}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])}
                  style={{ display: "none" }}
                />
              </label>
              {coverUrl && (
                <button onClick={() => setCoverUrl(null)} style={{ ...btnGhost, width: "100%", marginTop: 6 }}>
                  {isES ? "Quitar portada" : "Remove cover"}
                </button>
              )}
            </SidebarCard>

            <SidebarCard title={isES ? "Categoría" : "Category"}>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={textInput}>
                <option value="">{isES ? "Sin categoría" : "None"}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_es}
                  </option>
                ))}
              </select>
            </SidebarCard>

            <SidebarCard title="Tags">
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder={isES ? "salud, chile, nutrición" : "health, chile, nutrition"}
                style={textInput}
              />
              <div style={{ fontSize: 11, color: C.inkMute, marginTop: 4 }}>
                {isES ? "Separa con comas" : "Comma separated"}
              </div>
            </SidebarCard>

            <SidebarCard title={isES ? "Destacado" : "Featured"}>
              <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                {isES ? "Aparece en destacados de la landing" : "Show on landing featured"}
              </label>
            </SidebarCard>

            <SidebarCard title="SEO">
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value.slice(0, 60))}
                placeholder={isES ? "Título SEO (60 chars)" : "SEO title (60 chars)"}
                style={{ ...textInput, marginBottom: 8 }}
              />
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value.slice(0, 160))}
                placeholder={isES ? "Descripción SEO (160 chars)" : "SEO description (160 chars)"}
                rows={3}
                style={{ ...textInput, minHeight: 70, resize: "vertical" }}
              />
            </SidebarCard>
          </aside>
        </div>
      </div>
    </div>
  )
}

function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 12,
        border: `1px solid ${C.lineSoft}`,
        padding: 14,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: C.inkMute,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 10,
          fontFamily: "var(--font-mono), ui-monospace, monospace",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}

function StatusBadge({ status, isES }: { status: string; isES: boolean }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    draft: { bg: "oklch(0.95 0.01 60)", fg: "oklch(0.5 0.05 60)", label: isES ? "Borrador" : "Draft" },
    published: { bg: "oklch(0.95 0.03 170)", fg: "oklch(0.38 0.05 170)", label: isES ? "Publicado" : "Published" },
    archived: { bg: "oklch(0.94 0.015 270)", fg: "oklch(0.5 0.03 270)", label: isES ? "Archivado" : "Archived" },
  }
  const s = map[status] || map.draft
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        padding: "4px 10px",
        borderRadius: 999,
        background: s.bg,
        color: s.fg,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {s.label}
    </span>
  )
}

const textInput: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: `1px solid ${C.line}`,
  background: "white",
  color: C.ink,
  fontSize: 13,
  outline: "none",
  fontFamily: "inherit",
}

const btnPrimary: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 10,
  border: "none",
  background: C.sage700,
  color: "white",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
}

const btnSecondary: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 10,
  border: `1px solid ${C.line}`,
  background: "white",
  color: C.ink,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
}

const btnGhost: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: 8,
  border: `1px solid ${C.line}`,
  background: "transparent",
  color: C.inkSoft,
  fontSize: 12,
  fontWeight: 500,
  cursor: "pointer",
}
