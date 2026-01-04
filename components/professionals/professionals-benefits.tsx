"use client"

import { Calendar, CreditCard, MessageSquare, TrendingUp, Shield, Clock } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { motion } from "framer-motion"

export function ProfessionalsBenefits() {
  const { language } = useLanguage()
  const isSpanish = language === "es"

  const benefits = [
    {
      icon: Calendar,
      title: isSpanish ? "Agenda integrada" : "Integrated calendar",
      description: isSpanish
        ? "Gestiona todas tus citas en un solo lugar. Los pacientes agendan directamente y tú confirmas con un clic."
        : "Manage all your appointments in one place. Patients book directly and you confirm with one click.",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: CreditCard,
      title: isSpanish ? "Pagos automáticos" : "Automatic payments",
      description: isSpanish
        ? "Recibe pagos antes de cada consulta. Sin gestionar cobros manuales ni recordatorios de pago."
        : "Receive payments before each consultation. No manual billing or payment reminders to manage.",
      color: "bg-secondary/10 text-secondary",
    },
    {
      icon: MessageSquare,
      title: isSpanish ? "Comunicación segura" : "Secure communication",
      description: isSpanish
        ? "Chatea con tus pacientes de forma segura. Comparte documentos y coordina seguimientos fácilmente."
        : "Chat with your patients securely. Share documents and coordinate follow-ups easily.",
      color: "bg-accent/40 text-accent-foreground",
    },
    {
      icon: TrendingUp,
      title: isSpanish ? "Construye tu reputación" : "Build your reputation",
      description: isSpanish
        ? "Conecta con pacientes que buscan tu especialidad. Recibe reseñas genuinas y construye confianza en tu práctica."
        : "Connect with patients looking for your specialty. Receive genuine reviews and build trust in your practice.",
      color: "bg-muted text-muted-foreground",
    },
    {
      icon: Shield,
      title: isSpanish ? "Intermediario tecnológico" : "Technology intermediary",
      description: isSpanish
        ? "NUREA facilita la conexión. Tú eres responsable de la atención médica. Nosotros del resto."
        : "NUREA facilitates the connection. You are responsible for medical care. We handle the rest.",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: Clock,
      title: isSpanish ? "Ahorra tiempo" : "Save time",
      description: isSpanish
        ? "Menos llamadas, menos emails, menos gestión administrativa. Más tiempo para lo que realmente importa."
        : "Fewer calls, fewer emails, less administrative work. More time for what really matters.",
      color: "bg-secondary/10 text-secondary",
    },
  ]

  return (
    <section className="py-16 md:py-20 px-6 bg-transparent relative" id="benefits">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-12 md:mb-16"
        >
          <p className="text-primary font-bold text-sm uppercase tracking-[0.2em]">
            {isSpanish ? "Todo lo que necesitas" : "Everything you need"}
          </p>
          <h2 className="text-4xl lg:text-5xl text-foreground font-bold leading-[1.1] tracking-tight">
            {isSpanish
              ? "Herramientas para <span class='text-primary italic'>gestionar</span> tu práctica"
              : "Tools to <span class='text-primary italic'>manage</span> your practice"}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {isSpanish
              ? "Diseñamos NUREA pensando en profesionales como tú. Herramientas simples que te ayudan a enfocarte en lo importante: acompañar a tus pacientes."
              : "We designed NUREA thinking about professionals like you. Simple tools that help you focus on what's important: supporting your patients."}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {benefits.map((benefit, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="group p-6 md:p-8 rounded-[2rem] bg-card border border-border hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
            >
              <div
                className={`w-14 h-14 rounded-2xl ${benefit.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
              >
                <benefit.icon className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{benefit.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

