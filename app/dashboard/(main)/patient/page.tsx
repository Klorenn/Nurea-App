"use client"

import { useState, useEffect } from "react"
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
  Video,
  MapPin,
  ChevronRight,
  Stethoscope,
  Brain,
  Eye,
  Bone,
  Baby,
  Download,
  CheckCircle2,
  XCircle,
  User,
  Phone,
  AlertCircle,
  Loader2,
  Settings,
  Shield,
  CalendarCheck,
  Star,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { format, parseISO, isToday, isTomorrow, differenceInHours, isPast } from "date-fns"
import { es, enUS } from "date-fns/locale"
import { toast } from "sonner"
import { getJitsiMeetingUrl } from "@/lib/utils/jitsi"

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  type: "online" | "in-person"
  status: string
  duration_minutes: number
  professional: {
    id: string
    specialty: string
    profile: {
      first_name: string
      last_name: string
      avatar_url?: string
    }
  }
}

interface Prescription {
  id: string
  created_at: string
  professional_name: string
  medication_count: number
}

interface MedicalRecord {
  id: string
  created_at: string
  diagnosis: string
  diagnosis_code?: string
  professional: {
    profile: {
      first_name: string
      last_name: string
    }
  }
}

interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  emergency_contact?: string
  avatar_url?: string
}

const specialties = [
  { icon: Stethoscope, label: "Medicina General", labelEn: "General Medicine", slug: "medicina-general" },
  { icon: Brain, label: "Psicología", labelEn: "Psychology", slug: "psicologia" },
  { icon: Heart, label: "Cardiología", labelEn: "Cardiology", slug: "cardiologia" },
  { icon: Eye, label: "Oftalmología", labelEn: "Ophthalmology", slug: "oftalmologia" },
  { icon: Bone, label: "Traumatología", labelEn: "Orthopedics", slug: "traumatologia" },
  { icon: Baby, label: "Pediatría", labelEn: "Pediatrics", slug: "pediatria" },
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
  const supabase = createClient()
  const isSpanish = language === "es"
  const locale = isSpanish ? es : enUS

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [editedPhone, setEditedPhone] = useState("")
  const [editedEmergencyContact, setEditedEmergencyContact] = useState("")

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        // Load profile (maybeSingle: 0 or 1 row, no throw)
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email, phone, emergency_contact, avatar_url")
          .eq("id", user.id)
          .maybeSingle()

        if (profileData) {
          setProfile(profileData as UserProfile)
          setEditedPhone(profileData.phone || "")
          setEditedEmergencyContact(profileData.emergency_contact || "")
        }

        // Load upcoming appointments
        const today = new Date().toISOString().split("T")[0]
        const { data: upcomingData } = await supabase
          .from("appointments")
          .select(`
            id,
            appointment_date,
            appointment_time,
            type,
            status,
            duration_minutes,
            professional:professionals!appointments_professional_id_fkey(
              id,
              specialty,
              profile:profiles!professionals_id_fkey(
                first_name, last_name, avatar_url
              )
            )
          `)
          .eq("patient_id", user.id)
          .gte("appointment_date", today)
          .in("status", ["pending", "confirmed"])
          .order("appointment_date", { ascending: true })
          .order("appointment_time", { ascending: true })
          .limit(5)

        if (upcomingData) {
          const typedAppointments = upcomingData.map((apt) => ({
            ...apt,
            professional: apt.professional as unknown as Appointment["professional"],
          }))
          setUpcomingAppointments(typedAppointments)
        }

        // Load past appointments
        const { data: pastData } = await supabase
          .from("appointments")
          .select(`
            id,
            appointment_date,
            appointment_time,
            type,
            status,
            duration_minutes,
            professional:professionals!appointments_professional_id_fkey(
              id,
              specialty,
              profile:profiles!professionals_id_fkey(
                first_name, last_name, avatar_url
              )
            )
          `)
          .eq("patient_id", user.id)
          .in("status", ["completed", "cancelled"])
          .order("appointment_date", { ascending: false })
          .limit(5)

        if (pastData) {
          const typedPast = pastData.map((apt) => ({
            ...apt,
            professional: apt.professional as unknown as Appointment["professional"],
          }))
          setPastAppointments(typedPast)
        }

        // Load medical records (as prescriptions proxy for now)
        const { data: recordsData } = await supabase
          .from("medical_records")
          .select(`
            id,
            created_at,
            diagnosis,
            diagnosis_code,
            professional:profiles!medical_records_professional_id_fkey(
              first_name, last_name
            )
          `)
          .eq("patient_id", user.id)
          .eq("is_signed", true)
          .order("created_at", { ascending: false })
          .limit(10)

        if (recordsData) {
          const typedRecords = recordsData.map((r) => ({
            ...r,
            professional: r.professional as unknown as MedicalRecord["professional"],
          }))
          setMedicalRecords(typedRecords as MedicalRecord[])
        }

      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, supabase])

  const handleSaveProfile = async () => {
    if (!user) return

    setSavingProfile(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          phone: editedPhone,
          emergency_contact: editedEmergencyContact,
        })
        .eq("id", user.id)

      if (error) throw error

      setProfile((prev) => prev ? {
        ...prev,
        phone: editedPhone,
        emergency_contact: editedEmergencyContact,
      } : null)

      setEditProfileOpen(false)
      toast.success(isSpanish ? "Perfil actualizado" : "Profile updated")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error(isSpanish ? "Error al guardar" : "Error saving")
    } finally {
      setSavingProfile(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString)
    if (isToday(date)) return isSpanish ? "Hoy" : "Today"
    if (isTomorrow(date)) return isSpanish ? "Mañana" : "Tomorrow"
    return format(date, "EEEE, d MMM", { locale })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const hour12 = hours % 12 || 12
    return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const openVideoCall = (appointmentId: string) => {
    const meetingUrl = getJitsiMeetingUrl(appointmentId)
    window.open(meetingUrl, "_blank")
  }

  const nextAppointment = upcomingAppointments[0]
  const firstName = profile?.first_name || user?.user_metadata?.first_name || "Usuario"

  // Check if the next appointment is starting soon (within 30 minutes)
  const isAppointmentSoon = nextAppointment && (() => {
    const aptDate = parseISO(`${nextAppointment.appointment_date}T${nextAppointment.appointment_time}`)
    const hoursUntil = differenceInHours(aptDate, new Date())
    return hoursUntil <= 0.5 && hoursUntil >= -1 // Within 30 min or just started
  })()

  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-8"
    >
      {/* Welcome Banner */}
      <motion.div variants={itemVariants}>
        <Card className="border-teal-200/50 dark:border-teal-800/30 bg-gradient-to-br from-teal-50 via-emerald-50/30 to-white dark:from-teal-950/40 dark:via-emerald-950/20 dark:to-slate-900 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-400/10 to-transparent rounded-full blur-3xl" />
          <CardContent className="p-6 sm:p-8 relative">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-teal-600" />
                  <span className="text-sm font-medium text-teal-700 dark:text-teal-300">
                    {isSpanish ? "Tu Centro de Salud Digital" : "Your Digital Health Hub"}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {isSpanish ? "Hola" : "Hello"},{" "}
                  <span className="text-teal-700 dark:text-teal-400">{firstName}</span> 👋
                </h1>
                <p className="text-slate-600 dark:text-slate-400 max-w-md">
                  {nextAppointment
                    ? (isSpanish
                        ? `Tienes una cita ${formatDate(nextAppointment.appointment_date).toLowerCase()} a las ${formatTime(nextAppointment.appointment_time)}`
                        : `You have an appointment ${formatDate(nextAppointment.appointment_date).toLowerCase()} at ${formatTime(nextAppointment.appointment_time)}`)
                    : (isSpanish
                        ? "Aquí tienes el resumen de tu salud. ¿Necesitas agendar una consulta?"
                        : "Here's your health summary. Need to book a consultation?")}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-4 flex-wrap">
                <div className="flex items-center gap-3 px-4 py-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-white/80 dark:border-slate-700/50 backdrop-blur-sm">
                  <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
                    <CalendarCheck className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {upcomingAppointments.length}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isSpanish ? "Citas próximas" : "Upcoming"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-white/80 dark:border-slate-700/50 backdrop-blur-sm">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {medicalRecords.length}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isSpanish ? "Documentos" : "Documents"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Next Appointment - Featured Card */}
      {nextAppointment && (
        <motion.div variants={itemVariants}>
          <Card className={cn(
            "overflow-hidden",
            isAppointmentSoon 
              ? "border-teal-500 ring-2 ring-teal-500/20 bg-gradient-to-br from-teal-50 to-white dark:from-teal-950/50 dark:to-slate-900" 
              : "border-slate-200/60 dark:border-slate-800"
          )}>
            {isAppointmentSoon && (
              <div className="bg-teal-600 text-white px-4 py-2 text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                {isSpanish ? "Tu cita está a punto de comenzar" : "Your appointment is about to start"}
              </div>
            )}
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-teal-500/20">
                    <AvatarImage src={nextAppointment.professional?.profile?.avatar_url} />
                    <AvatarFallback className="bg-teal-100 text-teal-700 text-lg">
                      {nextAppointment.professional?.profile?.first_name?.[0]}
                      {nextAppointment.professional?.profile?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg text-slate-900 dark:text-white">
                      Dr. {nextAppointment.professional?.profile?.first_name} {nextAppointment.professional?.profile?.last_name}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      {nextAppointment.professional?.specialty}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="outline" className="border-teal-200 text-teal-700 dark:border-teal-800 dark:text-teal-300">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(nextAppointment.appointment_date)}
                      </Badge>
                      <Badge variant="outline" className="border-teal-200 text-teal-700 dark:border-teal-800 dark:text-teal-300">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(nextAppointment.appointment_time)}
                      </Badge>
                      <Badge className={cn(
                        "text-xs",
                        nextAppointment.type === "online"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      )}>
                        {nextAppointment.type === "online" ? (
                          <><Video className="h-3 w-3 mr-1" /> Online</>
                        ) : (
                          <><MapPin className="h-3 w-3 mr-1" /> Presencial</>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>

                {nextAppointment.type === "online" && (
                  <Button
                    size="lg"
                    onClick={() => openVideoCall(nextAppointment.id)}
                    className={cn(
                      "gap-2 rounded-xl h-14 px-8 text-base font-semibold shadow-lg",
                      isAppointmentSoon
                        ? "bg-teal-600 hover:bg-teal-700 animate-pulse"
                        : "bg-teal-600 hover:bg-teal-700"
                    )}
                  >
                    <Video className="h-5 w-5" />
                    {isSpanish ? "Unirse a la Llamada" : "Join Call"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Search */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/60 dark:border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Search className="h-4 w-4 text-teal-600" />
              {isSpanish ? "Buscar Especialista" : "Find a Specialist"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder={
                    isSpanish
                      ? "Buscar por especialidad, nombre o síntoma..."
                      : "Search by specialty, name, or symptom..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 rounded-xl text-base bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:border-teal-500"
                />
              </div>
            </form>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {specialties.map((specialty) => (
                <Link key={specialty.slug} href={`/explore?specialty=${specialty.slug}`}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-500/50 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 flex items-center justify-center transition-colors">
                      <specialty.icon className="h-6 w-6 text-slate-500 group-hover:text-teal-600 transition-colors" />
                    </div>
                    <span className="text-sm font-medium text-center text-slate-600 dark:text-slate-400 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                      {isSpanish ? specialty.label : specialty.labelEn}
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Two Column Layout for Documents and History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Medical Documents / Prescriptions */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200/60 dark:border-slate-800 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  {isSpanish ? "Mis Recetas y Órdenes" : "My Prescriptions & Orders"}
                </CardTitle>
                <CardDescription>
                  {isSpanish ? "Documentos médicos recientes" : "Recent medical documents"}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-teal-600" asChild>
                <Link href="/dashboard/documents">
                  {isSpanish ? "Ver todo" : "View all"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {medicalRecords.length > 0 ? (
                <div className="space-y-3">
                  {medicalRecords.slice(0, 4).map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                          <PillIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-sm">
                            Dr. {record.professional?.first_name} {record.professional?.last_name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {format(parseISO(record.created_at), "d MMM yyyy", { locale })}
                            {record.diagnosis_code && (
                              <Badge variant="outline" className="ml-2 text-[10px] h-4">
                                {record.diagnosis_code}
                              </Badge>
                            )}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        asChild
                      >
                        <Link href={`/api/documents/prescription/${record.id}`} target="_blank">
                          <Download className="h-4 w-4" />
                          PDF
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                  <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">
                    {isSpanish 
                      ? "Aún no tienes documentos médicos" 
                      : "No medical documents yet"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Appointment History */}
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200/60 dark:border-slate-800 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  {isSpanish ? "Historial de Citas" : "Appointment History"}
                </CardTitle>
                <CardDescription>
                  {isSpanish ? "Citas pasadas" : "Past appointments"}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-teal-600" asChild>
                <Link href="/dashboard/appointments">
                  {isSpanish ? "Ver todo" : "View all"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {pastAppointments.length > 0 ? (
                <div className="space-y-3">
                  {pastAppointments.slice(0, 4).map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={apt.professional?.profile?.avatar_url} />
                          <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-sm">
                            {apt.professional?.profile?.first_name?.[0]}
                            {apt.professional?.profile?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-sm">
                            Dr. {apt.professional?.profile?.first_name} {apt.professional?.profile?.last_name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {format(parseISO(apt.appointment_date), "d MMM yyyy", { locale })}
                          </p>
                        </div>
                      </div>
                      <Badge className={cn(
                        "text-xs",
                        apt.status === "completed"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                      )}>
                        {apt.status === "completed" ? (
                          <><CheckCircle2 className="h-3 w-3 mr-1" /> {isSpanish ? "Completada" : "Completed"}</>
                        ) : (
                          <><XCircle className="h-3 w-3 mr-1" /> {isSpanish ? "Cancelada" : "Cancelled"}</>
                        )}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                  <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">
                    {isSpanish 
                      ? "No tienes citas pasadas" 
                      : "No past appointments"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upcoming Appointments List */}
      {upcomingAppointments.length > 1 && (
        <motion.div variants={itemVariants}>
          <Card className="border-slate-200/60 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-teal-600" />
                  {isSpanish ? "Otras Citas Programadas" : "Other Scheduled Appointments"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {upcomingAppointments.slice(1).map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-500/50 transition-colors"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={apt.professional?.profile?.avatar_url} />
                      <AvatarFallback className="bg-teal-100 text-teal-700">
                        {apt.professional?.profile?.first_name?.[0]}
                        {apt.professional?.profile?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">
                        Dr. {apt.professional?.profile?.first_name} {apt.professional?.profile?.last_name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(apt.appointment_date)} • {formatTime(apt.appointment_time)}
                      </p>
                    </div>
                    <Badge className={cn(
                      "shrink-0",
                      apt.type === "online"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    )}>
                      {apt.type === "online" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Profile & Settings Section */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200/60 dark:border-slate-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4 text-slate-600" />
              {isSpanish ? "Mi Perfil y Ajustes" : "My Profile & Settings"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-teal-500/20">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-teal-100 text-teal-700 text-lg">
                    {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {profile?.first_name} {profile?.last_name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{profile?.email}</p>
                  {profile?.phone && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3" /> {profile.phone}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      {isSpanish ? "Editar" : "Edit"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-teal-600" />
                        {isSpanish ? "Actualizar Información" : "Update Information"}
                      </DialogTitle>
                      <DialogDescription>
                        {isSpanish 
                          ? "Actualiza tu información de contacto" 
                          : "Update your contact information"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium">
                          {isSpanish ? "Teléfono" : "Phone"}
                        </Label>
                        <Input
                          id="phone"
                          value={editedPhone}
                          onChange={(e) => setEditedPhone(e.target.value)}
                          placeholder="+56 9 1234 5678"
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergency" className="text-sm font-medium flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          {isSpanish ? "Contacto de Emergencia" : "Emergency Contact"}
                        </Label>
                        <Input
                          id="emergency"
                          value={editedEmergencyContact}
                          onChange={(e) => setEditedEmergencyContact(e.target.value)}
                          placeholder={isSpanish ? "Nombre y teléfono" : "Name and phone"}
                          className="h-11"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEditProfileOpen(false)}>
                        {isSpanish ? "Cancelar" : "Cancel"}
                      </Button>
                      <Button 
                        onClick={handleSaveProfile} 
                        disabled={savingProfile}
                        className="bg-teal-600 hover:bg-teal-700"
                      >
                        {savingProfile ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          isSpanish ? "Guardar" : "Save"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <Link href="/dashboard/settings">
                    <Shield className="h-4 w-4" />
                    {isSpanish ? "Seguridad" : "Security"}
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* CTA if no appointments */}
      {upcomingAppointments.length === 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-dashed border-2 border-teal-300 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {isSpanish ? "¿Necesitas una consulta?" : "Need a consultation?"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                {isSpanish 
                  ? "Encuentra especialistas verificados y agenda tu cita en minutos" 
                  : "Find verified specialists and book your appointment in minutes"}
              </p>
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 gap-2 rounded-xl h-12 px-6" asChild>
                <Link href="/explore">
                  <Search className="h-5 w-5" />
                  {isSpanish ? "Buscar Especialista" : "Find a Specialist"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
