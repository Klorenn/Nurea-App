"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RouteGuard } from "@/components/auth/route-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  MessageSquare, 
  Plus, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle,
  Mail
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
import { useTranslations } from "@/lib/i18n"
import { toast } from "sonner"

export default function PatientSupportPage() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const isSpanish = language === "es"
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [newTicket, setNewTicket] = useState({
    subject: "",
    message: "",
    category: "other",
    priority: "medium"
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadTickets()
  }, [statusFilter])

  const loadTickets = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)

      const response = await fetch(`/api/support/tickets?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setTickets(data.tickets || [])
      }
    } catch (error) {
      console.error("Error loading tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      alert(isSpanish ? "Por favor, completa todos los campos" : "Please fill all fields")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTicket),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || (isSpanish ? "No se pudo crear el ticket" : "Could not create ticket"))
      }

      await loadTickets()
      setCreateDialogOpen(false)
      setNewTicket({ subject: "", message: "", category: "other", priority: "medium" })
      toast.success(isSpanish ? "Ticket creado exitosamente" : "Ticket created successfully")
    } catch (error) {
      console.error("Error creating ticket:", error)
      toast.error(error instanceof Error ? error.message : (isSpanish
        ? "No se pudo crear el ticket"
        : "Could not create ticket"))
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === "es" ? "es-CL" : "en-US",
      { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
    )
  }

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status === "closed" ? "resolved" : status
    const statuses: Record<string, { label: string; icon: any; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      open: { label: isSpanish ? "Abierto" : "Open", icon: Clock, variant: "outline" },
      in_progress: { label: isSpanish ? "En Progreso" : "In Progress", icon: AlertCircle, variant: "secondary" },
      resolved: { label: isSpanish ? "Resuelto" : "Resolved", icon: CheckCircle2, variant: "default" },
    }
    const statusInfo = statuses[normalizedStatus] || statuses.open
    const Icon = statusInfo.icon
    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    )
  }

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      technical: isSpanish ? "Técnico" : "Technical",
      account: isSpanish ? "Cuenta" : "Account",
      appointment: isSpanish ? "Cita" : "Appointment",
      other: isSpanish ? "Otro" : "Other",
    }
    return categories[category] || categories.other
  }

  const getPriorityLabel = (priority: string) => {
    const priorities: Record<string, string> = {
      low: isSpanish ? "Baja" : "Low",
      medium: isSpanish ? "Media" : "Medium",
      high: isSpanish ? "Alta" : "High",
      urgent: isSpanish ? "Urgente" : "Urgent",
    }
    return priorities[priority] || priorities.medium
  }

  return (
    <RouteGuard requiredRole="patient">
      <DashboardLayout role="patient">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-primary" />
                {isSpanish ? "Soporte" : "Support"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {isSpanish 
                  ? "Crea tickets de soporte y revisa las respuestas del equipo"
                  : "Create support tickets and review team responses"}
              </p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)} className="rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              {isSpanish ? "Nuevo Ticket" : "New Ticket"}
            </Button>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] rounded-xl">
                <SelectValue placeholder={isSpanish ? "Estado" : "Status"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isSpanish ? "Todos" : "All"}</SelectItem>
                <SelectItem value="open">{isSpanish ? "Abierto" : "Open"}</SelectItem>
                <SelectItem value="in_progress">{isSpanish ? "En Progreso" : "In Progress"}</SelectItem>
                <SelectItem value="resolved">{isSpanish ? "Resuelto" : "Resolved"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tickets List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.length === 0 ? (
                <Card className="border-border/40">
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">
                      {isSpanish ? "No tienes tickets de soporte" : "You don't have any support tickets"}
                    </p>
                    <Button onClick={() => setCreateDialogOpen(true)} className="rounded-xl">
                      <Plus className="h-4 w-4 mr-2" />
                      {isSpanish ? "Crear tu primer ticket" : "Create your first ticket"}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                tickets.map((ticket) => (
                  <Card key={ticket.id} className="border-border/40">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            {getStatusBadge(ticket.status)}
                            <Badge variant="outline">
                              {getCategoryLabel(ticket.category)}
                            </Badge>
                            <Badge variant="outline">
                              {getPriorityLabel(ticket.priority)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(ticket.created_at)}
                            </span>
                          </div>
                          <CardTitle className="text-xl">{ticket.subject}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">
                          {isSpanish ? "Tu mensaje:" : "Your message:"}
                        </p>
                        <p className="text-muted-foreground whitespace-pre-wrap">{ticket.message}</p>
                      </div>
                      {ticket.admin_response && (
                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                          <div className="flex items-center gap-2 mb-2">
                            <Mail className="h-4 w-4 text-primary" />
                            <p className="text-sm font-medium">
                              {isSpanish ? "Respuesta del equipo:" : "Team response:"}
                            </p>
                          </div>
                          <p className="text-muted-foreground whitespace-pre-wrap">{ticket.admin_response}</p>
                          {ticket.admin && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {isSpanish ? "Por" : "By"} {ticket.admin.first_name} {ticket.admin.last_name}
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>

        {/* Create Ticket Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {isSpanish ? "Crear Ticket de Soporte" : "Create Support Ticket"}
              </DialogTitle>
              <DialogDescription>
                {isSpanish 
                  ? "Describe tu problema o consulta. El equipo de soporte te responderá pronto."
                  : "Describe your problem or question. The support team will respond soon."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {isSpanish ? "Asunto" : "Subject"} *
                </label>
                <Input
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder={isSpanish ? "Ej: Problema con el pago" : "E.g: Payment issue"}
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {isSpanish ? "Categoría" : "Category"}
                  </label>
                  <Select value={newTicket.category} onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">{isSpanish ? "Técnico" : "Technical"}</SelectItem>
                      <SelectItem value="account">{isSpanish ? "Cuenta" : "Account"}</SelectItem>
                      <SelectItem value="appointment">{isSpanish ? "Cita" : "Appointment"}</SelectItem>
                      <SelectItem value="other">{isSpanish ? "Otro" : "Other"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {isSpanish ? "Prioridad" : "Priority"}
                  </label>
                  <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{isSpanish ? "Baja" : "Low"}</SelectItem>
                      <SelectItem value="medium">{isSpanish ? "Media" : "Medium"}</SelectItem>
                      <SelectItem value="high">{isSpanish ? "Alta" : "High"}</SelectItem>
                      <SelectItem value="urgent">{isSpanish ? "Urgente" : "Urgent"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {isSpanish ? "Mensaje" : "Message"} *
                </label>
                <Textarea
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  placeholder={isSpanish 
                    ? "Describe tu problema o consulta en detalle..."
                    : "Describe your problem or question in detail..."}
                  className="min-h-[150px] rounded-xl"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                {isSpanish ? "Cancelar" : "Cancel"}
              </Button>
              <Button onClick={handleCreateTicket} disabled={submitting || !newTicket.subject.trim() || !newTicket.message.trim()}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isSpanish ? "Creando..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    {isSpanish ? "Crear Ticket" : "Create Ticket"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </RouteGuard>
  )
}

