"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Loader2 } from "lucide-react"
import { isTestProfessional, mockProfessional, shouldUseMockData } from "@/lib/mock-data"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Star,
  MapPin,
  CalendarDays,
  Video,
  Home,
  Heart,
  Share2,
  Clock,
  CheckCircle2,
  MessageCircle,
  FileText,
  Download,
  ShieldCheck,
  User,
  Globe,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppointmentSchedulingCard } from "@/components/ui/appointment-scheduling-card"
import { MapEmbed } from "@/components/map-embed"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { parseShortDate } from "@/lib/utils/date-helpers"
import { normalizeAvailability, isLegacyFormat } from "@/lib/utils/availability-helpers"
import Link from "next/link"

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
        // Si es el profesional de prueba y estamos en desarrollo, usar datos mock
        if (isTestProfessional(professionalId) && shouldUseMockData()) {
          setProfessional(mockProfessional)
          setLoading(false)
          return
        }
        
        // Si es el profesional de prueba pero estamos en producción, no existe
        if (isTestProfessional(professionalId) && !shouldUseMockData()) {
          setError(isSpanish ? "Profesional no encontrado" : "Professional not found")
          setLoading(false)
          return
        }

        // Cargar desde API
        const response = await fetch(`/api/professionals/${professionalId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Error al cargar profesional")
        }

        setProfessional(data.professional)

        // Cargar reviews si es profesional real
        if (!isTestProfessional(professionalId) || !shouldUseMockData()) {
          try {
            const reviewsResponse = await fetch(`/api/reviews/public?professionalId=${professionalId}`)
            if (reviewsResponse.ok) {
              const reviewsData = await reviewsResponse.json()
              setReviews(reviewsData.reviews || [])
            }
          } catch (err) {
            console.error("Error loading reviews:", err)
            // Si no hay reviews, usar array vacío
            setReviews([])
          }
        } else {
          // Para el profesional de prueba en desarrollo, usar reviews mock
          setReviews(mockProfessional.reviews || [])
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

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  if (error || !professional) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-destructive font-medium mb-4">{error || "Profesional no encontrado"}</p>
          <Button onClick={() => router.push("/search")}>
            {isSpanish ? "Volver a búsqueda" : "Back to search"}
          </Button>
        </div>
      </main>
    )
  }

  const handleConfirmBooking = async (day: string, time: string, type: "online" | "in-person") => {
    try {
      // Parsear la fecha del formato "Ene 15" a una fecha completa usando el helper
      const appointmentDateStr = parseShortDate(day, language)
      
      // Verificar disponibilidad antes de intentar crear la cita (incluyendo el tipo de consulta)
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

      // Mostrar mensaje de éxito y redirigir
      const successMessage = isSpanish 
        ? "¡Cita agendada exitosamente! Te enviaremos un recordatorio antes de la fecha."
        : "Appointment booked successfully! We'll send you a reminder before the date."
      
      // Usar un mensaje temporal en lugar de alert
      const successDiv = document.createElement('div')
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg z-50'
      successDiv.textContent = successMessage
      document.body.appendChild(successDiv)
      
      setIsBookingOpen(false)
      
      // Redirigir a la página de citas después de un breve delay
      setTimeout(() => {
        document.body.removeChild(successDiv)
        router.push("/dashboard/appointments")
      }, 2000)
    } catch (error) {
      console.error("Error booking appointment:", error)
      const errorMessage = error instanceof Error ? error.message : (isSpanish ? "Error al agendar la cita" : "Error booking appointment")
      
      // Mostrar error de forma más elegante
      const errorDiv = document.createElement('div')
      errorDiv.className = 'fixed top-4 right-4 bg-destructive text-white px-6 py-4 rounded-xl shadow-lg z-50'
      errorDiv.textContent = errorMessage
      document.body.appendChild(errorDiv)
      
      setTimeout(() => {
        if (document.body.contains(errorDiv)) {
          document.body.removeChild(errorDiv)
        }
      }, 5000)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section - Human and Welcoming */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: Text Content */}
            <div className="space-y-6">
              <div className="space-y-3">
                <Badge className="bg-primary/10 text-primary border-none rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
                  {professional.title}
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                  {professional.name}
                </h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm">
                      {isSpanish 
                        ? `${professional.yearsExperience} años de experiencia`
                        : `${professional.yearsExperience} years of experience`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{professional.location}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                {professional.bio}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary fill-primary" />
                  <span className="font-bold text-lg">{professional.rating}</span>
                  <span className="text-muted-foreground text-sm">
                    ({professional.reviewsCount} {isSpanish ? "reseñas" : "reviews"})
                  </span>
                </div>
                {professional.professionalRegistration.verified && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {isSpanish ? "Verificado" : "Verified"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  size="lg"
                  className="rounded-xl px-8 h-12 text-base font-bold shadow-lg shadow-primary/20"
                  onClick={() => setIsBookingOpen(true)}
                >
                  {isSpanish ? "Agendar primera sesión" : "Book first session"} →
                </Button>
                <Button variant="outline" size="icon" className="rounded-xl h-12 w-12">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Right: Profile Picture */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden border-2 border-primary/20 shadow-2xl">
                  <img
                    src={professional.imageUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop"}
                    alt={professional.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {professional.professionalRegistration.verified && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-3 shadow-lg">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="w-full justify-start bg-transparent border-b border-border/40 rounded-none h-auto p-0 gap-8">
                <TabsTrigger
                  value="about"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 text-sm font-bold uppercase tracking-wider transition-all"
                >
                  {isSpanish ? "Sobre mí" : "About"}
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 text-sm font-bold uppercase tracking-wider transition-all"
                >
                  {isSpanish ? "Reseñas" : "Reviews"}
                </TabsTrigger>
                <TabsTrigger
                  value="location"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 text-sm font-bold uppercase tracking-wider transition-all"
                >
                  {isSpanish ? "Ubicación" : "Location"}
                </TabsTrigger>
              </TabsList>

              {/* About Tab */}
              <TabsContent value="about" className="pt-8 space-y-8">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">
                    {isSpanish ? "Mi enfoque" : "My approach"}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    {professional.bioExtended}
                  </p>
                </div>

                <Separator className="bg-border/40" />

                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-3">
                      {isSpanish ? "En qué puedo acompañarte" : "How I can support you"}
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {professional.services.map((service) => (
                        <Badge
                          key={service}
                          variant="secondary"
                          className="bg-accent/30 text-accent-foreground border-none rounded-full px-4 py-1.5 text-sm"
                        >
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold">
                      {isSpanish ? "Modalidades de consulta" : "Consultation types"}
                    </h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      {professional.consultationTypes.includes("online") && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/10 border border-border/40">
                          <Video className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-semibold">
                              {isSpanish ? "Consulta Online" : "Online Consultation"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {isSpanish 
                                ? "Desde la comodidad de tu hogar"
                                : "From the comfort of your home"}
                            </p>
                          </div>
                        </div>
                      )}
                      {professional.consultationTypes.includes("in-person") && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/10 border border-border/40">
                          <Home className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-semibold">
                              {isSpanish ? "Consulta Presencial" : "In-person Consultation"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {isSpanish 
                                ? "En mi consulta en Santiago"
                                : "At my office in Santiago"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold">
                      {isSpanish ? "Idiomas" : "Languages"}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {professional.languages.map((lang) => (
                        <Badge
                          key={lang}
                          variant="outline"
                          className="rounded-full px-3 py-1 bg-accent/10 border-border/40 text-sm"
                        >
                          <Globe className="h-3 w-3 mr-1.5 inline" /> {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Professional Registration */}
                  <div className="space-y-3 pt-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <h4 className="text-lg font-semibold">
                        {isSpanish ? "Registro Profesional" : "Professional Registration"}
                      </h4>
                    </div>
                    <Card className="border-green-500/20 bg-green-500/5">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              {isSpanish ? "Número de registro:" : "Registration number:"}
                            </span>
                            <span className="font-semibold">
                              {professional.professionalRegistration.number}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              {isSpanish ? "Institución:" : "Institution:"}
                            </span>
                            <span className="font-medium text-sm">
                              {professional.professionalRegistration.institution}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground pt-2 border-t border-border/40">
                            {isSpanish
                              ? "Este registro es una declaración del profesional. NUREA no valida registros estatales en este momento."
                              : "This registration is a professional declaration. NUREA does not validate state registrations at this time."}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Documents */}
                  {professional.documents && professional.documents.length > 0 && (
                    <div className="space-y-3 pt-4">
                      <h4 className="text-lg font-semibold">
                        {isSpanish ? "Documentos" : "Documents"}
                      </h4>
                      <div className="space-y-2">
                        {professional.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-accent/10 border border-border/40 hover:bg-accent/20 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium text-sm">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {doc.type} • {doc.size}
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-xl">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="pt-8 space-y-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">
                    {isSpanish ? "Reseñas" : "Reviews"}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {professional.reviewsCount} {isSpanish ? "reseñas" : "reviews"} • {isSpanish ? "Promedio:" : "Average:"} {professional.rating}
                  </p>
                </div>
                {reviews.length > 0 ? (
                  reviews.map((review: any) => {
                    const reviewDate = review.createdAt 
                      ? new Date(review.createdAt).toLocaleDateString(
                          isSpanish ? "es-ES" : "en-US",
                          { year: "numeric", month: "short", day: "numeric" }
                        )
                      : review.date || (isSpanish ? "Fecha no disponible" : "Date not available")
                    const reviewerName = review.name || review.user || (isSpanish ? "Paciente" : "Patient")
                    const reviewText = review.comment || review.text || review.quote || ""
                    
                    return (
                      <Card key={review.id} className="border-border/40 bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                {reviewerName[0]?.toUpperCase() || "P"}
                              </div>
                              <div>
                                <p className="font-bold text-lg">{reviewerName}</p>
                                <p className="text-sm text-muted-foreground">{reviewDate}</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={cn(
                                    "h-5 w-5",
                                    star <= (review.rating || 5)
                                      ? "fill-primary text-primary"
                                      : "fill-none text-muted-foreground/30"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                          {reviewText && (
                            <p className="text-muted-foreground leading-relaxed text-base">"{reviewText}"</p>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })
                ) : (
                  <Card className="border-border/40">
                    <CardContent className="p-12 text-center">
                      <p className="text-muted-foreground">
                        {isSpanish ? "Aún no hay reseñas para este profesional" : "No reviews yet for this professional"}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Location Tab */}
              <TabsContent value="location" className="pt-8 space-y-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-4">
                      {isSpanish ? "Ubicación" : "Location"}
                    </h3>
                    <MapEmbed address="Las Condes 1245, Santiago, Chile" lat={-33.4175} lng={-70.6003} />
                  </div>
                  <Card className="border-border/40">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold">
                          {isSpanish ? "Dirección" : "Address"}
                        </h4>
                        <p className="text-muted-foreground">
                          Las Condes 1245, Oficina 302<br />
                          Las Condes, Santiago, Chile
                        </p>
                        <div className="pt-4">
                          <Button variant="outline" className="rounded-xl">
                            <MapPin className="h-4 w-4 mr-2" />
                            {isSpanish ? "Abrir en Google Maps" : "Open in Google Maps"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Booking Card */}
          <aside className="space-y-6">
            <Card className="border-border/40 shadow-2xl rounded-[2.5rem] sticky top-28 overflow-hidden">
              <div className="bg-primary p-6 text-white">
                <p className="text-xs font-semibold opacity-90 mb-1">
                  {isSpanish ? "Precio por consulta" : "Price per consultation"}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    ${professional.price.toLocaleString("es-CL")}
                  </span>
                  <span className="text-sm opacity-80">
                    {isSpanish ? "/ sesión" : "/ session"}
                  </span>
                </div>
              </div>
              <div className="px-8 py-4 bg-primary/10 border-b border-primary/20">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary fill-primary" />
                  <div>
                    <p className="text-lg font-bold text-primary">{professional.rating}</p>
                    <p className="text-xs text-muted-foreground">
                      {professional.reviewsCount} {isSpanish ? "reseñas" : "reviews"}
                    </p>
                  </div>
                </div>
              </div>
              <CardContent className="p-8 space-y-6">
                {/* Availability */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" /> {isSpanish ? "Horarios disponibles" : "Available hours"}
                  </p>
                  <div className="space-y-2">
                    {(() => {
                      // Normalizar disponibilidad al nuevo formato
                      const normalizedAvailability = normalizeAvailability(
                        professional.availability || {},
                        professional.consultationType || 'both'
                      )
                      const isLegacy = isLegacyFormat(professional.availability || {})
                      
                      return Object.entries(normalizedAvailability).map(([day, dayData]: [string, any]) => {
                        const dayNames: Record<string, string> = {
                          monday: isSpanish ? "Lunes" : "Monday",
                          tuesday: isSpanish ? "Martes" : "Tuesday",
                          wednesday: isSpanish ? "Miércoles" : "Wednesday",
                          thursday: isSpanish ? "Jueves" : "Thursday",
                          friday: isSpanish ? "Viernes" : "Friday",
                          saturday: isSpanish ? "Sábado" : "Saturday",
                          sunday: isSpanish ? "Domingo" : "Sunday",
                        }
                        
                        const onlineAvailable = dayData?.online?.available && dayData?.online?.hours
                        const inPersonAvailable = dayData?.['in-person']?.available && dayData?.['in-person']?.hours
                        
                        // Si no hay disponibilidad para este día, no mostrar
                        if (!onlineAvailable && !inPersonAvailable) return null
                        
                        // Si es formato legacy o solo un tipo, mostrar simple
                        if (isLegacy || (professional.consultationType !== 'both' && !onlineAvailable && !inPersonAvailable)) {
                          const hours = onlineAvailable ? dayData.online.hours : dayData['in-person']?.hours
                          if (!hours) return null
                          return (
                            <div
                              key={day}
                              className="flex items-center justify-between p-2 rounded-lg bg-accent/10 text-sm"
                            >
                              <span className="font-medium">{dayNames[day]}</span>
                              <span className="text-muted-foreground">{hours}</span>
                            </div>
                          )
                        }
                        
                        // Formato nuevo con ambos tipos
                        return (
                          <div key={day} className="space-y-1.5">
                            {onlineAvailable && (
                              <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                                <span className="font-medium flex items-center gap-2">
                                  <Video className="h-3.5 w-3.5" />
                                  {dayNames[day]} - {isSpanish ? "Online" : "Online"}
                                </span>
                                <span className="text-muted-foreground">{dayData.online.hours}</span>
                              </div>
                            )}
                            {inPersonAvailable && (
                              <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/5 border border-secondary/20 text-sm">
                                <span className="font-medium flex items-center gap-2">
                                  <Home className="h-3.5 w-3.5" />
                                  {dayNames[day]} - {isSpanish ? "Presencial" : "In-Person"}
                                </span>
                                <span className="text-muted-foreground">{dayData['in-person'].hours}</span>
                              </div>
                            )}
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Button
                    className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20"
                    onClick={() => setIsBookingOpen(true)}
                  >
                    {isSpanish ? "Agendar consulta" : "Book consultation"}
                  </Button>
                  <Button variant="outline" className="w-full h-12 rounded-xl font-medium bg-transparent border-2">
                    <MessageCircle className="h-4 w-4 mr-2" /> {isSpanish ? "Enviar mensaje" : "Send message"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl">
            <AppointmentSchedulingCard
              professional={{
                id: professional.id,
                name: professional.name,
                specialty: professional.specialty,
                location: professional.location,
                rating: professional.rating,
                reviewCount: professional.reviewsCount || 0,
                imageUrl: professional.imageUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
                price: professional.price || professional.consultationPrice || 0,
                consultationType: professional.consultationType || (professional.consultationTypes?.includes("online") && professional.consultationTypes?.includes("in-person") ? "both" : professional.consultationTypes?.includes("online") ? "online" : "in-person") || "both",
                availability: professional.availability,
              }}
              onConfirm={handleConfirmBooking}
              onWeekChange={(direction) => {
                console.log("Week change:", direction)
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0 text-white hover:text-white/80"
              onClick={() => setIsBookingOpen(false)}
            >
              ×
            </Button>
          </div>
        </div>
      )}
      <Footer />
    </main>
  )
}
