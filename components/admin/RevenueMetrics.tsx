"use client"

import { useMemo } from "react"
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Coins, TrendingUp, Users, Wallet } from "lucide-react"

// Mock Data - En producción esto vendría de un endpoint consolidado (Supabase + Mercado Pago)
const REVENUE_DATA = [
  { name: "Mercado Pago", value: 7500, color: "#0d9488" }, // Teal 600
  { name: "Stellar (USDC)", value: 2500, color: "#8b5cf6" }, // Violet 500
]

const TRANSACTION_HISTORY = [
  { 
    id: "TX_9921", 
    user: "Dr. Juan Perez", 
    method: "Mercado Pago", 
    amount: "$25,000", 
    date: "2026-03-15", 
    status: "Active",
    hash: "ch_3Oc..." 
  },
  { 
    id: "TX_X402_B2", 
    user: "Paciente Maria L.", 
    method: "Stellar (x402)", 
    amount: "2.0 USDC", 
    date: "2026-03-15", 
    status: "Settled",
    hash: "0x4fe...a21" 
  },
  { 
    id: "TX_9920", 
    user: "Dra. Ana Gomez", 
    method: "Mercado Pago", 
    amount: "$25,000", 
    date: "2026-03-14", 
    status: "Active",
    hash: "ch_3Ob..." 
  },
]

export function RevenueMetrics() {
  const totalRevenue = useMemo(() => REVENUE_DATA.reduce((acc, curr) => acc + curr.value, 0), [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-white/5 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Ingresos Totales (USD Est.)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-teal-400 mt-1">+12.5% desde el mes pasado</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/5 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Suscripciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-slate-500 mt-1">Suscripciones Nurea Pro activas</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/5 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Coins className="w-4 h-4" /> Micropagos x402
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">58</div>
            <p className="text-xs text-purple-400 mt-1">Liquidados vía Stellar Network</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pastel: Distribución de Ingresos */}
        <Card className="bg-slate-900 border-white/5 text-white">
          <CardHeader>
            <CardTitle>Procedencia de Ingresos</CardTitle>
            <CardDescription className="text-slate-500">Distribución entre Pagos Fiat y Cripto</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={REVENUE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {REVENUE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tabla de Transacciones Unificada */}
        <Card className="bg-slate-900 border-white/5 text-white">
          <CardHeader>
            <CardTitle>Últimas Transacciones</CardTitle>
            <CardDescription className="text-slate-500">Suscripciones y actividad</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-slate-400">Usuario</TableHead>
                  <TableHead className="text-slate-400">Método</TableHead>
                  <TableHead className="text-slate-400">Monto</TableHead>
                  <TableHead className="text-slate-400 text-right">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TRANSACTION_HISTORY.map((tx) => (
                  <TableRow key={tx.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="font-medium">{tx.user}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {tx.method.includes("Stellar") ? (
                          <Coins className="w-3 h-3 text-purple-400" />
                        ) : (
                          <CreditCard className="w-3 h-3 text-teal-400" />
                        )}
                        <span className="text-xs">{tx.method}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{tx.amount}</TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px] capitalize",
                          tx.status === "Settled" ? "border-teal-500/50 text-teal-500" : "border-blue-500/50 text-blue-500"
                        )}
                      >
                        {tx.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
