"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { RouteGuard } from "@/components/auth/route-guard"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Search, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { createClient } from "@/lib/supabase/client"

export default function AdminPaymentsPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const supabase = createClient()

  useEffect(() => {
    loadPayments()
  }, [statusFilter])

  const loadPayments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)

      const response = await fetch(`/api/admin/payments?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setPayments(data.payments || [])
      }
    } catch (error) {
      console.error("Error loading payments:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPayments = payments.filter((payment) => {
    const query = searchQuery.toLowerCase()
    return (
      payment.patient?.first_name?.toLowerCase().includes(query) ||
      payment.patient?.last_name?.toLowerCase().includes(query) ||
      payment.patient?.email?.toLowerCase().includes(query) ||
      payment.id?.toLowerCase().includes(query)
    )
  })

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { label: string; icon: any; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: isSpanish ? "Pendiente" : "Pending", icon: Clock, variant: "outline" },
      paid: { label: isSpanish ? "Pagado" : "Paid", icon: CheckCircle2, variant: "default" },
      failed: { label: isSpanish ? "Fallido" : "Failed", icon: XCircle, variant: "destructive" },
      refunded: { label: isSpanish ? "Reembolsado" : "Refunded", icon: XCircle, variant: "outline" },
    }
    const statusInfo = statuses[status] || statuses.pending
    const Icon = statusInfo.icon
    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === "es" ? "es-ES" : "en-US",
      { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
    )
  }

  const totalAmount = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)

  return (
    <RouteGuard requiredRole="admin">
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-primary" />
                {isSpanish ? "Pagos" : "Payments"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {isSpanish 
                  ? "Ver historial de pagos de la plataforma"
                  : "View platform payment history"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {isSpanish ? "Total Pagado:" : "Total Paid:"}
              </p>
              <p className="text-2xl font-bold">
                ${totalAmount.toLocaleString()} CLP
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isSpanish ? "Buscar pagos..." : "Search payments..."}
                className="pl-10 rounded-xl bg-accent/20 border-none h-12"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isSpanish ? "Todos" : "All"}</SelectItem>
                <SelectItem value="pending">{isSpanish ? "Pendientes" : "Pending"}</SelectItem>
                <SelectItem value="paid">{isSpanish ? "Pagados" : "Paid"}</SelectItem>
                <SelectItem value="failed">{isSpanish ? "Fallidos" : "Failed"}</SelectItem>
                <SelectItem value="refunded">{isSpanish ? "Reembolsados" : "Refunded"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payments List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Card className="border-border/40">
              <CardContent className="p-0">
                <div className="divide-y divide-border/40">
                  {filteredPayments.length === 0 ? (
                    <div className="p-12 text-center">
                      <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">
                        {isSpanish ? "No se encontraron pagos" : "No payments found"}
                      </p>
                    </div>
                  ) : (
                    filteredPayments.map((payment) => (
                      <div key={payment.id} className="p-6 hover:bg-accent/5 transition-colors">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getStatusBadge(payment.status)}
                              <Badge variant="outline">
                                {payment.payment_method}
                              </Badge>
                            </div>
                            <h3 className="font-bold text-lg mb-2">
                              {payment.patient?.first_name} {payment.patient?.last_name}
                            </h3>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>
                                <strong className="text-foreground">{isSpanish ? "Monto:" : "Amount:"}</strong>{" "}
                                ${payment.amount?.toLocaleString()} {payment.currency?.toUpperCase()}
                              </p>
                              {payment.appointment && (
                                <p>
                                  <strong className="text-foreground">{isSpanish ? "Cita:" : "Appointment:"}</strong>{" "}
                                  {formatDate(payment.appointment.appointment_date)}
                                </p>
                              )}
                              {payment.paid_at && (
                                <p>
                                  <strong className="text-foreground">{isSpanish ? "Pagado:" : "Paid:"}</strong>{" "}
                                  {formatDate(payment.paid_at)}
                                </p>
                              )}
                              <p className="text-xs">
                                ID: {payment.id.substring(0, 8)}...
                              </p>
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
      </AdminLayout>
    </RouteGuard>
  )
}

