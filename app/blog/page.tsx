import type { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export const revalidate = 60
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Blog | NUREA",
  description:
    "Artículos sobre salud, bienestar, tecnología médica y la comunidad NUREA. Guías y novedades desde Temuco, Chile.",
  openGraph: {
    title: "Blog NUREA",
    description:
      "Artículos sobre salud, bienestar, tecnología médica y la comunidad NUREA.",
    type: "website",
  },
}

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

interface BlogPostRow {
  id: string
  slug: string
  title: string
  excerpt: string | null
  cover_url: string | null
  tags: string[] | null
  category_id: string | null
  featured: boolean
  reading_minutes: number | null
  published_at: string | null
}

interface CategoryRow {
  id: string
  slug: string
  name_es: string
  color: string | null
}

interface SearchParams {
  categoria?: string
  q?: string
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

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const categoria = params?.categoria?.trim() || ""
  const q = params?.q?.trim() || ""

  const supabase = await createClient()

  const [{ data: categoriesData }, { data: featuredData }] = await Promise.all([
    supabase
      .from("blog_categories")
      .select("id, slug, name_es, color")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("blog_posts")
      .select(
        "id, slug, title, excerpt, cover_url, tags, category_id, featured, reading_minutes, published_at"
      )
      .eq("status", "published")
      .eq("featured", true)
      .order("published_at", { ascending: false })
      .limit(1),
  ])

  const categories = (categoriesData as CategoryRow[]) || []
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]))
  const categoryById = new Map(categories.map((c) => [c.id, c]))

  const activeCategory = categoria ? categoryBySlug.get(categoria) : undefined

  let query = supabase
    .from("blog_posts")
    .select(
      "id, slug, title, excerpt, cover_url, tags, category_id, featured, reading_minutes, published_at"
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })

  if (activeCategory) {
    query = query.eq("category_id", activeCategory.id)
  }
  if (q) {
    query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`)
  }

  const { data: postsData } = await query.limit(48)
  const posts = (postsData as BlogPostRow[]) || []
  const featured = (featuredData as BlogPostRow[])?.[0]

  const showFeatured = !categoria && !q && featured

  return (
    <main style={{ background: C.bg, minHeight: "100vh", color: C.ink }}>
      <header
        style={{
          borderBottom: `1px solid ${C.line}`,
          background: C.bgWarm,
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "56px 28px 44px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <Link
              href="/"
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: C.sage700,
                textDecoration: "none",
              }}
            >
              ← Nurea
            </Link>
            <span style={{ color: C.inkMute }}>/</span>
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: C.inkSoft,
              }}
            >
              Blog
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-fraunces)",
              fontWeight: 400,
              fontSize: "clamp(40px, 6vw, 68px)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              margin: "0 0 14px",
              color: C.ink,
            }}
          >
            Diario de salud <em style={{ fontStyle: "italic", color: C.sage700 }}>NUREA</em>
          </h1>
          <p
            style={{
              maxWidth: 620,
              color: C.inkSoft,
              fontSize: 17,
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            Salud, tecnología y comunidad escritas desde Temuco. Pensado para
            pacientes y profesionales de Chile.
          </p>

          <form
            method="get"
            action="/blog"
            style={{
              marginTop: 28,
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar artículos…"
              style={{
                flex: "1 1 260px",
                minWidth: 220,
                padding: "12px 16px",
                borderRadius: 999,
                border: `1px solid ${C.line}`,
                background: "#fff",
                color: C.ink,
                fontSize: 14,
              }}
            />
            {categoria && (
              <input type="hidden" name="categoria" value={categoria} />
            )}
            <button
              type="submit"
              style={{
                padding: "12px 22px",
                borderRadius: 999,
                border: "none",
                background: C.sage700,
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Buscar
            </button>
          </form>

          <div
            style={{
              marginTop: 22,
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <Link
              href="/blog"
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                fontSize: 13,
                fontFamily: "var(--font-jetbrains-mono)",
                letterSpacing: "0.04em",
                textDecoration: "none",
                background: !categoria ? C.sage700 : "#fff",
                color: !categoria ? "#fff" : C.inkSoft,
                border: `1px solid ${!categoria ? C.sage700 : C.line}`,
              }}
            >
              Todas
            </Link>
            {categories.map((cat) => {
              const active = categoria === cat.slug
              return (
                <Link
                  key={cat.id}
                  href={`/blog?categoria=${cat.slug}`}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontFamily: "var(--font-jetbrains-mono)",
                    letterSpacing: "0.04em",
                    textDecoration: "none",
                    background: active ? cat.color || C.sage700 : "#fff",
                    color: active ? "#fff" : C.inkSoft,
                    border: `1px solid ${active ? "transparent" : C.line}`,
                  }}
                >
                  {cat.name_es}
                </Link>
              )
            })}
          </div>
        </div>
      </header>

      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "56px 28px 96px",
        }}
      >
        {showFeatured && featured && (
          <FeaturedCard
            post={featured}
            category={featured.category_id ? categoryById.get(featured.category_id) : undefined}
          />
        )}

        {posts.length === 0 ? (
          <div
            style={{
              padding: "64px 24px",
              textAlign: "center",
              border: `1px dashed ${C.line}`,
              borderRadius: 16,
              background: "#fff",
              color: C.inkSoft,
            }}
          >
            <p style={{ fontSize: 16, margin: 0 }}>
              {q
                ? `No encontramos resultados para "${q}".`
                : activeCategory
                  ? `Aún no hay artículos en ${activeCategory.name_es}.`
                  : "Aún no hay artículos publicados."}
            </p>
            {(q || activeCategory) && (
              <Link
                href="/blog"
                style={{
                  display: "inline-block",
                  marginTop: 16,
                  color: C.sage700,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Ver todo el blog
              </Link>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: 28,
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              marginTop: showFeatured ? 44 : 0,
            }}
          >
            {posts
              .filter((p) => !showFeatured || p.id !== featured?.id)
              .map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  category={post.category_id ? categoryById.get(post.category_id) : undefined}
                />
              ))}
          </div>
        )}
      </section>

      <footer
        style={{
          borderTop: `1px solid ${C.line}`,
          padding: "28px 28px",
          background: C.bgWarm,
          textAlign: "center",
          color: C.inkMute,
          fontSize: 13,
        }}
      >
        <Link href="/" style={{ color: C.sage700, textDecoration: "none", fontWeight: 600 }}>
          ← Volver a NUREA
        </Link>
      </footer>
    </main>
  )
}

function FeaturedCard({
  post,
  category,
}: {
  post: BlogPostRow
  category?: CategoryRow
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      style={{
        display: "grid",
        gridTemplateColumns: "1.1fr 1fr",
        gap: 36,
        textDecoration: "none",
        color: C.ink,
        padding: 28,
        borderRadius: 24,
        background: "#fff",
        border: `1px solid ${C.line}`,
        boxShadow: "0 14px 44px -30px oklch(0.22 0.025 170 / 0.25)",
      }}
    >
      <div
        style={{
          borderRadius: 18,
          overflow: "hidden",
          background: C.sage100,
          minHeight: 280,
          backgroundImage: post.cover_url ? `url(${post.cover_url})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: C.terracotta,
            }}
          >
            ★ Destacado
          </span>
          {category && (
            <span
              style={{
                padding: "3px 10px",
                borderRadius: 999,
                background: category.color || C.sage700,
                color: "#fff",
                fontSize: 11,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {category.name_es}
            </span>
          )}
        </div>
        <h2
          style={{
            fontFamily: "var(--font-fraunces)",
            fontWeight: 400,
            fontSize: "clamp(26px, 3vw, 34px)",
            lineHeight: 1.15,
            margin: "0 0 14px",
            color: C.ink,
          }}
        >
          {post.title}
        </h2>
        {post.excerpt && (
          <p style={{ color: C.inkSoft, fontSize: 16, lineHeight: 1.5, margin: "0 0 18px" }}>
            {post.excerpt}
          </p>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: C.inkMute,
            fontSize: 13,
            fontFamily: "var(--font-jetbrains-mono)",
          }}
        >
          <span>{formatDate(post.published_at)}</span>
          {post.reading_minutes ? (
            <>
              <span>·</span>
              <span>{post.reading_minutes} min de lectura</span>
            </>
          ) : null}
        </div>
      </div>
    </Link>
  )
}

function PostCard({
  post,
  category,
}: {
  post: BlogPostRow
  category?: CategoryRow
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      style={{
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        color: C.ink,
        background: "#fff",
        border: `1px solid ${C.line}`,
        borderRadius: 20,
        overflow: "hidden",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      <div
        style={{
          aspectRatio: "16 / 10",
          background: post.cover_url ? undefined : C.sage100,
          backgroundImage: post.cover_url ? `url(${post.cover_url})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {category && (
            <span
              style={{
                padding: "3px 10px",
                borderRadius: 999,
                background: category.color || C.sage700,
                color: "#fff",
                fontSize: 11,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                fontFamily: "var(--font-jetbrains-mono)",
              }}
            >
              {category.name_es}
            </span>
          )}
          {post.featured && (
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: C.terracotta,
              }}
            >
              ★
            </span>
          )}
        </div>
        <h3
          style={{
            fontFamily: "var(--font-fraunces)",
            fontWeight: 500,
            fontSize: 22,
            lineHeight: 1.2,
            margin: 0,
            color: C.ink,
          }}
        >
          {post.title}
        </h3>
        {post.excerpt && (
          <p
            style={{
              color: C.inkSoft,
              fontSize: 14,
              lineHeight: 1.55,
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {post.excerpt}
          </p>
        )}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: C.inkMute,
            fontSize: 12,
            fontFamily: "var(--font-jetbrains-mono)",
            letterSpacing: "0.04em",
          }}
        >
          <span>{formatDate(post.published_at)}</span>
          {post.reading_minutes ? (
            <>
              <span>·</span>
              <span>{post.reading_minutes} min</span>
            </>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
