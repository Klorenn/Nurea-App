"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  CreditCard, 
  TrendingUp, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight, 
  Building2, 
  Calendar, 
  Filter, 
  Download,
  Wallet,
  PieChart as PieChartIcon,
  RefreshCcw,
  CheckCircle2,
  Clock
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from "recharts"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function AdminFinancesPage() {
  const [stats, setStats] = useState<any>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [payoutList, setPayoutList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("Este Mes")
  const [processingPayout, setProcessingPayout] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/admin/finances/stats")
        const data = await response.json()
        setStats(data.stats)
        setChartData(data.chartData)
        setPayoutList(data.payoutList)
      } catch (err) {
        console.error("Error loading finances:", err)
        toast.error("Error al cargar datos financieros")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleProcessPayout = (id: string, name: string) => {
    setProcessingPayout(id)
    setTimeout(() => {
      setProcessingPayout(null)
      setPayoutList(prev => prev.filter(p => p.id !== id))
      toast.success(`Pago procesado con éxito para ${name}`)
    }, 2000)
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(val)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <RefreshCcw className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
            Dashboard de Ingresos
          </h1>
          <p className="text-slate-500 font-medium">Gestión financiera centralizada de NUREA</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {["Este Mes", "Último Trimestre", "Año Actual"].map((p) => (
              <Button
                key={p}
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-lg px-4 text-xs font-bold transition-all",
                  period === p ? "bg-white dark:bg-slate-900 text-violet-600 shadow-sm" : "text-slate-500"
                )}
                onClick={() => setPeriod(p)}
              >
                {p}
              </Button>
            ))}
          </div>
          <Button variant="outline" className="rounded-xl border-slate-200 gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Volumen Total (GMV)" 
          value={formatCurrency(stats?.gmv || 0)} 
          trend="+12.5%" 
          trendUp={true}
          icon={Wallet}
          color="violet"
        />
        <KpiCard 
          title="Ingresos NUREA" 
          value={formatCurrency(stats?.netRevenue || 0)} 
          trend="+8.2%" 
          trendUp={true}
          icon={TrendingUp}
          color="emerald"
        />
        <KpiCard 
          title="Suscripciones Activas" 
          value={formatCurrency(stats?.mrr || 0)} 
          trend="+5.1%" 
          trendUp={true}
          icon={Users}
          subtext={`${stats?.activeSubs || 0} Doctores Activos`}
          color="blue"
        />
        <KpiCard 
          title="Pagos Pendientes" 
          value={formatCurrency(stats?.pendingPayouts || 0)} 
          trend="-2.4%" 
          trendUp={false}
          icon={Clock}
          color="amber"
          warning={true}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Chart */}
        <Card className="lg:col-span-2 border-slate-200/60 shadow-xl shadow-slate-200/20 rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black uppercase italic tracking-tighter">Comparativa de Ingresos</CardTitle>
                <CardDescription>Suscripciones vs. Comisiones (6 meses)</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-violet-500" />
                  <span className="text-[10px] font-bold uppercase text-slate-400">Suscripciones</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-teal-500" />
                  <span className="text-[10px] font-bold uppercase text-slate-400">Comisiones</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#64748B' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#64748B' }}
                  tickFormatter={(val) => `$${val/1000}k`}
                />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="subscriptions" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="commissions" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Growth Line Chart */}
        <Card className="border-slate-200/60 shadow-xl shadow-slate-200/20 rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-lg font-black uppercase italic tracking-tighter">Crecimiento Transaccional</CardTitle>
            <CardDescription>Volumen de citas procesadas</CardDescription>
          </CardHeader>
          <CardContent className="pt-8 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="transactions" 
                  stroke="#8b5cf6" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Payouts Table */}
      <Card className="border-slate-200/60 shadow-xl shadow-slate-200/20 rounded-3xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-black uppercase italic tracking-tighter">Liquidaciones Pendientes</CardTitle>
              <CardDescription>Especialistas con fondos listos para retirar</CardDescription>
            </div>
            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none rounded-lg px-3 flex gap-2">
              <RefreshCcw className="h-3 w-3" /> Pendiente: {payoutList?.length || 0}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 text-left">
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Especialista</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Especialidad</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider text-right">Monto Acumulado</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!payoutList || payoutList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-medium italic">
                      No hay liquidaciones pendientes en este momento.
                    </td>
                  </tr>
                ) : payoutList.map((payout) => (
                  <tr key={payout.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-slate-100">
                          <AvatarImage src={payout.avatar} />
                          <AvatarFallback className="bg-violet-600 text-white font-bold">{(payout.name?.[0] || 'P').toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-bold text-slate-700">{payout.name || 'Profesional'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="text-slate-500 rounded-lg font-medium border-slate-200">
                        {payout.specialty}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-mono font-black text-slate-900 border-b-2 border-violet-100">
                        {formatCurrency(payout.amount || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {(payout.amount || 0) > 100000 ? (
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 rounded-lg px-2 py-1 font-bold gap-1.5">
                          <CheckCircle2 className="h-3 w-3" /> Liquidado
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-50 text-amber-600 border-amber-100 rounded-lg px-2 py-1 font-bold gap-1.5">
                          <Clock className="h-3 w-3" /> En Proceso
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        size="sm"
                        onClick={() => handleProcessPayout(payout.id, payout.name)}
                        disabled={(payout.amount || 0) < 100000 || processingPayout === payout.id}
                        className={cn(
                          "rounded-xl font-black uppercase tracking-wider text-[10px] px-4",
                          (payout.amount || 0) >= 100000 
                            ? "bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20" 
                            : "bg-slate-100 text-slate-400"
                        )}
                      >
                        {processingPayout === payout.id ? (
                          <RefreshCcw className="h-3 w-3 animate-spin mr-1" />
                        ) : "Procesar Pago"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function KpiCard({ title, value, trend, trendUp, icon: Icon, color, subtext, warning }: any) {
  const colorMap: any = {
    violet: "text-violet-600 bg-violet-50 border-violet-100 shadow-violet-500/5",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100 shadow-emerald-500/5",
    blue: "text-blue-600 bg-blue-50 border-blue-100 shadow-blue-500/5",
    amber: "text-amber-600 bg-amber-50 border-amber-100 shadow-amber-500/5"
  }

  return (
    <Card className={cn("border-slate-200/60 shadow-xl rounded-3xl transition-transform hover:scale-[1.02]", warning && "ring-2 ring-amber-500/20")}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-2.5 rounded-2xl", colorMap[color])}>
            <Icon className="h-5 w-5" />
          </div>
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full",
            trendUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
          )}>
            {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trend}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{title}</p>
          <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tighter">{value}</h3>
          {subtext && <p className="text-[10px] font-bold text-slate-400">{subtext}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
