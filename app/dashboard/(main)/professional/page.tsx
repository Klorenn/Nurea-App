"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { motion, type Variants, AnimatePresence } from "framer-motion"
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  Video,
  ArrowRight,
  TrendingUp,
  MoreHorizontal,
  Loader2,
  CalendarDays,
  Activity,
  BrainCircuit,
  ArrowUpRight,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import { VerificationPendingBanner, VerifiedBadge } from "@/components/verified-badge"
import { createClient } from "@/lib/supabase/client"
import { format, startOfMonth, subDays, startOfWeek, endOfWeek, subWeeks, parse } from "date-fns"
import { es, enUS } from "date-fns/locale"
import { calculateWeeklyGrowth, getPerformanceTip } from "@/lib/dashboard-utils"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 18 } },
}

export default function ProfessionalDashboard() {
  const { language } = useLanguage()
  const { user } = useAuth()
  const isSpanish = language === "es"
  const supabase = createClient()

  const [isVerified, setIsVerified] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    appointmentsToday: 0,
    appointmentsWeek: 0,
    totalPatients: 0,
    monthlyIncome: 0,
    weeklyIncomeGrowth: 0,
    weeklyAppointmentGrowth: 0,
  })
  const [todayAppointments, setTodayAppointments] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [professionalName, setProfessionalName] = useState("")

  const performanceInsight = useMemo(
    () => getPerformanceTip(stats.weeklyIncomeGrowth, stats.weeklyAppointmentGrowth, isSpanish),
    [stats.weeklyIncomeGrowth, stats.weeklyAppointmentGrowth, isSpanish]
  )

  const loadDashboardData = async () => {
    if (!user?.id) return
    try {
      const today = new Date().toISOString().split("T")[0]
      const firstDayOfMonth = startOfMonth(new Date()).toISOString()
      const now = new Date()
      const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString()
      const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }).toISOString()
      const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }).toISOString()

      const { data: profData } = await supabase
        .from("professionals")
        .select("verified")
        .eq("id", user.id)
        .maybeSingle()
      setIsVerified(profData?.verified ?? false)

      const { data: profileData } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .maybeSingle()
      setProfessionalName(profileData?.first_name || "")

      const [
        { count: countToday },
        { count: countWeek },
        { data: patientsData },
        { data: incomeData },
        { data: currentWeekIncome },
        { data: lastWeekIncome },
        { count: currentWeekAppointments },
        { count: lastWeekAppointments },
      ] = await Promise.all([
        supabase.from("appointments").select("*", { count: "exact", head: true }).eq("professional_id", user.id).eq("appointment_date", today).in("status", ["confirmed", "pending"]),
        supabase.from("appointments").select("*", { count: "exact", head: true }).eq("professional_id", user.id).gte("appointment_date", currentWeekStart.split("T")[0]).in("status", ["confirmed", "pending"]),
        supabase.from("appointments").select("patient_id").eq("professional_id", user.id),
        supabase.from("financial_transactions").select("professional_net").eq("professional_id", user.id).gte("created_at", firstDayOfMonth).in("status", ["escrow", "available", "payout_pending", "paid_out"]),
        supabase.from("financial_transactions").select("professional_net").eq("professional_id", user.id).gte("created_at", currentWeekStart).in("status", ["escrow", "available", "payout_pending", "paid_out"]),
        supabase.from("financial_transactions").select("professional_net").eq("professional_id", user.id).gte("created_at", lastWeekStart).lte("created_at", lastWeekEnd).in("status", ["escrow", "available", "payout_pending", "paid_out"]),
        supabase.from("appointments").select("*", { count: "exact", head: true }).eq("professional_id", user.id).gte("created_at", currentWeekStart),
        supabase.from("appointments").select("*", { count: "exact", head: true }).eq("professional_id", user.id).gte("created_at", lastWeekStart).lte("created_at", lastWeekEnd),
      ])

      const uniquePatients = new Set(patientsData?.map((p) => p.patient_id)).size
      const monthlyTotal = incomeData?.reduce((acc, curr) => acc + Number(curr.professional_net || 0), 0) || 0
      const currentWeekTotal = currentWeekIncome?.reduce((acc, curr) => acc + Number(curr.professional_net || 0), 0) || 0
      const lastWeekTotal = lastWeekIncome?.reduce((acc, curr) => acc + Number(curr.professional_net || 0), 0) || 0
      const incomeGrowth = calculateWeeklyGrowth(currentWeekTotal, lastWeekTotal)
      const appointmentGrowth = calculateWeeklyGrowth(currentWeekAppointments || 0, lastWeekAppointments || 0)

      setStats({
        appointmentsToday: countToday || 0,
        appointmentsWeek: countWeek || 0,
        totalPatients: uniquePatients,
        monthlyIncome: monthlyTotal,
        weeklyIncomeGrowth: incomeGrowth,
        weeklyAppointmentGrowth: appointmentGrowth,
      })

      const { data: appointments } = await supabase
        .from("appointments")
        .select(`id, appointment_date, appointment_time, type, status, patient:profiles!appointments_patient_id_fkey(first_name, last_name, avatar_url)`)
        .eq("professional_id", user.id)
        .eq("appointment_date", today)
        .order("appointment_time", { ascending: true })
      setTodayAppointments(appointments || [])

      const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), "yyyy-MM-dd"))
      const { data: weeklyIncome } = await supabase
        .from("financial_transactions")
        .select("created_at, professional_net")
        .eq("professional_id", user.id)
        .gte("created_at", subDays(new Date(), 7).toISOString())

      setChartData(
        last7Days.map((date) => ({
          name: format(new Date(date), "EEE", { locale: isSpanish ? es : enUS }),
          income: weeklyIncome?.filter((a) => format(new Date(a.created_at), "yyyy-MM-dd") === date).reduce((acc, curr) => acc + Number(curr.professional_net || 0), 0) || 0,
        }))
      )
    } catch (error) {
      console.error("Dashboard error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
    const ch1 = supabase.channel("dashboard-appointments").on("postgres_changes", { event: "*", schema: "public", table: "appointments", filter: `professional_id=eq.${user?.id}` }, loadDashboardData).subscribe()
    const ch2 = supabase.channel("dashboard-transactions").on("postgres_changes", { event: "*", schema: "public", table: "financial_transactions", filter: `professional_id=eq.${user?.id}` }, loadDashboardData).subscribe()
    return () => { supabase.removeChannel(ch1); supabase.removeChannel(ch2) }
  }, [user?.id, isSpanish])

  const now = new Date()
  const greeting = isSpanish
    ? now.getHours() < 12 ? "Buenos días" : now.getHours() < 19 ? "Buenas tardes" : "Buenas noches"
    : now.getHours() < 12 ? "Good morning" : now.getHours() < 19 ? "Good afternoon" : "Good evening"

  const dateLabel = format(now, "EEEE d 'de' MMMM", { locale: isSpanish ? es : enUS })

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-600 rounded-full animate-spin" />
        <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-teal-600" />
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">
        {isSpanish ? "Cargando..." : "Loading..."}
      </p>
    </div>
  )

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5 pb-8 max-w-6xl">

      {/* ── Header ── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500" />
            </span>
            <span className="text-xs font-medium text-teal-600 dark:text-teal-400">
              {isSpanish ? "En vivo" : "Live"}
            </span>
            {isVerified && <VerifiedBadge variant="card" isSpanish={isSpanish} />}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {greeting}{professionalName ? `, ${professionalName}` : ""} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{dateLabel}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="h-9 rounded-xl border-border/60 gap-2 text-sm font-medium" asChild>
            <Link href="/dashboard/professional/appointments">
              <Calendar className="h-4 w-4 text-teal-600" />
              {isSpanish ? "Agenda" : "Schedule"}
            </Link>
          </Button>
          <Button size="sm" className="h-9 bg-teal-600 hover:bg-teal-700 text-white rounded-xl gap-2 text-sm font-medium shadow-sm" asChild>
            <Link href="/dashboard/professional/patients">
              <Users className="h-4 w-4" />
              {isSpanish ? "Pacientes" : "Patients"}
            </Link>
          </Button>
        </div>
      </motion.div>

      {!isVerified && <VerificationPendingBanner isSpanish={isSpanish} />}

      {/* ── Summary strip ── */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: isSpanish ? "Citas hoy" : "Today",
              val: stats.appointmentsToday,
              icon: CalendarDays,
              sub: isSpanish ? "programadas" : "scheduled",
              color: "teal",
              growth: stats.weeklyAppointmentGrowth,
            },
            {
              label: isSpanish ? "Esta semana" : "This week",
              val: stats.appointmentsWeek,
              icon: Calendar,
              sub: isSpanish ? "citas" : "appointments",
              color: "violet",
              growth: null,
            },
            {
              label: isSpanish ? "Pacientes" : "Patients",
              val: stats.totalPatients,
              icon: Users,
              sub: isSpanish ? "únicos" : "unique",
              color: "blue",
              growth: null,
            },
            {
              label: isSpanish ? "Ingresos mes" : "Monthly",
              val: `$${stats.monthlyIncome.toLocaleString()}`,
              icon: DollarSign,
              sub: isSpanish ? "netos" : "net",
              color: "emerald",
              growth: stats.weeklyIncomeGrowth,
            },
          ].map((kpi, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card className="border-border/40 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all rounded-2xl group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn(
                      "p-2.5 rounded-xl",
                      kpi.color === "teal"    ? "bg-teal-50 dark:bg-teal-950/40 text-teal-600" :
                      kpi.color === "violet"  ? "bg-violet-50 dark:bg-violet-950/40 text-violet-600" :
                      kpi.color === "blue"    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600" :
                                                "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600"
                    )}>
                      <kpi.icon className="h-5 w-5" />
                    </div>
                    {kpi.growth !== null && kpi.growth !== 0 && (
                      <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded-md",
                        kpi.growth > 0
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                      )}>
                        {kpi.growth > 0 ? "+" : ""}{Math.abs(kpi.growth)}%
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white leading-none">{kpi.val}</div>
                  <div className="flex items-baseline gap-1 mt-1.5">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{kpi.label}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">· {kpi.sub}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Main grid ── */}
      <div className="grid gap-4 lg:grid-cols-7">

        {/* Agenda */}
        <motion.div variants={itemVariants} className="lg:col-span-4">
          <Card className="border-border/40 bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden h-full">
            <CardHeader className="flex flex-row items-center justify-between px-5 py-4 border-b border-border/40">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-teal-600" />
                <CardTitle className="text-base font-semibold">{isSpanish ? "Agenda de hoy" : "Today's agenda"}</CardTitle>
                <span className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded-full ml-1",
                  todayAppointments.length > 0
                    ? "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                )}>
                  {todayAppointments.length} {isSpanish ? "citas" : "apts"}
                </span>
              </div>
              <Button variant="ghost" size="sm" className="text-teal-600 text-sm font-medium hover:bg-teal-50 dark:hover:bg-teal-950/30 rounded-lg gap-1 h-8 px-3" asChild>
                <Link href="/dashboard/professional/appointments">
                  {isSpanish ? "Ver todo" : "View all"}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <AnimatePresence mode="popLayout">
                {todayAppointments.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-10 text-center space-y-2 px-6"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <CalendarDays className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-base font-medium text-slate-500">{isSpanish ? "Sin citas hoy" : "No appointments today"}</p>
                      <p className="text-sm text-slate-400 mt-0.5">{isSpanish ? "¡Disfruta tu día!" : "Enjoy your day!"}</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl text-sm h-9 mt-2 gap-1.5" asChild>
                      <Link href="/dashboard/professional/availability">
                        <Calendar className="h-4 w-4" />
                        {isSpanish ? "Gestionar disponibilidad" : "Manage availability"}
                      </Link>
                    </Button>
                  </motion.div>
                ) : (
                  <div className="divide-y divide-border/40">
                    {todayAppointments.map((apt, idx) => (
                      <motion.div
                        key={apt.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="group flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10 rounded-xl">
                              <AvatarImage src={apt.patient?.avatar_url} />
                              <AvatarFallback className="bg-teal-50 dark:bg-teal-950/30 text-teal-700 text-sm font-semibold rounded-xl">
                                {apt.patient?.first_name?.[0]}{apt.patient?.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className={cn(
                              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900",
                              apt.status === "confirmed" ? "bg-emerald-500" : "bg-amber-500"
                            )} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground group-hover:text-teal-600 transition-colors leading-tight">
                              {apt.patient?.first_name} {apt.patient?.last_name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                {apt.appointment_time ? format(parse(apt.appointment_time, "HH:mm:ss", new Date()), "HH:mm") : "—"}
                              </span>
                              <span className={cn(
                                "text-xs font-medium px-2 py-0.5 rounded-md",
                                apt.type === "online"
                                  ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600"
                                  : "bg-orange-50 dark:bg-orange-950/30 text-orange-600"
                              )}>
                                {apt.type === "online" ? "Video" : isSpanish ? "Presencial" : "In-person"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg">
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/professional/appointments?id=${apt.id}`}>
                                  {isSpanish ? "Ver detalle" : "View detail"}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => { window.location.href = `/dashboard/professional/appointments?cancel=${apt.id}` }}>
                                {isSpanish ? "Cancelar" : "Cancel"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg h-8 px-3 text-sm font-medium gap-1.5 shadow-sm" asChild>
                            <Link href={`/dashboard/professional/consultation/${apt.id}`}>
                              <Video className="h-3.5 w-3.5" />
                              {isSpanish ? "Iniciar" : "Start"}
                            </Link>
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right sidebar */}
        <div className="lg:col-span-3 flex flex-col gap-4">

          {/* Income chart */}
          <motion.div variants={itemVariants}>
            <Card className="border-border/40 bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between px-4 py-3.5 border-b border-border/40">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-teal-600" />
                  {isSpanish ? "Ingresos últimos 7 días" : "Income last 7 days"}
                </CardTitle>
                {stats.weeklyIncomeGrowth !== 0 && (
                  <span className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-md",
                    stats.weeklyIncomeGrowth > 0
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                  )}>
                    {stats.weeklyIncomeGrowth > 0 ? "+" : ""}{Math.abs(stats.weeklyIncomeGrowth)}% vs sem. ant.
                  </span>
                )}
              </CardHeader>
              <CardContent className="px-2 pt-3 pb-2">
                <div className="h-[130px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIncomePro" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0f766e" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.4} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} dy={6} />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: "11px", padding: "6px 10px" }}
                        formatter={(v: any) => [`$${Number(v).toLocaleString()}`, isSpanish ? "Ingresos" : "Income"]}
                      />
                      <Area type="monotone" dataKey="income" stroke="#0f766e" strokeWidth={2} fillOpacity={1} fill="url(#colorIncomePro)" dot={{ r: 3, fill: "#0f766e", strokeWidth: 0 }} activeDot={{ r: 4 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Nura Insight */}
          <motion.div variants={itemVariants}>
            <Card className={cn(
              "border shadow-sm rounded-2xl overflow-hidden",
              performanceInsight.type === "positive"
                ? "border-teal-200/60 dark:border-teal-800/40 bg-gradient-to-br from-teal-50/80 to-emerald-50/50 dark:from-teal-950/20 dark:to-emerald-950/10"
                : "border-border/40 bg-white dark:bg-slate-900"
            )}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn(
                    "p-1.5 rounded-lg shrink-0",
                    performanceInsight.type === "positive"
                      ? "bg-teal-100 dark:bg-teal-900/40 text-teal-600"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  )}>
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-wide uppercase text-muted-foreground">{performanceInsight.title}</p>
                    <p className="text-sm font-semibold text-foreground">Nura Insights</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground mb-3">
                  {performanceInsight.message}
                </p>
                <Button variant="link" size="sm" className={cn(
                  "p-0 h-auto text-sm font-medium gap-1",
                  performanceInsight.type === "positive" ? "text-teal-600" : "text-muted-foreground"
                )} asChild>
                  <Link href="/dashboard/professional/availability">
                    {isSpanish ? "Optimizar agenda" : "Optimize schedule"}
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick links */}
          <motion.div variants={itemVariants}>
            <Card className="border-border/40 bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
                  {isSpanish ? "Accesos rápidos" : "Quick access"}
                </p>
                <div className="space-y-1">
                  {[
                    { href: "/dashboard/professional/fichas", label: isSpanish ? "Fichas clínicas" : "Clinical records", icon: Activity },
                    { href: "/dashboard/professional/availability", label: isSpanish ? "Disponibilidad" : "Availability", icon: CalendarDays },
                    { href: "/dashboard/professional/profile", label: isSpanish ? "Mi perfil" : "My profile", icon: Users },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center justify-between px-2 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <link.icon className="h-4 w-4 text-teal-600" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                          {link.label}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-teal-500 transition-colors" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
