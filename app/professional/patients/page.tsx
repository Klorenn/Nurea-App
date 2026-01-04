"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RouteGuard } from "@/components/auth/route-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Users, 
  User, 
  Search, 
  Loader2,
  Calendar,
  FileText,
  ArrowRight,
  Mail
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function ProfessionalPatientsPage() {
  const { language } = useLanguage()
  const router = useRouter()
  const isSpanish = language === "es"
  
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/professional/patients')
      const data = await response.json()

      if (data.success) {
        setPatients(data.patients || [])
      }
    } catch (error) {
      console.error("Error loading patients:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase()
    const email = (patient.email || "").toLowerCase()
    const query = searchQuery.toLowerCase()
    return fullName.includes(query) || email.includes(query)
  })

  const formatDate = (dateString: string) => {
    if (!dateString) return isSpanish ? "N/A" : "N/A"
    return new Date(dateString).toLocaleDateString(
      isSpanish ? "es-ES" : "en-US",
      { year: "numeric", month: "short", day: "numeric" }
    )
  }

  return (
    <RouteGuard requiredRole="professional">
      <DashboardLayout role="professional">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {isSpanish ? "Pacientes" : "Patients"}
              </h1>
              <p className="text-muted-foreground">
                {isSpanish 
                  ? "Pacientes que tienen citas contigo"
                  : "Patients who have appointments with you"}
              </p>
            </div>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isSpanish ? "Buscar pacientes..." : "Search patients..."}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Patients List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredPatients.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? (isSpanish ? "No se encontraron pacientes" : "No patients found")
                    : (isSpanish ? "No tienes pacientes aún" : "You don't have any patients yet")}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPatients.map((patient, index) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          {patient.avatar_url ? (
                            <img 
                              src={patient.avatar_url} 
                              alt={`${patient.first_name} ${patient.last_name}`}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">
                            {patient.first_name} {patient.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {patient.email}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {isSpanish ? "Total de citas" : "Total appointments"}
                          </span>
                          <Badge variant="outline">{patient.totalAppointments}</Badge>
                        </div>
                        {patient.lastAppointment && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {isSpanish ? "Última cita" : "Last appointment"}
                            </span>
                            <span className="text-xs">{formatDate(patient.lastAppointment)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push(`/professional/clinical-history?patientId=${patient.id}`)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          {isSpanish ? "Historial" : "History"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push(`/professional/schedule?patientId=${patient.id}`)}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          {isSpanish ? "Citas" : "Appointments"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </RouteGuard>
  )
}

