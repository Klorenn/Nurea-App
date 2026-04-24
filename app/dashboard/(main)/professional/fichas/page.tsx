"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Plus,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  MoreHorizontal,
  ArrowRight,
  History,
  BrainCircuit,
  ClipboardCheck,
  Zap,
  User,
  Calendar,
  ChevronRight,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { format, isToday } from "date-fns"
import { es, enUS } from "date-fns/locale"
import { toast } from "sonner"

// --- Types ---
interface PatientRecord {
  id: string
  patient_id: string
  appointment_id: string | null
  created_at: string
  reason_for_visit: string
  diagnosis: string | null
  is_signed: boolean
  is_draft: boolean
  patient: {
    first_name: string
    last_name: string
    avatar_url?: string
  }
}

export default function ClinicalRecordsDashboard() {
  const { language } = useLanguage()
  const { user } = useAuth()
  const router = useRouter()
  const isSpanish = language === "es"
  const supabase = createClient()
  const locale = isSpanish ? es : enUS

  // --- State ---
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [records, setRecords] = useState<PatientRecord[]>([])
  const [kpis, setKpis] = useState({
    total: 0,
    pending: 0,
    today: 0,
    critical: 0
  })

  // --- Fetch Data ---
  const loadRecords = useCallback(async () => {
    if (!user?.id) return
    
    setLoadError(false)
    setLoading(true)
    try {
      // 1. Fetch Records with Patient details
      const { data, error } = await supabase
        .from("medical_records")
        .select(`
          id,
          patient_id,
          appointment_id,
          created_at,
          reason_for_visit,
          diagnosis,
          is_signed,
          is_draft,
          patient:profiles!medical_records_patient_id_fkey (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq("professional_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      
      const mappedRecords = (data || []).map((r: any) => ({
        ...r,
        patient: r.patient || { first_name: "Paciente", last_name: "Desconocido" }
      })) as PatientRecord[]

      setRecords(mappedRecords)

      // 2. Calculate KPIs
      const todayTotal = mappedRecords.filter(r => isToday(new Date(r.created_at))).length
      const pendingTotal = mappedRecords.filter(r => !r.is_signed).length
      
      setKpis({
        total: mappedRecords.length,
        pending: pendingTotal,
        today: todayTotal,
        critical: mappedRecords.filter(r => r.is_draft).length // Using is_draft as a proxy for now or could be a real field
      })

    } catch (error) {
      console.error("Error loading clinical records:", error)
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [user?.id, supabase])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  // --- Derived Data (Search) ---
  const filteredRecords = useMemo(() => {
    if (!searchTerm) return records
    const term = searchTerm.toLowerCase()
    return records.filter(r => 
      `${r.patient.first_name} ${r.patient.last_name}`.toLowerCase().includes(term) || 
      (r.reason_for_visit && r.reason_for_visit.toLowerCase().includes(term))
    )
  }, [searchTerm, records])

  const handleSignRecord = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from("medical_records")
        .update({ is_signed: true, is_draft: false })
        .eq("id", recordId)
        .eq("professional_id", user!.id)

      if (error) throw error

      setRecords((prev) =>
        prev.map((r) => r.id === recordId ? { ...r, is_signed: true, is_draft: false } : r)
      )
      setKpis((prev) => ({ ...prev, pending: Math.max(0, prev.pending - 1) }))
      toast.success(isSpanish ? "Ficha firmada correctamente." : "Record signed successfully.")
    } catch (err) {
      console.error("Error signing record:", err)
      toast.error(isSpanish ? "No se pudo firmar la ficha." : "Could not sign the record.")
    }
  }

  const getRecordUrl = (record: PatientRecord) => {
    if (record.appointment_id) {
      return `/dashboard/professional/consultation/${record.appointment_id}`
    }
    return `/dashboard/professional/fichas/${record.id}`
  }

  const handleReviewDrafts = () => {
    const firstDraft = records.find(r => r.is_draft)
    if (!firstDraft) {
      toast.info(isSpanish
        ? "No tienes borradores pendientes."
        : "No pending drafts."
      )
      return
    }
    router.push(getRecordUrl(firstDraft))
  }

  // --- Components ---
  const KPICard = ({ title, value, icon: Icon, color }: any) => (
    <Card className="border-border/40 bg-white dark:bg-slate-900 shadow-sm rounded-2xl">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn("p-2.5 rounded-xl shrink-0", color)}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5">{title}</p>
          <div className="text-xl font-bold text-foreground">
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-slate-300" /> : value}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (!user) return null

  if (loadError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center p-10">
        <div className="rounded-full bg-red-100 dark:bg-red-950/40 p-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            {isSpanish ? "Error al cargar las fichas" : "Error loading clinical records"}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {isSpanish ? "Verifica tu conexión e inténtalo de nuevo." : "Check your connection and try again."}
          </p>
        </div>
        <Button variant="outline" onClick={() => { setLoadError(false); loadRecords() }}>
          {isSpanish ? "Reintentar" : "Retry"}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">

      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isSpanish ? "Fichas Clínicas" : "Clinical Records"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isSpanish ? "Historial de atenciones y borradores" : "Visit history and drafts"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadRecords()}
            className="h-9 rounded-xl border-border/60"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <History className="h-4 w-4" />}
          </Button>
          <Button
            size="sm"
            className="h-9 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm gap-2 font-medium"
            onClick={() => router.push("/dashboard/professional/appointments")}
          >
            <Plus className="h-4 w-4" />
            {isSpanish ? "Nueva Ficha" : "New Record"}
          </Button>
        </div>
      </div>

      {/* --- KPI Grid --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title={isSpanish ? "Fichas Totales" : "Total Records"} 
          value={kpis.total.toLocaleString()} 
          icon={FileText} 
          color="bg-blue-500/10 text-blue-600" 
        />
        <KPICard 
          title={isSpanish ? "Pendientes Firma" : "Pending Signature"} 
          value={kpis.pending} 
          icon={Clock} 
          color="bg-amber-500/10 text-amber-600" 
        />
        <KPICard 
          title={isSpanish ? "Atenciones Hoy" : "Today's Consults"} 
          value={kpis.today} 
          icon={Calendar} 
          color="bg-teal-500/10 text-teal-600" 
        />
        <KPICard 
          title={isSpanish ? "Borradores" : "Drafts"} 
          value={kpis.critical} 
          icon={BrainCircuit} 
          color="bg-slate-500/10 text-slate-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* --- Main Content: Patient Table --- */}
        <div className="lg:col-span-8">
          <Card className="border-border/40 bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="p-4 pb-3 border-b border-border/40">
              <div className="flex gap-3 justify-between items-center">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={isSpanish ? "Buscar paciente o diagnóstico..." : "Search patient or diagnosis..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 bg-muted/30 border-border/60 rounded-xl text-sm"
                  />
                </div>
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-border/60 shrink-0">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/40 bg-muted/20">
                      <th className="px-5 py-3 text-xs font-medium text-muted-foreground">{isSpanish ? "Paciente" : "Patient"}</th>
                      <th className="px-5 py-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">{isSpanish ? "Fecha" : "Date"}</th>
                      <th className="px-5 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">{isSpanish ? "Motivo" : "Reason"}</th>
                      <th className="px-5 py-3 text-xs font-medium text-muted-foreground">{isSpanish ? "Estado" : "Status"}</th>
                      <th className="px-5 py-3 text-xs font-medium text-muted-foreground text-right">{isSpanish ? "Acciones" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    <AnimatePresence mode="popLayout">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="p-12 text-center">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-teal-600" />
                          </td>
                        </tr>
                      ) : filteredRecords.map((record, i) => (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="group hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <Avatar className="h-8 w-8 rounded-lg shrink-0">
                                <AvatarImage src={record.patient.avatar_url} />
                                <AvatarFallback className="bg-teal-50 dark:bg-teal-950/30 text-teal-600 text-xs font-semibold rounded-lg">
                                  {record.patient.first_name?.[0]}{record.patient.last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {record.patient.first_name} {record.patient.last_name}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 hidden sm:table-cell">
                            <div>
                              <p className="text-sm text-foreground">{format(new Date(record.created_at), "dd MMM, yyyy", { locale })}</p>
                              <p className="text-xs text-muted-foreground">{format(new Date(record.created_at), "HH:mm")}</p>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 hidden md:table-cell">
                            <p className="text-sm text-muted-foreground max-w-[180px] truncate">
                              {record.reason_for_visit || record.diagnosis || (isSpanish ? "Sin especificar" : "Not specified")}
                            </p>
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs font-medium border-none px-2 py-0.5 rounded-md",
                                record.is_signed ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" :
                                record.is_draft ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400" :
                                "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
                              )}
                            >
                              {isSpanish ? (
                                record.is_signed ? 'Firmado' : record.is_draft ? 'Borrador' : 'Pendiente'
                              ) : (
                                record.is_signed ? 'Signed' : record.is_draft ? 'Draft' : 'Pending'
                              )}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 rounded-lg text-xs font-medium text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/30"
                                onClick={() => router.push(getRecordUrl(record))}
                              >
                                {record.is_draft ? (isSpanish ? 'Continuar' : 'Continue') : (isSpanish ? 'Ver' : 'View')}
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl w-44">
                                  <DropdownMenuItem
                                    className="rounded-lg gap-2 text-sm cursor-pointer"
                                    onClick={() => router.push(getRecordUrl(record))}
                                  >
                                    <History className="h-4 w-4" /> {isSpanish ? 'Ver ficha' : 'View record'}
                                  </DropdownMenuItem>
                                  {!record.is_signed && (
                                    <DropdownMenuItem
                                      className="rounded-lg gap-2 text-sm cursor-pointer"
                                      onClick={() => handleSignRecord(record.id)}
                                    >
                                      <ClipboardCheck className="h-4 w-4" /> {isSpanish ? 'Firmar' : 'Sign'}
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
                {filteredRecords.length === 0 && !loading && (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                      <Search className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">{isSpanish ? 'Sin resultados' : 'No records found'}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {isSpanish ? 'Las fichas se crean durante las consultas.' : 'Records are created during consultations.'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- Sidebar --- */}
        <aside className="lg:col-span-4 space-y-4">
          {/* Borradores pendientes */}
          <Card className="border-border/40 bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="p-4 pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                {isSpanish ? "Borradores pendientes" : "Pending drafts"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {records.filter(r => r.is_draft).slice(0, 4).length > 0 ? (
                records.filter(r => r.is_draft).slice(0, 4).map((note, i) => (
                  <button
                    key={i}
                    onClick={() => router.push(getRecordUrl(note))}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-7 w-7 rounded-lg">
                        <AvatarImage src={note.patient.avatar_url} />
                        <AvatarFallback className="bg-teal-50 text-teal-600 text-xs rounded-lg">{note.patient.first_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          {note.patient.first_name} {note.patient.last_name?.[0]}.
                        </p>
                        <p className="text-xs text-muted-foreground">{format(new Date(note.created_at), "HH:mm · dd MMM")}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                  </button>
                ))
              ) : (
                <div className="py-6 text-center">
                  <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-medium text-muted-foreground">
                    {isSpanish ? "Sin borradores pendientes" : "No pending drafts"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nura AI */}
          <Card className="border-teal-200/60 dark:border-teal-800/40 bg-teal-50/50 dark:bg-teal-950/10 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-600 shrink-0">
                  <BrainCircuit className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-teal-600 dark:text-teal-400">Nura AI</p>
                  <p className="text-sm font-semibold text-foreground">
                    {isSpanish ? "Asistente clínico" : "Clinical assistant"}
                  </p>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground mb-3">
                {kpis.pending > 0
                  ? (isSpanish
                      ? `Tienes ${kpis.pending} ficha${kpis.pending !== 1 ? 's' : ''} sin firmar. Revísalas y fírmalas para completar la atención de tus pacientes.`
                      : `You have ${kpis.pending} unsigned record${kpis.pending !== 1 ? 's' : ''}. Review and sign them to complete patient care.`)
                  : (isSpanish
                      ? "Todas tus fichas están al día. Nura te ayuda a redactar notas clínicas durante las consultas."
                      : "All your records are up to date. Nura helps you draft clinical notes during consultations.")}
              </p>
              {kpis.pending > 0 && (
                <Button
                  size="sm"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-lg h-8 text-xs font-medium gap-1.5"
                  onClick={handleReviewDrafts}
                >
                  <Zap className="h-3.5 w-3.5" />
                  {isSpanish ? `Revisar pendientes (${kpis.pending})` : `Review pending (${kpis.pending})`}
                </Button>
              )}
              {kpis.pending === 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full rounded-lg h-8 text-xs font-medium border-teal-200 text-teal-600 hover:bg-teal-50 dark:border-teal-800 dark:hover:bg-teal-950/30"
                  onClick={() => router.push("/dashboard/professional/appointments")}
                >
                  {isSpanish ? "Ver consultas programadas" : "View scheduled consultations"}
                </Button>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>

    </div>
  )
}
