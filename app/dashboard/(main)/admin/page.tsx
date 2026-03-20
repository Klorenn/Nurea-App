"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, type Variants } from "framer-motion"
import {
  TrendingUp,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  ArrowRight,
  MessageSquare,
  Power,
  Heart,
  Quote,
  Star,
  CheckCircle,
  RefreshCw,
  Users,
  Banknote,
  Link2,
  Copy,
  ExternalLink,
  CreditCard,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/contexts/language-context"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { RouteGuard } from "@/components/auth/route-guard"
import { cn } from "@/lib/utils"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, subDays, startOfMonth, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

const PRO_PRICE = 29990

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
}

interface ChartPoint { name: string; citas: number }
interface SubPayment {
  id: string
  amount: number
  currency: string
  status: string
  payer_email: string | null
  created_at: string
  profile_id: string | null
  profiles?: { first_name: string | null; last_name: string | null; avatar_url: string | null } | null
}

export default function AdminPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  const [stats, setStats] = useState({
    mrr: 0,
    activeSubscriptions: 0,
    trialingSubscriptions: 0,
    openTickets: 0,
    pendingDoctors: 0,
    pendingSubscriptions: 0,
    activeAppointments: 0,
    totalProfessionals: 0,
    totalPatients: 0,
    // Trends (vs last month)
    newSubsThisMonth: 0,
    newSubsLastMonth: 0,
    revenueThisMonth: 0,
  })

  const [pendingCredentials, setPendingCredentials] = useState<any[]>([])
  const [pendingSubscriptionsTable, setPendingSubscriptionsTable] = useState<any[]>([])
  const [recentReviews, setRecentReviews] = useState<any[]>([])
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [recentPayments, setRecentPayments] = useState<SubPayment[]>([])

  // Payment link dialog
  const [paymentLinkDialog, setPaymentLinkDialog] = useState<{
    open: boolean
    loading: boolean
    url: string | null
    email: string | null
    amount: number | null
    isYearly: boolean
  }>({ open: false, loading: false, url: null, email: null, amount: null, isYearly: false })

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)

    try {
      const now = new Date()
      const thisMonthStart = startOfMonth(now).toISOString()
      const lastMonthStart = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1)).toISOString()
      const thirtyDaysAgo = subDays(now, 30).toISOString()

      const [
        credCountRes,
        credListRes,
        reviewsRes,
        appointmentsRes,
        ticketsRes,
        pendingSubsRes,
        activeSubsRes,
        trialingSubsRes,
        profsRes,
        patientsRes,
        newSubsThisMonthRes,
        newSubsLastMonthRes,
        recentPaymentsRes,
        revenueThisMonthRes,
      ] = await Promise.all([
        supabase.from("professional_credentials").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("professional_credentials")
          .select("id, type, created_at, profiles:professional_id(first_name, last_name, avatar_url)")
          .eq("status", "pending").order("created_at", { ascending: true }).limit(10),
        supabase.from("reviews")
          .select("*, profiles:patient_id(first_name, avatar_url)")
          .order("created_at", { ascending: false }).limit(3),
        supabase.from("appointments")
          .select("appointment_date, created_at, status")
          .gte("created_at", thirtyDaysAgo),
        supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("profiles").select("id, first_name, last_name, email, avatar_url, created_at, selected_plan_id")
          .eq("subscription_status", "pending_approval"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("subscription_status", "active"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("subscription_status", "trialing"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "professional"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "patient"),
        supabase.from("profiles").select("id", { count: "exact", head: true })
          .eq("subscription_status", "active").gte("updated_at", thisMonthStart),
        supabase.from("profiles").select("id", { count: "exact", head: true })
          .eq("subscription_status", "active")
          .gte("updated_at", lastMonthStart).lt("updated_at", thisMonthStart),
        supabase.from("nurea_subscription_payments")
          .select("id, amount, currency, status, payer_email, created_at, profile_id")
          .eq("status", "approved")
          .order("created_at", { ascending: false }).limit(10),
        supabase.from("nurea_subscription_payments")
          .select("amount")
          .eq("status", "approved")
          .gte("created_at", thisMonthStart),
      ])

      // Build chart: last 30 days, appointments per day
      const appointments = appointmentsRes.data || []
      const dayMap = new Map<string, number>()
      for (let i = 29; i >= 0; i--) {
        const d = format(subDays(now, i), "dd/MM")
        dayMap.set(d, 0)
      }
      appointments.forEach(a => {
        const raw = a.appointment_date || a.created_at
        if (!raw) return
        try {
          const d = format(parseISO(raw.slice(0, 10)), "dd/MM")
          if (dayMap.has(d)) dayMap.set(d, (dayMap.get(d) ?? 0) + 1)
        } catch {
          // Ignore parse errors for invalid dates
        }
      })
      const chart: ChartPoint[] = Array.from(dayMap.entries()).map(([name, citas]) => ({ name, citas }))
      setChartData(chart)

      const activeSubs = activeSubsRes.count ?? 0
      const mrr = activeSubs * PRO_PRICE
      const revenueThisMonth = (revenueThisMonthRes.data || []).reduce((s, p) => s + Number(p.amount), 0)

      // Enrich recent payments with profile info
      const paymentsList: SubPayment[] = recentPaymentsRes.data || []
      const profileIds = paymentsList.map(p => p.profile_id).filter(Boolean)
      let profileMap: Record<string, any> = {}
      if (profileIds.length > 0) {
        const { data: profData } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, avatar_url")
          .in("id", profileIds)
        ;(profData || []).forEach(p => { profileMap[p.id] = p })
      }
      const enrichedPayments = paymentsList.map(p => ({
        ...p,
        profiles: p.profile_id ? profileMap[p.profile_id] ?? null : null,
      }))

      setStats({
        mrr,
        activeSubscriptions: activeSubs,
        trialingSubscriptions: trialingSubsRes.count ?? 0,
        openTickets: ticketsRes.count ?? 0,
        pendingDoctors: (credCountRes.count ?? 0) + (pendingSubsRes.data?.length ?? 0),
        pendingSubscriptions: pendingSubsRes.data?.length ?? 0,
        activeAppointments: appointments.filter(a => a.status === "confirmed" || a.status === "pending").length,
        totalProfessionals: profsRes.count ?? 0,
        totalPatients: patientsRes.count ?? 0,
        newSubsThisMonth: newSubsThisMonthRes.count ?? 0,
        newSubsLastMonth: newSubsLastMonthRes.count ?? 0,
        revenueThisMonth,
      })

      setPendingCredentials(credListRes.data || [])
      setPendingSubscriptionsTable(pendingSubsRes.data || [])
      setRecentReviews(reviewsRes.data || [])
      setRecentPayments(enrichedPayments)
    } catch (err) {
      console.error("Admin dashboard error:", err)
      toast.error("Error al sincronizar datos del centro de mando")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [supabase])

  useEffect(() => {
    loadData()
    const interval = setInterval(() => loadData(true), 60_000)
    return () => clearInterval(interval)
  }, [loadData])

  const toggleMaintenance = () => {
    setMaintenanceMode(m => !m)
    toast.warning(maintenanceMode ? "Modo mantenimiento desactivado" : "NUREA en modo mantenimiento")
  }

  const approveSubscription = async (profileId: string, months: number) => {
    try {
      const trialEnd = new Date()
      trialEnd.setMonth(trialEnd.getMonth() + months)
      const { error } = await supabase.from("profiles").update({
        subscription_status: months > 0 ? "trialing" : "active",
        trial_end_date: trialEnd.toISOString(),
      }).eq("id", profileId)
      if (error) throw error
      toast.success(isSpanish ? `Suscripción aprobada` : "Subscription approved")
      setPendingSubscriptionsTable(prev => prev.filter(p => p.id !== profileId))
      setStats(prev => ({ ...prev, pendingSubscriptions: prev.pendingSubscriptions - 1 }))
    } catch {
      toast.error(isSpanish ? "Error al aprobar suscripción" : "Error approving subscription")
    }
  }

  const generatePaymentLink = async (profileId: string, isYearly = false) => {
    setPaymentLinkDialog({ open: true, loading: true, url: null, email: null, amount: null, isYearly })
    try {
      const res = await fetch("/api/admin/subscriptions/payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, isYearly }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error generando link")
      setPaymentLinkDialog({
        open: true,
        loading: false,
        url: data.url,
        email: data.professionalEmail,
        amount: data.amount,
        isYearly,
      })
      // Remove from pending list — now waiting for payment
      setPendingSubscriptionsTable(prev => prev.filter(p => p.id !== profileId))
      setStats(prev => ({ ...prev, pendingSubscriptions: Math.max(0, prev.pendingSubscriptions - 1) }))
    } catch (err: any) {
      setPaymentLinkDialog({ open: false, loading: false, url: null, email: null, amount: null, isYearly: false })
      toast.error(err.message ?? "Error al generar el link de pago")
    }
  }

  const copyPaymentLink = () => {
    if (!paymentLinkDialog.url) return
    navigator.clipboard.writeText(paymentLinkDialog.url)
    toast.success("Link copiado al portapapeles")
  }

  // Real elapsed time
  const hoursAgo = (iso: string) => {
    const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600_000)
    return h < 1 ? "< 1h" : `${h}h`
  }

  // Trend vs last month
  const subTrend = stats.newSubsThisMonth - stats.newSubsLastMonth
  const subTrendLabel = subTrend === 0 ? "igual" : subTrend > 0 ? `+${subTrend} vs mes ant.` : `${subTrend} vs mes ant.`

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600 mx-auto" />
        <p className="text-sm text-slate-500 font-bold animate-pulse uppercase tracking-widest">
          Sincronizando Centro de Mando...
        </p>
      </div>
    </div>
  )

  return (
    <RouteGuard requiredRole="admin">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 pb-20">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[22px] bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/20 text-white">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
                Master Dashboard
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black px-2 py-0 text-[10px] uppercase">
                  Sistema Online
                </Badge>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Control de Plataforma NUREA
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="rounded-2xl h-12 w-12 border-slate-200"
              title="Actualizar datos"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            </Button>
            <div className="flex items-center gap-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-2 rounded-3xl border border-slate-200 dark:border-slate-700">
              <div className="px-4 py-2">
                <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Estado Global</p>
                <p className={cn("text-sm font-black uppercase", maintenanceMode ? "text-red-500" : "text-emerald-500")}>
                  {maintenanceMode ? "Mantenimiento Activo" : "Operativo al 100%"}
                </p>
              </div>
              <Button
                onClick={toggleMaintenance}
                className={cn(
                  "rounded-2xl px-6 h-12 font-black gap-2 transition-all shadow-lg",
                  maintenanceMode
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                    : "bg-red-600 hover:bg-red-700 shadow-red-600/20"
                )}
              >
                <Power className="h-4 w-4" />
                {maintenanceMode ? "Reactivar Sistema" : "Kill Switch"}
              </Button>
            </div>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "MRR (Ingresos Recurrentes)",
              val: `$${stats.mrr.toLocaleString("es-CL")}`,
              detail: `${stats.activeSubscriptions} suscripciones Pro activas`,
              icon: TrendingUp,
              color: "text-teal-600",
              bg: "bg-teal-50 dark:bg-teal-950/30",
              trend: subTrendLabel,
              positive: subTrend >= 0,
            },
            {
              label: "Ingresos Este Mes",
              val: `$${stats.revenueThisMonth.toLocaleString("es-CL")}`,
              detail: "Pagos aprobados del mes actual",
              icon: Banknote,
              color: "text-emerald-600",
              bg: "bg-emerald-50 dark:bg-emerald-950/30",
              trend: stats.revenueThisMonth > 0 ? "✓ Recibido" : "Sin pagos aún",
              positive: stats.revenueThisMonth > 0,
            },
            {
              label: "Tickets Abiertos",
              val: stats.openTickets,
              detail: "Soporte al paciente",
              icon: MessageSquare,
              color: "text-blue-600",
              bg: "bg-blue-50 dark:bg-blue-950/30",
              trend: stats.openTickets === 0 ? "Todo resuelto" : `${stats.openTickets} pendientes`,
              positive: stats.openTickets === 0,
            },
            {
              label: "Doctores Pendientes",
              val: stats.pendingDoctors,
              detail: "KYP por verificar",
              icon: ShieldCheck,
              color: "text-amber-600",
              bg: "bg-amber-50 dark:bg-amber-950/30",
              trend: stats.pendingDoctors === 0 ? "Al día" : `${stats.pendingDoctors} por revisar`,
              positive: stats.pendingDoctors === 0,
            },
          ].map((kpi, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card className="border-border/40 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40 rounded-[32px] overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                <CardContent className="p-7">
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn("p-4 rounded-2xl", kpi.bg)}>
                      <kpi.icon className={cn("h-6 w-6", kpi.color)} />
                    </div>
                    <Badge className={cn(
                      "font-bold text-[10px] px-2 py-0.5 rounded-lg border-0",
                      kpi.positive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                    )}>
                      {kpi.trend}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">{kpi.val}</h3>
                    <p className="text-xs text-slate-500 mt-2 font-medium">{kpi.detail}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 h-14 flex-wrap">
            <TabsTrigger value="overview" className="rounded-xl px-6 font-black text-sm data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm h-full">
              Vista General
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="rounded-xl px-6 font-black text-sm data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm h-full">
              Suscripciones {stats.pendingSubscriptions > 0 && <Badge className="ml-2 bg-teal-500 text-white border-0">{stats.pendingSubscriptions}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="finances" className="rounded-xl px-6 font-black text-sm data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm h-full">
              Finanzas {recentPayments.length > 0 && <Badge className="ml-2 bg-emerald-500 text-white border-0">{recentPayments.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          {/* ── VISTA GENERAL ──────────────────────────────────────────────── */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-3">

              {/* Chart: citas por día (real) */}
              <Card className="lg:col-span-2 border-border/40 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40 rounded-[40px] overflow-hidden">
                <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">Actividad de Citas</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">Citas creadas (últimos 30 días)</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {chartData.every(d => d.citas === 0) ? (
                    <div className="h-[300px] flex items-center justify-center text-slate-400 dark:text-slate-600 flex-col gap-3">
                      <TrendingUp className="h-10 w-10 opacity-30" />
                      <p className="text-sm font-bold">Sin citas en los últimos 30 días</p>
                    </div>
                  ) : (
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="masterGraph" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0f766e" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis
                            dataKey="name"
                            axisLine={false} tickLine={false}
                            tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 700 }}
                            interval={4} dy={10}
                          />
                          <YAxis
                            axisLine={false} tickLine={false}
                            tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 700 }}
                            allowDecimals={false}
                          />
                          <Tooltip
                            contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 40px rgba(0,0,0,0.1)", fontWeight: "bold" }}
                            formatter={(v: any) => [`${v} cita${v !== 1 ? "s" : ""}`, ""]}
                          />
                          <Area type="monotone" dataKey="citas" stroke="#0f766e" strokeWidth={3} fillOpacity={1} fill="url(#masterGraph)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Muro de Felicidad */}
              <Card className="border-border/40 bg-slate-900 shadow-2xl shadow-slate-900/40 rounded-[40px] overflow-hidden text-white">
                <CardHeader className="p-8 border-b border-white/5">
                  <CardTitle className="text-xl font-black flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-teal-400" />
                    </div>
                    Muro de Felicidad
                  </CardTitle>
                  <CardDescription className="text-slate-400 font-medium">Últimas reseñas de pacientes</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  {recentReviews.length === 0 ? (
                    <div className="text-center py-10 space-y-3 opacity-60">
                      <Star className="h-8 w-8 mx-auto text-slate-500" />
                      <p className="text-sm text-slate-400 font-medium">Sin reseñas aún</p>
                    </div>
                  ) : recentReviews.map((rev, i) => (
                    <div key={i} className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7 border border-white/10">
                            <AvatarImage src={rev.profiles?.avatar_url} />
                            <AvatarFallback className="bg-white/10 text-[10px] font-black">{rev.profiles?.first_name?.[0]}</AvatarFallback>
                          </Avatar>
                          <p className="text-sm font-bold text-slate-200">{rev.profiles?.first_name}</p>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className={cn("h-3 w-3 fill-amber-400 text-amber-400", j >= (rev.rating || 5) && "opacity-20")} />
                          ))}
                        </div>
                      </div>
                      {rev.comment && (
                        <p className="text-xs text-slate-400 leading-relaxed italic">
                          <Quote className="h-3 w-3 inline mr-1 opacity-20" />
                          {rev.comment}
                        </p>
                      )}
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full text-teal-400 font-black hover:bg-white/5 h-10 rounded-2xl" asChild>
                    <Link href="/dashboard/admin/support">Ver todas <ArrowRight className="h-4 w-4 ml-1" /></Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Acciones Urgentes — solo credentials reales */}
            <Card className="border-border/40 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40 rounded-[40px] overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">Acciones de Respuesta Inmediata</CardTitle>
                  <p className="text-slate-500 font-medium">Casos que requieren tu aprobación o intervención</p>
                </div>
                {(stats.pendingDoctors + stats.openTickets) > 0 ? (
                  <Badge className="bg-red-500 text-white font-black px-4 py-1 animate-pulse">
                    {stats.pendingDoctors + stats.openTickets} CASOS
                  </Badge>
                ) : (
                  <Badge className="bg-emerald-500 text-white font-black px-4 py-1">
                    Todo al día ✓
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="p-0">
                {pendingCredentials.length === 0 ? (
                  <div className="p-16 text-center space-y-3">
                    <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No hay credenciales pendientes</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                      <TableRow className="h-14">
                        <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo de Alerta</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Profesional</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Esperando</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado</TableHead>
                        <TableHead className="pr-8 text-right" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingCredentials.map(cred => (
                        <TableRow key={cred.id} className="h-20 hover:bg-teal-50/30 dark:hover:bg-teal-950/20 transition-colors group">
                          <TableCell className="pl-8">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600">
                                <ShieldCheck className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-black text-slate-900 dark:text-white text-sm">Validación KYP</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">{cred.type}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={cred.profiles?.avatar_url} />
                                <AvatarFallback className="bg-slate-100 text-[10px] font-black">{cred.profiles?.first_name?.[0]}</AvatarFallback>
                              </Avatar>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Dr. {cred.profiles?.last_name}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-0 font-bold text-[10px]">
                              {hoursAgo(cred.created_at)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-amber-100 text-amber-700 border-0 font-black text-[10px] uppercase">Por Auditar</Badge>
                          </TableCell>
                          <TableCell className="pr-8 text-right">
                            <Button size="sm" className="bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold h-9 px-4 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                              <Link href="/dashboard/admin/verifications">
                                Auditar <ArrowRight className="h-3 w-3 ml-1" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Platform stats mini row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Profesionales", val: stats.totalProfessionals, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
                { label: "Pacientes", val: stats.totalPatients, icon: Users, color: "text-sky-600", bg: "bg-sky-50" },
                { label: "Citas activas", val: stats.activeAppointments, icon: CheckCircle, color: "text-teal-600", bg: "bg-teal-50" },
                { label: "En trial", val: stats.trialingSubscriptions, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
              ].map((s, i) => (
                <motion.div key={i} variants={itemVariants}>
                  <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-3xl">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className={cn("p-3 rounded-xl", s.bg, "dark:opacity-80")}>
                        <s.icon className={cn("h-5 w-5", s.color)} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white">{s.val}</h4>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* ── SUSCRIPCIONES ──────────────────────────────────────────────── */}
          <TabsContent value="subscriptions" className="space-y-8">
            <Card className="border-border/40 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40 rounded-[40px] overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">Gestión de Planes y Beneficios</CardTitle>
                  <CardDescription className="text-slate-500 font-medium">
                    Aprueba solicitudes y otorga meses gratis — {stats.activeSubscriptions} activas · {stats.trialingSubscriptions} en trial
                  </CardDescription>
                </div>
                {pendingSubscriptionsTable.length > 0 && (
                  <Badge className="bg-teal-500 text-white font-black px-4 py-1">{pendingSubscriptionsTable.length} PENDIENTES</Badge>
                )}
              </CardHeader>
              <CardContent className="p-0">
                {pendingSubscriptionsTable.length === 0 ? (
                  <div className="p-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No hay solicitudes pendientes</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                      <TableRow className="h-14">
                        <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Profesional</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Plan</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Solicitud</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingSubscriptionsTable.map(profile => (
                        <TableRow key={profile.id} className="h-24 hover:bg-teal-50/30 dark:hover:bg-teal-950/20 transition-colors group">
                          <TableCell className="pl-8">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border-2 border-slate-100 shadow-sm">
                                <AvatarImage src={profile.avatar_url} />
                                <AvatarFallback className="bg-slate-100 text-[10px] font-black">{profile.first_name?.[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-black text-slate-900 dark:text-white text-sm">{profile.first_name} {profile.last_name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">{profile.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-amber-100 text-amber-700 border-0 font-black text-[10px] uppercase">
                              {profile.selected_plan_id === "graduate" ? "Recién Graduado" : "Profesional"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <p className="text-xs font-bold text-slate-500">{new Date(profile.created_at).toLocaleDateString("es-CL")}</p>
                            <p className="text-[10px] text-slate-400">hace {hoursAgo(profile.created_at)}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {/* Primary: Generate real payment link */}
                              <Button
                                size="sm"
                                onClick={() => generatePaymentLink(profile.id, false)}
                                className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-[10px] gap-1 shadow-lg shadow-violet-500/20"
                              >
                                <CreditCard className="h-3 w-3" />
                                Link de Cobro
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => generatePaymentLink(profile.id, true)}
                                className="bg-violet-900 hover:bg-violet-800 text-white rounded-xl font-bold text-[10px] gap-1"
                              >
                                <CreditCard className="h-3 w-3" />
                                Link Anual
                              </Button>
                              {/* Secondary: Free access grants */}
                              <Button variant="outline" size="sm" onClick={() => approveSubscription(profile.id, 1)}
                                className="rounded-xl font-bold text-[10px] border-slate-200 text-slate-500 hover:text-teal-600">
                                1 Mes Gratis
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => approveSubscription(profile.id, 3)}
                                className="rounded-xl font-bold text-[10px] border-slate-200 text-slate-500 hover:text-slate-700">
                                3 Meses Gratis
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── FINANZAS ───────────────────────────────────────────────────── */}
          <TabsContent value="finances" className="space-y-8">
            {/* MRR Summary */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-teal-200 dark:border-teal-800 bg-teal-50/40 dark:bg-teal-950/20 rounded-3xl">
                <CardContent className="p-6">
                  <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-2">MRR Actual</p>
                  <h2 className="text-4xl font-black text-teal-700 dark:text-teal-400 tracking-tighter">
                    ${stats.mrr.toLocaleString("es-CL")}
                  </h2>
                  <p className="text-xs text-teal-600 mt-2 font-medium">
                    {stats.activeSubscriptions} doctores × $29.990 CLP
                  </p>
                </CardContent>
              </Card>
              <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-3xl">
                <CardContent className="p-6">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Ingresos Este Mes</p>
                  <h2 className="text-4xl font-black text-emerald-700 dark:text-emerald-400 tracking-tighter">
                    ${stats.revenueThisMonth.toLocaleString("es-CL")}
                  </h2>
                  <p className="text-xs text-emerald-600 mt-2 font-medium">Pagos confirmados vía MercadoPago</p>
                </CardContent>
              </Card>
              <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-3xl">
                <CardContent className="p-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ARR Estimado</p>
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                    ${(stats.mrr * 12).toLocaleString("es-CL")}
                  </h2>
                  <p className="text-xs text-slate-500 mt-2 font-medium">MRR × 12 meses</p>
                </CardContent>
              </Card>
            </div>

            {/* Últimos pagos recibidos */}
            <Card className="border-border/40 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40 rounded-[40px] overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">Últimos Pagos Recibidos</CardTitle>
                  <CardDescription className="text-slate-500 font-medium">
                    Pagos de suscripción confirmados por MercadoPago
                  </CardDescription>
                </div>
                {recentPayments.length > 0 && (
                  <Badge className="bg-emerald-500 text-white font-black px-4 py-1">
                    {recentPayments.length} pagos
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="p-0">
                {recentPayments.length === 0 ? (
                  <div className="p-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                      <Banknote className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">
                      Sin pagos registrados aún
                    </p>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Los pagos aparecen aquí automáticamente cuando MercadoPago confirma una suscripción Pro.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                      <TableRow className="h-14">
                        <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Doctor</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado</TableHead>
                        <TableHead className="pr-8 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentPayments.map(p => (
                        <TableRow key={p.id} className="h-20 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-colors">
                          <TableCell className="pl-8">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={p.profiles?.avatar_url ?? undefined} />
                                <AvatarFallback className="bg-teal-100 text-teal-700 text-[10px] font-black">
                                  {p.profiles?.first_name?.[0] ?? p.payer_email?.[0]?.toUpperCase() ?? "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                  {p.profiles ? `${p.profiles.first_name ?? ""} ${p.profiles.last_name ?? ""}`.trim() : "—"}
                                </p>
                                <p className="text-[10px] text-slate-400">{p.payer_email ?? "—"}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                              {format(new Date(p.created_at), "dd MMM yyyy", { locale: es })}
                            </p>
                            <p className="text-[10px] text-slate-400">{hoursAgo(p.created_at)} atrás</p>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-emerald-100 text-emerald-700 border-0 font-black text-[10px] uppercase gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Aprobado
                            </Badge>
                          </TableCell>
                          <TableCell className="pr-8 text-right">
                            <p className="text-lg font-black text-emerald-600">
                              +${Number(p.amount).toLocaleString("es-CL")}
                            </p>
                            <p className="text-[10px] text-slate-400">{p.currency}</p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </motion.div>

      {/* Payment Link Dialog */}
      <Dialog
        open={paymentLinkDialog.open}
        onOpenChange={(open) => {
          if (!paymentLinkDialog.loading) setPaymentLinkDialog(s => ({ ...s, open }))
        }}
      >
        <DialogContent className="max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-black">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <Link2 className="h-5 w-5 text-violet-600" />
              </div>
              Link de Pago MercadoPago
            </DialogTitle>
            <DialogDescription>
              Comparte este link con el profesional para que complete el pago de su suscripción.
              La cuenta se activará automáticamente al confirmar el pago.
            </DialogDescription>
          </DialogHeader>

          {paymentLinkDialog.loading ? (
            <div className="flex flex-col items-center gap-4 py-10">
              <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                Generando link en MercadoPago...
              </p>
            </div>
          ) : paymentLinkDialog.url ? (
            <div className="space-y-5 pt-2">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Destinatario</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                    {paymentLinkDialog.email ?? "—"}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/30">
                  <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1">Monto</p>
                  <p className="text-xl font-black text-violet-700 dark:text-violet-300">
                    ${paymentLinkDialog.amount?.toLocaleString("es-CL")} CLP
                  </p>
                  <p className="text-[10px] text-violet-500">
                    {paymentLinkDialog.isYearly ? "Anual" : "Mensual"}
                  </p>
                </div>
              </div>

              {/* Link */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Link de pago</p>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={paymentLinkDialog.url}
                    className="rounded-xl text-xs font-mono bg-slate-50 border-slate-200"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={copyPaymentLink}
                    className="rounded-xl shrink-0 border-slate-200"
                    title="Copiar link"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold gap-2"
                  onClick={copyPaymentLink}
                >
                  <Copy className="h-4 w-4" />
                  Copiar Link
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl border-slate-200 gap-2"
                  asChild
                >
                  <a href={paymentLinkDialog.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Abrir
                  </a>
                </Button>
              </div>

              <p className="text-xs text-slate-400 text-center">
                El link es único para este profesional. La suscripción se activará automáticamente cuando MercadoPago confirme el pago.
              </p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

    </RouteGuard>
  )
}
