"use client"

import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  UserCheck, 
  CreditCard, 
  Share2, 
  Download, 
  MessageCircle,
  ChevronRight,
  CheckCircle2,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { WelcomeGuidePDF } from './welcome-guide-pdf'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface ProfessionalWelcomeGuideProps {
  doctorName: string
  slug: string
}

export function ProfessionalWelcomeGuide({ doctorName, slug }: ProfessionalWelcomeGuideProps) {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  const steps = [
    {
      title: "Completar Perfil",
      description: "Define tu biografía y especialidad para destacar en el buscador.",
      icon: UserCheck,
      color: "bg-teal-50 text-teal-600",
      link: "/dashboard/professional/settings",
      action: "Ir a Ajustes"
    },
    {
      title: "Abrir Agenda",
      description: "Configura tus bloques horarios para recibir agendamientos.",
      icon: Calendar,
      color: "bg-blue-50 text-blue-600",
      link: "/dashboard/professional/availability",
      action: "Configurar Horas"
    },
    {
      title: "Configurar Pagos",
      description: "Activa tu suscripción en Planes para acceder a agenda y pacientes.",
      icon: CreditCard,
      color: "bg-slate-50 text-slate-800",
      link: "/dashboard/professional/payouts",
      action: "Vincular Cuenta"
    },
    {
      title: "Compartir Perfil",
      description: "Usa tu URL personalizada para captar pacientes externos.",
      icon: Share2,
      color: "bg-purple-50 text-purple-600",
      link: `/professionals/${slug}`,
      action: "Ver Mi Perfil"
    }
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-8 px-4">
      {/* Cabecera Premium */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            ¡Bienvenido a la élite de la salud digital, <span className="text-teal-600">Dr/a. {doctorName}</span>!
          </h1>
          <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto mt-4">
            Has completado tu verificación. Ahora sigamos estos pasos para asegurar tu éxito en la plataforma.
          </p>
        </motion.div>
      </div>

      {/* Grid de Checklist (Infografía) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full group hover:shadow-xl hover:border-teal-500/30 transition-all duration-300 overflow-hidden border-slate-100 flex flex-col">
              <div className="p-8 flex-1">
                <div className={cn("inline-flex p-3 rounded-2xl mb-6 transition-transform group-hover:scale-110 duration-300", step.color)}>
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed mb-6 font-medium">
                  {step.description}
                </p>
              </div>
              <div className="px-8 pb-8">
                <Link href={step.link}>
                  <Button variant="ghost" className="w-full justify-between hover:bg-slate-50 group-hover:text-teal-600 font-bold border border-slate-100 h-12 rounded-xl">
                    {step.action}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Acción Principal: Descarga */}
      <div className="flex flex-col items-center gap-6 pt-8">
        {isClient ? (
          <PDFDownloadLink
            document={<WelcomeGuidePDF doctorName={doctorName} slug={slug} />}
            fileName={`NUREA_Guia_Exito_${doctorName.replace(/\s+/g, '_')}.pdf`}
          >
            {({ loading }) => (
              <Button 
                disabled={loading}
                className="bg-slate-900 hover:bg-slate-800 text-white px-10 h-14 rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 transition-all active:scale-95"
              >
                <Download className="mr-3 h-5 w-5" />
                {loading ? "Generando Guía..." : "Descargar Guía en PDF"}
              </Button>
            )}
          </PDFDownloadLink>
        ) : (
          <Button disabled className="bg-slate-900 text-white px-10 h-14 rounded-2xl font-bold text-lg opacity-50">
            <Download className="mr-3 h-5 w-5" />
            Cargando Guía...
          </Button>
        )}
        <p className="text-slate-400 text-sm font-medium">Recomendado para imprimir y tener en tu consulta física.</p>
      </div>

      {/* Bloque de Soporte WhatsApp */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-12 p-8 bg-teal-50/50 rounded-3xl border border-teal-100 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-5">
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <MessageCircle className="h-8 w-8 text-teal-600" />
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-xl font-bold text-slate-900">¿Necesitas ayuda personalizada?</h4>
            <p className="text-slate-500 font-medium">Tu ejecutivo de cuenta está disponible vía WhatsApp para asistirte.</p>
          </div>
        </div>
        <a 
          href="https://wa.me/56912345678" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <Button className="bg-teal-600 hover:bg-teal-700 text-white h-12 px-8 rounded-xl font-bold shadow-lg shadow-teal-600/20">
            Contactar Soporte
          </Button>
        </a>
      </motion.div>

      {/* Footer Branding */}
      <div className="text-center pb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <CheckCircle2 className="h-3 w-3 text-teal-600" />
          Partner Oficial NUREA Health
        </div>
      </div>
    </div>
  )
}
