"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  CalendarDays, 
  Clock, 
  Video, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  User,
  RefreshCw,
  AlertTriangle,
  DollarSign,
  Phone,
  Mail,
  ExternalLink,
  CalendarCheck,
  CalendarX,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Filter,
  Check,
  MoreVertical,
  ArrowRight
} from "lucide-react"
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  isSameDay, 
  isToday, 
  addMonths, 
  subMonths, 
  parseISO, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  addDays, 
  addWeeks, 
  subWeeks,
  isSameHour,
  startOfHour,
  subDays
} from "date-fns"
import { es, enUS } from "date-fns/locale"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { getJitsiMeetingUrl } from "@/lib/utils/jitsi"
import { Separator } from "@/components/ui/separator"

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  duration_minutes: number
  type: "online" | "in-person"
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show"
  payment_status: string
  price: number
  notes?: string
  meeting_link?: string
  patient: {
    id: string
    first_name: string
    last_name: string
    email: string
    avatar_url?: string
    phone?: string
  }
}

import { ProfessionalCalendar } from "@/components/dashboard/professional-calendar"
import { AddPatientModal } from "@/components/calendar/modals/add-patient-modal"
import { AddAppointmentModal } from "@/components/calendar/modals/add-appointment-modal"

type CalendarViewMode = "monthly" | "weekly" | "daily"

export default function ProfessionalAppointmentsPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const supabase = createClient()
  const locale = isSpanish ? es : enUS

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<CalendarViewMode>("weekly")
  const [availability, setAvailability] = useState<Record<string, any> | null>(null)

  // Modal states
  const [addPatientOpen, setAddPatientOpen] = useState(false)
  const [addAppointmentOpen, setAddAppointmentOpen] = useState(false)
  const [appointmentInitialDate, setAppointmentInitialDate] = useState<Date | undefined>()

  // Actions state
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)

  // Reschedule state
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false)
  const [newDate, setNewDate] = useState("")
  const [newTime, setNewTime] = useState("")

  const loadAppointments = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load a broad range for calendar
      const rangeStart = format(subMonths(startOfMonth(currentDate), 1), "yyyy-MM-dd")
      const rangeEnd = format(addMonths(endOfMonth(currentDate), 1), "yyyy-MM-dd")

      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          appointment_time,
          duration_minutes,
          type,
          status,
          payment_status,
          price,
          meeting_link,
          patient:patient_id(
            id,
            first_name,
            last_name,
            avatar_url,
            phone
          )
        `)
        .eq("professional_id", user.id)
        .gte("appointment_date", rangeStart)
        .lte("appointment_date", rangeEnd)
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true })

      if (error) {
        console.error("Error loading appointments:", error.message || error)
        return
      }

      setAppointments((data || []) as unknown as Appointment[])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }, [supabase, currentDate])

  const loadAvailability = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("professionals")
        .select("availability")
        .eq("id", user.id)
        .maybeSingle()

      if (error) {
        console.error("Error loading availability:", error.message || error)
        return
      }

      if (data?.availability) {
        setAvailability(data.availability as Record<string, any>)
      } else {
        setAvailability(null)
      }
    } catch (error) {
      console.error("Error loading availability:", error)
    }
  }, [supabase])

  const loadPatients = useCallback(async () => {
    try {
      const response = await fetch('/api/professional/patients')
      const data = await response.json()
      if (data.success) {
        setPatients(data.patients)
      }
    } catch (err) {
      console.error("Error loading patients:", err)
    }
  }, [])

  useEffect(() => {
    loadAppointments()
    loadAvailability()
    loadPatients()
    
    const channel = supabase
      .channel('pro_appointments_realtime_v2')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        loadAppointments()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadAppointments, loadAvailability, loadPatients, supabase])

  // --- Handlers ---
  const handleComplete = async () => {
    if (!selectedAppointment) return
    setActionLoading(selectedAppointment.id)
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("id", selectedAppointment.id)

      if (error) throw error
      toast.success(isSpanish ? "Cita completada" : "Appointment completed")
      setCompleteDialogOpen(false)
      setSelectedAppointment(null)
      loadAppointments()
    } catch (err) {
      toast.error("Error")
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async () => {
    if (!selectedAppointment) return
    setActionLoading(selectedAppointment.id)
    try {
      const response = await fetch("/api/appointments/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: selectedAppointment.id }),
      })

      if (!response.ok) throw new Error("Failed")
      toast.success(isSpanish ? "Cita cancelada" : "Cancelled")
      setCancelDialogOpen(false)
      setSelectedAppointment(null)
      loadAppointments()
    } catch (err) {
      toast.error("Error")
    } finally {
      setActionLoading(null)
    }
  }

  const handleReschedule = async () => {
    if (!selectedAppointment || !newDate || !newTime) return
    setActionLoading(selectedAppointment.id)
    try {
      const response = await fetch("/api/appointments/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: selectedAppointment.id, newDate, newTime }),
      })

      if (!response.ok) throw new Error("Failed")
      toast.success(isSpanish ? "Cita reagendada" : "Rescheduled")
      setRescheduleDialogOpen(false)
      setSelectedAppointment(null)
      loadAppointments()
    } catch (err) {
      toast.error("Error")
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-10 h-[calc(100vh-10rem)] flex flex-col scale-[0.98] origin-top">
      <div className="flex-1 min-h-0 bg-white dark:bg-slate-950 rounded-2xl overflow-hidden shadow-2xl">
        <ProfessionalCalendar
          appointments={appointments}
          isLoading={loading}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          viewMode={viewMode}
          onViewChange={(v) => setViewMode(v as CalendarViewMode)}
          onAppointmentClick={(apt) => setSelectedAppointment(apt)}
          availability={availability ?? undefined}
          onAddAppointment={(date, time) => {
            setAppointmentInitialDate(date)
            setAddAppointmentOpen(true)
          }}
        />
      </div>

      {/* Modals & Dialogs */}
      <AddPatientModal 
        open={addPatientOpen} 
        onOpenChange={setAddPatientOpen} 
        onSuccess={() => {
          loadPatients()
          setAddAppointmentOpen(true)
        }} 
      />

      <AddAppointmentModal 
        open={addAppointmentOpen} 
        onOpenChange={setAddAppointmentOpen} 
        patients={patients}
        initialDate={appointmentInitialDate}
        onSuccess={() => loadAppointments()}
      />

      {/* Existing Appointment Detail Sheet & Dialogs Adapted */}
      <Sheet open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
        <SheetContent className="sm:max-w-md bg-white dark:bg-slate-950 p-0 overflow-hidden rounded-l-[2rem] border-none shadow-2xl">
          {selectedAppointment && (
            <div className="flex flex-col h-full">
               <div className={cn(
                 "p-8 pt-12 text-white relative bg-teal-600",
                 selectedAppointment.status === 'confirmed' ? "bg-teal-600" :
                 selectedAppointment.status === 'pending' ? "bg-amber-500" :
                 selectedAppointment.status === 'completed' ? "bg-blue-600" :
                 "bg-slate-500"
               )}>
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-20 w-20 border-4 border-white/20 shadow-xl">
                       <AvatarImage src={selectedAppointment.patient?.avatar_url} />
                       <AvatarFallback className="bg-white text-teal-600 text-2xl font-black">{selectedAppointment.patient?.first_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                       <h2 className="text-2xl font-black tracking-tighter leading-none uppercase">{selectedAppointment.patient?.first_name}</h2>
                       <h2 className="text-2xl font-black tracking-tighter leading-none opacity-80 uppercase">{selectedAppointment.patient?.last_name}</h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <p className="text-[9px] font-black uppercase opacity-60">{isSpanish ? "Horario" : "Schedule"}</p>
                        <p className="text-sm font-bold">{selectedAppointment.appointment_time.slice(0,5)} • {selectedAppointment.duration_minutes}m</p>
                     </div>
                     <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <p className="text-[9px] font-black uppercase opacity-60">{isSpanish ? "Estado" : "Status"}</p>
                        <p className="text-sm font-bold uppercase transition-all">
                           {isSpanish ? (
                             selectedAppointment.status === 'confirmed' ? 'Confirmada' :
                             selectedAppointment.status === 'pending' ? 'Pendiente' :
                             selectedAppointment.status === 'completed' ? 'Completada' :
                             selectedAppointment.status === 'cancelled' ? 'Cancelada' :
                             selectedAppointment.status
                           ) : selectedAppointment.status}
                        </p>
                     </div>
                  </div>
               </div>

               <div className="flex-1 p-8 space-y-8 overflow-y-auto">
                  <div className="space-y-4">
                     <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                       <User className="h-3 w-3" /> {isSpanish ? "Contacto" : "Contact"}
                     </h3>
                     <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                           <Mail className="h-4 w-4 text-teal-600" />
                           <span className="text-sm font-bold text-slate-700 truncate">{selectedAppointment.patient?.email}</span>
                        </div>
                        {selectedAppointment.patient?.phone && (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <Phone className="h-4 w-4 text-teal-600" />
                            <span className="text-sm font-bold text-slate-700">{selectedAppointment.patient?.phone}</span>
                          </div>
                        )}
                     </div>
                  </div>

                  <div className="space-y-3 pt-6">
                     {selectedAppointment.status === 'confirmed' && (
                       <>
                         <Button 
                           onClick={() => window.open(selectedAppointment.meeting_link || '#', '_blank')}
                           className="w-full h-14 rounded-2xl bg-teal-600 hover:bg-teal-700 font-bold shadow-lg shadow-teal-500/20 gap-3"
                         >
                           <Video className="h-5 w-5" />
                           {isSpanish ? "Iniciar Tele-consulta" : "Start Video Call"}
                           <ArrowRight className="h-4 w-4 ml-auto" />
                         </Button>
                         <Button 
                           onClick={() => setCompleteDialogOpen(true)}
                           variant="outline"
                           className="w-full h-14 rounded-2xl border-slate-200 font-bold hover:bg-teal-50 gap-3"
                         >
                           <CheckCircle2 className="h-5 w-5 text-teal-600" />
                           {isSpanish ? "Marcar Completada" : "Mark Completed"}
                         </Button>
                       </>
                     )}
                     
                     <div className="grid grid-cols-2 gap-3">
                        <Button variant="ghost" className="rounded-xl font-bold h-11 hover:bg-red-50 text-red-500 col-span-2" onClick={() => setCancelDialogOpen(true)}>
                          {isSpanish ? "Cancelar Cita" : "Cancel Appointment"}
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Dialogs */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
         <AlertDialogContent className="rounded-3xl border-none shadow-2xl p-8">
            <AlertDialogHeader>
               <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4 mx-auto">
                  <CalendarX className="h-8 w-8" />
               </div>
               <AlertDialogTitle className="text-2xl font-black text-center text-slate-900 leading-tight">
                 {isSpanish ? "¿Confirmar Cancelación?" : "Confirm Cancellation?"}
               </AlertDialogTitle>
               <AlertDialogDescription className="text-center text-slate-500 font-medium font-inter">
                 {isSpanish 
                   ? "Esta acción notificará al paciente y liberará el horario en tu agenda." 
                   : "This action will notify the patient and free up the slot in your calendar."}
               </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-8 gap-3 sm:flex-col lg:flex-row">
               <AlertDialogCancel className="w-full h-12 rounded-xl font-bold border-slate-200">
                 {isSpanish ? "No, volver" : "No, go back"}
               </AlertDialogCancel>
               <AlertDialogAction onClick={handleCancel} className="w-full h-12 rounded-xl font-bold bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20">
                 {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isSpanish ? "Sí, cancelar cita" : "Yes, cancel appointment")}
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
         <AlertDialogContent className="rounded-3xl border-none shadow-2xl p-8">
            <AlertDialogHeader>
               <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 mb-4 mx-auto">
                  <CheckCircle2 className="h-8 w-8" />
               </div>
               <AlertDialogTitle className="text-2xl font-black text-center text-slate-900 leading-tight">
                 {isSpanish ? "Finalizar Consulta" : "Finish Consultation"}
               </AlertDialogTitle>
               <AlertDialogDescription className="text-center text-slate-500 font-medium">
                 {isSpanish 
                   ? "¿Confirmas que la sesión ha terminado? Esto marcará la cita como completada en el sistema." 
                   : "Confirm that the session has ended? This will mark the appointment as completed."}
               </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-8 gap-3 sm:flex-col lg:flex-row">
               <AlertDialogCancel className="w-full h-12 rounded-xl font-bold border-slate-200">
                 {isSpanish ? "Cancelar" : "Cancel"}
               </AlertDialogCancel>
               <AlertDialogAction onClick={handleComplete} className="w-full h-12 rounded-xl font-bold bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-500/20">
                 {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isSpanish ? "Confirmar y Finalizar" : "Confirm and Finish")}
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>

      {/* Reschedule Dialog integrated into existing structure */}
      <AlertDialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
         <AlertDialogContent className="rounded-3xl border-none shadow-2xl p-8">
            <AlertDialogHeader>
               <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 mb-4 mx-auto">
                  <RefreshCw className="h-8 w-8" />
               </div>
               <AlertDialogTitle className="text-2xl font-black text-center text-slate-900 leading-tight">
                 {isSpanish ? "Reagendar Cita" : "Reschedule Appointment"}
               </AlertDialogTitle>
               <AlertDialogDescription className="text-center text-slate-500 font-medium mb-6">
                 {isSpanish 
                   ? "Selecciona la nueva fecha y hora para la cita. Esto notificará al paciente sobre el cambio." 
                   : "Select a new date and time for the appointment. This will notify the patient."}
               </AlertDialogDescription>
               <div className="space-y-4">
                 <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">{isSpanish ? "Nueva Fecha" : "New Date"}</label>
                   <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full mt-1 h-12 rounded-xl border-slate-200 px-4 font-medium text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">{isSpanish ? "Nueva Hora" : "New Time"}</label>
                   <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="w-full mt-1 h-12 rounded-xl border-slate-200 px-4 font-medium text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" />
                 </div>
               </div>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-8 gap-3 sm:flex-col lg:flex-row">
               <AlertDialogCancel className="w-full h-12 rounded-xl font-bold border-slate-200">
                 {isSpanish ? "Cancelar" : "Cancel"}
               </AlertDialogCancel>
               <Button 
                 onClick={handleReschedule}
                 disabled={!newDate || !newTime || !!actionLoading}
                 className="w-full h-12 rounded-xl font-bold bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-500/20 text-white"
               >
                 {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isSpanish ? "Confirmar Cambio" : "Confirm Change")}
               </Button>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
