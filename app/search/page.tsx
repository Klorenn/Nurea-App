"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Star, Filter, CalendarDays, Video, Home } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

const professionals = [
  {
    id: "1",
    name: "Dr. Elena Vargas",
    specialty: "Clinical Psychologist",
    location: "Online / Santiago",
    rating: 4.9,
    reviews: 124,
    price: 45000,
    languages: ["ES", "EN"],
    image: "/professional-1.jpg",
    verified: true,
  },
  {
    id: "2",
    name: "Dr. Marco Polo",
    specialty: "Cardiologist",
    location: "Las Condes, Santiago",
    rating: 4.8,
    reviews: 89,
    price: 55000,
    languages: ["ES"],
    image: "/professional-2.jpg",
    verified: true,
  },
  {
    id: "3",
    name: "Dr. Sofia Rossi",
    specialty: "Dermatologist",
    location: "Providencia, Santiago",
    rating: 4.9,
    reviews: 210,
    price: 50000,
    languages: ["ES", "IT"],
    image: "/professional-3.jpg",
    verified: true,
  },
]

export default function SearchResultsPage() {
  const [view, setView] = useState<"list" | "map">("list")

  return (
    <main className="min-h-screen pt-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full md:w-72 space-y-8 shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Filter className="h-5 w-5" /> Filters
              </h2>
              <Button variant="ghost" size="sm" className="text-primary text-xs font-bold">
                Clear all
              </Button>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Specialty</label>
                <Select>
                  <SelectTrigger className="w-full rounded-xl bg-accent/20 border-none">
                    <SelectValue placeholder="All Specialties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="psychology">Psychology</SelectItem>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="dermatology">Dermatology</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Consultation Type
                </label>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="justify-start rounded-xl bg-transparent gap-3 border-border/40">
                    <Video className="h-4 w-4" /> Online Session
                  </Button>
                  <Button variant="outline" className="justify-start rounded-xl bg-transparent gap-3 border-border/40">
                    <Home className="h-4 w-4" /> In-person Visit
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Price Range</label>
                <div className="pt-4 px-2">
                  <Slider defaultValue={[20000, 80000]} max={100000} step={5000} className="text-primary" />
                  <div className="flex justify-between mt-4 text-xs font-medium">
                    <span>$20k</span>
                    <span>$100k+</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Language</label>
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
            </div>
          </aside>

          {/* Search Results */}
          <section className="flex-1 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-2xl border border-border/40 shadow-sm">
              <div>
                <h1 className="text-2xl font-bold">124 professionals found</h1>
                <p className="text-sm text-muted-foreground">Psychologists in Santiago • Online</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
                <Select defaultValue="relevance">
                  <SelectTrigger className="w-40 border-none bg-accent/20 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-6">
              {professionals.map((prof) => (
                <Card key={prof.id} className="border-border/40 overflow-hidden hover:shadow-lg transition-all group">
                  <CardContent className="p-0 flex flex-col sm:flex-row">
                    <div className="w-full sm:w-56 h-56 sm:h-auto relative overflow-hidden shrink-0">
                      <img
                        src={`/prof-${prof.id}.jpg?height=300&width=300&query=professional-headshot`}
                        alt={prof.name}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                      />
                      {prof.verified && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-primary text-white border-none rounded-full px-3 py-1 text-[10px] uppercase font-bold tracking-widest shadow-lg">
                            Verified
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h2 className="text-2xl font-bold group-hover:text-primary transition-colors tracking-tight">
                              {prof.name}
                            </h2>
                            <p className="text-primary font-bold">{prof.specialty}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-1 text-primary mb-1">
                              <Star className="h-4 w-4 fill-current" />
                              <span className="font-bold">{prof.rating}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{prof.reviews} reviews</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 pt-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 text-primary" />
                            {prof.location}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarDays className="h-4 w-4 text-primary" />
                            Next available: <span className="text-foreground font-bold">Tomorrow</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {prof.languages.map((l) => (
                            <Badge
                              key={l}
                              variant="secondary"
                              className="bg-accent/30 text-accent-foreground border-none text-[10px]"
                            >
                              {l}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-6 border-t border-border/40 gap-4">
                        <div className="text-center sm:text-left">
                          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">
                            Consultation from
                          </p>
                          <p className="text-2xl font-bold">
                            ${prof.price.toLocaleString("es-CL")}{" "}
                            <span className="text-xs font-normal text-muted-foreground">/ session</span>
                          </p>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                          <Button variant="outline" className="rounded-xl flex-1 sm:flex-none bg-transparent">
                            View Profile
                          </Button>
                          <Button className="rounded-xl flex-1 sm:flex-none px-8 font-bold">Book Now</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}
