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
  Search
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
  
  const [stats, setStats] = useState({
    todayAppointments: 0,
    upcomingAppointments: 0,
    unreadMessages: 0,
    pendingPayments: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return

      try {
        // Aquí cargarías datos reales de Supabase
        // Por ahora usamos datos de ejemplo
        setStats({
          todayAppointments: 1,
          upcomingAppointments: 2,
          unreadMessages: 3,
          pendingPayments: 0,
        })
      } catch (error) {
        console.error("Error loading stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [user])

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
                    
                    {stats.todayAppointments > 0 ? (
                      <p className="text-muted-foreground">
                        {t.dashboard.todayAppointmentsCount
                          .replace("{count}", stats.todayAppointments.toString())
                          .replace("{appointment}", stats.todayAppointments === 1 ? t.dashboard.appointment : t.dashboard.appointments)
                          .replace("{plural}", stats.todayAppointments === 1 ? "" : "s")}
                      </p>
                    ) : (
                      <p className="text-muted-foreground">
                        {t.dashboard.noAppointmentsToday}
                      </p>
                    )}
                    
                    <div className="pt-2">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button className="rounded-xl px-6 h-11" asChild>
                          <Link href="/search">
                            {t.dashboard.bookNew}
                          </Link>
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                  <motion.div
                    animate={{
                      rotate: [0, 3, -3, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center text-primary"
                  >
                    <Heart className="h-12 w-12 fill-current" />
                  </motion.div>
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
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link href="/dashboard/appointments">
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {t.dashboard.appointments}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {stats.upcomingAppointments} {t.dashboard.upcoming}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link href="/dashboard/chat">
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {t.dashboard.messages}
                          </p>
                          {stats.unreadMessages > 0 ? (
                            <p className="text-xs text-secondary font-medium">
                              {stats.unreadMessages} {t.dashboard.new}
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
                </motion.div>

                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link href="/dashboard/payments">
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {t.dashboard.payments}
                          </p>
                          {stats.pendingPayments > 0 ? (
                            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                              {stats.pendingPayments} {t.dashboard.pending}
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
                </motion.div>

                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link href="/search">
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer group">
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
                </motion.div>
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

          {stats.upcomingAppointments > 0 ? (
            <div className="grid gap-4">
              <motion.div
                variants={cardVariants}
                whileHover={{ scale: 1.01, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Card className="border-border/40 hover:shadow-md transition-all group">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-accent/20 flex flex-col items-center justify-center text-primary font-bold overflow-hidden shrink-0">
                          <div className="bg-primary w-full text-[10px] text-white py-0.5 text-center uppercase tracking-tighter">
                            {t.dashboard.oct}
                          </div>
                          <div className="text-2xl pt-1 leading-none tracking-tighter">05</div>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-lg group-hover:text-primary transition-colors">
                            {t.dashboard.drElenaVargas}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {t.dashboard.clinicalPsychologist} • {t.dashboard.onlineSession}
                          </p>
                          <div className="flex flex-wrap gap-4 pt-2">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" /> 14:30 - 15:30
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Video className="h-3.5 w-3.5" /> {t.dashboard.secureLink}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button variant="outline" className="rounded-xl bg-transparent" asChild>
                            <Link href="/dashboard/appointments">
                              {t.dashboard.joinMeeting}
                            </Link>
                          </Button>
                        </motion.div>
                        <Button variant="ghost" size="icon" className="rounded-xl" asChild>
                          <Link href="/dashboard/appointments">
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={cardVariants}
                whileHover={{ scale: 1.01, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Card className="border-border/40 hover:shadow-md transition-all opacity-90 group">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-accent/20 flex flex-col items-center justify-center text-muted-foreground font-bold overflow-hidden shrink-0">
                          <div className="bg-muted w-full text-[10px] text-muted-foreground py-0.5 text-center uppercase tracking-tighter">
                            {t.dashboard.oct}
                          </div>
                          <div className="text-2xl pt-1 leading-none tracking-tighter">12</div>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-lg group-hover:text-secondary transition-colors">
                            {t.dashboard.drMarcoPolo}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {t.dashboard.cardiologist} • {t.dashboard.inPersonVisit}
                          </p>
                          <div className="flex flex-wrap gap-4 pt-2">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" /> 09:00 - 09:45
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5" /> {t.dashboard.lasCondesSantiago}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="rounded-lg h-9 px-4 border-secondary/20 bg-secondary/5 text-secondary"
                        >
                          {t.dashboard.confirmed}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          ) : (
            <motion.div variants={cardVariants}>
              <Card className="border-border/40">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground font-medium">
                    {t.dashboard.noUpcomingAppointments}
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-4"
                  >
                    <Button className="rounded-xl" asChild>
                      <Link href="/search">
                        {t.dashboard.bookNew}
                      </Link>
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
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
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Card className="border-border/40 hover:shadow-md transition-all cursor-pointer group">
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
            {[
              { name: t.dashboard.drSofiaRossi, specialty: t.dashboard.dermatologist, rating: "4.9" },
              { name: t.dashboard.drLucasMendez, specialty: t.dashboard.pediatrician, rating: "4.8" },
            ].map((specialist, i) => (
              <motion.div
                key={i}
                variants={cardVariants}
                whileHover={{ scale: 1.02, x: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Card className="border-border/40 hover:shadow-sm transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 rounded-xl border border-border/40">
                        <AvatarImage src={`/fav-${i + 1}.jpg?height=48&width=48&query=doctor-${i + 1}`} />
                        <AvatarFallback>DR</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold truncate">
                          {specialist.name}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {specialist.specialty}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-primary text-primary" />
                          <span className="text-xs font-bold">{specialist.rating}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" asChild>
                        <Link href="/dashboard/favorites">
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            <motion.div
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                className="w-full rounded-xl border-dashed border-primary/20 hover:bg-primary/5 hover:border-primary/40 bg-transparent h-auto py-8"
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
