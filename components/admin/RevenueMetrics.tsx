"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreditCard, Coins, TrendingUp, Loader2 } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

interface PaymentData {
  id: string
  amount: number
  currency: string
  status: string
  payer_email: string | null
  created_at: string
  payment_method?: string
  profile_id: string | null
  profiles?: {
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  } | null
}

interface RevenueStats {
  totalRevenue: number
  subscriptionsCount: number
  micropaymentsCount: number
  revenueThisMonth: number
  revenueLastMonth: number
}

const PAYMENT_METHOD_COLORS: Record<string, string> = {
  mercadopago: "#0d9488",
  stellar: "#8b5cf6",
  stripe: "#3b82f6",
  default: "#64748b"
}

export function RevenueMetrics() {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<PaymentData[]>([])
  const [stats, setStats] = useState<RevenueStats>({
    totalRevenue: 0,
    subscriptionsCount: 0,
    micropaymentsCount: 0,
    revenueThisMonth: 0,
    revenueLastMonth: 0
  })

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const now = new Date()
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()

        const [
          paymentsRes,
          activeSubsRes,
          totalRevenueRes,
          thisMonthRevenueRes,
          lastMonthRevenueRes
        ] = await Promise.all([
          supabase
            .from("nurea_subscription_payments")
            .select(`
              id,
              amount,
              currency,
              status,
              payer_email,
              created_at,
              payment_method,
              profile_id,
              profiles:profile_id(first_name, last_name, avatar_url)
            `)
            .eq("status", "approved")
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("subscription_status", "active"),
          supabase
            .from("nurea_subscription_payments")
            .select("amount")
            .eq("status", "approved"),
          supabase
            .from("nurea_subscription_payments")
            .select("amount")
            .eq("status", "approved")
            .gte("created_at", startOfThisMonth),
          supabase
            .from("nurea_subscription_payments")
            .select("amount")
            .eq("status", "approved")
            .gte("created_at", startOfLastMonth)
            .lt("created_at", startOfThisMonth)
        ])

        const paymentsData = (paymentsRes.data || []) as unknown as PaymentData[]
        const allPayments = totalRevenueRes.data || []
        const thisMonthPayments = thisMonthRevenueRes.data || []
        const lastMonthPayments = lastMonthRevenueRes.data || []

        const totalRevenue = allPayments.reduce((sum, p) => sum + Number(p.amount), 0)
        const revenueThisMonth = thisMonthPayments.reduce((sum, p) => sum + Number(p.amount), 0)
        const revenueLastMonth = lastMonthPayments.reduce((sum, p) => sum + Number(p.amount), 0)

        const micropaymentsCount = paymentsData.filter(p => 
          p.payment_method?.toLowerCase().includes("stellar") || 
          p.payment_method?.toLowerCase().includes("crypto") ||
          p.currency?.toLowerCase() === "usdc"
        ).length

        setPayments(paymentsData)
        setStats({
          totalRevenue,
          subscriptionsCount: activeSubsRes.count ?? 0,
          micropaymentsCount,
          revenueThisMonth,
          revenueLastMonth
        })
      } catch (err) {
        console.error("Error loading revenue data:", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [supabase])

  const formatCurrency = (amount: number, currency: string = "CLP") => {
    if (currency.toLowerCase() === "usdc") {
      return `${amount.toFixed(2)} USDC`
    }
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "dd/MM/yyyy", { locale: es })
    } catch {
      return dateStr
    }
  }

  const revenueChange = stats.revenueLastMonth > 0
    ? ((stats.revenueThisMonth - stats.revenueLastMonth) / stats.revenueLastMonth * 100)
    : 0

  const getRevenueByMethod = () => {
    const methodMap = new Map<string, number>()
    payments.forEach(p => {
      const method = p.payment_method || "other"
      const current = methodMap.get(method) || 0
      methodMap.set(method, current + Number(p.amount))
    })
    return Array.from(methodMap.entries()).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: PAYMENT_METHOD_COLORS[name.toLowerCase()] || PAYMENT_METHOD_COLORS.default
    }))
  }

  const revenueByMethod = getRevenueByMethod()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-white/5 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> {isSpanish ? "Ingresos Totales" : "Total Revenue"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className={cn(
              "text-xs mt-1",
              revenueChange >= 0 ? "text-teal-400" : "text-red-400"
            )}>
              {revenueChange >= 0 ? "+" : ""}{revenueChange.toFixed(1)}% {isSpanish ? "desde el mes pasado" : "since last month"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/5 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> {isSpanish ? "Suscripciones" : "Subscriptions"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.subscriptionsCount}</div>
            <p className="text-xs text-slate-500 mt-1">
              {isSpanish ? "Suscripciones Pro activas" : "Active Pro subscriptions"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/5 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Coins className="w-4 h-4" /> Micropagos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.micropaymentsCount}</div>
            <p className="text-xs text-purple-400 mt-1">
              {isSpanish ? "Pagos vía crypto/other" : "Crypto/other payments"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-white/5 text-white">
          <CardHeader>
            <CardTitle>{isSpanish ? "Procedencia de Ingresos" : "Revenue Sources"}</CardTitle>
            <CardDescription className="text-slate-500">
              {isSpanish ? "Distribución por método de pago" : "Distribution by payment method"}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {revenueByMethod.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByMethod}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {revenueByMethod.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                <p>{isSpanish ? "Sin datos de ingresos" : "No revenue data"}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/5 text-white">
          <CardHeader>
            <CardTitle>{isSpanish ? "Últimas Transacciones" : "Latest Transactions"}</CardTitle>
            <CardDescription className="text-slate-500">
              {isSpanish ? "Suscripciones y actividad reciente" : "Subscriptions and recent activity"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-slate-400">{isSpanish ? "Usuario" : "User"}</TableHead>
                    <TableHead className="text-slate-400">{isSpanish ? "Método" : "Method"}</TableHead>
                    <TableHead className="text-slate-400">{isSpanish ? "Monto" : "Amount"}</TableHead>
                    <TableHead className="text-slate-400 text-right">{isSpanish ? "Fecha" : "Date"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.slice(0, 5).map((tx) => (
                    <TableRow key={tx.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-medium">
                        {tx.profiles 
                          ? `${tx.profiles.first_name || ""} ${tx.profiles.last_name || ""}`.trim() || tx.payer_email
                          : tx.payer_email || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {tx.payment_method?.toLowerCase().includes("stellar") || tx.currency?.toLowerCase() === "usdc" ? (
                            <Coins className="w-3 h-3 text-purple-400" />
                          ) : (
                            <CreditCard className="w-3 h-3 text-teal-400" />
                          )}
                          <span className="text-xs">{tx.payment_method || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {formatCurrency(Number(tx.amount), tx.currency)}
                      </TableCell>
                      <TableCell className="text-right text-xs text-slate-400">
                        {formatDate(tx.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10 text-slate-500">
                <p>{isSpanish ? "Sin transacciones registradas" : "No transactions recorded"}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
