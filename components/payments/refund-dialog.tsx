"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Info, DollarSign } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"

interface RefundDialogProps {
  isOpen: boolean
  onClose: () => void
  payment: {
    id: string
    amount: number
    currency: string
  }
  onSuccess?: () => void
}

export function RefundDialog({ isOpen, onClose, payment, onSuccess }: RefundDialogProps) {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const isSpanish = language === "es"
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState("")
  const [refundAmount, setRefundAmount] = useState(payment.amount.toString())

  const handleRefund = async () => {
    if (!reason.trim()) {
      alert(isSpanish 
        ? "Por favor, indica el motivo del reembolso"
        : "Please provide a reason for the refund")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/payments/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: payment.id,
          reason: reason.trim(),
          refundAmount: parseFloat(refundAmount) || payment.amount,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "No pudimos procesar el reembolso")
      }

      alert(data.message || (isSpanish 
        ? "Reembolso procesado exitosamente"
        : "Refund processed successfully"))

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error("Refund error:", error)
      alert(error instanceof Error ? error.message : "Error al procesar el reembolso")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isSpanish ? "Solicitar Reembolso" : "Request Refund"}
          </DialogTitle>
          <DialogDescription>
            {isSpanish 
              ? "Indica el motivo del reembolso. El dinero será devuelto en 3-5 días hábiles."
              : "Provide a reason for the refund. The money will be returned within 3-5 business days."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Card className="border-border/40">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {isSpanish ? "Monto del Pago" : "Payment Amount"}
                </span>
                <span className="text-lg font-bold">
                  ${payment.amount.toLocaleString()} {payment.currency.toUpperCase()}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="refundAmount">
              {isSpanish ? "Monto a Reembolsar" : "Refund Amount"} (opcional)
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="refundAmount"
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder={payment.amount.toString()}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-input bg-background"
                max={payment.amount}
                min={0}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {isSpanish 
                ? "Deja vacío para reembolso completo"
                : "Leave empty for full refund"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">
              {isSpanish ? "Motivo del Reembolso" : "Refund Reason"} *
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isSpanish 
                ? "Ej: Cita cancelada, cambio de fecha..."
                : "E.g: Appointment cancelled, date change..."}
              className="rounded-xl min-h-[100px]"
            />
          </div>

          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                    {isSpanish 
                      ? "El reembolso será procesado según nuestra política de cancelación. El dinero aparecerá en tu cuenta en 3-5 días hábiles."
                      : "The refund will be processed according to our cancellation policy. The money will appear in your account within 3-5 business days."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            {isSpanish ? "Cancelar" : "Cancel"}
          </Button>
          <Button
            onClick={handleRefund}
            disabled={loading || !reason.trim()}
            className="rounded-xl font-bold"
          >
            {loading ? (
              <>
                <AlertCircle className="mr-2 h-4 w-4 animate-spin" />
                {isSpanish ? "Procesando..." : "Processing..."}
              </>
            ) : (
              <>
                <DollarSign className="mr-2 h-4 w-4" />
                {isSpanish ? "Solicitar Reembolso" : "Request Refund"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

