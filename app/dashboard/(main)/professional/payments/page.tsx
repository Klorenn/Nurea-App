"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  CreditCard,
  CheckCircle2,
  Loader2,
  Zap,
  Calendar,
  AlertCircle,
  ArrowRight,
  Star,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { es, enUS } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { loadingDashboardInsetClassName } from "@/lib/loading-layout"

type SubscriptionStatus = "inactive" | "trialing" | "active" | "past_due" | "canceled" | null

interface SubscriptionInfo {
  status: SubscriptionStatus
  trial_end_date: string | null
  selected_plan_id: string | null
}

const PRO_PRICE_CLP = 29990

export default function ProfessionalSubscriptionPage() {
  const { language } = useLanguage()
  const { user } = useAuth()
  const isSpanish = language === "es"
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [sub, setSub] = useState<SubscriptionInfo>({
    status: null,
    trial_end_date: null,
    selected_plan_id: null,
  })

  useEffect(() => {
    const loadSubscription = async () => {
      if (!user?.id) return
      try {
        const { data } = await supabase
          .from("profiles")
          .select("subscription_status, trial_end_date, selected_plan_id")
          .eq("id", user.id)
          .single()
        if (data) {
          setSub({
            status: (data.subscription_status as SubscriptionStatus) ?? "inactive",
            trial_end_date: data.trial_end_date ?? null,
            selected_plan_id: data.selected_plan_id ?? null,
          })
        }
      } catch (err) {
        console.error("Error loading subscription:", err)
      } finally {
        setLoading(false)
      }
    }
    loadSubscription()
  }, [user?.id])

  const handleUpgrade = () => {
    const preApprovalUrl = process.env.NEXT_PUBLIC_MP_PRO_PREAPPROVAL_URL
    if (preApprovalUrl) {
      window.location.href = preApprovalUrl
    } else {
      console.warn("NEXT_PUBLIC_MP_PRO_PREAPPROVAL_URL is not configured")
    }
  }

  const isActive = sub.status === "active" || sub.status === "trialing"
  const isTrialing = sub.status === "trialing"
  const isPastDue = sub.status === "past_due"
  const trialEndFormatted = sub.trial_end_date
    ? format(new Date(sub.trial_end_date), "dd 'de' MMMM, yyyy", { locale: isSpanish ? es : enUS })
    : null

  if (loading) {
    return (
      <div className={loadingDashboardInsetClassName("bg-background")}>
        <Loader2 className="animate-spin h-8 w-8 text-teal-600" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {isSpanish ? "Mi Suscripción NUREA" : "My NUREA Subscription"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {isSpanish
            ? "Gestiona tu plan y accede a todas las herramientas profesionales."
            : "Manage your plan and access all professional tools."}
        </p>
      </div>

      {/* Status Card */}
      <Card
        className={cn(
          "border shadow-sm overflow-hidden",
          isActive ? "border-teal-200 bg-teal-50/40 dark:border-teal-800 dark:bg-teal-950/20" : "border-slate-200 bg-white dark:bg-slate-900",
          isPastDue && "border-amber-300 bg-amber-50/40 dark:border-amber-700 dark:bg-amber-950/20"
        )}
      >
        <CardHeader className="pb-4 border-b border-inherit">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-teal-600" />
              {isSpanish ? "Estado del Plan" : "Plan Status"}
            </CardTitle>
            <StatusBadge status={sub.status} isSpanish={isSpanish} />
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {isTrialing && trialEndFormatted && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-teal-100/60 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
              <Calendar className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-teal-800 dark:text-teal-300">
                  {isSpanish ? "Período de prueba activo" : "Active trial period"}
                </p>
                <p className="text-xs text-teal-700 dark:text-teal-400 mt-0.5">
                  {isSpanish
                    ? `Tu período gratuito vence el ${trialEndFormatted}.`
                    : `Your free trial ends on ${trialEndFormatted}.`}
                </p>
              </div>
            </div>
          )}

          {sub.status === "active" && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-teal-100/60 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
              <CheckCircle2 className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-teal-800 dark:text-teal-300">
                  {isSpanish ? "Plan Pro activo" : "Pro plan active"}
                </p>
                <p className="text-xs text-teal-700 dark:text-teal-400 mt-0.5">
                  {isSpanish
                    ? "Tienes acceso completo a todas las funcionalidades de NUREA Pro."
                    : "You have full access to all NUREA Pro features."}
                </p>
              </div>
            </div>
          )}

          {isPastDue && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-100/60 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  {isSpanish ? "Pago pendiente" : "Payment pending"}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  {isSpanish
                    ? "Tu suscripción tiene un pago pendiente. Actualiza tu método de pago para continuar."
                    : "Your subscription has a pending payment. Update your payment method to continue."}
                </p>
              </div>
            </div>
          )}

          {!isActive && !isPastDue && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isSpanish
                ? "Actualmente no tienes una suscripción activa. Activa NUREA Pro para desbloquear todas las herramientas."
                : "You don't have an active subscription. Activate NUREA Pro to unlock all tools."}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Pro Plan Features */}
      {!isActive && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-slate-200 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">NUREA Pro</CardTitle>
                  <CardDescription>
                    {isSpanish
                      ? `$${PRO_PRICE_CLP.toLocaleString("es-CL")} CLP / mes`
                      : `$${PRO_PRICE_CLP.toLocaleString("es-CL")} CLP / month`}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3 mb-8">
                {(isSpanish ? [
                  "Perfil profesional verificado y visible en la plataforma",
                  "Agenda online ilimitada con gestión de disponibilidad",
                  "Historial clínico digital y fichas de pacientes",
                  "Teleconsulta por videollamada segura",
                  "Recordatorios automáticos para pacientes",
                  "Soporte prioritario NUREA",
                ] : [
                  "Verified professional profile visible on the platform",
                  "Unlimited online scheduling with availability management",
                  "Digital clinical records and patient files",
                  "Teleconsultation via secure video call",
                  "Automatic patient reminders",
                  "Priority NUREA support",
                ]).map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                onClick={handleUpgrade}
                className="w-full h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-base font-semibold shadow-sm"
              >
                <Star className="mr-2 h-5 w-5" />
                {isSpanish ? "Mejorar a Pro" : "Upgrade to Pro"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-3">
                {isSpanish
                  ? "Pago seguro con MercadoPago. Cancela cuando quieras."
                  : "Secure payment with MercadoPago. Cancel anytime."}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Already Pro — manage section */}
      {isActive && (
        <Card className="border-slate-200 bg-white dark:bg-slate-900 shadow-sm">
          <CardContent className="pt-6 pb-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              {isSpanish
                ? "Para modificar o cancelar tu suscripción, contacta a soporte NUREA."
                : "To modify or cancel your subscription, contact NUREA support."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatusBadge({ status, isSpanish }: { status: SubscriptionStatus; isSpanish: boolean }) {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/40 dark:text-teal-300 font-semibold gap-1">
          <CheckCircle2 className="h-3 w-3" />
          {isSpanish ? "Pro Activo" : "Pro Active"}
        </Badge>
      )
    case "trialing":
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 font-semibold gap-1">
          <Calendar className="h-3 w-3" />
          {isSpanish ? "En Prueba" : "Trial"}
        </Badge>
      )
    case "past_due":
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-semibold gap-1">
          <AlertCircle className="h-3 w-3" />
          {isSpanish ? "Pago Pendiente" : "Past Due"}
        </Badge>
      )
    case "canceled":
      return (
        <Badge variant="secondary" className="font-semibold">
          {isSpanish ? "Cancelado" : "Canceled"}
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="text-slate-500 font-semibold">
          {isSpanish ? "Inactivo" : "Inactive"}
        </Badge>
      )
  }
}
