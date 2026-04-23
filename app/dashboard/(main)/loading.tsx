"use client"

import { Loader2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { loadingDashboardInsetClassName } from "@/lib/loading-layout"

export default function LoadingScreen() {
  const { language } = useLanguage()
  const isSpanish = language === "es"

  return (
    <div className={loadingDashboardInsetClassName("bg-background")}>
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="text-sm font-medium text-foreground">
          {isSpanish ? "Cargando..." : "Loading..."}
        </p>
      </div>
    </div>
  )
}
