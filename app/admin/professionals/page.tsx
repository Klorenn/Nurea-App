"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { RouteGuard } from "@/components/auth/route-guard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserCheck, Search, Loader2, CheckCircle2, XCircle, FileText, Eye } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AdminProfessionalsPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const [professionals, setProfessionals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [verifiedFilter, setVerifiedFilter] = useState<string>("all")
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null)
  const [documents, setDocuments] = useState<any[]>([])

  useEffect(() => {
    loadProfessionals()
  }, [verifiedFilter])

  const loadProfessionals = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (verifiedFilter !== "all") params.append("verified", verifiedFilter)

      const response = await fetch(`/api/admin/professionals?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setProfessionals(data.professionals || [])
      }
    } catch (error) {
      console.error("Error loading professionals:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (professionalId: string, verified: boolean) => {
    try {
      const response = await fetch("/api/admin/professionals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionalId, verified }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "No se pudo actualizar la verificación")
      }

      await loadProfessionals()
      setVerifyDialogOpen(false)
      setSelectedProfessional(null)
    } catch (error) {
      console.error("Error verifying professional:", error)
      alert(error instanceof Error ? error.message : (isSpanish 
        ? "No se pudo actualizar la verificación"
        : "Could not update verification"))
    }
  }

  const loadDocuments = async (professionalId: string) => {
    try {
      // Cargar documentos del profesional (solo metadata, no contenido clínico)
      const response = await fetch(`/api/documents/list?professionalId=${professionalId}`)
      const data = await response.json()

      if (data.success) {
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error("Error loading documents:", error)
      setDocuments([])
    }
  }

  const filteredProfessionals = professionals.filter((prof) => {
    const query = searchQuery.toLowerCase()
    return (
      prof.profile?.first_name?.toLowerCase().includes(query) ||
      prof.profile?.last_name?.toLowerCase().includes(query) ||
      prof.profile?.email?.toLowerCase().includes(query) ||
      prof.specialty?.toLowerCase().includes(query) ||
      prof.license_number?.toLowerCase().includes(query)
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
              <UserCheck className="h-8 w-8 text-primary" />
              {isSpanish ? "Profesionales" : "Professionals"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isSpanish 
                ? "Ver solicitudes de verificación y gestionar profesionales"
                : "View verification requests and manage professionals"}
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isSpanish ? "Buscar profesionales..." : "Search professionals..."}
                className="pl-10 rounded-xl bg-accent/20 border-none h-12"
              />
            </div>
            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger className="w-full sm:w-[200px] rounded-xl">
                <SelectValue placeholder={isSpanish ? "Verificación" : "Verification"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isSpanish ? "Todos" : "All"}</SelectItem>
                <SelectItem value="false">{isSpanish ? "Pendientes" : "Pending"}</SelectItem>
                <SelectItem value="true">{isSpanish ? "Verificados" : "Verified"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Professionals List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Card className="border-border/40">
              <CardContent className="p-0">
                <div className="divide-y divide-border/40">
                  {filteredProfessionals.length === 0 ? (
                    <div className="p-12 text-center">
                      <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">
                        {isSpanish ? "No se encontraron profesionales" : "No professionals found"}
                      </p>
                    </div>
                  ) : (
                    filteredProfessionals.map((prof) => (
                      <div key={prof.id} className="p-6 hover:bg-accent/5 transition-colors">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              {prof.verified ? (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  {isSpanish ? "Verificado" : "Verified"}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  {isSpanish ? "Pendiente" : "Pending"}
                                </Badge>
                              )}
                              {prof.profile?.blocked && (
                                <Badge variant="destructive">
                                  {isSpanish ? "Bloqueado" : "Blocked"}
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-bold text-lg mb-2">
                              {prof.profile?.first_name} {prof.profile?.last_name}
                            </h3>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>
                                <strong className="text-foreground">{isSpanish ? "Email:" : "Email:"}</strong> {prof.profile?.email}
                              </p>
                              <p>
                                <strong className="text-foreground">{isSpanish ? "Especialidad:" : "Specialty:"}</strong> {prof.specialty}
                              </p>
                              {prof.license_number && (
                                <p>
                                  <strong className="text-foreground">{isSpanish ? "Licencia:" : "License:"}</strong> {prof.license_number}
                                </p>
                              )}
                              {prof.experience_years && (
                                <p>
                                  <strong className="text-foreground">{isSpanish ? "Años de experiencia:" : "Years of experience:"}</strong> {prof.experience_years}
                                </p>
                              )}
                              <p className="text-xs mt-2">
                                {isSpanish ? "Registrado:" : "Registered:"} {formatDate(prof.profile?.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedProfessional(prof)
                                loadDocuments(prof.id)
                                setDocumentsDialogOpen(true)
                              }}
                              className="rounded-xl"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {isSpanish ? "Ver Documentos" : "View Documents"}
                            </Button>
                            {prof.verified ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedProfessional(prof)
                                  setVerifyDialogOpen(true)
                                }}
                                className="rounded-xl"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                {isSpanish ? "Rechazar" : "Reject"}
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  setSelectedProfessional(prof)
                                  setVerifyDialogOpen(true)
                                }}
                                className="rounded-xl"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                {isSpanish ? "Aprobar" : "Approve"}
                              </Button>
                            )}
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

        {/* Verify Dialog */}
        <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedProfessional?.verified
                  ? (isSpanish ? "Rechazar Verificación" : "Reject Verification")
                  : (isSpanish ? "Aprobar Verificación" : "Approve Verification")}
              </DialogTitle>
              <DialogDescription>
                {selectedProfessional && (
                  <>
                    {selectedProfessional.verified
                      ? (isSpanish 
                          ? `¿Estás seguro de que quieres rechazar la verificación de ${selectedProfessional.profile?.first_name} ${selectedProfessional.profile?.last_name}?`
                          : `Are you sure you want to reject verification for ${selectedProfessional.profile?.first_name} ${selectedProfessional.profile?.last_name}?`)
                      : (isSpanish
                          ? `¿Estás seguro de que quieres aprobar la verificación de ${selectedProfessional.profile?.first_name} ${selectedProfessional.profile?.last_name}?`
                          : `Are you sure you want to approve verification for ${selectedProfessional.profile?.first_name} ${selectedProfessional.profile?.last_name}?`)}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setVerifyDialogOpen(false)}>
                {isSpanish ? "Cancelar" : "Cancel"}
              </Button>
              <Button
                variant={selectedProfessional?.verified ? "destructive" : "default"}
                onClick={() => handleVerify(selectedProfessional?.id, !selectedProfessional?.verified)}
              >
                {selectedProfessional?.verified 
                  ? (isSpanish ? "Rechazar" : "Reject")
                  : (isSpanish ? "Aprobar" : "Approve")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Documents Dialog */}
        <Dialog open={documentsDialogOpen} onOpenChange={setDocumentsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {isSpanish ? "Documentos del Profesional" : "Professional Documents"}
              </DialogTitle>
              <DialogDescription>
                {selectedProfessional && (
                  <>
                    {isSpanish ? "Documentos subidos por" : "Documents uploaded by"} {selectedProfessional.profile?.first_name} {selectedProfessional.profile?.last_name}
                    <br />
                    <span className="text-xs text-muted-foreground">
                      {isSpanish 
                        ? "Solo metadata, sin contenido clínico detallado"
                        : "Metadata only, no detailed clinical content"}
                    </span>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {documents.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {isSpanish ? "No hay documentos" : "No documents"}
                </p>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="p-3 rounded-lg border border-border/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.category} • {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {doc.file_type}
                    </Badge>
                  </div>
                ))
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDocumentsDialogOpen(false)}>
                {isSpanish ? "Cerrar" : "Close"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </RouteGuard>
  )
}

