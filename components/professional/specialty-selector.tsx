"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, Search, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface Specialty {
  id: string
  name: string
  slug: string
  icon: string | null
  categoryName: string
  categorySlug: string
}

interface SpecialtySelectorProps {
  value: string | null
  onChange: (id: string | null, name: string | null) => void
  disabled?: boolean
  lang?: string
  placeholder?: string
  error?: string
}

export function SpecialtySelector({
  value,
  onChange,
  disabled = false,
  lang = "es",
  placeholder,
  error
}: SpecialtySelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [grouped, setGrouped] = useState<Record<string, Specialty[]>>({})
  const [loading, setLoading] = useState(false)
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null)

  // Cargar especialidades al montar
  useEffect(() => {
    async function loadSpecialties() {
      setLoading(true)
      try {
        const response = await fetch(`/api/specialties?lang=${lang}&limit=200`)
        const data = await response.json()
        
        if (data.success) {
          const specs: Specialty[] = data.specialties.map((s: any) => ({
            id: s.id,
            name: s.name,
            slug: s.slug,
            icon: s.icon,
            categoryName: s.categoryName,
            categorySlug: s.categorySlug
          }))
          setSpecialties(specs)
          
          // Agrupar por categoría
          const grouped: Record<string, Specialty[]> = {}
          specs.forEach(spec => {
            const key = spec.categorySlug || 'other'
            if (!grouped[key]) grouped[key] = []
            grouped[key].push(spec)
          })
          setGrouped(grouped)
          
          // Si hay un valor seleccionado, encontrar la especialidad
          if (value) {
            const found = specs.find(s => s.id === value)
            if (found) setSelectedSpecialty(found)
          }
        }
      } catch (err) {
        console.error('Error loading specialties:', err)
      } finally {
        setLoading(false)
      }
    }
    
    loadSpecialties()
  }, [lang, value])

  // Filtrar especialidades por búsqueda
  const filteredGrouped = search.trim()
    ? Object.fromEntries(
        Object.entries(grouped)
          .map(([cat, specs]) => [
            cat,
            specs.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
          ])
          .filter(([_, specs]) => (specs as Specialty[]).length > 0)
      )
    : grouped

  const handleSelect = (specialty: Specialty | null) => {
    setSelectedSpecialty(specialty)
    onChange(specialty?.id || null, specialty?.name || null)
    setOpen(false)
  }

  const defaultPlaceholder = lang === "es" 
    ? "Selecciona tu especialidad..." 
    : "Select your specialty..."
  const searchPlaceholder = lang === "es" 
    ? "Buscar especialidad..." 
    : "Search specialty..."
  const noResults = lang === "es" ? "Sin resultados" : "No results"
  const clearLabel = lang === "es" ? "Limpiar" : "Clear"

  return (
    <div className="space-y-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || loading}
            className={cn(
              "w-full justify-between text-left font-normal",
              !selectedSpecialty && "text-muted-foreground",
              error && "border-red-500 focus:ring-red-500"
            )}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {lang === "es" ? "Cargando..." : "Loading..."}
              </span>
            ) : selectedSpecialty ? (
              <span className="flex items-center gap-2 truncate">
                {selectedSpecialty.icon && <span>{selectedSpecialty.icon}</span>}
                <span className="truncate">{selectedSpecialty.name}</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {selectedSpecialty.categoryName}
                </Badge>
              </span>
            ) : (
              placeholder || defaultPlaceholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          {/* Búsqueda */}
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

          {/* Lista de especialidades */}
          <div className="max-h-[300px] overflow-y-auto p-1">
            {selectedSpecialty && (
              <button
                onClick={() => handleSelect(null)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent/50 rounded-lg"
              >
                <X className="h-4 w-4" />
                {clearLabel}
              </button>
            )}

            {Object.entries(filteredGrouped).length === 0 ? (
              <div className="px-3 py-6 text-sm text-center text-muted-foreground">
                {noResults}
              </div>
            ) : (
              Object.entries(filteredGrouped).map(([categorySlug, specs]) => (
                <div key={categorySlug} className="mt-2">
                  <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {(specs as Specialty[])[0]?.categoryName || categorySlug}
                  </div>
                  {(specs as Specialty[]).map((specialty) => (
                    <button
                      key={specialty.id}
                      onClick={() => handleSelect(specialty)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent/50 transition-colors",
                        value === specialty.id && "bg-accent"
                      )}
                    >
                      <span className="w-4 h-4 flex items-center justify-center">
                        {value === specialty.id && <Check className="h-4 w-4" />}
                      </span>
                      {specialty.icon && <span>{specialty.icon}</span>}
                      <span className="flex-1 text-left truncate">{specialty.name}</span>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
