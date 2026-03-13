"use client"

import { Instagram, Linkedin, Twitter } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"
import Image from "next/image"

export function StackedCircularFooter() {
  const { language } = useLanguage()
  const isEs = language === "es"

  const patientLinks = [
    { title: isEs ? "Directorio Médico" : "Medical Directory", href: "/explore" },
    { title: isEs ? "Telemedicina 24/7" : "Telemedicine 24/7", href: "/telemedicine" },
    { title: isEs ? "Mi Historial Clínico" : "My Medical History", href: "/dashboard/patient/records" },
    { title: isEs ? "Precios y Cobertura" : "Pricing & Coverage", href: "#pricing" },
    { title: isEs ? "Preguntas Frecuentes" : "FAQ", href: "/support#faq" },
  ]

  const professionalLinks = [
    { title: isEs ? "Únete a la Red" : "Join the Network", href: "/auth/register?role=professional" },
    { title: isEs ? "Software de Gestión (HCE)" : "Management Software (EHR)", href: "/professional/dashboard" },
    { title: isEs ? "Tarifas y Pagos" : "Fees & Payments", href: "/professional/billing" },
    { title: isEs ? "Centro de Recursos" : "Resource Center", href: "/professional/resources" },
  ]

  const legalLinks = [
    { title: isEs ? "Términos de Servicio" : "Terms of Service", href: "/legal/terms" },
    { title: isEs ? "Aviso de Privacidad" : "Privacy Notice", href: "/legal/privacy" },
    { title: isEs ? "Consentimiento Informado" : "Informed Consent", href: "/legal/consent" },
    { title: isEs ? "Cumplimiento HIPAA / Ley 19.628" : "HIPAA / Law 19.628 Compliance", href: "/legal/compliance" },
  ]

  const supportLinks = [
    { title: isEs ? "Centro de Ayuda" : "Help Center", href: "/support" },
    { title: isEs ? "Contactar Soporte" : "Contact Support", href: "/support/contact" },
  ]

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com/nureaapp", label: "Instagram" },
    { icon: Linkedin, href: "https://linkedin.com/company/nurea", label: "LinkedIn" },
    { icon: Twitter, href: "https://x.com/nureaapp", label: "X" },
  ]

  return (
    <footer className="bg-slate-950">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          
          {/* Column 0: Brand (wider) */}
          <div className="lg:col-span-1 space-y-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/logo.png"
                alt="NUREA"
                width={40}
                height={40}
                className="h-10 w-10 rounded-xl object-contain"
              />
              <div>
                <span className="text-xl font-bold text-white">NUREA</span>
                <span className="text-slate-500">.app</span>
              </div>
            </Link>
            
            <p className="text-slate-400 text-sm leading-relaxed">
              {isEs 
                ? "Transformando el acceso a la salud en Latinoamérica. Conectamos pacientes con especialistas verificados mediante tecnología segura, eliminando barreras y burocracia."
                : "Transforming healthcare access in Latin America. We connect patients with verified specialists through secure technology, eliminating barriers and bureaucracy."
              }
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-slate-800 flex items-center justify-center text-slate-400 hover:text-teal-400 hover:border-teal-400/50 hover:bg-teal-400/10 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 1: Patients */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-50 uppercase tracking-wider">
              {isEs ? "Pacientes" : "Patients"}
            </h3>
            <ul className="space-y-3">
              {patientLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-teal-400 transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Professionals */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-50 uppercase tracking-wider">
              {isEs ? "Profesionales" : "Professionals"}
            </h3>
            <ul className="space-y-3">
              {professionalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-teal-400 transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal & Security */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-50 uppercase tracking-wider">
              {isEs ? "Legal & Seguridad" : "Legal & Security"}
            </h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-teal-400 transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Support */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-50 uppercase tracking-wider">
              {isEs ? "Soporte" : "Support"}
            </h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-teal-400 transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
              {/* System Status with green indicator */}
              <li>
                <Link
                  href="/status"
                  className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-teal-400 transition-colors"
                >
                  {isEs ? "Estado del Sistema" : "System Status"}
                  <span className="inline-flex items-center gap-1.5 text-xs text-green-400">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    {isEs ? "Operativo" : "Operational"}
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sub-footer / Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} NUREA. {isEs ? "Todos los derechos reservados." : "All rights reserved."}
            </p>
            
            <p className="text-sm text-slate-500">
              {isEs ? "Diseñado con" : "Designed with"} <span className="text-teal-400">🩵</span> {isEs ? "para la salud del futuro." : "for the future of healthcare."}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
