"use client"

import { Button } from "@/components/ui/button"
import { Search, MapPin, Stethoscope, Heart } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { motion } from "framer-motion"
import Link from "next/link"

export function PatientsHero() {
  const { language } = useLanguage()
  const t = useTranslations(language)
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
              ? "Encuentra el cuidado de salud que necesitas"
              : "Find the healthcare you need"}
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
              ? "Conectamos pacientes con profesionales de la salud verificados. Simple, seguro y humano."
              : "We connect patients with verified healthcare professionals. Simple, secure, and human."}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-card shadow-2xl shadow-primary/10 rounded-3xl p-4 md:p-6 max-w-5xl mx-auto border border-border flex flex-col md:flex-row gap-4 items-center"
        >
          <div className="relative flex-1 w-full group">
            <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
            <Input
              placeholder={isSpanish ? "Especialidad (ej. Psicólogo, Pediatra)" : "Specialty (e.g. Psychologist, Pediatrician)"}
              className="pl-12 h-14 bg-accent/30 border-none rounded-2xl focus-visible:ring-primary/20 w-full"
            />
          </div>

          <div className="relative flex-1 w-full">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
            <Select>
              <SelectTrigger className="pl-12 h-14 bg-accent/30 border-none rounded-2xl focus:ring-primary/20 w-full">
                <SelectValue placeholder={isSpanish ? "Ubicación" : "Location"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="santiago">Santiago</SelectItem>
                <SelectItem value="valparaiso">Valparaíso</SelectItem>
                <SelectItem value="concepcion">Concepción</SelectItem>
                <SelectItem value="remote">{isSpanish ? "Online / Remoto" : "Online / Remote"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            size="lg"
            className="h-14 px-8 md:px-10 rounded-2xl text-base md:text-lg font-medium shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all w-full md:w-auto shrink-0 flex items-center justify-center"
            asChild
          >
            <Link href="/search">
              <Search className="mr-2 h-5 w-5" />
              {isSpanish ? "Buscar profesional" : "Find Professional"}
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex items-center justify-center gap-2 pt-4"
        >
          <Heart className="h-4 w-4 text-primary" />
          <p className="text-sm text-muted-foreground">
            {isSpanish
              ? "Gratis para pacientes. Solo pagas por las consultas que agendes."
              : "Free for patients. You only pay for the consultations you book."}
          </p>
        </motion.div>
      </div>
    </section>
  )
}

