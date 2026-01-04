"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RouteGuard } from "@/components/auth/route-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, 
  TrendingUp, 
  Loader2,
  Calendar,
  CheckCircle2
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { motion } from "framer-motion"

export default function ProfessionalIncomePage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<string>("month")
  const [incomeData, setIncomeData] = useState<any>(null)

  useEffect(() => {
    loadIncome()
  }, [period])

  const loadIncome = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/professional/income?period=${period}`)
      const data = await response.json()

      if (data.success) {
        setIncomeData(data)
      }
    } catch (error) {
      console.error("Error loading income:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isSpanish ? "es-CL" : "en-US", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getPeriodLabel = (period: string) => {
    const labels: Record<string, { es: string; en: string }> = {
      week: { es: "Esta Semana", en: "This Week" },
      month: { es: "Este Mes", en: "This Month" },
      year: { es: "Este Año", en: "This Year" },
      all: { es: "Todo el Período", en: "All Time" },
    }
    return labels[period]?.[isSpanish ? "es" : "en"] || period
  }

  return (
    <RouteGuard requiredRole="professional">
      <DashboardLayout role="professional">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {isSpanish ? "Ingresos" : "Income"}
              </h1>
              <p className="text-muted-foreground">
                {isSpanish 
                  ? "Ingresos calculados desde pagos completados"
                  : "Income calculated from completed payments"}
              </p>
            </div>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">{isSpanish ? "Esta Semana" : "This Week"}</SelectItem>
                <SelectItem value="month">{isSpanish ? "Este Mes" : "This Month"}</SelectItem>
                <SelectItem value="year">{isSpanish ? "Este Año" : "This Year"}</SelectItem>
                <SelectItem value="all">{isSpanish ? "Todo el Período" : "All Time"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : incomeData ? (
            <>
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-primary/10 bg-gradient-to-br from-primary/5 via-background to-transparent">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {isSpanish ? "Ingresos Totales" : "Total Income"}
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(incomeData.income?.total || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {getPeriodLabel(period)}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <Card className="border-primary/10 bg-gradient-to-br from-primary/5 via-background to-transparent">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {isSpanish ? "Pendiente" : "Pending"}
                      </CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(incomeData.income?.pending || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isSpanish ? "Citas pagadas no completadas" : "Paid appointments not completed"}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="border-primary/10 bg-gradient-to-br from-primary/5 via-background to-transparent">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {isSpanish ? "Citas Completadas" : "Completed Appointments"}
                      </CardTitle>
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {incomeData.income?.count || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isSpanish ? "Citas en este período" : "Appointments in this period"}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <Card className="border-primary/10 bg-gradient-to-br from-primary/5 via-background to-transparent">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {isSpanish ? "Promedio por Cita" : "Average per Appointment"}
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(incomeData.income?.average || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isSpanish ? "Ingreso promedio" : "Average income"}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Breakdown */}
              {incomeData.breakdown && incomeData.breakdown.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {isSpanish ? "Desglose de Ingresos" : "Income Breakdown"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {incomeData.breakdown.map((item: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="flex items-center justify-between p-3 rounded-lg border border-border/40"
                        >
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(item.date).toLocaleDateString(
                                isSpanish ? "es-ES" : "en-US",
                                { year: "numeric", month: "short", day: "numeric" }
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{formatCurrency(item.amount)}</span>
                            <Badge variant="outline" className="text-xs">
                              {item.status === "completed" 
                                ? (isSpanish ? "Completada" : "Completed")
                                : item.status}
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {isSpanish 
                    ? "No hay datos de ingresos disponibles"
                    : "No income data available"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </RouteGuard>
  )
}

