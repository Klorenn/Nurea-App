"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2, MessageSquare, CheckCircle2, Sparkles } from "lucide-react"
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

const FEEDBACK_EMOJIS = [
  { rating: 1, emoji: "😡", label: "Muy Insatisfecho", color: "text-red-500" },
  { rating: 2, emoji: "🙁", label: "Insatisfecho", color: "text-orange-400" },
  { rating: 3, emoji: "😐", label: "Neutral", color: "text-amber-400" },
  { rating: 4, emoji: "🙂", label: "Satisfecho", color: "text-teal-400" },
  { rating: 5, emoji: "🤩", label: "¡Excelente!", color: "text-teal-600" },
]

export function ReviewModal({ isOpen, onClose, appointmentId, doctorName, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Por favor selecciona una carita para continuar")
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
      }, 2500)
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
      <DialogContent className="sm:max-w-md rounded-[2.5rem] overflow-hidden p-0 border-none shadow-3xl bg-white dark:bg-slate-950">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-8 md:p-10"
            >
              <DialogHeader className="mb-10 text-center">
                <DialogTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                  ¿Cómo estuvo tu cita?
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium text-base mt-2">
                  Cuéntanos tu experiencia con el <strong>Dr. {doctorName}</strong>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-12">
                {/* Emoji Selector */}
                <div className="flex flex-col items-center gap-6">
                  <div className="flex justify-between w-full max-w-sm px-2">
                    {FEEDBACK_EMOJIS.map((item) => {
                      const isSelected = rating === item.rating
                      const isHovered = hoveredRating === item.rating
                      
                      return (
                        <div key={item.rating} className="flex flex-col items-center gap-3">
                          <motion.button
                            whileHover={{ scale: 1.3, rotate: [0, -10, 10, 0] }}
                            whileTap={{ scale: 0.9 }}
                            onMouseEnter={() => setHoveredRating(item.rating)}
                            onMouseLeave={() => setHoveredRating(0)}
                            onClick={() => setRating(item.rating)}
                            className={cn(
                              "relative text-5xl md:text-6xl p-2 rounded-full transition-all duration-500 outline-none",
                              isSelected ? "bg-teal-50 dark:bg-teal-900/20 shadow-inner" : "grayscale-[0.5] hover:grayscale-0"
                            )}
                          >
                            <span className={cn(
                              "relative z-10 block leading-tight",
                              isSelected && "drop-shadow-[0_0_15px_rgba(20,184,166,0.6)]"
                            )}>
                              {item.emoji}
                            </span>
                            
                            {/* Glow Effect for Selected */}
                            {isSelected && (
                              <motion.div 
                                layoutId="glow"
                                className="absolute inset-0 bg-teal-400/20 rounded-full blur-xl"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                              />
                            )}
                          </motion.button>
                          
                          <motion.span 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ 
                              opacity: (isSelected || isHovered) ? 1 : 0,
                              y: (isSelected || isHovered) ? 0 : 5
                            }}
                            className={cn(
                              "text-xs font-black uppercase tracking-widest text-center",
                              isSelected ? "text-teal-600 dark:text-teal-400" : "text-slate-400"
                            )}
                          >
                            {item.label}
                          </motion.span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Comment Box */}
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider ml-1">
                    <MessageSquare className="h-4 w-4" /> 
                    ¿Quieres dejarle un mensaje de agradecimiento al doctor?
                  </label>
                  <Textarea
                    placeholder="Tu mensaje es opcional, pero muy valioso..."
                    className="min-h-[140px] rounded-[1.5rem] border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="ghost"
                    className="flex-1 rounded-2xl h-14 font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Omitir por ahora
                  </Button>
                  <Button
                    className={cn(
                      "flex-[2] rounded-2xl h-14 bg-teal-600 hover:bg-teal-700 text-white font-black uppercase tracking-wider shadow-xl shadow-teal-600/25 transition-all duration-300",
                      rating === 0 && "opacity-50 pointer-events-none"
                    )}
                    disabled={rating === 0 || loading}
                    onClick={handleSubmit}
                  >
                    {loading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        Enviar Reseña <Sparkles className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="p-16 flex flex-col items-center text-center gap-8"
            >
              <div className="relative">
                <motion.div 
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="w-28 h-28 rounded-3xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center relative z-10"
                >
                  <CheckCircle2 className="h-16 w-16 text-teal-600 dark:text-teal-400" />
                </motion.div>
                <div className="absolute -inset-4 bg-teal-400/10 blur-2xl rounded-full animate-pulse" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">¡Muchas Gracias!</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium text-lg leading-relaxed">
                  Tu valoración sobre el <strong>Dr. {doctorName}</strong> nos ayuda a mantener la excelencia en NUREA.
                </p>
              </div>
              <Button 
                variant="outline" 
                className="rounded-xl px-8 border-teal-200 text-teal-600 hover:bg-teal-50"
                onClick={onClose}
              >
                Cerrar
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
