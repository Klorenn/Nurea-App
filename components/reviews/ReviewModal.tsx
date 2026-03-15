"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, X, Loader2, MessageSquare, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  appointmentId: string
  doctorName: string
  onSuccess?: () => void
}

export function ReviewModal({ isOpen, onClose, appointmentId, doctorName, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Por favor selecciona una calificación")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          rating,
          comment
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al enviar reseña")
      }

      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
        onClose()
        if (onSuccess) onSuccess()
      }, 2000)
    } catch (err: any) {
      toast.error(err.message === "already_reviewed" 
        ? "Ya has dejado una reseña para esta cita" 
        : "Error al enviar la reseña")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl overflow-hidden p-0 border-none shadow-2xl">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <div className="p-8">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Califica tu atención</DialogTitle>
                <DialogDescription className="text-slate-500 font-medium">
                  Tu opinión sobre el <strong>{doctorName}</strong> ayuda a mejorar la comunidad Nurea.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-8">
                {/* Star Selector */}
                <div className="flex flex-col items-center gap-4">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setRating(star)}
                        className="relative"
                      >
                        <Star
                          className={cn(
                            "h-10 w-10 transition-colors",
                            star <= (hoveredRating || rating)
                              ? "text-amber-500 fill-amber-500"
                              : "text-slate-200"
                          )}
                        />
                      </motion.button>
                    ))}
                  </div>
                  <p className="text-sm font-black uppercase tracking-widest text-teal-600 h-5">
                    {rating === 1 && "Muy Insatisfecho"}
                    {rating === 2 && "Insatisfecho"}
                    {rating === 3 && "Neutral"}
                    {rating === 4 && "Satisfecho"}
                    {rating === 5 && "Excelente Servicio"}
                  </p>
                </div>

                {/* Comment Box */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 ml-1">
                    <MessageSquare className="h-3 w-3" /> Comentarios adicionales (Opcional)
                  </div>
                  <Textarea
                    placeholder="¿Qué es lo que más te gustó de la consulta?"
                    className="min-h-[120px] rounded-2xl border-slate-100 bg-slate-50/50 p-4 text-sm focus:ring-teal-500"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="ghost"
                    className="flex-1 rounded-xl h-12 font-bold text-slate-400"
                    onClick={onClose}
                  >
                    Omitir
                  </Button>
                  <Button
                    className="flex-[2] rounded-xl h-12 bg-teal-600 hover:bg-teal-700 text-white font-black uppercase tracking-wider shadow-lg shadow-teal-500/20"
                    disabled={rating === 0 || loading}
                    onClick={handleSubmit}
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Enviar Reseña"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 flex flex-col items-center text-center gap-6"
            >
              <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-teal-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase italic">¡Muchas Gracias!</h3>
                <p className="text-slate-500 mt-2 font-medium">Tu valoración ha sido registrada con éxito.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
