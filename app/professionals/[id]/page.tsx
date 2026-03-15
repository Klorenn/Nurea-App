"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookingModal } from "@/components/booking-modal"
import { MapEmbed } from "@/components/map-embed"
import { NoPhysicalConsultationDisplay } from "@/components/no-physical-consultation-display"
import {
  Star,
  MapPin,
  Video,
  Building2,
  Share2,
  Clock,
  MessageCircle,
  FileText,
  Download,
  ShieldCheck,
  Globe,
  GraduationCap,
  Calendar,
  Users,
  Loader2,
  CheckCircle2,
  BadgeCheck,
  Heart,
  Award,
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { parseShortDate } from "@/lib/utils/date-helpers"
import { normalizeAvailability, isLegacyFormat } from "@/lib/utils/availability-helpers"
import { toast } from "sonner"

export default function ProfessionalProfilePage() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const router = useRouter()
  const params = useParams()
  const professionalId = params?.id as string
  const [professional, setProfessional] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const isSpanish = language === "es"

  useEffect(() => {
    const loadProfessional = async () => {
      if (!professionalId) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/professionals/${professionalId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Error al cargar profesional")
        }

        setProfessional(data.professional)

        try {
          const reviewsResponse = await fetch(`/api/reviews/public?professionalId=${professionalId}`)
          if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json()
            setReviews(reviewsData.reviews || [])
          }
        } catch (err) {
          console.error("Error loading reviews:", err)
          setReviews([])
        }
      } catch (err) {
        console.error("Error loading professional:", err)
        setError(err instanceof Error ? err.message : "Error al cargar profesional")
      } finally {
        setLoading(false)
      }
    }

    loadProfessional()
  }, [professionalId])

  const handleConfirmBooking = async (day: string, time: string, type: "online" | "in-person") => {
    try {
      const appointmentDateStr = parseShortDate(day, language)
      
      const availabilityCheck = await fetch(
        `/api/appointments/check-availability?professionalId=${professional.id}&date=${appointmentDateStr}&time=${time}&type=${type}`
      )
      const availabilityData = await availabilityCheck.json()

      if (!availabilityCheck.ok || !availabilityData.available) {
        throw new Error(
          availabilityData.message || 
          (isSpanish ? "Este horario no está disponible" : "This time slot is not available")
        )
      }
      
      const response = await fetch("/api/appointments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalId: professional.id,
          appointmentDate: appointmentDateStr,
          appointmentTime: time,
          type: type,
          duration: 60,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || (isSpanish ? "Error al agendar la cita" : "Error booking appointment"))
      }

      toast.success(
        isSpanish 
          ? "¡Cita agendada exitosamente!"
          : "Appointment booked successfully!"
      )
      
      setIsBookingOpen(false)
      
      setTimeout(() => {
        router.push("/dashboard/appointments")
      }, 1500)
    } catch (error) {
      console.error("Error booking appointment:", error)
      toast.error(
        error instanceof Error 
          ? error.message 
          : (isSpanish ? "Error al agendar la cita" : "Error booking appointment")
      )
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-teal-600 mx-auto" />
          <p className="text-slate-500">{isSpanish ? "Cargando perfil..." : "Loading profile..."}</p>
        </div>
      </main>
    )
  }

  if (error || !professional) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
              <Users className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isSpanish ? "Profesional no encontrado" : "Professional not found"}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {error || (isSpanish ? "No pudimos encontrar este perfil" : "We couldn't find this profile")}
            </p>
            <Button onClick={() => router.push("/explore")} className="bg-teal-600 hover:bg-teal-700">
              {isSpanish ? "Explorar profesionales" : "Explore professionals"}
            </Button>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const price = professional?.price || professional?.consultationPrice || 35000
  const hasTelemedicine = professional?.consultationTypes?.includes("online")
  const hasInPerson = professional?.consultationTypes?.includes("in-person")

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      {/* Hero Section with Banner */}
      <section className="relative">
        {/* Gradient Banner Background */}
        <div className="absolute inset-0 h-72 sm:h-80 bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-500 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            
            {/* Profile Photo - Floating Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative mx-auto lg:mx-0 -mb-24 lg:mb-0"
            >
              <div className="relative">
                <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-900 shadow-2xl bg-white dark:bg-slate-900">
                  <Image
                    src={professional.imageUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop"}
                    alt={professional.name}
                    width={208}
                    height={208}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
                
                {/* Verified Badge */}
                {professional.verified && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="absolute -bottom-3 -right-3 w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-900"
                  >
                    <BadgeCheck className="h-6 w-6 text-white" />
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Profile Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex-1 pt-28 lg:pt-8 text-center lg:text-left"
            >
              {/* Specialty Badge */}
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm mb-3 px-4 py-1.5 text-sm font-medium">
                {professional.specialty || professional.title}
              </Badge>

              {/* Name */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight">
                {professional.name}
              </h1>

              {/* Quick Info */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-white/90 mb-6">
                {professional.yearsExperience > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Award className="h-4 w-4" />
                    <span className="text-sm">
                      {professional.yearsExperience} {isSpanish ? "años exp." : "yrs exp."}
                    </span>
                  </div>
                )}
                {professional.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{professional.location}</span>
                  </div>
                )}
                {professional.verified && (
                  <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {isSpanish ? "Verificado" : "Verified"}
                    </span>
                  </div>
                )}
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-xl px-4 py-2.5 shadow-lg">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-slate-900 dark:text-white text-lg">
                    {professional.rating || 4.9}
                  </span>
                  <span className="text-slate-500 text-sm">
                    ({professional.reviewsCount || reviews.length} {isSpanish ? "reseñas" : "reviews"})
                  </span>
                </div>
                {professional.patientsServed > 0 && (
                  <div className="hidden sm:flex items-center gap-2 text-white/80">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">
                      {professional.patientsServed}+ {isSpanish ? "pacientes" : "patients"}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons - Mobile */}
              <div className="flex gap-3 justify-center lg:hidden mb-8">
                <Button
                  size="lg"
                  onClick={() => setIsBookingOpen(true)}
                  className="bg-white text-teal-700 hover:bg-white/90 font-semibold shadow-lg px-8"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {isSpanish ? "Agendar" : "Book"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* About Me Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-slate-200/60 dark:border-slate-800 shadow-lg overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-teal-600" />
                    {isSpanish ? "Sobre Mí" : "About Me"}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                    {professional.bio || professional.bioExtended || (
                      isSpanish 
                        ? "Profesional de la salud comprometido con el bienestar integral de mis pacientes. Mi enfoque combina la práctica clínica basada en evidencia con un trato cercano y humano."
                        : "Healthcare professional committed to the comprehensive well-being of my patients. My approach combines evidence-based clinical practice with a close and humane treatment."
                    )}
                  </p>

                  {/* Services Tags */}
                  {professional.services && professional.services.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                        {isSpanish ? "Áreas de atención" : "Areas of care"}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {professional.services.map((service: string, index: number) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 px-3 py-1"
                          >
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Legal Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-emerald-200/60 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10 shadow-lg overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                        {isSpanish ? "Información Legal" : "Legal Information"}
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        {isSpanish 
                          ? "Credenciales verificadas para tu tranquilidad"
                          : "Verified credentials for your peace of mind"}
                      </p>

                      <div className="space-y-3">
                        {professional.professionalRegistration?.number && (
                          <div className="flex items-center justify-between py-2.5 px-4 bg-white/60 dark:bg-slate-900/40 rounded-xl">
                            <span className="text-sm text-slate-600 dark:text-slate-300">
                              {isSpanish ? "Número RNPI" : "RNPI Number"}
                            </span>
                            <span className="font-mono font-semibold text-slate-900 dark:text-white">
                              {professional.professionalRegistration.number}
                            </span>
                          </div>
                        )}
                        {professional.professionalRegistration?.institution && (
                          <div className="flex items-center justify-between py-2.5 px-4 bg-white/60 dark:bg-slate-900/40 rounded-xl">
                            <span className="text-sm text-slate-600 dark:text-slate-300">
                              {isSpanish ? "Institución" : "Institution"}
                            </span>
                            <span className="font-medium text-slate-900 dark:text-white text-sm text-right max-w-[60%]">
                              {professional.professionalRegistration.institution}
                            </span>
                          </div>
                        )}
                        {professional.verified && (
                          <div className="flex items-center gap-2 pt-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                              {isSpanish ? "Credenciales verificadas por NUREA" : "Credentials verified by NUREA"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Consultation Types */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-slate-200/60 dark:border-slate-800 shadow-lg">
                <CardContent className="p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    {isSpanish ? "Modalidades de Consulta" : "Consultation Types"}
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {hasTelemedicine && (
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                          <Video className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {isSpanish ? "Telemedicina" : "Telemedicine"}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {isSpanish ? "Consulta por videollamada" : "Video consultation"}
                          </p>
                        </div>
                      </div>
                    )}
                    {hasInPerson && (
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {isSpanish ? "Presencial" : "In-Person"}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {professional.location || (isSpanish ? "Consulta en persona" : "In-person consultation")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Languages */}
            {professional.languages && professional.languages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-slate-200/60 dark:border-slate-800 shadow-lg">
                  <CardContent className="p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-teal-600" />
                      {isSpanish ? "Idiomas" : "Languages"}
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {professional.languages.map((lang: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="px-4 py-2 text-sm border-slate-200 dark:border-slate-700"
                        >
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="border-slate-200/60 dark:border-slate-800 shadow-lg">
                  <CardContent className="p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <Star className="h-5 w-5 text-amber-500" />
                      {isSpanish ? "Reseñas de Pacientes" : "Patient Reviews"}
                    </h2>
                    <div className="space-y-4">
                      {reviews.slice(0, 3).map((review: any, index: number) => (
                        <div key={review.id || index} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
                                <span className="font-semibold text-teal-700 dark:text-teal-300">
                                  {(review.name || review.author || "P")[0].toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">
                                  {review.name || review.author || (isSpanish ? "Paciente" : "Patient")}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {review.date || review.createdAt}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={cn(
                                    "h-4 w-4",
                                    star <= (review.rating || 5)
                                      ? "text-amber-500 fill-amber-500"
                                      : "text-slate-300"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-sm">
                            "{review.comment || review.text}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column - Booking Widget (Sticky) */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-24"
            >
              <Card className="border-slate-200/60 dark:border-slate-800 shadow-2xl overflow-hidden">
                {/* Price Header */}
                <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 text-white">
                  <p className="text-sm font-medium text-teal-100 mb-1">
                    {isSpanish ? "Precio por consulta" : "Price per consultation"}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">
                      ${Number(price).toLocaleString("es-CL")}
                    </span>
                    <span className="text-teal-200 text-sm">CLP</span>
                  </div>
                </div>

                <CardContent className="p-6 space-y-6">
                  {/* Consultation Type Badges */}
                  <div className="flex flex-wrap gap-2">
                    {hasTelemedicine && (
                      <Badge className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                        <Video className="h-3 w-3 mr-1.5" />
                        {isSpanish ? "Telemedicina" : "Telemedicine"}
                      </Badge>
                    )}
                    {hasInPerson && (
                      <Badge className="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                        <Building2 className="h-3 w-3 mr-1.5" />
                        {isSpanish ? "Presencial" : "In-Person"}
                      </Badge>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-slate-900 dark:text-white">
                          {professional.rating || 4.9}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {professional.reviewsCount || 0} {isSpanish ? "reseñas" : "reviews"}
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock className="h-4 w-4 text-teal-600" />
                        <span className="font-bold text-slate-900 dark:text-white">60</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {isSpanish ? "min/sesión" : "min/session"}
                      </p>
                    </div>
                  </div>

                  {/* Availability Indicator */}
                  {professional.availableToday && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        {isSpanish ? "Disponible hoy" : "Available today"}
                      </span>
                    </div>
                  )}

                  <Separator className="bg-slate-200 dark:bg-slate-800" />

                  {/* CTA Buttons */}
                  <div className="space-y-3">
                    <Button
                      size="lg"
                      className={cn(
                        "w-full h-14 text-base font-semibold rounded-xl",
                        "bg-gradient-to-r from-teal-600 to-emerald-600",
                        "hover:from-teal-700 hover:to-emerald-700",
                        "shadow-lg shadow-teal-500/20"
                      )}
                      onClick={() => setIsBookingOpen(true)}
                    >
                      <Calendar className="h-5 w-5 mr-2" />
                      {isSpanish ? "Agendar Cita" : "Book Appointment"}
                    </Button>
                    
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full h-12 rounded-xl border-2 border-slate-200 dark:border-slate-700"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {isSpanish ? "Enviar Mensaje" : "Send Message"}
                    </Button>
                  </div>

                  {/* Trust Indicator */}
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <ShieldCheck className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-500">
                      {isSpanish ? "Pago seguro garantizado" : "Secure payment guaranteed"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Share Button - Desktop */}
              <div className="hidden lg:flex justify-center mt-4">
                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700">
                  <Share2 className="h-4 w-4 mr-2" />
                  {isSpanish ? "Compartir perfil" : "Share profile"}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        professionalId={professionalId}
        professionalName={professional?.name ?? "the specialist"}
        stellarWallet={professional?.stellarWallet ?? null}
        offersInPerson={hasInPerson ?? true}
        isSpanish={isSpanish}
      />

      <Footer />
    </main>
  )
}
