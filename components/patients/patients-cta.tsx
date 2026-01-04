"use client"

import { Button } from "@/components/ui/button"
import { Search, ArrowRight } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { motion } from "framer-motion"
import Link from "next/link"

export function PatientsCTA() {
  const { language } = useLanguage()
  const isSpanish = language === "es"

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
              ? "Encuentra el profesional que necesitas hoy"
              : "Find the professional you need today"}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {isSpanish
              ? "Miles de profesionales verificados están listos para ayudarte. Busca, agenda y cuida tu salud de forma simple."
              : "Thousands of verified professionals are ready to help you. Search, book, and take care of your health simply."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="lg"
                className="h-14 px-8 rounded-2xl text-base font-medium shadow-lg shadow-primary/20"
                asChild
              >
                <Link href="/search">
                  <Search className="mr-2 h-5 w-5" />
                  {isSpanish ? "Buscar profesional" : "Find Professional"}
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
                <Link href="/signup">
                  {isSpanish ? "Crear cuenta gratis" : "Create free account"}
                </Link>
              </Button>
            </motion.div>
          </div>
          <p className="text-sm text-muted-foreground pt-2">
            {isSpanish
              ? "Gratis para pacientes. Sin suscripciones ni costos ocultos."
              : "Free for patients. No subscriptions or hidden costs."}
          </p>
        </motion.div>
      </div>
    </section>
  )
}

