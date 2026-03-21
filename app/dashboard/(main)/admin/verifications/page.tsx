"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShieldCheck,
  Search,
  XCircle,
  FileText,
  ExternalLink,
  Clock,
  RefreshCcw,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { RouteGuard } from "@/components/auth/route-guard"

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/verifications")
      const data = await response.json()
      setVerifications(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error loading verifications:", err)
      toast.error("Error al cargar la cola de verificación")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleUpdateStatus = async (id: string, name: string, status: 'verified' | 'rejected') => {
    setProcessingId(id)
    try {
      const response = await fetch("/api/admin/verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          professionalId: id,
          status,
          notes: status === 'verified' ? "Aprobado manualmente por admin" : "Documentación insuficiente o incorrecta"
        })
      })

      if (response.ok) {
        toast.success(`${name} ha sido ${status === 'verified' ? 'verificado' : 'rechazado'}`)
        setVerifications(prev => prev.filter(v => v.id !== id))
      } else {
        throw new Error("Failed to update")
      }
    } catch {
      toast.error("Error al actualizar estado")
    } finally {
      setProcessingId(null)
    }
  }

  const filteredData = verifications.filter(v => 
    `${v.first_name} ${v.last_name}`.toLowerCase().includes(filter.toLowerCase()) ||
    v.email?.toLowerCase().includes(filter.toLowerCase()) ||
    v.professional_license_number?.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <RouteGuard requiredRole="admin">
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-violet-600" />
            Cola de Verificación (KYP)
          </h1>
          <p className="text-slate-500 font-medium">Validación de credenciales médicas y RNPI</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadData} className="rounded-xl border-slate-200">
            <RefreshCcw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Actualizar
          </Button>
          <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 border-none rounded-lg px-3 py-1.5 font-bold">
            {verifications.length} Pendientes
          </Badge>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 gap-6">
        <StatCard
          title="Nuevas Solicitudes"
          value={verifications.length.toString()}
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Main Filter & Table */}
      <Card className="border-slate-200/60 shadow-xl shadow-slate-200/20 rounded-3xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar por nombre, email o RNPI..." 
              className="pl-10 h-12 bg-white rounded-xl border-slate-200/60 focus:ring-violet-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading && verifications.length === 0 ? (
            <div className="px-6 py-20 text-center" role="status" aria-live="polite">
              <RefreshCcw className="h-10 w-10 animate-spin text-slate-300 mx-auto mb-4" aria-hidden="true" />
              <p className="text-slate-400 font-medium">Buscando solicitudes...</p>
            </div>
          ) : filteredData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 text-left">
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Especialista</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">RNPI / Institución</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Documento</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Fecha</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence>
                    {filteredData.map((v) => (
                      <motion.tr 
                        key={v.id} 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="hover:bg-slate-50/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${v.last_name}`} />
                              <AvatarFallback className="bg-violet-600 text-white font-bold">{v.first_name?.[0] ?? "?"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-slate-900">{v.first_name} {v.last_name}</p>
                              <p className="text-xs text-slate-500">{v.email}</p>
                              <Badge variant="secondary" className="text-[10px] p-0 font-bold text-violet-600 uppercase bg-transparent">
                                {v.specialty}
                              </Badge>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none rounded-md font-mono text-xs">
                                {v.professional_license_number || "NO PROVISTO"}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium">{v.license_issuing_institution || "Reg. Nacional de Salud"}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {v.verification_document_url ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-xl gap-2 font-bold text-xs"
                              asChild
                            >
                              <a href={v.verification_document_url} target="_blank" rel="noopener noreferrer">
                                <FileText className="h-4 w-4" />
                                Ver PDF
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Sin archivo</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-500">
                          {new Date(v.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (v.professional_license_number) {
                                  navigator.clipboard.writeText(v.professional_license_number);
                                  toast.success(`RNPI copiado: ${v.professional_license_number}`);
                                } else {
                                  toast.error('Sin RNPI para copiar');
                                }
                                window.open("https://rnpi.superdesalud.gob.cl/", "_blank");
                              }}
                              className="rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 font-bold text-[10px] uppercase tracking-wider"
                              title="Copiar RNPI y abrir portal SIS"
                            >
                              <Search className="h-4 w-4 mr-1" />
                              Validar SIS
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUpdateStatus(v.id, `${v.first_name} ${v.last_name}`, 'rejected')}
                              disabled={processingId === v.id}
                              aria-label={`Rechazar a ${v.first_name} ${v.last_name}`}
                              className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <XCircle className="h-5 w-5" aria-hidden="true" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(v.id, `${v.first_name} ${v.last_name}`, 'verified')}
                              disabled={processingId === v.id}
                              aria-label={`Verificar a ${v.first_name} ${v.last_name}`}
                              className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20 px-4 font-black uppercase tracking-wider text-[10px]"
                            >
                              {processingId === v.id ? <RefreshCcw className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Verificar"}
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-20 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-slate-900 font-black uppercase tracking-tighter">Todo en orden</h3>
              <p className="text-slate-400 text-sm mt-1">No hay solicitudes pendientes de verificación.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </RouteGuard>
  )
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colors: any = {
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    blue: "text-blue-600 bg-blue-50 border-blue-100"
  }

  return (
    <Card className="border-slate-200/60 shadow-lg rounded-2xl">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={cn("p-3 rounded-2xl", colors[color])}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{title}</p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{value}</h3>
        </div>
      </CardContent>
    </Card>
  )
}
