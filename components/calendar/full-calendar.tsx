"use client"

import * as React from "react"
import { 
  format, 
  addDays, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  startOfMonth, 
  endOfMonth, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  eachWeekOfInterval,
  isToday,
  startOfHour,
  addHours,
  setHours,
  setMinutes
} from "date-fns"
import { es, enUS } from "date-fns/locale"
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Video,
  Building2,
  Clock,
  MoreVertical,
  Filter,
  Check,
  CheckCircle2,
  CalendarX,
  RefreshCw,
  Search
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useLanguage } from "@/contexts/language-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type ViewMode = "month" | "week" | "day"

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  duration_minutes: number
  type: "online" | "in-person"
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show"
  payment_status?: string
  price?: number
  patient: {
    id: string
    first_name: string
    last_name: string
    avatar_url?: string
    email?: string
    phone?: string
  }
}

interface FullCalendarProps {
  appointments: Appointment[]
  onEventClick: (appointment: Appointment) => void
  onAddAppointment: (date?: Date) => void
  onAddPatient: () => void
  onDateChange: (date: Date) => void
  currentDate: Date
}

import { AnimatePresence, motion } from "framer-motion"

export function FullCalendar({ 
  appointments, 
  onEventClick, 
  onAddAppointment, 
  onAddPatient,
  onDateChange,
  currentDate 
}: FullCalendarProps) {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const locale = isSpanish ? es : enUS
  const [viewMode, setViewMode] = React.useState<ViewMode>("week")

  const nextDate = () => {
    if (viewMode === "month") onDateChange(addMonths(currentDate, 1))
    else if (viewMode === "week") onDateChange(addDays(currentDate, 7))
    else onDateChange(addDays(currentDate, 1))
  }

  const prevDate = () => {
    if (viewMode === "month") onDateChange(subMonths(currentDate, 1))
    else if (viewMode === "week") onDateChange(addDays(currentDate, -7))
    else onDateChange(addDays(currentDate, -1))
  }

  const goToToday = () => onDateChange(new Date())

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <Button variant="ghost" size="icon" onClick={prevDate} className="h-8 w-8 rounded-lg outline-none">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={goToToday} className="px-3 h-8 font-bold text-xs uppercase tracking-tight">
              {isSpanish ? "Hoy" : "Today"}
            </Button>
            <Button variant="ghost" size="icon" onClick={nextDate} className="h-8 w-8 rounded-lg outline-none">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-xl font-black tracking-tight capitalize min-w-[150px]">
            {format(currentDate, viewMode === "month" ? "MMMM yyyy" : "MMMM yyyy", { locale })}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(["month", "week", "day"] as ViewMode[]).map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(mode)}
                className={cn(
                  "px-4 h-8 font-bold text-xs capitalize rounded-lg transition-all",
                  viewMode === mode && "bg-white dark:bg-slate-950 text-teal-600 dark:text-teal-400 shadow-sm hover:bg-white dark:hover:bg-slate-950"
                )}
              >
                {isSpanish ? (mode === "month" ? "Mes" : mode === "week" ? "Semana" : "Día") : mode}
              </Button>
            ))}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 px-4 font-bold shadow-lg shadow-teal-500/20 gap-2">
                <Plus className="h-4 w-4" />
                {isSpanish ? "Nuevo" : "New"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-slate-200 dark:border-slate-800">
              <DropdownMenuItem onClick={() => onAddAppointment()} className="rounded-xl h-12 gap-3 cursor-pointer">
                <CalendarIcon className="h-4 w-4 text-teal-600" />
                <div className="flex flex-col">
                  <span className="font-bold text-sm">{isSpanish ? "Agendar Cita" : "Schedule Event"}</span>
                  <span className="text-[10px] text-slate-500">{isSpanish ? "Para paciente nuevo o existente" : "For new or existing patient"}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddPatient} className="rounded-xl h-12 gap-3 cursor-pointer">
                <Plus className="h-4 w-4 text-blue-600" />
                <div className="flex flex-col">
                  <span className="font-bold text-sm">{isSpanish ? "Crear Paciente" : "New Patient"}</span>
                  <span className="text-[10px] text-slate-500">{isSpanish ? "Añadir a tu base de datos" : "Add to your database"}</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode + currentDate.toISOString()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full"
          >
            {viewMode === "month" && (
              <MonthView 
                currentDate={currentDate} 
                appointments={appointments} 
                onEventClick={onEventClick} 
                locale={locale} 
                isSpanish={isSpanish}
              />
            )}
            {viewMode === "week" && (
              <WeekView 
                currentDate={currentDate} 
                appointments={appointments} 
                onEventClick={onEventClick} 
                locale={locale} 
                isSpanish={isSpanish}
              />
            )}
            {viewMode === "day" && (
              <DayView 
                currentDate={currentDate} 
                appointments={appointments} 
                onEventClick={onEventClick} 
                locale={locale} 
                isSpanish={isSpanish}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function MonthView({ currentDate, appointments, onEventClick, locale, isSpanish }: any) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const weeks = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 })
  const daysOfWeek = eachDayOfInterval({ 
    start: startOfWeek(new Date(), { weekStartsOn: 1 }), 
    end: endOfWeek(new Date(), { weekStartsOn: 1 }) 
  })

  return (
    <div className="grid grid-cols-7 h-full min-h-[600px]">
      {/* Week Day Labels */}
      {daysOfWeek.map((day) => (
        <div key={day.toString()} className="p-3 border-b border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {format(day, "EEEE", { locale })}
          </span>
        </div>
      ))}

      {/* Days Grid */}
      {weeks.map((weekStart) => {
        const days = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) })
        return days.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart)
          const dayAppointments = appointments.filter((a: any) => isSameDay(new Date(a.appointment_date + "T00:00:00"), day))
          
          return (
            <div
              key={day.toString()}
              className={cn(
                "min-h-[120px] p-2 border-b border-r border-slate-50 dark:border-slate-800/50 transition-colors group",
                !isCurrentMonth ? "bg-slate-50/30 dark:bg-slate-900/20 text-slate-400" : "bg-white dark:bg-[#0f172a]",
                isToday(day) && "bg-teal-50/10 dark:bg-teal-500/5"
              )}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={cn(
                  "w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all",
                  isToday(day) ? "bg-teal-600 text-white shadow-md shadow-teal-500/20" : "group-hover:bg-slate-100 dark:group-hover:bg-slate-800"
                )}>
                  {format(day, "d")}
                </span>
                {dayAppointments.length > 0 && (
                   <span className="text-[9px] font-black text-slate-400 opacity-60 px-1.5 uppercase">
                     {dayAppointments.length} {isSpanish ? "citas" : "apts"}
                   </span>
                )}
              </div>
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map((apt: any) => (
                  <div
                    key={apt.id}
                    onClick={() => onEventClick(apt)}
                    className={cn(
                      "text-[10px] p-1.5 rounded-lg border truncate cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-1.5",
                      apt.status === 'confirmed' ? "bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/30 text-teal-800 dark:text-teal-300" :
                      apt.status === 'pending' ? "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300" :
                      "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    )}
                  >
                    <div className="w-1 h-3 rounded-full bg-current opacity-40 shrink-0" />
                    <span className="font-black opacity-80">{apt.appointment_time.slice(0, 5)}</span>
                    <span className="font-medium truncate">{apt.patient.first_name}</span>
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <div className="text-[9px] font-black text-slate-400 pl-2">
                    + {dayAppointments.length - 3} {isSpanish ? "más" : "more"}
                  </div>
                )}
              </div>
            </div>
          )
        })
      })}
    </div>
  )
}

function WeekView({ currentDate, appointments, onEventClick, locale, isSpanish }: any) {
  const start = startOfWeek(currentDate, { weekStartsOn: 1 })
  const end = endOfWeek(currentDate, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start, end })
  const hours = Array.from({ length: 15 }, (_, i) => i + 7) // 7 AM to 9 PM

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0f172a]">
      {/* Header with dates */}
      <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-20">
        <div className="p-4 border-r border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 flex items-center justify-center">
          <Clock className="h-4 w-4 mr-1 opacity-50" /> {isSpanish ? "HORA LOCAL" : "LOCAL TIME"}
        </div>
        {days.map((day) => (
          <div key={day.toString()} className={cn(
            "p-3 border-r border-slate-100 dark:border-slate-800 text-center relative transition-all group",
            isToday(day) && "bg-teal-50/30 dark:bg-teal-500/5"
          )}>
            {isToday(day) && (
              <div className="absolute top-0 inset-x-0 h-1 bg-teal-500" />
            )}
            <span className={cn(
              "block text-[10px] font-black uppercase tracking-widest mb-1.5 transition-colors",
              isToday(day) ? "text-teal-600 dark:text-teal-400" : "text-slate-400 dark:text-slate-500"
            )}>{format(day, "EEE", { locale })}</span>
            <span className={cn(
              "w-10 h-10 flex items-center justify-center mx-auto rounded-full text-base font-black transition-all",
              isToday(day) ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30 scale-110" : "text-slate-900 dark:text-slate-200 group-hover:bg-slate-100 dark:group-hover:bg-slate-800"
            )}>{format(day, "d")}</span>
          </div>
        ))}
      </div>

      {/* Grid Content */}
      <div className="relative">
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b border-slate-50 dark:border-slate-800/40 group/row h-24 transition-colors">
            <div className="p-2 border-r border-slate-200 dark:border-slate-800 text-[11px] font-black tracking-wide text-slate-400 flex items-start justify-center pt-3 relative">
              <span className="relative z-10 bg-white dark:bg-[#0f172a] px-1">{hour}:00</span>
              <div className="absolute top-4.5 left-0 w-full border-t border-dashed border-slate-100 dark:border-slate-800/40 z-0" />
            </div>
            
            {days.map((day) => {
              const dayStr = format(day, "yyyy-MM-dd")
              const hourApts = appointments.filter((a: any) => 
                a.appointment_date === dayStr && 
                a.appointment_time.startsWith(hour.toString().padStart(2, '0'))
              )
              
              return (
                <div key={day.toString()} className={cn(
                  "border-r border-slate-100 dark:border-slate-800/50 relative p-1 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/20",
                  isToday(day) && "bg-teal-50/10 dark:bg-teal-500/5"
                )}>
                  {hourApts.map((apt: any) => (
                    <div 
                      key={apt.id}
                      onClick={() => onEventClick(apt)}
                      className={cn(
                        "absolute inset-x-1.5 rounded-xl border p-2 cursor-pointer hover:scale-[1.02] hover:z-20 transition-all z-10 shadow-sm flex flex-col justify-between overflow-hidden group/event",
                        apt.status === 'confirmed' ? "bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/30 text-teal-800 dark:text-teal-300 hover:shadow-teal-500/20 shadow-teal-500/5" :
                        apt.status === 'pending' ? "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300" :
                        "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-400"
                      )}
                      style={{ height: '90%' }}
                    >
                      <div className="absolute left-0 top-1 bottom-1 w-1 bg-current opacity-30 rounded-r-full" />
                      <div>
                        <p className="text-[10px] font-black truncate uppercase tracking-tight">{apt.patient.first_name} {apt.patient.last_name}</p>
                        <p className="text-[9px] font-bold opacity-60 truncate">
                          {apt.type === 'online' ? (isSpanish ? 'Videollamada' : 'Video') : (isSpanish ? 'Presencial' : 'In-person')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-60 mt-auto">
                        {apt.type === 'online' ? <Video className="h-2.5 w-2.5" /> : <Building2 className="h-2.5 w-2.5" />}
                        <span className="text-[9px] font-black">{apt.appointment_time.slice(0, 5)}</span>
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

function DayView({ currentDate, appointments, onEventClick, locale, isSpanish }: any) {
  const dayStr = format(currentDate, "yyyy-MM-dd")
  const dayApts = appointments.filter((a: any) => a.appointment_date === dayStr)
  const hours = Array.from({ length: 15 }, (_, i) => i + 7)

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0f172a]">
      {/* Date Large Header */}
      <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 backdrop-blur sticky top-0 z-20">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white capitalize flex items-center gap-4">
          <span className={cn(
            "w-14 h-14 flex items-center justify-center rounded-2xl text-white shadow-xl rotate-[-2deg]",
            isToday(currentDate) ? "bg-teal-600 shadow-teal-500/30" : "bg-slate-800 dark:bg-slate-700"
          )}>
            {format(currentDate, "d")}
          </span>
          <div className="flex flex-col">
            <span className="italic">{format(currentDate, "EEEE", { locale })}</span>
            <span className="text-sm font-bold opacity-50 uppercase tracking-widest">{format(currentDate, "MMMM yyyy", { locale })}</span>
          </div>
        </h2>
      </div>

      <div className="relative">
        {hours.map((hour) => {
          const hourApts = dayApts.filter((a: any) => a.appointment_time.startsWith(hour.toString().padStart(2, '0')))
          
          return (
            <div key={hour} className="group min-h-[140px] border-b border-slate-100 dark:border-slate-800/40 relative flex">
              <div className="w-24 p-6 border-r border-slate-100 dark:border-slate-800/40 text-[11px] font-black tracking-widest text-slate-400 uppercase text-center shrink-0">
                {hour}:00
              </div>
              
              <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white/50 dark:bg-slate-900/20 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-900/40 transition-colors">
                {hourApts.map((apt: any) => (
                  <div 
                    key={apt.id}
                    onClick={() => onEventClick(apt)}
                    className={cn(
                      "rounded-2xl border p-4 shadow-sm cursor-pointer hover:scale-[1.02] hover:shadow-lg transition-all flex justify-between items-center group/card overflow-hidden relative",
                      apt.status === 'confirmed' ? "bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/30 hover:shadow-teal-500/20" :
                      apt.status === 'pending' ? "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 hover:shadow-amber-500/20" :
                      "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-slate-200/50 dark:shadow-none"
                    )}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-current opacity-20 group-hover/card:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-4 pl-2">
                      <Avatar className="h-12 w-12 rounded-2xl ring-4 ring-white dark:ring-slate-900 shadow-sm">
                        <AvatarImage src={apt.patient.avatar_url} />
                        <AvatarFallback className="bg-teal-600 text-white font-black text-xs uppercase">
                          {apt.patient.first_name[0]}{apt.patient.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white text-base leading-tight uppercase tracking-tight">{apt.patient.first_name} {apt.patient.last_name}</p>
                        <div className="flex items-center gap-2 mt-1 opacity-60">
                          <span className="text-[10px] font-bold uppercase tracking-wider">{apt.appointment_time.slice(0, 5)}</span>
                          <span className="w-1 h-1 rounded-full bg-current" />
                          {apt.type === 'online' ? <Video className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                        </div>
                      </div>
                    </div>
                    <Badge className={cn(
                      "rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-tight h-fit border-none",
                      apt.status === 'confirmed' ? "bg-teal-600/10 text-teal-600" :
                      apt.status === 'pending' ? "bg-amber-600/10 text-amber-600" :
                      apt.status === 'completed' ? "bg-blue-600/10 text-blue-600" :
                      "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                    )}>
                      {isSpanish ? 
                        (apt.status === 'confirmed' ? 'Confirmada' : 
                         apt.status === 'pending' ? 'Pendiente' : 
                         apt.status === 'completed' ? 'Completada' : 
                         apt.status === 'cancelled' ? 'Cancelada' : 
                         apt.status) 
                        : apt.status
                      }
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
