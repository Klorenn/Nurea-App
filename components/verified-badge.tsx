"use client"

import { BadgeCheck, ShieldCheck } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type BadgeVariant = "default" | "compact" | "inline" | "card"
type BadgeIcon = "badge" | "shield"

interface VerifiedBadgeProps {
  variant?: BadgeVariant
  icon?: BadgeIcon
  showLabel?: boolean
  className?: string
  isSpanish?: boolean
}

export function VerifiedBadge({
  variant = "default",
  icon = "shield",
  showLabel = false,
  className,
  isSpanish = true,
}: VerifiedBadgeProps) {
  const IconComponent = icon === "shield" ? ShieldCheck : BadgeCheck

  const tooltipText = isSpanish
    ? "Profesional verificado por la Superintendencia de Salud"
    : "Professional verified by the Health Superintendence"

  const labelText = isSpanish ? "Verificado" : "Verified"

  const variantStyles: Record<BadgeVariant, string> = {
    default:
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400",
    compact: "inline-flex items-center justify-center",
    inline: "inline-flex items-center gap-1",
    card: "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400",
  }

  const iconSizes: Record<BadgeVariant, string> = {
    default: "h-4 w-4",
    compact: "h-4 w-4",
    inline: "h-3.5 w-3.5",
    card: "h-5 w-5",
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <span
            className={cn(
              variantStyles[variant],
              "cursor-help transition-colors hover:bg-teal-500/15",
              className
            )}
            role="img"
            aria-label={tooltipText}
          >
            <IconComponent
              className={cn(iconSizes[variant], "text-teal-500 shrink-0")}
              aria-hidden="true"
            />
            {(showLabel || variant === "default" || variant === "card") && (
              <span className="text-xs font-semibold tracking-wide">
                {labelText}
              </span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs bg-slate-900 dark:bg-slate-800 text-white border-none shadow-xl"
        >
          <div className="flex items-start gap-2 p-1">
            <ShieldCheck className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
            <p className="text-sm leading-snug">{tooltipText}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface VerificationPendingBannerProps {
  isSpanish?: boolean
  className?: string
}

export function VerificationPendingBanner({
  isSpanish = true,
  className,
}: VerificationPendingBannerProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-50/80 via-amber-50/50 to-orange-50/30 dark:from-amber-950/30 dark:via-amber-900/20 dark:to-orange-950/10 backdrop-blur-sm p-6 md:p-8 shadow-lg",
        className
      )}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-orange-400/5 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-400/10 to-yellow-400/5 rounded-full blur-xl" />

      <div className="relative z-10 flex flex-col md:flex-row items-start gap-5">
        {/* Icon */}
        <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 flex items-center justify-center">
          <ShieldCheck className="h-7 w-7 text-amber-600 dark:text-amber-400" />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">
              {isSpanish
                ? "Tu perfil está en proceso de validación"
                : "Your profile is being validated"}
            </h3>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span className="text-xs font-medium text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                {isSpanish ? "En revisión" : "Under review"}
              </span>
            </div>
          </div>

          <p className="text-sm text-amber-800/80 dark:text-amber-200/70 leading-relaxed max-w-2xl">
            {isSpanish
              ? "Tu perfil está oculto para los pacientes hasta completar los 2 pasos de activación. Puedes preparar tu perfil mientras tanto."
              : "Your profile is hidden from patients until you complete 2 activation steps. You can prepare your profile in the meantime."}
          </p>

          {/* 2-step checklist */}
          <div className="space-y-2 pt-1">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-100/60 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/30">
              <div className="w-5 h-5 rounded-full border-2 border-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                  {isSpanish ? "Paso 1 — Verificación RNPI (en curso)" : "Step 1 — RNPI Verification (in progress)"}
                </p>
                <p className="text-xs text-amber-700/70 dark:text-amber-300/70 mt-0.5">
                  {isSpanish
                    ? "Cruzamos tus credenciales con la Superintendencia de Salud. < 24 horas."
                    : "We cross-check your credentials with the Health Superintendence. < 24 hours."}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-slate-800/30 border border-amber-200/40 dark:border-amber-700/20">
              <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isSpanish ? "Paso 2 — Activar suscripción" : "Step 2 — Activate subscription"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isSpanish
                    ? "Elige tu plan para aparecer en búsquedas y recibir pacientes."
                    : "Choose your plan to appear in searches and receive patients."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">
                {isSpanish ? "Te notificamos por email al verificarte" : "We'll email you when verified"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function VerifiedTrustBadge({
  isSpanish = true,
  className,
}: {
  isSpanish?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-500/5 border border-teal-500/20",
        className
      )}
    >
      <div className="shrink-0 w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center">
        <ShieldCheck className="h-5 w-5 text-teal-600 dark:text-teal-400" />
      </div>
      <p className="text-sm text-muted-foreground">
        {isSpanish
          ? "En NUREA, el 100% de nuestros especialistas están verificados por la Superintendencia de Salud."
          : "At NUREA, 100% of our specialists are verified by the Health Superintendence."}
      </p>
    </div>
  )
}
