"use client"

import { useState, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
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
  Calendar,
  ChevronRight,
  Sparkles,
  Filter,
  Users,
  GraduationCap,
  MapPin,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { VerifiedBadge } from "@/components/verified-badge"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface Doctor {
  id: string
  name: string
  specialty: string
  category: string
  avatarUrl?: string
  rating: number
  reviewCount: number
  patientsCount: number
  bio: string
  education: string[]
  nextAvailable: {
    date: string
    time: string
    isToday: boolean
    isTomorrow: boolean
    timestamp: number // for sorting
  }
  location: string
  consultationType: "online" | "in-person" | "both"
  isVerified: boolean
}

const mockDoctors: Doctor[] = [
  {
    id: "1",
    name: "Dra. María Fernández González",
    specialty: "Psicología Clínica",
    category: "Psicología",
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
    rating: 4.9,
    reviewCount: 127,
    patientsCount: 1240,
    bio: "Especialista en terapia cognitivo-conductual con más de 12 años de experiencia ayudando a pacientes con ansiedad y depresión.",
    education: ["Magíster en Psicología Clínica, PUC", "Especialidad en Terapia Breve, U. de Chile"],
    nextAvailable: {
      date: "Hoy",
      time: "16:30",
      isToday: true,
      isTomorrow: false,
      timestamp: Date.now() + 2 * 60 * 60 * 1000,
    },
    location: "Providencia, Santiago",
    consultationType: "both",
    isVerified: true,
  },
  {
    id: "2",
    name: "Dr. Carlos Andrés Muñoz",
    specialty: "Médico General",
    category: "Medicina General",
    avatarUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face",
    rating: 4.8,
    reviewCount: 89,
    patientsCount: 3200,
    bio: "Enfoque integral en medicina preventiva y salud familiar. Comprometido con el bienestar a largo plazo de sus pacientes.",
    education: ["Médico Cirujano, U. de Concepción", "Diplomado en Salud Familiar"],
    nextAvailable: {
      date: "Mañana",
      time: "10:00",
      isToday: false,
      isTomorrow: true,
      timestamp: Date.now() + 24 * 60 * 60 * 1000,
    },
    location: "Las Condes, Santiago",
    consultationType: "online",
    isVerified: true,
  },
  {
    id: "3",
    name: "Dra. Ana Lucía Herrera",
    specialty: "Pediatría",
    category: "Pediatría",
    avatarUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face",
    rating: 5.0,
    reviewCount: 203,
    patientsCount: 4500,
    bio: "Dedicada al cuidado de niños y adolescentes. Especialista en nutrición infantil y desarrollo temprano.",
    education: ["Pediatría, U. Católica", "Fellowship en Nutrición Infantil, Miami Children's Hospital"],
    nextAvailable: {
      date: "Hoy",
      time: "18:00",
      isToday: true,
      isTomorrow: false,
      timestamp: Date.now() + 4 * 60 * 60 * 1000,
    },
    location: "Vitacura, Santiago",
    consultationType: "both",
    isVerified: true,
  },
  {
    id: "4",
    name: "Dr. Roberto Silva Campos",
    specialty: "Cardiología",
    category: "Cardiología",
    avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face",
    rating: 4.7,
    reviewCount: 56,
    patientsCount: 1800,
    bio: "Especialista en cardiología intervencionista. Experto en prevención de enfermedades cardiovasculares.",
    education: ["Cardiología, U. de Chile", "Especialización en Intervencionismo, Madrid"],
    nextAvailable: {
      date: "Próxima semana",
      time: "09:30",
      isToday: false,
      isTomorrow: false,
      timestamp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    },
    location: "Ñuñoa, Santiago",
    consultationType: "online",
    isVerified: true,
  },
]

const specialties = [
  "Todos",
  "Medicina General",
  "Psicología",
  "Pediatría",
  "Cardiología",
  "Dermatología",
  "Nutrición",
  "Ginecología",
]

// Map slugs (from URL) to display names
const specialtySlugMap: Record<string, string> = {
  "medicina-general": "Medicina General",
  "psicologia": "Psicología",
  "pediatria": "Pediatría",
  "cardiologia": "Cardiología",
  "dermatologia": "Dermatología",
  "nutricion": "Nutrición",
  "ginecologia": "Ginecología",
  "oftalmologia": "Todos", // fallback
  "traumatologia": "Todos",
}

function TrustBanner({ isSpanish }: { isSpanish: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="max-w-3xl mx-auto"
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 p-5 sm:p-6 shadow-xl shadow-teal-900/10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="relative flex items-center justify-center gap-4 text-white text-center sm:text-left">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shrink-0">
            <ShieldCheck className="h-6 w-6 text-teal-300" />
          </div>
          <div>
            <p className="font-bold text-base sm:text-lg">
              {isSpanish ? "Excelencia Médica Garantizada" : "Guaranteed Medical Excellence"}
            </p>
            <p className="text-xs sm:text-sm text-teal-50/90 leading-relaxed max-w-xl">
              {isSpanish
                ? "NUREA prioriza el expertise y la reputación. Todos nuestros especialistas pasan por un riguroso proceso de verificación (SIS)."
                : "NUREA prioritizes expertise and reputation. All our specialists undergo a rigorous verification process (SIS)."}
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group"
    >
      <Card className="overflow-hidden border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:border-teal-500/50 dark:hover:border-teal-500/50 hover:shadow-2xl hover:shadow-teal-500/5 transition-all duration-500 rounded-3xl">
        <CardContent className="p-0">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar Column */}
              <div className="relative shrink-0 flex flex-col items-center sm:items-start gap-3">
                <div className="relative group/avatar">
                  <div className="absolute inset-0 bg-teal-500 rounded-[2rem] blur-xl opacity-0 group-hover/avatar:opacity-20 transition-opacity" />
                  <Avatar className="h-24 w-24 sm:h-28 sm:w-28 rounded-[2rem] border-4 border-white dark:border-slate-800 shadow-sm relative z-10">
                    <AvatarImage
                      src={doctor.avatarUrl}
                      alt={doctor.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-[2rem] bg-slate-100 dark:bg-slate-800 text-slate-400">
                      {doctor.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                {doctor.isVerified && (
                  <VerifiedBadge variant="card" showLabel isSpanish={isSpanish} className="w-full" />
                )}
              </div>

              {/* Content Column */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-2">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-tight group-hover:text-teal-600 transition-colors">
                        {doctor.name}
                      </h3>
                      <p className="text-base font-bold text-teal-600 dark:text-teal-400 mt-1">
                        {doctor.specialty}
                      </p>
                    </div>
                    
                    {/* Availability Badge */}
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      doctor.nextAvailable.isToday 
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" 
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    )}>
                      <Calendar className="h-3 w-3" />
                      {isSpanish ? "Próxima:" : "Next:"} {doctor.nextAvailable.date}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-4">
                    <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {doctor.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 border-l border-slate-300 dark:border-slate-700 pl-1.5 ml-0.5">
                        {doctor.reviewCount} {isSpanish ? "reseñas" : "reviews"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-sm">
                      <Users className="h-4 w-4 text-teal-500" />
                      <span className="font-medium">
                        {doctor.patientsCount}+ {isSpanish ? "pacientes" : "patients"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-sm">
                      <MapPin className="h-4 w-4 text-teal-500" />
                      <span className="font-medium truncate max-w-[150px]">
                        {doctor.location}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="rounded-lg h-9 gap-2 border-slate-200 dark:border-slate-700 font-medium px-3">
                      <Clock className="h-3.5 w-3.5 text-teal-500" />
                      {doctor.nextAvailable.time} hrs
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="sm" className="rounded-xl font-bold h-10 px-4 hover:bg-slate-100 dark:hover:bg-slate-800">
                          {isSpanish ? "Ver Perfil" : "View Profile"}
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto border-l-teal-500/10">
                        <SheetHeader className="text-left space-y-4">
                          <div className="relative pt-6">
                            <Avatar className="h-24 w-24 rounded-3xl border-4 border-white dark:border-slate-800 shadow-xl mb-4">
                              <AvatarImage src={doctor.avatarUrl} className="object-cover" />
                              <AvatarFallback>{doctor.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                            <SheetTitle className="text-2xl font-black">{doctor.name}</SheetTitle>
                            <span className="text-teal-600 dark:text-teal-400 font-bold text-lg">{doctor.specialty}</span>
                          </div>
                          
                          <VerifiedBadge variant="card" isSpanish={isSpanish} showLabel />
                          
                          <div className="space-y-6 pt-4">
                            <div className="space-y-2">
                              <h4 className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider text-xs">{isSpanish ? "Biografía" : "Biography"}</h4>
                              <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic">{doctor.bio}</p>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider text-xs">{isSpanish ? "Especialización" : "Education"}</h4>
                              <ul className="space-y-2">
                                {doctor.education.map((edu, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <GraduationCap className="h-4 w-4 text-teal-500 mt-0.5" />
                                    <span>{edu}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="bg-teal-50 dark:bg-teal-950/20 p-5 rounded-3xl border border-teal-100 dark:border-teal-900/50">
                              <p className="text-teal-800 dark:text-teal-200 font-bold mb-3 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {isSpanish ? "Siguiente disponibilidad" : "Next Availability"}
                              </p>
                              <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm">
                                <div>
                                  <p className="text-xs text-slate-500">{doctor.nextAvailable.date}</p>
                                  <p className="text-lg font-black">{doctor.nextAvailable.time} hrs</p>
                                </div>
                                <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 shadow-lg shadow-teal-600/20" asChild>
                                  <Link href={`/booking/${doctor.id}`}>
                                    {isSpanish ? "Agendar" : "Book Now"}
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </SheetHeader>
                      </SheetContent>
                    </Sheet>

                    <Button className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold h-10 px-5 shadow-lg shadow-teal-600/20 group/btn" asChild>
                      <Link href={`/booking/${doctor.id}`} className="flex items-center gap-1.5">
                        {isSpanish ? "Agendar" : "Book"}
                        <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function SearchContent() {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const searchParams = useSearchParams()

  const initialQ = searchParams.get("q") || ""
  const specialtySlug = searchParams.get("specialty") || ""
  const initialSpecialty = specialtySlugMap[specialtySlug] || "Todos"

  const [searchTerm, setSearchTerm] = useState(initialQ)
  const [activeSpecialty, setActiveSpecialty] = useState(initialSpecialty)
  const [activeAvailability, setActiveAvailability] = useState("Cualquier fecha")
  const [minRating, setMinRating] = useState(0)

  // Combined Search Suggestions (Specialties + Doctors)
  const suggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return []
    const term = searchTerm.toLowerCase()
    
    const matchedSpecialties = specialties
      .filter(s => s !== "Todos" && s.toLowerCase().includes(term))
      .map(s => ({ type: "specialty", text: s }))

    const matchedDoctors = mockDoctors
      .filter(d => d.name.toLowerCase().includes(term))
      .map(d => ({ type: "doctor", text: d.name }))

    return [...matchedSpecialties, ...matchedDoctors].slice(0, 5)
  }, [searchTerm])

  const sortedAndFilteredDoctors = useMemo(() => {
    let results = [...mockDoctors]

    // Search Logic
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      results = results.filter(
        (d) =>
          d.name.toLowerCase().includes(term) ||
          d.specialty.toLowerCase().includes(term)
      )
    }

    // Filter Logic
    if (activeSpecialty !== "Todos") {
      results = results.filter(d => d.category === activeSpecialty || d.specialty.includes(activeSpecialty))
    }

    if (activeAvailability === "Hoy") {
      results = results.filter(d => d.nextAvailable.isToday)
    } else if (activeAvailability === "Mañana") {
      results = results.filter(d => d.nextAvailable.isTomorrow)
    }

    if (minRating > 0) {
      results = results.filter(d => d.rating >= minRating)
    }

    // ORDERING ALGORITHM: Reputation (Rating) * Weight + Availability Proximity
    // We want higher rating AND closer dates at the top
    return results.sort((a, b) => {
      // Priority 1: Availability Proximity (Earlier is better)
      if (a.nextAvailable.timestamp !== b.nextAvailable.timestamp) {
        return a.nextAvailable.timestamp - b.nextAvailable.timestamp
      }
      // Priority 2: Rating (Higher is better)
      return b.rating - a.rating
    })
  }, [searchTerm, activeSpecialty, activeAvailability, minRating])

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />

      {/* Back to dashboard bar */}
      <div className="border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {isSpanish ? "Volver al Dashboard" : "Back to Dashboard"}
          </Link>
        </div>
      </div>

      {/* Hero Search Section */}
      <section className="relative pt-12 pb-16 px-4 overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-teal-50/50 dark:from-teal-950/20 to-transparent -z-10" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-teal-200/20 dark:bg-teal-700/5 blur-[120px] rounded-full -z-10" />

        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-slate-50 tracking-tight"
            >
              {isSpanish ? "Busca Calidad," : "Search Quality,"}{" "}
              <span className="text-teal-600 block sm:inline">No Precios.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 dark:text-slate-400 text-lg sm:text-xl font-medium max-w-2xl mx-auto"
            >
              {isSpanish 
                ? "Conectamos pacientes con los mejores especialistas de Chile basándonos en rigor médico y reputación." 
                : "We connect patients with Chile's best specialists based on medical rigor and reputation."}
            </motion.p>
          </div>

          <TrustBanner isSpanish={isSpanish} />

          {/* Search Bar with Suggestions */}
          <div className="max-w-3xl mx-auto relative z-50">
            <div className="relative group">
              <div className="absolute inset-0 bg-teal-500/10 dark:bg-teal-500/5 blur-2xl rounded-3xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <div className="relative bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-none focus-within:border-teal-500 transition-all">
                <Search className="absolute left-6 top-1.2 -translate-y-1/2 top-[50%] h-6 w-6 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={isSpanish ? "Especialidad o nombre del doctor..." : "Specialty or doctor name..."}
                  className="w-full pl-16 pr-20 py-6 bg-transparent border-none focus:ring-0 text-xl font-medium placeholder:text-slate-400"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-4 right-4 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden"
                  >
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSearchTerm(s.text)
                        }}
                        className="w-full px-6 py-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                      >
                        {s.type === "specialty" ? <Sparkles className="h-4 w-4 text-teal-500" /> : <Users className="h-4 w-4 text-slate-400" />}
                        <span className="font-bold text-slate-700 dark:text-slate-200">{s.text}</span>
                        <span className="ml-auto text-xs text-slate-400 uppercase tracking-widest">{s.type}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Ethical Filter Toolbar */}
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Select value={activeSpecialty} onValueChange={setActiveSpecialty}>
                <SelectTrigger className="w-[180px] bg-transparent border-none focus:ring-0 font-bold h-10">
                  <SelectValue placeholder="Especialidad" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {specialties.map(s => (
                    <SelectItem key={s} value={s} className="rounded-xl">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700" />

              <Select value={activeAvailability} onValueChange={setActiveAvailability}>
                <SelectTrigger className="w-[180px] bg-transparent border-none focus:ring-0 font-bold h-10">
                  <SelectValue placeholder="Disponibilidad" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="Cualquier fecha" className="rounded-xl">{isSpanish ? "Cualquier fecha" : "Any date"}</SelectItem>
                  <SelectItem value="Hoy" className="rounded-xl">{isSpanish ? "Hoy" : "Today"}</SelectItem>
                  <SelectItem value="Mañana" className="rounded-xl">{isSpanish ? "Mañana" : "Tomorrow"}</SelectItem>
                  <SelectItem value="Próxima semana" className="rounded-xl">{isSpanish ? "Próxima semana" : "Next week"}</SelectItem>
                </SelectContent>
              </Select>

              <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700" />

              <Button 
                variant={minRating === 4.5 ? "secondary" : "ghost"}
                onClick={() => setMinRating(minRating === 4.5 ? 0 : 4.5)}
                className="rounded-xl font-bold gap-2 h-10 px-4 whitespace-nowrap"
              >
                <Star className={cn("h-4 w-4", minRating === 4.5 ? "text-amber-500 fill-amber-500" : "text-slate-400")} />
                {isSpanish ? "Top 4.5+" : "Top 4.5+"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="pb-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
                {isSpanish ? "Encontrados" : "Found"}: <span className="text-slate-900 dark:text-slate-100">{sortedAndFilteredDoctors.length} {isSpanish ? "especialistas de élite" : "elite specialists"}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:flex">
              <Filter className="h-3 w-3" />
              {isSpanish ? "Ordenado por: Relevancia y Disponibilidad" : "Sorted by: Relevance & Availability"}
            </div>
          </div>

          <div className="grid gap-6">
            <AnimatePresence mode="popLayout">
              {sortedAndFilteredDoctors.length > 0 ? (
                sortedAndFilteredDoctors.map((doctor, index) => (
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    isSpanish={isSpanish}
                    index={index}
                  />
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-20 text-center space-y-4"
                >
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-3xl mx-auto flex items-center justify-center">
                    <Search className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    {isSpanish ? "No encontramos especialistas exactos" : "No exact specialists found"}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    {isSpanish 
                      ? "Intenta ajustando tus filtros para encontrar otros profesionales de excelencia." 
                      : "Try adjusting your filters to find other excellent professionals."}
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchTerm("")
                      setActiveSpecialty("Todos")
                      setActiveAvailability("Cualquier fecha")
                      setMinRating(0)
                    }}
                    variant="outline"
                    className="rounded-xl"
                  >
                    {isSpanish ? "Limpiar filtros" : "Clear filters"}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchContent />
    </Suspense>
  )
}
