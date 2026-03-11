"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Video, Home, ChevronRight, Clock, CreditCard, CheckCircle2, Loader2, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { NoPhysicalConsultationDisplay } from "@/components/no-physical-consultation-display"
import { createClient } from "@/lib/supabase/client"
import { depositEscrowForBooking } from "@/lib/services/sorobanEscrowService"

// Genera bloques de 09:00 a 18:00 cada 30 min; excluye unos cuantos al azar como ocupados
function buildTimeSlots(): { time: string; available: boolean }[] {
  const slots: { time: string; available: boolean }[] = []
  for (let h = 9; h <= 18; h++) {
    for (const m of [0, 30]) {
      if (h === 18 && m === 30) break
      slots.push({
        time: `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`,
        available: true,
      })
    }
  }
  const indices = [2, 5, 8, 12]
  indices.forEach((i) => {
    if (slots[i]) slots[i] = { ...slots[i], available: false }
  })
  return slots
}

const TIME_SLOTS = buildTimeSlots()

function isPastOrWeekend(date: Date): boolean {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const day = d.getDay()
  return d < today || day === 0 || day === 6
}

export function BookingModal({
  isOpen,
  onClose,
  professionalId,
  professionalName = "the specialist",
  stellarWallet = null,
  offersInPerson = true,
  isSpanish = true,
}: {
  isOpen: boolean
  onClose: () => void
  professionalId?: string
  professionalName?: string
  /** Wallet Stellar del profesional para recibir el pago del escrow. Si no tiene, no se puede reservar con pago. */
  stellarWallet?: string | null
  /** Si false, el especialista no atiende presencialmente; en Step 1 se muestra NoPhysicalConsultationDisplay y el CTA lleva a paso 2 con online. */
  offersInPerson?: boolean
  isSpanish?: boolean
}) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [type, setType] = useState<"online" | "in-person" | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [createdRef, setCreatedRef] = useState<string | null>(null)
  const [confirmedAt, setConfirmedAt] = useState<{ date: string; time: string } | null>(null)

  const canBookWithPayment = Boolean(stellarWallet)

  useEffect(() => {
    if (!isOpen) {
      setStep(1)
      setType(null)
      setSelectedDate(undefined)
      setSelectedTime(null)
      setSubmitError(null)
      setCreatedRef(null)
      setConfirmedAt(null)
      return
    }
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        onClose()
        router.push("/login?message=" + encodeURIComponent("Debes iniciar sesión para agendar."))
      }
    }
    checkUser()
  }, [isOpen, router, onClose])

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  const canConfirmStep2 = Boolean(selectedDate && selectedTime)

  const handleCompleteBooking = async () => {
    if (!professionalId || !type || !selectedDate || !selectedTime) {
      setSubmitError("Faltan datos para confirmar la cita.")
      return
    }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      onClose()
      router.push("/login?message=" + encodeURIComponent("Debes iniciar sesión para agendar."))
      return
    }
    if (!canBookWithPayment) {
      setSubmitError("Este profesional aún no acepta pagos por Nurea.")
      return
    }
    setIsLoading(true)
    setSubmitError(null)
    const appointmentDate = selectedDate.toISOString().slice(0, 10)
    const appointmentTime = selectedTime.length === 5 ? `${selectedTime}:00` : selectedTime
    const appointmentId = crypto.randomUUID()
    const consultationAmount = "45" // Monto de consulta (ej. 45 USDC; ajustar según token/decimals)

    try {
      // 1) Depósito en escrow: conectar Freighter del paciente e invocar deposit en el contrato Soroban.
      const { txHash } = await depositEscrowForBooking({
        appointmentId,
        doctorWallet: stellarWallet!,
        amount: consultationAmount,
      })

      // 2) Solo si la transacción en blockchain fue exitosa, guardar la cita en Supabase.
      // Usamos el mismo appointmentId que se usó en el contrato de escrow para poder invocar release después.
      const { data: appointment, error } = await supabase
        .from("appointments")
        .insert({
          id: appointmentId,
          patient_id: user.id,
          professional_id: professionalId,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          duration_minutes: 60,
          type,
          status: "confirmed",
          is_online: type === "online",
          payment_status: "escrow_locked",
          price: 45000,
        })
        .select("id")
        .single()

      if (error) throw error
      setCreatedRef(appointment?.id ? `#${String(appointment.id).slice(0, 8).toUpperCase()}` : "")
      setConfirmedAt({
        date: selectedDate.toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" }),
        time: selectedTime,
      })
      setStep(4)
      // Notificar por correo al paciente y al profesional (no bloqueante; si falla, la cita ya está guardada)
      fetch("/api/appointments/send-booking-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: appointment.id }),
      }).catch(() => {})
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo completar la reserva. Intenta de nuevo."
      setSubmitError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="flex flex-col h-[600px]">
          {/* Header Progress */}
          <div className="bg-primary/5 p-8 border-b border-primary/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-primary">Book Consultation</h2>
              <Badge variant="outline" className="rounded-full border-primary/20 text-primary bg-white">
                Step {step} of 4
              </Badge>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-all duration-500",
                    step >= s ? "bg-primary" : "bg-primary/10",
                  )}
                />
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {offersInPerson ? (
                  <>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">
                        {isSpanish ? "Elige tipo de consulta" : "Select Consultation Mode"}
                      </h3>
                      <p className="text-muted-foreground">
                        {isSpanish ? "¿Cómo te gustaría reunirte con el especialista?" : "How would you like to meet with the specialist?"}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      <button
                        onClick={() => {
                          setType("online")
                          nextStep()
                        }}
                        className={cn(
                          "flex flex-col items-center gap-4 p-8 rounded-[2rem] border-2 transition-all group",
                          type === "online"
                            ? "border-primary bg-primary/5"
                            : "border-border/40 hover:border-primary/40 hover:bg-accent/20",
                        )}
                      >
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <Video className="h-8 w-8" />
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-lg">{isSpanish ? "Consulta online" : "Online Session"}</p>
                          <p className="text-xs text-muted-foreground mt-1">Via NUREA Secure Video</p>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setType("in-person")
                          nextStep()
                        }}
                        className={cn(
                          "flex flex-col items-center gap-4 p-8 rounded-[2rem] border-2 transition-all group",
                          type === "in-person"
                            ? "border-secondary bg-secondary/5"
                            : "border-border/40 hover:border-secondary/40 hover:bg-accent/20",
                        )}
                      >
                        <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                          <Home className="h-8 w-8" />
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-lg">{isSpanish ? "Presencial" : "In-person Visit"}</p>
                          <p className="text-xs text-muted-foreground mt-1">{isSpanish ? "En consultorio" : "Visit at clinic location"}</p>
                        </div>
                      </button>
                    </div>
                  </>
                ) : (
                  <NoPhysicalConsultationDisplay
                    inModal
                    isSpanish={isSpanish}
                    onAgendarTeleconsulta={() => {
                      setType("online")
                      nextStep()
                    }}
                    variant="inline"
                  />
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Select Date & Time</h3>
                  <p className="text-muted-foreground">Choose your preferred availability.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-8 pt-4">
                  <div className="border border-border/40 rounded-2xl p-2 bg-white">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={isPastOrWeekend}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="flex-1 space-y-4">
                    <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" /> Available Slots
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {TIME_SLOTS.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={selectedTime === slot.time ? "default" : "outline"}
                          className={cn(
                            "rounded-xl h-11 bg-transparent",
                            selectedTime === slot.time && "bg-primary text-primary-foreground"
                          )}
                          onClick={() => slot.available && setSelectedTime(slot.time)}
                          disabled={!slot.available}
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                {!canBookWithPayment && (
                  <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                    <p className="text-sm">
                      Este profesional aún no acepta pagos por Nurea. Configura su wallet Stellar en Configuración para habilitar la reserva con depósito en garantía.
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Payment Method</h3>
                  <p className="text-muted-foreground">Secure your appointment with a deposit.</p>
                </div>
                <div className="grid gap-4 pt-4">
                  <Button
                    variant="outline"
                    className="h-20 justify-between px-6 rounded-2xl border-2 hover:border-primary transition-all bg-transparent group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-accent/30 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold">Credit / Debit Card</p>
                        <p className="text-xs text-muted-foreground">Pay securely via Webpay</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 justify-between px-6 rounded-2xl border-2 hover:border-primary transition-all bg-transparent group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-accent/30 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                        <Home className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold">Bank Transfer</p>
                        <p className="text-xs text-muted-foreground">Manual transfer confirmation</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </div>
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Consultation Fee</span>
                    <span className="font-bold">$45,000 CLP</span>
                  </div>
                </div>
                {submitError && (
                  <p className="text-sm text-destructive font-medium">{submitError}</p>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col items-center justify-center text-center space-y-6 py-12 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                  <CheckCircle2 className="h-16 w-16" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold">Appointment Confirmed!</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Your session with <strong>{professionalName}</strong> is scheduled for {confirmedAt?.date ?? ""} at {confirmedAt?.time ?? ""}.
                  </p>
                </div>
                <div className="bg-accent/20 p-6 rounded-[2rem] w-full max-w-md space-y-4 border border-border/40">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mode</span>
                    <span className="font-bold">{type === "online" ? "Online Video" : "In-person"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Reference</span>
                    <span className="font-bold">{createdRef || "—"}</span>
                  </div>
                </div>
                <div className="flex gap-4 w-full pt-4">
                  <Button variant="outline" className="flex-1 rounded-xl bg-transparent" onClick={onClose}>
                    Close
                  </Button>
                  <Button className="flex-1 rounded-xl" asChild>
                    <a href="/dashboard/appointments">Go to Dashboard</a>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          {step < 4 && (
            <div className="p-8 border-t border-border/40 flex justify-between bg-white">
              <Button variant="ghost" onClick={prevStep} disabled={step === 1 || isLoading} className="rounded-xl font-bold">
                Back
              </Button>
              <Button
                onClick={step === 3 ? handleCompleteBooking : nextStep}
                disabled={(step === 1 && !type) || (step === 2 && !canConfirmStep2) || (step === 3 && !canBookWithPayment) || isLoading}
                className="px-10 rounded-xl font-bold"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : step === 3 ? (
                  "Complete Booking"
                ) : (
                  "Next"
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
