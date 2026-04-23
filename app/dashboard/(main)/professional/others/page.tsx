"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/contexts/language-context"

const C = {
  bg: "oklch(0.985 0.008 150)",
  panel: "#fff",
  ink: "oklch(0.22 0.025 170)",
  inkSoft: "oklch(0.42 0.02 170)",
  inkMute: "oklch(0.58 0.015 170)",
  line: "oklch(0.88 0.015 150)",
  sage100: "oklch(0.95 0.025 170)",
  sage300: "oklch(0.78 0.06 170)",
  sage700: "oklch(0.38 0.05 170)",
  terracotta: "oklch(0.68 0.11 45)",
}

interface Colleague {
  id: string
  slug: string | null
  specialty_id: string | null
  city: string | null
  region: string | null
  verified: boolean
  rating: number
  review_count: number
  profile: {
    first_name: string | null
    last_name: string | null
    professional_title: string | null
    avatar_url: string | null
  } | null
  specialty: { name_es: string | null } | null
}

export default function ProfessionalColleaguesPage() {
  const supabase = useMemo(() => createClient(), [])
  const { language } = useLanguage()
  const isES = language === "es"

  const [colleagues, setColleagues] = useState<Colleague[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [cityFilter, setCityFilter] = useState("")
  const [meId, setMeId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setMeId(user?.id ?? null)

      const { data } = await supabase
        .from("professionals")
        .select(
          "id, slug, specialty_id, city, region, verified, rating, review_count, profile:profiles!professionals_id_fkey(first_name, last_name, professional_title, avatar_url), specialty:specialties!professionals_specialty_id_fkey(name_es)"
        )
        .order("verified", { ascending: false })
        .order("rating", { ascending: false })
        .limit(60)

      setColleagues((data as unknown as Colleague[]) || [])
      setLoading(false)
    }
    load()
  }, [supabase])

  const cities = Array.from(new Set(colleagues.map((c) => c.city).filter(Boolean) as string[])).sort()

  const filtered = colleagues.filter((c) => {
    if (c.id === meId) return false
    if (cityFilter && c.city !== cityFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    const name = `${c.profile?.first_name ?? ""} ${c.profile?.last_name ?? ""}`.toLowerCase()
    const spec = (c.specialty?.name_es ?? "").toLowerCase()
    return name.includes(q) || spec.includes(q)
  })

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "32px 24px 64px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: C.sage700,
              marginBottom: 8,
            }}
          >
            {isES ? "Red de colegas" : "Colleague network"}
          </div>
          <h1
            style={{
              fontFamily: "var(--font-fraunces)",
              fontWeight: 400,
              fontSize: "clamp(30px, 4vw, 40px)",
              lineHeight: 1.1,
              margin: 0,
              color: C.ink,
            }}
          >
            {isES ? "Otros profesionales en Nurea" : "Other professionals on Nurea"}
          </h1>
          <p style={{ color: C.inkSoft, fontSize: 15, margin: "8px 0 0" }}>
            {isES
              ? "Deriva pacientes, colabora en casos complejos o contacta colegas de tu ciudad."
              : "Refer patients, collaborate on complex cases or reach colleagues in your city."}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isES ? "Buscar por nombre o especialidad…" : "Search by name or specialty…"}
            style={{
              flex: "1 1 260px",
              padding: "10px 14px",
              borderRadius: 10,
              border: `1px solid ${C.line}`,
              background: "#fff",
              color: C.ink,
              fontSize: 14,
              outline: "none",
            }}
          />
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: `1px solid ${C.line}`,
              background: "#fff",
              color: C.ink,
              fontSize: 14,
              minWidth: 180,
            }}
          >
            <option value="">{isES ? "Todas las ciudades" : "All cities"}</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p style={{ color: C.inkMute, fontFamily: "var(--font-jetbrains-mono)", fontSize: 13 }}>
            {isES ? "Cargando colegas…" : "Loading colleagues…"}
          </p>
        ) : filtered.length === 0 ? (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              border: `1px dashed ${C.line}`,
              borderRadius: 16,
              background: "#fff",
              color: C.inkSoft,
            }}
          >
            {isES
              ? "Aún no hay otros profesionales registrados con esos filtros."
              : "No other professionals match these filters yet."}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            }}
          >
            {filtered.map((c) => {
              const name = `${c.profile?.first_name ?? ""} ${c.profile?.last_name ?? ""}`.trim() || "—"
              return (
                <div
                  key={c.id}
                  style={{
                    background: C.panel,
                    border: `1px solid ${C.line}`,
                    borderRadius: 16,
                    padding: 20,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {c.profile?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.profile.avatar_url}
                        alt={name}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: `1px solid ${C.line}`,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          background: C.sage300,
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                        }}
                      >
                        {name.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: "var(--font-fraunces)",
                          fontWeight: 500,
                          fontSize: 18,
                          lineHeight: 1.2,
                          color: C.ink,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {name}
                      </div>
                      <div style={{ fontSize: 13, color: C.inkMute }}>
                        {c.profile?.professional_title ?? (isES ? "Profesional" : "Professional")}
                      </div>
                    </div>
                    {c.verified && (
                      <span
                        title={isES ? "Verificado" : "Verified"}
                        style={{
                          background: C.sage100,
                          color: C.sage700,
                          fontSize: 11,
                          padding: "3px 8px",
                          borderRadius: 999,
                          fontFamily: "var(--font-jetbrains-mono)",
                          letterSpacing: "0.08em",
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: C.inkSoft }}>
                    {c.specialty?.name_es ?? "—"}
                    {c.city ? ` · ${c.city}` : ""}
                  </div>
                  {c.review_count > 0 && (
                    <div
                      style={{
                        fontSize: 12,
                        color: C.inkMute,
                        fontFamily: "var(--font-jetbrains-mono)",
                      }}
                    >
                      ★ {c.rating.toFixed(1)} · {c.review_count} {isES ? "reseñas" : "reviews"}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 10 }}>
                    {c.slug && (
                      <Link
                        href={`/profesionales/${c.slug}`}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          borderRadius: 8,
                          border: `1px solid ${C.line}`,
                          background: "#fff",
                          color: C.ink,
                          fontSize: 13,
                          fontWeight: 500,
                          textAlign: "center",
                          textDecoration: "none",
                        }}
                      >
                        {isES ? "Ver ficha" : "View profile"}
                      </Link>
                    )}
                    <Link
                      href={`/dashboard/chat?to=${c.id}`}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "none",
                        background: C.sage700,
                        color: "#fff",
                        fontSize: 13,
                        fontWeight: 600,
                        textAlign: "center",
                        textDecoration: "none",
                      }}
                    >
                      {isES ? "Contactar" : "Message"}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
