"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  Plus,
  Clock,
  Pill,
  Stethoscope,
  FileImage,
  Download,
  FolderOpen,
  Activity,
  Shield,
  ChevronRight,
  NotebookPen,
  History,
  Paperclip,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import { AddPatientModal } from "@/components/calendar/modals/add-patient-modal"

interface MedicalEntry {
  id: string
  date: string
  reason: string
  diagnosis: string
  treatment: string
  notes?: string
}

interface PatientFile {
  id: string
  name: string
  type: "pdf" | "image" | "lab"
  uploadedAt: string
  size: string
}

interface Patient {
  id: string
  name: string
  rut: string
  email: string
  phone: string
  birthDate: string
  gender: "M" | "F"
  avatarUrl?: string
  lastVisit: string
  hasAppointmentToday: boolean
  medicalHistory: MedicalEntry[]
  files: PatientFile[]
  privateNotes: string
}

const calculateAge = (birthDate: string | null | undefined): number => {
  if (!birthDate) return 0
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}



const formatDate = (dateString: string | null | undefined, isSpanish: boolean): string => {
  if (!dateString) return isSpanish ? "Sin registro" : "No record"
  const date = new Date(dateString)
  return date.toLocaleDateString(isSpanish ? "es-CL" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function PatientListItem({
  patient,
  isSelected,
  onClick,
  isSpanish,
}: {
  patient: Patient
  isSelected: boolean
  onClick: () => void
  isSpanish: boolean
}) {
  return (
    <motion.button
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-xl transition-all",
        isSelected
          ? "bg-teal-50 dark:bg-teal-950/30 border-2 border-teal-500/50"
          : "bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-10 w-10 border border-slate-100 dark:border-slate-700">
            <AvatarImage src={patient.avatarUrl} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-teal-500 to-teal-600 text-white text-sm font-medium">
              {patient.name.split(" ")[0][0]}
              {patient.name.split(" ").slice(-1)[0][0]}
            </AvatarFallback>
          </Avatar>
          {patient.hasAppointmentToday && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-medium text-sm truncate",
            isSelected ? "text-teal-700 dark:text-teal-300" : "text-slate-700 dark:text-slate-200"
          )}>
            {patient.name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {isSpanish ? "Última:" : "Last:"} {formatDate(patient.lastVisit, isSpanish)}
          </p>
        </div>
        {isSelected && (
          <ChevronRight className="h-4 w-4 text-teal-500 shrink-0" />
        )}
      </div>
    </motion.button>
  )
}

function EmptyPatientState({ isSpanish }: { isSpanish: boolean }) {
  return (
    <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
      <div className="text-center p-8">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FolderOpen className="h-10 w-10 text-slate-400" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {isSpanish
            ? "Selecciona un paciente"
            : "Select a patient"}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
          {isSpanish
            ? "Selecciona un paciente de la lista para ver su ficha clínica completa"
            : "Select a patient from the list to view their complete clinical record"}
        </p>
      </div>
    </div>
  )
}

function MedicalTimeline({
  entries,
  isSpanish,
}: {
  entries: MedicalEntry[]
  isSpanish: boolean
}) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-500">
          {isSpanish ? "Sin historial médico registrado" : "No medical history recorded"}
        </p>
      </div>
    )
  }

  return (
    <div className="relative pl-6">
      {/* Timeline line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-teal-500 via-teal-300 to-slate-200 dark:to-slate-700" />

      <div className="space-y-6">
        {entries.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {/* Timeline dot */}
            <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-teal-500 border-2 border-white dark:border-slate-900 shadow-sm" />

            <Card className="border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 transition-colors">
              <CardContent className="p-4 space-y-3">
                {/* Date */}
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs font-medium">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(entry.date, isSpanish)}
                  </Badge>
                </div>

                {/* Reason */}
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {isSpanish ? "Motivo de consulta" : "Reason for visit"}
                  </p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {entry.reason}
                  </p>
                </div>

                {/* Diagnosis */}
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Stethoscope className="h-3 w-3" />
                    {isSpanish ? "Diagnóstico" : "Diagnosis"}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                    {entry.diagnosis}
                  </p>
                </div>

                {/* Treatment */}
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Pill className="h-3 w-3" />
                    {isSpanish ? "Tratamiento indicado" : "Prescribed treatment"}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {entry.treatment}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function PatientFiles({
  files,
  isSpanish,
}: {
  files: PatientFile[]
  isSpanish: boolean
}) {
  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <Paperclip className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-500">
          {isSpanish ? "Sin archivos adjuntos" : "No attached files"}
        </p>
      </div>
    )
  }

  const getFileIcon = (type: PatientFile["type"]) => {
    switch (type) {
      case "pdf":
        return FileText
      case "image":
        return FileImage
      case "lab":
        return Activity
      default:
        return FileText
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {files.map((file) => {
        const Icon = getFileIcon(file.type)
        return (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-teal-300 dark:hover:border-teal-700 transition-colors group"
          >
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
              file.type === "pdf" ? "bg-red-50 dark:bg-red-950/30 text-red-500" :
              file.type === "image" ? "bg-blue-50 dark:bg-blue-950/30 text-blue-500" :
              "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500"
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                {file.name}
              </p>
              <p className="text-xs text-slate-500">
                {file.size} • {formatDate(file.uploadedAt, isSpanish)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Download className="h-4 w-4" />
            </Button>
          </motion.div>
        )
      })}
    </div>
  )
}

function PatientRecord({
  patient,
  isSpanish,
}: {
  patient: Patient
  isSpanish: boolean
}) {
  const [activeTab, setActiveTab] = useState("history")
  const [notes, setNotes] = useState(patient.privateNotes)
  const age = calculateAge(patient.birthDate)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 rounded-2xl border-2 border-teal-500/20">
              <AvatarImage src={patient.avatarUrl} className="object-cover" />
              <AvatarFallback className="rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 text-white text-xl font-bold">
                {patient.name.split(" ")[0][0]}
                {patient.name.split(" ").slice(-1)[0][0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {patient.name}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {age} {isSpanish ? "años" : "years"} • {patient.gender === "F" ? (isSpanish ? "Femenino" : "Female") : (isSpanish ? "Masculino" : "Male")}
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" />
                  {patient.rut}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {patient.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {patient.phone}
                </span>
              </div>
            </div>
          </div>
          <Button className="rounded-xl bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20 shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            {isSpanish ? "Añadir Evolución" : "Add Note"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-6 pt-4 border-b border-slate-100 dark:border-slate-800">
          <TabsList className="bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl h-auto w-full justify-start">
            <TabsTrigger
              value="history"
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium",
                "data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900",
                "data-[state=active]:text-teal-600 dark:data-[state=active]:text-teal-400",
                "data-[state=active]:shadow-sm"
              )}
            >
              <History className="h-4 w-4 mr-2" />
              {isSpanish ? "Historial Médico" : "Medical History"}
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium",
                "data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900",
                "data-[state=active]:text-teal-600 dark:data-[state=active]:text-teal-400",
                "data-[state=active]:shadow-sm"
              )}
            >
              <NotebookPen className="h-4 w-4 mr-2" />
              {isSpanish ? "Notas Privadas" : "Private Notes"}
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium",
                "data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900",
                "data-[state=active]:text-teal-600 dark:data-[state=active]:text-teal-400",
                "data-[state=active]:shadow-sm"
              )}
            >
              <Paperclip className="h-4 w-4 mr-2" />
              {isSpanish ? "Archivos/Exámenes" : "Files/Exams"}
              {patient.files.length > 0 && (
                <Badge className="ml-2 bg-teal-500 text-white text-[10px] px-1.5">
                  {patient.files.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="history" className="h-full m-0 p-6">
            <ScrollArea className="h-full pr-4">
              <MedicalTimeline entries={patient.medicalHistory} isSpanish={isSpanish} />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="notes" className="h-full m-0 p-6">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-amber-500" />
                  {isSpanish
                    ? "Estas notas son privadas y nunca serán visibles para el paciente"
                    : "These notes are private and will never be visible to the patient"}
                </p>
              </div>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  isSpanish
                    ? "Escribe tus notas privadas sobre este paciente..."
                    : "Write your private notes about this patient..."
                }
                className="flex-1 min-h-[300px] rounded-xl resize-none bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-800/50 focus:border-amber-400"
              />
              <div className="flex justify-end mt-3">
                <Button className="rounded-xl bg-teal-600 hover:bg-teal-700">
                  {isSpanish ? "Guardar Notas" : "Save Notes"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="files" className="h-full m-0 p-6">
            <ScrollArea className="h-full pr-4">
              <PatientFiles files={patient.files} isSpanish={isSpanish} />
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

export default function ProfessionalPatientsPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"

  const [searchTerm, setSearchTerm] = useState("")
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [addPatientOpen, setAddPatientOpen] = useState(false)

  useMemo(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('/api/professional/patients')
        const data = await response.json()
        if (data.success && data.patients) {
          const mappedPatients: Patient[] = data.patients.map((p: any) => ({
            id: p.id,
            name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Desconocido',
            rut: 'N/A', // We'll assume RUT isn't straight from this API or use what's available
            email: p.email || '',
            phone: p.phone || '',
            birthDate: p.date_of_birth || '',
            gender: 'M', // Fallback
            avatarUrl: p.avatar_url || '',
            lastVisit: p.lastAppointment || '',
            hasAppointmentToday: false, // We can compute this if needed
            medicalHistory: [], // Real history not in basic API response for now
            files: [], // Real files not in API response for now
            privateNotes: '' // Real notes not in API response for now
          }))
          setPatients(mappedPatients)
          if (mappedPatients.length > 0) {
            setSelectedPatientId(mappedPatients[0].id)
          }
        }
      } catch (err) {
        console.error("Failed to load patients", err)
      } finally {
        setLoading(false)
      }
    }
    fetchPatients()
  }, [])

  const filteredPatients = useMemo(() => {
    if (!searchTerm) return patients
    const term = searchTerm.toLowerCase()
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.rut.toLowerCase().includes(term)
    )
  }, [searchTerm, patients])

  const selectedPatient = patients.find((p) => p.id === selectedPatientId)

  if (loading) {
     return <div className="h-[calc(100vh-8rem)] flex items-center justify-center">Cargando pacientes...</div>
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">
      {/* Left Column: Patient Directory */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-[320px] shrink-0 flex flex-col"
      >
        <Card className="flex-1 flex flex-col border-slate-200 dark:border-slate-800 overflow-hidden">
          <CardHeader className="pb-3 shrink-0">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-teal-600" />
              {isSpanish ? "Mis Pacientes" : "My Patients"}
              <Badge variant="secondary" className="ml-auto text-xs">
                {filteredPatients.length}
              </Badge>
            </CardTitle>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={isSpanish ? "Buscar por nombre o RUT..." : "Search by name or ID..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 rounded-xl h-10"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden px-3 pb-3">
            <ScrollArea className="h-full pr-2">
              <div className="space-y-2">
                <AnimatePresence>
                  {filteredPatients.map((patient) => (
                    <PatientListItem
                      key={patient.id}
                      patient={patient}
                      isSelected={patient.id === selectedPatientId}
                      onClick={() => setSelectedPatientId(patient.id)}
                      isSpanish={isSpanish}
                    />
                  ))}
                </AnimatePresence>
                {filteredPatients.length === 0 && (
                  <div className="text-center py-8">
                    <Search className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">
                      {isSpanish ? "No se encontraron pacientes" : "No patients found"}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      {/* Right Column: Patient Record */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 min-w-0 flex flex-col gap-4"
      >
        <div className="flex justify-end pr-6">
           <Button 
             onClick={() => setAddPatientOpen(true)}
             className="rounded-xl bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20"
           >
             <Plus className="h-4 w-4 mr-2" />
             {isSpanish ? "Añadir Paciente" : "Add Patient"}
           </Button>
        </div>
        <Card className="h-full border-slate-200 dark:border-slate-800 overflow-hidden">
          {selectedPatient ? (
            <PatientRecord patient={selectedPatient} isSpanish={isSpanish} />
          ) : (
            <EmptyPatientState isSpanish={isSpanish} />
          )}
        </Card>
      </motion.div>

      <AddPatientModal 
        open={addPatientOpen}
        onOpenChange={setAddPatientOpen}
        onSuccess={() => {
          // Re-fetch patients list
          const fetchPatients = async () => {
             setLoading(true)
             try {
                const response = await fetch('/api/professional/patients')
                const data = await response.json()
                if (data.success && data.patients) {
                  const mappedPatients: Patient[] = data.patients.map((p: any) => ({
                    id: p.id,
                    name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Desconocido',
                    rut: 'N/A',
                    email: p.email || '',
                    phone: p.phone || '',
                    birthDate: p.date_of_birth || '',
                    gender: 'M',
                    avatarUrl: p.avatar_url || '',
                    lastVisit: p.lastAppointment || '',
                    hasAppointmentToday: false,
                    medicalHistory: [],
                    files: [],
                    privateNotes: ''
                  }))
                  setPatients(mappedPatients)
                }
             } catch (err) {
                console.error("Failed to reload patients", err)
             } finally {
                setLoading(false)
             }
          }
          fetchPatients()
        }}
      />
    </div>
  )
}
