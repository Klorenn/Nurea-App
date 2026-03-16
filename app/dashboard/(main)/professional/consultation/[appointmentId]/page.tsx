"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { 
  Stethoscope, 
  ClipboardList, 
  FileText, 
  Pill, 
  Calendar,
  Clock,
  User,
  Video,
  Save,
  Check,
  Loader2,
  ChevronLeft,
  Plus,
  Trash2,
  Download,
  AlertCircle,
  Heart,
  Activity,
  Brain,
  Eye,
  Thermometer,
  Search,
  FileCheck,
  Cloud,
  CloudOff,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react"
import { format, parseISO, formatDistanceToNow } from "date-fns"
import { es, enUS } from "date-fns/locale"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { getJitsiMeetingUrl } from "@/lib/utils/jitsi"
import { PrescriptionDrawer } from "@/components/consultation/prescription-drawer"
import { VideoCallButton } from "@/components/consultation/video-call-button"
import { ReferralModal } from "@/components/consultation/referral-modal"
import { Link as LinkIcon } from "lucide-react"

interface Patient {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  avatar_url?: string
  date_of_birth?: string
}

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  type: "online" | "in-person"
  status: string
  duration_minutes: number
  patient: Patient
}

interface MedicalRecord {
  id: string
  reason_for_visit: string
  chief_complaint: string
  diagnosis: string
  diagnosis_code: string
  treatment: string
  prescription: string
  private_notes: string
  vital_signs: {
    blood_pressure?: string
    heart_rate?: string
    temperature?: string
    weight?: string
    height?: string
  } | null
  is_draft: boolean
  is_signed: boolean
  created_at: string
}

interface HistoryRecord {
  id: string
  reason_for_visit: string
  diagnosis: string
  diagnosis_code: string
  created_at: string
  is_signed: boolean
}

interface ReferralSummary {
  id: string
  reason: string
  referring_doctor: string
  original_record?: {
    reason_for_visit: string
    chief_complaint: string
    diagnosis: string
    treatment: string
  }
}

interface PrescriptionItem {
  id: string
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}

const ICD10_CODES = [
  { code: "F32.0", label: "Episodio depresivo leve" },
  { code: "F32.1", label: "Episodio depresivo moderado" },
  { code: "F32.2", label: "Episodio depresivo grave sin síntomas psicóticos" },
  { code: "F41.0", label: "Trastorno de pánico" },
  { code: "F41.1", label: "Trastorno de ansiedad generalizada" },
  { code: "F41.2", label: "Trastorno mixto ansioso-depresivo" },
  { code: "F43.0", label: "Reacción a estrés agudo" },
  { code: "F43.1", label: "Trastorno de estrés postraumático" },
  { code: "F43.2", label: "Trastornos de adaptación" },
  { code: "F50.0", label: "Anorexia nerviosa" },
  { code: "F50.2", label: "Bulimia nerviosa" },
  { code: "F51.0", label: "Insomnio no orgánico" },
  { code: "F60.3", label: "Trastorno de inestabilidad emocional de la personalidad" },
  { code: "F84.0", label: "Autismo infantil" },
  { code: "F90.0", label: "Trastorno de la actividad y de la atención (TDAH)" },
  { code: "J06.9", label: "Infección aguda de las vías respiratorias superiores" },
  { code: "K29.7", label: "Gastritis, no especificada" },
  { code: "M54.5", label: "Lumbago no especificado" },
  { code: "R51", label: "Cefalea" },
  { code: "Z00.0", label: "Examen médico general" },
]

export default function ConsultationPage() {
  const params = useParams()
  const router = useRouter()
  const appointmentId = params.appointmentId as string
  const supabase = createClient()
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const locale = isSpanish ? es : enUS

  // State
  const [loading, setLoading] = useState(true)
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [activeReferral, setActiveReferral] = useState<ReferralSummary | null>(null)
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([])
  const [prescriptionOpen, setPrescriptionOpen] = useState(false)
  const [referralOpen, setReferralOpen] = useState(false)
  
  // Form state
  const [recordId, setRecordId] = useState<string | null>(null)
  const [anamnesis, setAnamnesis] = useState("")
  const [examination, setExamination] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [diagnosisCode, setDiagnosisCode] = useState("")
  const [treatment, setTreatment] = useState("")
  const [privateNotes, setPrivateNotes] = useState("")
  const [vitalSigns, setVitalSigns] = useState({
    blood_pressure: "",
    heart_rate: "",
    temperature: "",
    weight: "",
    height: "",
  })

  // Auto-save state
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [icdOpen, setIcdOpen] = useState(false)
  const [icdSearch, setIcdSearch] = useState("")

  // Load appointment and patient data
  useEffect(() => {
    const loadData = async () => {
      if (!appointmentId) return
      
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push("/login")
          return
        }

        // Load appointment with patient data
        const { data: apt, error: aptError } = await supabase
          .from("appointments")
          .select(`
            id,
            appointment_date,
            appointment_time,
            type,
            status,
            duration_minutes,
            patient:profiles!appointments_patient_id_fkey(
              id, first_name, last_name, email, phone, avatar_url, date_of_birth
            )
          `)
          .eq("id", appointmentId)
          .eq("professional_id", user.id)
          .single()

        if (aptError || !apt) {
          toast.error(isSpanish ? "Cita no encontrada" : "Appointment not found")
          router.push("/dashboard/professional/appointments")
          return
        }

        setAppointment({
          ...apt,
          patient: apt.patient as unknown as Patient,
        })

        // Load patient's medical history (past records)
        const { data: historyData } = await supabase
          .from("medical_records")
          .select("id, reason_for_visit, diagnosis, diagnosis_code, created_at, is_signed")
          .eq("patient_id", (apt.patient as any).id)
          .eq("professional_id", user.id)
          .neq("appointment_id", appointmentId)
          .order("created_at", { ascending: false })
          .limit(10)

        if (historyData) {
          setHistory(historyData as HistoryRecord[])
        }

        // Load active and authorized referrals FOR this patient to this doctor
        const { data: referralData } = await supabase
          .from("referrals")
          .select(`
            id, reason, appointment_id,
            referring_professional:professionals!referrals_referring_professional_id_fkey(
              profiles!professionals_id_fkey(first_name, last_name)
            )
          `)
          .eq("patient_id", (apt.patient as any).id)
          .eq("clinical_summary_access", true)
          // it could be strictly for this target professional, or any authorized
          .eq("status", "authorized")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()

        if (referralData) {
          const refSummary: ReferralSummary = {
            id: referralData.id,
            reason: referralData.reason,
            referring_doctor: `${(referralData.referring_professional as any).profiles.first_name} ${(referralData.referring_professional as any).profiles.last_name}`
          }

          if (referralData.appointment_id) {
            const { data: originalRecord } = await supabase
              .from("medical_records")
              .select("reason_for_visit, chief_complaint, diagnosis, treatment")
              .eq("appointment_id", referralData.appointment_id)
              .maybeSingle()
            
            if (originalRecord) {
              refSummary.original_record = originalRecord as ReferralSummary["original_record"]
            }
          }
          setActiveReferral(refSummary)
        }

        // Load existing record for this appointment (if any)
        const { data: existingRecord } = await supabase
          .from("medical_records")
          .select("*")
          .eq("appointment_id", appointmentId)
          .single()

        if (existingRecord) {
          setRecordId(existingRecord.id)
          setAnamnesis(existingRecord.reason_for_visit || "")
          setExamination(existingRecord.chief_complaint || "")
          setDiagnosis(existingRecord.diagnosis || "")
          setDiagnosisCode(existingRecord.diagnosis_code || "")
          setTreatment(existingRecord.treatment || "")
          setPrivateNotes(existingRecord.private_notes || "")
          if (existingRecord.vital_signs) {
            setVitalSigns({
              blood_pressure: existingRecord.vital_signs.blood_pressure || "",
              heart_rate: existingRecord.vital_signs.heart_rate || "",
              temperature: existingRecord.vital_signs.temperature || "",
              weight: existingRecord.vital_signs.weight || "",
              height: existingRecord.vital_signs.height || "",
            })
          }
          setLastSaved(new Date(existingRecord.updated_at))
        }

      } catch (error) {
        console.error("Error loading consultation data:", error)
        toast.error(isSpanish ? "Error al cargar datos" : "Error loading data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [appointmentId, supabase, router, isSpanish])

  // Mark changes as unsaved when form values change
  useEffect(() => {
    if (!loading) {
      setHasUnsavedChanges(true)
    }
  }, [anamnesis, examination, diagnosis, diagnosisCode, treatment, privateNotes, vitalSigns])

  // Auto-save every 30 seconds
  useEffect(() => {
    if (hasUnsavedChanges && !loading) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
      
      autoSaveTimerRef.current = setTimeout(() => {
        handleSave(true)
      }, 30000) // 30 seconds
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [hasUnsavedChanges, loading])

  const handleSave = useCallback(async (isAutoSave = false) => {
    if (!appointment) return
    
    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const recordData = {
        patient_id: appointment.patient.id,
        professional_id: user.id,
        appointment_id: appointmentId,
        reason_for_visit: anamnesis,
        chief_complaint: examination,
        diagnosis,
        diagnosis_code: diagnosisCode,
        treatment,
        private_notes: privateNotes,
        vital_signs: vitalSigns,
        is_draft: true,
        updated_at: new Date().toISOString(),
      }

      if (recordId) {
        // Update existing record
        const { error } = await supabase
          .from("medical_records")
          .update(recordData)
          .eq("id", recordId)

        if (error) throw error
      } else {
        // Create new record
        const { data: newRecord, error } = await supabase
          .from("medical_records")
          .insert(recordData)
          .select("id")
          .single()

        if (error) throw error
        if (newRecord) {
          setRecordId(newRecord.id)
        }
      }

      setLastSaved(new Date())
      setHasUnsavedChanges(false)

      if (!isAutoSave) {
        toast.success(isSpanish ? "Ficha guardada" : "Record saved", {
          icon: <Save className="h-4 w-4" />,
        })
      }
    } catch (error) {
      console.error("Error saving record:", error)
      if (!isAutoSave) {
        toast.error(isSpanish ? "Error al guardar" : "Error saving")
      }
    } finally {
      setIsSaving(false)
    }
  }, [appointment, appointmentId, anamnesis, examination, diagnosis, diagnosisCode, treatment, privateNotes, vitalSigns, recordId, supabase, isSpanish])

  const handleSign = async () => {
    if (!recordId) {
      await handleSave(false)
    }
    
    try {
      const { error } = await supabase
        .from("medical_records")
        .update({
          is_draft: false,
          is_signed: true,
          signed_at: new Date().toISOString(),
        })
        .eq("id", recordId)

      if (error) throw error

      toast.success(
        isSpanish 
          ? "Ficha firmada y finalizada" 
          : "Record signed and finalized",
        { icon: <FileCheck className="h-4 w-4" /> }
      )

      // Update appointment status to completed
      await supabase
        .from("appointments")
        .update({ status: "completed" })
        .eq("id", appointmentId)

      router.push("/dashboard/professional/appointments")
    } catch (error) {
      console.error("Error signing record:", error)
      toast.error(isSpanish ? "Error al firmar" : "Error signing")
    }
  }

  const selectDiagnosis = (code: string, label: string) => {
    setDiagnosisCode(code)
    setDiagnosis(label)
    setIcdOpen(false)
  }

  const filteredCodes = ICD10_CODES.filter(
    (item) =>
      item.code.toLowerCase().includes(icdSearch.toLowerCase()) ||
      item.label.toLowerCase().includes(icdSearch.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
            <Skeleton className="h-[600px]" />
            <Skeleton className="h-[600px]" />
          </div>
        </div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {isSpanish ? "Cita no encontrada" : "Appointment not found"}
            </h2>
            <Button onClick={() => router.push("/dashboard/professional/appointments")}>
              {isSpanish ? "Volver a Agenda" : "Back to Schedule"}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      {/* Floating Video Call Button */}
      <VideoCallButton 
        appointmentId={appointmentId}
        isOnline={appointment.type === "online"}
        isSpanish={isSpanish}
      />

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => router.push("/dashboard/professional/appointments")}
                className="shrink-0"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-teal-500/20">
                  <AvatarImage src={appointment.patient.avatar_url} />
                  <AvatarFallback className="bg-teal-100 text-teal-700">
                    {appointment.patient.first_name?.[0]}{appointment.patient.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-semibold text-slate-900 dark:text-white">
                    {appointment.patient.first_name} {appointment.patient.last_name}
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(parseISO(appointment.appointment_date), "d MMM yyyy", { locale })} • {appointment.appointment_time.slice(0, 5)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Save status indicator */}
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{isSpanish ? "Guardando..." : "Saving..."}</span>
                  </>
                ) : hasUnsavedChanges ? (
                  <>
                    <CloudOff className="h-4 w-4 text-amber-500" />
                    <span className="text-amber-600 dark:text-amber-400">
                      {isSpanish ? "Sin guardar" : "Unsaved"}
                    </span>
                  </>
                ) : lastSaved ? (
                  <>
                    <Cloud className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {isSpanish ? "Guardado" : "Saved"} {formatDistanceToNow(lastSaved, { addSuffix: true, locale })}
                    </span>
                  </>
                ) : null}
              </div>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSpanish ? "Guardar" : "Save"}
              </Button>

              <PrescriptionDrawer
                isOpen={prescriptionOpen}
                onOpenChange={setPrescriptionOpen}
                items={prescriptionItems}
                onItemsChange={setPrescriptionItems}
                patientName={`${appointment.patient.first_name} ${appointment.patient.last_name}`}
                appointmentId={appointmentId}
                isSpanish={isSpanish}
              />

              <Button 
                variant="outline"
                className="gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                onClick={() => setReferralOpen(true)}
              >
                <LinkIcon className="h-4 w-4" />
                {isSpanish ? "Derivar Paciente" : "Refer Patient"}
              </Button>

              <Button 
                onClick={handleSign}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <FileCheck className="h-4 w-4" />
                {isSpanish ? "Firmar y Finalizar" : "Sign & Finalize"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ReferralModal
        isOpen={referralOpen}
        onOpenChange={setReferralOpen}
        patientId={appointment.patient.id}
        appointmentId={appointmentId}
        isSpanish={isSpanish}
      />

      {/* Main Content - Dual Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          
          {/* Left Column - Patient History (30%) */}
          <div className="space-y-4">
            {/* Patient Info Card */}
            <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <User className="h-4 w-4 text-teal-600" />
                  {isSpanish ? "Información del Paciente" : "Patient Information"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{appointment.patient.email}</span>
                </div>
                {appointment.patient.phone && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Phone className="h-4 w-4" />
                    <span>{appointment.patient.phone}</span>
                  </div>
                )}
                {appointment.patient.date_of_birth && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(parseISO(appointment.patient.date_of_birth), "d MMM yyyy", { locale })}
                    </span>
                  </div>
                )}
                <Badge 
                  variant="outline" 
                  className={cn(
                    "mt-2",
                    appointment.type === "online" 
                      ? "border-teal-500/30 text-teal-700 bg-teal-50 dark:bg-teal-950/30" 
                      : "border-amber-500/30 text-amber-700 bg-amber-50 dark:bg-amber-950/30"
                  )}
                >
                  {appointment.type === "online" ? (
                    <><Video className="h-3 w-3 mr-1" /> Telemedicina</>
                  ) : (
                    <><User className="h-3 w-3 mr-1" /> Presencial</>
                  )}
                </Badge>
              </CardContent>
            </Card>

            {/* Active Referral Section (if any) */}
            {activeReferral && (
              <Card className="border-indigo-200/60 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <LinkIcon className="h-24 w-24" />
                </div>
                <CardHeader className="pb-3 border-b border-indigo-100 dark:border-indigo-800/50">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                    <LinkIcon className="h-4 w-4" />
                    📄 Antecedentes de Derivación
                  </CardTitle>
                  <CardDescription className="text-xs text-indigo-600/70 dark:text-indigo-400/70">
                    Dr/a. {activeReferral.referring_doctor}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-3 relative z-10 text-sm">
                  <div>
                    <span className="font-semibold text-indigo-900 dark:text-indigo-200">Motivo: </span>
                    <span className="text-indigo-800 dark:text-indigo-300">{activeReferral.reason}</span>
                  </div>
                  {activeReferral.original_record ? (
                    <div className="space-y-2 mt-2 bg-white/60 dark:bg-slate-900/60 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Notas Clínicas Adjuntas</p>
                      {activeReferral.original_record.reason_for_visit && (
                        <div>
                          <span className="font-medium text-slate-700 dark:text-slate-300">Anamnesis: </span>
                          <span className="text-slate-600 dark:text-slate-400">{activeReferral.original_record.reason_for_visit}</span>
                        </div>
                      )}
                      {activeReferral.original_record.chief_complaint && (
                        <div>
                          <span className="font-medium text-slate-700 dark:text-slate-300">Examen: </span>
                          <span className="text-slate-600 dark:text-slate-400">{activeReferral.original_record.chief_complaint}</span>
                        </div>
                      )}
                      {activeReferral.original_record.diagnosis && (
                        <div>
                          <span className="font-medium text-slate-700 dark:text-slate-300">Diagnóstico: </span>
                          <span className="text-slate-600 dark:text-slate-400">{activeReferral.original_record.diagnosis}</span>
                        </div>
                      )}
                      {activeReferral.original_record.treatment && (
                        <div>
                          <span className="font-medium text-slate-700 dark:text-slate-300">Tratamiento: </span>
                          <span className="text-slate-600 dark:text-slate-400">{activeReferral.original_record.treatment}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs italic text-indigo-600/70 dark:text-indigo-400/70">
                      No se adjuntaron notas clínicas adicionales.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* History Timeline */}
            <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <ClipboardList className="h-4 w-4 text-teal-600" />
                  {isSpanish ? "Historial Clínico" : "Medical History"}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isSpanish ? "Consultas anteriores" : "Previous consultations"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  {history.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                      <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">
                        {isSpanish 
                          ? "Primera consulta con este paciente" 
                          : "First consultation with this patient"}
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700" />
                      
                      <div className="space-y-4">
                        {history.map((record, index) => (
                          <div key={record.id} className="relative pl-6">
                            {/* Timeline dot */}
                            <div className={cn(
                              "absolute left-0 top-1 w-4 h-4 rounded-full border-2 bg-white dark:bg-slate-900",
                              record.is_signed 
                                ? "border-emerald-500" 
                                : "border-amber-500"
                            )} />
                            
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                  {format(parseISO(record.created_at), "d MMM yyyy", { locale })}
                                </span>
                                {record.is_signed && (
                                  <Badge variant="outline" className="text-[10px] h-5 border-emerald-500/30 text-emerald-600">
                                    <Check className="h-2.5 w-2.5 mr-0.5" />
                                    {isSpanish ? "Firmada" : "Signed"}
                                  </Badge>
                                )}
                              </div>
                              {record.diagnosis_code && (
                                <Badge variant="secondary" className="text-[10px] mb-1">
                                  {record.diagnosis_code}
                                </Badge>
                              )}
                              <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                                {record.diagnosis || record.reason_for_visit || (isSpanish ? "Sin diagnóstico" : "No diagnosis")}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Consultation Form (70%) */}
          <div className="space-y-6">
            
            {/* Vital Signs (Collapsible) */}
            <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <Activity className="h-5 w-5 text-red-500" />
                  {isSpanish ? "Signos Vitales" : "Vital Signs"}
                  <span className="text-xs font-normal text-slate-400 ml-2">(opcional)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500 flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      PA (mmHg)
                    </Label>
                    <Input
                      value={vitalSigns.blood_pressure}
                      onChange={(e) => setVitalSigns({ ...vitalSigns, blood_pressure: e.target.value })}
                      placeholder="120/80"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500 flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      FC (lpm)
                    </Label>
                    <Input
                      value={vitalSigns.heart_rate}
                      onChange={(e) => setVitalSigns({ ...vitalSigns, heart_rate: e.target.value })}
                      placeholder="72"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500 flex items-center gap-1">
                      <Thermometer className="h-3 w-3" />
                      Temp (°C)
                    </Label>
                    <Input
                      value={vitalSigns.temperature}
                      onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: e.target.value })}
                      placeholder="36.5"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500">Peso (kg)</Label>
                    <Input
                      value={vitalSigns.weight}
                      onChange={(e) => setVitalSigns({ ...vitalSigns, weight: e.target.value })}
                      placeholder="70"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500">Altura (cm)</Label>
                    <Input
                      value={vitalSigns.height}
                      onChange={(e) => setVitalSigns({ ...vitalSigns, height: e.target.value })}
                      placeholder="175"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Anamnesis */}
            <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <Stethoscope className="h-5 w-5 text-teal-600" />
                  {isSpanish ? "Anamnesis / Motivo de Consulta" : "Chief Complaint / History"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={anamnesis}
                  onChange={(e) => setAnamnesis(e.target.value)}
                  placeholder={isSpanish 
                    ? "Describa el motivo de la consulta y la historia de la enfermedad actual..." 
                    : "Describe the reason for the visit and history of present illness..."}
                  className="min-h-[120px] resize-none text-sm leading-relaxed"
                />
              </CardContent>
            </Card>

            {/* Physical Examination */}
            <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <Eye className="h-5 w-5 text-blue-600" />
                  {isSpanish ? "Examen Físico / Observaciones" : "Physical Examination / Observations"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={examination}
                  onChange={(e) => setExamination(e.target.value)}
                  placeholder={isSpanish 
                    ? "Hallazgos del examen físico, estado mental, aspecto general..." 
                    : "Physical exam findings, mental status, general appearance..."}
                  className="min-h-[120px] resize-none text-sm leading-relaxed"
                />
              </CardContent>
            </Card>

            {/* Diagnosis */}
            <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <Brain className="h-5 w-5 text-purple-600" />
                  {isSpanish ? "Diagnóstico" : "Diagnosis"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* ICD-10 Combobox */}
                <div className="space-y-2">
                  <Label className="text-sm text-slate-600 dark:text-slate-400">
                    {isSpanish ? "Código CIE-10" : "ICD-10 Code"}
                  </Label>
                  <Popover open={icdOpen} onOpenChange={setIcdOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={icdOpen}
                        className="w-full justify-between h-10 font-normal"
                      >
                        {diagnosisCode ? (
                          <span className="flex items-center gap-2">
                            <Badge variant="secondary" className="font-mono">{diagnosisCode}</Badge>
                            <span className="truncate text-slate-600 dark:text-slate-400">{diagnosis}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            {isSpanish ? "Buscar diagnóstico CIE-10..." : "Search ICD-10 diagnosis..."}
                          </span>
                        )}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput 
                          placeholder={isSpanish ? "Buscar por código o nombre..." : "Search by code or name..."}
                          value={icdSearch}
                          onValueChange={setIcdSearch}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {isSpanish ? "No se encontraron resultados." : "No results found."}
                          </CommandEmpty>
                          <CommandGroup>
                            {filteredCodes.map((item) => (
                              <CommandItem
                                key={item.code}
                                value={`${item.code} ${item.label}`}
                                onSelect={() => selectDiagnosis(item.code, item.label)}
                                className="flex items-center gap-2"
                              >
                                <Badge variant="outline" className="font-mono text-xs">
                                  {item.code}
                                </Badge>
                                <span className="text-sm">{item.label}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Custom diagnosis text */}
                <div className="space-y-2">
                  <Label className="text-sm text-slate-600 dark:text-slate-400">
                    {isSpanish ? "Diagnóstico descriptivo" : "Descriptive diagnosis"}
                  </Label>
                  <Textarea
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder={isSpanish 
                      ? "Detalle adicional del diagnóstico..." 
                      : "Additional diagnostic details..."}
                    className="min-h-[80px] resize-none text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Treatment Plan */}
            <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <Pill className="h-5 w-5 text-emerald-600" />
                    {isSpanish ? "Plan de Tratamiento" : "Treatment Plan"}
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPrescriptionOpen(true)}
                    className="gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                  >
                    <Plus className="h-4 w-4" />
                    {isSpanish ? "Crear Receta" : "Create Prescription"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder={isSpanish 
                    ? "Indicaciones terapéuticas, medicamentos, seguimiento..." 
                    : "Therapeutic recommendations, medications, follow-up..."}
                  className="min-h-[120px] resize-none text-sm leading-relaxed"
                />
              </CardContent>
            </Card>

            {/* Private Notes */}
            <Card className="border-amber-200/60 dark:border-amber-800/30 bg-amber-50/30 dark:bg-amber-950/10 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <FileText className="h-5 w-5 text-amber-600" />
                  {isSpanish ? "Notas Privadas" : "Private Notes"}
                  <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-600 ml-2">
                    {isSpanish ? "No visible para el paciente" : "Not visible to patient"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={privateNotes}
                  onChange={(e) => setPrivateNotes(e.target.value)}
                  placeholder={isSpanish 
                    ? "Observaciones clínicas privadas, impresiones, notas de seguimiento..." 
                    : "Private clinical observations, impressions, follow-up notes..."}
                  className="min-h-[100px] resize-none text-sm leading-relaxed bg-white/50 dark:bg-slate-900/50"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
