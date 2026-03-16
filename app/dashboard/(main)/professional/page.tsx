"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, type Variants } from "framer-motion"
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
  AlertTriangle
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
import { format, startOfMonth, subDays } from "date-fns"
import { es, enUS } from "date-fns/locale"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
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
  const [isStripeConfigured, setIsStripeConfigured] = useState<boolean>(true)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    appointmentsToday: 0,
    totalPatients: 0,
    monthlyIncome: 0,
  })
  const [todayAppointments, setTodayAppointments] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return

      try {
        const today = new Date().toISOString().split("T")[0]
        const firstDayOfMonth = startOfMonth(new Date()).toISOString()

        // 1. Verification & Stripe status
        const { data: profData } = await supabase
          .from("professionals")
          .select("verified, payouts_enabled")
          .eq("id", user.id)
          .maybeSingle()
        
        setIsVerified(profData?.verified ?? false)
        setIsStripeConfigured(profData?.payouts_enabled ?? false)

        // 2. Stats
        const { count: countToday } = await supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("professional_id", user.id)
          .eq("appointment_date", today)
          .in("status", ["confirmed", "pending"])

        const { data: patientsData } = await supabase
          .from("appointments")
          .select("patient_id")
          .eq("professional_id", user.id)
        
        const uniquePatients = new Set(patientsData?.map(p => p.patient_id)).size

        const { data: incomeData } = await supabase
          .from("financial_transactions")
          .select("professional_net")
          .eq("professional_id", user.id)
          .gte("created_at", firstDayOfMonth)
          .in("status", ["escrow", "available", "paid_out"])

        const monthlyTotal = incomeData?.reduce((acc, curr) => acc + Number(curr.professional_net || 0), 0) || 0

        setStats({
          appointmentsToday: countToday || 0,
          totalPatients: uniquePatients,
          monthlyIncome: monthlyTotal,
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

    loadDashboardData()
  }, [user?.id, isSpanish, supabase])

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-[#0f766e]" /></div>

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 pb-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {isSpanish ? "Oficina Virtual" : "Virtual Office"},{" "}
              <span className="text-[#0f766e]">
                {user?.user_metadata?.first_name || "Profesional"}
              </span>
            </h1>
            {isVerified && <VerifiedBadge isSpanish={isSpanish} />}
          </div>
          <p className="text-muted-foreground">
            {isSpanish ? "Resumen de tu actividad médica hoy" : "Summary of your medical activity today"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-border/40" asChild>
            <Link href="/dashboard/professional/appointments">
              <Calendar className="h-4 w-4 mr-2" />
              {isSpanish ? "Mi Agenda" : "My Schedule"}
            </Link>
          </Button>
          <Button className="bg-[#0f766e] hover:bg-[#0f766e]/90 text-white rounded-xl shadow-lg shadow-teal-200" asChild>
            <Link href="/dashboard/professional/patients">
              <Users className="h-4 w-4 mr-2" />
              {isSpanish ? "Pacientes" : "Patients"}
            </Link>
          </Button>
        </div>
      </div>

      {!isVerified && <VerificationPendingBanner isSpanish={isSpanish} />}

      {!isStripeConfigured && isVerified && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 mb-2 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                {isSpanish ? "⚠️ Pagos no configurados" : "⚠️ Payments not configured"}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {isSpanish 
                  ? "Debes vincular tu cuenta bancaria en Stripe para recibir pagos de tus pacientes."
                  : "You must link your bank account in Stripe to receive payments from your patients."}
              </p>
            </div>
          </div>
          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-lg shadow-amber-200/50" asChild>
            <Link href="/dashboard/professional/settings">
              {isSpanish ? "Configurar Stripe" : "Configure Stripe"}
            </Link>
          </Button>
        </motion.div>
      )}

      {/* Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: isSpanish ? "Citas Hoy" : "Appointments Today", val: stats.appointmentsToday, icon: CalendarDays, color: "text-[#0f766e]", bg: "bg-teal-50" },
          { label: isSpanish ? "Pacientes Totales" : "Total Patients", val: stats.totalPatients, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: isSpanish ? "Ingresos Mes" : "Monthly Income", val: `$${stats.monthlyIncome.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((kpi, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="border-border/40 bg-card/60 backdrop-blur-md shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className={cn("p-2 rounded-xl", kpi.bg)}>
                    <kpi.icon className={cn("h-5 w-5", kpi.color)} />
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter">Live</Badge>
                </div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{kpi.label}</p>
                <div className="text-3xl font-bold mt-1">{kpi.val}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Agenda */}
        <Card className="lg:col-span-4 border-border/40 bg-card/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between p-6">
            <CardTitle className="text-lg font-bold">{isSpanish ? "Agenda del Día" : "Today's Schedule"}</CardTitle>
            <Button variant="ghost" size="sm" className="text-[#0f766e]" asChild>
              <Link href="/dashboard/professional/appointments">{isSpanish ? "Ver Todo" : "View All"}</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-12 opacity-40">
                <CalendarDays className="h-12 w-12 mx-auto mb-2" />
                <p>{isSpanish ? "No hay citas programadas" : "No appointments scheduled"}</p>
              </div>
            ) : (
              todayAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/10 group transition-all hover:bg-muted/40">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                      <AvatarImage src={apt.patient?.avatar_url} />
                      <AvatarFallback className="bg-teal-50 text-teal-700 font-bold">
                        {apt.patient?.first_name?.[0]}{apt.patient?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold tracking-tight">{apt.patient?.first_name} {apt.patient?.last_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                         <Badge variant="outline" className="text-[10px] h-4 px-1.5 opacity-70 font-bold">{apt.appointment_time}</Badge>
                         <Badge className={cn("text-[10px] h-4 px-1.5 font-bold", apt.type === 'online' ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-orange-50 text-orange-600 border-orange-200")}>
                           {apt.type === 'online' ? (isSpanish ? 'Teleconsulta' : 'Online') : (isSpanish ? 'Presencial' : 'In-person')}
                         </Badge>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" className="bg-[#0f766e] text-white hover:bg-[#0f766e]/90 rounded-xl h-9 font-bold px-4" asChild>
                    <Link href={`/consulta/${apt.id}`}>
                      <Video className="h-4 w-4 mr-2" />
                      {isSpanish ? "Iniciar" : "Start"}
                    </Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Weekly Income Chart */}
        <Card className="lg:col-span-3 border-border/40 bg-card/60 backdrop-blur-md">
          <CardHeader className="p-6">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#0f766e]" />
              {isSpanish ? "Actividad Semanal" : "Weekly Activity"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorIncomePro" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#0f766e" strokeWidth={3} fillOpacity={1} fill="url(#colorIncomePro)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 p-4 rounded-2xl bg-teal-50/50 border border-teal-100">
               <div className="flex items-center gap-2 mb-2">
                 <Zap className="h-4 w-4 text-[#0f766e] fill-[#0f766e]" />
                 <span className="text-xs font-bold text-[#0f766e]">{isSpanish ? "TIPS DE RENDIMIENTO" : "PERFORMANCE TIPS"}</span>
               </div>
               <p className="text-[11px] text-muted-foreground leading-relaxed">
                 {isSpanish 
                   ? "Tus ingresos han subido un 12% esta semana. Considera abrir más bloques horarios los martes."
                   : "Your income increased by 12% this week. Consider opening more slots on Tuesdays."}
               </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
