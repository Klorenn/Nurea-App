import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export const revalidate = 60
export const dynamic = "force-dynamic"

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
}

interface BlogPostFull {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content_md: string | null
  content_html: string | null
  cover_url: string | null
  tags: string[] | null
  category_id: string | null
  author_id: string | null
  reading_minutes: number | null
  seo_title: string | null
  seo_description: string | null
  featured: boolean
  published_at: string | null
  updated_at: string
}

interface CategoryRow {
  id: string
  slug: string
  name_es: string
  color: string | null
}

interface AuthorRow {
  id: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
}

interface RelatedPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  cover_url: string | null
  reading_minutes: number | null
  published_at: string | null
}

function formatDate(value: string | null): string {
  if (!value) return ""
  try {
    return new Date(value).toLocaleDateString("es-CL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  } catch {
    return ""
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

// Fallback markdown→html if content_html is empty (matches admin editor logic).
function mdToHtml(md: string): string {
  if (!md) return ""
  const lines = md.split(/\r?\n/)
  const out: string[] = []
  let inList = false
  let inOrdered = false

  function closeLists() {
    if (inList) {
      out.push("</ul>")
      inList = false
    }
    if (inOrdered) {
      out.push("</ol>")
      inOrdered = false
    }
  }

  function inline(str: string): string {
    let s = escapeHtml(str)
    s = s.replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" />')
    s = s.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    s = s.replace(/\*(.+?)\*/g, "<em>$1</em>")
    s = s.replace(/`([^`]+?)`/g, "<code>$1</code>")
    return s
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()

    if (!line.trim()) {
      closeLists()
      continue
    }

    if (line.startsWith("### ")) {
      closeLists()
      out.push(`<h3>${inline(line.slice(4))}</h3>`)
      continue
    }
    if (line.startsWith("## ")) {
      closeLists()
      out.push(`<h2>${inline(line.slice(3))}</h2>`)
      continue
    }
    if (line.startsWith("# ")) {
      closeLists()
      out.push(`<h1>${inline(line.slice(2))}</h1>`)
      continue
    }
    if (line.startsWith("> ")) {
      closeLists()
      out.push(`<blockquote>${inline(line.slice(2))}</blockquote>`)
      continue
    }
    if (/^\s*[-*]\s+/.test(line)) {
      if (inOrdered) {
        out.push("</ol>")
        inOrdered = false
      }
      if (!inList) {
        out.push("<ul>")
        inList = true
      }
      out.push(`<li>${inline(line.replace(/^\s*[-*]\s+/, ""))}</li>`)
      continue
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      if (inList) {
        out.push("</ul>")
        inList = false
      }
      if (!inOrdered) {
        out.push("<ol>")
        inOrdered = true
      }
      out.push(`<li>${inline(line.replace(/^\s*\d+\.\s+/, ""))}</li>`)
      continue
    }

    closeLists()
    out.push(`<p>${inline(line)}</p>`)
  }
  closeLists()
  return out.join("\n")
}

async function loadPost(slug: string) {
  const supabase = await createClient()

  const { data: postData } = await supabase
    .from("blog_posts")
    .select(
      "id, slug, title, excerpt, content_md, content_html, cover_url, tags, category_id, author_id, reading_minutes, seo_title, seo_description, featured, published_at, updated_at"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle()

  const post = postData as BlogPostFull | null
  if (!post) return { post: null, category: null, author: null, related: [] as RelatedPost[] }

  const [{ data: catData }, authorResult] = await Promise.all([
    post.category_id
      ? supabase
          .from("blog_categories")
          .select("id, slug, name_es, color")
          .eq("id", post.category_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    post.author_id
      ? supabase
          .from("profiles")
          .select("id, first_name, last_name, avatar_url")
          .eq("id", post.author_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const category = (catData as CategoryRow) || null
  const author = ((authorResult as { data: AuthorRow | null })?.data) || null

  let relatedQuery = supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, cover_url, reading_minutes, published_at")
    .eq("status", "published")
    .neq("id", post.id)
    .order("published_at", { ascending: false })
    .limit(3)

  if (post.category_id) {
    relatedQuery = relatedQuery.eq("category_id", post.category_id)
  }

  const { data: relatedData } = await relatedQuery
  const related = (relatedData as RelatedPost[]) || []

  return { post, category, author, related }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { post } = await loadPost(slug)

  if (!post) {
    return {
      title: "Artículo no encontrado | NUREA",
    }
  }

  const title = post.seo_title || post.title
  const description = post.seo_description || post.excerpt || undefined

  return {
    title: `${title} | NUREA`,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.published_at || undefined,
      images: post.cover_url ? [{ url: post.cover_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.cover_url ? [post.cover_url] : undefined,
    },
  }
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { post, category, author, related } = await loadPost(slug)

  if (!post) notFound()

  const html = post.content_html && post.content_html.trim().length > 0
    ? post.content_html
    : mdToHtml(post.content_md || "")

  const authorName = author
    ? [author.first_name, author.last_name].filter(Boolean).join(" ") || "Equipo NUREA"
    : "Equipo NUREA"

  return (
    <main style={{ background: C.bg, minHeight: "100vh", color: C.ink }}>
      <article>
        {/* Header */}
        <header
          style={{
            background: C.bgWarm,
            borderBottom: `1px solid ${C.line}`,
            padding: "44px 28px 56px",
          }}
        >
          <div style={{ maxWidth: 820, margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 22,
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              <Link href="/" style={{ color: C.sage700, textDecoration: "none" }}>
                Nurea
              </Link>
              <span style={{ color: C.inkMute }}>/</span>
              <Link href="/blog" style={{ color: C.sage700, textDecoration: "none" }}>
                Blog
              </Link>
              {category && (
                <>
                  <span style={{ color: C.inkMute }}>/</span>
                  <Link
                    href={`/blog?categoria=${category.slug}`}
                    style={{ color: C.inkSoft, textDecoration: "none" }}
                  >
                    {category.name_es}
                  </Link>
                </>
              )}
            </div>

            {category && (
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: 999,
                  background: category.color || C.sage700,
                  color: "#fff",
                  fontSize: 11,
                  fontFamily: "var(--font-jetbrains-mono)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 20,
                }}
              >
                {category.name_es}
              </span>
            )}

            <h1
              style={{
                fontFamily: "var(--font-fraunces)",
                fontWeight: 400,
                fontSize: "clamp(34px, 5vw, 54px)",
                lineHeight: 1.1,
                letterSpacing: "-0.015em",
                margin: "0 0 20px",
                color: C.ink,
              }}
            >
              {post.title}
            </h1>

            {post.excerpt && (
              <p
                style={{
                  fontSize: 19,
                  lineHeight: 1.55,
                  color: C.inkSoft,
                  margin: "0 0 28px",
                }}
              >
                {post.excerpt}
              </p>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                color: C.inkMute,
                fontSize: 14,
                fontFamily: "var(--font-jetbrains-mono)",
                letterSpacing: "0.04em",
                flexWrap: "wrap",
              }}
            >
              {author?.avatar_url ? (
                <img
                  src={author.avatar_url}
                  alt={authorName}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: `1px solid ${C.line}`,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: C.sage300,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  {authorName.slice(0, 1).toUpperCase()}
                </div>
              )}
              <span style={{ color: C.inkSoft, fontWeight: 600 }}>{authorName}</span>
              <span>·</span>
              <span>{formatDate(post.published_at)}</span>
              {post.reading_minutes ? (
                <>
                  <span>·</span>
                  <span>{post.reading_minutes} min de lectura</span>
                </>
              ) : null}
            </div>
          </div>
        </header>

        {/* Cover image */}
        {post.cover_url && (
          <div
            style={{
              maxWidth: 1040,
              margin: "0 auto",
              padding: "0 28px",
              marginTop: -44,
              position: "relative",
              zIndex: 2,
            }}
          >
            <div
              style={{
                borderRadius: 24,
                overflow: "hidden",
                aspectRatio: "16 / 9",
                background: C.sage100,
                border: `1px solid ${C.line}`,
                backgroundImage: `url(${post.cover_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </div>
        )}

        {/* Content */}
        <section
          style={{
            maxWidth: 720,
            margin: "0 auto",
            padding: post.cover_url ? "56px 28px 64px" : "24px 28px 64px",
          }}
        >
          <div
            className="nurea-prose"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {post.tags && post.tags.length > 0 && (
            <div
              style={{
                marginTop: 40,
                paddingTop: 24,
                borderTop: `1px solid ${C.line}`,
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 999,
                    background: C.sage100,
                    color: C.sage700,
                    fontSize: 12,
                    fontFamily: "var(--font-jetbrains-mono)",
                    letterSpacing: "0.04em",
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </section>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section
          style={{
            borderTop: `1px solid ${C.line}`,
            background: C.bgWarm,
            padding: "56px 28px 72px",
          }}
        >
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            <div
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: C.sage700,
                marginBottom: 10,
              }}
            >
              Sigue leyendo
            </div>
            <h2
              style={{
                fontFamily: "var(--font-fraunces)",
                fontWeight: 400,
                fontSize: "clamp(28px, 3vw, 36px)",
                lineHeight: 1.15,
                margin: "0 0 32px",
                color: C.ink,
              }}
            >
              Artículos relacionados
            </h2>

            <div
              style={{
                display: "grid",
                gap: 24,
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              }}
            >
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    background: "#fff",
                    borderRadius: 18,
                    overflow: "hidden",
                    textDecoration: "none",
                    color: C.ink,
                    border: `1px solid ${C.line}`,
                  }}
                >
                  <div
                    style={{
                      aspectRatio: "16 / 10",
                      background: r.cover_url ? undefined : C.sage100,
                      backgroundImage: r.cover_url ? `url(${r.cover_url})` : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                    <h3
                      style={{
                        fontFamily: "var(--font-fraunces)",
                        fontWeight: 500,
                        fontSize: 19,
                        lineHeight: 1.25,
                        margin: 0,
                      }}
                    >
                      {r.title}
                    </h3>
                    {r.excerpt && (
                      <p
                        style={{
                          fontSize: 13,
                          color: C.inkSoft,
                          lineHeight: 1.5,
                          margin: 0,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {r.excerpt}
                      </p>
                    )}
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 11,
                        fontFamily: "var(--font-jetbrains-mono)",
                        color: C.inkMute,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {formatDate(r.published_at)}
                      {r.reading_minutes ? ` · ${r.reading_minutes} min` : ""}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer
        style={{
          borderTop: `1px solid ${C.line}`,
          padding: "24px 28px",
          textAlign: "center",
          color: C.inkMute,
          fontSize: 13,
          background: C.bg,
        }}
      >
        <Link href="/blog" style={{ color: C.sage700, textDecoration: "none", fontWeight: 600 }}>
          ← Volver al blog
        </Link>
      </footer>

      <style>{`
        .nurea-prose {
          color: ${C.ink};
          font-size: 18px;
          line-height: 1.75;
          font-family: var(--font-inter);
        }
        .nurea-prose h1 {
          font-family: var(--font-fraunces);
          font-weight: 500;
          font-size: clamp(28px, 3.2vw, 36px);
          line-height: 1.15;
          margin: 48px 0 18px;
          letter-spacing: -0.01em;
          color: ${C.ink};
        }
        .nurea-prose h2 {
          font-family: var(--font-fraunces);
          font-weight: 500;
          font-size: clamp(24px, 2.6vw, 30px);
          line-height: 1.2;
          margin: 40px 0 14px;
          color: ${C.ink};
        }
        .nurea-prose h3 {
          font-family: var(--font-fraunces);
          font-weight: 500;
          font-size: 22px;
          line-height: 1.3;
          margin: 32px 0 12px;
          color: ${C.ink};
        }
        .nurea-prose p {
          margin: 0 0 22px;
          color: ${C.inkSoft};
        }
        .nurea-prose a {
          color: ${C.sage700};
          text-decoration: underline;
          text-underline-offset: 3px;
          font-weight: 500;
        }
        .nurea-prose strong {
          color: ${C.ink};
          font-weight: 600;
        }
        .nurea-prose em { font-style: italic; }
        .nurea-prose ul,
        .nurea-prose ol {
          margin: 0 0 22px;
          padding-left: 1.4em;
          color: ${C.inkSoft};
        }
        .nurea-prose li { margin: 6px 0; }
        .nurea-prose blockquote {
          margin: 28px 0;
          padding: 16px 22px;
          border-left: 3px solid ${C.sage500};
          background: ${C.sage100};
          border-radius: 0 12px 12px 0;
          color: ${C.inkSoft};
          font-style: italic;
        }
        .nurea-prose code {
          background: ${C.lineSoft};
          padding: 2px 6px;
          border-radius: 6px;
          font-family: var(--font-jetbrains-mono);
          font-size: 0.9em;
          color: ${C.ink};
        }
        .nurea-prose img {
          max-width: 100%;
          height: auto;
          border-radius: 14px;
          margin: 28px 0;
          border: 1px solid ${C.line};
        }
        .nurea-prose hr {
          border: none;
          border-top: 1px solid ${C.line};
          margin: 40px 0;
        }
      `}</style>
    </main>
  )
}
