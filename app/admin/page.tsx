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
  BarChart3
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { AdminLayout } from "@/components/admin/admin-layout"
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
} from "recharts"
import { toast } from "sonner"

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
const chartData = [
  { name: "01/03", appointments: 120, registrations: 45 },
  { name: "05/03", appointments: 150, registrations: 52 },
  { name: "10/03", appointments: 180, registrations: 48 },
  { name: "15/03", appointments: 210, registrations: 65 },
  { name: "20/03", appointments: 190, registrations: 58 },
  { name: "25/03", appointments: 240, registrations: 72 },
  { name: "30/03", appointments: 280, registrations: 85 },
]

export default function AdminPage() {
  const { language } = useLanguage()
  const { user } = useAuth()
  const isSpanish = language === "es"
  const supabase = createClient()

  // States
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    mrr: 0,
    doctors: 0,
    patients: 0,
    totalAppointments: 0,
    conversionRate: "0%",
  })
  const [pendingProfessionals, setPendingProfessionals] = useState<any[]>([])

  useEffect(() => {
    const loadExecutiveSummary = async () => {
      setLoading(true)
      try {
        // 1. Fetch Stats in parallel
        const [
          { count: doctorsCount },
          { count: patientsCount },
          { count: appointmentsCount },
          { count: activeSubsCount }
        ] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "professional"),
          supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "patient"),
          supabase.from("appointments").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true }).eq("subscription_status", "active")
        ])

        // Logic for MRR and Conversion
        const estimatedMRR = (activeSubsCount || 0) * 29.90 // Mock price
        const conversionRate = doctorsCount ? `${(((activeSubsCount || 0) / doctorsCount) * 100).toFixed(1)}%` : "0%"

        setStats({
          mrr: estimatedMRR,
          doctors: doctorsCount || 0,
          patients: patientsCount || 0,
          totalAppointments: appointmentsCount || 0,
          conversionRate,
        })

        // 2. Fetch Pending Verifications
        const { data: pending } = await supabase
          .from("professionals")
          .select(`
            id, specialty, professional_license_number, verification_document_url,
            profiles:id(first_name, last_name, avatar_url, email)
          `)
          .eq("verification_status", "pending")
          .limit(10)

        setPendingProfessionals(pending || [])

      } catch (error) {
        console.error("Admin dashboard summary error:", error)
      } finally {
        setLoading(false)
      }
    }

    loadExecutiveSummary()
  }, [supabase])

  const handleVerify = async (id: string, approve: boolean) => {
    try {
      const { error } = await supabase.rpc('update_verification_status', {
        p_professional_id: id,
        p_new_status: approve ? 'verified' : 'rejected',
        p_notes: approve ? 'Approved via Dashboard' : 'Rejected via Dashboard'
      })

      if (error) throw error
      
      toast.success(approve ? "Médico verificado exitosamente" : "Verificación rechazada")
      setPendingProfessionals(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error("Error updating status:", err)
      toast.error("Error al procesar la solicitud")
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600 mx-auto" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">
          {isSpanish ? "Analizando métricas globales..." : "Analyzing global metrics..."}
        </p>
      </div>
    </div>
  )

  return (
    <RouteGuard requiredRole="admin">
      <AdminLayout>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 pb-10">
          
          {/* Executive Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center shadow-xl shadow-teal-500/20">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                  {isSpanish ? "Centro de Mando" : "Command Center"}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                    {isSpanish ? "Ejecutivo / Control Total" : "Executive / Total Control"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="hidden lg:flex flex-col text-right">
                 <span className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Última actualización</span>
                 <span className="text-sm font-bold text-teal-600">{new Date().toLocaleTimeString()}</span>
               </div>
               <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-600/20 px-6 h-11 font-bold">
                 <Activity className="h-4 w-4 mr-2" />
                 {isSpanish ? "Reporte Detallado" : "Detailed Report"}
               </Button>
            </div>
          </div>

          {/* Executive Overview Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { 
                label: isSpanish ? "Ingresos (MRR)" : "Revenue (MRR)", 
                val: `$${stats.mrr.toLocaleString()}`, 
                detail: isSpanish ? "Suscripciones Pro" : "Pro Subscriptions",
                icon: CreditCard, 
                color: "text-emerald-600", 
                bg: "bg-emerald-500/10",
                trend: "+12.4%" 
              },
              { 
                label: isSpanish ? "Usuarios Activos" : "Active Users", 
                val: stats.doctors + stats.patients, 
                detail: `${stats.doctors} Dr. / ${stats.patients} Pac.`,
                icon: Users, 
                color: "text-blue-600", 
                bg: "bg-blue-500/10",
                trend: "+8.2%"
              },
              { 
                label: isSpanish ? "Citas Totales" : "Total Appointments", 
                val: stats.totalAppointments, 
                detail: isSpanish ? "Gestionadas hoy" : "Managed today",
                icon: CalendarDays, 
                color: "text-purple-600", 
                bg: "bg-purple-500/10",
                trend: "+14.0%"
              },
              { 
                label: isSpanish ? "Tasa Conversión" : "Conversion Rate", 
                val: stats.conversionRate, 
                detail: isSpanish ? "Free ⮕ Pro" : "Free ⮕ Pro",
                icon: TrendingUp, 
                color: "text-orange-600", 
                bg: "bg-orange-500/10",
                trend: "+2.1%"
              },
            ].map((kpi, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card className="border-border/40 bg-card/40 backdrop-blur-xl border-l-4 border-l-teal-600/50 shadow-sm hover:shadow-md transition-all h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn("p-2.5 rounded-xl", kpi.bg)}>
                        <kpi.icon className={cn("h-6 w-6", kpi.color)} />
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold text-[10px]">{kpi.trend}</Badge>
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
                      <h3 className="text-3xl font-black tracking-tight">{kpi.val}</h3>
                      <p className="text-xs text-muted-foreground mt-2 font-medium">{kpi.detail}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-7">
            {/* Growth Chart Section */}
            <Card className="lg:col-span-4 border-border/40 bg-card/40 backdrop-blur-xl overflow-hidden shadow-lg">
              <CardHeader className="p-8 border-b border-border/10 flex flex-row items-center justify-between bg-teal-600/[0.02]">
                <div>
                  <CardTitle className="text-xl font-black flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-teal-600" />
                    {isSpanish ? "Crecimiento de la Plataforma" : "Platform Growth"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{isSpanish ? "Métricas de los últimos 30 días" : "Metrics from last 30 days"}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-teal-600" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Citas</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Registros</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="h-[380px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorApt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0f766e" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#0f766e" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5}/>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255,255,255,0.95)', 
                          borderRadius: '16px', 
                          border: 'none', 
                          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                          backdropFilter: 'blur(8px)'
                        }}
                        itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="appointments" stroke="#0f766e" strokeWidth={4} fillOpacity={1} fill="url(#colorApt)" />
                      <Area type="monotone" dataKey="registrations" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorReg)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Verification Queue Section */}
            <Card className="lg:col-span-3 border-border/40 bg-card/40 backdrop-blur-xl shadow-lg flex flex-col">
              <CardHeader className="p-8 border-b border-border/10 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-teal-600" />
                    {isSpanish ? "Cola de Verificación" : "Verification Queue"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isSpanish ? "KYP: Médicos por validar" : "KYP: Doctors to validate"}
                  </p>
                </div>
                <Badge className="bg-orange-500 text-white border-0 px-3 py-1 font-black rounded-full animate-bounce">
                  {pendingProfessionals.length}
                </Badge>
              </CardHeader>
              <CardContent className="p-8 flex-1">
                {pendingProfessionals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                    </div>
                    <p className="text-lg font-bold text-foreground">{isSpanish ? "Todo controlado" : "All set"}</p>
                    <p className="text-sm text-muted-foreground max-w-[200px] mt-1">{isSpanish ? "No hay solicitudes pendientes en este momento." : "No pending requests at the moment."}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingProfessionals.map((prof) => (
                      <div key={prof.id} className="p-5 rounded-2xl bg-muted/30 border border-border/10 group hover:border-teal-600/30 transition-all hover:translate-x-1">
                        <div className="flex items-center gap-4 mb-4">
                          <Avatar className="h-12 w-12 border-2 border-background shadow-lg">
                            <AvatarImage src={prof.profiles?.avatar_url} />
                            <AvatarFallback className="bg-teal-50 text-teal-700 font-bold text-lg">
                              {prof.profiles?.first_name?.[0]}{prof.profiles?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-sm truncate">{prof.profiles?.first_name} {prof.profiles?.last_name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="outline" className="text-[9px] uppercase font-bold text-teal-600 border-teal-600/20 px-1.5 h-4">{prof.specialty}</Badge>
                              <span className="text-[10px] text-muted-foreground font-semibold">RNPI: {prof.professional_license_number || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                           <Button 
                             variant="outline" 
                             size="sm" 
                             className="text-xs h-9 rounded-xl border-border/40 font-bold gap-2"
                             onClick={() => prof.verification_document_url && window.open(prof.verification_document_url, '_blank')}
                           >
                             <Eye className="h-3.5 w-3.5" />
                             {isSpanish ? "Documento" : "Document"}
                           </Button>
                           <div className="flex gap-1.5">
                              <Button 
                                size="sm" 
                                className="flex-1 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white group-hover:scale-[1.02] transition-transform"
                                onClick={() => handleVerify(prof.id, true)}
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                className="flex-1 h-9 rounded-xl transition-transform hover:scale-[1.02]"
                                onClick={() => handleVerify(prof.id, false)}
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-8">
                   <Button variant="ghost" className="w-full text-teal-600 font-bold hover:bg-teal-50" asChild>
                     <Link href="/admin/professionals">
                        {isSpanish ? "Gestionar todos los médicos" : "Manage all doctors"}
                        <ArrowRight className="h-4 w-4 ml-2" />
                     </Link>
                   </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Activity Table (Information Density) */}
          <motion.div variants={itemVariants}>
            <Card className="border-border/40 bg-card/40 backdrop-blur-xl shadow-lg">
              <CardHeader className="p-8 border-b border-border/10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black">{isSpanish ? "Actividad Reciente de Usuarios" : "Recent User Activity"}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{isSpanish ? "Supervisión de registros y cambios de estatus" : "Monitoring registrations and status changes"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl h-9" asChild>
                      <Link href="/admin/users">{isSpanish ? "Ver Pacientes" : "View Patients"}</Link>
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl h-9" asChild>
                      <Link href="/admin/professionals">{isSpanish ? "Ver Médicos" : "View Doctors"}</Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent px-8">
                      <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest">{isSpanish ? "Usuario" : "User"}</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">{isSpanish ? "Rol / Especialidad" : "Role / Specialty"}</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Status / {isSpanish ? "Suscripción" : "Subscription"}</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">{isSpanish ? "Fecha Registro" : "Joined Date"}</TableHead>
                      <TableHead className="pr-8 text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Simplified table row placeholders since specific recent users query wasn't requested but table was part of 'Enterprise look' */}
                    {[1, 2, 3, 4, 5].map((i) => (
                      <TableRow key={i} className="hover:bg-teal-600/[0.02] border-b border-border/5 group h-16">
                        <TableCell className="pl-8">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-teal-600/10 flex items-center justify-center text-teal-600 text-[10px] font-black shadow-sm">U</div>
                            <div>
                               <p className="font-bold text-sm leading-none">Usuario Ejemplo {i}</p>
                               <p className="text-[10px] text-muted-foreground mt-1">ejemplo@nurea.cl</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[9px] uppercase font-bold tracking-tighter h-5">Patient</Badge>
                        </TableCell>
                        <TableCell>
                           <div className="flex items-center gap-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                             <span className="text-xs font-bold text-foreground">Active</span>
                           </div>
                        </TableCell>
                        <TableCell className="text-xs font-medium text-muted-foreground">Mar {10+i}, 2026</TableCell>
                        <TableCell className="pr-8 text-right">
                           <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                             <MoreVertical className="h-4 w-4" />
                           </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>

        </motion.div>
      </AdminLayout>
    </RouteGuard>
  )
}
