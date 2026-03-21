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
  Zap,
  Star,
  BrainCircuit,
  ArrowUpRight
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
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
}

export default function ProfessionalDashboard() {
  const { language } = useLanguage()
  const { user } = useAuth()
  const isSpanish = language === "es"
  const supabase = createClient()

  // States
  const [isVerified, setIsVerified] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    appointmentsToday: 0,
    totalPatients: 0,
    monthlyIncome: 0,
    weeklyIncomeGrowth: 0,
    weeklyAppointmentGrowth: 0
  })
  const [todayAppointments, setTodayAppointments] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])

  const performanceInsight = useMemo(() => {
    return getPerformanceTip(stats.weeklyIncomeGrowth, stats.weeklyAppointmentGrowth, isSpanish)
  }, [stats.weeklyIncomeGrowth, stats.weeklyAppointmentGrowth, isSpanish])

  const loadDashboardData = async () => {
    if (!user?.id) return

    try {
      const today = new Date().toISOString().split("T")[0]
      const firstDayOfMonth = startOfMonth(new Date()).toISOString()
      const now = new Date()
      const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString()
      const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }).toISOString()
      const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }).toISOString()

      // 1. Verification status
      const { data: profData } = await supabase
        .from("professionals")
        .select("verified")
        .eq("id", user.id)
        .maybeSingle()
      
      setIsVerified(profData?.verified ?? false)

      // 2. Stats
      const [{ count: countToday }, { data: patientsData }, { data: incomeData }, { data: currentWeekIncome }, { data: lastWeekIncome }, { count: currentWeekAppointments }, { count: lastWeekAppointments }] = await Promise.all([
        supabase.from("appointments").select("*", { count: "exact", head: true }).eq("professional_id", user.id).eq("appointment_date", today).in("status", ["confirmed", "pending"]),
        supabase.from("appointments").select("patient_id").eq("professional_id", user.id),
        supabase.from("financial_transactions").select("professional_net").eq("professional_id", user.id).gte("created_at", firstDayOfMonth).in("status", ["escrow", "available", "payout_pending", "paid_out"]),
        supabase.from("financial_transactions").select("professional_net").eq("professional_id", user.id).gte("created_at", currentWeekStart).in("status", ["escrow", "available", "payout_pending", "paid_out"]),
        supabase.from("financial_transactions").select("professional_net").eq("professional_id", user.id).gte("created_at", lastWeekStart).lte("created_at", lastWeekEnd).in("status", ["escrow", "available", "payout_pending", "paid_out"]),
        supabase.from("appointments").select("*", { count: "exact", head: true }).eq("professional_id", user.id).gte("created_at", currentWeekStart),
        supabase.from("appointments").select("*", { count: "exact", head: true }).eq("professional_id", user.id).gte("created_at", lastWeekStart).lte("created_at", lastWeekEnd)
      ])

      const uniquePatients = new Set(patientsData?.map(p => p.patient_id)).size
      const monthlyTotal = incomeData?.reduce((acc, curr) => acc + Number(curr.professional_net || 0), 0) || 0
      
      const currentWeekTotal = currentWeekIncome?.reduce((acc, curr) => acc + Number(curr.professional_net || 0), 0) || 0
      const lastWeekTotal = lastWeekIncome?.reduce((acc, curr) => acc + Number(curr.professional_net || 0), 0) || 0
      
      const incomeGrowth = calculateWeeklyGrowth(currentWeekTotal, lastWeekTotal)
      const appointmentGrowth = calculateWeeklyGrowth(currentWeekAppointments || 0, lastWeekAppointments || 0)

      setStats({
        appointmentsToday: countToday || 0,
        totalPatients: uniquePatients,
        monthlyIncome: monthlyTotal,
        weeklyIncomeGrowth: incomeGrowth,
        weeklyAppointmentGrowth: appointmentGrowth
      })

      // 3. Today's appointments
      const { data: appointments } = await supabase
        .from("appointments")
        .select(`
          id, appointment_date, appointment_time, type, status,
          patient:profiles!appointments_patient_id_fkey(first_name, last_name, avatar_url)
        `)
        .eq("professional_id", user.id)
        .eq("appointment_date", today)
        .order("appointment_time", { ascending: true })

      setTodayAppointments(appointments || [])

      // 4. Chart Data
      const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), "yyyy-MM-dd"))
      const { data: weeklyIncome } = await supabase
        .from("financial_transactions")
        .select("created_at, professional_net")
        .eq("professional_id", user.id)
        .gte("created_at", subDays(new Date(), 7).toISOString())

      const chart = last7Days.map(date => {
        const daySum = weeklyIncome
          ?.filter(a => format(new Date(a.created_at), "yyyy-MM-dd") === date)
          .reduce((acc, curr) => acc + Number(curr.professional_net || 0), 0) || 0
        return {
          name: format(new Date(date), "EEE", { locale: isSpanish ? es : enUS }),
          income: daySum
        }
      })
      setChartData(chart)

    } catch (error) {
      console.error("Dashboard error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()

    // Real-time subscriptions
    const appointmentsChannel = supabase
      .channel('dashboard-appointments')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'appointments',
        filter: `professional_id=eq.${user?.id}`
      }, () => {
        loadDashboardData()
      })
      .subscribe()

    const transactionsChannel = supabase
      .channel('dashboard-transactions')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'financial_transactions',
        filter: `professional_id=eq.${user?.id}`
      }, () => {
        loadDashboardData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(appointmentsChannel)
      supabase.removeChannel(transactionsChannel)
    }
  }, [user?.id, isSpanish, supabase])

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-600 rounded-full animate-spin" />
        <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-teal-600" />
      </div>
      <p className="text-sm font-medium text-muted-foreground animate-pulse">
        {isSpanish ? "Sincronizando calendario..." : "Syncing calendar..."}
      </p>
    </div>
  )

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible" 
      className="space-y-8 pb-10 max-w-[1600px] mx-auto"
    >
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
        <div className="space-y-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-1"
          >
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {isSpanish ? "Panel profesional" : "Professional dashboard"}
            </h1>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">
              {isSpanish
                ? "Revisa tu agenda, pacientes y actividad de tu práctica en NUREA."
                : "Review your schedule, patients and practice activity in NUREA."}
            </p>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/5 border border-teal-500/10 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              <p className="text-xs font-bold text-teal-700 dark:text-teal-400 tracking-wide uppercase">
                {isSpanish ? "En Vivo" : "Live Account"}
              </p>
            </div>
            {isVerified && <VerifiedBadge variant="card" isSpanish={isSpanish} />}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 px-6 rounded-2xl border-border/40 hover:bg-muted/50 transition-all font-bold gap-2" asChild>
            <Link href="/dashboard/professional/appointments">
              <Calendar className="h-4 w-4 text-teal-600" />
              {isSpanish ? "Mi Agenda" : "My Schedule"}
            </Link>
          </Button>
          <Button className="h-12 px-8 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl shadow-xl shadow-teal-500/20 transition-all hover:scale-[1.02] active:scale-95 font-bold gap-2" asChild>
            <Link href="/dashboard/professional/patients">
              <Users className="h-4 w-4" />
              {isSpanish ? "Pacientes" : "Patients"}
            </Link>
          </Button>
        </div>
      </div>

      {!isVerified && <VerificationPendingBanner isSpanish={isSpanish} />}

      {/* KPI Section with Glassmorphism */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { 
            label: isSpanish ? "Citas Hoy" : "Appointments Today", 
            val: stats.appointmentsToday, 
            icon: CalendarDays, 
            growth: stats.weeklyAppointmentGrowth,
            color: "teal" 
          },
          { 
            label: isSpanish ? "Total Pacientes" : "Total Patients", 
            val: stats.totalPatients, 
            icon: Users, 
            growth: 0,
            color: "blue" 
          },
          { 
            label: isSpanish ? "Ingresos Mes" : "Monthly Income", 
            val: `$${stats.monthlyIncome.toLocaleString()}`, 
            icon: DollarSign, 
            growth: stats.weeklyIncomeGrowth,
            color: "emerald" 
          },
        ].map((kpi, i) => (
          <motion.div key={i} variants={itemVariants} whileHover={{ y: -5 }} className="relative group">
            <Card className="border-none bg-card/40 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] rounded-[2rem] overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className={cn(
                    "p-4 rounded-2xl shadow-inner transition-colors",
                    kpi.color === "teal" ? "bg-teal-500/10 text-teal-600" :
                    kpi.color === "blue" ? "bg-blue-500/10 text-blue-600" :
                    "bg-emerald-500/10 text-emerald-600"
                  )}>
                    <kpi.icon className="h-6 w-6" />
                  </div>
                  {kpi.growth !== 0 && (
                    <div className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider",
                      kpi.growth > 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                    )}>
                      {kpi.growth > 0 ? <TrendingUp className="h-3 w-3" /> : <Activity className="h-3 w-3 rotate-180" />}
                      {Math.abs(kpi.growth)}%
                    </div>
                  )}
                </div>
                <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-2">{kpi.label}</p>
                <div className="text-4xl font-black tracking-tighter text-foreground/90">{kpi.val}</div>
              </CardContent>
              <div className={cn(
                "absolute bottom-0 left-0 h-1 transition-all duration-300 group-hover:w-full w-0",
                kpi.color === "teal" ? "bg-teal-500" : kpi.color === "blue" ? "bg-blue-500" : "bg-emerald-500"
              )} />
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Modern Agenda */}
        <Card className="lg:col-span-12 xl:col-span-8 border-none bg-card/40 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-10 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black tracking-tight">{isSpanish ? "Agenda de Hoy" : "Today's Agenda"}</CardTitle>
              <p className="text-sm text-muted-foreground font-medium">
                {todayAppointments.length} {isSpanish ? "pacientes programados" : "scheduled patients"}
              </p>
            </div>
            <Button variant="ghost" size="lg" className="text-teal-600 font-bold hover:bg-teal-500/10 rounded-2xl gap-2" asChild>
              <Link href="/dashboard/professional/appointments">
                {isSpanish ? "Ver todo" : "View all"}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-10 pt-6">
            <AnimatePresence mode="popLayout">
              {todayAppointments.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="flex flex-col items-center justify-center py-20 text-center space-y-4"
                >
                  <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center">
                    <CalendarDays className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-muted-foreground">{isSpanish ? "Día libre de citas" : "No appointments today"}</p>
                    <p className="text-sm text-muted-foreground/60">{isSpanish ? "Tómate un café y revisa tus pendientes" : "Enjoy a break and review your pending tasks"}</p>
                  </div>
                </motion.div>
              ) : (
                <div className="grid gap-4">
                  {todayAppointments.map((apt, idx) => (
                    <motion.div 
                      key={apt.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group relative flex items-center justify-between p-6 rounded-[2rem] bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 hover:shadow-[0_15px_30px_rgb(0,0,0,0.04)] hover:scale-[1.01] transition-all duration-300"
                    >
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <Avatar className="h-16 w-16 rounded-2xl border-4 border-white dark:border-slate-900 shadow-xl">
                            <AvatarImage src={apt.patient?.avatar_url} />
                            <AvatarFallback className="bg-gradient-to-br from-teal-500/20 to-teal-600/10 text-teal-700 font-black text-xl">
                              {apt.patient?.first_name?.[0]}{apt.patient?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn(
                            "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900",
                            apt.status === 'confirmed' ? "bg-emerald-500" : "bg-amber-500"
                          )} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-lg font-black tracking-tight text-foreground/90 group-hover:text-teal-600 transition-colors">
                            {apt.patient?.first_name} {apt.patient?.last_name}
                          </p>
                          <div className="flex items-center gap-3">
                             <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-tighter text-muted-foreground/80">
                               <Clock className="h-3 w-3" />
                               {apt.appointment_time
                                 ? format(parse(apt.appointment_time, 'HH:mm:ss', new Date()), 'HH:mm')
                                 : '—'}
                             </div>
                             <Badge variant="outline" className={cn(
                               "text-[9px] font-black uppercase tracking-[0.1em] border-none shadow-sm",
                               apt.type === 'online' 
                                 ? "bg-blue-500/10 text-blue-600" 
                                 : "bg-orange-500/10 text-orange-600"
                             )}>
                               {apt.type === 'online' ? (isSpanish ? 'Teleconsulta' : 'Video') : (isSpanish ? 'Presencial' : 'Clinic')}
                             </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="rounded-2xl h-12 w-12 hover:bg-slate-100 dark:hover:bg-slate-800">
                              <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/professional/appointments?id=${apt.id}`}>
                                {isSpanish ? "Ver detalle" : "View detail"}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => { window.location.href = `/dashboard/professional/appointments?cancel=${apt.id}` }}
                            >
                              {isSpanish ? "Cancelar cita" : "Cancel appointment"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button className="bg-teal-600 hover:bg-teal-500 text-white rounded-[1.2rem] h-12 px-8 font-black shadow-lg shadow-teal-500/10 transition-all active:scale-95 flex items-center gap-2" asChild>
                          <Link href={`/dashboard/professional/consultation/${apt.id}`}>
                            <Video className="h-4 w-4" />
                            {isSpanish ? "Iniciar" : "Connect"}
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

        {/* Dynamic Analytics & Insights */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-6">
          <Card className="border-none bg-card/40 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-xl font-black flex items-center gap-3">
                <div className="p-2 rounded-xl bg-teal-500/10">
                  <TrendingUp className="h-5 w-5 text-teal-600" />
                </div>
                {isSpanish ? "Actividad" : "Activity"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorIncomePro" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f766e" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#0f766e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} 
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{ stroke: '#0f766e', strokeWidth: 2, strokeDasharray: '4 4' }}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px', 
                        border: 'none',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                      }}
                      itemStyle={{ fontSize: '12px', fontWeight: '900', color: '#0f766e' }}
                      labelStyle={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '4px', opacity: 0.6 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#0f766e" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorIncomePro)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* AI-Driven Dynamic Insights Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden group"
          >
            <div className={cn(
              "absolute inset-0 rounded-[2.5rem] border backdrop-blur-xl transition-colors duration-500",
              performanceInsight.type === 'positive' 
                ? "bg-gradient-to-br from-teal-500/20 via-teal-400/5 to-transparent border-teal-500/20" 
                : "bg-gradient-to-br from-slate-500/10 via-slate-400/5 to-transparent border-slate-200 dark:border-slate-800"
            )} />
            
            <div className="relative p-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-3 rounded-2xl shadow-inner",
                  performanceInsight.type === 'positive' ? "bg-teal-500/20 text-teal-600" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                )}>
                  <BrainCircuit className="h-6 w-6 animate-pulse" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">
                    {performanceInsight.title}
                  </span>
                  <h4 className="font-black text-lg">Nura Insights</h4>
                </div>
              </div>
              
              <p className="text-sm font-medium leading-relaxed text-foreground/80">
                {performanceInsight.message}
              </p>

              <div className="pt-2">
                <Button
                  variant="link"
                  className={cn(
                    "p-0 h-auto font-black text-xs uppercase tracking-wider group-hover:gap-3 transition-all",
                    performanceInsight.type === 'positive' ? "text-teal-600" : "text-muted-foreground"
                  )}
                  asChild
                >
                  <Link href="/dashboard/professional/availability">
                    {isSpanish ? "Optimizar mi agenda" : "Optimize my schedule"}
                    <ArrowRight className="h-3 w-3 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Background Decoration */}
            <Zap className={cn(
              "absolute -bottom-6 -right-6 h-32 w-32 opacity-5 rotate-12 transition-transform duration-700 group-hover:scale-125",
              performanceInsight.type === 'positive' ? "text-teal-600" : "text-slate-400"
            )} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
