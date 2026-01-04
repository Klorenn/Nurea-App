"use client"

import React, { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
  FacebookIcon,
  FrameIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
  Heart,
  Stethoscope,
  Users,
  FileText,
  Building2,
} from "lucide-react"
import { Button } from "./ui/button"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import Link from "next/link"

interface FooterLink {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}
interface FooterLinkGroup {
  label: string
  links: FooterLink[]
}

type StickyFooterProps = React.ComponentProps<"footer">

export function StickyFooter({ className, ...props }: StickyFooterProps) {
  const { language } = useLanguage()
  const t = useTranslations(language)

  const footerLinkGroups: FooterLinkGroup[] = [
    {
      label: language === "es" ? "Para Pacientes" : "For Patients",
      links: [
        { title: language === "es" ? "Buscar Profesionales" : "Find Professionals", href: "/search" },
        { title: language === "es" ? "Agendar Cita" : "Book Appointment", href: "/dashboard/appointments" },
        { title: language === "es" ? "Cómo Funciona" : "How It Works", href: "#how-it-works" },
      ],
    },
    {
      label: language === "es" ? "Para Profesionales" : "For Professionals",
      links: [
        { title: language === "es" ? "Únete a NUREA" : "Join NUREA", href: "/signup" },
        { title: language === "es" ? "Planes de Precios" : "Pricing Plans", href: "#pricing" },
      ],
    },
    {
      label: language === "es" ? "Empresa" : "Company",
      links: [
        { title: language === "es" ? "Política de Privacidad" : "Privacy Policy", href: "#" },
        { title: language === "es" ? "Términos de Servicio" : "Terms of Service", href: "#" },
      ],
    },
  ]

  const socialLinks = [
    { title: "Facebook", href: "#", icon: FacebookIcon },
    { title: "Instagram", href: "#", icon: InstagramIcon },
    { title: "Youtube", href: "#", icon: YoutubeIcon },
    { title: "LinkedIn", href: "#", icon: LinkedinIcon },
  ]

  return (
    <footer
      className={cn("relative h-[720px] w-full", className)}
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      {...props}
    >
      <div className="fixed bottom-0 h-[720px] w-full bg-background">
        <div className="sticky top-[calc(100vh-720px)] h-full overflow-y-auto">
          <div className="relative flex size-full flex-col justify-between gap-5 border-t border-teal-200/20 dark:border-teal-800/30 px-4 py-8 md:px-12 bg-gradient-to-b from-background via-teal-50/5 dark:via-teal-950/5 to-background">
            <div aria-hidden className="absolute inset-0 isolate z-0 contain-strict">
              <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,oklch(0.65_0.15_180/.08)_0,oklch(0.65_0.15_180/.03)_50%,oklch(0.65_0.15_180/.01)_80%)] absolute top-0 left-0 h-320 w-140 -translate-y-87.5 -rotate-45 rounded-full" />
              <div className="bg-[radial-gradient(50%_50%_at_50%_50%,oklch(0.65_0.15_180/.06)_0,oklch(0.65_0.15_180/.02)_80%,transparent_100%)] absolute top-0 left-0 h-320 w-60 [translate:5%_-50%] -rotate-45 rounded-full" />
              <div className="bg-[radial-gradient(50%_50%_at_50%_50%,oklch(0.65_0.15_180/.06)_0,oklch(0.65_0.15_180/.02)_80%,transparent_100%)] absolute top-0 left-0 h-320 w-60 -translate-y-87.5 -rotate-45 rounded-full" />
            </div>
            <div className="mt-10 flex flex-col gap-8 md:flex-row xl:mt-0 relative z-10">
              <AnimatedContainer className="w-full max-w-sm min-w-2xs space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 dark:bg-teal-500 flex items-center justify-center">
                    <Heart className="size-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">NUREA</span>
                </div>
                <p className="text-muted-foreground mt-8 text-sm md:mt-0 leading-relaxed">
                  {t.footer.tagline}
                </p>
                <div className="flex gap-2">
                  {socialLinks.map((link) => (
                    <Button
                      key={link.title}
                      size="icon"
                      variant="outline"
                      className="size-8 border-teal-200/30 dark:border-teal-800/30 hover:border-teal-400 dark:hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950/20"
                      asChild
                    >
                      <a href={link.href} aria-label={link.title}>
                        <link.icon className="size-4 text-teal-600 dark:text-teal-400" />
                      </a>
                    </Button>
                  ))}
                </div>
              </AnimatedContainer>
              {footerLinkGroups.map((group, index) => (
                <AnimatedContainer
                  key={group.label}
                  delay={0.1 + index * 0.1}
                  className="w-full md:max-w-[200px]"
                >
                  <div className="mb-10 md:mb-0">
                    <h3 className="text-sm font-bold uppercase text-teal-700 dark:text-teal-300 mb-4">
                      {group.label}
                    </h3>
                    <ul className="text-muted-foreground space-y-2 text-sm">
                      {group.links.map((link) => (
                        <li key={link.title}>
                          <Link
                            href={link.href}
                            className="hover:text-teal-600 dark:hover:text-teal-400 inline-flex items-center transition-all duration-300 group"
                          >
                            {link.icon && (
                              <link.icon className="me-1 size-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                            <span>{link.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedContainer>
              ))}
            </div>
            <div className="text-muted-foreground flex flex-col items-center justify-between gap-2 border-t border-teal-200/20 dark:border-teal-800/30 pt-6 text-sm md:flex-row relative z-10">
              <p>{t.footer.copyright}</p>
              <p className="text-teal-600 dark:text-teal-400 font-medium">{t.footer.madeWithCare}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

type AnimatedContainerProps = React.ComponentProps<typeof motion.div> & {
  children?: React.ReactNode
  delay?: number
}

function AnimatedContainer({ delay = 0.1, children, ...props }: AnimatedContainerProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
      setPrefersReducedMotion(mediaQuery.matches)

      const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  if (prefersReducedMotion) {
    return <div {...props}>{children}</div>
  }

  return (
    <motion.div
      initial={{ filter: "blur(4px)", translateY: -8, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

