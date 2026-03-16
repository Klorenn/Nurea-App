"use client"

import { useState, useEffect } from "react"
import { motion, type Variants } from "framer-motion"
import { 
  Users, 
  CalendarDays, 
  CreditCard, 
  TrendingUp, 
  Shield, 
  ShieldCheck, 
  XCircle, 
  CheckCircle2, 
  Loader2,
  ArrowRight,
  MoreVertical,
  Search,
  Activity,
  FileSearch,
  CheckCircle,
  Eye,
  BarChart3,
  DollarSign,
  AlertTriangle,
  MessageSquare,
  Power,
  Heart,
  Quote,
  Star,
  ExternalLink,
  Lock,
  History,
  TrendingDown
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { RouteGuard } from "@/components/auth/route-guard"
import { cn } from "@/lib/utils"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
}

// Mock chart data for 30 days
const appointmentTrendData = [
  { name: "01/03", appointments: 120 },
  { name: "05/03", appointments: 150 },
  { name: "10/03", appointments: 180 },
  { name: "15/03", appointments: 210 },
  { name: "20/03", appointments: 190 },
  { name: "25/03", appointments: 240 },
  { name: "30/03", appointments: 280 },
]

export default function AdminPage() {
  const { language } = useLanguage()
  const { user } = useAuth()
  const isSpanish = language === "es"
  const supabase = createClient()

  // States
  const [loading, setLoading] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    nureaCommission: 0,
    openTickets: 0,
    pendingDoctors: 0,
    pendingSubscriptions: 0,
    activeAppointments: 0,
  })
  const [pendingCredentials, setPendingCredentials] = useState<any[]>([])
  const [pendingSubscriptionsTable, setPendingSubscriptionsTable] = useState<any[]>([])
  const [recentReviews, setRecentReviews] = useState<any[]>([])

  useEffect(() => {
    const loadMasterData = async () => {
      setLoading(true)
      try {
        // Parallel fetch for speed
        const [credRes, docsRes, reviewsRes, appointmentsRes, ticketsRes, subsRes] = await Promise.all([
          supabase.from("professional_credentials").select("*", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("professional_credentials").select(`*, profiles:professional_id(first_name, last_name, avatar_url)`).eq("status", "pending").limit(5),
          supabase.from("reviews").select(`*, profiles:patient_id(first_name, avatar_url)`).order('created_at', { ascending: false }).limit(3),
          supabase.from("appointments").select("price, status"),
          supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
          supabase.from("profiles").select("*").eq("subscription_status", "pending_approval")
        ])

        const appointments = appointmentsRes.data || []
        
        // Calculate real-time stats
        const realRevenue = appointments
          .filter(a => a.status === 'confirmed' || a.status === 'completed')
          .reduce((acc, a) => acc + Number(a.price || 0), 0)
        
        const realCommission = realRevenue * 0.05 // 5% as per UI labels
        const activeCount = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length

        setStats({
          totalRevenue: realRevenue,
          nureaCommission: realCommission,
          openTickets: ticketsRes.count || 0,
          pendingDoctors: (credRes.count || 0) + (subsRes.data?.length || 0),
          pendingSubscriptions: subsRes.data?.length || 0,
          activeAppointments: activeCount,
        })
        
        setPendingCredentials(docsRes.data || [])
        setPendingSubscriptionsTable(subsRes.data || [])
        setRecentReviews(reviewsRes.data || [])

      } catch (error) {
        console.error("Admin master dashboard error:", error)
        toast.error("Error al sincronizar datos del centro de mando")
      } finally {
        setLoading(false)
      }
    }

    loadMasterData()
  }, [supabase])

  const toggleMaintenance = () => {
    setMaintenanceMode(!maintenanceMode)
    toast.warning(maintenanceMode ? "Modo mantenimiento desactivado" : "NUREA en modo mantenimiento: Pagos bloqueados")
  }

  const approveSubscription = async (profileId: string, months: number) => {
    try {
      const trialEndDate = new Date()
      trialEndDate.setMonth(trialEndDate.getMonth() + months)
      
      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_status: months > 0 ? "trialing" : "active",
          trial_end_date: trialEndDate.toISOString(),
        })
        .eq("id", profileId)

      if (error) throw error
      
      toast.success(isSpanish 
        ? `Suscripción aprobada con ${months} meses de gracia` 
        : `Subscription approved with ${months} free months`
      )
      
      // Refresh data
      setPendingSubscriptionsTable(prev => prev.filter(p => p.id !== profileId))
      setStats(prev => ({ ...prev, pendingSubscriptions: prev.pendingSubscriptions - 1 }))
    } catch (error) {
      console.error("Error approving sub:", error)
      toast.error(isSpanish ? "Error al aprobar suscripción" : "Error approving subscription")
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
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
          
          {/* Header & Kill Switch */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[22px] bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/20 text-white">
                <Shield className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tighter text-slate-900">
                  Master Dashboard
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black px-2 py-0 text-[10px] uppercase">Sistema Online</Badge>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Control de Plataforma NUREA</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-3xl border border-slate-200">
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
                 {maintenanceMode ? "Reactivar Sistema" : "Kill Switch (Mantenimiento)"}
               </Button>
            </div>
          </div>

          {/* KPI Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { 
                label: "Ingresos Totales", 
                val: `$${stats.totalRevenue.toLocaleString()}`, 
                detail: "Ventas brutas del mes",
                icon: CreditCard, 
                color: "text-slate-900", 
                bg: "bg-slate-100",
                trend: "+15.2%",
                positive: true
              },
              { 
                label: "Comisiones NUREA (5%)", 
                val: `$${stats.nureaCommission.toLocaleString()}`, 
                detail: "Ganancia neta plataforma",
                icon: DollarSign, 
                color: "text-emerald-600", 
                bg: "bg-emerald-50",
                trend: "+4.1%",
                positive: true
              },
              { 
                label: "Tickets Abiertos", 
                val: stats.openTickets, 
                detail: "Soporte al paciente",
                icon: MessageSquare, 
                color: "text-blue-600", 
                bg: "bg-blue-50",
                trend: "-2",
                positive: true
              },
              { 
                label: "Doctores Pendientes", 
                val: stats.pendingDoctors, 
                detail: "KYP por verificar",
                icon: ShieldCheck, 
                color: "text-amber-600", 
                bg: "bg-amber-50",
                trend: "+8",
                positive: false
              },
            ].map((kpi, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card className="border-border/40 bg-white shadow-xl shadow-slate-200/40 rounded-[32px] overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                   <CardContent className="p-7">
                      <div className="flex justify-between items-start mb-4">
                        <div className={cn("p-4 rounded-2xl", kpi.bg)}>
                           <kpi.icon className={cn("h-6 w-6", kpi.color)} />
                        </div>
                        <Badge className={cn(
                          "font-black text-[10px] px-2 py-0.5 rounded-lg border-0",
                          kpi.positive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        )}>
                          {kpi.trend}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 group-hover:text-teal-600 transition-colors">{kpi.val}</h3>
                        <p className="text-xs text-slate-500 mt-2 font-medium">{kpi.detail}</p>
                      </div>
                   </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="bg-slate-200/50 p-1.5 rounded-2xl border border-slate-200 h-14">
              <TabsTrigger value="overview" className="rounded-xl px-8 font-black text-sm data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm h-full">Vista General</TabsTrigger>
              <TabsTrigger value="subscriptions" className="rounded-xl px-8 font-black text-sm data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm h-full">Suscripciones {stats.pendingSubscriptions > 0 && <Badge className="ml-2 bg-teal-500 text-white border-0">{stats.pendingSubscriptions}</Badge>}</TabsTrigger>
              <TabsTrigger value="finances" className="rounded-xl px-8 font-black text-sm data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm h-full">Liquidaciones (Stripe)</TabsTrigger>
              <TabsTrigger value="security" className="rounded-xl px-8 font-black text-sm data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm h-full">Seguridad & Alertas</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Graph */}
                <Card className="lg:col-span-2 border-border/40 bg-white shadow-xl shadow-slate-200/40 rounded-[40px] overflow-hidden">
                  <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-black text-slate-900">Actividad de Citas</CardTitle>
                      <CardDescription className="text-slate-500 font-medium">Volumen transaccional (Últimos 30 días)</CardDescription>
                    </div>
                    <Button variant="outline" className="rounded-xl font-bold h-10 border-slate-200">Exportar CSV</Button>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="h-[400px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={appointmentTrendData}>
                           <defs>
                             <linearGradient id="masterGraph" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#0f766e" stopOpacity={0.15}/>
                               <stop offset="95%" stopColor="#0f766e" stopOpacity={0}/>
                             </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} dy={10} />
                           <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} />
                           <Tooltip 
                            contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', fontWeight: 'black' }}
                           />
                           <Area type="monotone" dataKey="appointments" stroke="#0f766e" strokeWidth={5} fillOpacity={1} fill="url(#masterGraph)" />
                         </AreaChart>
                       </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Patient Sentiment Widget */}
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
                   <CardContent className="p-8 space-y-6">
                      {recentReviews.length === 0 ? (
                        <div className="text-center py-10 opacity-50">Cargando reseñas...</div>
                      ) : recentReviews.map((rev, i) => (
                        <div key={i} className="space-y-3 p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <Avatar className="h-8 w-8 border border-white/10">
                                    <AvatarImage src={rev.profiles?.avatar_url} />
                                    <AvatarFallback className="bg-white/10 text-[10px] font-black">{rev.profiles?.first_name?.[0]}</AvatarFallback>
                                 </Avatar>
                                 <p className="text-sm font-black text-slate-200">{rev.profiles?.first_name}</p>
                              </div>
                              <span className="text-2xl">{rev.patient_emoji || "🤩"}</span>
                           </div>
                           <p className="text-xs text-slate-400 leading-relaxed italic group">
                              <Quote className="h-3 w-3 inline mr-1 opacity-20" />
                              {rev.comment}
                           </p>
                           <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, j) => (
                                <Star key={j} className={cn("h-3 w-3 fill-amber-400 text-amber-400", j >= (rev.rating || 5) && "opacity-20")} />
                              ))}
                           </div>
                        </div>
                      ))}
                      <Button variant="ghost" className="w-full text-teal-400 font-black hover:bg-white/5 h-12 rounded-2xl" asChild>
                         <Link href="/dashboard/admin/support">Ver todas las reseñas <ArrowRight className="h-4 w-4 ml-2" /></Link>
                      </Button>
                   </CardContent>
                </Card>
              </div>

              {/* Urgent Actions Table */}
              <Card className="border-border/40 bg-white shadow-xl shadow-slate-200/40 rounded-[40px] overflow-hidden">
                <CardHeader className="p-8 border-b border-slate-50 flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-black text-slate-900">Acciones de Respuesta Inmediata</CardTitle>
                    <p className="text-slate-500 font-medium">Casos críticos que requieren tu aprobación o intervención</p>
                  </div>
                  <Badge className="bg-red-500 text-white font-black px-4 py-1 animate-pulse">ALERTA: {stats.pendingDoctors + stats.openTickets} CASOS</Badge>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="h-14">
                        <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo de Alerta</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Impacto / Usuario</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tiempo de Espera</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado</TableHead>
                        <TableHead className="pr-8 text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Priority 1: Pending Credentials */}
                      {pendingCredentials.map((cred) => (
                        <TableRow key={cred.id} className="h-20 hover:bg-teal-50/30 transition-colors group">
                           <TableCell className="pl-8">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                    <ShieldCheck className="h-5 w-5" />
                                 </div>
                                 <div>
                                    <p className="font-black text-slate-900 text-sm">Validación KYP</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{cred.type}</p>
                                 </div>
                              </div>
                           </TableCell>
                           <TableCell>
                              <div className="flex items-center gap-3">
                                 <Avatar className="h-8 w-8">
                                    <AvatarImage src={cred.profiles?.avatar_url} />
                                    <AvatarFallback className="bg-slate-100 text-[10px] font-black">{cred.profiles?.first_name?.[0]}</AvatarFallback>
                                 </Avatar>
                                 <p className="text-xs font-bold text-slate-700">Dr. {cred.profiles?.last_name}</p>
                              </div>
                           </TableCell>
                           <TableCell>
                              <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-0 font-bold text-[10px]">
                                 {Math.floor(Math.random() * 24)}h esperadas
                              </Badge>
                           </TableCell>
                           <TableCell>
                              <Badge className="bg-amber-100 text-amber-700 border-0 font-black text-[10px] uppercase">Por Auditar</Badge>
                           </TableCell>
                           <TableCell className="pr-8 text-right">
                              <Button size="sm" className="bg-slate-900 text-white rounded-xl font-bold h-9 px-4 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                                 <Link href="/dashboard/admin/credentials">
                                    Auditar PDF <ArrowRight className="h-3 w-3 ml-2" />
                                 </Link>
                              </Button>
                           </TableCell>
                        </TableRow>
                      ))}

                      {/* Mock Security Alert */}
                      <TableRow className="h-20 hover:bg-red-50/30 transition-colors group">
                         <TableCell className="pl-8">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                                  <AlertTriangle className="h-5 w-5" />
                               </div>
                               <div>
                                  <p className="font-black text-slate-900 text-sm">Alerta de Seguridad</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">Edición crítica</p>
                               </div>
                            </div>
                         </TableCell>
                         <TableCell>
                            <p className="text-xs font-bold text-red-600 italic">Cambio de cuenta bancaria</p>
                         </TableCell>
                         <TableCell>
                            <Badge className="bg-red-600 text-white border-0 font-black text-[10px]">¡URGENTE!</Badge>
                         </TableCell>
                         <TableCell>
                            <Badge className="bg-slate-900 text-white border-0 font-black text-[10px] uppercase">Bloqueado</Badge>
                         </TableCell>
                         <TableCell className="pr-8 text-right">
                            <Button size="sm" variant="destructive" className="rounded-xl font-bold h-9 px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                               Investigar
                            </Button>
                         </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscriptions" className="space-y-8">
               <Card className="border-border/40 bg-white shadow-xl shadow-slate-200/40 rounded-[40px] overflow-hidden">
                  <CardHeader className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-black text-slate-900">Gestión de Planes y Beneficios</CardTitle>
                      <CardDescription className="text-slate-500 font-medium">Aprueba solicitudes de "Recién Graduado" y otorga meses gratis</CardDescription>
                    </div>
                    {pendingSubscriptionsTable.length > 0 && (
                      <Badge className="bg-teal-500 text-white font-black px-4 py-1">
                        {pendingSubscriptionsTable.length} PENDIENTES
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="p-0">
                    {pendingSubscriptionsTable.length === 0 ? (
                      <div className="p-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                          <CheckCircle className="h-8 w-8" />
                        </div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No hay solicitudes pendientes</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader className="bg-slate-50/50">
                          <TableRow className="h-14">
                            <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Profesional</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Plan Solicitado</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha Solicitud</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Acciones / Otorgar Beneficio</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingSubscriptionsTable.map((profile) => (
                            <TableRow key={profile.id} className="h-24 hover:bg-teal-50/30 transition-colors group">
                               <TableCell className="pl-8">
                                  <div className="flex items-center gap-3">
                                     <Avatar className="h-10 w-10 border-2 border-slate-100 shadow-sm">
                                        <AvatarImage src={profile.avatar_url} />
                                        <AvatarFallback className="bg-slate-100 text-[10px] font-black">{profile.first_name?.[0]}</AvatarFallback>
                                     </Avatar>
                                     <div>
                                        <p className="font-black text-slate-900 text-sm">{profile.first_name} {profile.last_name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{profile.email || "Email no disponible"}</p>
                                     </div>
                                  </div>
                               </TableCell>
                               <TableCell>
                                  <Badge className="bg-amber-100 text-amber-700 border-0 font-black text-[10px] uppercase">
                                     {profile.selected_plan_id === 'graduate' ? 'Recién Graduado' : 'Profesional'}
                                  </Badge>
                               </TableCell>
                               <TableCell>
                                  <p className="text-xs font-bold text-slate-500">
                                     {new Date(profile.created_at).toLocaleDateString()}
                                  </p>
                               </TableCell>
                               <TableCell>
                                  <div className="flex flex-wrap gap-2">
                                     <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => approveSubscription(profile.id, 0)}
                                      className="rounded-xl font-bold text-[10px] border-slate-200 hover:bg-white hover:text-teal-600"
                                     >
                                        Aprobar (Sin Trial)
                                     </Button>
                                     <Button 
                                      size="sm" 
                                      onClick={() => approveSubscription(profile.id, 1)}
                                      className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-[10px] shadow-lg shadow-teal-600/10"
                                     >
                                        +1 Mes Gratis
                                     </Button>
                                     <Button 
                                      size="sm" 
                                      onClick={() => approveSubscription(profile.id, 3)}
                                      className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-[10px] shadow-lg shadow-slate-900/10"
                                     >
                                        +3 Meses Gratis
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

            <TabsContent value="finances">
               <Card className="border-border/40 bg-white shadow-xl shadow-slate-200/40 rounded-[40px] overflow-hidden">
                  <CardHeader className="p-8 border-b border-slate-50">
                     <CardTitle className="text-2xl font-black text-slate-900">Liquidaciones de Mercado</CardTitle>
                     <CardDescription className="text-slate-500 font-medium">Control de flujos entre Doctores, Stripe y NUREA</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                     <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                           <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Comisión Acumulada (Stripe Split)</p>
                              <div className="flex items-baseline gap-2">
                                 <h2 className="text-5xl font-black text-teal-600 tracking-tighter">${Math.round(stats.nureaCommission).toLocaleString()}</h2>
                                 <span className="text-sm font-black text-slate-400">CLP</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-4 font-medium flex items-center gap-2">
                                 <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                 El 5% de cada transacción se retiene automáticamente.
                              </p>
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pagado a Doctores</p>
                                 <h4 className="text-xl font-black text-slate-900">${Math.round(stats.totalRevenue - stats.nureaCommission).toLocaleString()}</h4>
                              </div>
                              <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Impuestos (IVA)</p>
                                 <h4 className="text-xl font-black text-slate-900">${Math.round(stats.totalRevenue * 0.19).toLocaleString()}</h4>
                              </div>
                           </div>
                        </div>

                        <div className="p-8 rounded-[32px] bg-slate-900 text-white flex flex-col justify-between">
                           <div>
                              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                                 <TrendingUp className="h-6 w-6 text-teal-400" />
                              </div>
                              <h3 className="text-2xl font-black">Proyección de Cierre</h3>
                              <p className="text-slate-400 mt-2 font-medium">Estimado de comisiones al finalizar el mes según tendencia actual.</p>
                           </div>
                           <div className="mt-12 space-y-4">
                              <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                 <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Optimista</span>
                                 <span className="text-2xl font-black text-emerald-400">+$8.4M</span>
                              </div>
                              <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                 <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Conservador</span>
                                 <span className="text-2xl font-black text-white">+$5.1M</span>
                              </div>
                              <Button className="w-full h-14 rounded-2xl bg-teal-500 hover:bg-teal-600 text-slate-900 font-black text-sm mt-4">
                                 Solicitar Reporte de Tesorería
                              </Button>
                           </div>
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </TabsContent>
          </Tabs>

        </motion.div>
    </RouteGuard>
  )
}
