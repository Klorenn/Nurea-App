"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { 
  ShieldCheck, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  FileText,
  FileSearch, 
  Loader2,
  AlertCircle,
  BadgeCheck,
  Building2,
  Calendar,
  Clock,
  User as UserIcon,
  MessageCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export default function AdminCredentialsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [credentials, setCredentials] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCreds, setFilteredCreds] = useState<any[]>([])
  const [processingId, setProcessingId] = useState<string | null>(null)
  
  // Rejection Modal State
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false)
  const [selectedCred, setSelectedCred] = useState<any>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    async function fetchCredentials() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('professional_credentials')
          .select(`
            *,
            profiles:professional_id (
              id,
              first_name,
              last_name,
              email,
              avatar_url,
              role
            )
          `)
          .order('status', { ascending: false }) // pending first? status order: pending, verified, rejected
          .order('created_at', { ascending: false })

        if (error) throw error
        setCredentials(data || [])
      } catch (err) {
        console.error(err)
        toast.error("Error al cargar credenciales")
      } finally {
        setLoading(false)
      }
    }
    fetchCredentials()
  }, [supabase])

  useEffect(() => {
    const term = searchTerm.toLowerCase()
    setFilteredCreds(
      credentials.filter(c => 
        c.title.toLowerCase().includes(term) || 
        c.institution.toLowerCase().includes(term) ||
        `${c.profiles?.first_name} ${c.profiles?.last_name}`.toLowerCase().includes(term)
      )
    )
  }, [searchTerm, credentials])

  const handleUpdateStatus = async (id: string, status: 'verified' | 'rejected', reason?: string) => {
    setProcessingId(id)
    try {
      const { error } = await supabase
        .from('professional_credentials')
        .update({ 
          status, 
          rejection_reason: reason || null,
          verified_at: status === 'verified' ? new Date().toISOString() : null
        })
        .eq('id', id)

      if (error) throw error
      
      setCredentials(prev => prev.map(c => 
        c.id === id ? { ...c, status, rejection_reason: reason || null } : c
      ))
      
      toast.success(status === 'verified' ? "Credencial aprobada" : "Credencial rechazada")
      if (status === 'rejected') {
        setRejectionModalOpen(false)
        setRejectionReason("")
      }
    } catch (err) {
      console.error(err)
      toast.error("Error al actualizar estado")
    } finally {
      setProcessingId(null)
    }
  }

  const openRejectionModal = (cred: any) => {
    setSelectedCred(cred)
    setRejectionModalOpen(true)
  }

  return (
    <>
      <div className="space-y-8 max-w-[1400px] mx-auto pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-600/20 text-white">
                <BadgeCheck className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Auditoría de Credenciales</h1>
            </div>
            <p className="text-slate-500 font-medium ml-13">Valida los títulos y magísteres declarados por los médicos.</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar por médico o título..." 
              className="pl-10 h-12 rounded-2xl border-slate-200 shadow-sm focus:ring-teal-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/40 bg-white shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden border-l-4 border-l-amber-500">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pendientes</p>
                  <h3 className="text-3xl font-black text-slate-900">
                    {credentials.filter(c => c.status === 'pending').length}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/40 bg-white shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden border-l-4 border-l-emerald-500">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Verificados hoy</p>
                  <h3 className="text-3xl font-black text-slate-900">
                    {credentials.filter(c => c.status === 'verified').length}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <BadgeCheck className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-white shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden border-l-4 border-l-slate-900">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Procesados</p>
                  <h3 className="text-3xl font-black text-slate-900">
                    {credentials.length}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* List */}
        <div className="grid gap-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
              <p className="text-slate-500 font-medium">Cargando solicitudes...</p>
            </div>
          ) : filteredCreds.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-slate-200 shadow-sm">
              <FileSearch className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900">Sin resultados</h3>
              <p className="text-slate-500">No hay credenciales que coincidan con tu búsqueda.</p>
            </div>
          ) : (
            filteredCreds.map((cred) => (
              <motion.div
                key={cred.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "group bg-white rounded-[32px] border border-slate-100 p-6 flex flex-col lg:flex-row items-start lg:items-center gap-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all",
                  cred.status === 'pending' && "border-amber-200 bg-amber-50/10"
                )}
              >
                {/* Doctor Info */}
                <div className="flex items-center gap-4 lg:w-72 shrink-0">
                  <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                    <AvatarImage src={cred.profiles?.avatar_url} />
                    <AvatarFallback className="bg-teal-50 text-teal-700 font-black">
                      {cred.profiles?.first_name?.[0]}{cred.profiles?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-black text-slate-900 truncate leading-tight">
                      {cred.profiles?.first_name} {cred.profiles?.last_name}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <UserIcon className="h-3 w-3" />
                      {cred.profiles?.email}
                    </p>
                  </div>
                </div>

                {/* Credential Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-teal-600 transition-colors">
                      {cred.title}
                    </h3>
                    <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 font-bold px-2 py-0 h-5 text-[10px] uppercase">
                      {cred.type}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                      <Building2 className="h-4 w-4 text-slate-300" />
                      {cred.institution}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                      <Calendar className="h-4 w-4 text-slate-300" />
                      Año: {cred.year}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                      <Clock className="h-4 w-4 text-slate-300" />
                      Enviado: {format(new Date(cred.created_at), "d 'de' MMMM", { locale: es })}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0 lg:ml-auto w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 lg:justify-end">
                  {/* Status Badge */}
                  <div className="flex-1 lg:flex-none">
                    <Badge className={cn(
                      "px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px] h-8 flex items-center justify-center",
                      cred.status === 'verified' ? "bg-emerald-500 text-white" :
                      cred.status === 'rejected' ? "bg-red-500 text-white" : "bg-amber-500 text-white"
                    )}>
                      {cred.status === 'verified' ? '¡Verificado!' : 
                       cred.status === 'rejected' ? 'Rechazado' : '⌛ Pendiente'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-10 rounded-xl border-slate-200 gap-2 font-bold px-4"
                      asChild
                    >
                      <a href={cred.file_url} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4" />
                        Ver PDF
                      </a>
                    </Button>
                    
                    {cred.status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 gap-2"
                          onClick={() => handleUpdateStatus(cred.id, 'verified')}
                          disabled={processingId === cred.id}
                        >
                          {processingId === cred.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                          Aprobar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          className="h-10 rounded-xl font-bold px-4 gap-2"
                          onClick={() => openRejectionModal(cred)}
                          disabled={processingId === cred.id}
                        >
                          <XCircle className="h-4 w-4" />
                          Rechazar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      <Dialog open={rejectionModalOpen} onOpenChange={setRejectionModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[32px] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-red-500" />
              Rechazar Credencial
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Indica al profesional por qué su documento no fue validado. Recibirá una notificación.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
               <p className="text-xs font-bold text-slate-400 uppercase mb-1">Documento:</p>
               <p className="font-bold text-slate-900">{selectedCred?.title}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Motivo del rechazo</label>
              <Textarea 
                placeholder="Ejem: El PDF está borroso o no coincide con los datos ingresados..." 
                className="rounded-2xl min-h-[120px] p-4 resize-none border-slate-200"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-3 sm:justify-end">
            <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setRejectionModalOpen(false)}>Cancelar</Button>
            <Button 
              variant="destructive" 
              className="rounded-xl font-bold px-8 h-11"
              onClick={() => handleUpdateStatus(selectedCred.id, 'rejected', rejectionReason)}
              disabled={!rejectionReason || processingId === selectedCred?.id}
            >
              Confirmar Rechazo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
