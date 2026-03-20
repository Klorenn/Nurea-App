"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { RouteGuard } from "@/components/auth/route-guard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Search,
  Loader2,
  RefreshCw,
  Video,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Stethoscope,
  CreditCard,
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<string, { label: string; labelEn: string; color: string; icon: typeof CheckCircle2 }> = {
  pending:   { label: "Pendiente",   labelEn: "Pending",   color: "bg-amber-100 text-amber-700",   icon: Clock },
  confirmed: { label: "Confirmada",  labelEn: "Confirmed",  color: "bg-blue-100 text-blue-700",     icon: CheckCircle2 },
  completed: { label: "Completada",  labelEn: "Completed",  color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  cancelled: { label: "Cancelada",   labelEn: "Cancelled",  color: "bg-red-100 text-red-700",       icon: XCircle },
  no_show:   { label: "No asistió",  labelEn: "No show",    color: "bg-slate-100 text-slate-600",   icon: AlertCircle },
}

const PAYMENT_CONFIG: Record<string, { label: string; color: string }> = {
  paid:     { label: "Pagado",    color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  pending:  { label: "Pendiente", color: "bg-amber-50 text-amber-700 border-amber-200" },
  refunded: { label: "Reembolso", color: "bg-blue-50 text-blue-700 border-blue-200" },
}

export default function AdminAppointmentsPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const supabase = createClient()

  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const loadAppointments = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      let query = supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          appointment_time,
          status,
          type,
          price,
          payment_status,
          patient:profiles!appointments_patient_id_fkey(id, first_name, last_name, avatar_url),
          professional:professionals!appointments_professional_id_fkey(
            id,
            specialty,
            profile:profiles!professionals_id_fkey(id, first_name, last_name, avatar_url)
          )
        `)
        .order("appointment_date", { ascending: false })
        .order("appointment_time", { ascending: false })
        .limit(200)

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter)
      }

      const { data, error } = await query
      if (error) throw error
      setAppointments(data || [])
    } catch (err: any) {
      console.error("Error loading appointments:", err?.message ?? err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [supabase, statusFilter])

  useEffect(() => { loadAppointments() }, [loadAppointments])

  const filtered = appointments.filter((apt) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    const patientName = `${apt.patient?.first_name ?? ""} ${apt.patient?.last_name ?? ""}`.toLowerCase()
    const proName = `${apt.professional?.profile?.first_name ?? ""} ${apt.professional?.profile?.last_name ?? ""}`.toLowerCase()
    return patientName.includes(q) || proName.includes(q) || apt.id?.toLowerCase().includes(q)
  })

  const counts = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === "confirmed").length,
    completed: appointments.filter(a => a.status === "completed").length,
    pending: appointments.filter(a => a.status === "pending").length,
    cancelled: appointments.filter(a => a.status === "cancelled").length,
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(isSpanish ? "es-CL" : "en-US", { year: "numeric", month: "short", day: "numeric" })

  const formatTime = (t: string | null) => t?.slice(0, 5) ?? "—"

  return (
    <RouteGuard requiredRole="admin">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8 pb-10"
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/20">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              {isSpanish ? "Gestión de Citas" : "Appointments"}
            </h1>
            <p className="text-slate-500 font-medium mt-2 ml-16">
              {isSpanish ? "Todas las citas de la plataforma en tiempo real" : "All platform appointments in real time"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadAppointments(true)}
            disabled={refreshing}
            className="rounded-xl border-slate-200 gap-2 self-start lg:self-auto"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            {isSpanish ? "Actualizar" : "Refresh"}
          </Button>
        </div>

        {/* KPI Mini Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: isSpanish ? "Total" : "Total", val: counts.total, color: "text-slate-700", bg: "bg-slate-100" },
            { label: isSpanish ? "Confirmadas" : "Confirmed", val: counts.confirmed, color: "text-blue-700", bg: "bg-blue-100" },
            { label: isSpanish ? "Completadas" : "Completed", val: counts.completed, color: "text-emerald-700", bg: "bg-emerald-100" },
            { label: isSpanish ? "Canceladas" : "Cancelled", val: counts.cancelled, color: "text-red-700", bg: "bg-red-100" },
          ].map((k) => (
            <Card key={k.label} className="border-slate-100 rounded-2xl">
              <CardContent className="p-4 flex items-center gap-3">
                <span className={cn("text-3xl font-black", k.color)}>{k.val}</span>
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", k.bg, k.color)}>{k.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isSpanish ? "Buscar por paciente, profesional o ID..." : "Search by patient, professional or ID..."}
              className="pl-10 rounded-xl bg-slate-50 border-slate-200 h-11"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px] rounded-xl h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isSpanish ? "Todos los estados" : "All statuses"}</SelectItem>
              <SelectItem value="pending">{isSpanish ? "Pendientes" : "Pending"}</SelectItem>
              <SelectItem value="confirmed">{isSpanish ? "Confirmadas" : "Confirmed"}</SelectItem>
              <SelectItem value="completed">{isSpanish ? "Completadas" : "Completed"}</SelectItem>
              <SelectItem value="cancelled">{isSpanish ? "Canceladas" : "Cancelled"}</SelectItem>
              <SelectItem value="no_show">{isSpanish ? "No asistió" : "No show"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="border-slate-200/60 shadow-xl shadow-slate-200/20 rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-5 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-black uppercase italic tracking-tighter">
                {isSpanish ? "Listado de Citas" : "Appointments List"}
              </CardTitle>
              <CardDescription>
                {filtered.length} {isSpanish ? "citas encontradas" : "appointments found"}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-24 text-center">
                <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="font-bold text-slate-500">
                  {isSpanish ? "No se encontraron citas" : "No appointments found"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {isSpanish ? "Fecha / Hora" : "Date / Time"}
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {isSpanish ? "Paciente" : "Patient"}
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {isSpanish ? "Profesional" : "Professional"}
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {isSpanish ? "Tipo" : "Type"}
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {isSpanish ? "Estado" : "Status"}
                      </th>
                      <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {isSpanish ? "Monto" : "Amount"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map((apt) => {
                      const status = STATUS_CONFIG[apt.status] ?? STATUS_CONFIG.pending
                      const StatusIcon = status.icon
                      const payment = apt.payment_status ? (PAYMENT_CONFIG[apt.payment_status] ?? null) : null
                      const proName = apt.professional?.profile
                        ? `${apt.professional.profile.first_name ?? ""} ${apt.professional.profile.last_name ?? ""}`.trim()
                        : "—"
                      const patName = apt.patient
                        ? `${apt.patient.first_name ?? ""} ${apt.patient.last_name ?? ""}`.trim()
                        : "—"

                      return (
                        <tr key={apt.id} className="hover:bg-slate-50/60 transition-colors group">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-800 dark:text-slate-100">
                              {formatDate(apt.appointment_date)}
                            </p>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3" />
                              {formatTime(apt.appointment_time)}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7 shrink-0">
                                <AvatarImage src={apt.patient?.avatar_url} />
                                <AvatarFallback className="bg-sky-100 text-sky-700 text-[10px] font-bold">
                                  <User className="h-3 w-3" />
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
                                {patName || "—"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7 shrink-0">
                                <AvatarImage src={apt.professional?.profile?.avatar_url} />
                                <AvatarFallback className="bg-teal-100 text-teal-700 text-[10px] font-bold">
                                  <Stethoscope className="h-3 w-3" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
                                  {proName || "—"}
                                </p>
                                {apt.professional?.specialty && (
                                  <p className="text-[10px] text-slate-400 truncate max-w-[130px]">
                                    {apt.professional.specialty}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="gap-1 rounded-lg border-slate-200 text-xs font-medium">
                              {apt.type === "online"
                                ? <><Video className="h-3 w-3" /> Online</>
                                : <><MapPin className="h-3 w-3" /> {isSpanish ? "Presencial" : "In-person"}</>
                              }
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <Badge className={cn("gap-1 rounded-lg border-0 text-[10px] font-black uppercase w-fit", status.color)}>
                                <StatusIcon className="h-3 w-3" />
                                {isSpanish ? status.label : status.labelEn}
                              </Badge>
                              {payment && (
                                <Badge variant="outline" className={cn("text-[10px] font-bold rounded-lg w-fit", payment.color)}>
                                  <CreditCard className="h-3 w-3 mr-1" />
                                  {payment.label}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {apt.price ? (
                              <span className="font-black text-slate-800 dark:text-slate-100 font-mono">
                                ${Number(apt.price).toLocaleString("es-CL")}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </RouteGuard>
  )
}
