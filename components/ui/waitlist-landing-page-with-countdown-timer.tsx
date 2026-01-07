"use client"

import React, { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function WaitlistExperience(): React.ReactElement {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // 8 meses en cuenta regresiva
  const targetDate = new Date()
  targetDate.setMonth(targetDate.getMonth() + 8)
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  // Calcular tiempo inicial
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const target = targetDate.getTime()
      const difference = target - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [])

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
    <main className="relative min-h-screen overflow-hidden w-full">
      {/* Background Image - Mountain Landscape */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80&auto=format&fit=crop')",
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-800/70 to-slate-900/80" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen">
        {/* Waitlist Card */}
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="relative">
            <div className="relative backdrop-blur-xl bg-card/90 dark:bg-card/80 border border-border/40 rounded-3xl p-6 w-full max-w-[420px] shadow-2xl">
              {/* Gradient overlay effects */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 dark:from-white/5 to-transparent pointer-events-none" />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-transparent via-white/[0.02] to-white/[0.05] pointer-events-none" />

              <div className="relative z-10">
                {!isSubmitted ? (
                  <>
                    <div className="mb-6 text-center">
                      <h1 className="text-2xl md:text-3xl font-light text-foreground mb-3 tracking-wide">
                        {isSpanish ? "Estamos en Construcción" : "We're Building"}
                      </h1>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {isSpanish
                          ? "Únete a la lista de espera y sé el primero en conocer"
                          : "Join the waitlist and be the first to know about"}
                        <br />
                        {isSpanish
                          ? "las nuevas funcionalidades de NUREA"
                          : "NUREA's new features"}
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mb-5">
                      <div className="flex gap-2">
                        <Input
                          type="email"
                          placeholder={isSpanish ? "tu@email.com" : "your@email.com"}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="flex-1 bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 h-10 rounded-lg backdrop-blur-sm text-sm"
                        />
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="h-10 px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 text-sm"
                        >
                          {isLoading
                            ? (isSpanish ? "Enviando..." : "Sending...")
                            : (isSpanish ? "Notificarme" : "Get Notified")}
                        </Button>
                      </div>
                    </form>

                    <div className="flex items-center justify-center gap-2 mb-5">
                      <div className="flex -space-x-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/80 border-2 border-background flex items-center justify-center text-primary-foreground text-xs font-medium">
                          N
                        </div>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/80 to-primary/60 border-2 border-background flex items-center justify-center text-primary-foreground text-xs font-medium">
                          U
                        </div>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/60 to-primary/40 border-2 border-background flex items-center justify-center text-primary-foreground text-xs font-medium">
                          R
                        </div>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {isSpanish ? "~2k+ personas ya se unieron" : "~2k+ people already joined"}
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-4 text-center">
                      <div>
                        <div className="text-xl font-light text-foreground">{timeLeft.days}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">
                          {isSpanish ? "días" : "days"}
                        </div>
                      </div>
                      <div className="text-muted-foreground/40">|</div>
                      <div>
                        <div className="text-xl font-light text-foreground">{timeLeft.hours}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">
                          {isSpanish ? "horas" : "hours"}
                        </div>
                      </div>
                      <div className="text-muted-foreground/40">|</div>
                      <div>
                        <div className="text-xl font-light text-foreground">{timeLeft.minutes}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">
                          {isSpanish ? "min" : "min"}
                        </div>
                      </div>
                      <div className="text-muted-foreground/40">|</div>
                      <div>
                        <div className="text-xl font-light text-foreground">{timeLeft.seconds}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">
                          {isSpanish ? "seg" : "sec"}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-primary/30 to-primary/50 flex items-center justify-center border border-primary/40">
                      <svg
                        className="w-6 h-6 text-primary drop-shadow-lg"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 drop-shadow-lg">
                      {isSpanish ? "¡Estás en la lista!" : "You're on the list!"}
                    </h3>
                    <p className="text-muted-foreground text-xs drop-shadow-md">
                      {isSpanish
                        ? "Te notificaremos cuando lancemos. ¡Gracias por unirte!"
                        : "We'll notify you when we launch. Thanks for joining!"}
                    </p>
                  </div>
                )}
              </div>

              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/10 to-primary/10 blur-xl scale-110 -z-10 opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

