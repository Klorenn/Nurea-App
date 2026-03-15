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
  startOfHour
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

type ViewMode = "day" | "week" | "list"

export default function ProfessionalAppointmentsPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const supabase = createClient()
  const locale = isSpanish ? es : enUS

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("week")
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  
  // Filters
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // Actions state
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)

  const loadAppointments = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // For calendar views, we load a broader range (e.g., month around current date)
      const rangeStart = format(subWeeks(startOfWeek(currentDate), 2), "yyyy-MM-dd")
      const rangeEnd = format(addWeeks(endOfWeek(currentDate), 2), "yyyy-MM-dd")

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
          notes,
          meeting_link,
          patient:profiles!appointments_patient_id_fkey(
            id,
            first_name,
            last_name,
            email,
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
        console.error("Error loading appointments:", error)
        return
      }

      const typedData = (data || []).map((apt) => ({
        ...apt,
        patient: apt.patient as unknown as Appointment["patient"],
      })) as Appointment[]

      setAppointments(typedData)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }, [supabase, currentDate])

  useEffect(() => {
    loadAppointments()
    
    // Set up Real-time subscription
    const channel = supabase
      .channel('pro_appointments_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        (payload) => {
          console.log('Realtime change:', payload)
          loadAppointments()
          toast.info(isSpanish ? "Agenda actualizada" : "Schedule updated")
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadAppointments, supabase, isSpanish])

  // --- Handlers ---
  const handleComplete = async () => {
    if (!selectedAppointment) return
    setActionLoading(selectedAppointment.id)
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ 
          status: "completed",
          updated_at: new Date().toISOString()
        })
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
        body: JSON.stringify({ 
          appointmentId: selectedAppointment.id,
          reason: "Cancelled by professional",
          initiatedBy: "professional"
        }),
      })

      if (!response.ok) throw new Error("Failed")
      
      toast.success(isSpanish ? "Cita cancelada y reembolso procesado" : "Cancelled and refunded")
      setCancelDialogOpen(false)
      setSelectedAppointment(null)
      loadAppointments()
    } catch (err) {
      toast.error("Error")
    } finally {
      setActionLoading(null)
    }
  }

  // --- Helpers ---
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      if (filterType !== 'all' && apt.type !== filterType) return false
      if (filterStatus !== 'all' && apt.status !== filterStatus) return false
      return true
    })
  }, [appointments, filterType, filterStatus])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-teal-500'
      case 'pending': return 'bg-amber-500'
      case 'completed': return 'bg-blue-500'
      case 'cancelled': return 'bg-red-400'
      default: return 'bg-slate-400'
    }
  }

  const hours = Array.from({ length: 15 }, (_, i) => i + 7) // 7 AM to 10 PM

  // --- Views ---
  const WeekView = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    const end = endOfWeek(currentDate, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start, end })

    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="p-4 border-r border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase text-slate-400 flex items-end justify-center">Hora</div>
          {days.map(day => (
            <div key={day.toString()} className={cn(
              "p-4 border-r border-slate-100 dark:border-slate-800 text-center",
              isToday(day) && "bg-teal-50/30"
            )}>
              <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1">{format(day, "EEE", { locale })}</span>
              <span className={cn(
                "w-8 h-8 flex items-center justify-center mx-auto rounded-full text-sm font-black",
                isToday(day) ? "bg-teal-600 text-white" : "text-slate-900 dark:text-white"
              )}>{format(day, "d")}</span>
            </div>
          ))}
        </div>
        <div className="relative">
          {hours.map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b border-slate-50 dark:border-slate-800/50 group h-24">
              <div className="p-2 border-r border-slate-100 dark:border-slate-800 text-[11px] font-medium text-slate-500 text-center">
                {format(new Date().setHours(hour, 0), "HH:mm")}
              </div>
              {days.map(day => {
                const dayStr = format(day, "yyyy-MM-dd")
                const hourStr = `${hour.toString().padStart(2, '0')}:00`
                const apts = filteredAppointments.filter(a => a.appointment_date === dayStr && a.appointment_time.startsWith(hour.toString().padStart(2, '0')))
                
                return (
                  <div key={day.toString()} className={cn(
                    "border-r border-slate-100 dark:border-slate-800 relative group/cell p-0.5",
                    isToday(day) && "bg-teal-50/10"
                  )}>
                    {apts.map(apt => (
                      <div 
                        key={apt.id}
                        onClick={() => setSelectedAppointment(apt)}
                        className={cn(
                          "absolute inset-x-1 rounded-lg border-l-4 shadow-sm p-1.5 cursor-pointer hover:scale-[1.02] transition-transform z-10 overflow-hidden",
                          apt.status === 'confirmed' ? "bg-teal-50 border-teal-500 text-teal-800" :
                          apt.status === 'pending' ? "bg-amber-50 border-amber-500 text-amber-800" :
                          apt.status === 'completed' ? "bg-blue-50 border-blue-500 text-blue-800" :
                          "bg-slate-50 border-slate-500 text-slate-800"
                        )}
                        style={{ height: '90%' }}
                      >
                        <div className="text-[10px] font-black truncate leading-tight">{apt.patient.first_name} {apt.patient.last_name}</div>
                        <div className="flex items-center gap-1 opacity-70 mt-0.5">
                           {apt.type === 'online' ? <Video className="h-2 w-2" /> : <Building2 className="h-2 w-2" />}
                           <span className="text-[9px] font-bold">{apt.appointment_time.slice(0,5)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const DayView = () => {
    const dayStr = format(currentDate, "yyyy-MM-dd")
    const apts = filteredAppointments.filter(a => a.appointment_date === dayStr)

    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-[100px_1fr] h-[700px]">
          <div className="border-r border-slate-100 dark:border-slate-800 flex flex-col pt-4">
             {hours.map(hour => (
               <div key={hour} className="h-24 text-center text-[11px] font-bold text-slate-400 group relative">
                 <span className="sticky top-4">{format(new Date().setHours(hour, 0), "HH:mm")}</span>
                 <div className="absolute w-full border-b border-slate-100 dark:border-slate-800 top-0 left-0" />
               </div>
             ))}
          </div>
          <div className="relative p-0 pt-4 flex-1">
             {apts.length === 0 && (
               <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 grayscale">
                 <CalendarX className="h-16 w-16 mb-4" />
                 <p className="font-bold">No hay citas para este día</p>
               </div>
             )}
             {apts.map(apt => {
               const hourStart = parseInt(apt.appointment_time.split(':')[0])
               const minStart = parseInt(apt.appointment_time.split(':')[1])
               const top = (hourStart - 7) * 96 + (minStart / 60) * 96
               const height = (apt.duration_minutes / 60) * 96

               return (
                 <div 
                   key={apt.id}
                   onClick={() => setSelectedAppointment(apt)}
                   className={cn(
                     "absolute left-4 right-8 rounded-2xl border flex flex-col p-4 cursor-pointer hover:shadow-lg transition-all z-10 group overflow-hidden",
                     apt.status === 'confirmed' ? "bg-teal-50/80 border-teal-500/30 text-teal-900" :
                     apt.status === 'pending' ? "bg-amber-50/80 border-amber-500/30 text-amber-900" :
                     apt.status === 'completed' ? "bg-blue-50/80 border-blue-500/30 text-blue-900" :
                     "bg-slate-50/80 border-slate-500/30 text-slate-900"
                   )}
                   style={{ top: `${top}px`, height: `${height}px` }}
                 >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                         <Avatar className="h-10 w-10 border-2 border-white">
                           <AvatarImage src={apt.patient.avatar_url} />
                           <AvatarFallback>{apt.patient.first_name[0]}</AvatarFallback>
                         </Avatar>
                         <div>
                            <p className="text-sm font-black">{apt.patient.first_name} {apt.patient.last_name}</p>
                            <div className="flex items-center gap-2 opacity-60">
                               <Clock className="h-3 w-3" />
                               <span className="text-xs font-bold">{apt.appointment_time.slice(0,5)} • {apt.duration_minutes} min</span>
                            </div>
                         </div>
                      </div>
                      <Badge className={cn("rounded-full uppercase text-[10px] font-black", apt.status === 'confirmed' ? "bg-teal-100 text-teal-700" : "bg-slate-200")}>
                        {apt.status}
                      </Badge>
                    </div>
                 </div>
               )
             })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-10 px-4 sm:px-0">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
               <CalendarDays className="h-6 w-6" />
             </div>
             <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">Command Center <span className="text-teal-600">Nurea</span></h1>
           </div>
           <p className="text-slate-500 font-bold ml-1">{isSpanish ? "Gestiona tu jornada profesional en tiempo real." : "Manage your professional day in real-time."}</p>
        </div>

        <div className="flex gap-2 flex-wrap">
           <Card className="flex items-center p-1 rounded-xl bg-slate-100/50 border-slate-200">
              <Button 
                variant={viewMode === 'day' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setViewMode('day')}
                className={cn("rounded-lg h-8 px-4 font-bold text-xs", viewMode === 'day' && "bg-white shadow-sm text-teal-600 hover:bg-white")}
              >Diario</Button>
              <Button 
                variant={viewMode === 'week' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setViewMode('week')}
                className={cn("rounded-lg h-8 px-4 font-bold text-xs", viewMode === 'week' && "bg-white shadow-sm text-teal-600 hover:bg-white")}
              >Semanal</Button>
           </Card>

           <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm px-4">
              <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subDays(currentDate, viewMode === 'week' ? 7 : 1))} className="h-8 w-8 rounded-lg outline-none"><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-xs font-black uppercase tracking-wider mx-2 whitespace-nowrap">
                {format(currentDate, viewMode === 'week' ? "'Semana de' d MMM" : "d 'de' MMMM", { locale })}
              </span>
              <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, viewMode === 'week' ? 7 : 1))} className="h-8 w-8 rounded-lg outline-none"><ChevronRight className="h-4 w-4" /></Button>
           </div>

           <Button 
             variant="outline" 
             onClick={loadAppointments} 
             className="rounded-xl border-slate-200 h-10 hover:bg-teal-50 hover:text-teal-600 transition-colors"
           >
             <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
             Sincronizar
           </Button>
        </div>
      </div>

      {/* --- FILTERS & QUICK STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-3 border-transparent bg-slate-100/30 p-4 flex flex-wrap gap-4 items-center rounded-2xl">
           <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-[10px] font-black uppercase text-slate-400">Filtrar por:</span>
           </div>
           <div className="flex gap-2">
              {['all', 'online', 'in-person'].map(t => (
                <Badge 
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={cn(
                    "cursor-pointer uppercase text-[9px] font-black h-7 px-3 rounded-full transition-all border-2",
                    filterType === t ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-500 border-slate-100 hover:border-teal-200"
                  )}
                >
                  {t === 'all' ? 'Todos' : t === 'online' ? 'Videollamada' : 'Presencial'}
                </Badge>
              ))}
           </div>
           <Separator orientation="vertical" className="h-6 mx-2 hidden sm:block" />
           <div className="flex gap-2">
              {['all', 'confirmed', 'pending', 'completed'].map(s => (
                <Badge 
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={cn(
                    "cursor-pointer uppercase text-[9px] font-black h-7 px-3 rounded-full transition-all border-2",
                    filterStatus === s ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-100 hover:border-teal-200"
                  )}
                >
                  {s === 'all' ? 'Todos los estados' : s}
                </Badge>
              ))}
           </div>
        </Card>
        
        <Card className="bg-teal-600 rounded-2xl p-4 text-white shadow-xl shadow-teal-500/20 flex flex-col justify-center">
           <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase opacity-70">Citas {filterStatus === 'all' ? 'Totales' : filterStatus}</p>
              <CalendarCheck className="h-4 w-4 opacity-50" />
           </div>
           <p className="text-3xl font-black">{filteredAppointments.length}</p>
        </Card>
      </div>

      {/* --- MAIN CALENDAR VIEW --- */}
      {viewMode === 'week' ? <WeekView /> : <DayView />}


      {/* --- APPOINTMENT SHEET (COMMAND DRAWER) --- */}
      <Sheet open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
        <SheetContent className="sm:max-w-md bg-white dark:bg-slate-950 p-0 overflow-hidden rounded-l-[2rem] border-none shadow-2xl">
          {selectedAppointment && (
            <div className="flex flex-col h-full">
               <div className={cn(
                 "p-8 pt-12 text-white relative",
                 getStatusColor(selectedAppointment.status)
               )}>
                  <div className="absolute top-8 right-8 flex gap-2">
                     <Badge className="bg-white/20 backdrop-blur-md text-white border-none font-black uppercase text-[10px]">{selectedAppointment.type}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-20 w-20 border-4 border-white/20 shadow-xl">
                       <AvatarImage src={selectedAppointment.patient.avatar_url} />
                       <AvatarFallback className="bg-white text-teal-600 text-2xl font-black">{selectedAppointment.patient.first_name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                       <h2 className="text-2xl font-black tracking-tighter leading-none">{selectedAppointment.patient.first_name}</h2>
                       <h2 className="text-2xl font-black tracking-tighter leading-none opacity-80">{selectedAppointment.patient.last_name}</h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <p className="text-[9px] font-black uppercase opacity-60">Horario</p>
                        <p className="text-sm font-bold">{selectedAppointment.appointment_time.slice(0,5)} • {selectedAppointment.duration_minutes}m</p>
                     </div>
                     <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <p className="text-[9px] font-black uppercase opacity-60">Pago</p>
                        <p className="text-sm font-bold uppercase">{selectedAppointment.payment_status}</p>
                     </div>
                  </div>
               </div>

               <div className="flex-1 p-8 space-y-8 overflow-y-auto">
                  <div className="space-y-4">
                     <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                       <User className="h-3 w-3" /> Contacto del Paciente
                     </h3>
                     <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 group">
                           <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-teal-600 shadow-sm"><Mail className="h-4 w-4" /></div>
                           <span className="text-sm font-bold text-slate-700 truncate">{selectedAppointment.patient.email}</span>
                        </div>
                        {selectedAppointment.patient.phone && (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 group">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-teal-600 shadow-sm"><Phone className="h-4 w-4" /></div>
                            <span className="text-sm font-bold text-slate-700">{selectedAppointment.patient.phone}</span>
                          </div>
                        )}
                     </div>
                  </div>

                  {selectedAppointment.notes && (
                    <div className="space-y-4">
                       <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                         <Filter className="h-3 w-3" /> Motivo de Consulta
                       </h3>
                       <div className="p-4 rounded-2xl bg-teal-50 shadow-inner italic text-sm text-teal-900 border border-teal-100/50">
                         "{selectedAppointment.notes}"
                       </div>
                    </div>
                  )}

                  <div className="space-y-3 pt-6">
                     {selectedAppointment.status === 'confirmed' && (
                       <>
                         <Button 
                           onClick={() => {
                             const url = selectedAppointment.meeting_link || getJitsiMeetingUrl(selectedAppointment.id);
                             window.open(url, '_blank');
                           }}
                           className="w-full h-14 rounded-2xl bg-teal-600 hover:bg-teal-700 font-bold shadow-lg shadow-teal-500/20 gap-3"
                         >
                           <Video className="h-5 w-5" />
                           Iniciar Tele-consulta
                           <ArrowRight className="h-4 w-4 ml-auto" />
                         </Button>
                         <Button 
                           onClick={() => setCompleteDialogOpen(true)}
                           variant="outline"
                           className="w-full h-14 rounded-2xl border-slate-200 font-bold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all gap-3"
                         >
                           <CheckCircle2 className="h-5 w-5" />
                           Marcar como Completada
                         </Button>
                       </>
                     )}
                     
                     <div className="grid grid-cols-2 gap-3">
                        <Button 
                          variant="ghost" 
                          className="rounded-xl font-bold text-slate-500 h-11"
                          onClick={() => window.open(`/dashboard/professional/patients/${selectedAppointment.patient.id}`, '_blank')}
                        >Ficha Clínica</Button>
                        <Button 
                          variant="ghost" 
                          className="rounded-xl font-bold text-red-500 h-11 hover:bg-red-50"
                          onClick={() => setCancelDialogOpen(true)}
                          disabled={selectedAppointment.status === 'cancelled' || selectedAppointment.status === 'completed'}
                        >Cancelar Cita</Button>
                     </div>
                  </div>
               </div>

               <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400">Ref: {selectedAppointment.id.slice(0,8)}</span>
                  <div className="flex gap-2">
                     <Button variant="ghost" size="icon" className="rounded-full"><MoreVertical className="h-4 w-4" /></Button>
                  </div>
               </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* --- DIALOGS --- */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
         <AlertDialogContent className="rounded-3xl border-none shadow-2xl p-8">
            <AlertDialogHeader>
               <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4 mx-auto">
                  <CalendarX className="h-8 w-8" />
               </div>
               <AlertDialogTitle className="text-2xl font-black text-center text-slate-900 leading-tight">¿Deseas cancelar esta consulta?</AlertDialogTitle>
               <AlertDialogDescription className="text-center text-slate-500 font-medium">
                  Esta acción no se puede deshacer. Se procesará el reembolso automático vía Stripe según la política de cancelación.
               </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-8 gap-3 sm:flex-col lg:flex-row">
               <AlertDialogCancel className="w-full h-12 rounded-xl font-bold border-slate-200">No, mantener cita</AlertDialogCancel>
               <AlertDialogAction 
                 onClick={handleCancel}
                 className="w-full h-12 rounded-xl font-bold bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20"
               >
                 {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sí, cancelar consulta"}
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
               <AlertDialogTitle className="text-2xl font-black text-center text-slate-900 leading-tight">Confirmar Finalización</AlertDialogTitle>
               <AlertDialogDescription className="text-center text-slate-500 font-medium">
                  ¿La consulta ha terminado con éxito? Esto liberará el pago y notificará al paciente para calificar tu atención.
               </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-8 gap-3 sm:flex-col lg:flex-row">
               <AlertDialogCancel className="w-full h-12 rounded-xl font-bold border-slate-200">Aún no termina</AlertDialogCancel>
               <AlertDialogAction 
                 onClick={handleComplete}
                 className="w-full h-12 rounded-xl font-bold bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-500/20"
               >
                 {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar y Finalizar"}
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
