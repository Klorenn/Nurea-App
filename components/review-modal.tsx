"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  professionalName: string
  appointmentId: string
}

export function ReviewModal({ isOpen, onClose, professionalName, appointmentId }: ReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Por favor selecciona una calificación")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Simulate API call - Replace with actual API endpoint
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId,
          professionalName,
          rating,
          comment: comment.trim() || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Error al guardar la reseña" }))
        throw new Error(errorData.message || "Error al guardar la reseña")
      }

      // Success
      setSubmitted(true)
      setTimeout(() => {
        onClose()
        setSubmitted(false)
        setRating(0)
        setComment("")
        setError(null)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la reseña. Por favor intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      setError(null)
      setRating(0)
      setComment("")
    }
  }

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl">
          <div className="flex flex-col items-center justify-center text-center space-y-6 py-12 px-8">
            <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <CheckCircle2 className="h-16 w-16" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-bold">¡Gracias!</h3>
              <p className="text-muted-foreground">Tu reseña ha sido enviada exitosamente.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-primary/5 p-8 border-b border-primary/10">
          <DialogTitle className="text-2xl font-bold text-primary">Califica tu Experiencia</DialogTitle>
          <DialogDescription className="mt-2 text-muted-foreground">
            Comparte tu opinión sobre tu consulta con {professionalName}
          </DialogDescription>
        </div>

        <div className="p-8 space-y-8">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Label className="text-lg font-bold">Calificación General</Label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-12 w-12 transition-colors",
                      star <= (hoveredRating || rating)
                        ? "fill-primary text-primary"
                        : "fill-none text-muted-foreground/30",
                    )}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                {rating === 5 && "¡Excelente!"}
                {rating === 4 && "¡Muy bueno!"}
                {rating === 3 && "Bueno"}
                {rating === 2 && "Regular"}
                {rating === 1 && "Malo"}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="comment" className="text-lg font-bold">
              Tu Reseña (Opcional)
            </Label>
            <Textarea
              id="comment"
              placeholder="Comparte tu experiencia... ¿Qué te gustó? ¿Cómo podría mejorar?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[120px] rounded-xl bg-accent/20 border-none resize-none"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Tu reseña será visible en el perfil del profesional y ayudará a otros pacientes a tomar decisiones informadas.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="flex-1 rounded-xl font-bold shadow-lg shadow-primary/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Enviar Reseña"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

