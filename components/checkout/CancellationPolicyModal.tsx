"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ShieldCheck, Clock, AlertCircle, CheckCircle2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface CancellationPolicyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CancellationPolicyModal({
  open,
  onOpenChange,
}: CancellationPolicyModalProps) {
  const { language } = useLanguage()
  const isSpanish = language === "es"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-slate-900 border-slate-800 text-slate-100">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-teal-500" />
            </div>
            <DialogTitle className="text-xl font-semibold text-white">
              {isSpanish ? "Política de Cancelación" : "Cancellation Policy"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-400">
            {isSpanish
              ? "Información importante sobre cancelaciones y reembolsos"
              : "Important information about cancellations and refunds"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Main Policy */}
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-teal-500" />
              {isSpanish ? "Regla de las 48 Horas" : "48-Hour Rule"}
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {isSpanish
                ? "Para proteger el tiempo valioso de nuestros especialistas, las cancelaciones o reagendamientos deben realizarse con al menos 48 horas de anticipación a la cita programada para ser elegibles para un reembolso completo."
                : "To protect the valuable time of our specialists, cancellations or rescheduling must be made at least 48 hours before the scheduled appointment to be eligible for a full refund."}
            </p>
          </div>

          {/* What qualifies for refund */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              {isSpanish ? "Con derecho a reembolso" : "Eligible for Refund"}
            </h4>
            <ul className="space-y-2 text-sm text-slate-300 ml-6">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                {isSpanish
                  ? "Cancelaciones realizadas 48+ horas antes de la cita"
                  : "Cancellations made 48+ hours before the appointment"}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                {isSpanish
                  ? "Reagendamientos solicitados con 48+ horas de anticipación"
                  : "Rescheduling requests made 48+ hours in advance"}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                {isSpanish
                  ? "Cancelaciones por parte del profesional"
                  : "Cancellations by the professional"}
              </li>
            </ul>
          </div>

          {/* What doesn't qualify */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              {isSpanish ? "Sin derecho a reembolso" : "Not Eligible for Refund"}
            </h4>
            <ul className="space-y-2 text-sm text-slate-300 ml-6">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                {isSpanish
                  ? "Inasistencia a la cita sin previo aviso"
                  : "No-show without prior notice"}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                {isSpanish
                  ? "Cancelaciones con menos de 48 horas de anticipación"
                  : "Cancellations made less than 48 hours in advance"}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                {isSpanish
                  ? "Llegada tardía que impida la consulta completa"
                  : "Late arrival that prevents full consultation"}
              </li>
            </ul>
          </div>

          {/* Note */}
          <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/20">
            <p className="text-xs text-teal-300 leading-relaxed">
              {isSpanish
                ? "Esta política existe para respetar el tiempo de los profesionales de salud y garantizar disponibilidad para todos los pacientes. Los reembolsos aprobados se procesan en 3-5 días hábiles."
                : "This policy exists to respect healthcare professionals' time and ensure availability for all patients. Approved refunds are processed within 3-5 business days."}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
