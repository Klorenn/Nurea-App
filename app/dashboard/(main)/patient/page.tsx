"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, type Variants } from "framer-motion"
import {
  Calendar,
  Clock,
  Search,
  Heart,
  FileText,
  FlaskConical,
  PillIcon,
  Wallet,
  Video,
  MapPin,
  ArrowRight,
  ChevronRight,
  Stethoscope,
  Brain,
  Eye,
  Bone,
  Baby,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

interface Appointment {
  id: string
  professionalName: string
  specialty: string
  date: string
  time: string
  type: "online" | "in_person"
  avatar?: string
}

interface HealthCard {
  id: string
  icon: any
  title: string
  titleEn: string
  count: number
  href: string
  color: string
}

const specialties = [
  { icon: Stethoscope, label: "Medicina General", labelEn: "General Medicine" },
  { icon: Brain, label: "Psicología", labelEn: "Psychology" },
  { icon: Heart, label: "Cardiología", labelEn: "Cardiology" },
  { icon: Eye, label: "Oftalmología", labelEn: "Ophthalmology" },
  { icon: Bone, label: "Traumatología", labelEn: "Orthopedics" },
  { icon: Baby, label: "Pediatría", labelEn: "Pediatrics" },
]

const mockAppointments: Appointment[] = [
  {
    id: "1",
    professionalName: "Dra. María García",
    specialty: "Psicología",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    time: "10:00",
    type: "online",
  },
  {
    id: "2",
    professionalName: "Dr. Carlos Mendoza",
    specialty: "Medicina General",
    date: new Date(Date.now() + 172800000).toISOString().split("T")[0],
    time: "15:30",
    type: "in_person",
  },
]

const healthCards: HealthCard[] = [
  {
    id: "prescriptions",
    icon: PillIcon,
    title: "Mis Recetas",
    titleEn: "My Prescriptions",
    count: 3,
    href: "/dashboard/patient/prescriptions",
    color: "text-rose-500 bg-rose-500/10",
  },
  {
    id: "lab-results",
    icon: FlaskConical,
    title: "Resultados de Lab",
    titleEn: "Lab Results",
    count: 2,
    href: "/dashboard/patient/lab-results",
    color: "text-violet-500 bg-violet-500/10",
  },
  {
    id: "wallet",
    icon: Wallet,
    title: "Saldo en Billetera",
    titleEn: "Wallet Balance",
    count: 150,
    href: "/dashboard/patient/payments",
    color: "text-emerald-500 bg-emerald-500/10",
  },
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
}

export default function PatientDashboard() {
  const { language } = useLanguage()
  const { user } = useAuth()
  const router = useRouter()
  const isSpanish = language === "es"

  const [searchQuery, setSearchQuery] = useState("")

  const nextAppointment = mockAppointments[0]
  const firstName = user?.user_metadata?.first_name || "Usuario"

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (dateString === today.toISOString().split("T")[0]) {
      return isSpanish ? "Hoy" : "Today"
    }
    if (dateString === tomorrow.toISOString().split("T")[0]) {
      return isSpanish ? "Mañana" : "Tomorrow"
    }

    return date.toLocaleDateString(isSpanish ? "es-ES" : "en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Personalized Welcome */}
      <motion.div variants={itemVariants}>
        <Card className="border-[#0f766e]/20 bg-gradient-to-br from-[#0f766e]/5 via-background to-background overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  {isSpanish ? "Hola" : "Hello"},{" "}
                  <span className="text-[#0f766e]">{firstName}</span> 👋
                </h1>
                {nextAppointment ? (
                  <p className="text-muted-foreground">
                    {isSpanish
                      ? `Tienes una cita programada para ${formatDate(nextAppointment.date).toLowerCase()}`
                      : `You have an appointment scheduled for ${formatDate(nextAppointment.date).toLowerCase()}`}
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    {isSpanish
                      ? "No tienes citas próximas. ¿Deseas agendar una?"
                      : "No upcoming appointments. Would you like to book one?"}
                  </p>
                )}
              </div>
              {nextAppointment && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/40">
                  <div className="w-10 h-10 rounded-xl bg-[#0f766e]/10 flex items-center justify-center">
                    {nextAppointment.type === "online" ? (
                      <Video className="h-5 w-5 text-[#0f766e]" />
                    ) : (
                      <MapPin className="h-5 w-5 text-[#0f766e]" />
                    )}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{nextAppointment.professionalName}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatDate(nextAppointment.date)} • {formatTime(nextAppointment.time)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Search */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Search className="h-4 w-4 text-[#0f766e]" />
              {isSpanish ? "Buscar Especialista" : "Find a Specialist"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={
                    isSpanish
                      ? "Buscar por especialidad, nombre o síntoma..."
                      : "Search by specialty, name, or symptom..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 rounded-xl bg-muted/30 border-border/40 focus:border-[#0f766e]/50"
                />
              </div>
            </form>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {specialties.map((specialty) => (
                <Link
                  key={specialty.label}
                  href={`/search?specialty=${encodeURIComponent(specialty.label)}`}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border/40 hover:border-[#0f766e]/30 hover:bg-[#0f766e]/5 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted/50 group-hover:bg-[#0f766e]/10 flex items-center justify-center transition-colors">
                      <specialty.icon className="h-5 w-5 text-muted-foreground group-hover:text-[#0f766e] transition-colors" />
                    </div>
                    <span className="text-xs font-medium text-center text-muted-foreground group-hover:text-foreground transition-colors">
                      {isSpanish ? specialty.label : specialty.labelEn}
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Health Status Cards */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {isSpanish ? "Estado de Salud" : "Health Status"}
          </h2>
          <Button variant="ghost" size="sm" className="text-[#0f766e]" asChild>
            <Link href="/dashboard/patient/history">
              {isSpanish ? "Ver todo" : "View all"}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {healthCards.map((card) => (
            <Link key={card.id} href={card.href}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="border-border/40 hover:border-[#0f766e]/30 hover:shadow-md transition-all cursor-pointer h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3">
                        <div
                          className={cn(
                            "w-11 h-11 rounded-xl flex items-center justify-center",
                            card.color
                          )}
                        >
                          <card.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {isSpanish ? card.title : card.titleEn}
                          </p>
                          <p className="text-2xl font-bold mt-1">
                            {card.id === "wallet" ? `$${card.count}` : card.count}
                            {card.id === "wallet" && (
                              <span className="text-xs font-normal text-muted-foreground ml-1">
                                USDC
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Upcoming Appointments */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-semibold">
                {isSpanish ? "Próximas Citas" : "Upcoming Appointments"}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isSpanish
                  ? "Tus consultas agendadas"
                  : "Your scheduled consultations"}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="text-[#0f766e]" asChild>
              <Link href="/dashboard/patient/appointments">
                {isSpanish ? "Ver todas" : "View all"}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {mockAppointments.length > 0 ? (
              <div className="space-y-3">
                {mockAppointments.map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-border/40 hover:bg-accent/30 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border border-border/40">
                        <AvatarImage src={appointment.avatar} />
                        <AvatarFallback className="bg-[#0f766e]/10 text-[#0f766e] text-sm font-medium">
                          {appointment.professionalName
                            .split(" ")
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{appointment.professionalName}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.specialty}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-normal border-border/40"
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(appointment.date)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[10px] font-normal border-border/40"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(appointment.time)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] font-medium",
                          appointment.type === "online"
                            ? "bg-blue-500/10 text-blue-600"
                            : "bg-amber-500/10 text-amber-600"
                        )}
                      >
                        {appointment.type === "online" ? (
                          <>
                            <Video className="h-3 w-3 mr-1" />
                            {isSpanish ? "Online" : "Online"}
                          </>
                        ) : (
                          <>
                            <MapPin className="h-3 w-3 mr-1" />
                            {isSpanish ? "Presencial" : "In-person"}
                          </>
                        )}
                      </Badge>
                      {appointment.type === "online" && (
                        <Button
                          size="sm"
                          className="bg-[#0f766e] hover:bg-[#0f766e]/90 text-white rounded-lg h-8 px-3 opacity-0 group-hover:opacity-100 transition-opacity"
                          asChild
                        >
                          <Link href={`/consulta/${appointment.id}`}>
                            <Video className="h-3.5 w-3.5 mr-1.5" />
                            {isSpanish ? "Unirse" : "Join"}
                          </Link>
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  {isSpanish
                    ? "No tienes citas próximas"
                    : "You have no upcoming appointments"}
                </p>
                <Button className="bg-[#0f766e] hover:bg-[#0f766e]/90" asChild>
                  <Link href="/search">
                    <Search className="h-4 w-4 mr-2" />
                    {isSpanish ? "Buscar Especialista" : "Find a Specialist"}
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
