"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { motion, type Variants } from "framer-motion"
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  Video,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  User,
  MoreHorizontal,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

type AppointmentStatus = "confirmed" | "pending" | "completed" | "cancelled"
type PaymentStatus = "pending" | "paid" | "escrow"

interface Appointment {
  id: string
  patientName: string
  patientAvatar?: string
  date: string
  time: string
  type: "online" | "in_person"
  status: AppointmentStatus
  paymentStatus: PaymentStatus
  price: number
}

const mockAppointments: Appointment[] = [
  {
    id: "1",
    patientName: "María González",
    date: new Date().toISOString().split("T")[0],
    time: "09:30",
    type: "online",
    status: "confirmed",
    paymentStatus: "paid",
    price: 35,
  },
  {
    id: "2",
    patientName: "Carlos Rodríguez",
    date: new Date().toISOString().split("T")[0],
    time: "11:00",
    type: "online",
    status: "pending",
    paymentStatus: "pending",
    price: 35,
  },
  {
    id: "3",
    patientName: "Ana Martínez",
    date: new Date().toISOString().split("T")[0],
    time: "14:30",
    type: "in_person",
    status: "confirmed",
    paymentStatus: "escrow",
    price: 45,
  },
  {
    id: "4",
    patientName: "Pedro Sánchez",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    time: "10:00",
    type: "online",
    status: "confirmed",
    paymentStatus: "paid",
    price: 35,
  },
  {
    id: "5",
    patientName: "Lucía Fernández",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    time: "16:00",
    type: "online",
    status: "confirmed",
    paymentStatus: "pending",
    price: 35,
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

export default function ProfessionalDashboard() {
  const { language } = useLanguage()
  const { user } = useAuth()
  const isSpanish = language === "es"
  const today = new Date().toISOString().split("T")[0]

  const todayAppointments = useMemo(
    () => mockAppointments.filter((a) => a.date === today && a.status !== "cancelled"),
    []
  )

  const nextAppointment = useMemo(
    () =>
      todayAppointments
        .filter((a) => a.status === "confirmed")
        .sort((a, b) => a.time.localeCompare(b.time))[0],
    [todayAppointments]
  )

  const weekAppointments = mockAppointments.filter(
    (a) => a.status !== "cancelled"
  ).length

  const totalIncome = mockAppointments
    .filter((a) => a.paymentStatus === "paid" || a.paymentStatus === "escrow")
    .reduce((sum, a) => sum + a.price, 0)

  const newPatients = 4

  const getStatusBadge = (status: AppointmentStatus) => {
    const config = {
      confirmed: {
        label: isSpanish ? "Confirmada" : "Confirmed",
        className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      },
      pending: {
        label: isSpanish ? "Pendiente" : "Pending",
        className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      },
      completed: {
        label: isSpanish ? "Completada" : "Completed",
        className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      },
      cancelled: {
        label: isSpanish ? "Cancelada" : "Cancelled",
        className: "bg-red-500/10 text-red-600 border-red-500/20",
      },
    }
    return config[status]
  }

  const getPaymentBadge = (status: PaymentStatus) => {
    const config = {
      paid: {
        label: isSpanish ? "Pagado" : "Paid",
        className: "bg-emerald-500/10 text-emerald-600",
      },
      pending: {
        label: isSpanish ? "Pendiente" : "Pending",
        className: "bg-amber-500/10 text-amber-600",
      },
      escrow: {
        label: isSpanish ? "En garantía" : "In Escrow",
        className: "bg-blue-500/10 text-blue-600",
      },
    }
    return config[status]
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants}>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {isSpanish ? "Buenos días" : "Good morning"},{" "}
            <span className="text-[#0f766e]">
              Dr. {user?.user_metadata?.first_name || "Profesional"}
            </span>
          </h1>
          <p className="text-muted-foreground text-sm">
            {isSpanish
              ? `Tienes ${todayAppointments.length} citas programadas para hoy`
              : `You have ${todayAppointments.length} appointments scheduled for today`}
          </p>
        </div>
      </motion.div>

      {/* Next Appointment Widget */}
      {nextAppointment && (
        <motion.div variants={itemVariants}>
          <Card className="border-[#0f766e]/20 bg-gradient-to-br from-[#0f766e]/5 via-background to-background overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#0f766e]/10 flex items-center justify-center shrink-0">
                    <Video className="h-6 w-6 text-[#0f766e]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-[#0f766e] uppercase tracking-wider">
                      {isSpanish ? "Próxima Cita" : "Next Appointment"}
                    </p>
                    <h3 className="text-lg font-semibold">
                      {nextAppointment.patientName}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(nextAppointment.time)}
                      </span>
                      <Badge variant="outline" className="text-xs font-normal">
                        {nextAppointment.type === "online"
                          ? isSpanish
                            ? "Teleconsulta"
                            : "Teleconsultation"
                          : isSpanish
                          ? "Presencial"
                          : "In-person"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  className="bg-[#0f766e] hover:bg-[#0f766e]/90 text-white rounded-xl shadow-lg shadow-[#0f766e]/20 h-11 px-5"
                  asChild
                >
                  <Link href={`/consulta/${nextAppointment.id}`}>
                    <Video className="h-4 w-4 mr-2" />
                    {isSpanish ? "Iniciar Teleconsulta" : "Start Teleconsultation"}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Metrics */}
      <motion.div variants={itemVariants}>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/40 hover:shadow-md transition-shadow cursor-default group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {isSpanish ? "Citas de la Semana" : "This Week's Appointments"}
                  </p>
                  <p className="text-2xl font-bold">{weekAppointments}</p>
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +12% {isSpanish ? "vs semana anterior" : "vs last week"}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 hover:shadow-md transition-shadow cursor-default group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {isSpanish ? "Ingresos Totales" : "Total Income"} (USDC)
                  </p>
                  <p className="text-2xl font-bold">${totalIncome}</p>
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +8% {isSpanish ? "este mes" : "this month"}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 hover:shadow-md transition-shadow cursor-default group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {isSpanish ? "Pacientes Nuevos" : "New Patients"}
                  </p>
                  <p className="text-2xl font-bold">{newPatients}</p>
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +2 {isSpanish ? "esta semana" : "this week"}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="h-5 w-5 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Activity Table */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-semibold">
                {isSpanish ? "Actividad Reciente" : "Recent Activity"}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isSpanish
                  ? "Últimas citas agendadas y su estado"
                  : "Latest scheduled appointments and their status"}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="text-[#0f766e]" asChild>
              <Link href="/dashboard/professional/schedule">
                {isSpanish ? "Ver agenda completa" : "View full schedule"}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {mockAppointments.slice(0, 5).map((appointment, index) => {
                const statusBadge = getStatusBadge(appointment.status)
                const paymentBadge = getPaymentBadge(appointment.paymentStatus)
                const isToday = appointment.date === today

                return (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/40 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border/40">
                        <AvatarImage src={appointment.patientAvatar} />
                        <AvatarFallback className="bg-muted text-xs font-medium">
                          {appointment.patientName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {appointment.patientName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isToday
                            ? isSpanish
                              ? "Hoy"
                              : "Today"
                            : new Date(appointment.date).toLocaleDateString(
                                isSpanish ? "es-ES" : "en-US",
                                { weekday: "short", day: "numeric", month: "short" }
                              )}{" "}
                          • {formatTime(appointment.time)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] font-medium", statusBadge.className)}
                      >
                        {statusBadge.label}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={cn("text-[10px] font-medium", paymentBadge.className)}
                      >
                        ${appointment.price} • {paymentBadge.label}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem>
                            {isSpanish ? "Ver detalles" : "View details"}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            {isSpanish ? "Enviar mensaje" : "Send message"}
                          </DropdownMenuItem>
                          {appointment.status === "confirmed" && (
                            <DropdownMenuItem className="text-emerald-600">
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              {isSpanish ? "Marcar completada" : "Mark complete"}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
