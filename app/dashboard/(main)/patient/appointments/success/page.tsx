"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle2, Calendar, ArrowRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SmokeyBackground } from "@/components/smokey-login"

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const appointmentId = searchParams.get("appointmentId")

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <SmokeyBackground backdropBlurAmount="md" color="#14B8A6" />
      
      <div className="relative z-10 w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-none shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl overflow-hidden">
            <div className="h-2 bg-teal-500" />
            <CardContent className="pt-10 pb-8 px-6 text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-teal-100 dark:bg-teal-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-teal-600 dark:text-teal-400" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  ¡Pago procesado con éxito!
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Tu cita ha sido confirmada y el especialista ha sido notificado.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 text-left space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Detalles de la reserva
                </p>
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <Calendar className="h-5 w-5 text-teal-500" />
                  <span>Tu cita está programada correctamente.</span>
                </div>
                {appointmentId && (
                  <p className="text-xs text-slate-400 font-mono">
                    ID Transacción: {appointmentId.slice(0, 18).toUpperCase()}...
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  onClick={() => router.push("/dashboard/patient/appointments")}
                  className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
                >
                  Ver mis citas
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="w-full h-12 border-slate-200 dark:border-slate-800 font-semibold rounded-xl"
                >
                  <Home className="h-5 w-5 mr-2" />
                  Volver al inicio
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  )
}

export default function AppointmentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
