"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
import { toast } from "sonner"
import { DoctorProfileView } from "@/components/professionals/DoctorProfileView"

interface ProfessionalProfileClientProps {
  professionalId: string
  initialProfessional: any
  initialReviews: any[]
}

export default function ProfessionalProfileClient({ 
  professionalId, 
  initialProfessional, 
  initialReviews 
}: ProfessionalProfileClientProps) {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const router = useRouter()
  
  const [professional, setProfessional] = useState<any>(initialProfessional)
  const [reviews, setReviews] = useState<any[]>(initialReviews)
  const [loading, setLoading] = useState(!initialProfessional)
  const [error, setError] = useState<string | null>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const isSpanish = language === "es"

  useEffect(() => {
    // If we have initial data and it matches the profile we need, don't re-fetch
    if (initialProfessional && initialProfessional.id === professionalId) {
      return
    }

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
          const reviewsResponse = await fetch(`/api/reviews/public?professionalId=${data.professional.id}`)
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
  }, [professionalId, initialProfessional])

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
      
      {/* Premium Hero Section */}
      <section className="relative bg-white dark:bg-slate-950">
        <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-teal-50 to-white dark:from-teal-950/20 dark:to-slate-950" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center lg:items-start text-center lg:text-left">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative p-2 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-teal-500/10 border border-slate-100 dark:border-slate-800">
                <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-[2rem] overflow-hidden">
                  <Image
                    src={professional.imageUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop"}
                    alt={professional.name}
                    width={224}
                    height={224}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
                {professional.verified && (
                  <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800">
                    <div className="bg-emerald-500 p-2 rounded-[0.8rem]">
                      <BadgeCheck className="h-6 w-6 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex-1 space-y-6"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                  <Badge className="bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 border-none px-4 py-1 text-xs font-bold uppercase tracking-widest">
                    {professional.specialty_data?.name || professional.specialty || professional.title}
                  </Badge>
                  {professional.verified && (
                    <Badge className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900 px-4 py-1 text-xs font-bold">
                      {isSpanish ? "Médico Verificado" : "Verified Doctor"}
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  {professional.name}
                </h1>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-slate-500 dark:text-slate-400">
                {professional.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-teal-600" />
                    <span className="text-sm font-medium">{professional.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-xl" role="img" aria-label="rating emoji">
                    {professional.rating >= 4.5 ? "🤩" : 
                     professional.rating >= 3.5 ? "🙂" : 
                     professional.rating >= 2.5 ? "😐" : 
                     professional.rating >= 1.5 ? "🙁" : "😡"}
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {professional.rating ? professional.rating.toFixed(1) : "4.9"}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                    ({professional.reviewsCount || 0} {isSpanish ? "reseñas" : "reviews"})
                  </span>
                </div>
                {professional.yearsExperience > 0 && (
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-teal-600" />
                    <span className="text-sm font-medium">
                      {professional.yearsExperience} {isSpanish ? "años de experiencia" : "years of experience"}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-wrap justify-center lg:justify-start gap-3">
                <Button
                  size="lg"
                  onClick={() => setIsBookingOpen(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold h-12 px-8 rounded-xl shadow-xl shadow-teal-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {isSpanish ? "Reservar ahora" : "Book now"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  {isSpanish ? "Compartir" : "Share"}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          
          <div className="lg:col-span-2">
            <DoctorProfileView 
              professional={professional} 
              reviews={reviews} 
              isSpanish={isSpanish} 
            />
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-24"
            >
              <Card className="border-slate-200/60 dark:border-slate-800 shadow-2xl overflow-hidden">
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <span className="text-lg leading-none">
                          {professional.rating >= 4.5 ? "🤩" : 
                           professional.rating >= 3.5 ? "🙂" : "😐"}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {professional.rating ? professional.rating.toFixed(1) : "4.9"}
                        </span>
                      </div>
                      <p className="text-[10px] uppercase font-bold tracking-tighter text-slate-500">
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

                  {professional.availableToday && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        {isSpanish ? "Disponible hoy" : "Available today"}
                      </span>
                    </div>
                  )}

                  <Separator className="bg-slate-200 dark:bg-slate-800" />

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

                  <div className="flex items-center justify-center gap-2 pt-2">
                    <ShieldCheck className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-500">
                      {isSpanish ? "Pago seguro garantizado" : "Secure payment guaranteed"}
                    </span>
                  </div>
                </CardContent>
              </Card>

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

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        professionalId={professional.id}
        professionalName={professional?.name ?? "the specialist"}
        stellarWallet={professional?.stellarWallet ?? null}
        offersInPerson={hasInPerson ?? true}
        isSpanish={isSpanish}
      />

      <Footer />
    </main>
  )
}
