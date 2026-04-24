"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Video, Clock, MapPin, Star, CheckCircle2, XCircle, Calendar, Download, CreditCard, MessageSquare } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReviewModal } from "@/components/review-modal"
import { QuickActions } from "@/components/appointments/quick-actions"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useSearchParams } from "next/navigation"
import { trackEvent } from "@/lib/utils/analytics"
import { loadingFullViewportClassName } from "@/lib/loading-layout"

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop"

function formatTime(value: string | null | undefined): string {
  if (!value) return ""
  const s = String(value)
  return s.length >= 5 ? s.slice(0, 5) : s
}

async function fetchMyAppointments(
  userId: string,
  locale: string
): Promise<any[]> {
  const supabase = createClient()
  const { data: rows, error } = await supabase
    .from("appointments")
    .select(
      "*, professional:professionals!appointments_professional_id_fkey(id, specialty, profile:profiles!professionals_id_fkey(first_name, last_name, avatar_url))"
    )
    .eq("patient_id", userId)
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true })

  if (error) throw error

  const localeKey = locale === "es" ? "es-CL" : "en-US"
  return (rows || []).map((apt: any) => {
    const prof = apt.professional
    const profile = prof?.profile
    const professionalName = profile
      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
      : ""
    const displayName = professionalName ? `Dr. ${professionalName}` : "Profesional"

    return {
      id: apt.id,
      professional: displayName,
      specialty: prof?.specialty ?? "",
      date: new Date(apt.appointment_date).toLocaleDateString(localeKey, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: formatTime(apt.appointment_time),
      mode: apt.type === "online" ? "Online Video" : "In-person",
      status: apt.status,
      paymentStatus: apt.payment_status ?? "pending",
      price: apt.price ?? 0,
      image: profile?.avatar_url || DEFAULT_AVATAR,
      professionalId: apt.professional_id,
      appointmentDate: apt.appointment_date,
      appointmentTime: formatTime(apt.appointment_time),
      type: apt.type,
      meetingLink: apt.meeting_link ?? null,
      meetingExpiresAt: apt.meeting_expires_at ?? null,
    }
  })
}

function AppointmentsContent() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const { user } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">("upcoming")
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean
    professionalName: string
    appointmentId: string
  }>({
    isOpen: false,
    professionalName: "",
    appointmentId: "",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isSpanish = language === "es"
  const searchParams = useSearchParams()

  useEffect(() => {
    const paymentStatus = searchParams.get('payment')
    const appointmentId = searchParams.get('appointment')
    
    if (paymentStatus === 'success' && appointmentId) {
      trackEvent('appointment_success', { appointmentId })
      toast.success(isSpanish ? "¡Cita agendada con éxito!" : "Appointment successfully booked!")
      // Clean up URL
      router.replace('/dashboard/appointments')
    }
  }, [searchParams, router, isSpanish])

  useEffect(() => {
    if (user === undefined) return
    if (!user) {
      router.replace("/login")
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    fetchMyAppointments(user.id, language)
      .then((list) => {
        if (!cancelled) setAppointments(list)
      })
      .catch((err) => {
        console.error("Error loading appointments:", err)
        if (!cancelled) {
          setError(isSpanish ? "No se pudieron cargar las citas." : "Could not load appointments.")
          setAppointments([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user, language, router, isSpanish])

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

  const upcomingAppointments = appointments
    .filter((a: any) => a.status === "confirmed" || a.status === "pending")
    .sort((a: any, b: any) => {
      const da = new Date(`${a.appointmentDate}T${a.appointmentTime}`).getTime()
      const db = new Date(`${b.appointmentDate}T${b.appointmentTime}`).getTime()
      return da - db
    })
  const historyAppointments = appointments.filter(
    (a: any) => a.status === "completed" || a.status === "cancelled"
  )

  const refreshAppointments = () => {
    if (!user) return
    fetchMyAppointments(user.id, language).then(setAppointments)
  }

  const isWithin15Min = (apt: any) => {
    const aptDate = new Date(`${apt.appointmentDate}T${apt.appointmentTime}`)
    const now = new Date()
    const diffMs = aptDate.getTime() - now.getTime()
    return diffMs >= 0 && diffMs <= 15 * 60 * 1000
  }

  const canJoinVideo = (apt: any, index: number) => {
    return apt.mode === "Online Video" && (isWithin15Min(apt) || index === 0)
  }

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

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "upcoming" | "history")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-xl bg-accent/20 p-1">
            <TabsTrigger value="upcoming" className="rounded-lg data-[state=active]:bg-background transition-colors">
              {isSpanish ? "Próximas Citas" : "Upcoming"}
              {upcomingAppointments.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                  {upcomingAppointments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-background transition-colors">
              {isSpanish ? "Historial" : "History"}
              {historyAppointments.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                  {historyAppointments.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Próximas Citas */}
          <TabsContent value="upcoming" className="space-y-4 mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <Card className="border-border/40">
                <CardContent className="p-12 text-center">
                  <p className="text-destructive font-medium mb-2">{error}</p>
                  <Button className="rounded-xl mt-4" onClick={() => window.location.reload()}>
                    {language === "es" ? "Reintentar" : "Retry"}
                  </Button>
                </CardContent>
              </Card>
            ) : upcomingAppointments.length > 0 ? (
              <AnimatePresence mode="wait">
                {upcomingAppointments.map((appointment: any, index: number) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="border-border/40 hover:shadow-md transition-all">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                          <div className="flex gap-4 flex-1">
                            <Avatar className="h-16 w-16 rounded-2xl border border-border/40">
                              <AvatarImage src={appointment.image} />
                              <AvatarFallback>
                                {appointment.professional.split(" ").map((n: string) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-bold text-lg">{appointment.professional}</h3>
                                  <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary">
                                    {isSpanish ? "Confirmada" : "Confirmed"}
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
                                      ? (isSpanish ? "Consulta Online" : "Online Session")
                                      : (isSpanish ? "Consulta Presencial" : "In-person Visit")}
                                  </span>
                                </div>
                              </div>
                              <div className="pt-2 space-y-1">
                                <p className="text-sm font-semibold">
                                  {isSpanish ? "Código:" : "Code:"} {appointment.id}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {isSpanish ? "Precio:" : "Price:"} ${appointment.price?.toLocaleString()} {isSpanish ? "CLP" : "CLP"}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:justify-start">
                            {appointment.mode === "Online Video" && appointment.status === "confirmed" && canJoinVideo(appointment, index) && (
                              <Button
                                className="rounded-xl w-full sm:w-auto lg:w-full font-semibold shadow-lg shadow-primary/20"
                                asChild
                              >
                                <Link href={`/consulta/${appointment.id}`}>
                                  <Video className="h-4 w-4 mr-2" />
                                  {isSpanish ? "Entrar a Consulta" : "Enter Consultation"}
                                </Link>
                              </Button>
                            )}
                            {appointment.mode === "Online Video" && appointment.status === "confirmed" && !canJoinVideo(appointment, index) && (
                              <Button variant="outline" className="rounded-xl w-full sm:w-auto lg:w-full" disabled>
                                <Video className="h-4 w-4 mr-2" />
                                {isSpanish ? "Disponible 15 min antes" : "Available 15 min before"}
                              </Button>
                            )}
                            {appointment.mode !== "Online Video" && (
                              <Button
                                asChild
                                variant="outline"
                                className="rounded-xl w-full sm:w-auto lg:w-full"
                              >
                                <Link href={`/dashboard/chat?to=${appointment.professionalId}`}>
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  {isSpanish ? "Abrir Chat" : "Open chat"}
                                </Link>
                              </Button>
                            )}
                            <QuickActions
                              appointmentId={appointment.id}
                              appointmentDate={appointment.appointmentDate || appointment.date}
                              appointmentTime={appointment.time}
                              status={appointment.status}
                              onReschedule={() => window.location.reload()}
                              onCancel={refreshAppointments}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <Card className="border-border/40">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground font-medium mb-2">
                    {isSpanish ? "No tienes citas próximas" : "You have no upcoming appointments"}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {isSpanish
                      ? "Busca un profesional en nuestro buscador y agenda tu próxima consulta cuando estés listo."
                      : "Search for a professional in our search and book your next appointment when you're ready."}
                  </p>
                  <Button className="rounded-xl" asChild>
                    <Link href="/search">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      {isSpanish ? "Buscar profesional" : "Search for a professional"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Historial (completadas + canceladas) */}
          <TabsContent value="history" className="space-y-4 mt-6">
            {/* Banner reseña pendiente: primera cita completada sin reseña */}
            {!loading && historyAppointments.length > 0 && (() => {
              const firstCompleted = historyAppointments.find((a: any) => a.status === "completed")
              if (!firstCompleted) return null
              return (
                <Card className="mb-6 border-primary/30 bg-primary/5 dark:bg-primary/10">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                          <Star className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {isSpanish
                              ? `¿Cómo te fue con ${firstCompleted.professional}?`
                              : `How was your visit with ${firstCompleted.professional}?`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {isSpanish ? "Deja tu opinión y ayuda a otros pacientes." : "Leave your review and help other patients."}
                          </p>
                        </div>
                      </div>
                      <Button
                        className="rounded-xl shrink-0"
                        onClick={() => openReviewModal(firstCompleted.professional, firstCompleted.id)}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        {isSpanish ? "Deja tu opinión" : "Leave your review"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })()}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : historyAppointments.length > 0 ? (
              <AnimatePresence mode="wait">
                {historyAppointments.map((appointment: any) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className={cn(
                      "border-border/40 hover:shadow-md transition-all",
                      appointment.status === "cancelled" && "opacity-75"
                    )}>
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                          <div className="flex gap-4 flex-1">
                            <Avatar className="h-16 w-16 rounded-2xl border border-border/40">
                              <AvatarImage src={appointment.image} />
                              <AvatarFallback>
                                {appointment.professional.split(" ").map((n: string) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-bold text-lg">{appointment.professional}</h3>
                                  <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                                </div>
                                {appointment.status === "completed" ? (
                                  <Badge variant="outline" className="bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    {isSpanish ? "Completada" : "Completed"}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-destructive/10 border-destructive/20 text-destructive">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    {isSpanish ? "Cancelada" : "Cancelled"}
                                  </Badge>
                                )}
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
                                  {isSpanish ? "Código:" : "Code:"} {appointment.id}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:justify-start">
                            {appointment.status === "completed" && (
                              <Button className="rounded-xl w-full sm:w-auto lg:w-full" onClick={() => openReviewModal(appointment.professional, appointment.id)}>
                                <Star className="h-4 w-4 mr-2" />
                                {t.dashboard.review}
                              </Button>
                            )}
                            {appointment.status === "cancelled" && (
                              <Button variant="outline" className="rounded-xl w-full sm:w-auto lg:w-full" asChild>
                                <Link href="/search">{t.dashboard.bookNew}</Link>
                              </Button>
                            )}
                            <Button variant="outline" className="rounded-xl w-full sm:w-auto lg:w-full" asChild>
                              <Link href={`/professionals/${appointment.professionalId}`}>{t.dashboard.viewDetails}</Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <Card className="border-border/40">
                <CardContent className="p-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground font-medium">
                    {isSpanish ? "Aún no tienes citas en tu historial" : "You have no appointments in your history yet"}
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

export default function AppointmentsPage() {
  return (
    <Suspense fallback={
      <div className={loadingFullViewportClassName("bg-background")}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <AppointmentsContent />
    </Suspense>
  )
}
