"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, 
  Coins, 
  Loader2, 
  CheckCircle2, 
  Zap, 
  ShieldCheck,
  ArrowRight,
  Bird 
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { connectWallet } from "@/lib/services/stellarService"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  resourceName?: string
  amountUSDC?: string
}

export function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  resourceName = "Recurso Premium",
  amountUSDC = "2.0"
}: PaymentModalProps) {
  const [step, setStep] = useState<"choice" | "processing">("choice")
  const [paymentMethod, setPaymentMethod] = useState<"fiat" | "crypto" | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reiniciar estado al cerrar/abrir
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("choice")
        setPaymentMethod(null)
        setIsProcessing(false)
        setError(null)
      }, 300)
    }
  }, [isOpen])

  const handleStripePayment = async () => {
    setPaymentMethod("fiat")
    setStep("processing")
    setIsProcessing(true)
    
    try {
      // Simulación de flujo de RevenueCat/Stripe
      // En un entorno real llamaríamos a Purchases.purchasePackage() o Stripe Checkout
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success("Suscripción activada", {
        description: "Ahora tienes acceso total a Nurea Pro."
      })
      onSuccess?.()
      onClose()
    } catch (err: any) {
      setError(err.message || "Error al procesar pago con tarjeta")
      setStep("choice")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleStellarPayment = async () => {
    setPaymentMethod("crypto")
    setStep("processing")
    setIsProcessing(true)
    setError(null)

    try {
      // 1. Conectar Billetera
      const userAddress = await connectWallet()
      
      // 2. Firmar y enviar transacción (x402 protocol)
      // Nota: En una implementación real usaríamos signTransaction de Freighter
      // Aquí simulamos el envío del Hash al backend de liquidación
      const mockTxHash = "T" + Math.random().toString(36).substring(2, 15).toUpperCase();
      
      const response = await fetch("/api/x402/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionHash: mockTxHash })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Fallo en la liquidación Stellar");
      }

      toast.success("¡Pago x402 Exitoso!", {
        description: "Acceso Premium concedido por 24 horas."
      })
      
      onSuccess?.()
      onClose()
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Error en la red Stellar")
      setStep("choice")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px] overflow-hidden border-none bg-slate-950 text-white p-0">
        {/* Decoración de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-purple-500/10 pointer-events-none" />
        
        <div className="relative p-6">
          <AnimatePresence mode="wait">
            {step === "choice" ? (
              <motion.div
                key="choice"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-teal-400 border-teal-400/30 bg-teal-400/5">
                      x402 Protocol
                    </Badge>
                  </div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    Desbloquear {resourceName}
                  </DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Elige cómo quieres acceder a las funciones avanzadas de Nurea.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                  {/* Opción Stripe */}
                  <button
                    onClick={handleStripePayment}
                    className="group relative flex flex-col items-start p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-left overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <CreditCard className="w-12 h-12" />
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="w-5 h-5 text-teal-400" />
                      <span className="font-semibold text-white">Suscripción Nurea Pro</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">Acceso ilimitado por mes/año. Incluye todos los servicios.</p>
                    <div className="flex items-center text-xs font-medium text-teal-400 group-hover:gap-2 transition-all">
                      Gestionado por Stripe <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>

                  {/* Opción Stellar x402 */}
                  <button
                    onClick={handleStellarPayment}
                    className="group relative flex flex-col items-start p-4 rounded-2xl border border-teal-500/30 bg-teal-500/5 hover:bg-teal-500/10 transition-all text-left overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Coins className="w-12 h-12" />
                    </div>
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-teal-400" />
                        <span className="font-semibold text-white">Micropago Stellar</span>
                      </div>
                      <Badge className="bg-teal-500 text-black font-bold text-[10px] px-1.5 py-0 h-4 uppercase">
                        {amountUSDC} USDC
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">Pago único para este recurso. Sin compromisos mensuales.</p>
                    <div className="flex items-center text-xs font-medium text-teal-400 group-hover:gap-2 transition-all">
                      Pagar con Freighter <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-4 py-2 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <ShieldCheck className="w-3 h-3" /> Procesamiento Seguro
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <Zap className="w-3 h-3" /> Activación Instantánea
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-400 text-center animate-pulse">{error}</p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="relative">
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity }
                    }}
                    className="w-24 h-24 rounded-full border-2 border-dashed border-teal-500/30"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Bird className="w-10 h-10 text-teal-400" /> {/* Simulación del Buhito Nura */}
                    </motion.div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-medium text-white">
                    {paymentMethod === "crypto" ? "Esperando red Stellar..." : "Conectando con Stripe..."}
                  </h3>
                  <p className="text-sm text-slate-500 max-w-[250px]">
                    No cierres esta ventana mientras procesamos tu acceso premium.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-teal-500 text-xs font-mono">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  STREAMS_SYNCING
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
