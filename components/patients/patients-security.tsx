"use client"

import { Shield, Lock, Eye, FileCheck } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

export function PatientsSecurity() {
  const { language } = useLanguage()
  const isSpanish = language === "es"

  const securityFeatures = [
    {
      icon: Lock,
      title: isSpanish ? "Datos encriptados" : "Encrypted data",
      description: isSpanish
        ? "Toda tu información está protegida con encriptación de nivel bancario."
        : "All your information is protected with bank-level encryption.",
    },
    {
      icon: Eye,
      title: isSpanish ? "Privacidad garantizada" : "Privacy guaranteed",
      description: isSpanish
        ? "Solo tú y tu profesional pueden ver tus mensajes y documentos. Nadie más."
        : "Only you and your professional can see your messages and documents. No one else.",
    },
    {
      icon: FileCheck,
      title: isSpanish ? "Profesionales verificados" : "Verified professionals",
      description: isSpanish
        ? "Todos los profesionales en NUREA están verificados y tienen registro profesional válido."
        : "All professionals on NUREA are verified and have valid professional registration.",
    },
    {
      icon: Shield,
      title: isSpanish ? "Cumplimiento legal" : "Legal compliance",
      description: isSpanish
        ? "Cumplimos con la Ley de Protección de Datos de Chile. Tu información está segura."
        : "We comply with Chile's Data Protection Law. Your information is safe.",
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
            {isSpanish ? "Tu seguridad es nuestra prioridad" : "Your security is our priority"}
          </p>
          <h2 className="text-4xl lg:text-5xl text-foreground font-bold tracking-tight">
            {isSpanish ? "Seguro y privado" : "Secure and private"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isSpanish
              ? "En NUREA protegemos tu información de salud con los más altos estándares de seguridad. Te explicamos cómo, en lenguaje simple."
              : "At NUREA we protect your health information with the highest security standards. We explain how, in simple language."}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {securityFeatures.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <Card className="border-border/40 h-full hover:shadow-lg transition-all">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
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
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground">
            {isSpanish
              ? "¿Quieres saber más sobre cómo protegemos tus datos? "
              : "Want to know more about how we protect your data? "}
            <a href="/legal/privacy" className="text-primary hover:underline font-medium">
              {isSpanish ? "Lee nuestra Política de Privacidad" : "Read our Privacy Policy"}
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}

