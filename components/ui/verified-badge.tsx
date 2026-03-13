"use client"

import { CheckCircle2, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { VerificationStatus } from "@/types/database"

export interface VerifiedBadgeProps {
  className?: string
  size?: "sm" | "md" | "lg"
  showText?: boolean
  showTooltip?: boolean
  variant?: "badge" | "icon"
  verificationDate?: string | null
}

const sizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
}

const badgeSizeClasses = {
  sm: "text-[10px] px-1.5 py-0",
  md: "text-xs px-2 py-0.5",
  lg: "text-sm px-2.5 py-1",
}

export function VerifiedBadge({ 
  className, 
  size = "md",
  showText = true,
  showTooltip = true,
  variant = "badge",
  verificationDate,
}: VerifiedBadgeProps) {
  const tooltipContent = (
    <div className="max-w-xs space-y-2">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-teal-500" />
        <span className="font-medium">Profesional Verificado</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Este profesional ha validado su identidad y credenciales académicas ante NUREA. 
        Su licencia profesional y documentos han sido revisados por nuestro equipo.
      </p>
      {verificationDate && (
        <p className="text-xs text-muted-foreground/70">
          Verificado el {new Date(verificationDate).toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      )}
    </div>
  )

  const badgeContent = (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 bg-teal-500/10 border-teal-500/20 text-teal-600 dark:text-teal-400 cursor-help transition-colors hover:bg-teal-500/15",
        badgeSizeClasses[size],
        className
      )}
    >
      <CheckCircle2 className={cn(sizeClasses[size], "fill-current")} />
      {showText && (
        <span className="font-medium">
          Verificado
        </span>
      )}
    </Badge>
  )

  const iconContent = (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 cursor-help transition-colors hover:bg-teal-500/15",
        size === "sm" && "h-5 w-5",
        size === "md" && "h-6 w-6",
        size === "lg" && "h-8 w-8",
        className
      )}
    >
      <ShieldCheck className={sizeClasses[size]} />
    </div>
  )

  const content = variant === "badge" ? badgeContent : iconContent

  if (!showTooltip) {
    return content
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="bg-card border-border/50 shadow-lg"
          sideOffset={5}
        >
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export interface VerificationStatusBadgeProps {
  status: VerificationStatus
  className?: string
  size?: "sm" | "md" | "lg"
  showTooltip?: boolean
}

const statusConfig: Record<VerificationStatus, {
  label: string
  labelEn: string
  color: string
  bgColor: string
  borderColor: string
  description: string
}> = {
  pending: {
    label: "Pendiente",
    labelEn: "Pending",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    description: "Aún no has enviado tus documentos de verificación.",
  },
  under_review: {
    label: "En Revisión",
    labelEn: "Under Review",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    description: "Nuestro equipo está revisando tu documentación. Te notificaremos cuando el proceso esté completo.",
  },
  verified: {
    label: "Verificado",
    labelEn: "Verified",
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/20",
    description: "Tu identidad y credenciales han sido verificadas exitosamente.",
  },
  rejected: {
    label: "Rechazado",
    labelEn: "Rejected",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    description: "Tu verificación fue rechazada. Por favor, revisa los comentarios y vuelve a enviar tus documentos.",
  },
}

export function VerificationStatusBadge({
  status,
  className,
  size = "md",
  showTooltip = true,
}: VerificationStatusBadgeProps) {
  const config = statusConfig[status]

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5",
        config.bgColor,
        config.borderColor,
        config.color,
        badgeSizeClasses[size],
        showTooltip && "cursor-help",
        className
      )}
    >
      {status === "verified" && <CheckCircle2 className={sizeClasses[size]} />}
      {status === "under_review" && (
        <div className={cn(sizeClasses[size], "relative")}>
          <div className="absolute inset-0 animate-ping rounded-full bg-current opacity-25" />
          <div className="relative rounded-full bg-current h-2 w-2 m-auto" />
        </div>
      )}
      <span className="font-medium">{config.label}</span>
    </Badge>
  )

  if (!showTooltip) {
    return badge
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="bg-card border-border/50 shadow-lg max-w-xs"
          sideOffset={5}
        >
          <p className="text-sm">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
