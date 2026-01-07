"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCheck, GraduationCap } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { SubscriptionSuccessDialog } from "@/components/subscription-success-dialog"
import { motion, useInView } from "framer-motion"
import { cn } from "@/lib/utils"

// Componente simplificado para VerticalCutReveal
const VerticalCutReveal = ({ children, className }: { children: string; className?: string }) => {
  const words = children.split(" ")
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            delay: i * 0.1,
            type: "spring",
            stiffness: 250,
            damping: 40,
          }}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

// Componente simplificado para TimelineContent
const TimelineContent = ({
  as: Component = "div",
  animationNum,
  timelineRef,
  customVariants,
  children,
  className,
  ...props
}: {
  as?: any
  animationNum: number
  timelineRef: React.RefObject<HTMLDivElement>
  customVariants?: any
  children: React.ReactNode
  className?: string
  [key: string]: any
}) => {
  const isInView = useInView(timelineRef || { current: null }, { once: true, margin: "-100px" })
  const variants = customVariants || {
    visible: { y: 0, opacity: 1, filter: "blur(0px)" },
    hidden: { filter: "blur(10px)", y: -20, opacity: 0 },
  }

  return (
    <Component
      className={className}
      {...props}
    >
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={variants}
        custom={animationNum}
      >
        {children}
      </motion.div>
    </Component>
  )
}

// Componente para animar números (alternativa a NumberFlow)
const AnimatedNumber = ({ value, className }: { value: number; className?: string }) => {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    // Iniciar animación automáticamente al montar
    const duration = 1000
    const steps = 30
    const increment = value / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current = Math.min(value, increment * step)
      setDisplayValue(Math.floor(current))

      if (step >= steps) {
        clearInterval(timer)
        setDisplayValue(value)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return <span className={className}>{displayValue.toLocaleString("es-CL")}</span>
}

const PricingSwitch = ({
  onSwitch,
  className,
  savingsPercentage,
}: {
  onSwitch: (value: string) => void
  className?: string
  savingsPercentage?: number
}) => {
  const { language } = useLanguage()
  const [selected, setSelected] = useState("0")

  const handleSwitch = (value: string) => {
    setSelected(value)
    onSwitch(value)
  }

  return (
    <div className={cn("flex justify-center", className)}>
      <div className="relative z-10 mx-auto flex w-fit rounded-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 p-1 shadow-lg">
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
            {savingsPercentage && (
              <span className="rounded-full bg-primary/20 dark:bg-primary/30 px-2 py-0.5 text-xs font-medium text-primary dark:text-primary">
                {language === "es" ? `Ahorra ${savingsPercentage}%` : `Save ${savingsPercentage}%`}
              </span>
            )}
          </span>
        </button>
      </div>
    </div>
  )
}

export function Pricing() {
  const { language } = useLanguage()
  const t = useTranslations(language || "es")
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string } | null>(null)
  const [isYearly, setIsYearly] = useState(false)
  const pricingRef = useRef<HTMLDivElement>(null)

  // Precios en CLP
  const monthlyPrices = {
    professional: 25000,
    recentGraduate: 15000,
  }

  const calculateYearlyPrice = (monthlyPrice: number, discountPercent: number = 38) => {
    const yearlyWithoutDiscount = monthlyPrice * 12
    const discount = (yearlyWithoutDiscount * discountPercent) / 100
    return Math.round(yearlyWithoutDiscount - discount)
  }

  const calculateSavingsPercentage = (monthlyPrice: number, discountPercent: number = 38) => {
    return discountPercent
  }

  // Calcular porcentaje de ahorro promedio (38% para plan profesional)
  const averageSavingsPercentage = calculateSavingsPercentage(monthlyPrices.professional, 38)

  const plans = [
    {
      name: t.landing.pricing.professional,
      monthlyPrice: monthlyPrices.professional,
      yearlyPrice: calculateYearlyPrice(monthlyPrices.professional, 38),
      description: t.landing.pricing.professionalDesc,
      features: [
        t.landing.pricing.unlimitedBookings,
        t.landing.pricing.profileVisibility,
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
        t.landing.pricing.everythingInProfessional,
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

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.2,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  }

  return (
    <section
      id="pricing"
      className="px-4 pt-20 pb-16 md:py-20 min-h-screen max-w-7xl mx-auto relative"
      ref={pricingRef}
    >
      <article className="text-left mb-6 space-y-4 max-w-2xl">
        <h2 className="md:text-6xl text-4xl capitalize font-medium text-white drop-shadow-lg mb-4">
          <VerticalCutReveal>
            {t?.landing?.pricing?.title || "Planes de Suscripción para Profesionales"}
          </VerticalCutReveal>
        </h2>

        <TimelineContent
          as="div"
          animationNum={0}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="md:text-base text-sm text-white/90 drop-shadow-md w-[80%]"
        >
          {t?.landing?.pricing?.subtitle || "Precios asequibles diseñados para profesionales de la salud en Chile y más allá"}
        </TimelineContent>

        <TimelineContent
          as="div"
          animationNum={1}
          timelineRef={pricingRef}
          customVariants={revealVariants}
        >
          <PricingSwitch onSwitch={togglePricingPeriod} savingsPercentage={averageSavingsPercentage} className="w-fit" />
        </TimelineContent>
      </article>

      <div className="grid md:grid-cols-2 gap-4 py-6">
        {plans.map((plan, index) => {
          const currentPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice

          return (
            <TimelineContent
              key={plan.name}
              as="div"
              animationNum={2 + index}
              timelineRef={pricingRef}
              customVariants={revealVariants}
              className="h-full"
            >
              <Card
                className={cn(
                  "relative border rounded-2xl overflow-hidden transition-all h-full flex flex-col backdrop-blur-xl",
                  plan.popular
                    ? "ring-2 ring-primary/50 bg-white/80 dark:bg-gray-900/80 border-primary/30 shadow-2xl shadow-primary/20"
                    : "bg-white/70 dark:bg-gray-900/70 border-white/20 dark:border-gray-700/30 shadow-xl"
                )}
              >
                <CardHeader className="text-left pb-4 pt-8">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="xl:text-3xl md:text-2xl text-3xl font-semibold text-foreground flex items-center gap-2">
                      {plan.name === t.landing.pricing.recentGraduate && (
                        <GraduationCap className="h-6 w-6 text-primary" />
                      )}
                      {plan.name}
                    </h3>
                    {plan.popular && (
                      <Badge className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                        {t.landing.pricing.mostPopular}
                      </Badge>
                    )}
                    {plan.badge && (
                      <Badge className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                        {plan.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="xl:text-sm md:text-xs text-sm text-muted-foreground mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-semibold text-foreground">
                      $
                      <AnimatedNumber
                        value={currentPrice}
                        className="text-4xl font-semibold"
                      />
                    </span>
                    <span className="text-muted-foreground ml-1">
                      /{isYearly ? (language === "es" ? "año" : "year") : (language === "es" ? "mes" : "month")}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 flex-1 flex flex-col">
                  <Button
                    className={cn(
                      "w-full mb-6 p-4 text-xl rounded-xl font-semibold transition-all",
                      plan.popular
                        ? "bg-gradient-to-t from-primary to-primary/90 shadow-lg shadow-primary/30 border border-primary/50 text-primary-foreground hover:shadow-xl hover:shadow-primary/40"
                        : plan.buttonVariant === "outline"
                          ? "bg-gradient-to-t from-foreground to-foreground/90 dark:from-foreground dark:to-foreground/90 shadow-lg shadow-foreground/20 border border-border text-background dark:text-background hover:shadow-xl"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                    onClick={() => {
                      setSelectedPlan({ name: plan.name, price: `$${currentPrice.toLocaleString("es-CL")}` })
                      setTimeout(() => {
                        setShowSuccessDialog(true)
                      }, 1500)
                    }}
                  >
                    {plan.buttonText}
                  </Button>

                  <div className="space-y-3 pt-4 border-t border-border/40 flex-1">
                    <h2 className="text-xl font-semibold uppercase text-foreground mb-3">
                      {language === "es" ? "Características" : "Features"}
                    </h2>
                    <ul className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
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
            </TimelineContent>
          )
        })}
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
