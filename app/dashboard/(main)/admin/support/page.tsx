"use client"

import React, { useState, useEffect } from 'react'
import { 
  Inbox, 
  Search, 
  CheckCircle2, 
  Clock, 
  User, 
  Check,
  Loader2,
  Mail,
  ArrowRight
} from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { RouteGuard } from "@/components/auth/route-guard"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

interface Ticket {
  id: string
  subject: string
  message: string
  status: TicketStatus | string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  created_at: string
  user_id: string
  user_role: string
  admin_response?: string
  user: {
    first_name: string | null
    last_name: string | null
    email: string
    role: string
  }
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [replyMessage, setReplyMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    fetchTickets()

    // Realtime subscription — use a unique channel name to avoid conflicts on filter change
    const channelName = `support_tickets_changes_${filter}_${Date.now()}`
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => {
        fetchTickets()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [filter])

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams()
      if (filter === 'open') params.append("status", "open")
      else if (filter === 'resolved') params.append("status", "resolved")

      const response = await fetch(`/api/admin/tickets?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setTickets(data.tickets || [])
      }
    } catch (error) {
      console.error("Error loading tickets:", error)
      toast.error("Error al cargar los tickets")
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (ticketId: string, action: string, message?: string) => {
    if (action === 'respond') setIsSubmitting(true)
    
    try {
      const response = await fetch("/api/admin/tickets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          action,
          response: message,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "No se pudo realizar la acción")
      }

      toast.success(
        action === 'resolve' ? "Ticket resuelto" : 
        action === 'respond' ? "Respuesta enviada" : "Ticket actualizado"
      )
      
      if (action === 'respond') {
        setReplyDialogOpen(false)
        setSelectedTicket(null)
        setReplyMessage("")
      }
      
      await fetchTickets()
    } catch (error) {
      console.error("Error performing action:", error)
      toast.error(error instanceof Error ? error.message : "Error en la operación")
    } finally {
      if (action === 'respond') setIsSubmitting(false)
    }
  }

  // Normalizar status: 'closed' → 'resolved'
  const normalizeStatus = (status: string) => status === 'closed' ? 'resolved' : status
  const normalizedTickets = tickets.map(t => ({ ...t, status: normalizeStatus(t.status) }))

  const filteredTickets = normalizedTickets.filter(t => 
    t.subject.toLowerCase().includes(search.toLowerCase()) ||
    t.user?.email.toLowerCase().includes(search.toLowerCase()) ||
    (`${t.user?.first_name} ${t.user?.last_name}`).toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: normalizedTickets.length,
    open: normalizedTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length,
    resolved: normalizedTickets.filter(t => t.status === 'resolved').length
  }

  return (
    <RouteGuard requiredRole="admin">
      
        <div className="space-y-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <Inbox className="h-8 w-8 text-teal-600" />
                Centro de Soporte
              </h1>
              <p className="text-slate-500 font-medium mt-1">Inbox centralizado de atención técnica y soporte.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 px-4 py-1.5 rounded-full text-xs font-bold">
                {stats.open} Pendientes
              </Badge>
              <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 px-4 py-1.5 rounded-full text-xs font-bold">
                {stats.resolved} Resueltos
              </Badge>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar por asunto, email o nombre..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-11 bg-transparent border-none focus-visible:ring-0 text-sm font-medium"
              />
            </div>
            
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'open', label: 'Pendientes' },
                { id: 'resolved', label: 'Resueltos' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFilter(opt.id as any)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-none",
                    filter === opt.id 
                      ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white" 
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tickets List */}
          <div className="grid gap-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
                <p className="font-medium">Cargando tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl mb-6">
                  <CheckCircle2 className="h-12 w-12 text-teal-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">¡Todo al día!</h3>
                <p className="text-slate-500 max-w-xs mx-auto mt-2 font-medium">No hay tickets pendientes que requieran tu atención.</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <Card 
                  key={ticket.id}
                  className={cn(
                    "group transition-all duration-300 hover:shadow-xl hover:border-teal-500/20 rounded-2xl border-slate-200 dark:border-slate-800 overflow-hidden",
                    ticket.status === 'resolved' && "opacity-75"
                  )}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Left Column: Profile & Summary */}
                      <div className="flex-1 p-6 md:p-8">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                            <User className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 dark:text-white">
                                {ticket.user?.first_name} {ticket.user?.last_name}
                              </h4>
                              <Badge variant="secondary" className="text-[10px] uppercase font-black tracking-tighter h-5 px-1.5 bg-slate-100 dark:bg-slate-800">
                                {ticket.user_role || (ticket.user?.role === 'professional' ? 'PRO' : 'PACIENTE')}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">{ticket.user?.email}</p>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-teal-600 transition-colors">
                          {ticket.subject}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 font-medium bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                          {ticket.message}
                        </p>
                        
                        {ticket.admin_response && (
                          <div className="mb-6 p-4 rounded-xl bg-teal-50/50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/30">
                            <div className="flex items-center gap-2 mb-2 text-teal-700 dark:text-teal-400 text-xs font-black uppercase tracking-widest">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Respuesta Enviada
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                              "{ticket.admin_response}"
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 font-bold uppercase tracking-widest">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {format(new Date(ticket.created_at), "d 'de' MMMM, HH:mm", { locale: es })}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              ticket.priority === 'urgent' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse" :
                              ticket.priority === 'high' ? "bg-orange-500" :
                              ticket.priority === 'medium' ? "bg-blue-500" : "bg-slate-300"
                            )} />
                            Prioridad {ticket.priority}
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Actions */}
                      <div className="md:w-64 bg-slate-50/50 dark:bg-slate-900/30 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 p-8 flex flex-col justify-center items-center gap-4">
                        {ticket.status === 'resolved' ? (
                          <div className="flex flex-col items-center gap-2 text-emerald-600">
                            <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full p-2">
                              <Check className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">Resuelto</span>
                          </div>
                        ) : (
                          <div className="w-full space-y-3">
                            <Button 
                              onClick={() => {
                                setSelectedTicket(ticket)
                                setReplyDialogOpen(true)
                              }}
                              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 font-bold shadow-lg"
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              Responder
                            </Button>
                            
                            <Button 
                              onClick={() => handleAction(ticket.id, 'resolve')}
                              variant="outline"
                              className="w-full border-emerald-200 text-emerald-600 hover:bg-emerald-50 rounded-xl h-11 font-bold"
                            >
                              Resolver
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Reply Dialog */}
        <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
          <DialogContent className="max-w-2xl border-none shadow-2xl rounded-3xl p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded-xl">
                  <Mail className="h-6 w-6 text-slate-900" />
                </div>
                Responder Ticket
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium pt-2">
                {selectedTicket && (
                  <>
                    Enviando respuesta a <span className="text-slate-900 font-bold">{selectedTicket.user?.first_name} {selectedTicket.user?.last_name}</span>. El ticket pasará a estado 'En Progreso'.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <Textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Escribe tu respuesta aquí..."
                className="min-h-[200px] rounded-2xl border-slate-100 bg-slate-50/50 p-6 text-slate-700 font-medium focus:ring-teal-500 resize-none"
              />
            </div>
            
            <DialogFooter className="gap-3 sm:gap-0">
              <Button 
                variant="ghost" 
                onClick={() => setReplyDialogOpen(false)} 
                className="rounded-xl h-12 px-6 font-bold"
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => handleAction(selectedTicket!.id, 'respond', replyMessage)} 
                disabled={!replyMessage.trim() || isSubmitting}
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-12 px-10 font-bold shadow-xl shadow-teal-500/20"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Enviar Respuesta"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      
    </RouteGuard>
  )
}
