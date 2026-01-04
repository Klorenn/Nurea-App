"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar, X, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { Input } from "@/components/ui/input"

interface QuickActionsProps {
  appointmentId: string
  appointmentDate: string
  appointmentTime: string
  onReschedule?: () => void
  onCancel?: () => void
}

export function QuickActions({ 
  appointmentId, 
  appointmentDate, 
  appointmentTime,
  onReschedule,
  onCancel 
}: QuickActionsProps) {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const [showReschedule, setShowReschedule] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newDate, setNewDate] = useState("")
  const [newTime, setNewTime] = useState("")
  const [cancelReason, setCancelReason] = useState("")

  const handleReschedule = async () => {
    if (!newDate || !newTime) return

    setLoading(true)
    try {
      const response = await fetch("/api/appointments/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          newDate,
          newTime,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "No pudimos reagendar la cita")
      }

      setShowReschedule(false)
      onReschedule?.()
      // Mostrar mensaje de éxito
    } catch (error) {
      console.error("Error rescheduling:", error)
      // Mostrar mensaje de error
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/appointments/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          reason: cancelReason,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "No pudimos cancelar la cita")
      }

      setShowCancel(false)
      onCancel?.()
      // Mostrar mensaje de éxito con información de reembolso si aplica
    } catch (error) {
      console.error("Error cancelling:", error)
      // Mostrar mensaje de error
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={() => setShowReschedule(true)}
        >
          <Calendar className="h-4 w-4 mr-2" />
          {isSpanish ? "Reagendar" : "Reschedule"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl text-destructive hover:text-destructive"
          onClick={() => setShowCancel(true)}
        >
          <X className="h-4 w-4 mr-2" />
          {isSpanish ? "Cancelar" : "Cancel"}
        </Button>
      </div>

      {/* Reschedule Dialog */}
      <Dialog open={showReschedule} onOpenChange={setShowReschedule}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isSpanish ? "Reagendar Cita" : "Reschedule Appointment"}
            </DialogTitle>
            <DialogDescription>
              {isSpanish 
                ? "Selecciona una nueva fecha y hora para tu consulta."
                : "Select a new date and time for your consultation."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                {isSpanish ? "Nueva Fecha" : "New Date"}
              </Label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>
                {isSpanish ? "Nueva Hora" : "New Time"}
              </Label>
              <Input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                {isSpanish 
                  ? "El profesional confirmará la nueva fecha. Te notificaremos cuando esté confirmada."
                  : "The professional will confirm the new date. We'll notify you when it's confirmed."}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReschedule(false)}>
              {isSpanish ? "Cancelar" : "Cancel"}
            </Button>
            <Button onClick={handleReschedule} disabled={loading || !newDate || !newTime}>
              {loading 
                ? (isSpanish ? "Reagendando..." : "Rescheduling...")
                : (isSpanish ? "Confirmar Reagendamiento" : "Confirm Reschedule")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancel} onOpenChange={setShowCancel}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              {isSpanish ? "Cancelar Cita" : "Cancel Appointment"}
            </DialogTitle>
            <DialogDescription>
              {isSpanish 
                ? "¿Estás seguro de que quieres cancelar esta cita?"
                : "Are you sure you want to cancel this appointment?"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Política de cancelación */}
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-orange-900 dark:text-orange-200 mb-1">
                    {isSpanish ? "Política de Cancelación" : "Cancellation Policy"}
                  </p>
                  <ul className="text-xs text-orange-800 dark:text-orange-300 space-y-1 list-disc list-inside">
                    <li>
                      {isSpanish 
                        ? "Más de 24 horas antes: Reembolso completo"
                        : "More than 24 hours before: Full refund"}
                    </li>
                    <li>
                      {isSpanish 
                        ? "12-24 horas antes: Reembolso del 50%"
                        : "12-24 hours before: 50% refund"}
                    </li>
                    <li>
                      {isSpanish 
                        ? "Menos de 12 horas: Sin reembolso"
                        : "Less than 12 hours: No refund"}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                {isSpanish ? "Motivo (opcional)" : "Reason (optional)"}
              </Label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={isSpanish ? "¿Por qué cancelas esta cita?" : "Why are you cancelling this appointment?"}
                className="rounded-xl min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancel(false)}>
              {isSpanish ? "Mantener Cita" : "Keep Appointment"}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancel} 
              disabled={loading}
            >
              {loading 
                ? (isSpanish ? "Cancelando..." : "Cancelling...")
                : (isSpanish ? "Confirmar Cancelación" : "Confirm Cancellation")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

