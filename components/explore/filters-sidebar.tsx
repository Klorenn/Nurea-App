"use client"

import { X, RotateCcw, SlidersHorizontal } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { SpecialtyCombobox } from "./specialty-combobox"
import { ModalityFilter } from "./modality-filter"
import { PriceRangeFilter } from "./price-range-filter"
import { AvailabilityToggle } from "./availability-toggle"
import { cn } from "@/lib/utils"
import type { SpecialistFilters, SpecialtyWithCount, CategoryWithSpecialties } from "@/types"

interface FiltersSidebarProps {
  filters: SpecialistFilters
  onFilterChange: (filters: Partial<SpecialistFilters>) => void
  onReset: () => void
  specialties: SpecialtyWithCount[]
  groupedSpecialties: Record<string, SpecialtyWithCount[]>
  priceRange: { min: number; max: number }
  loading?: boolean
  lang?: string
}

export function FiltersSidebar({
  filters,
  onFilterChange,
  onReset,
  specialties,
  groupedSpecialties,
  priceRange,
  loading = false,
  lang = "es"
}: FiltersSidebarProps) {
  const activeFiltersCount = [
    filters.specialtySlug,
    filters.consultationType !== "all" ? filters.consultationType : null,
    filters.availableToday,
    filters.priceMin !== undefined || filters.priceMax !== undefined,
    filters.verified,
  ].filter(Boolean).length

  const labels = {
    filters: lang === "es" ? "Filtros" : "Filters",
    specialty: lang === "es" ? "Especialidad" : "Specialty",
    modality: lang === "es" ? "Modalidad" : "Modality",
    price: lang === "es" ? "Precio" : "Price",
    reset: lang === "es" ? "Limpiar filtros" : "Clear filters",
    apply: lang === "es" ? "Aplicar" : "Apply",
    verifiedOnly: lang === "es" ? "Solo verificados" : "Verified only",
  }

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Especialidad */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground">
          {labels.specialty}
        </label>
        <SpecialtyCombobox
          specialties={specialties}
          grouped={groupedSpecialties}
          selected={filters.specialtySlug || null}
          onSelect={(slug) => onFilterChange({ specialtySlug: slug || undefined })}
          loading={loading}
          lang={lang}
        />
      </div>

      {/* Modalidad */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground">
          {labels.modality}
        </label>
        <ModalityFilter
          value={filters.consultationType || "all"}
          onChange={(value) => onFilterChange({ consultationType: value })}
          lang={lang}
        />
      </div>

      {/* Disponibilidad */}
      <AvailabilityToggle
        checked={filters.availableToday || false}
        onChange={(checked) => onFilterChange({ availableToday: checked })}
        lang={lang}
      />

      {/* Rango de precio */}
      <PriceRangeFilter
        min={priceRange.min}
        max={priceRange.max}
        value={[
          filters.priceMin ?? priceRange.min,
          filters.priceMax ?? priceRange.max
        ]}
        onChange={([min, max]) => onFilterChange({ priceMin: min, priceMax: max })}
        lang={lang}
      />

      {/* Solo verificados */}
      <button
        onClick={() => onFilterChange({ verified: !filters.verified })}
        className={cn(
          "w-full flex items-center justify-between p-3 rounded-xl border transition-all",
          filters.verified
            ? "border-teal-500 bg-teal-50 dark:bg-teal-950/30"
            : "border-border/40 hover:border-border"
        )}
      >
        <span className="text-sm font-medium">{labels.verifiedOnly}</span>
        <Badge variant={filters.verified ? "default" : "outline"} className={cn(
          filters.verified && "bg-teal-500"
        )}>
          ✓
        </Badge>
      </button>

      {/* Reset */}
      {activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          onClick={onReset}
          className="w-full text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          {labels.reset}
        </Button>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-24">
          <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" />
                {labels.filters}
              </h2>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            <FiltersContent />
          </div>
        </div>
      </aside>

      {/* Mobile Sheet */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="fixed bottom-20 right-4 z-40 rounded-full shadow-lg h-14 w-14 p-0"
            >
              <SlidersHorizontal className="h-5 w-5" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
            <SheetHeader className="mb-6">
              <SheetTitle className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" />
                {labels.filters}
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                    {activeFiltersCount}
                  </Badge>
                )}
              </SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto pb-20">
              <FiltersContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
