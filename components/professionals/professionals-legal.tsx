"use client"

import { Shield, FileText, CheckCircle2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export function ProfessionalsLegal() {
  const { language } = useLanguage()
  const isSpanish = language === "es"

  const legalPoints = [
    {
      icon: Shield,
      title: isSpanish ? "Intermediario tecnológico" : "Technology intermediary",
      description: isSpanish
        ? "NUREA facilita la conexión entre pacientes y profesionales. No prestamos servicios médicos ni intervenimos en la atención clínica."
        : "NUREA facilitates the connection between patients and professionals. We do not provide medical services or intervene in clinical care.",
    },
    {
      icon: FileText,
      title: isSpanish ? "Responsabilidad clara" : "Clear responsibility",
      description: isSpanish
        ? "Tú eres responsable de la atención médica que brindas. NUREA es responsable de la plataforma tecnológica y la gestión de pagos."
        : "You are responsible for the medical care you provide. NUREA is responsible for the technology platform and payment management.",
    },
    {
      icon: CheckCircle2,
      title: isSpanish ? "Cumplimiento legal" : "Legal compliance",
      description: isSpanish
        ? "Cumplimos con todas las regulaciones de protección de datos en Chile. Tu información y la de tus pacientes está protegida."
        : "We comply with all data protection regulations in Chile. Your information and that of your patients is protected.",
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
          <p className="text-primary font-bold text-sm uppercase tracking-widest">
            {isSpanish ? "Transparencia y confianza" : "Transparency and trust"}
          </p>
          <h2 className="text-4xl lg:text-5xl text-foreground font-bold tracking-tight">
            {isSpanish ? "NUREA como intermediario" : "NUREA as intermediary"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isSpanish
              ? "Queremos ser claros sobre nuestro rol. Esto es importante para ti y para tus pacientes."
              : "We want to be clear about our role. This is important for you and your patients."}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {legalPoints.map((point, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <Card className="border-border/40 h-full hover:shadow-lg transition-all">
                <CardContent className="p-6 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <point.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">{point.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{point.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center space-y-2"
        >
          <p className="text-sm text-muted-foreground">
            {isSpanish
              ? "¿Quieres conocer más detalles? "
              : "Want to know more details? "}
            <Link href="/legal/terms" className="text-primary hover:underline font-medium">
              {isSpanish ? "Lee nuestros Términos y Condiciones" : "Read our Terms and Conditions"}
            </Link>
            {" "}
            {isSpanish ? "y " : "and "}
            <Link href="/legal/privacy" className="text-primary hover:underline font-medium">
              {isSpanish ? "Política de Privacidad" : "Privacy Policy"}
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  )
}

