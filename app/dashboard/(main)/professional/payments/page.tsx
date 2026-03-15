"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  CreditCard, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckCircle2, 
  Download,
  Search,
  Filter,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { useLanguage } from "@/contexts/language-context"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { format } from "date-fns"
import { es, enUS } from "date-fns/locale"

export default function ProfessionalPaymentsPage() {
  const { language } = useLanguage()
  const { user } = useAuth()
  const isSpanish = language === "es"
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<any[]>([])
  const [stats, setStats] = useState({
    available: 0,
    escrow: 0,
    totalEarned: 0
  })

  useEffect(() => {
    const loadFinances = async () => {
      if (!user?.id) return
      
      try {
        const { data, error } = await supabase
          .from("financial_transactions")
          .select(`
            *,
            patient:profiles!financial_transactions_patient_id_fkey(first_name, last_name, avatar_url),
            appointment:appointments(appointment_date, appointment_time, type)
          `)
          .eq("professional_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error

        setTransactions(data || [])

        // Calculate stats
        const available = data
          ?.filter(t => t.status === "available")
          .reduce((acc, curr) => acc + Number(curr.professional_net), 0) || 0
        
        const escrow = data
          ?.filter(t => t.status === "escrow")
          .reduce((acc, curr) => acc + Number(curr.professional_net), 0) || 0
        
        const total = data
          ?.filter(t => ["available", "paid_out", "payout_pending"].includes(t.status))
          .reduce((acc, curr) => acc + Number(curr.professional_net), 0) || 0

        setStats({ available, escrow, totalEarned: total })
      } catch (err) {
        console.error("Error loading finances:", err)
      } finally {
        setLoading(false)
      }
    }

    loadFinances()
  }, [user?.id, supabase])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "escrow":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1"><Clock className="w-3 h-3"/> Escrow</Badge>
      case "available":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1"><CheckCircle2 className="w-3 h-3"/> {isSpanish ? "Disponible" : "Available"}</Badge>
      case "paid_out":
        return <Badge variant="secondary">{isSpanish ? "Pagado" : "Paid Out"}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
     return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin h-8 w-8 text-teal-600"/></div>
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {isSpanish ? "Mis Finanzas" : "My Finances"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {isSpanish 
            ? "Gestiona tus ingresos y retiros. En NUREA, recibes el 100% de lo que tus pacientes pagan." 
            : "Manage your income and withdrawals. At NUREA, you receive 100% of what your patients pay."}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-teal-100 bg-teal-50/30 dark:bg-teal-950/10 hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-teal-700 dark:text-teal-400 uppercase tracking-wider">
              {isSpanish ? "Disponible para Retiro" : "Available for Payout"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-900 dark:text-teal-50">${stats.available.toLocaleString()}</div>
            <p className="text-xs text-teal-600 dark:text-teal-500 mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> {isSpanish ? "Consultas completadas" : "Completed consultations"}
            </p>
            <Button className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl">
              {isSpanish ? "Retirar Fondos" : "Withdraw Funds"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white dark:bg-slate-900 hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              {isSpanish ? "En Garantía (Escrow)" : "In Escrow"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${stats.escrow.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" /> {isSpanish ? "Citas confirmadas por realizar" : "Upcoming confirmed appointments"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white dark:bg-slate-900 hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              {isSpanish ? "Total Generado" : "Total Earned"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${stats.totalEarned.toLocaleString()}</div>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
              <ArrowUpRight className="h-3 w-3" /> {isSpanish ? "100% Retención para ti" : "100% Retention for you"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="border-slate-200 bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader className="border-b border-slate-100 p-6 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg font-bold">
            {isSpanish ? "Historial de Transacciones" : "Transaction History"}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder={isSpanish ? "Buscar..." : "Search..."} className="pl-9 h-9 w-[200px] rounded-lg" />
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
              <TableRow>
                <TableHead className="font-bold">{isSpanish ? "Fecha" : "Date"}</TableHead>
                <TableHead className="font-bold">{isSpanish ? "Paciente" : "Patient"}</TableHead>
                <TableHead className="font-bold">{isSpanish ? "Cita" : "Appointment"}</TableHead>
                <TableHead className="font-bold">{isSpanish ? "Estado" : "Status"}</TableHead>
                <TableHead className="text-right font-bold">{isSpanish ? "Monto" : "Amount"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-slate-500">
                    {isSpanish ? "No se encontraron transacciones." : "No transactions found."}
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((t) => (
                  <TableRow key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <TableCell className="text-sm font-medium">
                      {format(new Date(t.created_at), "dd MMM, yyyy", { locale: isSpanish ? es : enUS })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                          {t.patient?.avatar_url ? (
                            <img src={t.patient.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400">
                              {t.patient?.first_name?.[0]}{t.patient?.last_name?.[0]}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-bold">{t.patient?.first_name} {t.patient?.last_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <p className="font-medium">{t.appointment?.type === 'online' ? (isSpanish ? 'Teleconsulta' : 'Video') : (isSpanish ? 'Presencial' : 'Clinic')}</p>
                        <p className="text-slate-500">{t.appointment?.appointment_date}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(t.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="font-bold text-slate-900 dark:text-white">
                        +${Number(t.professional_net).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-teal-600 font-bold uppercase tracking-tight">
                        100% {isSpanish ? "PARA TI" : "FOR YOU"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
