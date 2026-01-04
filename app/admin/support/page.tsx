"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { RouteGuard } from "@/components/auth/route-guard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Search, Loader2, Mail, CheckCircle2, Clock, AlertCircle, XCircle, ArrowUp } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AdminSupportPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [replyMessage, setReplyMessage] = useState("")

  useEffect(() => {
    loadTickets()
  }, [statusFilter, priorityFilter, roleFilter])

  const loadTickets = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (priorityFilter !== "all") params.append("priority", priorityFilter)
      if (roleFilter !== "all") params.append("role", roleFilter)

      const response = await fetch(`/api/admin/tickets?${params.toString()}`)
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

  const handleReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return

    try {
      const response = await fetch("/api/admin/tickets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          action: "respond",
          response: replyMessage,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "No se pudo enviar la respuesta")
      }

      await loadTickets()
      setReplyDialogOpen(false)
      setSelectedTicket(null)
      setReplyMessage("")
    } catch (error) {
      console.error("Error replying to ticket:", error)
      alert(error instanceof Error ? error.message : (isSpanish 
        ? "No se pudo enviar la respuesta"
        : "Could not send reply"))
    }
  }

  const handleAction = async (ticketId: string, action: string) => {
    try {
      const response = await fetch("/api/admin/tickets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          action,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "No se pudo realizar la acción")
      }

      await loadTickets()
    } catch (error) {
      console.error("Error performing action:", error)
      alert(error instanceof Error ? error.message : (isSpanish 
        ? "No se pudo realizar la acción"
        : "Could not perform action"))
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    const query = searchQuery.toLowerCase()
    return (
      ticket.user?.first_name?.toLowerCase().includes(query) ||
      ticket.user?.last_name?.toLowerCase().includes(query) ||
      ticket.user?.email?.toLowerCase().includes(query) ||
      ticket.subject?.toLowerCase().includes(query) ||
      ticket.message?.toLowerCase().includes(query)
    )
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === "es" ? "es-ES" : "en-US",
      { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorities: Record<string, { label: string; color: string }> = {
      low: { label: isSpanish ? "Baja" : "Low", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
      medium: { label: isSpanish ? "Media" : "Medium", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
      high: { label: isSpanish ? "Alta" : "High", color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
      urgent: { label: isSpanish ? "Urgente" : "Urgent", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
    }
    const priorityInfo = priorities[priority] || priorities.medium
    return (
      <Badge className={priorityInfo.color}>
        {priorityInfo.label}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { label: string; icon: any; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      open: { label: isSpanish ? "Abierto" : "Open", icon: Clock, variant: "outline" },
      in_progress: { label: isSpanish ? "En Progreso" : "In Progress", icon: AlertCircle, variant: "secondary" },
      resolved: { label: isSpanish ? "Resuelto" : "Resolved", icon: CheckCircle2, variant: "default" },
      closed: { label: isSpanish ? "Cerrado" : "Closed", icon: XCircle, variant: "outline" },
    }
    const statusInfo = statuses[status] || statuses.open
    const Icon = statusInfo.icon
    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    )
  }

  return (
    <RouteGuard requiredRole="admin">
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-primary" />
              {isSpanish ? "Soporte" : "Support"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isSpanish 
                ? "Inbox centralizado de tickets de soporte"
                : "Centralized support tickets inbox"}
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isSpanish ? "Buscar tickets..." : "Search tickets..."}
                className="pl-10 rounded-xl bg-accent/20 border-none h-12"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] rounded-xl">
                <SelectValue placeholder={isSpanish ? "Estado" : "Status"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isSpanish ? "Todos" : "All"}</SelectItem>
                <SelectItem value="open">{isSpanish ? "Abierto" : "Open"}</SelectItem>
                <SelectItem value="in_progress">{isSpanish ? "En Progreso" : "In Progress"}</SelectItem>
                <SelectItem value="resolved">{isSpanish ? "Resuelto" : "Resolved"}</SelectItem>
                <SelectItem value="closed">{isSpanish ? "Cerrado" : "Closed"}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[180px] rounded-xl">
                <SelectValue placeholder={isSpanish ? "Prioridad" : "Priority"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isSpanish ? "Todas" : "All"}</SelectItem>
                <SelectItem value="low">{isSpanish ? "Baja" : "Low"}</SelectItem>
                <SelectItem value="medium">{isSpanish ? "Media" : "Medium"}</SelectItem>
                <SelectItem value="high">{isSpanish ? "Alta" : "High"}</SelectItem>
                <SelectItem value="urgent">{isSpanish ? "Urgente" : "Urgent"}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px] rounded-xl">
                <SelectValue placeholder={isSpanish ? "Rol" : "Role"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isSpanish ? "Todos" : "All"}</SelectItem>
                <SelectItem value="patient">{isSpanish ? "Paciente" : "Patient"}</SelectItem>
                <SelectItem value="professional">{isSpanish ? "Profesional" : "Professional"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tickets List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Card className="border-border/40">
              <CardContent className="p-0">
                <div className="divide-y divide-border/40">
                  {filteredTickets.length === 0 ? (
                    <div className="p-12 text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">
                        {isSpanish ? "No hay tickets de soporte" : "No support tickets"}
                      </p>
                    </div>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <div key={ticket.id} className="p-6 hover:bg-accent/5 transition-colors">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                {getStatusBadge(ticket.status)}
                                {getPriorityBadge(ticket.priority)}
                                <Badge variant="outline">
                                  {ticket.user_role === "patient" 
                                    ? (isSpanish ? "Paciente" : "Patient")
                                    : (isSpanish ? "Profesional" : "Professional")}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(ticket.created_at)}
                                </span>
                              </div>
                              <h3 className="font-bold text-lg mb-2">{ticket.subject}</h3>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <p>
                                  <strong className="text-foreground">{isSpanish ? "Usuario:" : "User:"}</strong>{" "}
                                  {ticket.user?.first_name} {ticket.user?.last_name} ({ticket.user?.email})
                                </p>
                                <p className="mt-2">
                                  <strong className="text-foreground">{isSpanish ? "Mensaje:" : "Message:"}</strong>
                                </p>
                                <p className="text-muted-foreground whitespace-pre-wrap">{ticket.message}</p>
                                {ticket.admin_response && (
                                  <>
                                    <p className="mt-3">
                                      <strong className="text-foreground">{isSpanish ? "Respuesta Admin:" : "Admin Response:"}</strong>
                                    </p>
                                    <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                                      <p className="text-muted-foreground whitespace-pre-wrap">{ticket.admin_response}</p>
                                      {ticket.admin && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                          {isSpanish ? "Por" : "By"} {ticket.admin.first_name} {ticket.admin.last_name}
                                        </p>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTicket(ticket)
                                setReplyDialogOpen(true)
                              }}
                              className="rounded-xl"
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              {isSpanish ? "Responder" : "Reply"}
                            </Button>
                            {ticket.status === "open" && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleAction(ticket.id, "resolve")}
                                className="rounded-xl"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                {isSpanish ? "Resolver" : "Resolve"}
                              </Button>
                            )}
                            {ticket.status !== "closed" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAction(ticket.id, "close")}
                                className="rounded-xl"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                {isSpanish ? "Cerrar" : "Close"}
                              </Button>
                            )}
                            {ticket.priority !== "urgent" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAction(ticket.id, "update")}
                                className="rounded-xl"
                              >
                                <ArrowUp className="h-4 w-4 mr-2" />
                                {isSpanish ? "Escalar" : "Escalate"}
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

        {/* Reply Dialog */}
        <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {isSpanish ? "Responder Ticket" : "Reply to Ticket"}
              </DialogTitle>
              <DialogDescription>
                {selectedTicket && (
                  <>
                    {isSpanish ? "Responder a" : "Replying to"} {selectedTicket.user?.first_name} {selectedTicket.user?.last_name} ({selectedTicket.user?.email})
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm font-medium mb-2">
                  {isSpanish ? "Mensaje:" : "Message:"}
                </p>
                <Textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder={isSpanish 
                    ? "Escribe tu respuesta..."
                    : "Write your reply..."}
                  className="min-h-[150px] rounded-xl"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>
                {isSpanish ? "Cancelar" : "Cancel"}
              </Button>
              <Button onClick={handleReply} disabled={!replyMessage.trim()}>
                <Mail className="h-4 w-4 mr-2" />
                {isSpanish ? "Enviar Respuesta" : "Send Reply"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </RouteGuard>
  )
}
