"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ShieldCheck, 
  Trash2, 
  RotateCcw, 
  Zap, 
  Coins, 
  Terminal,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { AuthPageBackground } from "@/components/ui/login-form"
import { PaymentModal } from "@/components/payments/PaymentModal"

export default function PaymentDebugPage() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<{ time: string, msg: string, type: 'info' | 'error' | 'success' | 'stellar' }[]>([])
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [rcStatus, setRcStatus] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const logEndRef = useRef<HTMLDivElement>(null)

  const addLog = (msg: string, type: 'info' | 'error' | 'success' | 'stellar' = 'info') => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg, type }])
  }

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const checkRCStatus = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para probar")
      return
    }
    setIsVerifying(true)
    addLog("Consultando Gatekeeper de RevenueCat...", "info")
    
    try {
      const res = await fetch("/api/premium-resource")
      const data = await res.json()
      
      setRcStatus(data)
      
      if (res.status === 200) {
        addLog("¡Acceso Premium Confirmado!", "success")
      } else if (res.status === 402) {
        // En Next.js App Router, los headers de la respuesta pueden no estar en el JSON
        addLog(`Acceso Denegado (402). Verificando respuesta x402...`, "error")
      } else {
        addLog(`Error inesperado: ${res.status}`, "error")
      }
    } catch (err: any) {
      addLog(`Error de conexión: ${err.message}`, "error")
    } finally {
      setIsVerifying(false)
    }
  }

  const simulateStellarPayment = async () => {
    if (!user) {
      toast.error("Inicia sesión")
      return
    }
    setIsSimulating(true)
    addLog("Iniciando simulación de pago x402...", "stellar")
    
    try {
      const mockHash = "SIM_" + Math.random().toString(36).substring(7).toUpperCase()
      addLog(`Hash generado: ${mockHash}. Enviando al Settle Gateway...`, "stellar")
      
      const res = await fetch("/api/x402/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionHash: mockHash })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        addLog("API de Liquidación respondió EXITOSAMENTE.", "success")
        addLog("RevenueCat Entitlement otorgado vía S2S (Simulado).", "success")
        toast.success("Pago simulado con éxito")
      } else {
        addLog(`Fallo en liquidación: ${data.error}`, "error")
      }
    } catch (err: any) {
      addLog(`Error en el flujo: ${err.message}`, "error")
    } finally {
      setIsSimulating(false)
    }
  }

  const resetUserAccess = async () => {
    if (!user) return
    setIsResetting(true)
    addLog("Solicitando reseteo de entitlements al servidor...", "info")
    
    try {
      const res = await fetch("/api/debug/reset-user", { method: "POST" })
      if (res.ok) {
        addLog("Usuario reseteado en RevenueCat Sandbox.", "success")
        setRcStatus(null)
        toast.info("Estado de usuario reseteado")
      } else {
        addLog("No se pudo resetear el usuario.", "error")
      }
    } catch (err: any) {
      addLog(`Error: ${err.message}`, "error")
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden dark:bg-transparent">
      <AuthPageBackground />
      
      <div className="relative z-10 w-full max-w-6xl mx-auto space-y-4">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="text-teal-400 w-6 h-6" />
              Nurea Finance Simulator
              <Badge variant="outline" className="ml-1 border-teal-500/50 text-teal-400 text-[10px]">QA Sandbox</Badge>
            </h1>
            <p className="text-slate-400 text-xs">Herramienta interna para validación de RevenueCat + x402.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-9 border-white/10 bg-white/5 hover:bg-white/10 text-xs" onClick={() => setLogs([])}>
              <RotateCcw className="w-3 h-3 mr-1" /> Limpiar
            </Button>
            <Button variant="destructive" size="sm" className="h-9 text-xs" disabled={isResetting} onClick={resetUserAccess}>
              {isResetting ? <Loader2 className="animate-spin w-3 h-3 mr-1" /> : <Trash2 className="w-3 h-3 mr-1" />}
              Resetear Mi Usuario
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel de Control */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-slate-950 border-white/10 text-white">
              <CardHeader>
                <CardTitle className="text-lg">Panel de Control</CardTitle>
                <CardDescription className="text-slate-500 text-xs">Simulación de eventos Sandbox.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Gatekeeper</span>
                  <Button 
                    variant="secondary" 
                    className="w-full justify-start h-11" 
                    onClick={checkRCStatus}
                    disabled={isVerifying}
                  >
                    {isVerifying ? <Loader2 className="animate-spin w-4 h-4 mr-2 text-teal-400" /> : <ShieldCheck className="w-4 h-4 mr-2 text-teal-400" />}
                    Verificar Estado RC
                  </Button>
                </div>
                
                <Separator className="bg-white/5" />
                
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Micropayment</span>
                  <Button 
                    className="w-full justify-start h-11 bg-teal-600 hover:bg-teal-700 text-white border-none" 
                    onClick={simulateStellarPayment}
                    disabled={isSimulating}
                  >
                    {isSimulating ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Coins className="w-4 h-4 mr-2" />}
                    Simular Pago x402
                  </Button>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Interface (UI)</span>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-11 border-teal-500/20 hover:bg-teal-500/10" 
                    onClick={() => setIsModalOpen(true)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2 text-teal-400" />
                    Abrir Modal de Pago Real
                  </Button>
                </div>

                <div className="rounded-lg bg-teal-500/5 p-3 border border-teal-500/20 text-[11px] text-teal-400/70 leading-relaxed">
                  <p className="font-bold underline mb-1">CÓMO USAR:</p>
                  1. Verifica estado (debe dar 402).<br/>
                  2. Simula pago x402 (se activa el promotional entitlement).<br/>
                  3. Verifica de nuevo (debe dar 200 OK).
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-950 border-white/10 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Estado del Usuario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">ID:</span>
                  <code className="bg-white/5 px-2 py-0.5 rounded truncate max-w-[150px]">
                    {user?.id || "N/A"}
                  </code>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Network:</span>
                  <Badge variant="outline" className="text-[10px] border-orange-500/30 text-orange-400 h-5">Testnet</Badge>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Entitlement:</span>
                  {rcStatus?.success ? (
                    <span className="text-teal-400 flex items-center gap-1 font-bold"><CheckCircle2 className="w-3 h-3" /> ACTIVE</span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-1 font-bold"><XCircle className="w-3 h-3" /> INACTIVE</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Consola */}
          <div className="lg:col-span-2 space-y-3 flex flex-col h-[480px]">
            <div className="flex-1 rounded-xl border border-white/10 bg-slate-950/80 backdrop-blur-md flex flex-col overflow-hidden shadow-2xl">
              <div className="bg-white/5 p-2 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400">
                  <Terminal className="w-3 h-3 text-teal-400" />
                  MESSAGING_BUS::PAYMENTS
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-teal-500 animate-pulse" />
                  <span className="text-[8px] text-teal-500 font-mono font-bold tracking-tighter uppercase">Listening</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 font-mono text-[10px] space-y-1">
                {logs.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-50">
                    <Terminal className="w-6 h-6 mb-2" />
                    <span className="italic text-[10px]">Esperando eventos...</span>
                  </div>
                )}
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-2 leading-relaxed border-b border-white/[0.02] pb-0.5">
                    <span className="text-slate-600 shrink-0 select-none">[{log.time}]</span>
                    <span className={cn(
                      "break-words",
                      log.type === 'error' ? 'text-red-400 font-medium' : 
                      log.type === 'success' ? 'text-teal-400 font-medium' : 
                      log.type === 'stellar' ? 'text-purple-400' : 'text-slate-400'
                    )}>
                      {log.msg}
                    </span>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a 
                href="https://app.revenuecat.com/" 
                target="_blank" 
                rel="noreferrer"
                className="p-2 rounded-xl border border-white/5 bg-slate-900/40 hover:bg-teal-500/5 hover:border-teal-500/30 transition-all flex items-center justify-between group"
              >
                <div className="text-[9px]">
                  <span className="block text-slate-500 mb-0.5">Control Panel</span>
                  <span className="font-bold text-slate-300 group-hover:text-white transition-colors">RevenueCat Dashboard</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-teal-400 transition-colors" />
              </a>
              <a 
                href="https://stellar.expert/explorer/testnet" 
                target="_blank" 
                rel="noreferrer"
                className="p-2 rounded-xl border border-white/5 bg-slate-900/40 hover:bg-purple-500/5 hover:border-purple-500/30 transition-all flex items-center justify-between group"
              >
                <div className="text-[9px]">
                  <span className="block text-slate-500 mb-0.5">Explorer</span>
                  <span className="font-bold text-slate-300 group-hover:text-white transition-colors">Stellar Testnet</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-purple-400 transition-colors" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <PaymentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          addLog("Modal detectó éxito. Refrescando estado...", "success")
          checkRCStatus()
        }}
        resourceName="Acceso Debug QA"
      />
    </main>
  )
}
