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
import { sanitizeMessage } from "@/lib/utils/sanitize"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface QuickActionsProps {
  appointmentId: string
  appointmentDate: string
  appointmentTime: string
  status?: string
  onReschedule?: () => void
  onCancel?: () => void
}

export function QuickActions({ 
  appointmentId, 
  appointmentDate, 
  appointmentTime,
  status = "pending",
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
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Determinar si las acciones están deshabilitadas
  const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`)
  const isPast = appointmentDateTime < new Date()
  const isCompleted = status === "completed"
  const isCancelled = status === "cancelled"
  const canReschedule = !isPast && !isCompleted && !isCancelled && (status === "confirmed" || status === "pending")
  const canCancel = !isPast && !isCompleted && !isCancelled && (status === "confirmed" || status === "pending")
  
  const getRescheduleDisabledReason = () => {
    if (isPast) return isSpanish ? "Esta cita ya pasó" : "This appointment has already passed"
    if (isCompleted) return isSpanish ? "Esta cita ya fue completada" : "This appointment is already completed"
    if (isCancelled) return isSpanish ? "Esta cita ya fue cancelada" : "This appointment is already cancelled"
    if (status !== "confirmed" && status !== "pending") return isSpanish ? "Esta cita no está confirmada" : "This appointment is not confirmed"
    return null
  }
  
  const getCancelDisabledReason = () => {
    if (isPast) return isSpanish ? "Esta cita ya pasó" : "This appointment has already passed"
    if (isCompleted) return isSpanish ? "Esta cita ya fue completada" : "This appointment is already completed"
    if (isCancelled) return isSpanish ? "Esta cita ya fue cancelada" : "This appointment is already cancelled"
    if (status !== "confirmed" && status !== "pending") return isSpanish ? "Esta cita no está confirmada" : "This appointment is not confirmed"
    return null
  }

  const handleReschedule = async () => {
    if (!newDate || !newTime) {
      setError(isSpanish ? "Por favor, selecciona una fecha y hora" : "Please select a date and time")
      return
    }

    // Validar que la fecha no sea en el pasado
    const selectedDateTime = new Date(`${newDate}T${newTime}`)
    if (selectedDateTime < new Date()) {
      setError(isSpanish ? "La fecha y hora deben ser en el futuro" : "Date and time must be in the future")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
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
        throw new Error(data.message || (isSpanish ? "No pudimos reagendar la cita" : "Could not reschedule appointment"))
      }

      setSuccess(isSpanish 
        ? "Cita reagendada exitosamente. El profesional confirmará la nueva fecha."
        : "Appointment rescheduled successfully. The professional will confirm the new date.")
      setNewDate("")
      setNewTime("")
      setTimeout(() => {
        setShowReschedule(false)
        setSuccess(null)
        onReschedule?.()
      }, 2000)
    } catch (error) {
      console.error("Error rescheduling:", error)
      setError(error instanceof Error ? error.message : (isSpanish ? "Error al reagendar la cita" : "Error rescheduling appointment"))
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      // Sanitizar motivo de cancelación
      const sanitizedReason = cancelReason ? sanitizeMessage(cancelReason) : null

      const response = await fetch("/api/appointments/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          reason: sanitizedReason,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || (isSpanish ? "No pudimos cancelar la cita" : "Could not cancel appointment"))
      }

      const refundMessage = data.refundAmount > 0
        ? (isSpanish 
          ? `Cita cancelada exitosamente. Reembolso de $${data.refundAmount.toLocaleString()} CLP será procesado en 3-5 días hábiles.`
          : `Appointment cancelled successfully. Refund of $${data.refundAmount.toLocaleString()} CLP will be processed in 3-5 business days.`)
        : (isSpanish
          ? "Cita cancelada exitosamente."
          : "Appointment cancelled successfully.")

      setSuccess(refundMessage || data.message)
      setCancelReason("")
      setTimeout(() => {
        setShowCancel(false)
        setSuccess(null)
        onCancel?.()
      }, 3000)
    } catch (error) {
      console.error("Error cancelling:", error)
      setError(error instanceof Error ? error.message : (isSpanish ? "Error al cancelar la cita" : "Error cancelling appointment"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <TooltipProvider>
      <div className="flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => setShowReschedule(true)}
                disabled={!canReschedule || loading}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {isSpanish ? "Reagendar" : "Reschedule"}
              </Button>
            </div>
          </TooltipTrigger>
          {getRescheduleDisabledReason() && (
            <TooltipContent>
              <p>{getRescheduleDisabledReason()}</p>
            </TooltipContent>
          )}
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-destructive hover:text-destructive"
                onClick={() => setShowCancel(true)}
                disabled={!canCancel || loading}
              >
                <X className="h-4 w-4 mr-2" />
                {isSpanish ? "Cancelar" : "Cancel"}
              </Button>
            </div>
          </TooltipTrigger>
          {getCancelDisabledReason() && (
            <TooltipContent>
              <p>{getCancelDisabledReason()}</p>
            </TooltipContent>
          )}
        </Tooltip>
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
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-xl p-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-sm">{success}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label>
                {isSpanish ? "Nueva Fecha" : "New Date"}
              </Label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => {
                  setNewDate(e.target.value)
                  setError(null)
                }}
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
                onChange={(e) => {
                  setNewTime(e.target.value)
                  setError(null)
                }}
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
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-xl p-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-sm">{success}</p>
              </div>
            )}
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
                onChange={(e) => {
                  setCancelReason(e.target.value)
                  setError(null)
                }}
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

