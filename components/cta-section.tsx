"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { motion } from "framer-motion"

export function CtaSection() {
  const { language } = useLanguage()
  const t = useTranslations(language || "es")
  const isSpanish = language === "es"
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        console.error('Error:', data.error)
        alert(isSpanish ? 'Error al agregar tu email. Intenta nuevamente.' : 'Error adding your email. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert(isSpanish ? 'Error al agregar tu email. Intenta nuevamente.' : 'Error adding your email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Background Image - Natural Landscape */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80&auto=format&fit=crop')",
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-800/70 to-slate-900/80" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto w-full space-y-12">
        {/* Main CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-card/90 dark:bg-card/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-border/40 shadow-2xl"
        >
          <div className="text-center space-y-6">
                  {/* Headline */}
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight">
                    {t?.cta?.title || "Comienza tu viaje hacia una mejor salud hoy"}
                  </h2>

                  {/* Subtitle */}
                  <p className="text-lg md:text-xl text-foreground/90 max-w-3xl mx-auto leading-relaxed">
                    {t?.cta?.subtitle || "Únete a miles de personas que han transformado su acceso a la salud. Encuentra el profesional adecuado y experimenta la diferencia."}
                  </p>

            {/* Buttons - Solo "Demo Próximamente" */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 rounded-2xl text-base font-medium border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary hover:text-primary"
                  disabled
                >
                        {t?.cta?.watchDemo || "Demo Próximamente"}
                      </Button>
                    </motion.div>
                  </div>

                  {/* Small Print */}
                  <p className="text-sm text-muted-foreground pt-2">
                    {t?.cta?.noCreditCard || "Sin tarjeta de crédito requerida • Prueba gratuita • Cancela cuando quieras"}
                  </p>
          </div>
        </motion.div>

        {/* Waitlist Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-card/90 dark:bg-card/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-border/40 shadow-2xl"
        >
          <div className="text-center space-y-6">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground">
              {isSpanish ? "Únete a la Lista de Espera" : "Join the Waitlist"}
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isSpanish
                ? "Sé el primero en conocer las nuevas funcionalidades de NUREA"
                : "Be the first to know about NUREA's new features"}
            </p>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex gap-3">
                  <Input
                    type="email"
                    placeholder={isSpanish ? "tu@email.com" : "your@email.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 h-12 rounded-xl bg-background/50 border-border"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    size="lg"
                    className="h-12 px-6 rounded-xl"
                  >
                    {isLoading
                      ? (isSpanish ? "Enviando..." : "Sending...")
                      : (isSpanish ? "Notificarme" : "Get Notified")}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary/30 to-primary/50 flex items-center justify-center border border-primary/40">
                  <svg
                    className="w-8 h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-2">
                  {isSpanish ? "¡Estás en la lista!" : "You're on the list!"}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {isSpanish
                    ? "Te notificaremos cuando lancemos. ¡Gracias por unirte!"
                    : "We'll notify you when we launch. Thanks for joining!"}
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-4">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 border-2 border-background flex items-center justify-center text-primary-foreground text-xs font-medium">
                  N
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-primary/60 border-2 border-background flex items-center justify-center text-primary-foreground text-xs font-medium">
                  U
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-primary/40 border-2 border-background flex items-center justify-center text-primary-foreground text-xs font-medium">
                  R
                </div>
              </div>
              <span className="text-muted-foreground text-sm">
                {isSpanish ? "~2k+ personas ya se unieron" : "~2k+ people already joined"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
