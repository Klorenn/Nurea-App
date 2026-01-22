"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter, Video, Home, Grid3x3, List, Search as SearchIcon, Plus, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
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

function SearchResultsPageContent() {
  const searchParams = useSearchParams()
  const [view, setView] = useState<"grid" | "list">("grid")
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [suggestedSpecialty, setSuggestedSpecialty] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { language } = useLanguage()
  const t = useTranslations(language)
  const [professionals, setProfessionals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const predefinedSpecialties = language === "es" 
    ? ["Psicólogo", "Dentista", "Matrona", "Psiquiatra", "Kinesiólogo", "Nutricionista"]
    : ["Psychologist", "Dentist", "Midwife", "Psychiatrist", "Physiotherapist", "Nutritionist"]

  // Load professionals from API
  useEffect(() => {
    const loadProfessionals = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (selectedSpecialties.length > 0) {
          params.append('specialty', selectedSpecialties[0]) // Use first specialty for now
        }

        const response = await fetch(`/api/professionals?${params.toString()}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Error al cargar profesionales')
        }

        setProfessionals(data.professionals || [])
      } catch (err) {
        console.error('Error loading professionals:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar profesionales')
      } finally {
        setLoading(false)
      }
    }

    loadProfessionals()
  }, [selectedSpecialties])

  // Read search query from URL parameters
  useEffect(() => {
    const query = searchParams.get("q")
    
    if (query) {
      // If there's a query parameter, try to match it with predefined specialties
      const queryLower = query.toLowerCase()
      const matchingSpecialty = predefinedSpecialties.find(
        (spec) => spec.toLowerCase().includes(queryLower) || queryLower.includes(spec.toLowerCase())
      )
      if (matchingSpecialty) {
        setSelectedSpecialties((prev) => {
          if (!prev.includes(matchingSpecialty)) {
            return [...prev, matchingSpecialty]
          }
          return prev
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Fix search functionality when switching tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Re-initialize any necessary state when tab becomes visible
        // This ensures the search input and filtering continue to work
        // Force a re-render if needed by updating a dummy state
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  const handleSpecialtySubmit = () => {
    if (suggestedSpecialty.trim()) {
      // Here you would send the suggestion to your backend
      console.log("Suggested specialty:", suggestedSpecialty)
      alert(language === "es" 
        ? `¡Gracias por tu sugerencia! Hemos recibido: ${suggestedSpecialty}`
        : `Thank you for your suggestion! We received: ${suggestedSpecialty}`)
      setSuggestedSpecialty("")
    }
  }

  // Filter professionals based on selected specialties
  // Filter professionals by selected specialties (client-side filtering for additional filters)
  const filteredProfessionals = selectedSpecialties.length > 0
    ? professionals.filter((prof) => {
        const profSpecialty = language === "es" ? prof.specialty : prof.specialtyEn
        return selectedSpecialties.some((spec) => 
          profSpecialty.toLowerCase().includes(spec.toLowerCase()) ||
          spec.toLowerCase().includes(profSpecialty.toLowerCase())
        )
      })
    : professionals

  return (
    <main className="min-h-screen relative">
      <PaperShaderBackground />
      <div className="absolute inset-0 pointer-events-none">
        <WavyBackground className="absolute inset-0" />
      </div>
      <div className="relative z-10 min-h-screen">
        <Navbar sticky={false} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
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
                    <Select>
                      <SelectTrigger className="w-full rounded-xl bg-accent/20 border-none">
                        <SelectValue placeholder={language === "es" ? "Todas las especialidades" : "All Specialties"} />
                      </SelectTrigger>
                      <SelectContent>
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
                      setFiltersOpen(false)
                    }}
                  >
                    {language === "es" ? "Limpiar filtros" : "Clear all"}
                  </Button>
                </div>
              )}
            </div>
          </aside>

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
              ) : error ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-lg font-semibold text-destructive mb-2">
                    {language === "es" ? "Error al cargar profesionales" : "Error loading professionals"}
                  </p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              ) : filteredProfessionals.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-lg font-semibold text-foreground mb-2">
                    {language === "es" ? "No se encontraron profesionales" : "No professionals found"}
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
      </div>
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
