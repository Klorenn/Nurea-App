"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, GraduationCap } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { SubscriptionSuccessDialog } from "@/components/subscription-success-dialog"

export function Pricing() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string } | null>(null)

  const plans = [
    {
      name: t.landing.pricing.standard,
      price: language === "es" ? "$25" : "$25",
      period: t.landing.pricing.perMonth,
      description: t.landing.pricing.standardDesc,
      features: [
        t.landing.pricing.unlimitedBookings,
        t.landing.pricing.profileVisibility,
        t.landing.pricing.videoConsultations,
        t.landing.pricing.messagingSystem,
        t.landing.pricing.calendarManagement,
        t.landing.pricing.reviewSystem,
        t.landing.pricing.paymentProcessing,
        t.landing.pricing.analyticsDashboard,
      ],
      popular: true,
    },
    {
      name: t.landing.pricing.recentGraduate,
      price: language === "es" ? "$15" : "$15",
      period: t.landing.pricing.perMonth,
      description: t.landing.pricing.recentGraduateDesc,
      badge: t.landing.pricing.limitedTime,
      features: [
        t.landing.pricing.everythingInStandard,
        t.landing.pricing.firstMonthsDiscount,
        t.landing.pricing.prioritySupport,
        t.landing.pricing.marketingAssistance,
        t.landing.pricing.mentorshipAccess,
      ],
    },
  ]

  return (
    <section id="pricing" className="py-16 md:py-20 px-4 bg-transparent relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-12 md:mb-16">
          <h2 className="font-sans text-4xl md:text-5xl font-bold tracking-tight">{t.landing.pricing.title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t.landing.pricing.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`border-border/40 relative rounded-[2.5rem] overflow-hidden ${
                plan.popular ? "border-primary shadow-2xl shadow-primary/10" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-primary text-white border-none px-3 py-0.5 rounded-full text-[10px] font-bold shadow-md shadow-primary/30 uppercase tracking-wide">
                    {t.landing.pricing.mostPopular}
                  </Badge>
                </div>
              )}
              {plan.badge && (
                <div className="absolute -top-2 right-4 z-10">
                  <Badge className="bg-teal-600 dark:bg-teal-500 text-white border-none px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-md shadow-teal-500/30 uppercase tracking-wide">
                    {plan.badge}
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-6 pt-10 bg-primary/5">
                <CardTitle className="font-sans text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                  {plan.name === t.landing.pricing.recentGraduate && <GraduationCap className="h-5 w-5 text-primary" />}
                  {plan.name}
                </CardTitle>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-primary">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground text-lg ml-1">{plan.period}</span>}
                </div>
                <CardDescription className="text-base">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <ul className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                      <span className="text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full h-12 rounded-xl font-bold text-lg"
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                  onClick={() => {
                    setSelectedPlan({ name: plan.name, price: plan.price })
                    // Aquí iría la lógica real de pago
                    // Por ahora, mostramos el diálogo de éxito después de simular el pago
                    setTimeout(() => {
                      setShowSuccessDialog(true)
                    }, 1500)
                  }}
                >
                  {plan.name === t.landing.pricing.recentGraduate ? t.landing.pricing.applyForDiscount : t.landing.pricing.getStarted}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Success Dialog */}
      {selectedPlan && (
        <SubscriptionSuccessDialog
          open={showSuccessDialog}
          onOpenChange={setShowSuccessDialog}
          planName={selectedPlan.name}
          amount={`${selectedPlan.price} USD${t.landing.pricing.perMonth}`}
          onContinue={() => {
            // Redirigir al dashboard del profesional
            window.location.href = '/professional/dashboard'
          }}
        />
      )}
    </section>
  )
}
