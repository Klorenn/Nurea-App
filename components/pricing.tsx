"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCheck, GraduationCap, Loader2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { useAuth } from "@/hooks/use-auth"
import { motion, useInView } from "framer-motion"
import { cn } from "@/lib/utils"

function ensureSpaces(str: string): string {
  if (!str || str.includes(" ")) return str
  return str.replace(/([a-záéíóúñ])([A-ZÁÉÍÓÚÑ])/g, "$1 $2").replace(/([0-9])([A-Za-zÁÉÍÓÚáéíóú])/g, "$1 $2")
}

const VerticalCutReveal = ({ children, className }: { children: string; className?: string }) => {
  const normalized = ensureSpaces(children)
  const words = normalized.split(/\s+/).filter(Boolean)
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

const TimelineContent = ({
  as: Component = "div",
  animationNum,
  timelineRef,
  customVariants,
  children,
  className,
  ...props
}: {
  as?: React.ElementType
  animationNum: number
  timelineRef: React.RefObject<HTMLDivElement | null>
  customVariants?: Record<string, unknown>
  children: React.ReactNode
  className?: string
  [key: string]: unknown
}) => {
  const isInView = useInView(timelineRef || { current: null }, { once: true, margin: "-100px" })
  const variants = customVariants || {
    visible: { y: 0, opacity: 1, filter: "blur(0px)" },
    hidden: { filter: "blur(10px)", y: -20, opacity: 0 },
  }

  return (
    <Component className={className} {...props}>
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

const AnimatedNumber = ({ value, className }: { value: number; className?: string }) => {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
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

const switchBtnClass =
  "relative z-10 w-fit cursor-pointer h-12 rounded-xl sm:px-6 px-3 sm:py-2 py-1 font-medium transition-all sm:text-base text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:opacity-90"

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
    <div className={cn("flex justify-center", className)} role="group" aria-label={language === "es" ? "Período de facturación" : "Billing period"}>
      <div className="relative z-10 mx-auto flex w-fit rounded-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border border-white/30 dark:border-gray-700/30 p-1 shadow-lg">
        <button
          type="button"
          onClick={() => handleSwitch("0")}
          className={cn(
            switchBtnClass,
            selected === "0"
              ? "text-white"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={selected === "0"}
          aria-label={language === "es" ? "Facturación mensual" : "Monthly billing"}
        >
          {selected === "0" && (
            <motion.span
              layoutId="pricing-switch"
              className="absolute top-0 left-0 h-12 w-full rounded-xl border-2 shadow-sm shadow-primary/50 border-primary bg-gradient-to-t from-primary via-primary/90 to-primary"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">
            {language === "es" ? "Facturación Mensual" : "Monthly Billing"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSwitch("1")}
          className={cn(
            switchBtnClass,
            "flex-shrink-0",
            selected === "1"
              ? "text-white"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={selected === "1"}
          aria-label={language === "es" ? "Facturación anual" : "Yearly billing"}
        >
          {selected === "1" && (
            <motion.span
              layoutId="pricing-switch"
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

const SUBSCRIPTION_PLAN_IDS: Record<string, "professional" | "graduate"> = {
  professional: "professional",
  recentGraduate: "graduate",
}

export function Pricing() {
  const { language } = useLanguage()
  const t = useTranslations(language || "es")
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const [isYearly, setIsYearly] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const pricingRef = useRef<HTMLDivElement>(null)

  const monthlyPrices = {
    professional: 25000,
    recentGraduate: 15000,
  }

  const calculateYearlyPrice = (monthlyPrice: number, discountPercent: number = 38) => {
    const yearlyWithoutDiscount = monthlyPrice * 12
    const discount = (yearlyWithoutDiscount * discountPercent) / 100
    return Math.round(yearlyWithoutDiscount - discount)
  }

  const averageSavingsPercentage = 38

  const plans = [
    {
      key: "professional",
      name: t.landing.pricing.professional,
      monthlyPrice: monthlyPrices.professional,
      yearlyPrice: calculateYearlyPrice(monthlyPrices.professional, 38),
      yearlyDiscountPercent: 38,
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
    },
    {
      key: "recentGraduate",
      name: t.landing.pricing.recentGraduate,
      monthlyPrice: monthlyPrices.recentGraduate,
      yearlyPrice: calculateYearlyPrice(monthlyPrices.recentGraduate, 38),
      yearlyDiscountPercent: 38,
      description: t.landing.pricing.recentGraduateDesc,
      badge: language === "es" ? "OFERTA" : "OFFER",
      features: [
        t.landing.pricing.everythingInProfessional,
        t.landing.pricing.firstMonthsDiscount,
        t.landing.pricing.prioritySupport,
        t.landing.pricing.marketingAssistance,
        t.landing.pricing.mentorshipAccess,
        t.landing.pricing.analyticsDashboard,
      ],
      buttonText: t.landing.pricing.applyForDiscount,
    },
  ]

  const togglePricingPeriod = (value: string) => {
    setIsYearly(Number.parseInt(value) === 1)
  }

  const handleSelectPlan = async (planKey: string) => {
    if (authLoading) return

    if (!user) {
      router.push(`/auth/register?role=professional&redirect=/precios`)
      return
    }

    const planId = SUBSCRIPTION_PLAN_IDS[planKey]
    if (!planId) {
      console.error("Plan configuration not found:", planKey)
      return
    }

    setLoadingPlan(planKey)

    try {
      const response = await fetch("/api/payments/mercadopago/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, isYearly }),
      })

      const data = await response.json()

      if (data.error) {
        console.error("Checkout error:", data.error)
        alert(language === "es" ? `Error: ${data.error}` : `Error: ${data.error}`)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Error initiating checkout:", error)
      alert(language === "es"
        ? "Error al procesar. Por favor intenta de nuevo."
        : "Processing error. Please try again.")
    } finally {
      setLoadingPlan(null)
    }
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
      className="px-4 pt-20 pb-16 md:py-20 min-h-screen max-w-7xl mx-auto relative w-full min-w-0"
      ref={pricingRef}
      aria-labelledby="pricing-title"
    >
      <article className="text-left mb-6 space-y-4 max-w-2xl min-w-0">
        <h2 id="pricing-title" className="text-4xl md:text-6xl font-medium text-white drop-shadow-lg mb-4 break-words">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6 w-full min-w-0">
        {plans.map((plan, index) => {
          const currentPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice
          const isLoading = loadingPlan === plan.key

          return (
            <TimelineContent
              key={plan.key}
              as="div"
              animationNum={2 + index}
              timelineRef={pricingRef}
              customVariants={revealVariants}
              className="h-full min-w-0"
            >
              <Card
                className={cn(
                  "relative border rounded-2xl overflow-hidden transition-all h-full flex flex-col backdrop-blur-xl min-w-0",
                  plan.popular
                    ? "ring-2 ring-primary/50 bg-white dark:bg-gray-900/80 border-slate-200 dark:border-primary/30 shadow-2xl shadow-primary/20"
                    : "bg-white dark:bg-gray-900/70 border-slate-200 dark:border-gray-700/30 shadow-xl"
                )}
              >
                <CardHeader className="text-left pb-4 pt-8 min-w-0">
                  <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
                    <h3 className="text-2xl md:text-2xl xl:text-3xl font-semibold text-slate-950 dark:text-white flex items-center gap-2 break-words">
                      {plan.key === "recentGraduate" && (
                        <GraduationCap className="h-6 w-6 text-teal-900 dark:text-primary" />
                      )}
                      {plan.name}
                    </h3>
                    <div className="flex flex-col items-end gap-2">
                      {isYearly && plan.yearlyDiscountPercent && (
                        <Badge className="bg-teal-600 text-white dark:bg-primary dark:text-primary-foreground px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                          {language === "es" ? `Ahorra ${plan.yearlyDiscountPercent}%` : `Save ${plan.yearlyDiscountPercent}%`}
                        </Badge>
                      )}
                      {plan.popular && (
                        <Badge className="bg-teal-600 text-white dark:bg-primary dark:text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                          {t.landing.pricing.mostPopular}
                        </Badge>
                      )}
                      {plan.badge && !isYearly && (
                        <Badge className="bg-teal-600 text-white dark:bg-primary dark:text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                          {plan.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm md:text-xs xl:text-sm text-slate-600 dark:text-white/80 mb-4 break-words">
                    {plan.description}
                  </p>
                  <div className="flex flex-wrap items-baseline gap-x-1 min-w-0">
                    <span className="text-3xl sm:text-4xl font-semibold text-slate-950 dark:text-white tabular-nums">
                      $
                      <AnimatedNumber
                        value={currentPrice}
                        className="text-3xl sm:text-4xl font-semibold"
                      />
                    </span>
                    <span className="text-slate-500 dark:text-white/70 text-lg sm:text-base">
                      /{isYearly ? (language === "es" ? "año" : "year") : (language === "es" ? "mes" : "month")}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 flex-1 flex flex-col min-w-0">
                  <Button
                    className={cn(
                      "w-full mb-6 p-4 text-lg sm:text-xl rounded-xl font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 hover:opacity-95 active:opacity-90",
                      "bg-teal-600 hover:bg-teal-700 dark:bg-gradient-to-t dark:from-primary dark:to-primary/90 shadow-lg shadow-primary/30 border border-teal-600 dark:border-primary/50 text-white hover:shadow-xl hover:shadow-primary/40"
                    )}
                    onClick={() => handleSelectPlan(plan.key)}
                    disabled={loadingPlan !== null}
                    aria-label={plan.buttonText}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {language === "es" ? "Procesando..." : "Processing..."}
                      </span>
                    ) : (
                      plan.buttonText
                    )}
                  </Button>

                  <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-border/40 flex-1">
                    <h4 className="text-xl font-semibold uppercase text-slate-900 dark:text-white mb-3">
                      {language === "es" ? "Características" : "Features"}
                    </h4>
                    <ul className="space-y-2" role="list">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3 min-w-0">
                          <span className="h-6 w-6 bg-primary/10 dark:bg-primary/20 border border-primary rounded-full grid place-content-center mt-0.5 shrink-0" aria-hidden="true">
                            <CheckCheck className="h-4 w-4 text-teal-600 dark:text-primary" />
                          </span>
                          <span className="text-sm text-slate-700 dark:text-white/90 leading-relaxed break-words">{feature}</span>
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
    </section>
  )
}
