"use client"

import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Grid3x3, List, MapIcon } from "lucide-react"
import { SpecialistCard } from "./specialist-card"
import { SpecialistGridSkeleton } from "./specialist-card-skeleton"
import { Button } from "@/components/ui/button"
import { BookingModal } from "@/components/booking-modal"
import { cn } from "@/lib/utils"
import type { SpecialistCard as SpecialistCardType } from "@/types"

interface SpecialistsGridProps {
  specialists: SpecialistCardType[]
  loading: boolean
  view: "grid" | "list" | "map"
  onViewChange: (view: "grid" | "list" | "map") => void
  total: number
  lang?: string
}

export function SpecialistsGrid({
  specialists,
  loading,
  view,
  onViewChange,
  total,
  lang = "es"
}: SpecialistsGridProps) {
  const router = useRouter()
  const [bookingOpen, setBookingOpen] = useState(false)
  const [selectedSpecialist, setSelectedSpecialist] = useState<SpecialistCardType | null>(null)

  const labels = {
    showing: lang === "es" ? "Mostrando" : "Showing",
    of: lang === "es" ? "de" : "of",
    specialists: lang === "es" ? "especialistas" : "specialists",
    noResults: lang === "es" ? "No encontramos especialistas" : "No specialists found",
    noResultsHint: lang === "es" 
      ? "Intenta ajustar los filtros para ver más resultados"
      : "Try adjusting filters to see more results",
  }

  const handleViewProfile = (specialist: SpecialistCardType) => {
    router.push(`/professionals/${specialist.slug || specialist.id}`)
  }

  const handleBookAppointment = (specialist: SpecialistCardType) => {
    setSelectedSpecialist(specialist)
    setBookingOpen(true)
  }

  return (
    <div className="flex-1 space-y-4">
      {/* Header con contador y vista */}
      <div className="flex items-center justify-between">
        <motion.div
          key={total}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-muted-foreground"
        >
          {labels.showing}{" "}
          <span className="font-semibold text-foreground">
            {specialists.length}
          </span>{" "}
          {labels.of}{" "}
          <span className="font-semibold text-foreground">{total}</span>{" "}
          {labels.specialists}
        </motion.div>

        <div className="flex items-center gap-1 bg-accent/30 rounded-xl p-1">
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewChange("grid")}
            className="rounded-lg"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewChange("list")}
            className="rounded-lg"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "map" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewChange("map")}
            className="rounded-lg"
          >
            <MapIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {loading && <SpecialistGridSkeleton count={6} />}

      {/* Empty state */}
      {!loading && specialists.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-16 text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
            <span className="text-4xl">🔍</span>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {labels.noResults}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {labels.noResultsHint}
          </p>
        </motion.div>
      )}

      {/* Grid/List view */}
      {!loading && specialists.length > 0 && view !== "map" && (
        <LayoutGroup>
          <motion.div
            layout
            className={cn(
              view === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
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

      {/* Map view placeholder */}
      {!loading && view === "map" && (
        <div className="h-[500px] rounded-2xl bg-muted/30 border border-dashed border-border flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MapIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Vista de mapa próximamente</p>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => {
          setBookingOpen(false)
          setSelectedSpecialist(null)
        }}
        professionalId={selectedSpecialist?.id}
        professionalName={selectedSpecialist?.name}
        stellarWallet={null}
        offersInPerson={
          selectedSpecialist?.consultationType === "in-person" ||
          selectedSpecialist?.consultationType === "both"
        }
        isSpanish={lang === "es"}
      />
    </div>
  )
}
