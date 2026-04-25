"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, ArrowRight, Shield, ShieldCheck, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100 }
  }
}

export default function PricingPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const [isYearly, setIsYearly] = useState(false)

  const plans = [
    {
      name: isSpanish ? "Profesional" : "Professional",
      price: isYearly ? "186.000" : "25.000",
      description: isSpanish ? "Para profesionales establecidos" : "For established professionals",
      features: [
        isSpanish ? "Reservas ilimitadas de pacientes" : "Unlimited patient bookings",
        isSpanish ? "Visibilidad de perfil en búsqueda" : "Profile visibility in search",
        isSpanish ? "Gestión de calendario de citas" : "Appointment calendar management",
        isSpanish ? "Sistema de reseñas y calificaciones" : "Review and rating system",
        isSpanish ? "Procesamiento de pagos" : "Payment processing",
        isSpanish ? "Panel de análisis" : "Analytics dashboard",
      ],
      cta: isSpanish ? "Comenzar" : "Get Started",
      popular: true,
      id: "professional",
      badge: isSpanish ? "Más Popular" : "Most Popular"
    },
    {
      name: isSpanish ? "Recién Graduado" : "Recent Graduate",
      price: isYearly ? "111.600" : "15.000",
      description: isSpanish ? "Bajo revisión para nuevos profesionales" : "Under review for new professionals",
      features: [
        isSpanish ? "Todo en Profesional" : "Everything in Professional",
        isSpanish ? "Sujeto a aprobación por administración" : "Subject to admin approval",
        isSpanish ? "Posibilidad de hasta 3 meses gratis" : "Possibility of up to 3 months free",
        isSpanish ? "Soporte de incorporación prioritario" : "Priority onboarding support",
        isSpanish ? "Asistencia de marketing" : "Marketing assistance",
        isSpanish ? "Panel de análisis" : "Analytics dashboard",
      ],
      cta: isSpanish ? "Solicitar Acceso" : "Request Access",
      popular: false,
      id: "graduate",
      badge: isSpanish ? "SOLICITAR" : "REQUEST"
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 selection:bg-teal-100 selection:text-teal-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-teal-50 dark:bg-teal-950/20 rounded-full blur-[120px] opacity-60" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-blue-50 dark:bg-blue-950/20 rounded-full blur-[100px] opacity-40" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-20">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-4xl mx-auto mb-20"
        >
          <Badge className="bg-teal-50 text-teal-700 border-teal-200 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            {isSpanish ? "Modelo Marketplace 2.0" : "Marketplace Model 2.0"}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {isSpanish ? "Tu trabajo es tuyo." : "Your work is yours."} <br className="hidden md:block" />
            <span className="text-teal-600 dark:text-teal-400">
              {isSpanish ? "NUREA cobra $0 comisiones" : "NUREA charges $0 commission"}
            </span> {isSpanish ? "por tus citas." : "on your appointments."}
          </h1>

          {/* Monthly/Yearly Toggle Styled like the image */}
          <div className="flex items-center justify-center pt-8">
            <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex items-center gap-1 shadow-inner">
              <button
                onClick={() => setIsYearly(false)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                  !isYearly 
                    ? "bg-teal-600 text-white shadow-md scale-[1.02]" 
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                {isSpanish ? "Facturación Mensual" : "Monthly Billing"}
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                  isYearly 
                    ? "bg-teal-600 text-white shadow-md scale-[1.02]" 
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                {isSpanish ? "Facturación Anual" : "Yearly Billing"}
                <Badge variant="outline" className="text-[10px] bg-teal-100 text-teal-700 border-teal-200 py-0 px-1.5">
                  {isSpanish ? "Ahorra 38%" : "Save 38%"}
                </Badge>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
        >
          {plans.map((plan) => (
            <motion.div key={plan.id} variants={itemVariants}>
              <Card className={cn(
                "relative h-full transition-all duration-300 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl rounded-3xl",
                plan.id === "professional" && "border-teal-100/50"
              )}>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-3xl font-bold flex items-center gap-2">
                        {plan.id === "graduate" && <Stethoscope className="h-6 w-6 text-slate-400" />}
                        {plan.name}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{plan.description}</p>
                    </div>
                    {plan.badge && (
                      <Badge className={cn(
                        "rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-wider",
                        plan.id === "professional" ? "bg-teal-600 text-white" : "bg-teal-600 text-white"
                      )}>
                        {plan.badge}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-5xl font-extrabold tracking-tight">${plan.price}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">/ {isYearly ? (isSpanish ? "año" : "year") : (isSpanish ? "mes" : "mo")}</span>
                  </div>

                  <Button 
                    asChild
                    className={cn(
                      "w-full h-14 rounded-2xl text-lg font-bold transition-all hover:scale-[1.02] bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-100 dark:shadow-teal-950/10 mb-10"
                    )}
                  >
                    <Link href="/register">
                      {plan.cta}
                    </Link>
                  </Button>

                  <div className="space-y-6">
                    <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">
                      {isSpanish ? "CARACTERÍSTICAS" : "FEATURES"}
                    </p>
                    <ul className="space-y-4">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                          <div className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Zero Commission Reinforcement */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 max-w-5xl mx-auto"
        >
          <div className="bg-slate-900 dark:bg-slate-800 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1 space-y-6 text-center md:text-left">
                <Badge className="bg-teal-500 text-white border-0 px-4 py-1">
                  {isSpanish ? "Compromiso NUREA" : "NUREA Commitment"}
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold">
                  {isSpanish ? "El 100% de lo que cobras es para ti." : "100% of what you charge is yours."}
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed">
                  {isSpanish 
                    ? "Nuestra misión es empoderar a los profesionales de la salud. Eliminamos las comisiones por cita para que tu retorno de inversión sea máximo desde el primer día." 
                    : "Our mission is to empower healthcare professionals. We eliminate appointment commissions so your ROI is maximum from day one."}
                </p>
              </div>
              <div className="w-full md:w-auto flex justify-center">
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10 text-center space-y-2 w-full md:w-64">
                  <p className="text-teal-400 font-bold text-sm uppercase tracking-widest">{isSpanish ? "Comisión" : "Commission"}</p>
                  <p className="text-6xl font-black text-white">$0</p>
                  <p className="text-slate-400 text-xs font-medium">{isSpanish ? "Por cada consulta realizada" : "For every consultation made"}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer info */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 text-center space-y-8"
        >
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="flex items-center gap-2 font-bold text-slate-400"><Shield className="h-8 w-8" /> {isSpanish ? "Escrow Seguro" : "Secure Escrow"}</div>
             <div className="flex items-center gap-2 font-bold text-slate-400"><ShieldCheck className="h-8 w-8" /> {isSpanish ? "Privacidad de Datos" : "Data Privacy"}</div>
          </div>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
            {isSpanish 
              ? "Precios expresados en Pesos Chilenos (CLP). Al facturar anualmente se aplica un descuento del 38% ya incluido en el precio mostrado. NUREA no cobra comisiones transaccionales. El profesional es responsable de las comisiones de procesamiento de Mercado Pago."
              : "Prices expressed in Chilean Pesos (CLP). Yearly billing includes a 38% discount already reflected in the price. NUREA does not charge transaction commissions. The professional is responsible for Mercado Pago processing fees."}
          </p>
        </motion.div>
      </main>
    </div>
  )
}

