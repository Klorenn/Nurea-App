"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { RouteGuard } from "@/components/auth/route-guard"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, Loader2, Calendar, FileText } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function AdminPatientsPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [blockedFilter, setBlockedFilter] = useState<string>("all")

  useEffect(() => {
    loadPatients()
  }, [blockedFilter])

  const loadPatients = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append("role", "patient")
      if (blockedFilter !== "all") params.append("blocked", blockedFilter)

      const response = await fetch(`/api/admin/users?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        // Obtener estadísticas adicionales para cada paciente
        const patientsWithStats = await Promise.all(
          (data.users || []).map(async (patient: any) => {
            // Contar citas
            const appointmentsRes = await fetch(`/api/appointments/history?patientId=${patient.id}`)
            const appointmentsData = await appointmentsRes.json()
            const appointmentsCount = appointmentsData.appointments?.length || 0

            // Contar documentos (solo metadata)
            const documentsRes = await fetch(`/api/documents/list?patientId=${patient.id}`)
            const documentsData = await documentsRes.json()
            const documentsCount = documentsData.documents?.length || 0

            return {
              ...patient,
              appointmentsCount,
              documentsCount,
            }
          })
        )

        setPatients(patientsWithStats)
      }
    } catch (error) {
      console.error("Error loading patients:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter((patient) => {
    const query = searchQuery.toLowerCase()
    return (
      patient.first_name?.toLowerCase().includes(query) ||
      patient.last_name?.toLowerCase().includes(query) ||
      patient.email?.toLowerCase().includes(query)
    )
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === "es" ? "es-ES" : "en-US",
      { year: "numeric", month: "short", day: "numeric" }
    )
  }

  return (
    <RouteGuard requiredRole="admin">
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              {isSpanish ? "Pacientes" : "Patients"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isSpanish 
                ? "Lista de pacientes con metadata (sin contenido clínico detallado)"
                : "List of patients with metadata (no detailed clinical content)"}
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isSpanish ? "Buscar pacientes..." : "Search patients..."}
                className="pl-10 rounded-xl bg-accent/20 border-none h-12"
              />
            </div>
            <Select value={blockedFilter} onValueChange={setBlockedFilter}>
              <SelectTrigger className="w-full sm:w-[200px] rounded-xl">
                <SelectValue placeholder={isSpanish ? "Estado" : "Status"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isSpanish ? "Todos" : "All"}</SelectItem>
                <SelectItem value="false">{isSpanish ? "Activos" : "Active"}</SelectItem>
                <SelectItem value="true">{isSpanish ? "Bloqueados" : "Blocked"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Patients List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Card className="border-border/40">
              <CardContent className="p-0">
                <div className="divide-y divide-border/40">
                  {filteredPatients.length === 0 ? (
                    <div className="p-12 text-center">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">
                        {isSpanish ? "No se encontraron pacientes" : "No patients found"}
                      </p>
                    </div>
                  ) : (
                    filteredPatients.map((patient) => (
                      <div key={patient.id} className="p-6 hover:bg-accent/5 transition-colors">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              {patient.blocked && (
                                <Badge variant="destructive">
                                  {isSpanish ? "Bloqueado" : "Blocked"}
                                </Badge>
                              )}
                              {patient.email_verified && (
                                <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                                  {isSpanish ? "Verificado" : "Verified"}
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-bold text-lg mb-2">
                              {patient.first_name} {patient.last_name}
                            </h3>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>
                                <strong className="text-foreground">{isSpanish ? "Email:" : "Email:"}</strong> {patient.email}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {patient.appointmentsCount} {isSpanish ? "citas" : "appointments"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  <span>
                                    {patient.documentsCount} {isSpanish ? "documentos" : "documents"}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs mt-2">
                                {isSpanish ? "Registrado:" : "Registered:"} {formatDate(patient.created_at)}
                              </p>
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
      </AdminLayout>
    </RouteGuard>
  )
}

