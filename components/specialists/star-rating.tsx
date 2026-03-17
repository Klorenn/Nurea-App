"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  value: number
  max?: number
  size?: "sm" | "md"
  showValue?: boolean
  className?: string
}

const sizeClasses = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
}

export function StarRating({
  value,
  max = 5,
  size = "sm",
  showValue = true,
  className,
}: StarRatingProps) {
  const clamped = Math.min(max, Math.max(0, value))
  const full = Math.round(clamped) // redondeo para estrellas llenas (4.8 → 5, 4.2 → 4)

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5" role="img" aria-label={`${clamped.toFixed(1)} de ${max} estrellas`}>
        {Array.from({ length: max }, (_, i) => (
          <Star
            key={i}
            className={cn(
              sizeClasses[size],
              i < full ? "fill-amber-500 text-amber-500" : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
            )}
            aria-hidden
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
          {clamped.toFixed(1)}
        </span>
      )}
    </div>
  )
}
