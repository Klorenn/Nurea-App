"use client"

import { Search, CalendarDays, MessageSquare, CheckCircle2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { motion } from "framer-motion"

export function PatientsHowItWorks() {
  const { language } = useLanguage()
  const isSpanish = language === "es"

  const steps = [
    {
      icon: Search,
      title: isSpanish ? "Busca" : "Search",
      description: isSpanish
        ? "Encuentra el profesional que necesitas por especialidad, ubicación o tipo de consulta."
        : "Find the professional you need by specialty, location, or consultation type.",
      number: "1",
    },
    {
      icon: CalendarDays,
      title: isSpanish ? "Agenda" : "Book",
      description: isSpanish
        ? "Elige el día y hora que mejor te convenga. En menos de 30 segundos tu cita está confirmada."
        : "Choose the day and time that works best for you. In less than 30 seconds your appointment is confirmed.",
      number: "2",
    },
    {
      icon: MessageSquare,
      title: isSpanish ? "Comunícate" : "Communicate",
      description: isSpanish
        ? "Chatea de forma segura con tu profesional antes y después de la consulta. Todo en un solo lugar."
        : "Chat securely with your professional before and after the consultation. Everything in one place.",
      number: "3",
    },
    {
      icon: CheckCircle2,
      title: isSpanish ? "Cuida tu salud" : "Take care",
      description: isSpanish
        ? "Accede a tus documentos, historial de citas y todo lo que necesitas para gestionar tu salud."
        : "Access your documents, appointment history, and everything you need to manage your health.",
      number: "4",
    },
  ]

  return (
    <section className="py-16 md:py-20 px-6 bg-transparent relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-12 md:mb-16"
        >
          <p className="text-secondary font-bold text-sm uppercase tracking-widest">
            {isSpanish ? "Proceso simple" : "Simple process"}
          </p>
          <h2 className="text-4xl lg:text-6xl text-foreground font-bold tracking-tight">
            {isSpanish ? "Cómo funciona" : "How it works"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isSpanish
              ? "Cuatro pasos simples para encontrar y agendar la atención que necesitas."
              : "Four simple steps to find and book the care you need."}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="flex flex-col gap-6"
            >
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-border shadow-md group bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
                <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                  {step.number}
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/90 backdrop-blur shadow-lg flex items-center justify-center">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="space-y-3 px-2">
                <h3 className="text-2xl font-bold text-foreground">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

