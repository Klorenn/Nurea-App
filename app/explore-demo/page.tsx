"use client"

import { useState, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { ExploreFiltersToolbar } from "@/components/explore/explore-filters-toolbar"
import { SpecialistCard } from "@/components/specialists/specialist-card"
import {
  MOCK_CATEGORIES,
  MOCK_SPECIALTY_OPTIONS,
  MOCK_SPECIALISTS,
} from "@/lib/mock-explore"
import type { ConsultationType } from "@/types"

export default function ExploreDemoPage() {
  const [search, setSearch] = useState("")
  const [location, setLocation] = useState("")
  const [categorySlug, setCategorySlug] = useState<string | null>(null)
  const [specialty, setSpecialty] = useState("")
  const [modality, setModality] = useState<ConsultationType | "all">("all")
  const [availableToday, setAvailableToday] = useState(false)
  const [verified, setVerified] = useState(true)
  const lang = "es"

  const hasActiveFilters =
    categorySlug != null ||
    specialty !== "" ||
    modality !== "all" ||
    availableToday ||
    verified

  const handleReset = () => {
    setCategorySlug(null)
    setSpecialty("")
    setModality("all")
    setAvailableToday(false)
    setVerified(false)
  }

  const filteredSpecialists = useMemo(() => {
    return MOCK_SPECIALISTS.filter((s) => {
      if (verified && !s.verified) return false
      if (availableToday && !s.isAvailableToday) return false
      if (modality === "online" && s.consultationType !== "online" && s.consultationType !== "both") return false
      if (modality === "in-person" && s.consultationType !== "in-person" && s.consultationType !== "both") return false
      if (search) {
        const q = search.toLowerCase()
        if (!s.name.toLowerCase().includes(q) && !s.specialty.toLowerCase().includes(q) && !(s.location?.toLowerCase().includes(q))) return false
      }
      if (location && s.location && !s.location.toLowerCase().includes(location.toLowerCase())) return false
      if (categorySlug && s.categorySlug !== categorySlug) return false
      if (specialty && s.specialtySlug !== specialty) return false
      return true
    })
  }, [search, location, categorySlug, specialty, modality, availableToday, verified])

  return (
    <main className="min-h-screen bg-background">
      <div className="min-h-screen flex flex-col">
        <Navbar sticky={false} />

        <ExploreFiltersToolbar
          searchValue={search}
          onSearchChange={setSearch}
          locationValue={location}
          onLocationChange={setLocation}
          categories={MOCK_CATEGORIES}
          selectedCategorySlug={categorySlug}
          onCategoryChange={setCategorySlug}
          specialtyValue={specialty}
          onSpecialtyChange={setSpecialty}
          specialtyOptions={MOCK_SPECIALTY_OPTIONS}
          modalityValue={modality}
          onModalityChange={setModality}
          availableToday={availableToday}
          onAvailableTodayChange={setAvailableToday}
          verified={verified}
          onVerifiedChange={setVerified}
          onReset={handleReset}
          hasActiveFilters={hasActiveFilters}
          lang={lang}
        />

        <section className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24">
          <div className="max-w-6xl mx-auto">
            <p className="text-sm text-muted-foreground mb-4">
              Mostrando <span className="font-semibold text-foreground">{filteredSpecialists.length}</span> de{" "}
              <span className="font-semibold text-foreground">{MOCK_SPECIALISTS.length}</span> especialistas
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSpecialists.map((specialist) => (
                <SpecialistCard
                  key={specialist.id}
                  specialist={specialist}
                  onViewProfile={() => window.open(`/professionals/${specialist.slug}`, "_self")}
                  onBookAppointment={() => {}}
                  lang={lang}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
