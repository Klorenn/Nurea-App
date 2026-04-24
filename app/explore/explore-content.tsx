"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CategoryTabs } from "@/components/explore/category-tabs"
import { FiltersSidebar } from "@/components/explore/filters-sidebar"
import { SpecialistsGrid } from "@/components/specialists/specialists-grid"
import { useCategories } from "@/hooks/use-categories"
import { useSpecialties } from "@/hooks/use-specialties"
import { useSpecialists } from "@/hooks/use-specialists"
import { useLanguage } from "@/contexts/language-context"
import type { SpecialistFilters } from "@/types"
import { SearchFilters } from "@/components/search/SearchFilters"

export function ExploreContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language } = useLanguage()
  const lang = language || "es"

  const [view, setView] = useState<"grid" | "list" | "map">("grid")
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "")
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("q") || "")
  const searchInputRef = useRef<HTMLInputElement>(null)

  const getFiltersFromURL = useCallback((): Partial<SpecialistFilters> => {
    return {
      categorySlug: searchParams.get("category") || undefined,
      specialtySlug: searchParams.get("specialty") || undefined,
      consultationType: (searchParams.get("modality") as "all" | "online" | "in-person") || "all",
      availableToday: searchParams.get("available") === "true",
      verified: searchParams.get("verified") === "true",
      search: searchParams.get("q") || undefined,
      location: searchParams.get("location") || undefined,
      date: searchParams.get("date") || undefined,
      sortBy: (searchParams.get("sort") as "rating" | "price_asc" | "price_desc" | "experience" | "reviews") || "rating",
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    }
  }, [searchParams])

  const currentFilters = getFiltersFromURL()
  const urlSyncKey = searchParams.toString()

  const { categories: categoriesRaw, loading: categoriesLoading } = useCategories({ lang })
  const categories = useMemo(() => (categoriesRaw || []).map((c: any) => ({
    ...c,
    name: c.name ?? (lang === "es" ? c.name_es : c.name_en) ?? c.slug,
    professionalCount: c.professional_count ?? c.professionalCount ?? 0,
  })), [categoriesRaw, lang])

  const { data: specialtiesData, isLoading: specialtiesLoading } = useSpecialties(currentFilters.categorySlug)
  const specialties = (specialtiesData as any) || []

  const groupedSpecialties = useMemo(() => {
    const grouped: Record<string, { slug: string; name: string; id: string; professionalCount?: number; categoryName?: string; icon?: string | null }[]> = {}
    for (const s of specialties) {
      const catSlug = s.categories?.slug ?? "other"
      const name = lang === "es" ? (s.name_es ?? s.name) : (s.name_en ?? s.name ?? s.name_es)
      if (!grouped[catSlug]) grouped[catSlug] = []
      grouped[catSlug].push({
        ...s,
        id: s.id,
        slug: s.slug,
        name: name || s.slug,
        professionalCount: s.professional_count ?? 0,
        categoryName: s.categories?.name_es ?? s.categories?.name,
        icon: s.icon ?? null,
      })
    }
    return grouped
  }, [specialties, lang])

  const {
    specialists,
    loading: specialistsLoading,
    error: specialistsError,
    total,
    setFilters,
    resetFilters,
    page,
    totalPages,
    nextPage,
    prevPage
  } = useSpecialists(currentFilters, lang, urlSyncKey)

  const resolveQuickSpecialtySlug = useCallback(
    (term: string | undefined | null): string | undefined => {
      if (!term) return undefined
      const normalized = term.trim().toLowerCase()
      if (!normalized || normalized.length < 2) return undefined

      const candidates = (specialties as any[]).map((s) => {
        const name =
          lang === "es"
            ? (s.name_es ?? s.name)
            : (s.name_en ?? s.name ?? s.name_es)
        return {
          slug: s.slug as string | undefined,
          name: (name || "").toString().toLowerCase(),
          professionalCount: (s.professional_count as number | undefined) ?? 0,
        }
      })

      const matches = candidates.filter(
        (c) =>
          c.slug?.toLowerCase().includes(normalized) ||
          c.name.includes(normalized)
      )

      if (!matches.length) return undefined

      matches.sort(
        (a, b) => (b.professionalCount || 0) - (a.professionalCount || 0)
      )

      return matches[0]?.slug
    },
    [specialties, lang]
  )

  // Autofocus búsqueda cuando se llega desde "Buscar especialista" (/?focus=search o ?openSearch=1)
  useEffect(() => {
    const focus = searchParams.get("focus") || searchParams.get("openSearch")
    if (focus === "search" || focus === "1") {
      searchInputRef.current?.focus()
    }
  }, [searchParams])

  const updateURL = useCallback((filters: Partial<SpecialistFilters>) => {
    const params = new URLSearchParams()
    
    if (filters.categorySlug) params.set("category", filters.categorySlug)
    if (filters.specialtySlug) params.set("specialty", filters.specialtySlug)
    if (filters.consultationType && filters.consultationType !== "all") params.set("modality", filters.consultationType)
    if (filters.availableToday) params.set("available", "true")
    if (filters.verified) params.set("verified", "true")
    if (filters.search) params.set("q", filters.search)
    if (filters.location) params.set("location", filters.location)
    if (filters.date) params.set("date", filters.date)
    if (filters.sortBy && filters.sortBy !== "rating") params.set("sort", filters.sortBy)
    if (filters.page && filters.page > 1) params.set("page", String(filters.page))

    const queryString = params.toString()
    router.push(queryString ? `/explore?${queryString}` : "/explore", { scroll: false })
  }, [router])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleFilterChange = useCallback(
    (newFilters: Partial<SpecialistFilters>) => {
      const currentFilters = getFiltersFromURL()
      const updatedFilters: Partial<SpecialistFilters> = {
        ...currentFilters,
        ...newFilters,
      }

      if (typeof newFilters.search === "string" && newFilters.search.trim()) {
        const quickSlug = resolveQuickSpecialtySlug(newFilters.search)
        if (quickSlug) {
          updatedFilters.specialtySlug = quickSlug
          // Si encontramos una especialidad clara, podemos limpiar el término de búsqueda 
          // para que no interfiera con otros filtros, o dejarlo si queremos búsqueda combinada.
          // Por ahora lo dejamos para que el backend también busque por texto.
        } else {
          // No limpiar automáticamente una especialidad ya seleccionada por el usuario.
        }
      }

      setFilters(updatedFilters)
      updateURL(updatedFilters)
    },
    [getFiltersFromURL, setFilters, updateURL, resolveQuickSpecialtySlug]
  )

  useEffect(() => {
    const urlSearch = getFiltersFromURL().search || ""
    if (debouncedSearch !== urlSearch) {
      handleFilterChange({ search: debouncedSearch || undefined })
    }
  }, [debouncedSearch, getFiltersFromURL, handleFilterChange]) // Only trigger when user types, not when URL changes

  const handleReset = useCallback(() => {
    resetFilters()
    setSearchTerm("")
    router.push("/explore", { scroll: false })
  }, [resetFilters, router])

  const handleCategoryChange = useCallback(
    (slug: string | null) => {
      handleFilterChange({
        categorySlug: slug || undefined,
        specialtySlug: undefined,
      })
    },
    [handleFilterChange]
  )

  const labels = {
    heroTitle:
      lang === "es"
        ? { a: "Encuentra a tu profesional", b: "de salud", em: "ideal" }
        : { a: "Find your ideal", b: "health", em: "professional" },
    heroSub:
      lang === "es"
        ? "+12.400 profesionales verificados en Chile y España. Sin necesidad de registrarse."
        : "+12,400 verified professionals in Chile and Spain. No registration required.",
    searchPlaceholder:
      lang === "es"
        ? "Especialidad, nombre o síntoma..."
        : "Specialty, name or symptom...",
    searchCta: lang === "es" ? "Buscar profesional" : "Find professional",
  }

  const popularTags =
    lang === "es"
      ? ["Psicología", "Nutrición", "Fisioterapia", "Ansiedad", "Terapia de pareja", "Depresión"]
      : ["Psychology", "Nutrition", "Physiotherapy", "Anxiety", "Couples therapy", "Depression"]

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-warm, oklch(0.97 0.015 85))" }}>
      <div className="min-h-screen flex flex-col">
        <Navbar sticky={false} />

        {/* HERO — Nurea sage (dark) */}
        <section
          style={{
            background: "oklch(0.22 0.03 170)",
            color: "var(--bg, oklch(0.985 0.008 150))",
            padding: "56px 28px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* radial glow */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 30% 50%, oklch(0.58 0.07 170 / 0.3), transparent 60%), radial-gradient(ellipse at 80% 20%, oklch(0.68 0.11 45 / 0.15), transparent 50%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ maxWidth: 760, margin: "0 auto", position: "relative" }}>
            <h1
              className="serif"
              style={{
                fontFamily: "var(--font-fraunces), Fraunces, serif",
                fontSize: "clamp(34px, 5vw, 58px)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                fontWeight: 400,
                marginBottom: 14,
              }}
            >
              {labels.heroTitle.a}
              <br />
              {labels.heroTitle.b}{" "}
              <em
                style={{
                  fontStyle: "italic",
                  color: "oklch(0.78 0.06 170)",
                  fontWeight: 300,
                }}
              >
                {labels.heroTitle.em}
              </em>
              .
            </h1>
            <p
              style={{
                fontSize: 17,
                color: "oklch(0.82 0.02 150)",
                marginBottom: 32,
              }}
            >
              {labels.heroSub}
            </p>
            <div
              style={{
                display: "flex",
                background: "var(--bg, white)",
                borderRadius: 16,
                padding: 6,
                boxShadow: "0 20px 40px oklch(0.1 0.03 170 / 0.3)",
                maxWidth: 700,
                margin: "0 auto",
                flexWrap: "wrap",
                gap: 6,
              }}
            >
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={labels.searchPlaceholder}
                style={{
                  flex: 1,
                  minWidth: 180,
                  padding: "12px 18px",
                  border: "none",
                  background: "transparent",
                  fontFamily: "inherit",
                  fontSize: 15,
                  color: "var(--ink, oklch(0.22 0.025 170))",
                  outline: "none",
                }}
                aria-label={lang === "es" ? "Buscar por especialidad o nombre" : "Search by specialty or name"}
              />
              <select
                value={currentFilters.location || ""}
                onChange={(e) => handleFilterChange({ location: e.target.value || undefined })}
                style={{
                  padding: "10px 14px",
                  border: "none",
                  background: "var(--bg-warm, oklch(0.97 0.015 85))",
                  borderRadius: 10,
                  fontFamily: "inherit",
                  fontSize: 14,
                  color: "var(--ink, oklch(0.22 0.025 170))",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="">{lang === "es" ? "Toda Chile" : "All Chile"}</option>
                <option>Santiago</option>
                <option>Valparaíso</option>
                <option>Concepción</option>
                <option>Antofagasta</option>
                <option>Online</option>
              </select>
              <button
                onClick={() => handleFilterChange({ search: searchTerm || undefined })}
                style={{
                  padding: "12px 22px",
                  background: "oklch(0.22 0.03 170)",
                  color: "var(--bg, white)",
                  border: "none",
                  borderRadius: 10,
                  fontFamily: "inherit",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {labels.searchCta}
              </button>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
                flexWrap: "wrap",
                marginTop: 20,
              }}
            >
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchTerm(tag)
                    handleFilterChange({ search: tag })
                  }}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 999,
                    border: "1px solid oklch(0.4 0.03 170)",
                    background: "transparent",
                    fontSize: 12.5,
                    color: "oklch(0.75 0.02 160)",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "oklch(0.3 0.04 170)"
                    e.currentTarget.style.color = "var(--bg, white)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent"
                    e.currentTarget.style.color = "oklch(0.75 0.02 160)"
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Categories + quick filters */}
        <section
          style={{
            background: "var(--bg, white)",
            borderBottom: "1px solid var(--line-soft, oklch(0.93 0.012 150))",
            padding: "20px 28px",
          }}
        >
          <div style={{ maxWidth: 1300, margin: "0 auto" }}>
            <CategoryTabs
              categories={categories}
              selectedCategory={currentFilters.categorySlug || null}
              onSelect={handleCategoryChange}
              loading={categoriesLoading}
              lang={lang}
            />
            <div style={{ marginTop: 16 }}>
              <SearchFilters
                onChange={(filters) =>
                  handleFilterChange({
                    specialtySlug: filters.specialty,
                    search:
                      filters.conditions.length > 0
                        ? `${searchTerm} ${filters.conditions.join(" ")}`
                        : searchTerm || undefined,
                  })
                }
              />
            </div>
          </div>
        </section>

        <section className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24">
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-6">
              <FiltersSidebar
                filters={currentFilters}
                onFilterChange={handleFilterChange}
                onReset={handleReset}
                specialties={Object.values(groupedSpecialties).flat() as any}
                groupedSpecialties={groupedSpecialties as any}
                loading={specialtiesLoading}
                lang={lang}
              />

              <SpecialistsGrid
                specialists={specialists}
                loading={specialistsLoading}
                error={specialistsError}
                view={view}
                onViewChange={setView}
                total={total}
                lang={lang}
                selectedDate={currentFilters.date ? new Date(currentFilters.date) : undefined}
              />
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                <Button
                  variant="outline"
                  onClick={() => {
                    prevPage()
                    if (page > 1) updateURL({ ...currentFilters, page: page - 1 })
                  }}
                  disabled={page <= 1}
                  className="rounded-lg border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  {lang === "es" ? "Anterior" : "Previous"}
                </Button>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {lang === "es" ? "Página" : "Page"} {page} {lang === "es" ? "de" : "of"} {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => {
                    nextPage()
                    if (page < totalPages) updateURL({ ...currentFilters, page: page + 1 })
                  }}
                  disabled={page >= totalPages}
                  className="rounded-lg border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  {lang === "es" ? "Siguiente" : "Next"}
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
