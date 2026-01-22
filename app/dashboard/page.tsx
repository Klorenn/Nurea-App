"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  MapPin, 
  MessageSquare, 
  ArrowRight, 
  Star, 
  Heart, 
  ChevronRight, 
  Calendar,
  CreditCard,
  FileText,
  CheckCircle2,
  AlertCircle,
  Bell,
  Video,
  ExternalLink,
  Search,
  Loader2
} from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function PatientDashboard() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const { user } = useAuth()
  const supabase = createClient()
  const { stats: dashboardStats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats()
  
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([])
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const today = new Date().toISOString().split('T')[0]
        
        // Load today's appointments
        const todayResponse = await supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('patient_id', user.id)
          .eq('appointment_date', today)
          .in('status', ['confirmed', 'pending'])

        // Load upcoming appointments
        const upcomingResponse = await supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('patient_id', user.id)
          .gte('appointment_date', today)
          .in('status', ['confirmed', 'pending'])

        // Load unread messages
        const messagesResponse = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('receiver_id', user.id)
          .eq('read', false)

        // Load pending payments
        const paymentsResponse = await supabase
          .from('payments')
          .select('id', { count: 'exact', head: true })
          .eq('patient_id', user.id)
          .eq('status', 'pending')

        // Stats are now loaded via useDashboardStats hook

        // Load upcoming appointments details with specialty
        const upcomingDetailsResponse = await supabase
          .from('appointments')
          .select(`
            id,
            appointment_date,
            appointment_time,
            type,
            status,
            professional:profiles!appointments_professional_id_fkey(
              id,
              first_name,
              last_name,
              avatar_url
            ),
            professional_data:professionals!appointments_professional_id_fkey(
              id,
              specialty
            )
          `)
          .eq('patient_id', user.id)
          .gte('appointment_date', today)
          .in('status', ['confirmed', 'pending'])
          .order('appointment_date', { ascending: true })
          .order('appointment_time', { ascending: true })
          .limit(2)

        if (upcomingDetailsResponse.data) {
          const formatted = upcomingDetailsResponse.data.map((apt: any) => ({
            id: apt.id,
            date: new Date(apt.appointment_date).toLocaleDateString(
              language === "es" ? "es-ES" : "en-US",
              { year: "numeric", month: "short", day: "numeric" }
            ),
            day: new Date(apt.appointment_date).getDate(),
            month: new Date(apt.appointment_date).toLocaleDateString(
              language === "es" ? "es-ES" : "en-US",
              { month: "short" }
            ).toUpperCase(),
            time: apt.appointment_time,
            professional: `Dr. ${apt.professional?.first_name || ''} ${apt.professional?.last_name || ''}`.trim(),
            specialty: apt.professional_data?.specialty || '',
            type: apt.type,
            status: apt.status,
            image: apt.professional?.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
          }))
          setUpcomingAppointments(formatted)
        }

        // Load favorites
        const favoritesResponse = await fetch("/api/favorites")
        if (favoritesResponse.ok) {
          const favoritesData = await favoritesResponse.json()
          setFavorites(favoritesData.favorites?.slice(0, 3) || [])
        } else {
          console.warn("Error loading favorites:", favoritesResponse.statusText)
        }
      } catch (error) {
        console.error("Error loading stats:", error)
        setError(error instanceof Error ? error.message : "Error al cargar el dashboard. Por favor, intenta nuevamente.")
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [user, supabase, language])

  const firstName = user?.user_metadata?.first_name || t.dashboard.user

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  if (loading || statsLoading) {
    return (
      <DashboardLayout role="patient">
        <LoadingState message={t.dashboard.loading || "Cargando..."} />
      </DashboardLayout>
    )
  }

  if (error || statsError) {
    return (
      <DashboardLayout role="patient">
        <ErrorState 
          message={error || statsError || "Error desconocido"} 
          action={{ 
            label: t.dashboard.retry || "Reintentar", 
            onClick: () => {
              if (error) window.location.reload()
              else refetchStats()
            }
          }} 
        />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="patient">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Welcome Section */}
        <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-3">
          <motion.div variants={cardVariants}>
            <Card className="md:col-span-2 border-primary/10 bg-gradient-to-br from-primary/5 via-background to-transparent shadow-lg shadow-primary/5">
              <CardContent className="pt-8 pb-8">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="space-y-3">
                    <div>
                      <h2 className="text-3xl font-bold tracking-tight">
                        {t.dashboard.hello} {firstName}!
                      </h2>
                      <p className="text-muted-foreground text-lg mt-2">
                        {t.dashboard.welcomeMessage}
                      </p>
                    </div>
                    
                    {dashboardStats.todayAppointments > 0 ? (
                      <p className="text-muted-foreground">
                        {t.dashboard.todayAppointmentsCount
                          .replace("{count}", dashboardStats.todayAppointments.toString())
                          .replace("{appointment}", dashboardStats.todayAppointments === 1 ? t.dashboard.appointment : t.dashboard.appointments)
                          .replace("{plural}", dashboardStats.todayAppointments === 1 ? "" : "s")}
                      </p>
                    ) : (
                      <p className="text-muted-foreground">
                        {t.dashboard.noAppointmentsToday}
                      </p>
                    )}
                    
                    <div className="pt-2">
                      <Button className="rounded-xl px-6 h-11 transition-transform hover:scale-105 active:scale-95" asChild>
                        <Link href="/search">
                          {t.dashboard.bookNew}
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center text-primary animate-gentle-rotate">
                    <Heart className="h-12 w-12 fill-current" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={cardVariants}>
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-lg">
                  {t.dashboard.quickActions}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Link href="/dashboard/appointments">
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-all cursor-pointer group hover:translate-x-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {t.dashboard.appointments}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {dashboardStats.upcomingAppointments} {t.dashboard.upcoming}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                </div>

                <div>
                  <Link href="/dashboard/chat">
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-all cursor-pointer group hover:translate-x-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {t.dashboard.messages}
                          </p>
                          {dashboardStats.unreadMessages > 0 ? (
                            <p className="text-xs text-secondary font-medium">
                              {dashboardStats.unreadMessages} {t.dashboard.new}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              {t.dashboard.noNew}
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-secondary transition-colors" />
                    </div>
                  </Link>
                </div>

                <div>
                  <Link href="/dashboard/payments">
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-all cursor-pointer group hover:translate-x-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {t.dashboard.payments}
                          </p>
                          {dashboardStats.pendingPayments > 0 ? (
                            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                              {dashboardStats.pendingPayments} {t.dashboard.pending}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              {t.dashboard.upToDate}
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-green-600 transition-colors" />
                    </div>
                  </Link>
                </div>

                <div>
                  <Link href="/search">
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-all cursor-pointer group hover:translate-x-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
                          <Search className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {language === "es" ? "Buscar Profesional" : "Search Professional"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {language === "es" ? "Encuentra especialistas" : "Find specialists"}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-teal-600 transition-colors" />
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Upcoming Appointments */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">{t.dashboard.upcomingAppointments}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t.dashboard.upcomingAppointmentsSubtitle}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary" asChild>
              <Link href="/dashboard/appointments">
                {t.dashboard.viewAll} <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {upcomingAppointments.length > 0 ? (
            <div className="grid gap-4">
              {upcomingAppointments.map((apt, index) => (
                <motion.div
                  key={apt.id}
                  variants={cardVariants}
                >
                  <Card className="border-border/40 hover:shadow-md transition-all group hover:scale-[1.01] hover:-translate-y-0.5">
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-accent/20 flex flex-col items-center justify-center text-primary font-bold overflow-hidden shrink-0">
                            <div className="bg-primary w-full text-[10px] text-white py-0.5 text-center uppercase tracking-tighter">
                              {apt.month}
                            </div>
                            <div className="text-2xl pt-1 leading-none tracking-tighter">{apt.day}</div>
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-lg group-hover:text-primary transition-colors">
                              {apt.professional}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {apt.specialty || (language === "es" ? "Profesional" : "Professional")} • {apt.type === "online" ? t.dashboard.onlineSession : t.dashboard.inPersonVisit}
                            </p>
                            <div className="flex flex-wrap gap-4 pt-2">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" /> {apt.time}
                              </div>
                              {apt.type === "online" ? (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Video className="h-3.5 w-3.5" /> {t.dashboard.secureLink}
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <MapPin className="h-3.5 w-3.5" /> {language === "es" ? "Presencial" : "In-person"}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {apt.type === "online" && (
                            <Button variant="outline" className="rounded-xl bg-transparent transition-transform hover:scale-105 active:scale-95" asChild>
                              <Link href="/dashboard/appointments">
                                {t.dashboard.joinMeeting}
                              </Link>
                            </Button>
                          )}
                          <Badge
                            variant="outline"
                            className="rounded-lg h-9 px-4 border-primary/20 bg-primary/5 text-primary"
                          >
                            {apt.status === "confirmed" ? t.dashboard.confirmed : t.dashboard.pending}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title={t.dashboard.noUpcomingAppointments}
              action={{
                label: t.dashboard.bookNew,
                href: "/search"
              }}
            />
          )}
        </motion.div>

        {/* Recent Documents */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">{t.dashboard.recentDocuments}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t.dashboard.recentDocumentsSubtitle}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary" asChild>
              <Link href="/dashboard/documents">
                {t.dashboard.viewAll} <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: t.dashboard.medicalCertificate, date: "Sep 28, 2024", doctor: t.dashboard.drMarcoPolo },
              { title: t.dashboard.labResultsBloodwork, date: "Sep 20, 2024", doctor: t.dashboard.clinicalLabs },
              { title: t.dashboard.sessionSummary, date: "Sep 15, 2024", doctor: t.dashboard.drElenaVargas },
            ].map((doc, i) => (
              <motion.div
                key={i}
                variants={cardVariants}
              >
                <Card className="border-border/40 hover:shadow-md transition-all cursor-pointer group hover:scale-[1.02] hover:-translate-y-0.5">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <FileText className="h-8 w-8 text-primary opacity-60" />
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <h4 className="font-bold text-sm mb-1">{doc.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {doc.date} • {doc.doctor}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Favorite Specialists */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">{t.dashboard.favoriteSpecialists}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t.dashboard.favoriteSpecialistsSubtitle}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary" asChild>
              <Link href="/dashboard/favorites">
                {t.dashboard.viewAll} <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {favorites.length > 0 ? (
              favorites.map((favorite) => (
                <motion.div
                  key={favorite.id}
                  variants={cardVariants}
                >
                  <Card className="border-border/40 hover:shadow-sm transition-all hover:scale-[1.02] hover:translate-x-1">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 rounded-xl border border-border/40">
                          <AvatarImage src={favorite.image} />
                          <AvatarFallback>
                            {favorite.name.split(" ").map((n: string) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold truncate">
                            {favorite.name}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {favorite.specialty}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 fill-primary text-primary" />
                            <span className="text-xs font-bold">{favorite.rating}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" aria-label={language === "es" ? `Ver perfil de ${favorite.name}` : `View ${favorite.name}'s profile`} asChild>
                          <Link href={`/professionals/${favorite.professionalId}`}>
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : null}
            <motion.div
              variants={cardVariants}
            >
              <Button
                variant="outline"
                className="w-full rounded-xl border-dashed border-primary/20 hover:bg-primary/5 hover:border-primary/40 bg-transparent h-auto py-8 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                asChild
              >
                <Link href="/search">
                  {t.dashboard.browseMore}
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
