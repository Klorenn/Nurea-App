"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { 
  CreditCard, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Calendar,
  Users,
  MessageSquare,
  BarChart3,
  Loader2
} from "lucide-react"

interface ProfileInfo {
  subscription_status: string | null
  stripe_subscription_id: string | null
  is_onboarded: boolean | null
}

export default function ProfessionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { language } = useLanguage()
  const supabase = createClient()
  const isSpanish = language === "es"

  const [profileInfo, setProfileInfo] = useState<ProfileInfo | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if we're already on the onboarding page
  const isOnboardingPage = pathname?.includes("/onboarding")

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/login")
      return
    }

    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("subscription_status, stripe_subscription_id, is_onboarded")
          .eq("id", user.id)
          .single()

        if (error) {
          console.error("Error loading profile:", error)
          setProfileInfo({ 
            subscription_status: "inactive", 
            stripe_subscription_id: null,
            is_onboarded: false 
          })
        } else {
          setProfileInfo(data)
        }
      } catch (error) {
        console.error("Error:", error)
        setProfileInfo({ 
          subscription_status: "inactive", 
          stripe_subscription_id: null,
          is_onboarded: false 
        })
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user, authLoading, router, supabase])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 text-teal-600 animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">
            {isSpanish ? "Cargando..." : "Loading..."}
          </p>
        </div>
      </div>
    )
  }

  const isSubscriptionActive = profileInfo?.subscription_status === "active" || 
                               profileInfo?.subscription_status === "trialing"

  // Check 1: Subscription active?
  if (!isSubscriptionActive) {
    return <SubscriptionPaywall language={language} />
  }

  // Check 2: Onboarding complete? (only redirect if NOT already on onboarding page)
  const isOnboarded = profileInfo?.is_onboarded === true
  if (!isOnboarded && !isOnboardingPage) {
    router.push("/dashboard/professional/onboarding")
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 text-teal-600 animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">
            {isSpanish ? "Redirigiendo..." : "Redirecting..."}
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

function SubscriptionPaywall({ language }: { language: string }) {
  const router = useRouter()
  const isSpanish = language === "es"
  const [loadingCheckout, setLoadingCheckout] = useState(false)

  const features = [
    {
      icon: Calendar,
      title: isSpanish ? "Agenda Inteligente" : "Smart Calendar",
      description: isSpanish 
        ? "Gestiona tu disponibilidad y citas automáticamente"
        : "Manage your availability and appointments automatically"
    },
    {
      icon: Users,
      title: isSpanish ? "Gestión de Pacientes" : "Patient Management",
      description: isSpanish 
        ? "Ficha clínica electrónica completa"
        : "Complete electronic medical records"
    },
    {
      icon: MessageSquare,
      title: isSpanish ? "Videoconsultas HD" : "HD Video Consultations",
      description: isSpanish 
        ? "Atención remota con encriptación de extremo a extremo"
        : "Remote care with end-to-end encryption"
    },
    {
      icon: BarChart3,
      title: isSpanish ? "Reportes y Métricas" : "Reports & Metrics",
      description: isSpanish 
        ? "Visualiza tu rendimiento y crecimiento"
        : "Visualize your performance and growth"
    },
  ]

  const handleStartTrial = () => {
    router.push("/precios")
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Main Card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
          {/* Gradient Header */}
          <div className="relative bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-500 px-8 py-10 text-white">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    {isSpanish ? "Suscripción Requerida" : "Subscription Required"}
                  </h1>
                  <p className="text-teal-100 text-sm">
                    {isSpanish ? "Activa tu cuenta profesional" : "Activate your professional account"}
                  </p>
                </div>
              </div>
              
              <p className="text-white/90 leading-relaxed">
                {isSpanish 
                  ? "Para recibir pacientes y gestionar tu agenda en NUREA, necesitas una suscripción activa. Elige el plan que mejor se adapte a tu práctica."
                  : "To receive patients and manage your calendar on NUREA, you need an active subscription. Choose the plan that best fits your practice."}
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="p-8">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
              {isSpanish ? "Todo lo que obtienes" : "Everything you get"}
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                >
                  <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Benefits List */}
            <div className="space-y-2 mb-8">
              {[
                isSpanish ? "Sin comisiones por consulta" : "No per-consultation fees",
                isSpanish ? "Soporte prioritario 24/7" : "24/7 priority support",
                isSpanish ? "Cancela cuando quieras" : "Cancel anytime",
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-teal-500" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleStartTrial}
                disabled={loadingCheckout}
                className="flex-1 h-12 bg-teal-600 hover:bg-teal-700 text-white font-medium"
              >
                {loadingCheckout ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    {isSpanish ? "Ver Planes y Precios" : "View Plans & Pricing"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.open("mailto:soporte@nurea.app", "_blank")}
                className="h-12"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {isSpanish ? "Contactar Ventas" : "Contact Sales"}
              </Button>
            </div>
          </div>

          {/* Footer Note */}
          <div className="px-8 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              {isSpanish 
                ? "¿Ya tienes una suscripción? Tu acceso se activará automáticamente cuando el pago sea procesado."
                : "Already have a subscription? Your access will be activated automatically when payment is processed."}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
