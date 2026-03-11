"use client"

import { ArrowLeft, Home, Ghost } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { useLanguage } from "@/contexts/language-context"
import { useRouter } from "next/navigation"

export default function NotFound() {
  const { language } = useLanguage()
  const router = useRouter()

  const handleHomeClick = () => {
    router.push("/")
  }

  const handleBackClick = () => {
    router.back()
  }

  const title = language === "es" ? "Página No Encontrada" : "Page Not Found"
  const description =
    language === "es"
      ? "La página que estás buscando no existe. Puede haber sido movida o eliminada."
      : "The page you're looking for doesn't exist. It may have been moved or deleted."
  const goHomeText = language === "es" ? "Ir al Inicio" : "Go Home"
  const goBackText = language === "es" ? "Volver" : "Go Back"

  return (
    <div
      suppressHydrationWarning
      className={cn(
        "relative min-h-screen w-full overflow-hidden bg-background flex items-center justify-center px-6",
      )}
    >
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Ghost className="h-16 w-16 text-teal-600 dark:text-teal-400" />
          </EmptyMedia>
          <EmptyTitle className="text-4xl font-bold bg-gradient-to-r from-teal-600 via-teal-500 to-teal-400 bg-clip-text text-transparent">
            404
          </EmptyTitle>
          <EmptyDescription className="text-lg mt-4">{description}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              onClick={handleHomeClick}
              className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20 group"
            >
              <Home className="h-4 w-4 mr-1 transition-transform group-hover:scale-110" />
              {goHomeText}
            </Button>

            <Button
              onClick={handleBackClick}
              variant="outline"
              className="border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/20 group"
            >
              <ArrowLeft className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" />
              {goBackText}
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  )
}

