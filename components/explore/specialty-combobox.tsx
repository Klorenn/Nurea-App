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
import { Badge } from "@/components/ui/badge"
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
        s.name.toLowerCase().includes(searchLower)
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
          className="w-full justify-between rounded-xl bg-accent/20 border-border/40 hover:bg-accent/40"
          disabled={loading}
        >
          {selectedSpecialty ? (
            <span className="flex items-center gap-2">
              <span>{selectedSpecialty.icon}</span>
              <span className="truncate">{selectedSpecialty.name}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="p-2 border-b border-border/40">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-transparent border-none outline-none placeholder:text-muted-foreground"
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
              "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent/50 transition-colors",
              !selected && "bg-accent"
            )}
          >
            <span className="w-4 h-4 flex items-center justify-center">
              {!selected && <Check className="h-4 w-4" />}
            </span>
            <span>✨ {allSpecialties}</span>
          </button>

          {Object.entries(filteredGrouped).length === 0 ? (
            <div className="px-3 py-6 text-sm text-center text-muted-foreground">
              {noResults}
            </div>
          ) : (
            Object.entries(filteredGrouped).map(([categorySlug, specs]) => (
              <div key={categorySlug} className="mt-2">
                <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                      "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent/50 transition-colors",
                      selected === specialty.slug && "bg-accent"
                    )}
                  >
                    <span className="w-4 h-4 flex items-center justify-center">
                      {selected === specialty.slug && <Check className="h-4 w-4" />}
                    </span>
                    <span>{specialty.icon}</span>
                    <span className="flex-1 text-left truncate">{specialty.name}</span>
                    {specialty.professionalCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {specialty.professionalCount}
                      </Badge>
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
