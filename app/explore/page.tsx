"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Search, X } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { CategoryTabs } from "@/components/explore/category-tabs"
import { FiltersSidebar } from "@/components/explore/filters-sidebar"
import { SpecialistsGrid } from "@/components/specialists/specialists-grid"
import { useCategories } from "@/hooks/use-categories"
import { useSpecialties } from "@/hooks/use-specialties"
import { useSpecialists } from "@/hooks/use-specialists"
import { useLanguage } from "@/contexts/language-context"
import { PaperShaderBackground } from "@/components/ui/background-paper-shaders"
import WavyBackground from "@/components/ui/wavy-background"
import { cn } from "@/lib/utils"
import type { SpecialistFilters, ExplorePageState } from "@/types"

export default function ExplorePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language } = useLanguage()
  const lang = language || "es"

  // Estado de la página
  const [view, setView] = useState<"grid" | "list" | "map">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Leer filtros de URL
  const getFiltersFromURL = useCallback((): Partial<SpecialistFilters> => {
    return {
      categorySlug: searchParams.get("category") || undefined,
      specialtySlug: searchParams.get("specialty") || undefined,
      consultationType: (searchParams.get("modality") as any) || "all",
      availableToday: searchParams.get("available") === "true",
      priceMin: searchParams.get("price_min") ? Number(searchParams.get("price_min")) : undefined,
      priceMax: searchParams.get("price_max") ? Number(searchParams.get("price_max")) : undefined,
      verified: searchParams.get("verified") === "true",
      search: searchParams.get("q") || undefined,
      sortBy: (searchParams.get("sort") as any) || "rating",
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    }
  }, [searchParams])

  // Hooks de datos
  const { categories, loading: categoriesLoading } = useCategories({ lang })
  const { specialties, grouped: groupedSpecialties, loading: specialtiesLoading } = useSpecialties({
    categorySlug: getFiltersFromURL().categorySlug,
    lang
  })
  const {
    specialists,
    loading: specialistsLoading,
    total,
    priceRange,
    setFilters,
    resetFilters,
    page,
    totalPages,
    nextPage,
    prevPage
  } = useSpecialists(getFiltersFromURL(), lang)

  // Sincronizar filtros a URL
  const updateURL = useCallback((filters: Partial<SpecialistFilters>) => {
    const params = new URLSearchParams()
    
    if (filters.categorySlug) params.set("category", filters.categorySlug)
    if (filters.specialtySlug) params.set("specialty", filters.specialtySlug)
    if (filters.consultationType && filters.consultationType !== "all") params.set("modality", filters.consultationType)
    if (filters.availableToday) params.set("available", "true")
    if (filters.priceMin !== undefined) params.set("price_min", String(filters.priceMin))
    if (filters.priceMax !== undefined) params.set("price_max", String(filters.priceMax))
    if (filters.verified) params.set("verified", "true")
    if (filters.search) params.set("q", filters.search)
    if (filters.sortBy && filters.sortBy !== "rating") params.set("sort", filters.sortBy)
    if (filters.page && filters.page > 1) params.set("page", String(filters.page))

    const queryString = params.toString()
    router.push(queryString ? `/explore?${queryString}` : "/explore", { scroll: false })
  }, [router])

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    if (debouncedSearch !== (getFiltersFromURL().search || "")) {
      handleFilterChange({ search: debouncedSearch || undefined })
    }
  }, [debouncedSearch])

  // Manejar cambio de filtros
  const handleFilterChange = useCallback((newFilters: Partial<SpecialistFilters>) => {
    const currentFilters = getFiltersFromURL()
    const updatedFilters = { ...currentFilters, ...newFilters }
    setFilters(updatedFilters)
    updateURL(updatedFilters)
  }, [getFiltersFromURL, setFilters, updateURL])

  // Manejar reset de filtros
  const handleReset = useCallback(() => {
    resetFilters()
    setSearchTerm("")
    router.push("/explore", { scroll: false })
  }, [resetFilters, router])

  // Manejar cambio de categoría
  const handleCategoryChange = useCallback((slug: string | null) => {
    handleFilterChange({ 
      categorySlug: slug || undefined,
      specialtySlug: undefined // Reset especialidad al cambiar categoría
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

  const currentFilters = getFiltersFromURL()

  return (
    <main className="min-h-screen relative">
      <PaperShaderBackground />
      <div className="absolute inset-0 pointer-events-none">
        <WavyBackground className="absolute inset-0" />
      </div>
      
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar sticky={false} />

        {/* Hero section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-6 pb-4 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {labels.title}
              </h1>
              <p className="text-muted-foreground">
                {labels.subtitle}
              </p>
            </div>

            {/* Barra de búsqueda */}
            <div className="max-w-2xl mx-auto mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={labels.searchPlaceholder}
                  className={cn(
                    "w-full pl-12 pr-12 py-4 text-base",
                    "bg-card/80 backdrop-blur-sm",
                    "border border-border/40 rounded-2xl",
                    "focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400",
                    "placeholder:text-muted-foreground",
                    "transition-all duration-200"
                  )}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Category tabs */}
            <CategoryTabs
              categories={categories}
              selectedCategory={currentFilters.categorySlug || null}
              onSelect={handleCategoryChange}
              loading={categoriesLoading}
              lang={lang}
            />
          </div>
        </motion.section>

        {/* Main content */}
        <section className="flex-1 px-4 sm:px-6 lg:px-8 pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-8">
              {/* Sidebar */}
              <FiltersSidebar
                filters={currentFilters}
                onFilterChange={handleFilterChange}
                onReset={handleReset}
                specialties={specialties}
                groupedSpecialties={groupedSpecialties}
                priceRange={priceRange}
                loading={specialtiesLoading}
                lang={lang}
              />

              {/* Grid de especialistas */}
              <SpecialistsGrid
                specialists={specialists}
                loading={specialistsLoading}
                view={view}
                onViewChange={setView}
                total={total}
                lang={lang}
              />
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center gap-4 mt-8"
              >
                <Button
                  variant="outline"
                  onClick={prevPage}
                  disabled={page <= 1}
                  className="rounded-xl"
                >
                  {lang === "es" ? "Anterior" : "Previous"}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {lang === "es" ? "Página" : "Page"} {page} {lang === "es" ? "de" : "of"} {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={nextPage}
                  disabled={page >= totalPages}
                  className="rounded-xl"
                >
                  {lang === "es" ? "Siguiente" : "Next"}
                </Button>
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
