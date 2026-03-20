"use client"

import { useState, useEffect, FormEvent } from "react"
import { RouteGuard } from "@/components/auth/route-guard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Ticket,
  Plus,
  Trash2,
  Users,
  Copy,
  CheckCircle2,
  Loader2,
  TrendingUp,
  UserPlus,
  Crown,
  Shuffle
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ReferralCode {
  id: string
  code: string
  description: string
  max_uses: number
  uses_count: number
  discount_percentage: number | null
  is_active: boolean
  created_at: string
}

export default function AdminMarketingPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const supabase = createClient()
  
  const [codes, setCodes] = useState<ReferralCode[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  
  // Form state
  const [newCode, setNewCode] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newMaxUses, setNewMaxUses] = useState(10)
  const [newDiscount, setNewDiscount] = useState<string>("")

  useEffect(() => {
    fetchCodes()
  }, [])

  const fetchCodes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('referral_codes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      toast.error(isSpanish ? "Error al cargar códigos" : "Error loading codes")
    } else {
      setCodes(data || [])
    }
    setLoading(false)
  }

  const generateRandomCode = () => {
    const prefix = ["VIP", "PRO", "ALFA", "NUREA", "DOC"][Math.floor(Math.random() * 5)]
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    setNewCode(`${prefix}${suffix}`)
  }

  const handleCreateCode = async (e: FormEvent) => {
    e.preventDefault()
    if (!newCode) return

    setIsCreating(true)
    const { error } = await supabase
      .from('referral_codes')
      .insert({
        code: newCode.toUpperCase(),
        description: newDesc,
        max_uses: newMaxUses,
        discount_percentage: newDiscount ? parseInt(newDiscount) : null
      })

    if (error) {
      if (error.code === '23505') {
        toast.error(isSpanish ? `El código "${newCode.toUpperCase()}" ya existe. Prueba con otro.` : `Code "${newCode.toUpperCase()}" already exists. Try another.`)
      } else {
        toast.error(isSpanish ? "Error al crear el código" : "Error creating code")
        console.error("referral_codes insert error:", error)
      }
    } else {
      toast.success(isSpanish ? "Código VIP generado" : "VIP Code generated")
      setNewCode("")
      setNewDesc("")
      setNewMaxUses(10)
      setNewDiscount("")
      fetchCodes()
    }
    setIsCreating(false)
  }

  const toggleCodeStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('referral_codes')
      .update({ is_active: !currentStatus })
      .eq('id', id)
    
    if (error) {
      toast.error(isSpanish ? "Error al actualizar" : "Error updating")
    } else {
      fetchCodes()
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success(isSpanish ? "Copiado al portapapeles" : "Copied to clipboard")
  }

  const totalUsages = codes.reduce((acc, c) => acc + c.uses_count, 0)
  const totalMaxUses = codes.reduce((acc, c) => acc + (c.max_uses || 0), 0)
  const efficiency = totalMaxUses > 0 ? Math.round((totalUsages / totalMaxUses) * 100) : 0

  return (
    <RouteGuard requiredRole="admin">
      
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <Crown className="h-8 w-8 text-amber-500" />
                {isSpanish ? "Marketing & VIP" : "Marketing & VIP"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {isSpanish 
                  ? "Gestiona invitaciones exclusivas y códigos para doctores fundadores"
                  : "Manage exclusive invitations and codes for founder doctors"}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-xl">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">
                      {isSpanish ? "Total Referidos" : "Total Referrals"}
                    </p>
                    <h3 className="text-3xl font-bold mt-1">{totalUsages}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-teal-500/20 flex items-center justify-center">
                    <UserPlus className="h-6 w-6 text-teal-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-teal-400">
                  <TrendingUp className="h-3 w-3" />
                  <span>{isSpanish ? "+12% esta semana" : "+12% this week"}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {isSpanish ? "Códigos Activos" : "Active Codes"}
                    </p>
                    <h3 className="text-3xl font-bold mt-1">
                      {codes.filter(c => c.is_active).length}
                    </h3>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                    <Ticket className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {isSpanish ? "Eficiencia" : "Efficiency"}
                    </p>
                    <h3 className="text-3xl font-bold mt-1">
                      {efficiency}%
                    </h3>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-indigo-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Create Code Form */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-slate-200 dark:border-slate-800 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {isSpanish ? "Generar Nueva Invitación" : "Generate New Invitation"}
                  </CardTitle>
                  <CardDescription>
                    {isSpanish 
                      ? "Los códigos VIP atraen a mejores profesionales." 
                      : "VIP codes attract better professionals."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateCode} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">{isSpanish ? "Código VIP" : "VIP Code"}</Label>
                      <div className="flex gap-2">
                        <Input
                          id="code"
                          placeholder="EJ: ALFA100"
                          value={newCode}
                          onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                          className="font-mono font-bold text-center tracking-widest text-lg h-12"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 shrink-0"
                          onClick={generateRandomCode}
                          title={isSpanish ? "Generar código aleatorio" : "Generate random code"}
                        >
                          <Shuffle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="desc">{isSpanish ? "Descripción" : "Description"}</Label>
                      <Input 
                        id="desc"
                        placeholder={isSpanish ? "Para doctores de Instagram" : "For Instagram doctors"}
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="max">{isSpanish ? "Máx. Usos" : "Max Uses"}</Label>
                        <Input 
                          id="max"
                          type="number"
                          value={newMaxUses}
                          onChange={(e) => setNewMaxUses(parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="disc">{isSpanish ? "Dcto (%)" : "Disc (%)"}</Label>
                        <Input 
                          id="disc"
                          type="number"
                          placeholder="Opcional"
                          value={newDiscount}
                          onChange={(e) => setNewDiscount(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-slate-900 dark:bg-slate-50 hover:bg-slate-800 dark:hover:bg-slate-200 h-12 rounded-xl"
                      disabled={isCreating || !newCode}
                    >
                      {isCreating ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      {isSpanish ? "Crear Código Maestro" : "Create Master Code"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Codes List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <Ticket className="h-5 w-5 text-muted-foreground" />
                {isSpanish ? "Bóveda de Códigos" : "Code Vault"}
              </h2>

              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : codes.length === 0 ? (
                <div className="text-center py-12 bg-muted/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <Ticket className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isSpanish ? "Aún no hay códigos generados" : "No codes generated yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {codes.map((code) => (
                    <motion.div
                      key={code.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className={cn(
                        "overflow-hidden border-slate-200 dark:border-slate-800",
                        !code.is_active && "opacity-60 saturate-50"
                      )}>
                        <div className="flex flex-col sm:flex-row items-center">
                          <div className="p-6 flex-1 w-full">
                            <div className="flex items-center justify-between mb-2">
                              <Badge className="font-mono text-base tracking-widest px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                                {code.code}
                              </Badge>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                                  onClick={() => copyToClipboard(code.code)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Badge variant={code.is_active ? "default" : "secondary"}>
                                  {code.is_active ? (isSpanish ? "Activo" : "Active") : (isSpanish ? "Inactivo" : "Inactive")}
                                </Badge>
                              </div>
                            </div>
                            <h4 className="font-semibold text-lg">{code.description || "Sin descripción"}</h4>
                            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Users className="h-4 w-4" />
                                <span>{code.uses_count} / {code.max_uses} {isSpanish ? "usos" : "uses"}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Plus className="h-4 w-4" />
                                <span>{format(new Date(code.created_at), 'dd MMM, yyyy', { locale: isSpanish ? es : undefined })}</span>
                              </div>
                              {code.discount_percentage && (
                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                  -{code.discount_percentage}% Fee
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="p-4 bg-muted/30 w-full sm:w-auto flex sm:flex-col gap-2 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 sm:w-28"
                              onClick={() => toggleCodeStatus(code.id, code.is_active)}
                            >
                              {code.is_active ? (isSpanish ? "Pausar" : "Pause") : (isSpanish ? "Reactivar" : "Resume")}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="flex-1 sm:w-28 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={async () => {
                                if (confirm(isSpanish ? "¿Eliminar este código?" : "Delete this code?")) {
                                  await supabase.from('referral_codes').delete().eq('id', code.id)
                                  fetchCodes()
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {isSpanish ? "Borrar" : "Delete"}
                            </Button>
                          </div>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="h-1 w-full bg-slate-100 dark:bg-slate-800">
                          <div 
                            className="h-full bg-teal-500 transition-all duration-1000" 
                            style={{ width: `${Math.min((code.uses_count / code.max_uses) * 100, 100)}%` }}
                          />
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      
    </RouteGuard>
  )
}
