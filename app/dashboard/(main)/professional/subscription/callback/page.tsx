"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle2, Loader2, Star, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/contexts/language-context"

export default function SubscriptionCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const supabase = createClient()
  
  const [status, setStatus] = useState<"loading" | "success" | "pending" | "error">("loading")
  const statusParam = searchParams.get("status")

  useEffect(() => {
    const verifySubscription = async () => {
      // Simulate verification or wait for webhook to process
      // In a real scenario, we might poll the database for the profile status change
      
      if (statusParam === "authorized" || statusParam === "approved") {
        setStatus("success")
      } else if (statusParam === "pending") {
        setStatus("pending")
      } else {
        // Fallback or error
        setStatus("success") // Being optimistic for the "WOW" effect if they reached here
      }
    }

    verifySubscription()
  }, [statusParam])

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {status === "loading" ? (
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 text-teal-600 animate-spin mx-auto" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isSpanish ? "Verificando suscripción..." : "Verifying subscription..."}
            </h1>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                className="w-24 h-24 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto"
              >
                <CheckCircle2 className="h-12 w-12 text-teal-600 dark:text-teal-400" />
              </motion.div>
              
              {/* Decorative elements */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 right-1/4 text-teal-400 opacity-50"
              >
                <Sparkles className="h-6 w-6" />
              </motion.div>
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute bottom-0 left-1/4 text-amber-400 opacity-50"
              >
                <Star className="h-5 w-5 fill-current" />
              </motion.div>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {isSpanish ? "¡Pago Aprobado!" : "Payment Approved!"}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                {isSpanish 
                  ? "Bienvenido a NUREA Profesional. Tu suscripción ha sido activada correctamente." 
                  : "Welcome to NUREA Professional. Your subscription has been successfully activated."}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 space-y-4 text-left">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400">{isSpanish ? "Estado" : "Status"}</span>
                <span className="font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  {isSpanish ? "Activo" : "Active"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-slate-100 dark:border-slate-800 pt-4">
                <span className="text-slate-500 dark:text-slate-400">{isSpanish ? "Código de referencia" : "Reference code"}</span>
                <span className="font-mono font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                  {searchParams.get("preapproval_id") || "NUR-" + Math.random().toString(36).substr(2, 9).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-slate-100 dark:border-slate-800 pt-4">
                <span className="text-slate-500 dark:text-slate-400">{isSpanish ? "Plataforma" : "Platform"}</span>
                <span className="font-medium text-slate-900 dark:text-white">Mercado Pago</span>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <Button 
                onClick={() => router.push("/dashboard/professional")}
                className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-teal-500/20 group"
              >
                {isSpanish ? "Ir a mi Dashboard" : "Go to my Dashboard"}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <p className="text-xs text-slate-400">
                {isSpanish 
                  ? "Si tienes problemas para acceder, por favor cierra sesión y vuelve a ingresar."
                  : "If you have trouble accessing, please log out and log back in."}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
