"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  CreditCard, 
  Wallet, 
  ArrowUpRight, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Loader2,
  Settings,
  RefreshCw,
  History
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export default function PayoutsPage() {
  const [loading, setLoading] = useState(true)
  const [onboardingLoading, setOnboardingLoading] = useState(false)
  const [account, setAccount] = useState<any>(null)

  const fetchAccount = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/professional/stripe/account')
      const data = await response.json()
      if (response.ok) {
        setAccount(data)
      }
    } catch (error) {
      console.error('Error fetching account:', error)
      toast.error('No se pudo cargar la información de pagos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccount()
  }, [])

  const handleOnboarding = async () => {
    try {
      setOnboardingLoading(true)
      const response = await fetch('/api/professional/stripe/onboarding', {
        method: 'POST'
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.message || 'Error al generar link de onboarding')
      }
    } catch (error) {
      console.error('Onboarding error:', error)
      toast.error('Error al iniciar la configuración de pagos')
      setOnboardingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Wallet className="h-8 w-8 text-teal-600" />
            Pagos y Liquidaciones
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Gestiona tus ingresos, configura tu cuenta bancaria y revisa tus saldos.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAccount} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          {account?.isConnected && (
            <Button variant="default" className="bg-teal-600 hover:bg-teal-700" onClick={handleOnboarding}>
              <Settings className="h-4 w-4 mr-2" />
              Configurar Stripe
            </Button>
          )}
        </div>
      </div>

      {!account?.isConnected ? (
        <Card className="border-teal-100 dark:border-teal-900 bg-teal-50/30 dark:bg-teal-950/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <CreditCard className="h-32 w-32" />
          </div>
          <CardContent className="p-8 md:p-12 text-center max-w-2xl mx-auto">
            <div className="bg-teal-100 dark:bg-teal-900/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="h-10 w-10 text-teal-600 dark:text-teal-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Configura tu cuenta de cobro</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
              Para recibir los pagos de tus consultas de forma automática y segura, necesitamos conectarnos con Stripe.
              Es un proceso rápido de una sola vez.
            </p>
            <Button 
              size="lg" 
              className="bg-teal-600 hover:bg-teal-700 px-8 h-14 text-lg font-semibold shadow-xl shadow-teal-500/20"
              onClick={handleOnboarding}
              disabled={onboardingLoading}
            >
              {onboardingLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  Comenzar Configuración
                  <ArrowUpRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
            <p className="mt-6 text-sm text-slate-500 flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-teal-500" />
              Transferencias directas a tu cuenta bancaria • Split automático del 5% comisionado por Nurea
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  Saldo Disponible
                </CardDescription>
                <CardTitle className="text-3xl font-bold">
                  ${((account.balance.available[0]?.amount || 0) / 1).toLocaleString('es-CL')}
                  <span className="text-sm font-normal text-slate-500 ml-1">CLP</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500">Listos para transferir a tu cuenta bancaria.</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-amber-500" />
                  Saldo Pendiente
                </CardDescription>
                <CardTitle className="text-3xl font-bold">
                  ${((account.balance.pending[0]?.amount || 0) / 1).toLocaleString('es-CL')}
                  <span className="text-sm font-normal text-slate-500 ml-1">CLP</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500">Ingresos en procesamientos de pagos recientes.</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Estado de Cuenta</CardDescription>
                <CardTitle className="flex items-center gap-2">
                  {account.payoutsEnabled ? (
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 py-1 px-3">
                      Activo y Verificado
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200 py-1 px-3">
                      Pendiente de Acción
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500">Cuenta Connect: {account.id}</p>
              </CardContent>
            </Card>
          </div>

          {!account.payoutsEnabled && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/50">
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900 dark:text-amber-200">Información faltante</p>
                    <p className="text-sm text-amber-800 dark:text-amber-300/80">
                      Stripe requiere información adicional antes de poder habilitar las transferencias a tu banco.
                    </p>
                  </div>
                </div>
                <Button variant="default" className="bg-amber-600 hover:bg-amber-700" onClick={handleOnboarding}>
                  Completar Registro
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <History className="h-5 w-5 text-slate-400" />
                  Próximas Transferencias
                </CardTitle>
                <CardDescription>Pagos programados hacia tu cuenta bancaria vinculada.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
                        <ArrowUpRight className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <p className="font-medium">Transferencia Automática</p>
                        <p className="text-xs text-slate-500">Frecuencia: Diaria</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${((account.balance.available[0]?.amount || 0) / 1).toLocaleString('es-CL')}</p>
                      <p className="text-[10px] text-teal-600 font-medium">Programado</p>
                    </div>
                  </div>
                  <p className="text-center text-xs text-slate-500 py-4">
                    Stripe procesa las transferencias automáticamente según tu configuración. 
                    Puedes cambiar la frecuencia en el panel de Stripe.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Settings className="h-5 w-5 text-slate-400" />
                  Configuración Directa
                </CardTitle>
                <CardDescription>Accede al Dashboard de Stripe Express para ver detalles avanzados.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Email vinculado:</span>
                    <span className="font-medium">{account.accountEmail || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">ID de cuenta:</span>
                    <span className="font-mono text-xs">{account.id}</span>
                  </div>
                  <div className="flex justify-between text-sm py-2">
                    <span className="text-slate-500">Plataforma:</span>
                    <span className="font-medium">Nurea Health</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={handleOnboarding}>
                  Acceder a Stripe Dashboard
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
