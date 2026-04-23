"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { loadingFullViewportClassName } from "@/lib/loading-layout"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { language } = useLanguage()
  const isSpanish = language === "es"

  useEffect(() => {
    console.error("Global error caught:", error)
  }, [error])

  return (
    <div className={loadingFullViewportClassName("bg-background p-4")}>
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">
            {isSpanish ? "Algo salio mal" : "Something went wrong"}
          </h2>
          <p className="text-muted-foreground text-sm">
            {isSpanish
              ? "Ha ocurrido un error inesperado. Por favor, intenta de nuevo."
              : "An unexpected error occurred. Please try again."}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground font-mono">
              ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {isSpanish ? "Reintentar" : "Try again"}
          </Button>
          <Button variant="outline" onClick={() => window.location.href = "/"} className="gap-2">
            <Home className="h-4 w-4" />
            {isSpanish ? "Ir al inicio" : "Go home"}
          </Button>
        </div>
      </div>
    </div>
  )
}
