"use client"

/**
 * EJEMPLO DE USO DEL DIÁLOGO DE ÉXITO DE SUSCRIPCIÓN
 * 
 * Este archivo muestra cómo usar el componente SubscriptionSuccessDialog
 * cuando un profesional completa el pago de su suscripción.
 */

import { useState } from 'react'
import { SubscriptionSuccessDialog } from './subscription-success-dialog'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'
import { useTranslations } from '@/lib/i18n'

export function SubscriptionPaymentExample() {
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const { language } = useLanguage()
  const t = useTranslations(language)

  // Simular procesamiento de pago
  const handlePayment = async () => {
    // Aquí iría tu lógica de pago real
    // Ejemplo:
    // const response = await fetch('/api/payments/subscribe', {
    //   method: 'POST',
    //   body: JSON.stringify({ planId, paymentMethod })
    // })
    // if (response.ok) {
    //   setShowSuccessDialog(true)
    // }

    // Por ahora, simulamos éxito después de 2 segundos
    setTimeout(() => {
      setShowSuccessDialog(true)
    }, 2000)
  }

  return (
    <>
      <Button onClick={handlePayment}>
        {t.landing.pricing.getStarted}
      </Button>

      <SubscriptionSuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        planName={t.landing.pricing.standard}
        amount={language === "es" ? "$25 USD" : "$25 USD"}
        nextBillingDate={undefined} // Se calculará automáticamente (30 días)
        onContinue={() => {
          // Redirigir al dashboard o donde corresponda
          window.location.href = '/dashboard'
        }}
      />
    </>
  )
}

