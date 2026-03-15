"use client"

import Link from "next/link"
import Image from "next/image"
import { Globe, Twitter, Linkedin, Instagram, Github, Mail, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com/nuaborea", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com/company/nurea", label: "LinkedIn" },
  { icon: Instagram, href: "https://instagram.com/nurea.app", label: "Instagram" },
  { icon: Github, href: "https://github.com/nurea-health", label: "GitHub" },
]

export function Footer() {
  const { language, setLanguage } = useLanguage()
  const t = useTranslations(language)
  const isSpanish = language === "es"

  const footerLinks = {
    patients: [
      { href: "/explore", label: isSpanish ? "Buscar Especialistas" : "Find Specialists" },
      { href: "/dashboard/appointments", label: isSpanish ? "Mis Citas" : "My Appointments" },
      { href: "/pacientes/info", label: isSpanish ? "Cómo Funciona" : "How It Works" },
      { href: "/support", label: isSpanish ? "Centro de Ayuda" : "Help Center" },
    ],
    professionals: [
      { href: "/auth/register?role=professional", label: isSpanish ? "Únete a NUREA" : "Join NUREA" },
      { href: "/profesionales/info", label: isSpanish ? "Beneficios" : "Benefits" },
      { href: "/#pricing", label: isSpanish ? "Planes y Precios" : "Pricing Plans" },
      { href: "/professional/referrals", label: isSpanish ? "Programa de Referidos" : "Referral Program" },
    ],
    company: [
      { href: "/about", label: isSpanish ? "Sobre Nosotros" : "About Us" },
      { href: "/blog", label: "Blog" },
      { href: "/careers", label: isSpanish ? "Trabaja con Nosotros" : "Careers" },
      { href: "mailto:contacto@nurea.app", label: isSpanish ? "Contacto" : "Contact", external: true },
    ],
    legal: [
      { href: "/legal/terminos", label: isSpanish ? "Términos de Servicio" : "Terms of Service" },
      { href: "/legal/privacidad", label: isSpanish ? "Aviso de Privacidad" : "Privacy Policy" },
      { href: "/legal/cumplimiento", label: isSpanish ? "Cumplimiento Legal" : "Legal Compliance" },
      { href: "/legal/consentimiento", label: isSpanish ? "Consentimiento Telemedicina" : "Telemedicine Consent" },
    ],
  }

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="sm:col-span-2 md:col-span-4 lg:col-span-1 space-y-6">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="NUREA"
                width={36}
                height={36}
                className="h-9 w-9 rounded-lg"
              />
              <span className="text-xl font-bold text-white tracking-tight">NUREA</span>
            </Link>
            
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              {isSpanish 
                ? "Conectamos pacientes con profesionales de salud verificados. Atención médica que se siente humana."
                : "Connecting patients with verified healthcare professionals. Healthcare that feels human."}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-lg",
                    "border border-slate-700 text-slate-400",
                    "hover:border-teal-500 hover:text-teal-400",
                    "transition-colors duration-200"
                  )}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600"
                >
                  <Globe className="h-4 w-4" />
                  {language === "es" ? "Español" : "English"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-slate-900 border-slate-700">
                <DropdownMenuItem 
                  onClick={() => setLanguage("es")}
                  className="text-slate-300 focus:bg-slate-800 focus:text-white"
                >
                  🇨🇱 Español
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage("en")}
                  className="text-slate-300 focus:bg-slate-800 focus:text-white"
                >
                  🇺🇸 English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Patients Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
              {isSpanish ? "Pacientes" : "Patients"}
            </h4>
            <ul className="space-y-3">
              {footerLinks.patients.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-teal-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Professionals Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
              {isSpanish ? "Profesionales" : "Professionals"}
            </h4>
            <ul className="space-y-3">
              {footerLinks.professionals.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-teal-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
              {isSpanish ? "Compañía" : "Company"}
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a 
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-teal-400 transition-colors duration-200 inline-flex items-center gap-1"
                    >
                      {link.label}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <Link 
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-teal-400 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
              {isSpanish ? "Legal" : "Legal"}
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-teal-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} NUREA SpA. {isSpanish ? "Todos los derechos reservados." : "All rights reserved."}
            </p>

            {/* System Status */}
            <div className="flex items-center gap-6">
              <a 
                href="https://status.nurea.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                {isSpanish ? "Estado del Sistema" : "System Status"}
              </a>

              <p className="text-xs text-slate-600">
                {isSpanish ? "Hecho con" : "Made with"} 💚 {isSpanish ? "en Chile" : "in Chile"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
