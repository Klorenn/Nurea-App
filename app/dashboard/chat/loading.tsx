"use client"

import { Loader2 } from "lucide-react"
import { loadingDashboardInsetClassName } from "@/lib/loading-layout"

export default function Loading() {
  return (
    <div className={loadingDashboardInsetClassName("bg-background")}>
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Cargando...</p>
      </div>
    </div>
  )
}
