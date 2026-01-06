"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCheck, GraduationCap } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { SubscriptionSuccessDialog } from "@/components/subscription-success-dialog"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const PricingSwitch = ({
  onSwitch,
  className,
}: {
  onSwitch: (value: string) => void
  className?: string
}) => {
  const { language } = useLanguage()
  const [selected, setSelected] = useState("0")

  const handleSwitch = (value: string) => {
    setSelected(value)
    onSwitch(value)
  }

  return (
    <div className={cn("flex justify-center", className)}>
      <div className="relative z-10 mx-auto flex w-fit rounded-xl bg-muted/50 dark:bg-muted/30 border border-border p-1">
        <button
          onClick={() => handleSwitch("0")}
          className={cn(
            "relative z-10 w-fit cursor-pointer h-12 rounded-xl sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors sm:text-base text-sm",
            selected === "0"
              ? "text-white"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {selected === "0" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 h-12 w-full rounded-xl border-2 shadow-sm shadow-primary/50 border-primary bg-gradient-to-t from-primary via-primary/90 to-primary"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">
            {language === "es" ? "Facturación Mensual" : "Monthly Billing"}
          </span>
        </button>

        <button
          onClick={() => handleSwitch("1")}
          className={cn(
            "relative z-10 w-fit cursor-pointer h-12 flex-shrink-0 rounded-xl sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors sm:text-base text-sm",
            selected === "1"
              ? "text-white"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {selected === "1" && (
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 h-12 w-full rounded-xl border-2 shadow-sm shadow-primary/50 border-primary bg-gradient-to-t from-primary via-primary/90 to-primary"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2">
            {language === "es" ? "Facturación Anual" : "Yearly Billing"}
            <span className="rounded-full bg-primary/20 dark:bg-primary/30 px-2 py-0.5 text-xs font-medium text-primary dark:text-primary">
              {language === "es" ? "Ahorra $30.000" : "Save $30.000"}
            </span>
          </span>
        </button>
      </div>
    </div>
  )
}

export function Pricing() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string } | null>(null)
  const [isYearly, setIsYearly] = useState(false)

  // Precios en CLP
  const monthlyPrices = {
    standard: 25000,
    recentGraduate: 15000,
  }

  const calculateYearlyPrice = (monthlyPrice: number) => {
    return monthlyPrice * 12 - 30000
  }

  const plans = [
    {
      name: t.landing.pricing.standard,
      monthlyPrice: monthlyPrices.standard,
      yearlyPrice: calculateYearlyPrice(monthlyPrices.standard),
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
      buttonText: t.landing.pricing.getStarted,
      buttonVariant: "default" as const,
    },
    {
      name: t.landing.pricing.recentGraduate,
      monthlyPrice: monthlyPrices.recentGraduate,
      yearlyPrice: calculateYearlyPrice(monthlyPrices.recentGraduate),
      description: t.landing.pricing.recentGraduateDesc,
      badge: language === "es" ? "OFERTA" : "OFFER",
      features: [
        t.landing.pricing.everythingInStandard,
        t.landing.pricing.firstMonthsDiscount,
        t.landing.pricing.prioritySupport,
        t.landing.pricing.marketingAssistance,
        t.landing.pricing.mentorshipAccess,
      ],
      buttonText: t.landing.pricing.applyForDiscount,
      buttonVariant: "outline" as const,
    },
  ]

  const togglePricingPeriod = (value: string) => {
    setIsYearly(Number.parseInt(value) === 1)
  }

  const formatPrice = (price: number) => {
    // Formatear precio en CLP con separadores de miles
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price).replace("CLP", "").trim()
  }

  return (
    <section id="pricing" className="py-16 md:py-20 px-4 bg-transparent relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-12 md:mb-16">
          <h2 className="font-sans text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            {t.landing.pricing.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t.landing.pricing.subtitle}
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <PricingSwitch onSwitch={togglePricingPeriod} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-16">
          {plans.map((plan, index) => {
            const currentPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice
            const priceDisplay = formatPrice(currentPrice)

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={cn(
                    "relative border rounded-2xl overflow-hidden transition-all",
                    plan.popular
                      ? "ring-2 ring-primary bg-primary/5 dark:bg-primary/10 border-primary shadow-lg shadow-primary/10"
                      : "bg-card border-border/40 hover:border-primary/50"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-primary text-primary-foreground border-none px-3 py-1 rounded-full text-xs font-bold shadow-md shadow-primary/30 uppercase tracking-wide">
                        {t.landing.pricing.mostPopular}
                      </Badge>
                    </div>
                  )}
                  {plan.badge && (
                    <div className="absolute -top-2 right-4 z-10">
                      <Badge className="bg-primary text-primary-foreground border-none px-3 py-1 rounded-full text-xs font-bold shadow-md shadow-primary/30 uppercase tracking-wide">
                        {plan.badge}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-left pb-4 pt-8">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-3xl font-semibold text-foreground flex items-center gap-2">
                        {plan.name === t.landing.pricing.recentGraduate && (
                          <GraduationCap className="h-6 w-6 text-primary" />
                        )}
                        {plan.name}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                    <div className="flex items-baseline">
                      <span className="text-4xl font-semibold text-primary">
                        ${formatPrice(currentPrice)}
                      </span>
                      <span className="text-muted-foreground ml-2 text-lg">
                        /{isYearly ? (language === "es" ? "año" : "year") : (language === "es" ? "mes" : "month")}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 pb-6">
                    <Button
                      className={cn(
                        "w-full mb-6 p-4 text-lg rounded-xl font-semibold transition-all",
                        plan.popular
                          ? "bg-gradient-to-t from-primary to-primary/90 shadow-lg shadow-primary/30 border border-primary/50 text-primary-foreground hover:shadow-xl hover:shadow-primary/40"
                          : plan.buttonVariant === "outline"
                            ? "bg-gradient-to-t from-foreground to-foreground/90 dark:from-foreground dark:to-foreground/90 shadow-lg shadow-foreground/20 border border-border text-background dark:text-background hover:shadow-xl"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                      onClick={() => {
                        setSelectedPlan({ name: plan.name, price: priceDisplay })
                        setTimeout(() => {
                          setShowSuccessDialog(true)
                        }, 1500)
                      }}
                    >
                      {plan.buttonText}
                    </Button>

                    <div className="space-y-3 pt-4 border-t border-border/40">
                      <h2 className="text-xl font-semibold uppercase text-foreground mb-3">
                        {language === "es" ? "Características" : "Features"}
                      </h2>
                      <ul className="space-y-2">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start">
                            <span className="h-6 w-6 bg-primary/10 dark:bg-primary/20 border border-primary rounded-full grid place-content-center mt-0.5 mr-3 shrink-0">
                              <CheckCheck className="h-4 w-4 text-primary" />
                            </span>
                            <span className="text-sm text-muted-foreground leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Success Dialog */}
      {selectedPlan && (
        <SubscriptionSuccessDialog
          open={showSuccessDialog}
          onOpenChange={setShowSuccessDialog}
          planName={selectedPlan.name}
          amount={`${selectedPlan.price} CLP${isYearly ? (language === "es" ? "/año" : "/year") : (language === "es" ? "/mes" : "/month")}`}
          onContinue={() => {
            window.location.href = '/professional/dashboard'
          }}
        />
      )}
    </section>
  )
}
