"use client"

import { Search, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ModalityFilter } from "@/components/explore/modality-filter"
import { cn } from "@/lib/utils"
import type { ConsultationType } from "@/types"

export interface CategoryOption {
  slug: string
  name: string
  icon?: string
  professionalCount?: number
}

export interface ExploreFiltersToolbarProps {
  /** Búsqueda por texto */
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  /** Ciudad/ubicación */
  locationValue: string
  onLocationChange: (value: string) => void
  locationPlaceholder?: string
  /** Chips de categoría */
  categories: CategoryOption[]
  selectedCategorySlug: string | null
  onCategoryChange: (slug: string | null) => void
  /** Especialidad (select) */
  specialtyValue: string
  onSpecialtyChange: (value: string) => void
  specialtyOptions: { value: string; label: string }[]
  specialtyPlaceholder?: string
  /** Modalidad */
  modalityValue: ConsultationType | "all"
  onModalityChange: (value: ConsultationType | "all") => void
  /** Disponible hoy */
  availableToday: boolean
  onAvailableTodayChange: (value: boolean) => void
  /** Solo verificados */
  verified: boolean
  onVerifiedChange: (value: boolean) => void
  /** Limpiar filtros (visible si hay algún filtro activo) */
  onReset?: () => void
  hasActiveFilters?: boolean
  lang?: string
  className?: string
}

const defaultLabels = {
  es: {
    title: "Explorar Especialistas",
    subtitle: "Encuentra al profesional de salud ideal para ti",
    search: "Buscar",
    searchPlaceholder: "Buscar por nombre, especialidad o ubicación...",
    city: "Ciudad",
    allCategories: "Todos",
    specialty: "Especialidad",
    specialtyPlaceholder: "Seleccionar especialidad...",
    modality: "Modalidad",
    availableToday: "Disponible hoy",
    verifiedOnly: "Solo verificados",
    clearFilters: "Limpiar filtros",
  },
  en: {
    title: "Explore Specialists",
    subtitle: "Find the ideal health professional for you",
    search: "Search",
    searchPlaceholder: "Search by name, specialty or location...",
    city: "City",
    allCategories: "All",
    specialty: "Specialty",
    specialtyPlaceholder: "Select specialty...",
    modality: "Modality",
    availableToday: "Available today",
    verifiedOnly: "Verified only",
    clearFilters: "Clear filters",
  },
}

export function ExploreFiltersToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  locationValue,
  onLocationChange,
  locationPlaceholder,
  categories,
  selectedCategorySlug,
  onCategoryChange,
  specialtyValue,
  onSpecialtyChange,
  specialtyOptions,
  specialtyPlaceholder,
  modalityValue,
  onModalityChange,
  availableToday,
  onAvailableTodayChange,
  verified,
  onVerifiedChange,
  onReset,
  hasActiveFilters = false,
  lang = "es",
  className,
}: ExploreFiltersToolbarProps) {
  const t = defaultLabels[lang === "es" ? "es" : "en"]

  return (
    <section className={cn("border-b border-border/60 bg-gradient-to-b from-muted/30 to-background", className)}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        {/* Hero */}
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-1.5">
          {t.title}
        </h1>
        <p className="text-sm text-muted-foreground mb-6 max-w-xl">
          {t.subtitle}
        </p>

        {/* Búsqueda */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder ?? t.searchPlaceholder}
              className="pl-10 h-11 bg-background border-border rounded-xl shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </div>
          <Input
            placeholder={locationPlaceholder ?? t.city}
            value={locationValue}
            onChange={(e) => onLocationChange(e.target.value)}
            className="sm:w-44 h-11 bg-background border-border rounded-xl shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20"
          />
          <Button
            type="button"
            onClick={() => {}}
            className="h-11 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm font-medium"
          >
            <Search className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{t.search}</span>
          </Button>
        </div>

        {/* Chips de categoría */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-5">
          <button
            type="button"
            onClick={() => onCategoryChange(null)}
            className={cn(
              "flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              selectedCategorySlug === null
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {t.allCategories}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onCategoryChange(cat.slug)}
              className={cn(
                "flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                selectedCategorySlug === cat.slug
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {cat.name}
              {cat.professionalCount != null && (
                <span className="ml-1.5 text-xs opacity-80">({cat.professionalCount})</span>
              )}
            </button>
          ))}
        </div>

        {/* Filtros: especialidad, modalidad, checkboxes */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm font-medium text-foreground sr-only sm:not-sr-only">
              {t.specialty}
            </label>
            <select
              value={specialtyValue}
              onChange={(e) => onSpecialtyChange(e.target.value)}
              className="h-10 min-w-[200px] rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">{specialtyPlaceholder ?? t.specialtyPlaceholder}</option>
              {specialtyOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-foreground sr-only sm:not-sr-only">
              {t.modality}
            </span>
            <ModalityFilter value={modalityValue} onChange={onModalityChange} lang={lang} />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={availableToday}
              onCheckedChange={(checked) => onAvailableTodayChange(checked === true)}
            />
            <span className="text-sm font-medium text-foreground">{t.availableToday}</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={verified}
              onCheckedChange={(checked) => onVerifiedChange(checked === true)}
            />
            <span className="text-sm font-medium text-foreground">{t.verifiedOnly}</span>
          </label>

          {onReset && hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground rounded-xl">
              <RotateCcw className="h-4 w-4 mr-2" />
              {t.clearFilters}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
