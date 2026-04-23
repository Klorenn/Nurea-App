"use client"

import { Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { loadingDashboardInsetClassName } from "@/lib/loading-layout"

export interface LoadingStateProps {
  message?: string
  variant?: "spinner" | "skeleton" | "inline"
  /** Ocupa el área principal del dashboard y centra (sidebar + header). */
  fullPage?: boolean
  className?: string
  skeletonCount?: number
}

export function LoadingState({
  message,
  variant = "spinner",
  fullPage = false,
  className,
  skeletonCount = 3,
}: LoadingStateProps) {
  if (variant === "spinner") {
    if (fullPage) {
      return (
        <div className={loadingDashboardInsetClassName(cn("bg-background", className))}>
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            {message && <p className="text-muted-foreground">{message}</p>}
          </div>
        </div>
      )
    }
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          {message && (
            <p className="text-muted-foreground">{message}</p>
          )}
        </div>
      </div>
    )
  }

  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        ))}
      </div>
    )
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        {message && <span className="text-sm text-muted-foreground">{message}</span>}
      </div>
    )
  }

  return null
}
