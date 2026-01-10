"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, CheckCircle2, Clock, XCircle, Download, Receipt, Calendar } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const payments = [
  {
    id: "PAY-001",
    appointment: "Dr. Elena Vargas - Psicología",
    date: "Oct 5, 2024",
    amount: 45000,
    status: "Paid",
    method: "Credit Card",
  },
  {
    id: "PAY-002",
    appointment: "Dr. Marco Polo - Cardiología",
    date: "Sep 28, 2024",
    amount: 55000,
    status: "Paid",
    method: "Credit Card",
  },
  {
    id: "PAY-003",
    appointment: "Dr. Sofia Rossi - Dermatología",
    date: "Oct 15, 2024",
    amount: 45000,
    status: "Pending",
    method: "Credit Card",
  },
]

export default function PaymentsPage() {
  const { language } = useLanguage()
  const t = useTranslations(language)

  const paidPayments = payments.filter(p => p.status === "Paid")
  const pendingPayments = payments.filter(p => p.status === "Pending")
  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0)

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
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === "es" ? "Total Pagado" : "Total Paid"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ${totalPaid.toLocaleString()} {language === "es" ? "CLP" : "CLP"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {paidPayments.length} {language === "es" ? "pagos" : "payments"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === "es" ? "Pendientes" : "Pending"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                ${totalPending.toLocaleString()} {language === "es" ? "CLP" : "CLP"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {pendingPayments.length} {language === "es" ? "pagos" : "payments"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === "es" ? "Estado" : "Status"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingPayments.length === 0 ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    {language === "es" ? "Al día" : "Up to date"}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                    {language === "es" ? "Pagos pendientes" : "Pending payments"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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
            {payments.map((payment) => (
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
                            payment.status === "Paid"
                              ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400"
                              : "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400"
                          }
                        >
                          {payment.status === "Paid" ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {language === "es" ? "Pagado" : "Paid"}
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              {language === "es" ? "Pendiente" : "Pending"}
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
                        {payment.status === "Paid" && (
                          <Button variant="outline" size="icon" className="rounded-xl" aria-label={language === "es" ? "Descargar recibo" : "Download receipt"}>
                            <Download className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        )}
                        <Button variant="outline" size="icon" className="rounded-xl" aria-label={language === "es" ? "Ver recibo" : "View receipt"}>
                          <Receipt className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="paid" className="space-y-4 mt-6">
            {paidPayments.length > 0 ? (
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
                          <Button variant="outline" size="icon" className="rounded-xl" aria-label={language === "es" ? "Descargar recibo" : "Download receipt"}>
                            <Download className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          <Button variant="outline" size="icon" className="rounded-xl" aria-label={language === "es" ? "Ver recibo" : "View receipt"}>
                            <Receipt className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-border/40">
                <CardContent className="p-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground font-medium">
                    {language === "es" ? "No hay pagos completados" : "No completed payments"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {pendingPayments.length > 0 ? (
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
                        <Button className="rounded-xl">
                          {language === "es" ? "Pagar Ahora" : "Pay Now"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-border/40">
                <CardContent className="p-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground font-medium">
                    {language === "es" ? "No hay pagos pendientes" : "No pending payments"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t.dashboard.everythingUpToDate}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

