"use client"

import { Button } from "@/components/ui/button"
import { Stethoscope, Calendar, Users, ArrowRight } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { motion } from "framer-motion"
import Link from "next/link"

export function ProfessionalsHero() {
  const { language } = useLanguage()
  const isSpanish = language === "es"

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center px-4 py-16 md:py-20 overflow-hidden bg-transparent">
      {/* Decorative elements */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center space-y-10">
        <div className="space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-sans text-5xl md:text-7xl font-bold tracking-tight text-foreground text-balance leading-tight"
          >
            {isSpanish
              ? "Gestiona tu práctica de forma <span class='text-primary italic'>simple</span>"
              : "Manage your practice <span class='text-primary italic'>simply</span>"}
            <motion.span
              className="inline-block ml-2 text-primary"
              animate={{
                opacity: [1, 1, 0, 0, 1, 1],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                times: [0, 0.5, 0.5, 0.75, 0.75, 1],
                ease: "linear",
              }}
            >
              .
            </motion.span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed text-muted-foreground font-light"
          >
            {isSpanish
              ? "NUREA es el espacio donde gestionas tu práctica profesional. Conecta con pacientes, organiza tu agenda y enfócate en lo que realmente importa: acompañar."
              : "NUREA is the space where you manage your professional practice. Connect with patients, organize your schedule, and focus on what really matters: supporting."}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              size="lg"
              className="h-14 px-8 md:px-10 rounded-2xl text-base md:text-lg font-medium shadow-lg shadow-primary/20"
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
              className="h-14 px-8 md:px-10 rounded-2xl text-base md:text-lg font-medium border-2"
              asChild
            >
              <Link href="/#pricing">
                {isSpanish ? "Ver planes y precios" : "View plans and pricing"}
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-8"
        >
          {[
            {
              icon: Users,
              label: isSpanish ? "Conecta con pacientes" : "Connect with patients",
            },
            {
              icon: Calendar,
              label: isSpanish ? "Gestiona tu agenda" : "Manage your schedule",
            },
            {
              icon: Stethoscope,
              label: isSpanish ? "Crecimiento profesional" : "Professional growth",
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 + idx * 0.1 }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card/50 border border-border/40"
            >
              <item.icon className="h-6 w-6 text-primary" />
              <p className="text-sm font-medium text-center">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

