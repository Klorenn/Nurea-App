"use client"

import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import { useRouter } from "next/navigation"
import { Grid3x3, List, MapIcon, Search } from "lucide-react"
import { SpecialistCard } from "./specialist-card"
import { SpecialistGridSkeleton } from "./specialist-card-skeleton"
import { Button } from "@/components/ui/button"
import { Map } from "@/components/Map"
import { useAuth } from "@/hooks/use-auth"
import { trackBookingEvent } from "@/lib/analytics"
import { cn } from "@/lib/utils"
import type { SpecialistCard as SpecialistCardType } from "@/types"

interface SpecialistsGridProps {
  specialists: SpecialistCardType[]
  loading: boolean
  error?: string | null
  view: "grid" | "list" | "map"
  onViewChange: (view: "grid" | "list" | "map") => void
  total: number
  lang?: string
  selectedDate?: Date
}

export function SpecialistsGrid({
  specialists,
  loading,
  error: errorMessage = null,
  view,
  onViewChange,
  total,
  lang = "es",
  selectedDate,
}: SpecialistsGridProps) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const labels = {
    showing: lang === "es" ? "Mostrando" : "Showing",
    of: lang === "es" ? "de" : "of",
    specialists: lang === "es" ? "especialistas" : "specialists",
    noResults: lang === "es" ? "No encontramos especialistas" : "No specialists found",
    noResultsHint: lang === "es" 
      ? "Intenta ajustar los filtros para ver más resultados"
      : "Try adjusting filters to see more results",
    errorLoading: lang === "es" ? "Error al cargar especialistas" : "Error loading specialists",
  }

  const handleViewProfile = (specialist: SpecialistCardType) => {
    router.push(`/professionals/${specialist.slug || specialist.id}`)
  }

  const handleBookAppointment = (specialist: SpecialistCardType) => {
    trackBookingEvent("click_agendar", { professionalId: specialist.id, source: "grid" })
    if (!authLoading && !user) {
      const callbackUrl = encodeURIComponent(`/dashboard/calendar?professionalId=${specialist.id}`)
      router.push(`/login?callbackUrl=${callbackUrl}`)
      return
    }
    router.push(`/dashboard/calendar?professionalId=${specialist.id}`)
  }

  return (
    <div className="flex-1 min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {labels.showing}{" "}
          <span className="font-medium text-slate-700 dark:text-slate-300">{specialists.length}</span>
          {" "}{labels.of}{" "}
          <span className="font-medium text-slate-700 dark:text-slate-300">{total}</span>
          {" "}{labels.specialists}
        </p>
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange("grid")}
            className={cn("h-8 w-8 p-0 rounded-md", view === "grid" && "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100")}
            aria-label={lang === "es" ? "Vista en cuadrícula" : "Grid view"}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange("list")}
            className={cn("h-8 w-8 p-0 rounded-md", view === "list" && "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100")}
            aria-label={lang === "es" ? "Vista en lista" : "List view"}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange("map")}
            className={cn("h-8 w-8 p-0 rounded-md", view === "map" && "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100")}
            aria-label={lang === "es" ? "Vista en mapa" : "Map view"}
          >
            <MapIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Error state */}
      {errorMessage && !loading && (
        <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-4 text-sm text-red-700 dark:text-red-300">
          {labels.errorLoading}: {errorMessage}
        </div>
      )}

      {/* Loading state */}
      {loading && <SpecialistGridSkeleton count={6} />}

      {/* Empty state */}
      {!loading && !errorMessage && specialists.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-16 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
            {labels.noResults}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {labels.noResultsHint}
          </p>
        </motion.div>
      )}

      {/* Grid/List view */}
      {!loading && !errorMessage && specialists.length > 0 && view !== "map" && (
        <LayoutGroup>
          <motion.div
            layout
            className={cn(
              view === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                : "flex flex-col gap-4"
            )}
          >
            <AnimatePresence mode="popLayout">
              {specialists.map((specialist, index) => (
                <motion.div
                  key={specialist.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <SpecialistCard
                    specialist={specialist}
                    onViewProfile={() => handleViewProfile(specialist)}
                    onBookAppointment={() => handleBookAppointment(specialist)}
                    lang={lang}
                    index={index}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      )}

      {/* Map view */}
      {!loading && !errorMessage && view === "map" && (
        <div className="h-[600px] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm relative bg-white dark:bg-slate-900">
          <Map 
            professionals={specialists.map(s => ({
              id: s.id,
              name: s.name,
              specialty: s.specialty,
              image: s.avatarUrl || "/placeholder.svg",
              rating: s.rating,
              price: s.price,
              location: s.location || "",
              lat: s.latitude || -33.4489,
              lng: s.longitude || -70.6693
            }))}
            onAgendar={(prof) => {
              const specialist = specialists.find(s => s.id === prof.id)
              if (specialist) handleBookAppointment(specialist)
            }}
            isSpanish={lang === "es"}
          />
        </div>
      )}
    </div>
  )
}
