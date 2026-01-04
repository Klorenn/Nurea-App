"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Video, Clock, MapPin, Star, CheckCircle2, XCircle, Calendar, Download, CreditCard, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReviewModal } from "@/components/review-modal"
import { QuickActions } from "@/components/appointments/quick-actions"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"

const appointments = [
  {
    id: "NR-99231",
    professional: "Dr. Elena Vargas",
    specialty: "Clinical Psychologist",
    date: "Oct 5, 2024",
    time: "14:30",
    mode: "Online Video",
    status: "confirmed",
    paymentStatus: "paid",
    price: 45000,
    image: "/prof-1.jpg",
  },
  {
    id: "NR-98112",
    professional: "Dr. Marco Polo",
    specialty: "Cardiologist",
    date: "Sep 28, 2024",
    time: "10:00",
    mode: "In-person",
    status: "completed",
    paymentStatus: "paid",
    price: 55000,
    image: "/prof-2.jpg",
  },
]

export default function AppointmentsPage() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean
    professionalName: string
    appointmentId: string
  }>({
    isOpen: false,
    professionalName: "",
    appointmentId: "",
  })
  const [loading, setLoading] = useState(false)

  const openReviewModal = (professionalName: string, appointmentId: string) => {
    setReviewModal({
      isOpen: true,
      professionalName,
      appointmentId,
    })
  }

  const handleExportHistory = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/appointments/export?format=csv")
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `historial-citas-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error exporting:", error)
    } finally {
      setLoading(false)
    }
  }

  const upcomingAppointments = appointments.filter(a => a.status === "confirmed" || a.status === "pending")
  const completedAppointments = appointments.filter(a => a.status === "completed")
  const cancelledAppointments = appointments.filter(a => a.status === "cancelled")

  const getPaymentStatusBadge = (status: string) => {
    const isSpanish = language === "es"
    switch (status) {
      case "paid":
        return (
          <Badge variant="outline" className="bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {isSpanish ? "Pagado" : "Paid"}
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400">
            <Clock className="h-3 w-3 mr-1" />
            {isSpanish ? "Pendiente" : "Pending"}
          </Badge>
        )
      case "refunded":
        return (
          <Badge variant="outline" className="bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400">
            <CreditCard className="h-3 w-3 mr-1" />
            {isSpanish ? "Reembolsado" : "Refunded"}
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <DashboardLayout role="patient">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t.dashboard.appointments}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === "es" 
                ? "Gestiona tus consultas y tu historial médico"
                : "Manage your consultations and medical history"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl font-bold" onClick={handleExportHistory} disabled={loading}>
              <Download className="mr-2 h-4 w-4" />
              {loading 
                ? (language === "es" ? "Descargando..." : "Downloading...")
                : (language === "es" ? "Descargar Historial" : "Download History")}
            </Button>
            <Button className="rounded-xl font-bold" asChild>
              <Link href="/search">
                <CalendarDays className="mr-2 h-4 w-4" /> {t.dashboard.bookNew}
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-xl bg-accent/20 p-1">
            <TabsTrigger value="upcoming" className="rounded-lg data-[state=active]:bg-background">
              {t.dashboard.upcoming}
              {upcomingAppointments.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                  {upcomingAppointments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-background">
              {t.dashboard.completed}
              {completedAppointments.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                  {completedAppointments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="rounded-lg data-[state=active]:bg-background">
              {t.dashboard.cancelled}
              {cancelledAppointments.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                  {cancelledAppointments.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Appointments */}
          <TabsContent value="upcoming" className="space-y-4 mt-6">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <Card key={appointment.id} className="border-border/40 hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex gap-4 flex-1">
                        <Avatar className="h-16 w-16 rounded-2xl border border-border/40">
                          <AvatarImage src={appointment.image} />
                          <AvatarFallback>
                            {appointment.professional.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-lg">{appointment.professional}</h3>
                              <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge 
                                variant="outline" 
                                className="bg-primary/10 border-primary/20 text-primary"
                              >
                                {language === "es" ? "Confirmada" : "Confirmed"}
                              </Badge>
                              {getPaymentStatusBadge(appointment.paymentStatus)}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{appointment.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{appointment.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {appointment.mode === "Online Video" ? (
                                <Video className="h-4 w-4" />
                              ) : (
                                <MapPin className="h-4 w-4" />
                              )}
                              <span>
                                {appointment.mode === "Online Video" 
                                  ? (language === "es" ? "Consulta Online" : "Online Session")
                                  : (language === "es" ? "Consulta Presencial" : "In-person Visit")}
                              </span>
                            </div>
                          </div>
                          <div className="pt-2 space-y-1">
                            <p className="text-sm font-semibold">
                              {language === "es" ? "Código:" : "Code:"} {appointment.id}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {language === "es" ? "Precio:" : "Price:"} ${appointment.price?.toLocaleString()} {language === "es" ? "CLP" : "CLP"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:justify-start">
                        {appointment.mode === "Online Video" ? (
                          <Button className="rounded-xl w-full sm:w-auto lg:w-full" asChild>
                            <Link href="#">
                              {t.dashboard.joinMeeting}
                            </Link>
                          </Button>
                        ) : (
                          <Button variant="outline" className="rounded-xl w-full sm:w-auto lg:w-full" asChild>
                            <Link href="#">
                              {t.dashboard.viewDetails}
                            </Link>
                          </Button>
                        )}
                        <QuickActions
                          appointmentId={appointment.id}
                          appointmentDate={appointment.date}
                          appointmentTime={appointment.time}
                          onReschedule={() => window.location.reload()}
                          onCancel={() => window.location.reload()}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-border/40">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground font-medium mb-2">
                    {t.dashboard.noUpcomingAppointments}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {language === "es" 
                      ? "Agenda tu próxima consulta cuando estés listo"
                      : "Schedule your next consultation when you're ready"}
                  </p>
                  <Button className="rounded-xl" asChild>
                    <Link href="/search">
                      {t.dashboard.bookNew}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Completed Appointments */}
          <TabsContent value="completed" className="space-y-4 mt-6">
            {completedAppointments.length > 0 ? (
              completedAppointments.map((appointment) => (
                <Card key={appointment.id} className="border-border/40 hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex gap-4 flex-1">
                        <Avatar className="h-16 w-16 rounded-2xl border border-border/40">
                          <AvatarImage src={appointment.image} />
                          <AvatarFallback>
                            {appointment.professional.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-lg">{appointment.professional}</h3>
                              <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                            </div>
                            <Badge 
                              variant="outline" 
                              className="bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {language === "es" ? "Completada" : "Completed"}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{appointment.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{appointment.time}</span>
                            </div>
                          </div>
                          <div className="pt-2">
                            <p className="text-sm font-semibold">
                              {language === "es" ? "Código:" : "Code:"} {appointment.id}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:justify-start">
                        <Button className="rounded-xl w-full sm:w-auto lg:w-full" onClick={() => openReviewModal(appointment.professional, appointment.id)}>
                          <Star className="h-4 w-4 mr-2" />
                          {t.dashboard.review}
                        </Button>
                        <Button variant="outline" className="rounded-xl w-full sm:w-auto lg:w-full" asChild>
                          <Link href="#">
                            {t.dashboard.viewDetails}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-border/40">
                <CardContent className="p-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground font-medium">
                    {t.dashboard.noCompletedAppointments}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Cancelled Appointments */}
          <TabsContent value="cancelled" className="space-y-4 mt-6">
            {cancelledAppointments.length > 0 ? (
              cancelledAppointments.map((appointment) => (
                <Card key={appointment.id} className="border-border/40 opacity-75">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex gap-4 flex-1">
                        <Avatar className="h-16 w-16 rounded-2xl border border-border/40">
                          <AvatarImage src={appointment.image} />
                          <AvatarFallback>
                            {appointment.professional.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-lg">{appointment.professional}</h3>
                              <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                            </div>
                            <Badge 
                              variant="outline" 
                              className="bg-destructive/10 border-destructive/20 text-destructive"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              {language === "es" ? "Cancelada" : "Cancelled"}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{appointment.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{appointment.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:justify-start">
                        <Button variant="outline" className="rounded-xl w-full sm:w-auto lg:w-full" asChild>
                          <Link href="/search">
                            {t.dashboard.bookNew}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-border/40">
                <CardContent className="p-12 text-center">
                  <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground font-medium">
                    {t.dashboard.noCancelledAppointments}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal({ isOpen: false, professionalName: "", appointmentId: "" })}
        professionalName={reviewModal.professionalName}
        appointmentId={reviewModal.appointmentId}
      />
    </DashboardLayout>
  )
}
