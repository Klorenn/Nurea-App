"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  X,
  Loader2,
  CalendarX,
  CalendarCheck,
} from "lucide-react"
import { CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { getJitsiMeetingUrl } from "@/lib/utils/jitsi"

interface AppointmentData {
  id: string
  appointment_date: string
  appointment_time: string
  type: "online" | "in-person"
  status: string
  professional: {
    id: string
    specialty: string
    profile: {
      first_name: string
      last_name: string
      avatar_url?: string
    }
  }
  reviews?: { id: string }[]
}

interface PatientAppointmentsProps {
  initialAppointments?: AppointmentData[]
  showAll?: boolean
}

export function PatientAppointments({ 
  initialAppointments,
  showAll = false 
}: PatientAppointmentsProps) {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const { user } = useAuth()
  const supabase = createClient()

  const [appointments, setAppointments] = useState<AppointmentData[]>(
    initialAppointments || []
  )
  const [loading, setLoading] = useState(!initialAppointments)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user || initialAppointments) {
      setLoading(false)
      return
    }

    const loadAppointments = async () => {
      try {
        const { data } = await supabase
          .from("appointments")
          .select(`
            id,
            appointment_date,
            appointment_time,
            type,
            status,
            professional:professionals(
              id,
              specialty,
              profile:profiles(first_name, last_name, avatar_url)
            ),
            reviews(id)
          `)
          .eq("patient_id", user.id)
          .order("appointment_date", { ascending: false })

        if (data) {
          setAppointments(data as unknown as AppointmentData[])
        }
      } catch (err) {
        console.error("Error loading appointments:", err)
      } finally {
        setLoading(false)
      }
    }

    loadAppointments()
  }, [user, supabase, initialAppointments])

  const handleCancel = async (appointmentId: string) => {
    setCancellingId(appointmentId)
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", appointmentId)

      if (error) throw error

      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId ? { ...apt, status: "cancelled" } : apt
        )
      )
      toast.success(
        isSpanish ? "Cita cancelada exitosamente" : "Appointment cancelled successfully"
      )
    } catch (err) {
      console.error("Error cancelling appointment:", err)
      toast.error(
        isSpanish ? "Error al cancelar la cita" : "Error cancelling appointment"
      )
    } finally {
      setCancellingId(null)
    }
  }

  const openVideoCall = (appointmentId: string) => {
    const meetingUrl = getJitsiMeetingUrl(appointmentId)
    window.open(meetingUrl, "_blank")
  }

  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr)
    return format(date, "EEEE, d 'de' MMM", { locale: es })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const hour12 = hours % 12 || 12
    return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  const upcomingAppointments = appointments.filter(
    a => a.status === "confirmed" || a.status === "pending"
  )

  const displayAppointments = showAll
    ? appointments
    : upcomingAppointments.slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  if (displayAppointments.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p className="font-medium">
          {isSpanish ? "No tienes citas" : "No appointments"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {displayAppointments.map((apt) => {
        const doctor = apt.professional?.profile || {}
        const isOnline = apt.type === "online"
        const isCancelled = apt.status === "cancelled"

        return (
          <motion.div
            key={apt.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-2xl border transition-all",
              isCancelled
                ? "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50"
                : "border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700"
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 rounded-xl">
                  <AvatarImage src={doctor.avatar_url} />
                  <AvatarFallback className="bg-teal-100 text-teal-700 font-bold">
                    {doctor.first_name?.[0]}
                    {doctor.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    Dr. {doctor.first_name} {doctor.last_name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {apt.professional?.specialty}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(apt.appointment_date)}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(apt.appointment_time)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Badge
                    className={cn(
                      "text-xs",
                      isOnline
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    )}
                  >
                    {isOnline ? (
                      <Video className="h-3 w-3 mr-1" />
                    ) : (
                      <MapPin className="h-3 w-3 mr-1" />
                    )}
                    {isOnline
                      ? isSpanish
                        ? "Online"
                        : "Online"
                      : isSpanish
                      ? "Presencial"
                      : "In-person"}
                  </Badge>

                  {apt.status === "confirmed" && isOnline && (
                    <Button
                      size="sm"
                      onClick={() => openVideoCall(apt.id)}
                      className="h-8 rounded-lg bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      <Video className="h-4 w-4 mr-1" />
                      {isSpanish ? "Unirse" : "Join"}
                    </Button>
                  )}

                  {apt.status === "confirmed" && !isCancelled && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCancel(apt.id)}
                      disabled={cancellingId === apt.id}
                      className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      {cancellingId === apt.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4 mr-1" />
                      )}
                      {isSpanish ? "Cancelar" : "Cancel"}
                    </Button>
                  )}

                  {apt.status === "cancelled" && (
                    <Badge className="bg-red-100 text-red-700 border-0">
                      <CalendarX className="h-3 w-3 mr-1" />
                      {isSpanish ? "Cancelada" : "Cancelled"}
                    </Badge>
                  )}

                  {apt.status === "completed" && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-0">
                      <CalendarCheck className="h-3 w-3 mr-1" />
                      {isSpanish ? "Completada" : "Completed"}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </motion.div>
        )
      })}
    </div>
  )
}

export default PatientAppointments
