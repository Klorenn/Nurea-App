"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useLanguage } from "@/contexts/language-context"
import {
  Check,
  Sparkles,
  Zap,
  Crown,
  ArrowRight,
  Shield,
  Clock,
  Users,
  Calendar,
  Video,
  FileText,
  BarChart3,
  MessageSquare,
  Loader2,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PricingPlan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  features: string[]
  highlighted?: boolean
  badge?: string
  icon: React.ElementType
}

const plans: PricingPlan[] = [
  {
    id: "graduate",
    name: "Starter",
    description: "Para profesionales que inician",
    monthlyPrice: 29990,
    yearlyPrice: 299900,
    icon: Zap,
    features: [
      "Hasta 30 consultas/mes",
      "Agenda básica",
      "Videoconsultas HD",
      "Ficha clínica electrónica",
      "Soporte por email",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    description: "El más popular para consultorios",
    monthlyPrice: 49990,
    yearlyPrice: 499900,
    icon: Sparkles,
    highlighted: true,
    badge: "Más Popular",
    features: [
      "Consultas ilimitadas",
      "Agenda avanzada con recordatorios",
      "Videoconsultas HD + grabación",
      "Ficha clínica completa",
      "Reportes y métricas",
      "Soporte prioritario 24/7",
      "Perfil destacado en búsquedas",
    ],
  },
  {
    id: "clinic",
    name: "Clinic",
    description: "Para clínicas y equipos",
    monthlyPrice: 99990,
    yearlyPrice: 999900,
    icon: Crown,
    features: [
      "Todo en Professional",
      "Hasta 5 profesionales",
      "Panel de administración",
      "Reportes consolidados",
      "API de integración",
      "Onboarding personalizado",
      "Account manager dedicado",
    ],
  },
]

export default function PreciosPage() {
  const { language } = useLanguage()
  const { user } = useUser()
  const router = useRouter()
  const isSpanish = language === "es"
  
  const [isYearly, setIsYearly] = useState(true)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const handleSelectPlan = async (plan: PricingPlan) => {
    if (!user) {
      router.push("/auth/register?role=professional&redirect=/precios")
      return
    }

    const role =
      (user.app_metadata as any)?.role ||
      (user.user_metadata as any)?.role ||
      null

    if (role !== "professional") {
      alert(
        isSpanish
          ? "Este plan de suscripción es solo para profesionales de la salud. Como paciente no necesitas pagar nada para usar NUREA."
          : "Subscription plans are only available for health professionals. As a patient you don't need to pay anything to use NUREA."
      )
    return
    }

    setLoadingPlan(plan.id)

    try {
      const planId = (plan.id === "clinic" ? "professional" : plan.id) as "professional" | "graduate"
      const response = await fetch("/api/payments/mercadopago/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, isYearly }),
      })

      const data = await response.json()

      if (data.error) {
        console.error("Checkout error:", data.error)
        alert(data.error)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Error initiating checkout:", error)
      alert("Error al procesar. Por favor intenta de nuevo.")
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-20">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto px-4 mb-16">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="h-3 w-3 mr-1" />
            {isSpanish ? "Planes de Suscripción" : "Subscription Plans"}
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {isSpanish 
              ? "Elige el plan perfecto para tu práctica"
              : "Choose the perfect plan for your practice"}
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            {isSpanish 
              ? "Sin comisiones por consulta. Solo pagas una suscripción mensual fija."
              : "No per-consultation fees. Just pay a fixed monthly subscription."}
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={cn(
              "text-sm font-medium transition-colors",
              !isYearly ? "text-foreground" : "text-muted-foreground"
            )}>
              {isSpanish ? "Mensual" : "Monthly"}
            </span>
            
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-teal-600"
            />
            
            <span className={cn(
              "text-sm font-medium transition-colors",
              isYearly ? "text-foreground" : "text-muted-foreground"
            )}>
              {isSpanish ? "Anual" : "Yearly"}
              <Badge variant="secondary" className="ml-2 bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300">
                -17%
              </Badge>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative rounded-2xl border bg-card p-8 flex flex-col",
                  plan.highlighted 
                    ? "border-teal-500 shadow-xl shadow-teal-500/10 scale-105 z-10" 
                    : "border-border"
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-teal-600 hover:bg-teal-600 text-white px-4">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <div className="mb-6">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                    plan.highlighted 
                      ? "bg-teal-100 dark:bg-teal-900/50" 
                      : "bg-slate-100 dark:bg-slate-800"
                  )}>
                    <plan.icon className={cn(
                      "h-6 w-6",
                      plan.highlighted 
                        ? "text-teal-600 dark:text-teal-400" 
                        : "text-slate-600 dark:text-slate-400"
                    )} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">
                      {formatPrice(isYearly ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice)}
                    </span>
                    <span className="text-muted-foreground">/mes</span>
                  </div>
                  {isYearly && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {isSpanish ? "Facturado anualmente" : "Billed annually"} ({formatPrice(plan.yearlyPrice)})
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <Check className={cn(
                        "h-5 w-5 flex-shrink-0",
                        plan.highlighted ? "text-teal-500" : "text-muted-foreground"
                      )} />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={loadingPlan !== null}
                  className={cn(
                    "w-full h-12",
                    plan.highlighted 
                      ? "bg-teal-600 hover:bg-teal-700 text-white" 
                      : ""
                  )}
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  {loadingPlan === plan.id ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      {isSpanish ? "Comenzar Ahora" : "Get Started"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto px-4 mt-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {isSpanish ? "Todo lo que necesitas para crecer" : "Everything you need to grow"}
            </h2>
            <p className="text-muted-foreground">
              {isSpanish 
                ? "Funcionalidades incluidas en todos los planes"
                : "Features included in all plans"}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Video, label: isSpanish ? "Videoconsultas HD" : "HD Video Calls" },
              { icon: Calendar, label: isSpanish ? "Agenda Online" : "Online Scheduling" },
              { icon: FileText, label: isSpanish ? "Ficha Clínica" : "Medical Records" },
              { icon: Shield, label: isSpanish ? "Datos Encriptados" : "Encrypted Data" },
              { icon: MessageSquare, label: isSpanish ? "Chat Seguro" : "Secure Chat" },
              { icon: BarChart3, label: isSpanish ? "Reportes" : "Reports" },
              { icon: Users, label: isSpanish ? "Gestión Pacientes" : "Patient Management" },
              { icon: Clock, label: isSpanish ? "Recordatorios" : "Reminders" },
            ].map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900"
              >
                <feature.icon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <span className="text-sm font-medium text-foreground">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ / Trust Section */}
        <div className="max-w-2xl mx-auto px-4 mt-20 text-center">
          <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {isSpanish ? "¿Tienes preguntas?" : "Have questions?"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {isSpanish 
                ? "Nuestro equipo está listo para ayudarte a elegir el plan perfecto"
                : "Our team is ready to help you choose the perfect plan"}
            </p>
            <Button variant="outline" onClick={() => window.open("mailto:ventas@nurea.app", "_blank")}>
              {isSpanish ? "Contactar Ventas" : "Contact Sales"}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
