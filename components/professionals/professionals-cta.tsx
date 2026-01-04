"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { motion } from "framer-motion"
import Link from "next/link"

export function ProfessionalsCTA() {
  const { language } = useLanguage()
  const isSpanish = language === "es"

  const features = [
    isSpanish ? "Agenda integrada" : "Integrated calendar",
    isSpanish ? "Pagos automáticos" : "Automatic payments",
    isSpanish ? "Comunicación segura" : "Secure communication",
    isSpanish ? "Perfil profesional" : "Professional profile",
  ]

  return (
    <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-transparent relative">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground">
            {isSpanish
              ? "Únete a NUREA hoy"
              : "Join NUREA today"}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {isSpanish
              ? "Únete a profesionales de la salud que ya están gestionando su práctica con NUREA. Simple, seguro y enfocado en lo importante."
              : "Join healthcare professionals who are already managing their practice with NUREA. Simple, secure, and focused on what matters."}
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-4">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="flex items-center gap-2 text-sm"
              >
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span className="text-muted-foreground">{feature}</span>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="lg"
                className="h-14 px-8 rounded-2xl text-base font-medium shadow-lg shadow-primary/20"
                asChild
              >
                <Link href="/signup">
                  {isSpanish ? "Unirme como profesional" : "Join as Professional"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 rounded-2xl text-base font-medium border-2"
                asChild
              >
                <Link href="/#pricing">
                  {isSpanish ? "Ver planes y precios" : "View plans and pricing"}
                </Link>
              </Button>
            </motion.div>
          </div>
          <p className="text-sm text-muted-foreground pt-2">
            {isSpanish
              ? "Planes desde $15 USD/mes. Sin costos de instalación ni compromisos a largo plazo."
              : "Plans from $15 USD/month. No setup costs or long-term commitments."}
          </p>
        </motion.div>
      </div>
    </section>
  )
}

