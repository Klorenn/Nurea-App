"use client"

import { useState, useEffect } from "react"
import { RouteGuard } from "@/components/auth/route-guard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  UserCheck,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  FileText,
  Eye,
  Clock,
  AlertCircle,
  ClipboardCheck,
  ExternalLink,
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type VerificationStatus = "pending" | "under_review" | "verified" | "rejected"

interface Professional {
  id: string
  specialty: string
  verified: boolean
  verification_status: VerificationStatus
  verification_notes: string | null
  professional_license_number: string | null
  license_issuing_institution: string | null
  license_expiry_date: string | null
  verification_document_url: string | null
  verification_document_name: string | null
  rejection_reason: string | null
  verification_date: string | null
  experience_years: number | null
  created_at: string
  profile: {
    id: string
    first_name: string
    last_name: string
    email: string
    blocked: boolean
    created_at: string
  } | null
}

const STATUS_CONFIG: Record<
  VerificationStatus,
  { label: { es: string; en: string }; icon: React.ElementType; className: string }
> = {
  pending: {
    label: { es: "Pendiente", en: "Pending" },
    icon: Clock,
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  },
  under_review: {
    label: { es: "En Revisión", en: "Under Review" },
    icon: ClipboardCheck,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  verified: {
    label: { es: "Verificado", en: "Verified" },
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  },
  rejected: {
    label: { es: "Rechazado", en: "Rejected" },
    icon: XCircle,
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
}

export default function AdminProfessionalsPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"

  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Action dialog state
  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    professional: Professional | null
    targetStatus: VerificationStatus | null
  }>({ open: false, professional: null, targetStatus: null })
  const [actionNotes, setActionNotes] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  // Documents dialog state
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)
  const [documents, setDocuments] = useState<any[]>([])

  useEffect(() => {
    loadProfessionals()
  }, [statusFilter])

  const loadProfessionals = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") {
        if (statusFilter === "pending_review") {
          // Show both pending and under_review
          params.append("verified", "false")
        } else {
          params.append("status", statusFilter)
        }
      }

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

  const handleAction = async () => {
    if (!actionDialog.professional || !actionDialog.targetStatus) return

    setActionLoading(true)
    try {
      const response = await fetch("/api/admin/professionals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalId: actionDialog.professional.id,
          verificationStatus: actionDialog.targetStatus,
          notes: actionNotes || undefined,
          rejectionReason: actionDialog.targetStatus === "rejected" ? actionNotes : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "No se pudo actualizar la verificación")
      }

      await loadProfessionals()
      closeActionDialog()
    } catch (error) {
      console.error("Error updating professional:", error)
      alert(error instanceof Error ? error.message : "No se pudo actualizar la verificación")
    } finally {
      setActionLoading(false)
    }
  }

  const openActionDialog = (professional: Professional, targetStatus: VerificationStatus) => {
    setActionNotes("")
    setActionDialog({ open: true, professional, targetStatus })
  }

  const closeActionDialog = () => {
    setActionDialog({ open: false, professional: null, targetStatus: null })
    setActionNotes("")
  }

  const loadDocuments = async (professionalId: string) => {
    try {
      const response = await fetch(`/api/documents/list?professionalId=${professionalId}`)
      const data = await response.json()
      setDocuments(data.success ? data.documents || [] : [])
    } catch {
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
      prof.professional_license_number?.toLowerCase().includes(query)
    )
  })

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString(isSpanish ? "es-CL" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (prof: Professional) => {
    const status = prof.verification_status || (prof.verified ? "verified" : "pending")
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending
    const Icon = config.icon
    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {isSpanish ? config.label.es : config.label.en}
      </Badge>
    )
  }

  const getActionButtons = (prof: Professional) => {
    const status = prof.verification_status || (prof.verified ? "verified" : "pending")
    const buttons: React.ReactNode[] = []

    if (status === "pending") {
      buttons.push(
        <Button
          key="review"
          variant="outline"
          size="sm"
          onClick={() => openActionDialog(prof, "under_review")}
          className="rounded-xl border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
        >
          <ClipboardCheck className="h-4 w-4 mr-2" />
          {isSpanish ? "Marcar en Revisión" : "Mark Under Review"}
        </Button>
      )
    }

    if (status === "pending" || status === "under_review") {
      buttons.push(
        <Button
          key="approve"
          variant="default"
          size="sm"
          onClick={() => openActionDialog(prof, "verified")}
          className="rounded-xl"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          {isSpanish ? "Aprobar" : "Approve"}
        </Button>
      )
      buttons.push(
        <Button
          key="reject"
          variant="outline"
          size="sm"
          onClick={() => openActionDialog(prof, "rejected")}
          className="rounded-xl border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
        >
          <XCircle className="h-4 w-4 mr-2" />
          {isSpanish ? "Rechazar" : "Reject"}
        </Button>
      )
    }

    if (status === "verified" || status === "rejected") {
      buttons.push(
        <Button
          key="reset"
          variant="outline"
          size="sm"
          onClick={() => openActionDialog(prof, "pending")}
          className="rounded-xl text-muted-foreground"
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          {isSpanish ? "Restablecer" : "Reset"}
        </Button>
      )
    }

    return buttons
  }

  const getActionDialogContent = () => {
    const { professional, targetStatus } = actionDialog
    if (!professional || !targetStatus) return null

    const name = `${professional.profile?.first_name || ""} ${professional.profile?.last_name || ""}`.trim()

    const titles: Record<VerificationStatus, string> = {
      under_review: isSpanish ? "Marcar en Revisión" : "Mark Under Review",
      verified: isSpanish ? "Aprobar verificación" : "Approve Verification",
      rejected: isSpanish ? "Rechazar verificación" : "Reject Verification",
      pending: isSpanish ? "Restablecer a Pendiente" : "Reset to Pending",
    }

    const descriptions: Record<VerificationStatus, string> = {
      under_review: isSpanish
        ? `Marcará a ${name} como "En Revisión". Esto indica que estás verificando sus datos con la Superintendencia de Salud.`
        : `Will mark ${name} as "Under Review". This indicates you are verifying their credentials with the Health Superintendency.`,
      verified: isSpanish
        ? `Aprobarás la verificación de ${name}. Esto les permitirá atender pacientes en NUREA.`
        : `You will approve the verification of ${name}. This will allow them to see patients on NUREA.`,
      rejected: isSpanish
        ? `Rechazarás la verificación de ${name}. Proporciona un motivo de rechazo.`
        : `You will reject the verification of ${name}. Please provide a rejection reason.`,
      pending: isSpanish
        ? `Restablecerá el estado de ${name} a Pendiente.`
        : `Will reset ${name}'s status to Pending.`,
    }

    return { title: titles[targetStatus], description: descriptions[targetStatus] }
  }

  const dialogContent = getActionDialogContent()

  return (
    <RouteGuard requiredRole="admin">
      
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <UserCheck className="h-8 w-8 text-primary" />
              {isSpanish ? "Verificación de Especialistas" : "Specialist Verification"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isSpanish
                ? "Aprueba y gestiona la verificación de especialistas con la Superintendencia de Salud"
                : "Approve and manage specialist verification with the Health Superintendency"}
            </p>
          </div>

          {/* Status Summary Pills */}
          <div className="flex flex-wrap gap-2">
            {(["pending", "under_review", "verified", "rejected"] as VerificationStatus[]).map((status) => {
              const count = professionals.filter(
                (p) => (p.verification_status || (p.verified ? "verified" : "pending")) === status
              ).length
              const config = STATUS_CONFIG[status]
              const Icon = config.icon
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    statusFilter === status
                      ? config.className + " border-current shadow-sm"
                      : "border-border/40 text-muted-foreground hover:border-border"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {isSpanish ? config.label.es : config.label.en}
                  <span className="ml-1 text-xs opacity-75">({count})</span>
                </button>
              )
            })}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isSpanish ? "Buscar por nombre, email, licencia..." : "Search by name, email, license..."}
                className="pl-10 rounded-xl bg-accent/20 border-none h-12"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px] rounded-xl">
                <SelectValue placeholder={isSpanish ? "Filtrar por estado" : "Filter by status"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isSpanish ? "Todos" : "All"}</SelectItem>
                <SelectItem value="pending">{isSpanish ? "Pendientes" : "Pending"}</SelectItem>
                <SelectItem value="under_review">{isSpanish ? "En Revisión" : "Under Review"}</SelectItem>
                <SelectItem value="verified">{isSpanish ? "Verificados" : "Verified"}</SelectItem>
                <SelectItem value="rejected">{isSpanish ? "Rechazados" : "Rejected"}</SelectItem>
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
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Badges */}
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {getStatusBadge(prof)}
                              {prof.profile?.blocked && (
                                <Badge variant="destructive">
                                  {isSpanish ? "Bloqueado" : "Blocked"}
                                </Badge>
                              )}
                            </div>

                            {/* Name */}
                            <h3 className="font-bold text-lg mb-2">
                              {prof.profile?.first_name} {prof.profile?.last_name}
                            </h3>

                            {/* Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-muted-foreground">
                              <p>
                                <span className="font-medium text-foreground">Email:</span>{" "}
                                {prof.profile?.email}
                              </p>
                              <p>
                                <span className="font-medium text-foreground">
                                  {isSpanish ? "Especialidad:" : "Specialty:"}
                                </span>{" "}
                                {prof.specialty || "—"}
                              </p>
                              {prof.professional_license_number && (
                                <p>
                                  <span className="font-medium text-foreground">
                                    {isSpanish ? "Nº Licencia:" : "License No.:"}
                                  </span>{" "}
                                  {prof.professional_license_number}
                                </p>
                              )}
                              {prof.license_issuing_institution && (
                                <p>
                                  <span className="font-medium text-foreground">
                                    {isSpanish ? "Institución:" : "Institution:"}
                                  </span>{" "}
                                  {prof.license_issuing_institution}
                                </p>
                              )}
                              {prof.verification_date && (
                                <p>
                                  <span className="font-medium text-foreground">
                                    {isSpanish ? "Fecha verificación:" : "Verification date:"}
                                  </span>{" "}
                                  {formatDate(prof.verification_date)}
                                </p>
                              )}
                              <p className="text-xs mt-1 col-span-2 text-muted-foreground/70">
                                {isSpanish ? "Registrado:" : "Registered:"} {formatDate(prof.profile?.created_at || null)}
                              </p>
                            </div>

                            {/* Rejection reason or notes */}
                            {prof.rejection_reason && (
                              <div className="mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                                <p className="text-xs text-red-700 dark:text-red-300">
                                  <span className="font-medium">
                                    {isSpanish ? "Motivo de rechazo:" : "Rejection reason:"}
                                  </span>{" "}
                                  {prof.rejection_reason}
                                </p>
                              </div>
                            )}
                            {prof.verification_notes && !prof.rejection_reason && (
                              <div className="mt-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                  <span className="font-medium">
                                    {isSpanish ? "Notas:" : "Notes:"}
                                  </span>{" "}
                                  {prof.verification_notes}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 flex-wrap shrink-0">
                            {/* View document */}
                            {prof.verification_document_url ? (
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="rounded-xl"
                              >
                                <a
                                  href={prof.verification_document_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  {isSpanish ? "Ver Documento" : "View Document"}
                                </a>
                              </Button>
                            ) : (
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
                                {isSpanish ? "Ver Archivos" : "View Files"}
                              </Button>
                            )}

                            {/* Status action buttons */}
                            {getActionButtons(prof)}
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

        {/* Action Dialog */}
        <Dialog open={actionDialog.open} onOpenChange={(open) => !open && closeActionDialog()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialogContent?.title}</DialogTitle>
              <DialogDescription>{dialogContent?.description}</DialogDescription>
            </DialogHeader>

            {/* Notes / Rejection reason input */}
            {actionDialog.targetStatus && ["under_review", "verified", "rejected"].includes(actionDialog.targetStatus) && (
              <div className="space-y-2">
                <Label htmlFor="action-notes">
                  {actionDialog.targetStatus === "rejected"
                    ? (isSpanish ? "Motivo de rechazo *" : "Rejection reason *")
                    : (isSpanish ? "Notas internas (opcional)" : "Internal notes (optional)")}
                </Label>
                <Textarea
                  id="action-notes"
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder={
                    actionDialog.targetStatus === "rejected"
                      ? (isSpanish
                          ? "Ej: Número de licencia no encontrado en el registro RNPI de la Superintendencia de Salud"
                          : "E.g.: License number not found in the Superintendency of Health RNPI registry")
                      : (isSpanish
                          ? "Ej: Verificando con Superintendencia de Salud — datos enviados el 15/03/2026"
                          : "E.g.: Verifying with Health Superintendency — data submitted on 03/15/2026")
                  }
                  rows={3}
                  className="rounded-xl resize-none"
                />
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={closeActionDialog} disabled={actionLoading}>
                {isSpanish ? "Cancelar" : "Cancel"}
              </Button>
              <Button
                variant={
                  actionDialog.targetStatus === "rejected"
                    ? "destructive"
                    : actionDialog.targetStatus === "verified"
                    ? "default"
                    : "outline"
                }
                onClick={handleAction}
                disabled={
                  actionLoading ||
                  (actionDialog.targetStatus === "rejected" && !actionNotes.trim())
                }
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                {actionDialog.targetStatus === "under_review"
                  ? (isSpanish ? "Marcar en Revisión" : "Mark Under Review")
                  : actionDialog.targetStatus === "verified"
                  ? (isSpanish ? "Aprobar" : "Approve")
                  : actionDialog.targetStatus === "rejected"
                  ? (isSpanish ? "Rechazar" : "Reject")
                  : (isSpanish ? "Confirmar" : "Confirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Documents Dialog */}
        <Dialog open={documentsDialogOpen} onOpenChange={setDocumentsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {isSpanish ? "Documentos del Especialista" : "Specialist Documents"}
              </DialogTitle>
              <DialogDescription>
                {selectedProfessional && (
                  <>
                    {isSpanish ? "Archivos subidos por" : "Files uploaded by"}{" "}
                    {selectedProfessional.profile?.first_name} {selectedProfessional.profile?.last_name}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {documents.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {isSpanish ? "No hay documentos subidos" : "No documents uploaded"}
                </p>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-lg border border-border/40 flex items-center justify-between"
                  >
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
      
    </RouteGuard>
  )
}
