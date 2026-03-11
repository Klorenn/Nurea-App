"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/contexts/language-context"
import { motion } from "framer-motion"
import { LAUNCH_TARGET_DATE, getTimeLeftUntil } from "@/lib/countdown"

export function CtaSection() {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [waitlistCount, setWaitlistCount] = useState(0)
  
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isEmailValid = isValidEmail(email)
  
  const [timeLeft, setTimeLeft] = useState(() => ({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  }))

  // Conteo de waitlist al montar y cada 30 s
  useEffect(() => {
    const fetchWaitlistCount = async () => {
      try {
        const res = await fetch("/api/waitlist/count")
        const data = await res.json()
        setWaitlistCount(data.count ?? 0)
      } catch {
        // silenciar en cliente
      }
    }
    fetchWaitlistCount()
    const interval = setInterval(fetchWaitlistCount, 30000)
    return () => clearInterval(interval)
  }, [])

  // Cuenta regresiva: se actualiza cada segundo hasta el 10 dic 2027
  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeftUntil(LAUNCH_TARGET_DATE))
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEmailValid) return

    setIsLoading(true)
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json()

      if (!res.ok) {
        const msg = data.message ?? data.error ?? (isSpanish ? "Error al agregar tu email. Intenta nuevamente." : "Error adding your email. Please try again.")
        throw new Error(msg)
      }

      setIsSubmitted(true)
      setEmail("")
      if (typeof data.count === "number") setWaitlistCount(data.count)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (isSpanish ? "Error al agregar tu email." : "Error adding your email.")
      alert(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Content Container - Centrado perfectamente horizontal y vertical */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Waitlist Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-200 dark:border-gray-800"
        >
          {/* Header Section */}
          <div className="text-center space-y-4 mb-6">
            <h3 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">
              {isSpanish ? "Únete a la Lista de Espera" : "Join the Waitlist"}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
              {isSpanish
                ? "Sé el primero en conocer las nuevas funcionalidades de NUREA - la plataforma inteligente de salud construida para equipos modernos"
                : "Get early access to NUREA - the intelligent health platform built for modern teams"}
            </p>
          </div>

          {/* Form Section */}
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="mb-6" aria-label={isSpanish ? "Formulario lista de espera" : "Waitlist form"}>
              <div className="flex flex-col sm:flex-row gap-2 min-w-0">
                <Input
                  type="email"
                  placeholder={isSpanish ? "tu@email.com" : "your@email.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label={isSpanish ? "Correo electrónico" : "Email address"}
                  className="flex-1 min-w-0 h-11 rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-sm"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !isEmailValid}
                  aria-label={isSpanish ? "Unirse a la lista de espera" : "Join the waitlist"}
                  className={`h-11 px-5 sm:px-6 rounded-lg text-sm text-white whitespace-nowrap transition-all duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 active:opacity-90 ${
                    isEmailValid
                      ? "bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 shadow-lg shadow-green-500/30 focus-visible:ring-green-400"
                      : "bg-gray-700 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 opacity-60 cursor-not-allowed"
                  }`}
                >
                  {isLoading
                    ? (isSpanish ? "Enviando..." : "Sending...")
                    : (isSpanish ? "Registrarse" : "Sign Up")}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 mb-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-primary/30 to-primary/50 flex items-center justify-center border border-primary/40">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {isSpanish ? "¡Estás en la lista!" : "You're on the list!"}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                {isSpanish
                  ? "Te notificaremos cuando lancemos. ¡Gracias por unirte!"
                  : "We'll notify you when we launch. Thanks for joining!"}
              </p>
            </div>
          )}

          {/* Social Proof Section */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-xs font-medium shadow-sm">
                N
              </div>
              <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-xs font-medium shadow-sm">
                U
              </div>
              <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-xs font-medium shadow-sm">
                R
              </div>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isSpanish 
                ? `${waitlistCount.toLocaleString()} persona${waitlistCount !== 1 ? 's' : ''} ya se ${waitlistCount !== 1 ? 'unieron' : 'unió'}`
                : `${waitlistCount.toLocaleString()} ${waitlistCount === 1 ? 'person has' : 'people have'} already joined`}
            </span>
          </div>

          {/* Countdown Timer Section */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <div className="text-center min-w-[60px]">
                <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{timeLeft.days}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mt-1">
                  {isSpanish ? "días" : "days"}
                </div>
              </div>
              <div className="text-gray-400 text-sm">|</div>
              <div className="text-center min-w-[60px]">
                <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{timeLeft.hours}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mt-1">
                  {isSpanish ? "horas" : "hours"}
                </div>
              </div>
              <div className="text-gray-400 text-sm">|</div>
              <div className="text-center min-w-[60px]">
                <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{timeLeft.minutes}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mt-1">
                  {isSpanish ? "min" : "min"}
                </div>
              </div>
              <div className="text-gray-400 text-sm">|</div>
              <div className="text-center min-w-[60px]">
                <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{timeLeft.seconds}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mt-1">
                  {isSpanish ? "seg" : "sec"}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
