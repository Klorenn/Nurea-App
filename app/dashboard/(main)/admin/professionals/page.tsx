"use client"

import { useState, useEffect } from "react"
import type { ReactNode } from "react"
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
  Clock,
  AlertCircle,
  ClipboardCheck,
  ExternalLink,
  Download,
  MoreVertical,
  Trash2,
  AlertTriangle,
  Sparkles,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/contexts/language-context"
import { formatRut, isValidRut } from "@/lib/utils/chile"
import { toast } from "sonner"
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
  registration_number: string | null
  registration_institution: string | null
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
    subscription_status?: string | null
    trial_end_date?: string | null
    selected_plan_id?: string | null
  } | null
}

const STATUS_CONFIG: Record<
  VerificationStatus,
  { label: { es: string; en: string }; icon: typeof Clock; className: string }
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
  const [selectedProfessional] = useState<Professional | null>(null)
  const [documents] = useState<any[]>([])

  // Warning / delete dialogs (3 puntitos)
  const [warningDialogOpen, setWarningDialogOpen] = useState(false)
  const [warningTarget, setWarningTarget] = useState<Professional | null>(null)
  const [warningMessage, setWarningMessage] = useState("")
  const [warningLoading, setWarningLoading] = useState(false)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Professional | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // RNPI verify dialog
  const [rnpiDialogOpen, setRnpiDialogOpen] = useState(false)
  const [rnpiLoading, setRnpiLoading] = useState(false)
  const [rnpiRut, setRnpiRut] = useState("")
  const [rnpiFound, setRnpiFound] = useState<boolean | null>(null)
  const [rnpiError, setRnpiError] = useState<string | null>(null)

  // Premium dialog state
  const [premiumDialogOpen, setPremiumDialogOpen] = useState(false)
  const [premiumTargetProfessional, setPremiumTargetProfessional] = useState<Professional | null>(null)
  const [premiumFrom, setPremiumFrom] = useState("")
  const [premiumDurationValue, setPremiumDurationValue] = useState<number>(30)
  const [premiumDurationUnit, setPremiumDurationUnit] = useState<"days" | "months" | "forever">("days")
  const [premiumLoading, setPremiumLoading] = useState(false)

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

      const text = await response.text().catch(() => "")
      let data: any = null
      try {
        data = text ? JSON.parse(text) : null
      } catch {
        data = null
      }

      if (!response.ok) {
        // Log explicitly so we don't end up with "{}" only.
        console.error("Error loading professionals (API) - status:", response.status)
        console.error("Error loading professionals (API) - parsed payload:", data)
        console.error(
          "Error loading professionals (API) - bodyText (truncated):",
          (text || "").slice(0, 600)
        )
        return
      }

      if (data?.success) setProfessionals(data.professionals || [])
    } catch (error) {
      console.error("Error loading professionals:", error)
    } finally {
      setLoading(false)
    }
  }

  const openWarningDialog = (prof: Professional) => {
    setWarningTarget(prof)
    setWarningMessage("")
    setWarningDialogOpen(true)
  }

  const handleSendWarning = async () => {
    if (!warningTarget) return
    if (!warningMessage.trim()) {
      toast.error(isSpanish ? "Escribe una advertencia antes de enviar." : "Write a warning message before sending.")
      return
    }

    setWarningLoading(true)
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: warningTarget.id,
          account_status: "warning",
          warning_message: warningMessage.trim(),
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Error al advertir")
      }

      setWarningDialogOpen(false)
      setWarningTarget(null)
      await loadProfessionals()
    } catch (error) {
      console.error("Warning error:", error)
      toast.error(isSpanish ? "No se pudo enviar la advertencia." : "Could not send warning.")
    } finally {
      setWarningLoading(false)
    }
  }

  const openDeleteDialog = (prof: Professional) => {
    setDeleteTarget(prof)
    setDeleteDialogOpen(true)
  }

  const handleDeleteAccount = async () => {
    if (!deleteTarget) return

    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/admin/users?userId=${encodeURIComponent(deleteTarget.id)}`, {
        method: "DELETE",
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Error al eliminar")
      }

      setDeleteDialogOpen(false)
      setDeleteTarget(null)
      await loadProfessionals()
    } catch (error) {
      console.error("Delete error:", error)
      toast.error(isSpanish ? "No se pudo eliminar la cuenta." : "Could not delete account.")
    } finally {
      setDeleteLoading(false)
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
        throw new Error(
          data?.message ||
            (typeof data?.details === "object" ? JSON.stringify(data.details) : undefined) ||
            "No se pudo actualizar la verificación"
        )
      }

      await loadProfessionals()
      closeActionDialog()
    } catch (error) {
      console.error("Error updating professional:", error)
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar la verificación")
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

  const filteredProfessionals = professionals.filter((prof) => {
    const query = searchQuery.toLowerCase()
    return (
      prof.profile?.first_name?.toLowerCase().includes(query) ||
      prof.profile?.last_name?.toLowerCase().includes(query) ||
      prof.profile?.email?.toLowerCase().includes(query) ||
      prof.specialty?.toLowerCase().includes(query) ||
      prof.registration_number?.toLowerCase().includes(query) ||
      prof.registration_institution?.toLowerCase().includes(query)
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

  const toLocalDateTimeInputValue = (d: Date) => {
    // Convierte a formato compatible con `datetime-local` (sin timezone).
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    return local.toISOString().slice(0, 16)
  }

  const parseLocalDateTime = (value: string) => {
    // `datetime-local` llega como "YYYY-MM-DDTHH:mm" sin timezone.
    const [datePart, timePart] = value.split("T")
    const [y, m, day] = datePart.split("-").map(Number)
    const [hh, mm] = (timePart || "").split(":").map(Number)
    return new Date(y, m - 1, day, hh || 0, mm || 0, 0, 0)
  }

  const getComputedPremiumEnd = () => {
    if (!premiumFrom) return null
    if (premiumDurationUnit === "forever") return null
    const start = parseLocalDateTime(premiumFrom)
    if (Number.isNaN(start.getTime())) return null
    const end = new Date(start)
    const value = Math.max(1, premiumDurationValue || 0)
    if (premiumDurationUnit === "days") {
      end.setDate(end.getDate() + value)
    } else {
      end.setMonth(end.getMonth() + value)
    }
    return end.toISOString()
  }

  const handleSetPremium = async () => {
    if (!premiumTargetProfessional) return
    if (!premiumFrom) {
      toast.error(isSpanish ? "Selecciona una fecha de inicio válida." : "Select a valid start date.")
      return
    }

    const start = parseLocalDateTime(premiumFrom)
    if (Number.isNaN(start.getTime())) {
      toast.error(isSpanish ? "Fecha de inicio inválida." : "Invalid start date.")
      return
    }

    setPremiumLoading(true)
    try {
      const computedEnd = getComputedPremiumEnd()
      const subscriptionStatus = premiumDurationUnit === "forever" ? "active" : "trialing"

      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: premiumTargetProfessional.id,
          subscription_status: subscriptionStatus,
          trial_end_date: subscriptionStatus === "trialing" ? computedEnd : null,
          selected_plan_id: subscriptionStatus === "trialing" ? "manual_trial" : "manual_active",
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.message || data?.error || (isSpanish ? "No se pudo actualizar premium" : "Could not update premium"))
      }

      toast.success(isSpanish ? "Premium actualizado correctamente." : "Premium updated correctly.")
      setPremiumDialogOpen(false)
      setPremiumTargetProfessional(null)
      await loadProfessionals()
    } catch (error) {
      console.error("Premium update error:", error)
      toast.error(isSpanish ? "No se pudo actualizar el premium." : "Could not update premium.")
    } finally {
      setPremiumLoading(false)
    }
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
    const buttons: ReactNode[] = []

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

            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto rounded-xl"
              onClick={() => {
                const escapeCsvValue = (value: unknown) => {
                  const str = String(value ?? "")
                  if (/[",\n]/.test(str)) {
                    return `"${str.replace(/"/g, '""')}"`
                  }
                  return str
                }

                const rows = filteredProfessionals.map((prof) => {
                  const first = prof.profile?.first_name ?? ""
                  const last = prof.profile?.last_name ?? ""
                  const name = `${first} ${last}`.trim() || prof.specialty || ""
                  const email = prof.profile?.email ?? ""
                  const rut = prof.registration_number ?? ""
                  return `${escapeCsvValue(name)},${escapeCsvValue(email)},${escapeCsvValue(rut)}`
                })

                const header = isSpanish ? "Nombre,Email,RUT" : "Name,Email,RUT"
                const csv = [header, ...rows].join("\n")

                const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `nurea_profesionales_${new Date().toISOString().slice(0, 10)}.csv`
                document.body.appendChild(a)
                a.click()
                a.remove()
                URL.revokeObjectURL(url)
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              {isSpanish ? "Exportar CSV" : "Export CSV"}
            </Button>
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
                              {prof.registration_number && (
                                <p className="flex items-center gap-2">
                                  <span className="font-medium text-foreground whitespace-nowrap">
                                    {isSpanish ? "RUT / Registro:" : "RUT / Registration:"}
                                  </span>
                                  <span className="font-mono text-xs sm:text-sm">{prof.registration_number}</span>
                                </p>
                              )}
                              {prof.registration_institution && (
                                <p>
                                  <span className="font-medium text-foreground">
                                    {isSpanish ? "Institución:" : "Institution:"}
                                  </span>{" "}
                                  {prof.registration_institution}
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

                          {/* Action Buttons (3 puntitos arriba a la derecha) */}
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            {/* 3 puntitos: advertencia / eliminar */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="rounded-xl h-9 w-9"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault()
                                    openWarningDialog(prof)
                                  }}
                                >
                                  <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
                                  {isSpanish ? "Advertir" : "Warn"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault()
                                    const now = new Date()
                                    setPremiumFrom(toLocalDateTimeInputValue(now))
                                    setPremiumDurationValue(30)
                                    setPremiumDurationUnit("days")
                                    setPremiumTargetProfessional(prof)
                                    setPremiumDialogOpen(true)
                                  }}
                                >
                                  <Sparkles className="h-4 w-4 mr-2 text-teal-600" />
                                  {isSpanish ? "⭐ Cuenta Premium" : "⭐ Premium account"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onSelect={(e) => {
                                    e.preventDefault()
                                    openDeleteDialog(prof)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {isSpanish ? "Eliminar cuenta" : "Delete account"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>

                            <div className="flex items-center gap-2 flex-wrap justify-end">
                              {/* RNPI verify button */}
                              {prof.registration_number ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="rounded-xl whitespace-nowrap"
                                  onClick={async () => {
                                    const raw = prof.registration_number || ""
                                    const rut = formatRut(raw)

                                    setRnpiRut(rut)
                                    setRnpiFound(null)
                                    setRnpiError(null)
                                    setRnpiLoading(false)

                                    if (!rut || !isValidRut(rut)) {
                                      setRnpiError(
                                        isSpanish
                                          ? "RUT inválido. Debe ir con dígito verificador y guión (ej: 20366864-3)."
                                          : "Invalid RUT. Use DV and dash (ej: 20366864-3).",
                                      )
                                      setRnpiDialogOpen(true)
                                      return
                                    }

                                    setRnpiDialogOpen(true)
                                    setRnpiLoading(true)
                                    try {
                                      const resp = await fetch(`/api/rnpi/verify?rut=${encodeURIComponent(rut)}`)
                                      const data = await resp.json().catch(() => null)

                                      if (!resp.ok) {
                                        setRnpiError(data?.message || (isSpanish ? "Error verificando RNPI" : "Error verifying RNPI"))
                                        setRnpiFound(null)
                                        return
                                      }

                                      setRnpiFound(typeof data?.found === "boolean" ? data.found : null)
                                      if (data?.error) setRnpiError(String(data.error))
                                    } catch {
                                      setRnpiError(isSpanish ? "Error verificando RNPI." : "Error verifying RNPI.")
                                      setRnpiFound(null)
                                    } finally {
                                      setRnpiLoading(false)
                                    }
                                  }}
                                >
                                  <Search className="h-4 w-4 mr-2" />
                                  {isSpanish ? "Verificar" : "Verify"}
                                </Button>
                              ) : null}

                              {/* Status action buttons */}
                              {getActionButtons(prof)}
                            </div>
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

        {/* Warning Dialog */}
        <Dialog
          open={warningDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setWarningDialogOpen(false)
              setWarningTarget(null)
              setWarningMessage("")
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isSpanish ? "Advertencia al especialista" : "Warning to specialist"}</DialogTitle>
              <DialogDescription>
                {warningTarget ? (
                  <>
                    {isSpanish ? "Enviar advertencia a" : "Send warning to"}{" "}
                    <span className="font-medium">
                      {warningTarget.profile?.first_name} {warningTarget.profile?.last_name}
                    </span>
                  </>
                ) : null}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="warning-message">
                {isSpanish ? "Mensaje de advertencia *" : "Warning message *"}
              </Label>
              <Textarea
                id="warning-message"
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
                placeholder={
                  isSpanish
                    ? "Ej: Se detectó un problema con la documentación. Por favor, regulariza en 24h."
                    : "E.g.: Issue detected with the documentation. Please fix within 24h."
                }
                rows={4}
                className="rounded-xl resize-none"
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setWarningDialogOpen(false)
                  setWarningTarget(null)
                  setWarningMessage("")
                }}
                disabled={warningLoading}
              >
                {isSpanish ? "Cancelar" : "Cancel"}
              </Button>
              <Button
                variant="destructive"
                onClick={handleSendWarning}
                disabled={warningLoading || !warningMessage.trim()}
              >
                {warningLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {isSpanish ? "Enviar advertencia" : "Send warning"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteDialogOpen(false)
              setDeleteTarget(null)
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isSpanish ? "Eliminar cuenta" : "Delete account"}</DialogTitle>
              <DialogDescription>
                {deleteTarget ? (
                  <>
                    {isSpanish ? "Vas a eliminar a" : "You are about to delete"}{" "}
                    <span className="font-medium">
                      {deleteTarget.profile?.first_name} {deleteTarget.profile?.last_name}
                    </span>
                    . {isSpanish ? "Esto no se puede deshacer." : "This can't be undone."}
                  </>
                ) : null}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false)
                  setDeleteTarget(null)
                }}
                disabled={deleteLoading}
              >
                {isSpanish ? "Cancelar" : "Cancel"}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {isSpanish ? "Eliminar" : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Documents Dialog */}
        {/* RNPI Verify Dialog */}
        <Dialog
          open={rnpiDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setRnpiDialogOpen(false)
              setRnpiLoading(false)
              setRnpiFound(null)
              setRnpiError(null)
              setRnpiRut("")
            }
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{isSpanish ? "Verificación RNPI" : "RNPI Verification"}</DialogTitle>
              <DialogDescription>
                {isSpanish ? "Revisamos el RUT en RNPI y te mostramos el resultado." : "We check the RUT in RNPI and show the result."}
                {rnpiRut ? (
                  <>
                    <br />
                    <span className="font-medium">{rnpiRut}</span>
                  </>
                ) : null}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {rnpiLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isSpanish ? "Verificando..." : "Verifying..."}</span>
                </div>
              ) : rnpiError ? (
                <div className="flex items-start gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4 mt-0.5" />
                  <p className="text-sm">{rnpiError}</p>
                </div>
              ) : rnpiFound === true ? (
                <div className="flex items-start gap-2 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4 mt-0.5" />
                  <p className="text-sm">{isSpanish ? "RNPI: Sí está registrado." : "RNPI: Registered (yes)."}</p>
                </div>
              ) : rnpiFound === false ? (
                <div className="flex items-start gap-2 text-destructive">
                  <XCircle className="h-4 w-4 mt-0.5" />
                  <p className="text-sm">{isSpanish ? "RNPI: No está registrado." : "RNPI: Not registered (no)."}</p>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <p className="text-sm">
                    {isSpanish ? "No se pudo confirmar automáticamente. Revisa el portal RNPI." : "Could not confirm automatically. Check the RNPI portal."}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRnpiDialogOpen(false)}
                disabled={rnpiLoading}
              >
                {isSpanish ? "Cerrar" : "Close"}
              </Button>

              {rnpiRut ? (
                <Button
                  type="button"
                  onClick={() => {
                    const portalUrl = `https://rnpi.superdesalud.gob.cl/?rut=${encodeURIComponent(rnpiRut)}`
                    const opened = window.open(portalUrl, "_blank")
                    if (!opened) window.location.assign(portalUrl)
                  }}
                  disabled={rnpiLoading}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {isSpanish ? "Abrir portal" : "Open portal"}
                </Button>
              ) : null}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Premium Dialog */}
        <Dialog
          open={premiumDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setPremiumDialogOpen(false)
              setPremiumTargetProfessional(null)
              setPremiumFrom("")
              setPremiumDurationValue(30)
              setPremiumDurationUnit("days")
              setPremiumLoading(false)
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-teal-600" />
                {isSpanish ? "Cuenta Premium" : "Premium account"}
              </DialogTitle>
              <DialogDescription>
                {isSpanish ? "Activa premium desde una fecha por un período." : "Activate premium from a start date for a period."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>{isSpanish ? "Activa desde" : "Start from"}</Label>
                <Input
                  type="datetime-local"
                  value={premiumFrom}
                  onChange={(e) => setPremiumFrom(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>{isSpanish ? "Duración" : "Duration"}</Label>
                <div className="flex gap-2 items-center">
                  {premiumDurationUnit === "forever" ? null : (
                    <Input
                      className="w-24"
                      type="number"
                      min={1}
                      value={premiumDurationValue}
                      onChange={(e) => setPremiumDurationValue(Number(e.target.value))}
                    />
                  )}
                  <select
                    className="flex-1 h-10 rounded-md border border-border/60 bg-background px-3"
                    value={premiumDurationUnit}
                    onChange={(e) => setPremiumDurationUnit(e.target.value as any)}
                  >
                    <option value="days">{isSpanish ? "Días" : "Days"}</option>
                    <option value="months">{isSpanish ? "Meses" : "Months"}</option>
                    <option value="forever">{isSpanish ? "Activo sin término" : "Active (no end)"}</option>
                  </select>
                </div>
              </div>

              {premiumDurationUnit === "forever" ? (
                <p className="text-xs text-muted-foreground">
                  {isSpanish ? "Se marcará como `active` sin fecha de término." : "It will be set to `active` without an end date."}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {getComputedPremiumEnd() ? (
                    isSpanish ? `Queda hasta: ${formatDate(getComputedPremiumEnd())}` : `Until: ${formatDate(getComputedPremiumEnd())}`
                  ) : (
                    isSpanish ? "Selecciona fecha válida para calcular el fin." : "Pick a valid date to calculate the end."
                  )}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setPremiumDialogOpen(false)} disabled={premiumLoading}>
                {isSpanish ? "Cancelar" : "Cancel"}
              </Button>
              <Button onClick={handleSetPremium} disabled={premiumLoading || !premiumTargetProfessional || !premiumFrom}>
                {premiumLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {isSpanish ? "Guardar" : "Save"}
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
