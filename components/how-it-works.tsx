"use client"

import { Search, CalendarCheck, Video } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { motion } from "framer-motion"

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
}

type Step = {
  icon: typeof Search
  step: string
  title: string
  description: string
}

export function HowItWorks() {
  const { language } = useLanguage()
  const isEs = language === "es"

  const steps: Step[] = [
    {
      icon: Search,
      step: isEs ? "Paso 1" : "Step 1",
      title: isEs ? "Busca tu especialista" : "Find your specialist",
      description: isEs 
        ? "Elige entre cientos de profesionales de salud verificados. Filtra por especialidad, ubicación y disponibilidad."
        : "Choose from hundreds of verified health professionals. Filter by specialty, location, and availability.",
    },
    {
      icon: CalendarCheck,
      step: isEs ? "Paso 2" : "Step 2",
      title: isEs ? "Agenda tu cita" : "Book your appointment",
      description: isEs 
        ? "Selecciona el día y hora que mejor te acomode. Recibirás confirmación inmediata por correo."
        : "Select the day and time that works best for you. You'll receive instant confirmation by email.",
    },
    {
      icon: Video,
      step: isEs ? "Paso 3" : "Step 3",
      title: isEs ? "Asiste a tu consulta" : "Attend your consultation",
      description: isEs 
        ? "Conéctate desde cualquier lugar o asiste presencialmente. Tu salud, a tu manera."
        : "Connect from anywhere or attend in person. Your health, your way.",
    },
  ]

  return (
    <section 
      id="how-it-works"
      className="py-20 md:py-28 px-4 sm:px-6 relative overflow-hidden bg-transparent" 
      aria-labelledby="how-it-works-heading"
    >
      
      <div className="max-w-6xl mx-auto w-full relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center space-y-4 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <h2
            id="how-it-works-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900"
          >
            {isEs ? "Cómo funciona" : "How it works"}
          </h2>
          <p className="text-gray-800/70 text-lg max-w-2xl mx-auto">
            {isEs 
              ? "Agendar tu cita médica nunca fue tan fácil. Solo 3 pasos."
              : "Booking your medical appointment has never been easier. Just 3 steps."
            }
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          {steps.map((step, idx) => (
            <motion.div 
              key={idx} 
              className="relative text-center"
              variants={fadeInUp}
            >
              {/* Connector line (only between cards on desktop) */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-white/30" />
              )}
              
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg shadow-black/5 border border-white/50">
                {/* Step number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
                  {step.step}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-6 mt-2">
                  <step.icon className="h-8 w-8" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
