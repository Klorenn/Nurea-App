"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RouteGuard } from "@/components/auth/route-guard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Users,
  User,
  Search,
  Loader2,
  Calendar,
  FileText,
  Phone,
  Mail,
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { motion } from "framer-motion"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface PatientAppointment {
  id: string
  appointment_date: string
  appointment_time: string
  status: string
  type: string
}

interface Patient {
  id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  avatar_url?: string
  totalAppointments?: number
  lastAppointment?: string | null
  lastAppointmentStatus?: string | null
}

export default function ProfessionalPatientsPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"

  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [privateNotes, setPrivateNotes] = useState<Record<string, string>>({})
  const [patientAppointments, setPatientAppointments] = useState<PatientAppointment[]>([])
  const [loadingAppointments, setLoadingAppointments] = useState(false)

  useEffect(() => {
    loadPatients()
  }, [])

  useEffect(() => {
    if (!selectedPatient) return
    setLoadingAppointments(true)
    fetch(`/api/professional/appointments?patientId=${selectedPatient.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.appointments)) {
          setPatientAppointments(
            data.appointments.sort(
              (a: PatientAppointment, b: PatientAppointment) =>
                new Date(b.appointment_date + "T" + b.appointment_time).getTime() -
                new Date(a.appointment_date + "T" + a.appointment_time).getTime()
            )
          )
        } else {
          setPatientAppointments([])
        }
      })
      .catch(() => setPatientAppointments([]))
      .finally(() => setLoadingAppointments(false))
  }, [selectedPatient])

  const loadPatients = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/professional/patients")
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
    const phone = (patient.phone || "").toLowerCase()
    const query = searchQuery.toLowerCase()
    return fullName.includes(query) || email.includes(query) || phone.includes(query)
  })

  const formatDate = (dateString: string) => {
    if (!dateString) return isSpanish ? "N/A" : "N/A"
    return new Date(dateString).toLocaleDateString(
      isSpanish ? "es-ES" : "en-US",
      { year: "numeric", month: "short", day: "numeric" }
    )
  }

  const formatDateTime = (dateStr: string, timeStr: string) => {
    return new Date(dateStr + "T" + timeStr).toLocaleDateString(
      isSpanish ? "es-ES" : "en-US",
      { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }
    )
  }

  const savePrivateNote = (patientId: string) => {
    const note = privateNotes[patientId]
    if (note === undefined) return
    // Persistencia simulada (en producción: API)
    setPrivateNotes((prev) => ({ ...prev, [patientId]: note }))
  }

  const notes = selectedPatient ? privateNotes[selectedPatient.id] ?? "" : ""

  return (
    <RouteGuard requiredRole="professional">
      <DashboardLayout role="professional">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {isSpanish ? "Mis Pacientes" : "My Patients"}
              </h1>
              <p className="text-muted-foreground">
                {isSpanish
                  ? "Directorio de pacientes con citas contigo"
                  : "Directory of patients with appointments with you"}
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isSpanish ? "Buscar por nombre, email o teléfono..." : "Search by name, email or phone..."}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

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
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30">
                      <th className="px-4 py-3 font-semibold text-sm">
                        {isSpanish ? "Nombre" : "Name"}
                      </th>
                      <th className="px-4 py-3 font-semibold text-sm hidden sm:table-cell">
                        {isSpanish ? "Última visita" : "Last visit"}
                      </th>
                      <th className="px-4 py-3 font-semibold text-sm hidden md:table-cell">
                        {isSpanish ? "Teléfono" : "Phone"}
                      </th>
                      <th className="px-4 py-3 w-[100px]" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((patient, index) => (
                      <motion.tr
                        key={patient.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={cn(
                          "border-b border-border/40 hover:bg-muted/30 transition-colors cursor-pointer",
                          selectedPatient?.id === patient.id && "bg-primary/5"
                        )}
                        onClick={() => setSelectedPatient(patient)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              {patient.avatar_url ? (
                                <img
                                  src={patient.avatar_url}
                                  alt=""
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <User className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <span className="font-medium">
                              {patient.first_name} {patient.last_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                          {patient.lastAppointment
                            ? formatDate(patient.lastAppointment)
                            : isSpanish ? "—" : "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                          {patient.phone || (isSpanish ? "—" : "—")}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedPatient(patient)
                            }}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            {isSpanish ? "Ficha" : "Chart"}
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* Slide-over: Ficha clínica */}
        <Sheet open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatient(null)}>
          <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col">
            <SheetHeader>
              <SheetTitle>
                {selectedPatient
                  ? `${selectedPatient.first_name} ${selectedPatient.last_name}`
                  : ""}
              </SheetTitle>
              <SheetDescription>
                {isSpanish ? "Notas privadas e historial de citas" : "Private notes and appointment history"}
              </SheetDescription>
            </SheetHeader>

            {selectedPatient && (
              <div className="flex-1 overflow-y-auto space-y-6 py-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {selectedPatient.email && (
                      <>
                        <Mail className="h-4 w-4" />
                        {selectedPatient.email}
                      </>
                    )}
                  </div>
                  {selectedPatient.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {selectedPatient.phone}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{isSpanish ? "Notas privadas" : "Private notes"}</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) =>
                      setPrivateNotes((prev) => ({
                        ...prev,
                        [selectedPatient.id]: e.target.value,
                      }))
                    }
                    placeholder={
                      isSpanish
                        ? "Notas solo visibles para ti..."
                        : "Notes visible only to you..."
                    }
                    className="min-h-[120px] resize-none"
                  />
                  <Button size="sm" variant="secondary" onClick={() => savePrivateNote(selectedPatient.id)}>
                    {isSpanish ? "Guardar notas" : "Save notes"}
                  </Button>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {isSpanish ? "Historial de citas" : "Appointment history"}
                  </h4>
                  {loadingAppointments ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : patientAppointments.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">
                      {isSpanish ? "Sin citas registradas" : "No appointments recorded"}
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {patientAppointments.map((apt) => (
                        <li
                          key={apt.id}
                          className="flex items-center justify-between rounded-lg border border-border/40 px-3 py-2 text-sm"
                        >
                          <div>
                            <p className="font-medium">
                              {formatDateTime(apt.appointment_date, apt.appointment_time)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {apt.type === "online" ? (isSpanish ? "Online" : "Online") : isSpanish ? "Presencial" : "In-person"} · {apt.status}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </DashboardLayout>
    </RouteGuard>
  )
}
