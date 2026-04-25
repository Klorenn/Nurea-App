"use client"

export const dynamic = 'force-dynamic'

import { useUser } from "@/hooks/use-user"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
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
import { loadingDashboardInsetClassName } from "@/lib/loading-layout"

interface ProfileInfo {
  subscription_status: string | null
  stripe_subscription_id: string | null
  trial_end_date: string | null
  selected_plan_id: string | null
  is_onboarded: boolean | null
  onboarding_completed: boolean | null
}

export default function ProfessionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoaded: authLoading } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const { language } = useLanguage()
  const supabase = createClient()
  const isSpanish = language === "es"

  const [profileInfo, setProfileInfo] = useState<ProfileInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/login")
      return
    }

    const loadProfile = async () => {
      try {
        // Seleccionamos solo las columnas que sabemos que existen para evitar errores 400
        const { data, error } = await supabase
          .from("profiles")
          .select("subscription_status, stripe_subscription_id, is_onboarded, onboarding_completed, role")
          .eq("id", user.id)
          .single()

        if (error) {
          console.error("Error loading profile details:", error.message, error)
          setProfileInfo({
            subscription_status: "inactive",
            stripe_subscription_id: null,
            trial_end_date: null,
            selected_plan_id: null,
            is_onboarded: false,
            onboarding_completed: false
          })
        } else {
          // Redirect non-professionals away from the professional dashboard
          const userRole = (data as any).role || user.app_metadata?.role || user.user_metadata?.role
          if (userRole && userRole !== 'professional') {
            router.replace(userRole === 'admin' ? '/dashboard/admin' : '/dashboard/patient')
            return
          }

          // Guard: si el onboarding no está completo, forzar wizard
          const onboardingDone =
            (data as any).onboarding_completed === true || (data as any).is_onboarded === true
          if (!onboardingDone && !pathname?.startsWith("/dashboard/professional/onboarding")) {
            router.replace("/dashboard/professional/onboarding")
            return
          }

          setProfileInfo({
            ...data,
            trial_end_date: (data as any).trial_end_date || null,
            selected_plan_id: (data as any).selected_plan_id || null
          })
          
          // AUTO-REDIRECT TO CHECKOUT or MARK AS PENDING
          const isSubscribed = data.subscription_status === "active" || 
                             data.subscription_status === "trialing" || 
                             data.subscription_status === "pending_approval"
          
          if (!isSubscribed) {
            const pendingPlan = sessionStorage.getItem("pending_plan")
            if (pendingPlan) {
              if (pendingPlan === "graduate") {
                // Graduate plan requires admin approval
                console.log(`🎓 Requesting Graduate plan for user: ${user.id}`)
                const { requestGraduatePlan } = await import("@/actions/subscriptions")
                await requestGraduatePlan()
                
                sessionStorage.removeItem("pending_plan")
                setProfileInfo(prev => prev ? { ...prev, subscription_status: "pending_approval", selected_plan_id: "graduate" } : null)
                return
              } else {
                // Standard professional plan goes to Mercado Pago
                console.log(`🚀 Redirecting to Mercado Pago for pending plan: ${pendingPlan}`)
                try {
                  const res = await fetch("/api/payments/mercadopago/subscription", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ planId: pendingPlan, isYearly: false }),
                  })
                  if (res.ok) {
                    const { url } = await res.json()
                    if (url) {
                      sessionStorage.removeItem("pending_plan")
                      window.location.href = url
                      return
                    }
                  } else {
                    console.error("Payment API returned an error:", res.status)
                    sessionStorage.removeItem("pending_plan")
                  }
                } catch (err) {
                  console.error("Failed to parse payment API response:", err)
                  sessionStorage.removeItem("pending_plan")
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error:", error)
        setProfileInfo({
          subscription_status: "inactive",
          stripe_subscription_id: null,
          trial_end_date: null,
          selected_plan_id: null,
          is_onboarded: false,
          onboarding_completed: false
        })
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user, authLoading, router, supabase])

  // Onboarding redirect desactivado: usamos directamente la página de perfil profesional como lugar de configuración inicial.

  if (authLoading || loading) {
    return (
      <div className={loadingDashboardInsetClassName("bg-background")}>
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 text-teal-600 animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">
            {isSpanish ? "Cargando..." : "Loading..."}
          </p>
        </div>
      </div>
    )
  }

  // Check 1: Subscription active or trialing (and not expired)
  const now = new Date()
  const hasTrialAccess = profileInfo?.subscription_status === "trialing" &&
    profileInfo?.trial_end_date &&
    new Date(profileInfo.trial_end_date) > now

  const isSubscriptionActive = profileInfo?.subscription_status === "active" || hasTrialAccess

  // Sin suscripción solo se bloquean: mensajes (chat) y pacientes. El resto (perfil, horarios, configuración, citas, etc.) se permite.
  const isMessagesPage = pathname?.startsWith("/dashboard/professional/chat")
  const isPatientsPage = pathname?.startsWith("/dashboard/professional/patients")
  const requiresSubscription = isMessagesPage || isPatientsPage

  if (!isSubscriptionActive && requiresSubscription) {
    return <SubscriptionPaywall language={language} status={profileInfo?.subscription_status || "inactive"} />
  }

  return <>{children}</>
}

function SubscriptionPaywall({ language, status }: { language: string, status: string }) {
  const router = useRouter()
  const isSpanish = language === "es"
  const [loadingCheckout, setLoadingCheckout] = useState(false)
  const isPendingApproval = status === "pending_approval"

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

  const handleStartCheckout = async () => {
    setLoadingCheckout(true)
    try {
      // Por defecto llevamos al plan profesional mensual si viene del paywall genérico
      const res = await fetch("/api/payments/mercadopago/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: "professional", isYearly: false }),
      })
      if (res.ok) {
        const { url } = await res.json()
        if (url) {
          window.location.href = url
          return
        }
      } else {
        console.error("Payment API returned an error:", res.status)
      }
      // Fallback a la página de precios si falla la API
      router.push("/pricing")
    } catch (error) {
      console.error("Error starting checkout:", error)
      router.push("/pricing")
    } finally {
      setLoadingCheckout(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
    router.push("/login")
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
                  {isPendingApproval ? <Loader2 className="h-6 w-6 animate-spin" /> : <Lock className="h-6 w-6" />}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    {isPendingApproval 
                      ? (isSpanish ? "Solicitud en Revisión" : "Request Under Review")
                      : (isSpanish ? "Suscripción Requerida" : "Subscription Required")}
                  </h1>
                  <p className="text-teal-100 text-sm">
                    {isPendingApproval
                      ? (isSpanish ? "Estamos evaluando tu perfil" : "We are evaluating your profile")
                      : (isSpanish ? "Activa tu cuenta profesional" : "Activate your professional account")}
                  </p>
                </div>
              </div>
              
              <p className="text-white/90 leading-relaxed">
                {isPendingApproval
                  ? (isSpanish 
                      ? "Tu solicitud para el plan de Recién Graduado está siendo revisada por nuestro equipo. Te notificaremos por correo una vez aprobada."
                      : "Your request for the Recent Graduate plan is being reviewed by our team. We will notify you by email once approved.")
                  : (isSpanish 
                      ? "Para recibir pacientes y gestionar tu agenda en NUREA, necesitas una suscripción activa. Elige el plan que mejor se adapte a tu práctica."
                      : "To receive patients and manage your calendar on NUREA, you need an active subscription. Choose the plan that best fits your practice.")}
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
              {!isPendingApproval ? (
                <Button
                  onClick={handleStartCheckout}
                  disabled={loadingCheckout}
                  className="flex-1 h-12 bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-lg shadow-teal-500/20"
                >
                  {loadingCheckout ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      {isSpanish ? "Adquirir suscripción" : "Get Subscription"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex-1 p-4 rounded-xl bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 text-sm font-medium flex items-center justify-center gap-2 border border-teal-100 dark:border-teal-800">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isSpanish ? "Esperando aprobación..." : "Awaiting approval..."}
                </div>
              )}
              
              <Button
                variant="outline"
                onClick={handleLogout}
                className="h-12 border-slate-200"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {isSpanish ? "Cerrar Sesión" : "Log Out"}
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
