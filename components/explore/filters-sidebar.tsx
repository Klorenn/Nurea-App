"use client"

import { X, RotateCcw, SlidersHorizontal } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { SpecialtyCombobox } from "./specialty-combobox"
import { ModalityFilter } from "./modality-filter"
import { AvailabilityToggle } from "./availability-toggle"
import { cn } from "@/lib/utils"
import type { SpecialistFilters, SpecialtyWithCount, CategoryWithSpecialties } from "@/types"

interface FiltersSidebarProps {
  filters: SpecialistFilters
  onFilterChange: (filters: Partial<SpecialistFilters>) => void
  onReset: () => void
  specialties: SpecialtyWithCount[]
  groupedSpecialties: Record<string, SpecialtyWithCount[]>
  loading?: boolean
  lang?: string
}

export function FiltersSidebar({
  filters,
  onFilterChange,
  onReset,
  specialties,
  groupedSpecialties,
  loading = false,
  lang = "es"
}: FiltersSidebarProps) {
  const activeFiltersCount = [
    filters.specialtySlug,
    filters.consultationType !== "all" ? filters.consultationType : null,
    filters.availableToday,
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
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
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

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {labels.modality}
        </label>
        <ModalityFilter
          value={filters.consultationType || "all"}
          onChange={(value) => onFilterChange({ consultationType: value })}
          lang={lang}
        />
      </div>

      <AvailabilityToggle
        checked={filters.availableToday || false}
        onChange={(checked) => onFilterChange({ availableToday: checked })}
        lang={lang}
      />

      <button
        type="button"
        onClick={() => onFilterChange({ verified: !filters.verified })}
        className={cn(
          "w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left",
          filters.verified
            ? "border-teal-500/50 bg-teal-50/80 dark:bg-teal-950/20 dark:border-teal-800"
            : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
        )}
      >
        <div className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors",
          filters.verified ? "bg-teal-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
        )}>
          <span className="text-sm font-medium">✓</span>
        </div>
        <span className={cn(
          "text-sm font-medium flex-1 min-w-0 truncate",
          filters.verified ? "text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-400"
        )}>
          {labels.verifiedOnly}
        </span>
        <div className={cn(
          "w-9 h-5 rounded-full p-0.5 shrink-0 transition-colors flex items-center",
          filters.verified ? "bg-teal-600 justify-end" : "bg-slate-200 dark:bg-slate-700 justify-start"
        )}>
          <div className="h-4 w-4 rounded-full bg-white shadow-sm shrink-0" />
        </div>
      </button>

      {activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          onClick={onReset}
          className="w-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg text-sm"
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
      <aside className="hidden lg:block w-64 shrink-0 min-w-0">
        <div className="sticky top-24">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-slate-500" />
                {labels.filters}
              </h2>
              {activeFiltersCount > 0 && (
                <span className="text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
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
              className="fixed bottom-20 right-4 z-40 rounded-full h-12 w-12 p-0 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
            >
              <SlidersHorizontal className="h-5 w-5 text-slate-600" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-teal-600 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
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
