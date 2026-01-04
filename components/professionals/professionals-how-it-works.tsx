"use client"

import { UserPlus, Calendar, MessageSquare, DollarSign } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { motion } from "framer-motion"

export function ProfessionalsHowItWorks() {
  const { language } = useLanguage()
  const isSpanish = language === "es"

  const steps = [
    {
      icon: UserPlus,
      title: isSpanish ? "Únete" : "Join",
      description: isSpanish
        ? "Crea tu perfil profesional en minutos. Verificamos tu registro y listo para comenzar."
        : "Create your professional profile in minutes. We verify your registration and you're ready to start.",
      number: "1",
    },
    {
      icon: Calendar,
      title: isSpanish ? "Configura tu agenda" : "Set your schedule",
      description: isSpanish
        ? "Define tus horarios disponibles y los pacientes agendan directamente. Tú solo confirmas."
        : "Define your available hours and patients book directly. You just confirm.",
      number: "2",
    },
    {
      icon: MessageSquare,
      title: isSpanish ? "Conecta con pacientes" : "Connect with patients",
      description: isSpanish
        ? "Comunícate de forma segura, comparte documentos y coordina seguimientos desde la plataforma."
        : "Communicate securely, share documents, and coordinate follow-ups from the platform.",
      number: "3",
    },
    {
      icon: DollarSign,
      title: isSpanish ? "Recibe pagos" : "Receive payments",
      description: isSpanish
        ? "Los pacientes pagan antes de la consulta. Tú recibes el pago automáticamente, sin gestionar cobros."
        : "Patients pay before the consultation. You receive payment automatically, without managing billing.",
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
            {isSpanish ? "Cómo funciona para ti" : "How it works for you"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isSpanish
              ? "Cuatro pasos simples para comenzar a usar NUREA y gestionar tu práctica profesional de forma más eficiente."
              : "Four simple steps to start using NUREA and manage your professional practice more efficiently."}
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

