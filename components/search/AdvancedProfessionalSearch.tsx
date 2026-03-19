"use client"

import * as React from "react"
import { useDebounce } from "use-debounce"
import { Search, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { buscarProfesionales, type AdvancedSearchResult } from "@/lib/advanced-search"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface AdvancedProfessionalSearchProps {
  className?: string
  placeholder?: string
  autoFocus?: boolean
}

export function AdvancedProfessionalSearch({
  className,
  placeholder = "Buscar por nombre, especialidad o síntoma...",
  autoFocus = false,
}: AdvancedProfessionalSearchProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [debouncedQuery] = useDebounce(query, 300)
  const [results, setResults] = React.useState<AdvancedSearchResult[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [highlightSuggestion, setHighlightSuggestion] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true

    async function runSearch() {
      if (!debouncedQuery || debouncedQuery.trim().length < 2) {
        setResults([])
        setError(null)
        setHighlightSuggestion(null)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const data = await buscarProfesionales(debouncedQuery, 20)
        if (!active) return

        setResults(data)

        if (data.length === 0 && debouncedQuery.length >= 3) {
          // Simple "quizás quisiste decir" based on normalized query;
          // the server already applied synonyms, so we just show the cleaned version.
          setHighlightSuggestion(debouncedQuery.toLowerCase())
        } else {
          setHighlightSuggestion(null)
        }
      } catch (err) {
        if (!active) return
        setError("No pudimos completar la búsqueda. Intenta de nuevo.")
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    runSearch()

    return () => {
      active = false
    }
  }, [debouncedQuery])

  const handleSelect = (item: AdvancedSearchResult) => {
    if (item.professional_id) {
      router.push(`/professionals/${item.professional_id}`)
    }
  }

  return (
    <div className={cn("relative w-full max-w-xl", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          autoFocus={autoFocus}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-9 pr-9 h-11 rounded-full bg-white/90 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 shadow-sm focus-visible:ring-teal-500"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-teal-600" />
        )}
      </div>

      {(results.length > 0 || error || highlightSuggestion) && (
        <Card className="absolute z-40 mt-2 w-full overflow-hidden border border-slate-200/80 bg-white/95 dark:bg-slate-900/95 shadow-xl">
          {results.length > 0 && (
            <ul className="max-h-80 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto">
              {results.map((item) => (
                <li
                  key={item.id}
                  className="cursor-pointer px-3 py-2.5 hover:bg-teal-50/80 dark:hover:bg-teal-900/40 transition-colors"
                  onClick={() => handleSelect(item)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">
                        {item.full_name || "Profesional de la salud"}
                      </p>
                      {item.specialty && (
                        <p className="truncate text-xs text-teal-700 dark:text-teal-300">
                          {item.specialty}
                        </p>
                      )}
                      {item.city && (
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {item.city}
                        </p>
                      )}
                    </div>
                    {typeof item.rating === "number" && item.rating > 0 && (
                      <div className="shrink-0 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800 dark:bg-teal-900/40 dark:text-teal-200">
                        {item.rating.toFixed(1)}★
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {results.length === 0 && !error && highlightSuggestion && (
            <div className="px-3 py-3 text-sm text-slate-600 dark:text-slate-300">
              <p className="font-medium">Sin resultados directos.</p>
              <p className="mt-1 text-xs">
                Quizás quisiste decir:{" "}
                <span className="font-semibold text-teal-700 dark:text-teal-300">
                  {highlightSuggestion}
                </span>
              </p>
            </div>
          )}

          {error && (
            <div className="px-3 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

