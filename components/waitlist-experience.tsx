"use client"

import React, { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  },
)
Button.displayName = "Button"

export function WaitlistExperience() {
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
    <section className="relative py-20 px-4">
      {/* Waitlist Card */}
      <div className="flex items-center justify-center">
        <div className="relative w-full max-w-[420px]">
          <div className="relative bg-card border border-border/40 rounded-3xl p-8 shadow-lg">
            <div className="relative z-10">
                {!isSubmitted ? (
                  <>
                    <div className="mb-8 text-center">
                      <h1 className="text-4xl font-light text-foreground mb-4 tracking-wide">
                        {isSpanish ? "Estamos en Construcción" : "We're Building"}
                      </h1>
                      <p className="text-muted-foreground text-base leading-relaxed">
                        {isSpanish
                          ? "Únete a la lista de espera y sé el primero en conocer"
                          : "Join the waitlist and be the first to know about"}
                        <br />
                        {isSpanish
                          ? "las nuevas funcionalidades de NUREA"
                          : "NUREA's new features"}
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mb-6">
                      <div className="flex gap-3">
                        <Input
                          type="email"
                          placeholder={isSpanish ? "tu@email.com" : "your@email.com"}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="flex-1 bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 h-12 rounded-xl backdrop-blur-sm"
                        />
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50"
                        >
                          {isLoading
                            ? (isSpanish ? "Enviando..." : "Sending...")
                            : (isSpanish ? "Notificarme" : "Get Notified")}
                        </Button>
                      </div>
                    </form>

                    <div className="flex items-center justify-center gap-3 mb-6">
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

                    <div className="flex items-center justify-center gap-6 text-center">
                      <div>
                        <div className="text-2xl font-light text-foreground">{timeLeft.days}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">
                          {isSpanish ? "días" : "days"}
                        </div>
                      </div>
                      <div className="text-muted-foreground/40">|</div>
                      <div>
                        <div className="text-2xl font-light text-foreground">{timeLeft.hours}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">
                          {isSpanish ? "horas" : "hours"}
                        </div>
                      </div>
                      <div className="text-muted-foreground/40">|</div>
                      <div>
                        <div className="text-2xl font-light text-foreground">{timeLeft.minutes}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">
                          {isSpanish ? "min" : "min"}
                        </div>
                      </div>
                      <div className="text-muted-foreground/40">|</div>
                      <div>
                        <div className="text-2xl font-light text-foreground">{timeLeft.seconds}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">
                          {isSpanish ? "seg" : "sec"}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary/30 to-primary/50 flex items-center justify-center border border-primary/40">
                      <svg
                        className="w-8 h-8 text-primary drop-shadow-lg"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2 drop-shadow-lg">
                      {isSpanish ? "¡Estás en la lista!" : "You're on the list!"}
                    </h3>
                    <p className="text-muted-foreground text-sm drop-shadow-md">
                      {isSpanish
                        ? "Te notificaremos cuando lancemos. ¡Gracias por unirte!"
                        : "We'll notify you when we launch. Thanks for joining!"}
                    </p>
                  </div>
                )}
              </div>

          </div>
        </div>
      </div>
    </section>
  )
}

