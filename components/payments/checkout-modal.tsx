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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, 
  Shield, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  Clock,
  User,
  Info
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { Separator } from "@/components/ui/separator"
import { useFormValidation, validationRules } from "@/hooks/use-form-validation"
import { cn } from "@/lib/utils"

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: {
    id: string
    professional: string
    specialty: string
    date: string
    time: string
    type: "online" | "in-person"
    price: number
  }
  onSuccess?: () => void
}

export function CheckoutModal({ isOpen, onClose, appointment, onSuccess }: CheckoutModalProps) {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const isSpanish = language === "es"
  const [loading, setLoading] = useState(false)

  // Validate expiry date (MM/YY format and not expired)
  const validateExpiryFormat = (value: string): boolean => {
    if (!value) return false
    if (!/^\d{2}\/\d{2}$/.test(value)) return false
    const [month, year] = value.split("/")
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1)
    const now = new Date()
    return expiryDate >= now
  }

  // Validate card number (Luhn algorithm)
  const validateCardNumberLuhn = (value: string): boolean => {
    const cleaned = value.replace(/\s/g, "")
    if (cleaned.length < 13 || cleaned.length > 19) return false
    // Luhn algorithm
    let sum = 0
    let isEven = false
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i])
      if (isEven) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      sum += digit
      isEven = !isEven
    }
    return sum % 10 === 0
  }

  const {
    fields,
    errors,
    touched,
    isValid,
    setFieldValue,
    setFieldTouched,
    validateAll,
  } = useFormValidation({
    cardNumber: {
      value: "",
      rules: [
        validationRules.required(isSpanish ? "El número de tarjeta es requerido" : "Card number is required"),
        { 
          test: (v) => {
            const cleaned = v.replace(/\s/g, "")
            return cleaned.length >= 13 && cleaned.length <= 19
          }, 
          message: isSpanish ? "El número de tarjeta debe tener entre 13 y 19 dígitos" : "Card number must be between 13 and 19 digits" 
        },
        { 
          test: validateCardNumberLuhn, 
          message: isSpanish ? "Número de tarjeta inválido" : "Invalid card number" 
        },
      ],
    },
    cardName: {
      value: "",
      rules: [
        validationRules.required(isSpanish ? "El nombre en la tarjeta es requerido" : "Name on card is required"),
        validationRules.minLength(2, isSpanish ? "El nombre debe tener al menos 2 caracteres" : "Name must be at least 2 characters"),
      ],
    },
    expiry: {
      value: "",
      rules: [
        validationRules.required(isSpanish ? "La fecha de vencimiento es requerida" : "Expiry date is required"),
        { 
          test: (v) => /^\d{2}\/\d{2}$/.test(v), 
          message: isSpanish ? "Formato inválido. Use MM/YY" : "Invalid format. Use MM/YY" 
        },
        { 
          test: validateExpiryFormat, 
          message: isSpanish ? "La tarjeta está vencida" : "Card is expired" 
        },
      ],
    },
    cvv: {
      value: "",
      rules: [
        validationRules.required(isSpanish ? "El CVV es requerido" : "CVV is required"),
        { test: (v) => /^\d{3,4}$/.test(v), message: isSpanish ? "El CVV debe tener 3 o 4 dígitos" : "CVV must be 3 or 4 digits" },
      ],
    },
  })

  const handlePayment = async () => {
    // Mark all fields as touched
    setFieldTouched("cardNumber")
    setFieldTouched("cardName")
    setFieldTouched("expiry")
    setFieldTouched("cvv")

    // Validate all fields
    const validationErrors = validateAll()
    if (Object.keys(validationErrors).length > 0) {
      return // Don't submit if there are validation errors
    }

    setLoading(true)
    try {
      // Crear payment intent
      const intentResponse = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: appointment.id,
          amount: appointment.price,
          currency: "clp",
          cardNumber: fields.cardNumber.value.replace(/\s/g, ""),
          cardName: fields.cardName.value,
          expiry: fields.expiry.value,
          cvv: fields.cvv.value,
        }),
      })

      const intentData = await intentResponse.json()

      if (!intentResponse.ok) {
        throw new Error(intentData.message || "No pudimos procesar el pago")
      }

      // TODO: Integrar con Stripe Elements o MercadoPago
      // Por ahora, simulamos el pago exitoso
      
      // Confirmar pago
      const confirmResponse = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: intentData.paymentId,
          paymentIntentId: "pi_mock_success",
        }),
      })

      const confirmData = await confirmResponse.json()

      if (!confirmResponse.ok) {
        throw new Error(confirmData.message || "No pudimos confirmar el pago")
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error("Payment error:", error)
      alert(error instanceof Error ? error.message : "Error al procesar el pago")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isSpanish ? "Completar Pago" : "Complete Payment"}
          </DialogTitle>
          <DialogDescription>
            {isSpanish 
              ? "Revisa los detalles y completa tu pago de forma segura"
              : "Review the details and complete your payment securely"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Appointment Summary */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-lg">
                {isSpanish ? "Resumen de la Cita" : "Appointment Summary"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">{appointment.professional}</p>
                    <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{appointment.date}</span>
                <span className="mx-2">•</span>
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{appointment.time}</span>
              </div>
              <div className="pt-2">
                <Badge variant="outline">
                  {appointment.type === "online" 
                    ? (isSpanish ? "Consulta Online" : "Online Consultation")
                    : (isSpanish ? "Consulta Presencial" : "In-person Consultation")}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {isSpanish ? "Detalles de Pago" : "Payment Details"}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                {isSpanish 
                  ? "Tu pago está protegido con encriptación SSL de 256 bits"
                  : "Your payment is secured with 256-bit SSL encryption"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">
                  {isSpanish ? "Número de Tarjeta" : "Card Number"}
                </Label>
                <Input
                  id="cardNumber"
                  value={fields.cardNumber.value}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s/g, "").slice(0, 19)
                    // Add spaces every 4 digits
                    const formatted = value.replace(/(.{4})/g, "$1 ").trim()
                    setFieldValue("cardNumber", formatted)
                  }}
                  onBlur={() => setFieldTouched("cardNumber")}
                  placeholder="1234 5678 9012 3456"
                  className={cn(
                    "rounded-xl",
                    touched.cardNumber && errors.cardNumber && "border-red-500 focus-visible:ring-red-500"
                  )}
                  maxLength={23}
                  aria-describedby={touched.cardNumber && errors.cardNumber ? "cardNumber-error" : undefined}
                />
                {touched.cardNumber && errors.cardNumber && (
                  <p id="cardNumber-error" className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.cardNumber}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardName">
                  {isSpanish ? "Nombre en la Tarjeta" : "Name on Card"}
                </Label>
                <Input
                  id="cardName"
                  value={fields.cardName.value}
                  onChange={(e) => setFieldValue("cardName", e.target.value)}
                  onBlur={() => setFieldTouched("cardName")}
                  placeholder={isSpanish ? "Juan Pérez" : "John Doe"}
                  className={cn(
                    "rounded-xl",
                    touched.cardName && errors.cardName && "border-red-500 focus-visible:ring-red-500"
                  )}
                  aria-describedby={touched.cardName && errors.cardName ? "cardName-error" : undefined}
                />
                {touched.cardName && errors.cardName && (
                  <p id="cardName-error" className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.cardName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">
                    {isSpanish ? "Vencimiento" : "Expiry"}
                  </Label>
                  <Input
                    id="expiry"
                    value={fields.expiry.value}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 4)
                      const formatted = value.length === 4 ? `${value.slice(0, 2)}/${value.slice(2)}` : value
                      setFieldValue("expiry", formatted)
                    }}
                    onBlur={() => setFieldTouched("expiry")}
                    placeholder="MM/YY"
                    className={cn(
                      "rounded-xl",
                      touched.expiry && errors.expiry && "border-red-500 focus-visible:ring-red-500"
                    )}
                    maxLength={5}
                    aria-describedby={touched.expiry && errors.expiry ? "expiry-error" : undefined}
                  />
                  {touched.expiry && errors.expiry && (
                    <p id="expiry-error" className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.expiry}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">
                    CVV
                  </Label>
                  <Input
                    id="cvv"
                    type="password"
                    value={fields.cvv.value}
                    onChange={(e) => setFieldValue("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))}
                    onBlur={() => setFieldTouched("cvv")}
                    placeholder="123"
                    className={cn(
                      "rounded-xl",
                      touched.cvv && errors.cvv && "border-red-500 focus-visible:ring-red-500"
                    )}
                    maxLength={4}
                    aria-describedby={touched.cvv && errors.cvv ? "cvv-error" : undefined}
                  />
                  {touched.cvv && errors.cvv && (
                    <p id="cvv-error" className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.cvv}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total */}
          <div className="flex items-center justify-between p-4 bg-accent/20 rounded-xl border border-border/40">
            <span className="font-semibold text-lg">
              {isSpanish ? "Total a Pagar" : "Total to Pay"}
            </span>
            <span className="text-2xl font-bold text-primary">
              ${appointment.price.toLocaleString()} {isSpanish ? "CLP" : "CLP"}
            </span>
          </div>

          {/* Legal Notice */}
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="font-semibold text-sm text-blue-900 dark:text-blue-200">
                    {isSpanish ? "Aviso Importante" : "Important Notice"}
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                    {isSpanish 
                      ? "NUREA actúa como intermediario tecnológico. No prestamos servicios médicos. El pago es por servicios del profesional de salud indicado. NUREA facilita la conexión entre pacientes y profesionales, pero no es responsable de los servicios médicos prestados."
                      : "NUREA acts as a technology intermediary. We do not provide medical services. The payment is for services from the indicated healthcare professional. NUREA facilitates the connection between patients and professionals, but is not responsible for the medical services provided."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms */}
          <p className="text-xs text-center text-muted-foreground">
            {isSpanish 
              ? "Al completar el pago, aceptas nuestros Términos de Servicio y Política de Cancelación"
              : "By completing payment, you agree to our Terms of Service and Cancellation Policy"}
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto rounded-xl">
            {isSpanish ? "Cancelar" : "Cancel"}
          </Button>
          <Button
            onClick={handlePayment}
            disabled={loading || !isValid}
            className="w-full sm:w-auto rounded-xl font-bold shadow-lg shadow-primary/20"
          >
            {loading ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                {isSpanish ? "Procesando..." : "Processing..."}
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                {isSpanish 
                  ? `Pagar $${appointment.price.toLocaleString()} CLP`
                  : `Pay $${appointment.price.toLocaleString()} CLP`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

