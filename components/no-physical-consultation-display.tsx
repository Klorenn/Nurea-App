"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Video } from "lucide-react"

const IMAGE_PATH = "/images/no-physical-consultation.png"

export interface NoPhysicalConsultationDisplayProps {
  /** Si es true, el CTA avanza al paso de agendar (ej. teleconsulta); si es false, solo informa. */
  inModal?: boolean
  /** Callback al hacer clic en "Agendar Teleconsulta". En modal: avanzar a paso 2 con 'online' pre-seleccionado. */
  onAgendarTeleconsulta?: () => void
  /** Mostrar como pantalla completa (centrado en viewport) o contenido inline/card. */
  variant?: "fullscreen" | "inline"
  /** Idioma para textos. */
  isSpanish?: boolean
  className?: string
}

const defaultOnCta = () => {
  if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" })
}

export function NoPhysicalConsultationDisplay({
  inModal = false,
  onAgendarTeleconsulta,
  variant = "inline",
  isSpanish = true,
  className,
}: NoPhysicalConsultationDisplayProps) {
  const handleCta = onAgendarTeleconsulta ?? defaultOnCta

  const title = isSpanish
    ? "Este Especialista No Atiende Presencialmente"
    : "This Specialist Does Not Offer In-Person Consultations"

  const description = isSpanish
    ? "Actualmente, sus horarios presenciales están cerrados o solo atiende por teleconsulta. Te invitamos a considerar una consulta online."
    : "Currently, their in-person hours are closed or they only offer teleconsultation. We invite you to consider an online consultation."

  const ctaLabel = isSpanish ? "Agendar Teleconsulta" : "Book Teleconsultation"

  const content = (
    <>
      <div className="relative w-full max-w-[280px] mx-auto aspect-[4/3] flex-shrink-0 transition-transform duration-300 hover:scale-[1.02]">
        <Image
          src={IMAGE_PATH}
          alt={isSpanish ? "Atención presencial no disponible" : "In-person consultation not available"}
          fill
          className="object-contain object-center"
          sizes="280px"
          priority={variant === "fullscreen"}
        />
      </div>
      <div className="space-y-3 text-center">
        <h3 className="text-xl font-bold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          {description}
        </p>
        <Button
          onClick={handleCta}
          className={cn(
            "rounded-xl font-semibold shadow-lg shadow-primary/20 mt-2 transition-opacity hover:opacity-95",
            inModal && "px-8"
          )}
          aria-label={ctaLabel}
        >
          <Video className="h-4 w-4 mr-2" />
          {ctaLabel}
        </Button>
      </div>
    </>
  )

  if (variant === "fullscreen") {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-background",
          className
        )}
      >
        <div className="flex flex-col items-center gap-6 max-w-md animate-in fade-in duration-300">
          {content}
        </div>
      </div>
    )
  }

  return (
    <Card className={cn("border-border/40 overflow-hidden", className)}>
      <CardContent className="flex flex-col items-center gap-6 py-8 px-6">
        {content}
      </CardContent>
    </Card>
  )
}
