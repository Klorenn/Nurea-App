"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  Search,
  X,
  Star,
  ShieldCheck,
  Clock,
  Video,
  Building2,
  MapPin,
  Calendar,
  ChevronRight,
  Sparkles,
  Filter,
  SlidersHorizontal,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { VerifiedBadge } from "@/components/verified-badge"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

interface Doctor {
  id: string
  name: string
  specialty: string
  avatarUrl?: string
  rating: number
  reviewCount: number
  price: number
  nextAvailable: {
    date: string
    time: string
    isToday: boolean
    isTomorrow: boolean
  }
  location: string
  consultationType: "online" | "in-person" | "both"
  yearsExperience: number
  isVerified: boolean
  languages: string[]
}

const mockDoctors: Doctor[] = [
  {
    id: "1",
    name: "Dra. María Fernández González",
    specialty: "Psicóloga Clínica",
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
    rating: 4.9,
    reviewCount: 127,
    price: 25000,
    nextAvailable: {
      date: "Hoy",
      time: "16:30",
      isToday: true,
      isTomorrow: false,
    },
    location: "Providencia, Santiago",
    consultationType: "both",
    yearsExperience: 12,
    isVerified: true,
    languages: ["Español", "Inglés"],
  },
  {
    id: "2",
    name: "Dr. Carlos Andrés Muñoz",
    specialty: "Médico General",
    avatarUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face",
    rating: 4.8,
    reviewCount: 89,
    price: 20000,
    nextAvailable: {
      date: "Mañana",
      time: "10:00",
      isToday: false,
      isTomorrow: true,
    },
    location: "Las Condes, Santiago",
    consultationType: "online",
    yearsExperience: 8,
    isVerified: true,
    languages: ["Español"],
  },
  {
    id: "3",
    name: "Dra. Ana Lucía Herrera",
    specialty: "Pediatra",
    avatarUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face",
    rating: 5.0,
    reviewCount: 203,
    price: 30000,
    nextAvailable: {
      date: "Hoy",
      time: "18:00",
      isToday: true,
      isTomorrow: false,
    },
    location: "Vitacura, Santiago",
    consultationType: "both",
    yearsExperience: 15,
    isVerified: true,
    languages: ["Español", "Portugués"],
  },
  {
    id: "4",
    name: "Dr. Roberto Silva Campos",
    specialty: "Nutricionista",
    avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face",
    rating: 4.7,
    reviewCount: 56,
    price: 22000,
    nextAvailable: {
      date: "Miércoles",
      time: "09:30",
      isToday: false,
      isTomorrow: false,
    },
    location: "Ñuñoa, Santiago",
    consultationType: "online",
    yearsExperience: 6,
    isVerified: true,
    languages: ["Español"],
  },
]

const filterPills = [
  { id: "today", label: "Disponibles Hoy", labelEn: "Available Today", icon: Clock },
  { id: "psychology", label: "Psicología", labelEn: "Psychology", icon: null },
  { id: "general", label: "Medicina General", labelEn: "General Medicine", icon: null },
  { id: "pediatrics", label: "Pediatría", labelEn: "Pediatrics", icon: null },
  { id: "top-rated", label: "Mejor Valorados", labelEn: "Top Rated", icon: Star },
  { id: "online", label: "Solo Online", labelEn: "Online Only", icon: Video },
]

function TrustBanner({ isSpanish }: { isSpanish: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="max-w-3xl mx-auto"
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 to-teal-500 p-4 sm:p-5 shadow-lg shadow-teal-600/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyek0zNCAyNGgtMnYtNGgydjR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative flex items-center justify-center gap-3 text-white">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-sm shrink-0">
            <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="text-center sm:text-left">
            <p className="font-bold text-sm sm:text-base">
              {isSpanish ? "Garantía NUREA" : "NUREA Guarantee"}
            </p>
            <p className="text-xs sm:text-sm text-white/90">
              {isSpanish
                ? "El 100% de nuestros profesionales están verificados por la Superintendencia de Salud de Chile"
                : "100% of our professionals are verified by the Chilean Health Superintendence"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function DoctorCard({
  doctor,
  isSpanish,
  index,
}: {
  doctor: Doctor
  isSpanish: boolean
  index: number
}) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getAvailabilityText = () => {
    if (doctor.nextAvailable.isToday) {
      return isSpanish ? "Hoy" : "Today"
    }
    if (doctor.nextAvailable.isTomorrow) {
      return isSpanish ? "Mañana" : "Tomorrow"
    }
    return doctor.nextAvailable.date
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className="overflow-hidden border-slate-200/80 dark:border-slate-700/60 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300">
        <CardContent className="p-0">
          {/* Next Available Badge - Prominente */}
          <div className="px-5 pt-5">
            <div
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold",
                doctor.nextAvailable.isToday
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
              )}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {isSpanish ? "Próxima hora:" : "Next available:"}{" "}
                <span className="font-bold">
                  {getAvailabilityText()}, {doctor.nextAvailable.time} hrs
                </span>
              </span>
            </div>
          </div>

          {/* Doctor Info */}
          <div className="p-5 pt-4">
            <div className="flex gap-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-2 border-slate-100 dark:border-slate-700">
                  <AvatarImage
                    src={doctor.avatarUrl}
                    alt={doctor.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 text-white text-2xl font-bold">
                    {doctor.name.split(" ")[0][0]}
                    {doctor.name.split(" ")[1]?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-2">
                {/* Name + Verified Badge */}
                <div className="flex items-start gap-2">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate group-hover:text-teal-600 transition-colors">
                    {doctor.name}
                  </h3>
                  {doctor.isVerified && (
                    <VerifiedBadge variant="compact" isSpanish={isSpanish} />
                  )}
                </div>

                {/* Specialty */}
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {doctor.specialty}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">
                      {doctor.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    ({doctor.reviewCount} {isSpanish ? "opiniones" : "reviews"})
                  </span>
                </div>

                {/* Modality Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {(doctor.consultationType === "online" ||
                    doctor.consultationType === "both") && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] gap-1 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900"
                    >
                      <Video className="h-3 w-3" />
                      {isSpanish ? "Telemedicina" : "Telemedicine"}
                    </Badge>
                  )}
                  {(doctor.consultationType === "in-person" ||
                    doctor.consultationType === "both") && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] gap-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900"
                    >
                      <Building2 className="h-3 w-3" />
                      {isSpanish ? "Presencial" : "In-person"}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Price & Actions */}
          <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              {/* Price */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                  {isSpanish ? "Consulta" : "Consultation"}
                </p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {formatPrice(doctor.price)}
                  <span className="text-xs font-normal text-slate-500 ml-1">CLP</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs h-9 px-3"
                  asChild
                >
                  <Link href={`/professionals/${doctor.id}`}>
                    {isSpanish ? "Ver Perfil" : "View Profile"}
                  </Link>
                </Button>
                <Button
                  size="sm"
                  className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs h-9 px-4 shadow-md shadow-teal-600/20"
                  asChild
                >
                  <Link href={`/booking/${doctor.id}`}>
                    {isSpanish ? "Agendar Cita" : "Book Appointment"}
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function EmptyState({
  isSpanish,
  onClearFilters,
}: {
  isSpanish: boolean
  onClearFilters: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="col-span-full py-20"
    >
      <div className="max-w-md mx-auto text-center">
        {/* Ilustración suave */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-100 to-teal-50 dark:from-teal-900/30 dark:to-teal-800/20 rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="h-12 w-12 text-teal-400" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-slate-400" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          {isSpanish
            ? "No encontramos resultados exactos"
            : "No exact results found"}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          {isSpanish
            ? "No encontramos especialistas exactos para esta búsqueda, pero tenemos excelentes profesionales en áreas similares."
            : "We couldn't find exact specialists for this search, but we have excellent professionals in similar areas."}
        </p>
        <Button
          onClick={onClearFilters}
          variant="outline"
          className="rounded-xl border-teal-500/50 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/30"
        >
          <X className="h-4 w-4 mr-2" />
          {isSpanish ? "Limpiar filtros" : "Clear filters"}
        </Button>
      </div>
    </motion.div>
  )
}

export default function SearchPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"

  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [showResults, setShowResults] = useState(true)

  const toggleFilter = (filterId: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId]
    )
  }

  const clearFilters = () => {
    setActiveFilters([])
    setSearchTerm("")
    setShowResults(true)
  }

  const filteredDoctors = useMemo(() => {
    let results = mockDoctors

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      results = results.filter(
        (d) =>
          d.name.toLowerCase().includes(term) ||
          d.specialty.toLowerCase().includes(term)
      )
    }

    if (activeFilters.includes("today")) {
      results = results.filter((d) => d.nextAvailable.isToday)
    }

    if (activeFilters.includes("top-rated")) {
      results = results.filter((d) => d.rating >= 4.8)
    }

    if (activeFilters.includes("online")) {
      results = results.filter(
        (d) => d.consultationType === "online" || d.consultationType === "both"
      )
    }

    return results
  }, [searchTerm, activeFilters])

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-8 pb-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/95 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              {isSpanish
                ? "Encuentra al especialista ideal para ti"
                : "Find the ideal specialist for you"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {isSpanish
                ? "Profesionales verificados, agendamiento inmediato"
                : "Verified professionals, instant booking"}
            </p>
          </motion.div>

          {/* Trust Banner */}
          <TrustBanner isSpanish={isSpanish} />

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-teal-600/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    isSpanish
                      ? "Buscar por especialidad, nombre o síntoma..."
                      : "Search by specialty, name or symptom..."
                  }
                  className={cn(
                    "w-full pl-14 pr-14 py-4 sm:py-5 text-base sm:text-lg",
                    "bg-white dark:bg-slate-800",
                    "border-2 border-slate-200 dark:border-slate-700 rounded-2xl",
                    "focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10",
                    "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                    "shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50",
                    "transition-all duration-200"
                  )}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4 text-slate-400" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Filter Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            <div className="flex items-center gap-2 min-w-max justify-center">
              {filterPills.map((pill) => {
                const isActive = activeFilters.includes(pill.id)
                return (
                  <button
                    key={pill.id}
                    onClick={() => toggleFilter(pill.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium",
                      "border transition-all duration-200",
                      isActive
                        ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/30"
                    )}
                  >
                    {pill.icon && (
                      <pill.icon
                        className={cn(
                          "h-3.5 w-3.5",
                          isActive ? "text-white" : "text-slate-400"
                        )}
                      />
                    )}
                    {isSpanish ? pill.label : pill.labelEn}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <motion.p
              key={filteredDoctors.length}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-slate-600 dark:text-slate-400"
            >
              {isSpanish ? "Mostrando" : "Showing"}{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {filteredDoctors.length}
              </span>{" "}
              {isSpanish ? "especialistas" : "specialists"}
            </motion.p>

            <Button
              variant="outline"
              size="sm"
              className="rounded-xl text-xs gap-2"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {isSpanish ? "Más filtros" : "More filters"}
            </Button>
          </div>

          {/* Results Grid */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {showResults && filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor, index) => (
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    isSpanish={isSpanish}
                    index={index}
                  />
                ))
              ) : (
                <EmptyState isSpanish={isSpanish} onClearFilters={clearFilters} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </main>
  )
}
