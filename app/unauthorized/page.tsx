"use client"
import { useUser } from "@/hooks/use-user"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Home, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function UnauthorizedPage() {
  const { language } = useLanguage()
  const router = useRouter()
  const { user } = useUser()
  const isSpanish = language === "es"

  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full border-orange-200 dark:border-orange-800">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">
              {isSpanish ? "Acceso No Autorizado" : "Unauthorized Access"}
            </h1>
            <p className="text-muted-foreground">
              {isSpanish 
                ? "No tienes permiso para acceder a esta sección. Esta área es exclusiva para profesionales de la salud."
                : "You don't have permission to access this section. This area is exclusive for healthcare professionals."}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full rounded-xl"
            >
              <Home className="h-4 w-4 mr-2" />
              {isSpanish ? "Ir a mi Panel" : "Go to my Dashboard"}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="w-full rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isSpanish ? "Volver" : "Go Back"}
            </Button>
          </div>

          {user && (
            <p className="text-xs text-muted-foreground pt-4 border-t border-border/40">
              {isSpanish 
                ? "Si crees que esto es un error, contacta a soporte@nurea.app"
                : "If you believe this is an error, contact soporte@nurea.app"}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

