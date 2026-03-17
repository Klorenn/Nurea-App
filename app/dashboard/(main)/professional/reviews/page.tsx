"use client"

import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"

export default function ProfessionalReviewsPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {isSpanish ? "Opiniones" : "Reviews"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isSpanish
            ? "Gestiona y responde las opiniones de tus pacientes."
            : "Manage and respond to your patients' reviews."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
            {isSpanish ? "Tus opiniones" : "Your reviews"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {isSpanish
              ? "Aquí aparecerán las opiniones que te dejen los pacientes tras las consultas. Próximamente."
              : "Patient reviews will appear here after consultations. Coming soon."}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
