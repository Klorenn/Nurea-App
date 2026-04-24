"use client"

import { useState, useEffect } from "react"
import { 
  CreditCard, 
  Download, 
  Calendar, 
  Search,
  Filter,
  Loader2
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
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
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/contexts/language-context"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function PatientPaymentsPage() {
  const { language } = useLanguage()
  const { user } = useAuth()
  const isSpanish = language === "es"
  const supabase = createClient()

  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function loadPayments() {
      if (!user?.id) return
      
      try {
        const { data, error } = await supabase
          .from('finances')
          .select(`
            *,
            professional:profiles!finances_professional_id_fkey(first_name, last_name)
          `)
          .eq('patient_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setPayments(data || [])
      } catch (error) {
        console.error("Error loading payments:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPayments()
  }, [user?.id, supabase])

  const filteredPayments = payments.filter(p => {
    const doctorName = `${p.professional?.first_name} ${p.professional?.last_name}`.toLowerCase()
    const folio = p.receipt_folio?.toLowerCase() || ""
    return doctorName.includes(searchTerm.toLowerCase()) || folio.includes(searchTerm.toLowerCase())
  })

  const handleDownload = (paymentId: string) => {
    window.open(`/api/payments/receipt/${paymentId}`, '_blank')
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {isSpanish ? "Mi Historial de Pagos" : "My Payment History"}
          </h1>
          <p className="text-muted-foreground">
            {isSpanish 
              ? "Consulta y descarga tus comprobantes de atención médica." 
              : "View and download your medical care receipts."}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={isSpanish ? "Buscar por profesional o folio..." : "Search by professional or folio..."}
            className="pl-10 h-11 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-11 rounded-xl gap-2 w-full md:w-auto">
          <Filter className="h-4 w-4" />
          {isSpanish ? "Filtrar" : "Filter"}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      ) : payments.length === 0 ? (
        <Card className="border-dashed border-2 py-12 text-center bg-muted/5">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{isSpanish ? "No hay pagos registrados" : "No payments registered"}</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {isSpanish 
                  ? "Aquí aparecerán las transacciones que realices para tus citas médicas." 
                  : "The transactions you make for your medical appointments will appear here."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
              <TableRow>
                <TableHead className="font-bold">{isSpanish ? "Folio" : "Folio"}</TableHead>
                <TableHead className="font-bold">{isSpanish ? "Fecha" : "Date"}</TableHead>
                <TableHead className="font-bold">{isSpanish ? "Profesional" : "Professional"}</TableHead>
                <TableHead className="font-bold">{isSpanish ? "Monto" : "Amount"}</TableHead>
                <TableHead className="font-bold">{isSpanish ? "Estado" : "Status"}</TableHead>
                <TableHead className="text-right font-bold">{isSpanish ? "Acciones" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id} className="group hover:bg-teal-50/30 dark:hover:bg-teal-500/5 transition-colors">
                  <TableCell className="font-mono text-xs text-slate-500">
                    {payment.receipt_folio || 'PENDIENTE'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-teal-500" />
                      <span className="text-sm">
                        {format(new Date(payment.created_at), "dd MMM, yyyy", { locale: isSpanish ? es : undefined })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      Dr/a. {payment.professional?.first_name} {payment.professional?.last_name}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Telemedicina
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-slate-900 dark:text-white">
                    ${Number(payment.total_amount).toLocaleString('es-CL')}
                  </TableCell>
                  <TableCell>
                    {payment.status === 'completed' || payment.status === 'paid' ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                        {isSpanish ? "Completado" : "Completed"}
                      </Badge>
                    ) : payment.status === 'pending' ? (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">
                        {isSpanish ? "Pendiente" : "Pending"}
                      </Badge>
                    ) : payment.status === 'refunded' ? (
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">
                        {isSpanish ? "Reembolsado" : "Refunded"}
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-none">
                        {payment.status || (isSpanish ? "Desconocido" : "Unknown")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-500/10 gap-2 h-9 px-3 rounded-lg"
                      onClick={() => handleDownload(payment.id)}
                    >
                      <Download className="h-4 w-4" />
                      {isSpanish ? "Recibo" : "Receipt"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
