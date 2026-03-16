"use client"

import { useState, useEffect } from "react"
import { RouteGuard } from "@/components/auth/route-guard"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Search, Loader2, Clock, CheckCircle2, XCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { createClient } from "@/lib/supabase/client"

export default function AdminAppointmentsPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const supabase = createClient()

  useEffect(() => {
    loadAppointments()
  }, [statusFilter])

  const loadAppointments = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from("appointments")
        .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(id, first_name, last_name, email),
          professional:profiles!appointments_professional_id_fkey(id, first_name, last_name, email)
        `)
        .order("appointment_date", { ascending: false })
        .order("appointment_time", { ascending: false })
        .limit(100)

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter)
      }

      const { data, error } = await query

      if (error) throw error

      setAppointments(data || [])
    } catch (error) {
      console.error("Error loading appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAppointments = appointments.filter((apt) => {
    const query = searchQuery.toLowerCase()
    return (
      apt.patient?.first_name?.toLowerCase().includes(query) ||
      apt.patient?.last_name?.toLowerCase().includes(query) ||
      apt.professional?.first_name?.toLowerCase().includes(query) ||
      apt.professional?.last_name?.toLowerCase().includes(query) ||
      apt.patient?.email?.toLowerCase().includes(query)
    )
  })

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: isSpanish ? "Pendiente" : "Pending", variant: "outline" },
      confirmed: { label: isSpanish ? "Confirmada" : "Confirmed", variant: "default" },
      completed: { label: isSpanish ? "Completada" : "Completed", variant: "secondary" },
      cancelled: { label: isSpanish ? "Cancelada" : "Cancelled", variant: "destructive" },
    }
    const statusInfo = statuses[status] || statuses.pending
    return (
      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === "es" ? "es-ES" : "en-US",
      { year: "numeric", month: "short", day: "numeric" }
    )
  }

  return (
    <RouteGuard requiredRole="admin">
      
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary" />
              {isSpanish ? "Citas" : "Appointments"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isSpanish 
                ? "Ver todas las citas de la plataforma"
                : "View all platform appointments"}
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isSpanish ? "Buscar citas..." : "Search appointments..."}
                className="pl-10 rounded-xl bg-accent/20 border-none h-12"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isSpanish ? "Todos" : "All"}</SelectItem>
                <SelectItem value="pending">{isSpanish ? "Pendientes" : "Pending"}</SelectItem>
                <SelectItem value="confirmed">{isSpanish ? "Confirmadas" : "Confirmed"}</SelectItem>
                <SelectItem value="completed">{isSpanish ? "Completadas" : "Completed"}</SelectItem>
                <SelectItem value="cancelled">{isSpanish ? "Canceladas" : "Cancelled"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Appointments List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Card className="border-border/40">
              <CardContent className="p-0">
                <div className="divide-y divide-border/40">
                  {filteredAppointments.length === 0 ? (
                    <div className="p-12 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">
                        {isSpanish ? "No se encontraron citas" : "No appointments found"}
                      </p>
                    </div>
                  ) : (
                    filteredAppointments.map((apt) => (
                      <div key={apt.id} className="p-6 hover:bg-accent/5 transition-colors">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {getStatusBadge(apt.status)}
                                <Badge variant="outline">
                                  {apt.type === "online" 
                                    ? (isSpanish ? "Online" : "Online")
                                    : (isSpanish ? "Presencial" : "In-person")}
                                </Badge>
                                {apt.payment_status && (
                                  <Badge variant={apt.payment_status === "paid" ? "default" : "outline"}>
                                    {apt.payment_status === "paid" 
                                      ? (isSpanish ? "Pagado" : "Paid")
                                      : (isSpanish ? "Pendiente" : "Pending")}
                                  </Badge>
                                )}
                              </div>
                              <h3 className="font-bold text-lg mb-2">
                                {formatDate(apt.appointment_date)} • {apt.appointment_time}
                              </h3>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <p>
                                  <strong className="text-foreground">{isSpanish ? "Paciente:" : "Patient:"}</strong>{" "}
                                  {apt.patient?.first_name} {apt.patient?.last_name} ({apt.patient?.email})
                                </p>
                                <p>
                                  <strong className="text-foreground">{isSpanish ? "Profesional:" : "Professional:"}</strong>{" "}
                                  {apt.professional?.first_name} {apt.professional?.last_name}
                                </p>
                                {apt.price && (
                                  <p>
                                    <strong className="text-foreground">{isSpanish ? "Precio:" : "Price:"}</strong>{" "}
                                    ${apt.price.toLocaleString()} CLP
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      
    </RouteGuard>
  )
}

