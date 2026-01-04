"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Facebook, Instagram, Linkedin, Twitter, Heart } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import Link from "next/link"

export function StackedCircularFooter() {
  const { language } = useLanguage()
  const t = useTranslations(language)

  const footerLinks = [
    { title: language === "es" ? "Buscar Profesionales" : "Find Professionals", href: "/search" },
    { title: language === "es" ? "Agendar Cita" : "Book Appointment", href: "/dashboard/appointments" },
    { title: language === "es" ? "Cómo Funciona" : "How It Works", href: "#how-it-works" },
    { title: language === "es" ? "Únete a NUREA" : "Join NUREA", href: "/signup" },
    { title: language === "es" ? "Planes de Precios" : "Pricing Plans", href: "#pricing" },
    { title: language === "es" ? "Política de Privacidad" : "Privacy Policy", href: "/legal/privacy" },
    { title: language === "es" ? "Términos de Servicio" : "Terms of Service", href: "/legal/terms" },
  ]

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ]

  return (
    <footer className="bg-background py-12 border-t border-border/40">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center">
          <div className="mb-8 rounded-full bg-primary/10 p-8">
            <Heart className="w-6 h-6 text-primary" />
          </div>
          <nav className="mb-8 flex flex-wrap justify-center gap-6">
            {footerLinks.map((link, index) => (
              <Link
                key={`${link.href}-${link.title}-${index}`}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {link.title}
              </Link>
            ))}
          </nav>
          <div className="mb-8 flex space-x-4">
            {socialLinks.map((social) => (
              <Button
                key={social.label}
                variant="outline"
                size="icon"
                className="rounded-full border-teal-200/30 dark:border-teal-800/30 hover:border-teal-400 dark:hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950/20"
                asChild
              >
                <a href={social.href} aria-label={social.label}>
                  <social.icon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span className="sr-only">{social.label}</span>
                </a>
              </Button>
            ))}
          </div>
          <div className="mb-8 w-full max-w-md">
            <form className="flex space-x-2">
              <div className="flex-grow">
                <Label htmlFor="email" className="sr-only">
                  {language === "es" ? "Correo electrónico" : "Email"}
                </Label>
                <Input
                  id="email"
                  placeholder={language === "es" ? "Ingresa tu correo" : "Enter your email"}
                  type="email"
                  className="rounded-full border-teal-200/30 dark:border-teal-800/30 focus:border-teal-400 dark:focus:border-teal-500"
                />
              </div>
              <Button type="submit" className="rounded-full bg-primary hover:bg-primary/90">
                {language === "es" ? "Suscribirse" : "Subscribe"}
              </Button>
            </form>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {t.footer.copyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

