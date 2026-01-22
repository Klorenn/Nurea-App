"use client"

import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export interface VerifiedBadgeProps {
  className?: string
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function VerifiedBadge({ 
  className, 
  size = "md",
  showText = true 
}: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 bg-teal-500/10 border-teal-500/20 text-teal-600 dark:text-teal-400",
        className
      )}
    >
      <CheckCircle2 className={cn(sizeClasses[size], "fill-current")} />
      {showText && (
        <span className="text-xs font-medium">
          Verificado
        </span>
      )}
    </Badge>
  )
}
