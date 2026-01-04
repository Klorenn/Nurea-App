"use client"

import { Heart, ShieldCheck, Zap, Clock } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { motion } from "framer-motion"

export function PatientsBenefits() {
  const { language } = useLanguage()
  const isSpanish = language === "es"

  const benefits = [
    {
      icon: Heart,
      title: isSpanish ? "Atención humana" : "Human care",
      description: isSpanish
        ? "Profesionales que te escuchan y te acompañan. No es solo una consulta, es un espacio de confianza."
        : "Professionals who listen and support you. It's not just a consultation, it's a space of trust.",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: Zap,
      title: isSpanish ? "Sin complicaciones" : "No complications",
      description: isSpanish
        ? "Agenda en menos de 30 segundos. Sin formularios largos ni pasos innecesarios. Simple y directo."
        : "Book in less than 30 seconds. No long forms or unnecessary steps. Simple and direct.",
      color: "bg-secondary/10 text-secondary",
    },
    {
      icon: ShieldCheck,
      title: isSpanish ? "Seguro y privado" : "Secure and private",
      description: isSpanish
        ? "Tus datos de salud están protegidos. Comunicación encriptada y profesionales verificados."
        : "Your health data is protected. Encrypted communication and verified professionals.",
      color: "bg-accent/40 text-accent-foreground",
    },
    {
      icon: Clock,
      title: isSpanish ? "Cuando lo necesites" : "When you need it",
      description: isSpanish
        ? "Consulta online o presencial. Elige el horario que mejor te convenga, sin esperas innecesarias."
        : "Online or in-person consultation. Choose the time that works best for you, without unnecessary waits.",
      color: "bg-muted text-muted-foreground",
    },
  ]

  return (
    <section className="py-16 md:py-20 px-6 bg-transparent relative" id="benefits">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[450px_1fr] gap-12 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6 pl-6 md:pl-8"
          >
            <p className="text-primary font-bold text-sm uppercase tracking-[0.2em]">
              {isSpanish ? "Por qué elegir NUREA" : "Why choose NUREA"}
            </p>
            <h2 className="text-4xl lg:text-5xl text-foreground font-bold leading-[1.1] tracking-tight">
              {isSpanish
                ? "Atención de salud que se siente <span class='text-primary italic'>humana</span>"
                : "Healthcare that feels <span class='text-primary italic'>human</span>"}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {isSpanish
                ? "En NUREA creemos que buscar atención de salud no debería ser complicado. Por eso diseñamos una experiencia simple, segura y centrada en ti."
                : "At NUREA we believe that seeking healthcare shouldn't be complicated. That's why we designed a simple, secure experience centered on you."}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 pl-6 md:pl-8">
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
      </div>
    </section>
  )
}

