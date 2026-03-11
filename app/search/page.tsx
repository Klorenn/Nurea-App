"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter, Video, Home, Grid3x3, List, Search as SearchIcon, Plus, ChevronDown, ChevronUp, Loader2, MapPin } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import DoctorCard from "@/components/ui/doctor-live-chat-card"
import { ProfileCard } from "@/components/ui/profile-card"
import { InputWithTags } from "@/components/ui/input-with-tags"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import WavyBackground from "@/components/ui/wavy-background"
import { PaperShaderBackground } from "@/components/ui/background-paper-shaders"
import { createClient } from "@/lib/supabase/client"
import { Map } from "@/components/Map"
import type { ProfessionalWithCoords } from "@/components/Map"
import { BookingModal } from "@/components/booking-modal"
import { locationToCoords } from "@/lib/utils/geo"

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop"

/** Fetch professionals from Supabase and map to the shape expected by the UI. */
async function fetchProfessionals(): Promise<any[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("professionals")
    .select(`
      id,
      specialty,
      location,
      consultation_type,
      consultation_price,
      online_price,
      in_person_price,
      verified,
      years_experience,
      languages,
      profile:profiles!professionals_id_fkey(first_name, last_name, avatar_url)
    `)

  if (error) throw error

  const langMap: Record<string, string> = {
    ES: "Español",
    EN: "Inglés",
    PT: "Portugués",
    FR: "Francés",
    DE: "Alemán",
  }

  return (data || []).map((row: any) => {
    const profile = row.profile || {}
    const name = `Dr. ${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Profesional"
    const price = row.consultation_price ?? row.online_price ?? row.in_person_price ?? 0
    const consultationType = row.consultation_type || "both"
    const languagesArray = Array.isArray(row.languages) && row.languages.length > 0
      ? row.languages.map((l: string) => langMap[l] || l)
      : ["Español"]

    return {
      id: row.id,
      name,
      specialty: row.specialty || "",
      specialtyEn: row.specialty || "",
      image: profile.avatar_url || DEFAULT_AVATAR,
      rating: 4.0,
      reviewCount: 0,
      price: typeof price === "number" ? String(price) : price,
      location: row.location || "",
      consultationTypes: consultationType === "both" ? ["online", "in-person"] : consultationType === "online" ? ["online"] : ["in-person"],
      verified: !!row.verified,
      isOnline: false,
      yearsExperience: row.years_experience ?? 0,
      languages: languagesArray,
    }
  })
}

// Mock data: al menos 6 profesionales ficticios para filtrado en tiempo real
const MOCK_PROFESSIONALS = [
  { id: "mock-1", name: "Dra. Elena Vargas", specialty: "Cardiología", specialtyEn: "Cardiology", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop", rating: 4.9, reviewCount: 124, price: "45.000", location: "Santiago", consultationTypes: ["online", "in-person"], verified: true, isOnline: true, yearsExperience: 12, languages: ["Español", "English"] },
  { id: "mock-2", name: "Dr. Carlos Méndez", specialty: "Psicología", specialtyEn: "Psychology", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop", rating: 4.8, reviewCount: 89, price: "35.000", location: "Santiago", consultationTypes: ["online"], verified: true, isOnline: false, yearsExperience: 8, languages: ["Español"] },
  { id: "mock-3", name: "Dra. Ana Torres", specialty: "Dermatología", specialtyEn: "Dermatology", image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop", rating: 4.7, reviewCount: 56, price: "55.000", location: "Valparaíso", consultationTypes: ["in-person"], verified: true, isOnline: false, yearsExperience: 6, languages: ["Español", "Italiano"] },
  { id: "mock-4", name: "Dr. Pablo Ruiz", specialty: "Cardiología", specialtyEn: "Cardiology", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop", rating: 4.6, reviewCount: 72, price: "50.000", location: "Temuco", consultationTypes: ["online", "in-person"], verified: false, isOnline: true, yearsExperience: 10, languages: ["Español"] },
  { id: "mock-5", name: "Dra. María López", specialty: "Psicología", specialtyEn: "Psychology", image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=200&fit=crop", rating: 5.0, reviewCount: 201, price: "40.000", location: "Concepción", consultationTypes: ["online"], verified: true, isOnline: true, yearsExperience: 15, languages: ["Español", "English"] },
  { id: "mock-6", name: "Dr. Jorge Silva", specialty: "Nutricionista", specialtyEn: "Nutritionist", image: "https://images.unsplash.com/photo-1612349316228-59459a970da3?w=200&h=200&fit=crop", rating: 4.5, reviewCount: 43, price: "28.000", location: "Santiago", consultationTypes: ["online", "in-person"], verified: true, isOnline: false, yearsExperience: 5, languages: ["Español"] },
]

function SearchResultsPageContent() {
  const searchParams = useSearchParams()
  const [view, setView] = useState<"grid" | "list">("grid")
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState<string>("all")
  const [suggestedSpecialty, setSuggestedSpecialty] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { language } = useLanguage()
  const t = useTranslations(language)
  const [professionals, setProfessionals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mobileMapView, setMobileMapView] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<any | null>(null)

  const predefinedSpecialties = language === "es" 
    ? ["Psicólogo", "Dentista", "Matrona", "Psiquiatra", "Kinesiólogo", "Nutricionista"]
    : ["Psychologist", "Dentist", "Midwife", "Psychiatrist", "Physiotherapist", "Nutritionist"]

  // Load professionals from Supabase; fallback to mock on error
  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const list = await fetchProfessionals()
        setProfessionals(list)
      } catch (err) {
        console.error("Error loading professionals:", err)
        setError(language === "es" ? "No se pudo cargar la lista desde la base de datos. Mostrando datos de ejemplo." : "Could not load from database. Showing sample data.")
        setProfessionals(MOCK_PROFESSIONALS)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [language])

  // Read search query from URL parameters
  useEffect(() => {
    const query = searchParams.get("q")
    if (query) {
      setSearchTerm(query)
      const queryLower = query.toLowerCase()
      const matchingSpecialty = predefinedSpecialties.find(
        (spec) => spec.toLowerCase().includes(queryLower) || queryLower.includes(spec.toLowerCase())
      )
      if (matchingSpecialty) {
        setSelectedSpecialties((prev) => {
          if (!prev.includes(matchingSpecialty)) return [...prev, matchingSpecialty]
          return prev
        })
      }
    }
  }, [searchParams, predefinedSpecialties])

  const handleSpecialtySubmit = () => {
    if (suggestedSpecialty.trim()) {
      console.log("Suggested specialty:", suggestedSpecialty)
      alert(language === "es" 
        ? `¡Gracias por tu sugerencia! Hemos recibido: ${suggestedSpecialty}`
        : `Thank you for your suggestion! We received: ${suggestedSpecialty}`)
      setSuggestedSpecialty("")
    }
  }

  // Filtrado en tiempo real: término de búsqueda + especialidad del sidebar (case-insensitive)
  const filteredProfessionals = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    const specFilter = selectedSpecialtyFilter === "all" ? null : selectedSpecialtyFilter

    return professionals.filter((prof) => {
      const matchesTerm = !term || [
        prof.name,
        language === "es" ? prof.specialty : prof.specialtyEn,
        prof.location,
      ].some((field) => String(field || "").toLowerCase().includes(term))

      const profSpecialtyLower = (language === "es" ? prof.specialty : prof.specialtyEn || prof.specialty)?.toLowerCase() ?? ""
      const matchesSpecialty = !specFilter || 
        profSpecialtyLower.includes(specFilter.toLowerCase()) ||
        (specFilter === "psychology" && (profSpecialtyLower.includes("psicolog") || profSpecialtyLower.includes("psycholog"))) ||
        (specFilter === "cardiology" && profSpecialtyLower.includes("cardio")) ||
        (specFilter === "dermatology" && (profSpecialtyLower.includes("dermato") || profSpecialtyLower.includes("dermatology")))

      return matchesTerm && matchesSpecialty
    })
  }, [professionals, searchTerm, selectedSpecialtyFilter, language])

  const professionalsWithCoords = useMemo((): ProfessionalWithCoords[] => {
    return filteredProfessionals
      .map((p) => {
        const coords = locationToCoords(p.location)
        if (!coords) return null
        return {
          ...p,
          lat: coords[0],
          lng: coords[1],
        }
      })
      .filter((p): p is ProfessionalWithCoords => p != null)
  }, [filteredProfessionals])

  return (
    <main className="min-h-screen relative">
      <PaperShaderBackground />
      <div className="absolute inset-0 pointer-events-none">
        <WavyBackground className="absolute inset-0" />
      </div>
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar sticky={false} />
        <div className="flex flex-col lg:flex-row flex-1 min-h-0">
          {/* Columna izquierda: lista (40% desktop, scroll independiente) */}
          <div
            className={cn(
              "w-full lg:w-[40%] flex-shrink-0 overflow-y-auto",
              "lg:border-r lg:border-border/40",
              mobileMapView && "hidden lg:block"
            )}
          >
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8">
        {/* Search Bar with Tags */}
        <div className="mb-8 space-y-4">
          <div className="bg-card rounded-2xl border border-teal-200/30 dark:border-teal-800/30 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <SearchIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h2 className="text-lg font-bold text-foreground">
                {language === "es" ? "Buscar por Especialidad" : "Search by Specialty"}
              </h2>
            </div>
            <div className="mb-4">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === "es" ? "Buscar por nombre, especialidad o ciudad..." : "Search by name, specialty or city..."}
                className="w-full px-4 py-3 rounded-xl bg-accent/20 border border-teal-200/30 dark:border-teal-800/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 mb-3"
                aria-label={language === "es" ? "Término de búsqueda" : "Search term"}
              />
              <InputWithTags
                placeholder={language === "es" ? "Buscar por especialidad..." : "Search by specialty..."}
                predefinedTags={predefinedSpecialties}
                value={selectedSpecialties}
                onChange={setSelectedSpecialties}
                limit={5}
                allowCustomTags={false}
              />
            </div>
          </div>

          {/* Suggest Missing Professional */}
          <div className="bg-gradient-to-r from-teal-50/50 to-teal-100/30 dark:from-teal-950/20 dark:to-teal-900/10 rounded-2xl border border-teal-200/30 dark:border-teal-800/30 p-6">
            <h3 className="text-base font-semibold text-foreground mb-2">
              {language === "es" ? "¿Qué profesional te gustaría ver aquí?" : "What professional would you like to see here?"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {language === "es" 
                ? "Tu sugerencia nos ayuda a crecer y ofrecerte más opciones."
                : "Your suggestion helps us grow and offer you more options."}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={suggestedSpecialty}
                onChange={(e) => setSuggestedSpecialty(e.target.value)}
                placeholder={language === "es" ? "Ej: Nutricionista, Terapeuta..." : "E.g: Nutritionist, Therapist..."}
                className="flex-1 px-4 py-2.5 bg-background border border-teal-200/30 dark:border-teal-800/30 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 dark:focus:border-teal-500"
                onKeyDown={(e) => e.key === "Enter" && handleSpecialtySubmit()}
              />
              <Button
                onClick={handleSpecialtySubmit}
                disabled={!suggestedSpecialty.trim()}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                {language === "es" ? "Sugerir" : "Suggest"}
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
          {/* Filters Sidebar - Collapsible */}
          <aside className="w-full md:w-72 shrink-0">
            <div className="bg-card rounded-2xl border border-border/40 p-4">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="w-full flex items-center justify-between p-3 hover:bg-accent/50 rounded-xl transition-colors"
              >
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Filter className="h-5 w-5" /> 
                  {language === "es" ? "Filtros" : "Filters"}
                </h2>
                {filtersOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>

              {filtersOpen && (
                <div className="mt-4 space-y-6 pt-4 border-t border-border/40">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground">
                      {language === "es" ? "Especialidad" : "Specialty"}
                    </label>
                    <Select value={selectedSpecialtyFilter} onValueChange={setSelectedSpecialtyFilter}>
                      <SelectTrigger className="w-full rounded-xl bg-accent/20 border-none">
                        <SelectValue placeholder={language === "es" ? "Todas las especialidades" : "All Specialties"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{language === "es" ? "Todas las especialidades" : "All Specialties"}</SelectItem>
                        <SelectItem value="psychology">{language === "es" ? "Psicología" : "Psychology"}</SelectItem>
                        <SelectItem value="cardiology">{language === "es" ? "Cardiología" : "Cardiology"}</SelectItem>
                        <SelectItem value="dermatology">{language === "es" ? "Dermatología" : "Dermatology"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground">
                      {language === "es" ? "Tipo de consulta" : "Consultation Type"}
                    </label>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" className="justify-start rounded-xl bg-transparent gap-3 border-border/40">
                        <Video className="h-4 w-4" /> 
                        {language === "es" ? "Consulta online" : "Online Session"}
                      </Button>
                      <Button variant="outline" className="justify-start rounded-xl bg-transparent gap-3 border-border/40">
                        <Home className="h-4 w-4" /> 
                        {language === "es" ? "Consulta presencial" : "In-person Visit"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground">
                      {language === "es" ? "Rango de precio" : "Price Range"}
                    </label>
                    <div className="pt-4 px-2">
                      <Slider defaultValue={[20000, 80000]} max={100000} step={5000} className="text-primary" />
                      <div className="flex justify-between mt-4 text-xs font-medium">
                        <span>$20k</span>
                        <span>$100k+</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground">
                      {language === "es" ? "Idioma" : "Language"}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["Spanish", "English", "Italian", "French"].map((lang) => (
                        <Badge
                          key={lang}
                          variant="outline"
                          className="rounded-full px-3 py-1 cursor-pointer hover:border-primary hover:text-primary transition-all bg-transparent"
                        >
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-primary text-sm font-medium"
                    onClick={() => {
                      setSelectedSpecialties([])
                      setSearchTerm("")
                      setSelectedSpecialtyFilter("all")
                      setFiltersOpen(false)
                    }}
                  >
                    {language === "es" ? "Limpiar filtros" : "Clear all"}
                  </Button>
                </div>
              )}
            </div>
          </aside>
          </div>

          {/* Search Results */}
          <section className="flex-1 space-y-6 min-w-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 sm:p-6 rounded-2xl border border-border/40 shadow-sm">
              <div>
                <h1 className="text-xl font-semibold">
                  {language === "es" 
                    ? `${filteredProfessionals.length} profesionales encontrados`
                    : `${filteredProfessionals.length} professionals found`}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {language === "es" ? "En Santiago • Online" : "In Santiago • Online"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 border border-border/40 rounded-xl overflow-hidden">
                  <Button
                    variant={view === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setView("grid")}
                    className="rounded-none border-none"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={view === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setView("list")}
                    className="rounded-none border-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm font-medium text-muted-foreground">{language === "es" ? "Ordenar:" : "Sort by:"}</span>
                <Select defaultValue="relevance">
                  <SelectTrigger className="w-40 border-none bg-accent/20 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">{language === "es" ? "Relevancia" : "Relevance"}</SelectItem>
                    <SelectItem value="rating">{language === "es" ? "Mejor Calificados" : "Top Rated"}</SelectItem>
                    <SelectItem value="price-low">{language === "es" ? "Precio: Menor a Mayor" : "Price: Low to High"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
                {error}
              </div>
            )}

            <div className={cn(
              view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-6"
            )}>
              {loading ? (
                <div className="col-span-full text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    {language === "es" ? "Cargando profesionales..." : "Loading professionals..."}
                  </p>
                </div>
              ) : filteredProfessionals.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-lg font-semibold text-foreground mb-2">
                    {language === "es" ? "No encontramos profesionales con esos criterios" : "We didn't find any professionals matching those criteria"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === "es" 
                      ? "Intenta con otros filtros o elimina algunos tags para ver más resultados."
                      : "Try different filters or remove some tags to see more results."}
                  </p>
                </div>
              ) : (
                filteredProfessionals.map((prof) => (
                <ProfileCard
                  key={prof.id}
                  id={prof.id}
                  name={prof.name}
                  specialty={language === "es" ? prof.specialty : prof.specialtyEn}
                  avatarUrl={prof.image}
                  rating={prof.rating}
                  reviewsCount={prof.reviewCount || 0}
                  duration="60 min"
                  rate={prof.price}
                  location={prof.location}
                  consultationType={prof.consultationTypes?.includes('online') && prof.consultationTypes?.includes('in-person') 
                    ? 'both' 
                    : prof.consultationTypes?.includes('online') 
                    ? 'online' 
                    : 'in-person'}
                  verified={prof.verified || false}
                  isOnline={prof.isOnline}
                  yearsExperience={prof.yearsExperience}
                  languages={prof.languages}
                  onGetInTouch={() => window.location.href = `/professionals/${prof.id}`}
                />
                ))
              )}
            </div>
          </section>
        </div>
          </div>

          {/* Columna derecha: mapa sticky (60% desktop) */}
          <div
            className={cn(
              "w-full flex-1 min-h-[360px] lg:min-h-0 lg:w-[60%] lg:sticky lg:top-0 lg:self-start lg:h-[calc(100vh-4rem)]",
              !mobileMapView && "hidden lg:block"
            )}
          >
            <div className="h-full w-full p-2 lg:p-4">
              <Map
                professionals={professionalsWithCoords}
                onAgendar={(prof) => {
                  setSelectedProfessional(prof)
                  setBookingOpen(true)
                }}
                isSpanish={language === "es"}
                className="h-full min-h-[340px] lg:min-h-0"
              />
            </div>
          </div>
        </div>

        {/* Botón flotante móvil: alternar Ver Mapa / Ver Lista */}
        <Button
          onClick={() => setMobileMapView((v) => !v)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden rounded-full px-6 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
          aria-label={mobileMapView ? (language === "es" ? "Ver lista" : "View list") : (language === "es" ? "Ver mapa" : "View map")}
        >
          {mobileMapView ? (
            <>
              <List className="h-4 w-4 mr-2" />
              {language === "es" ? "Ver Lista" : "View List"}
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4 mr-2" />
              {language === "es" ? "Ver Mapa" : "View Map"}
            </>
          )}
        </Button>
      </div>

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => { setBookingOpen(false); setSelectedProfessional(null) }}
        professionalId={selectedProfessional?.id}
        professionalName={selectedProfessional?.name}
        stellarWallet={selectedProfessional?.stellarWallet ?? null}
        offersInPerson={selectedProfessional?.consultationTypes?.includes("in-person") ?? true}
        isSpanish={language === "es"}
      />
    </main>
  )
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen relative">
        <PaperShaderBackground />
        <div className="absolute inset-0 pointer-events-none">
          <WavyBackground className="absolute inset-0" />
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </main>
    }>
      <SearchResultsPageContent />
    </Suspense>
  )
}
