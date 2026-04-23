"use client"

import { Loader2 } from "lucide-react"
import { loadingDashboardInsetClassName, loadingFullViewportClassName } from "@/lib/loading-layout"

interface CenteredLoadingProps {
  text?: string
  size?: "sm" | "md" | "lg"
}

export function CenteredLoading({ text, size = "md" }: CenteredLoadingProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  }

  const textSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  return (
    <div className={loadingDashboardInsetClassName("gap-4")}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {text && <p className={`${textSize[size]} text-muted-foreground font-medium`}>{text}</p>}
    </div>
  )
}

export function PageLoading() {
  return (
    <div className={loadingFullViewportClassName("bg-background")}>
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-foreground">Cargando...</p>
      </div>
    </div>
  )
}
