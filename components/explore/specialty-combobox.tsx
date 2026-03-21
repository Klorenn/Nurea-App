"use client"

import { useState, useMemo } from "react"
import { Check, ChevronsUpDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { SpecialtyWithCount } from "@/types"

interface SpecialtyComboboxProps {
  specialties: SpecialtyWithCount[]
  grouped: Record<string, SpecialtyWithCount[]>
  selected: string | null
  onSelect: (slug: string | null) => void
  loading?: boolean
  lang?: string
}

export function SpecialtyCombobox({
  specialties,
  grouped,
  selected,
  onSelect,
  loading = false,
  lang = "es"
}: SpecialtyComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const selectedSpecialty = useMemo(() => {
    return specialties.find(s => s.slug === selected)
  }, [specialties, selected])

  const filteredGrouped = useMemo(() => {
    if (!search.trim()) return grouped

    const searchLower = search.toLowerCase()
    const result: Record<string, SpecialtyWithCount[]> = {}

    Object.entries(grouped).forEach(([categorySlug, specs]) => {
      const filtered = specs.filter(s =>
        (s.name ?? '').toLowerCase().includes(searchLower)
      )
      if (filtered.length > 0) {
        result[categorySlug] = filtered
      }
    })

    return result
  }, [grouped, search])

  const placeholder = lang === "es" ? "Seleccionar especialidad..." : "Select specialty..."
  const searchPlaceholder = lang === "es" ? "Buscar especialidad..." : "Search specialty..."
  const noResults = lang === "es" ? "Sin resultados" : "No results"
  const allSpecialties = lang === "es" ? "Todas las especialidades" : "All specialties"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between items-center rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 min-h-10"
          disabled={loading}
        >
          {selectedSpecialty ? (
            <span className="truncate">{selectedSpecialty.name}</span>
          ) : (
            <span className="text-slate-500">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0 rounded-lg border-slate-200 dark:border-slate-700 shadow-lg" align="start">
        <div className="p-2 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-transparent border-none outline-none placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        <div className="max-h-[300px] overflow-y-auto p-1">
          <button
            onClick={() => {
              onSelect(null)
              setOpen(false)
            }}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
              !selected ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100" : "hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <span className="w-4 h-4 flex items-center justify-center">
              {!selected && <Check className="h-4 w-4" />}
            </span>
            <span>{allSpecialties}</span>
          </button>

          {Object.entries(filteredGrouped).length === 0 ? (
            <div className="px-3 py-6 text-sm text-center text-slate-500">
              {noResults}
            </div>
          ) : (
            Object.entries(filteredGrouped).map(([categorySlug, specs]) => (
              <div key={categorySlug} className="mt-2">
                <div className="px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {specs[0]?.categoryName || categorySlug}
                </div>
                {specs.map((specialty) => (
                  <button
                    key={specialty.id}
                    onClick={() => {
                      onSelect(specialty.slug)
                      setOpen(false)
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                      selected === specialty.slug
                        ? "bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    <span className="w-4 h-4 flex items-center justify-center shrink-0">
                      {selected === specialty.slug && <Check className="h-4 w-4" />}
                    </span>
                    <span className="flex-1 text-left truncate">{specialty.name}</span>
                    {specialty.professionalCount != null && specialty.professionalCount > 0 && (
                      <span className="text-xs text-slate-400">{specialty.professionalCount}</span>
                    )}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
