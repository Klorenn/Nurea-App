"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Star,
  MapPin,
  CalendarDays,
  Video,
  Home,
  Award,
  Globe,
  ShieldCheck,
  Heart,
  Share2,
  Clock,
  CheckCircle2,
  MessageCircle,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookingModal } from "@/components/booking-modal"
import { MapEmbed } from "@/components/map-embed"

const professional = {
  id: "1",
  name: "Dr. Elena Vargas",
  specialty: "Clinical Psychologist",
  location: "Santiago, Chile",
  rating: 4.9,
  reviewsCount: 124,
  price: 45000,
  languages: ["Spanish", "English"],
  education: [
    "Ph.D. in Clinical Psychology, Universidad de Chile",
    "M.Sc. in Cognitive Behavioral Therapy, King's College London",
  ],
  experience: "12+ years of clinical experience",
  bio: "I specialize in helping adults navigate anxiety, depression, and life transitions. My approach is evidence-based, primarily utilizing Cognitive Behavioral Therapy (CBT) and Mindfulness techniques to empower clients with practical tools for lasting change.",
  services: ["Individual Therapy", "Couples Counseling", "Anxiety Management", "Grief and Loss Support"],
  reviews: [
    {
      id: 1,
      user: "Nicolas M.",
      rating: 5,
      date: "2 weeks ago",
      text: "Dr. Vargas is exceptionally empathetic and professional. Her guidance has been transformative for my mental health.",
    },
    {
      id: 2,
      user: "Camila S.",
      rating: 5,
      date: "1 month ago",
      text: "Great experience. The online sessions are very convenient and the platform works flawlessly.",
    },
  ],
}

export default function ProfessionalProfilePage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  return (
    <main className="min-h-screen pt-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-12">
            <section className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-full md:w-48 h-48 rounded-[2rem] overflow-hidden shrink-0 border-4 border-white shadow-xl">
                <img
                  src="/prof-1.jpg?height=200&width=200&query=professional-portrait"
                  alt={professional.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl font-bold tracking-tight">{professional.name}</h1>
                  <Badge className="bg-primary/10 text-primary border-none rounded-full px-3 py-1 text-xs font-bold">
                    <ShieldCheck className="h-3 w-3 mr-1" /> Verified Professional
                  </Badge>
                </div>
                <p className="text-xl text-primary font-bold">{professional.specialty}</p>
                <div className="flex flex-wrap gap-6 pt-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Star className="h-5 w-5 text-primary fill-current" />
                    <span className="font-bold text-foreground">{professional.rating}</span>
                    <span>({professional.reviewsCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>{professional.location}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  {professional.languages.map((lang) => (
                    <Badge
                      key={lang}
                      variant="outline"
                      className="rounded-full px-4 py-1 bg-accent/10 border-border/40"
                    >
                      <Globe className="h-3 w-3 mr-2" /> {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            </section>

            <Tabs defaultValue="about" className="w-full">
              <TabsList className="w-full justify-start bg-transparent border-b border-border/40 rounded-none h-auto p-0 gap-8">
                <TabsTrigger
                  value="about"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 text-sm font-bold uppercase tracking-widest transition-all"
                >
                  About
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 text-sm font-bold uppercase tracking-widest transition-all"
                >
                  Reviews
                </TabsTrigger>
                <TabsTrigger
                  value="insurance"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 text-sm font-bold uppercase tracking-widest transition-all"
                >
                  Insurance
                </TabsTrigger>
              </TabsList>
              <TabsContent value="about" className="pt-8 space-y-12">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Biography</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">{professional.bio}</p>
                </div>

                <Separator className="bg-border/40" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" /> Education
                    </h4>
                    <ul className="space-y-3">
                      {professional.education.map((edu, i) => (
                        <li key={i} className="text-muted-foreground flex items-start gap-3">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-1" />
                          {edu}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" /> Specialties
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {professional.services.map((service) => (
                        <Badge
                          key={service}
                          variant="secondary"
                          className="bg-accent/30 text-accent-foreground border-none rounded-xl px-4 py-2"
                        >
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="pt-8 space-y-6">
                {professional.reviews.map((review) => (
                  <Card key={review.id} className="border-border/40 bg-accent/10 rounded-[2rem]">
                    <CardContent className="p-8 space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {review.user[0]}
                          </div>
                          <div>
                            <p className="font-bold">{review.user}</p>
                            <p className="text-xs text-muted-foreground">{review.date}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-4 w-4 fill-primary text-primary" />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground italic">"{review.text}"</p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              <TabsContent value="insurance" className="pt-8 space-y-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-4">Clinic Location</h3>
                    <MapEmbed address="Las Condes 1245, Santiago, Chile" lat={-33.4175} lng={-70.6003} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4">Insurance Accepted</h3>
                    <div className="flex flex-wrap gap-2">
                      {["FONASA", "ISAPRE", "Banmédica", "Colmena"].map((insurance) => (
                        <Badge
                          key={insurance}
                          variant="secondary"
                          className="bg-accent/30 text-accent-foreground border-none rounded-xl px-4 py-2"
                        >
                          {insurance}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Booking Card */}
          <aside className="space-y-6">
            <Card className="border-border/40 shadow-2xl rounded-[2.5rem] sticky top-28 overflow-hidden">
              <div className="bg-primary p-8 text-white">
                <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Consultation Fee</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">${professional.price.toLocaleString("es-CL")}</span>
                  <span className="text-sm opacity-80">/ session</span>
                </div>
              </div>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-accent/20 border border-border/40">
                    <div className="flex items-center gap-3">
                      <Video className="h-5 w-5 text-primary" />
                      <span className="font-bold">Online Session</span>
                    </div>
                    <Badge variant="secondary" className="bg-secondary/20 text-secondary border-none">
                      Available
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-accent/20 border border-border/40">
                    <div className="flex items-center gap-3">
                      <Home className="h-5 w-5 text-primary" />
                      <span className="font-bold">In-person</span>
                    </div>
                    <Badge variant="secondary" className="bg-secondary/20 text-secondary border-none">
                      Available
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Next Availability
                  </p>
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-10 w-10 text-primary bg-primary/10 p-2 rounded-xl" />
                    <div>
                      <p className="font-bold">Tomorrow, Oct 5th</p>
                      <p className="text-sm text-muted-foreground">Slots from 09:00 AM</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Button
                    className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20"
                    onClick={() => setIsBookingOpen(true)}
                  >
                    Book Consultation
                  </Button>
                  <Button variant="outline" className="w-full h-14 rounded-2xl font-bold bg-transparent">
                    <MessageCircle className="h-5 w-5 mr-2" /> Message Professional
                  </Button>
                </div>

                <div className="flex justify-center gap-6 pt-2">
                  <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                    <Share2 className="h-4 w-4" /> Share
                  </button>
                  <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                    <Heart className="h-4 w-4" /> Save
                  </button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
      <Footer />
    </main>
  )
}
