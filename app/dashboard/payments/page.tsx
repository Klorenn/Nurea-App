"use client"


import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, CheckCircle2, Clock, XCircle, Download, Receipt, Calendar, Loader2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePayments } from "@/hooks/use-payments"
import { LoadingState } from "@/components/dashboard/loading-state"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ErrorState } from "@/components/dashboard/error-state"
import { StatsCard } from "@/components/dashboard/stats-card"

export default function PaymentsPage() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const { payments, loading, error, summary, refetch } = usePayments()

  const paidPayments = payments.filter(p => p.status === "paid")
  const pendingPayments = payments.filter(p => p.status === "pending")
  const refundedPayments = payments.filter(p => p.status === "refunded")

  return (
    <DashboardLayout role="patient">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t.dashboard.payments}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === "es" 
              ? "Gestiona tus pagos y facturas"
              : "Manage your payments and invoices"}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <StatsCard
            title={language === "es" ? "Total Pagado" : "Total Paid"}
            value={`$${summary.totalPaid.toLocaleString()} ${language === "es" ? "CLP" : "CLP"}`}
            description={`${paidPayments.length} ${language === "es" ? "pagos" : "payments"}`}
            icon={CheckCircle2}
            variant="gradient"
          />
          <StatsCard
            title={language === "es" ? "Pendientes" : "Pending"}
            value={`$${summary.totalPending.toLocaleString()} ${language === "es" ? "CLP" : "CLP"}`}
            description={`${pendingPayments.length} ${language === "es" ? "pagos" : "payments"}`}
            icon={Clock}
            variant="outline"
            className="text-orange-600 dark:text-orange-400"
          />
          <StatsCard
            title={language === "es" ? "Estado" : "Status"}
            value={pendingPayments.length === 0 
              ? (language === "es" ? "Al día" : "Up to date")
              : (language === "es" ? "Pendientes" : "Pending")}
            description={pendingPayments.length === 0 
              ? (language === "es" ? "Todo pagado" : "All paid")
              : (language === "es" ? "Pagos pendientes" : "Pending payments")}
            icon={pendingPayments.length === 0 ? CheckCircle2 : Clock}
            variant="outline"
          />
        </div>

        {loading && <LoadingState message={language === "es" ? "Cargando pagos..." : "Loading payments..."} />}
        {error && <ErrorState message={error} action={{ label: language === "es" ? "Reintentar" : "Retry", onClick: refetch }} />}

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-xl bg-accent/20 p-1">
            <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-background">
              {language === "es" ? "Todos" : "All"}
            </TabsTrigger>
            <TabsTrigger value="paid" className="rounded-lg data-[state=active]:bg-background">
              {t.dashboard.completed}
            </TabsTrigger>
            <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-background">
              {language === "es" ? "Pendientes" : "Pending"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {!loading && !error && payments.length === 0 ? (
              <EmptyState
                icon={CreditCard}
                title={language === "es" ? "No hay pagos registrados" : "No payments found"}
                description={language === "es" 
                  ? "Tus pagos aparecerán aquí cuando realices una consulta"
                  : "Your payments will appear here when you make an appointment"}
              />
            ) : (
              payments.map((payment) => (
              <Card key={payment.id} className="border-border/40 hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg">{payment.appointment}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{payment.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              <span>{payment.method}</span>
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            payment.status === "paid"
                              ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400"
                              : payment.status === "pending"
                              ? "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400"
                              : payment.status === "refunded"
                              ? "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
                              : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                          }
                        >
                          {payment.status === "paid" ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {language === "es" ? "Pagado" : "Paid"}
                            </>
                          ) : payment.status === "pending" ? (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              {language === "es" ? "Pendiente" : "Pending"}
                            </>
                          ) : payment.status === "refunded" ? (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              {language === "es" ? "Reembolsado" : "Refunded"}
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              {language === "es" ? "Fallido" : "Failed"}
                            </>
                          )}
                        </Badge>
                      </div>
                      <div className="pt-2">
                        <p className="text-sm font-semibold">
                          {language === "es" ? "ID de Pago:" : "Payment ID:"} {payment.id}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center">
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          ${payment.amount.toLocaleString()} {language === "es" ? "CLP" : "CLP"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {payment.status === "paid" && (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="rounded-xl" 
                            aria-label={language === "es" ? "Descargar recibo" : "Download receipt"}
                            onClick={() => {
                              window.open(`/api/payments/receipt?id=${payment.id}&format=pdf`, '_blank')
                            }}
                          >
                            <Download className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="rounded-xl" 
                          aria-label={language === "es" ? "Ver recibo" : "View receipt"}
                          onClick={() => {
                            window.open(`/api/payments/receipt?id=${payment.id}&format=json`, '_blank')
                          }}
                        >
                          <Receipt className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )))}
          </TabsContent>

          <TabsContent value="paid" className="space-y-4 mt-6">
            {!loading && !error && paidPayments.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title={language === "es" ? "No hay pagos completados" : "No completed payments"}
              />
            ) : (
              paidPayments.map((payment) => (
                <Card key={payment.id} className="border-border/40 hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-lg">{payment.appointment}</h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{payment.date}</span>
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {language === "es" ? "Pagado" : "Paid"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center">
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            ${payment.amount.toLocaleString()} {language === "es" ? "CLP" : "CLP"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="rounded-xl" 
                            aria-label={language === "es" ? "Descargar recibo" : "Download receipt"}
                            onClick={() => {
                              window.open(`/api/payments/receipt?id=${payment.id}&format=pdf`, '_blank')
                            }}
                          >
                            <Download className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="rounded-xl" 
                            aria-label={language === "es" ? "Ver recibo" : "View receipt"}
                            onClick={() => {
                              window.open(`/api/payments/receipt?id=${payment.id}&format=json`, '_blank')
                            }}
                          >
                            <Receipt className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {!loading && !error && pendingPayments.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title={language === "es" ? "No hay pagos pendientes" : "No pending payments"}
                description={t.dashboard.everythingUpToDate}
              />
            ) : (
              pendingPayments.map((payment) => (
                <Card key={payment.id} className="border-border/40 hover:shadow-md transition-all border-orange-500/20">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-lg">{payment.appointment}</h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{payment.date}</span>
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {language === "es" ? "Pendiente" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center">
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            ${payment.amount.toLocaleString()} {language === "es" ? "CLP" : "CLP"}
                          </p>
                        </div>
                        <Button 
                          className="rounded-xl"
                          onClick={() => {
                            if (payment.appointmentId) {
                              window.location.href = `/payment?appointmentId=${payment.appointmentId}`
                            }
                          }}
                        >
                          {language === "es" ? "Pagar Ahora" : "Pay Now"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

