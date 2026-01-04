"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
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
import Link from "next/link"

const professional = {
  id: "1",
  name: "Elena Vargas",
  title: "Psicóloga Clínica",
  specialty: "Psicología Clínica",
  yearsExperience: 12,
  location: "Santiago, Chile",
  rating: 4.9,
  reviewsCount: 124,
  price: 45000,
  languages: ["Español", "Inglés"],
  bio: "Mi nombre es Elena y llevo más de 12 años acompañando a personas en sus procesos de crecimiento personal y bienestar emocional. Mi enfoque es cercano y empático, porque creo que cada persona es única y merece un espacio seguro para expresarse.",
  bioExtended: "Trabajo principalmente con adultos que enfrentan ansiedad, depresión o están pasando por momentos de cambio en sus vidas. No uso un lenguaje complicado ni términos médicos innecesarios - prefiero hablar contigo de forma clara y directa, como lo haría un amigo que realmente te escucha.",
  services: ["Terapia Individual", "Acompañamiento en Ansiedad", "Apoyo en Momentos Difíciles", "Crecimiento Personal"],
  consultationTypes: ["online", "in-person"],
  availability: {
    monday: { available: true, hours: "09:00 - 18:00" },
    tuesday: { available: true, hours: "09:00 - 18:00" },
    wednesday: { available: true, hours: "09:00 - 18:00" },
    thursday: { available: true, hours: "09:00 - 18:00" },
    friday: { available: true, hours: "09:00 - 14:00" },
    saturday: { available: false, hours: null },
    sunday: { available: false, hours: null },
  },
  documents: [
    { id: "1", name: "Registro Profesional", type: "PDF", size: "245 KB" },
    { id: "2", name: "Certificado de Especialidad", type: "PDF", size: "1.2 MB" },
  ],
  professionalRegistration: {
    number: "PSI-12345",
    institution: "Colegio de Psicólogos de Chile",
    verified: true,
  },
  reviews: [
    {
      id: 1,
      user: "Nicolas M.",
      rating: 5,
      date: "Hace 2 semanas",
      text: "Elena es excepcionalmente empática y profesional. Su acompañamiento ha sido transformador para mi salud mental.",
    },
    {
      id: 2,
      user: "Camila S.",
      rating: 5,
      date: "Hace 1 mes",
      text: "Excelente experiencia. Las sesiones online son muy convenientes y la plataforma funciona perfectamente.",
    },
  ],
}

export default function ProfessionalProfilePage() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  const handleConfirmBooking = (day: string, time: string, type: "online" | "in-person") => {
    console.log("Booking confirmed:", { day, time, type })
    setIsBookingOpen(false)
  }

  const isSpanish = language === "es"

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
                    src="/prof-1.jpg?height=400&width=400&query=professional-portrait"
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
                {professional.reviews.map((review) => (
                  <Card key={review.id} className="border-border/40 bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                            {review.user[0]}
                          </div>
                          <div>
                            <p className="font-bold text-lg">{review.user}</p>
                            <p className="text-sm text-muted-foreground">{review.date}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "h-5 w-5",
                                star <= review.rating
                                  ? "fill-primary text-primary"
                                  : "fill-none text-muted-foreground/30"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed text-base">"{review.text}"</p>
                    </CardContent>
                  </Card>
                ))}
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
                    {Object.entries(professional.availability).map(([day, schedule]) => {
                      if (!schedule.available) return null
                      const dayNames: Record<string, string> = {
                        monday: isSpanish ? "Lunes" : "Monday",
                        tuesday: isSpanish ? "Martes" : "Tuesday",
                        wednesday: isSpanish ? "Miércoles" : "Wednesday",
                        thursday: isSpanish ? "Jueves" : "Thursday",
                        friday: isSpanish ? "Viernes" : "Friday",
                        saturday: isSpanish ? "Sábado" : "Saturday",
                        sunday: isSpanish ? "Domingo" : "Sunday",
                      }
                      return (
                        <div
                          key={day}
                          className="flex items-center justify-between p-2 rounded-lg bg-accent/10 text-sm"
                        >
                          <span className="font-medium">{dayNames[day]}</span>
                          <span className="text-muted-foreground">{schedule.hours}</span>
                        </div>
                      )
                    })}
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
                reviewCount: professional.reviewsCount,
                imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
                price: professional.price,
                consultationType: "both",
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
