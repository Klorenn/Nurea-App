"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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
import { useAuth } from "@/hooks/use-auth"

// --- Types ---
interface PatientRecord {
  id: string
  patient_id: string
  created_at: string
  reason_for_visit: string
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
  const isSpanish = language === "es"
  const supabase = createClient()
  const locale = isSpanish ? es : enUS

  // --- State ---
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
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
    
    setLoading(true)
    try {
      // 1. Fetch Records with Patient details
      const { data, error } = await supabase
        .from("medical_records")
        .select(`
          id,
          patient_id,
          created_at,
          reason_for_visit,
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

  const handleReviewDrafts = () => {
    if (kpis.critical === 0) {
      toast.info(isSpanish 
        ? "No tienes borradores pendientes por revisar en este momento." 
        : "You don't have pending drafts to review at this moment."
      )
      return
    }
    // Logic to open drafts list or first draft
    toast.success(isSpanish 
      ? `Abriendo ${kpis.critical} borradores...` 
      : `Opening ${kpis.critical} drafts...`
    )
  }

  // --- Components ---
  const KPICard = ({ title, value, icon: Icon, color }: any) => (
    <Card className="border-none bg-white dark:bg-slate-900 shadow-sm overflow-hidden group">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={cn("p-3 rounded-2xl shadow-inner transition-colors", color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-0.5">{title}</p>
          <div className="text-2xl font-black tracking-tighter text-foreground/90">
            {loading ? <Loader2 className="h-6 w-6 animate-spin text-slate-300" /> : value}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto font-sans">
      
      {/* --- Header area --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {isSpanish ? "Gestión de Historias Clínicas" : "Clinical History Management"}
          </h1>
          <p className="text-slate-500 font-medium">
            {isSpanish ? "Panel centralizado de fichas y borradores" : "Centralized dashboard for records and drafts"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => loadRecords()} 
            className="h-12 px-4 rounded-2xl border-slate-200"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <History className="h-4 w-4" />}
          </Button>
          <Button className="h-12 px-6 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl shadow-xl shadow-teal-500/20 transition-all font-bold gap-2">
            <Plus className="h-5 w-5" />
            {isSpanish ? "Nueva Ficha Clínica" : "New Clinical Record"}
          </Button>
        </div>
      </header>

      {/* --- KPI Grid --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* --- Main Content: Patient Table --- */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none bg-white dark:bg-slate-900 shadow-sm rounded-[2rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder={isSpanish ? "Buscar por nombre, RUT o diagnóstico..." : "Search by name, ID or diagnosis..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-none rounded-xl"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">{isSpanish ? "Paciente" : "Patient"}</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">{isSpanish ? "Última Atención" : "Last Visit"}</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">{isSpanish ? "Motivo" : "Reason"}</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">{isSpanish ? "Estado" : "Status"}</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">{isSpanish ? "Acciones" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    <AnimatePresence mode="popLayout">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="p-20 text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-600" />
                          </td>
                        </tr>
                      ) : filteredRecords.map((record, i) => (
                        <motion.tr 
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 rounded-xl border border-white dark:border-slate-800 shadow-sm">
                                <AvatarImage src={record.patient.avatar_url} />
                                <AvatarFallback className="bg-teal-500/10 text-teal-600 font-bold">
                                  {record.patient.first_name?.[0]}{record.patient.last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-slate-100">
                                  {record.patient.first_name} {record.patient.last_name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                {format(new Date(record.created_at), "dd MMM, yyyy", { locale })}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {format(new Date(record.created_at), "HH:mm")}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-sm font-medium text-slate-600 dark:text-slate-400 max-w-[200px] truncate">
                            {record.reason_for_visit || (isSpanish ? "Sin motivo" : "No reason")}
                          </td>
                          <td className="px-8 py-5">
                             <Badge 
                              variant="outline" 
                              className={cn(
                                "rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tight border-none",
                                record.is_signed ? "bg-emerald-500/10 text-emerald-600" :
                                record.is_draft ? "bg-blue-500/10 text-blue-600" :
                                "bg-amber-500/10 text-amber-600"
                              )}
                             >
                               {isSpanish ? (
                                 record.is_signed ? 'Firmado' :
                                 record.is_draft ? 'Borrador' : 'Pendiente'
                               ) : (
                                 record.is_signed ? 'Signed' :
                                 record.is_draft ? 'Draft' : 'Pending'
                               )}
                             </Badge>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                               <Button variant="ghost" size="sm" className="h-9 px-3 rounded-xl font-bold text-teal-600 hover:bg-teal-50 gap-2">
                                 {record.is_draft ? (isSpanish ? 'Continuar' : 'Continue') : (isSpanish ? 'Ver' : 'View')}
                               </Button>
                               <DropdownMenu>
                                 <DropdownMenuTrigger asChild>
                                   <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                                     <MoreHorizontal className="h-4 w-4" />
                                   </Button>
                                 </DropdownMenuTrigger>
                                 <DropdownMenuContent align="end" className="rounded-xl p-2 w-48 shadow-xl">
                                   <DropdownMenuItem className="rounded-lg gap-2 font-medium cursor-pointer">
                                     <History className="h-4 w-4" /> {isSpanish ? 'Ver Historial' : 'View History'}
                                   </DropdownMenuItem>
                                   {!record.is_signed && (
                                     <DropdownMenuItem className="rounded-lg gap-2 font-medium cursor-pointer">
                                       <ClipboardCheck className="h-4 w-4" /> {isSpanish ? 'Firmar Ficha' : 'Sign Record'}
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
                  <div className="p-20 text-center flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center">
                      <Search className="h-10 w-10 text-slate-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{isSpanish ? 'Sin resultados' : 'No results found'}</h3>
                      <p className="text-slate-500 text-sm max-w-sm mx-auto">
                        {isSpanish ? 'No pudimos encontrar registros que coincidan con tu búsqueda.' : 'We couldnt find any records matching your search.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- Sidebar: Pending Notes & AI --- */}
        <aside className="lg:col-span-4 space-y-6">
          <Card className="border-none bg-white dark:bg-slate-900 shadow-sm rounded-[2rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
               <CardTitle className="text-xl font-black flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  {isSpanish ? "Notas por Finalizar" : "Notes to Finalize"}
               </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
              {records.filter(r => r.is_draft).slice(0, 3).length > 0 ? (
                records.filter(r => r.is_draft).slice(0, 3).map((note, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 group hover:ring-1 hover:ring-teal-500/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center font-bold text-slate-400 overflow-hidden">
                        <Avatar className="h-full w-full">
                          <AvatarImage src={note.patient.avatar_url} />
                          <AvatarFallback>{note.patient.first_name?.[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {note.patient.first_name} {note.patient.last_name[0]}.
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase font-black">{format(new Date(note.created_at), "HH:mm")}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-black uppercase text-teal-600">
                      Borrador
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-center text-slate-500 py-4">
                  {isSpanish ? "No hay borradores pendientes" : "No pending drafts"}
                </p>
              )}
              {records.filter(r => r.is_draft).length > 3 && (
                <Button variant="outline" className="w-full text-xs font-black text-teal-600 flex items-center gap-2 group">
                  {isSpanish ? 'Revisar todas las pendientes' : 'Review all pending'}
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Nura AI Integration Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-blue-400/5 to-transparent backdrop-blur-xl rounded-[2.5rem] border border-teal-500/20" />
            <div className="relative p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-600 shadow-inner">
                  <BrainCircuit className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                   <span className="text-[10px] font-black tracking-[0.2em] text-teal-600 dark:text-teal-400 uppercase">
                     Nura AI Assistant
                   </span>
                   <h4 className="font-black text-lg text-slate-900 dark:text-white">Workspace Inteligente</h4>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                  {isSpanish 
                    ? `Nura tiene ${kpis.critical} borradores listos basados en tus dictados de hoy. ¿Deseas revisarlos y firmarlos?`
                    : `Nura has ${kpis.critical} drafts ready based on your dictations today. Would you like to review and sign them?`}
                </p>
                <div className="flex flex-col gap-2">
                  <Button 
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold gap-2"
                    onClick={handleReviewDrafts}
                  >
                    <Zap className="h-4 w-4 fill-current" />
                    {isSpanish ? `Revisar Borradores (${kpis.critical})` : `Review Drafts (${kpis.critical})`}
                  </Button>
                </div>
              </div>
            </div>
            
            <Zap className="absolute -bottom-6 -right-6 h-32 w-32 text-teal-600 opacity-5 rotate-12" />
          </motion.div>
        </aside>
      </div>

    </div>
  )
}
