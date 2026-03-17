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

  useEffect(() => {
    const urlSearch = getFiltersFromURL().search || ""
    if (debouncedSearch !== urlSearch) {
      handleFilterChange({ search: debouncedSearch || undefined })
    }
  }, [debouncedSearch]) // Only trigger when user types, not when URL changes

  const handleFilterChange = useCallback((newFilters: Partial<SpecialistFilters>) => {
    const currentFilters = getFiltersFromURL()
    const updatedFilters = { ...currentFilters, ...newFilters }
    setFilters(updatedFilters)
    updateURL(updatedFilters)
  }, [getFiltersFromURL, setFilters, updateURL])

  const handleReset = useCallback(() => {
    resetFilters()
    setSearchTerm("")
    router.push("/explore", { scroll: false })
  }, [resetFilters, router])

  const handleCategoryChange = useCallback((slug: string | null) => {
    handleFilterChange({ 
      categorySlug: slug || undefined,
      specialtySlug: undefined
    })
  }, [handleFilterChange])

  const labels = {
    title: lang === "es" ? "Explorar Especialistas" : "Explore Specialists",
    subtitle: lang === "es" 
      ? "Encuentra al profesional de salud ideal para ti"
      : "Find the ideal health professional for you",
    searchPlaceholder: lang === "es" 
      ? "Buscar por nombre, especialidad o ubicación..."
      : "Search by name, specialty or location...",
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="min-h-screen flex flex-col">
        <Navbar sticky={false} />

        {/* Hero + buscador principal — estilo NUREA / Doctoralia */}
        <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight mb-1">
              {labels.title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xl">
              {labels.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  ref={searchInputRef}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={labels.searchPlaceholder}
                  className="pl-10 h-11 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-teal-500/20 focus-visible:border-teal-500/40"
                  aria-label={lang === "es" ? "Buscar por especialidad o nombre" : "Search by specialty or name"}
                />
              </div>
              <Input
                placeholder={lang === "es" ? "Ciudad" : "City"}
                value={currentFilters.location || ""}
                onChange={(e) => handleFilterChange({ location: e.target.value || undefined })}
                className="sm:w-40 h-11 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-teal-500/20"
              />
              <Button
                onClick={() => handleFilterChange({ search: searchTerm || undefined })}
                className="h-11 px-5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium shadow-sm border-0"
              >
                <Search className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{lang === "es" ? "Buscar" : "Search"}</span>
              </Button>
            </div>

            <div className="mt-6">
              <CategoryTabs
                categories={categories}
                selectedCategory={currentFilters.categorySlug || null}
                onSelect={handleCategoryChange}
                loading={categoriesLoading}
                lang={lang}
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
                specialties={Object.values(groupedSpecialties).flat()}
                groupedSpecialties={groupedSpecialties}
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
