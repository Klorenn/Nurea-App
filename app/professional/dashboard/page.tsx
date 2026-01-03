"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Calendar,
  Users,
  Star,
  TrendingUp,
  Clock,
  MapPin,
  MoreHorizontal,
  MessageSquare,
  ChevronRight,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function ProfessionalDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // Mock reviews data
  const reviews = [
    {
      id: 1,
      userName: "Sofia Rossi",
      rating: 5,
      comment: "Dr. Vargas is incredibly empathetic and professional. Helped me a lot.",
      date: "2h ago",
    },
    {
      id: 2,
      userName: "Lucas Mendez",
      rating: 5,
      comment: "Very clear and direct communication. Highly recommended.",
      date: "Yesterday",
    },
  ]

  return (
    <DashboardLayout role="professional">
      {/* Stats Overview */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Consultations", value: "124", icon: Calendar, color: "text-primary", bg: "bg-primary/10" },
          { label: "New Patients", value: "12", icon: Users, color: "text-secondary", bg: "bg-secondary/10" },
          { label: "Avg. Rating", value: "4.95", icon: Star, color: "text-primary", bg: "bg-primary/10" },
          { label: "Est. Earnings", value: "$3.2k", icon: TrendingUp, color: "text-secondary", bg: "bg-secondary/10" },
        ].map((stat, i) => (
          <Card key={i} className="border-border/40 shadow-sm hover:shadow-md transition-all group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                </div>
                <div
                  className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Calendar and Appointments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Calendar */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Calendario</CardTitle>
              <CardDescription>Selecciona una fecha para ver las citas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-xl border border-border/40 p-3"
                />
              </div>
            </CardContent>
          </Card>

          {/* Today's Appointments */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Citas de Hoy</h3>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                  5 Total
                </Badge>
                <Badge variant="outline" className="border-secondary/20 text-secondary">
                  2 Online
                </Badge>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                { time: "14:30", name: "Andrés Bello", type: "Online", status: "In-queue" },
                { time: "15:45", name: "Camila Jara", type: "In-person", status: "Confirmed" },
                { time: "17:00", name: "Roberto Silva", type: "Online", status: "Confirmed" },
              ].map((appt, i) => (
                <Card
                  key={i}
                  className={cn(
                    "border-border/40 hover:shadow-md transition-all",
                    i === 0 && "border-primary/30 ring-1 ring-primary/10"
                  )}
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex gap-5">
                        <div className="text-center shrink-0 pt-1">
                          <p className="text-xl font-bold leading-none text-primary">{appt.time}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">PM</p>
                        </div>
                        <div className="h-10 w-px bg-border/40 self-center hidden sm:block" />
                        <div className="space-y-1">
                          <h4 className="font-bold text-lg">{appt.name}</h4>
                          <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" /> 60 min session
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              {appt.type === "Online" ? (
                                <MessageSquare className="h-3.5 w-3.5" />
                              ) : (
                                <MapPin className="h-3.5 w-3.5" />
                              )}
                              {appt.type === "Online" ? "Google Meet" : "San Carlos Clinic"}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Badge
                          className={appt.status === "In-queue" ? "bg-primary text-white" : "bg-secondary text-white"}
                        >
                          {appt.status}
                        </Badge>
                        <Button variant="outline" size="icon" className="rounded-xl ml-auto sm:ml-0 bg-transparent">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button variant="ghost" className="w-full rounded-xl text-primary hover:bg-primary/5">
              Ver Calendario Completo <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Reviews Section - Below Calendar */}
          <Card className="border-border/40">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold">Reseñas Recientes</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" className="rounded-xl bg-primary hover:bg-primary/90" asChild>
                    <a href="/professional/reviews">
                      <Plus className="h-4 w-4 mr-2" /> Agregar
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl" asChild>
                    <a href="/professional/reviews">Ver Todas</a>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <p className="text-muted-foreground">No hay reseñas aún</p>
                  <Button className="rounded-xl bg-primary hover:bg-primary/90" asChild>
                    <a href="/professional/reviews">
                      <Plus className="h-4 w-4 mr-2" /> Agregar Primera Reseña
                    </a>
                  </Button>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="border-b border-border/40 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                          {review.userName[0]}
                        </div>
                        <div>
                          <p className="font-bold">{review.userName}</p>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5 shrink-0">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "h-4 w-4",
                              star <= review.rating
                                ? "fill-primary text-primary"
                                : "fill-none text-muted-foreground/30"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">"{review.comment}"</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Profile Status */}
        <div className="space-y-6">
          <Card className="border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Estado del Perfil</CardTitle>
              <CardDescription>Mantén tu perfil actualizado para mejor ranking</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span>92% Completo</span>
                  <span className="text-primary">+8% Pendiente</span>
                </div>
                <div className="h-3 bg-accent rounded-full overflow-hidden border border-border/40">
                  <div className="h-full bg-primary rounded-full w-[92%]" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Agrega tu <strong>Número de Registro Profesional</strong> para llegar al 100% y obtener la insignia verificada.
              </p>
              <Button size="sm" className="w-full rounded-xl" asChild>
                <a href="/professional/profile/edit">Completar Perfil</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
