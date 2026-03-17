"use client"

import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/contexts/language-context"

export function Footer() {
  const { language } = useLanguage()
  const isSpanish = language === "es"

  return (
    <footer
      className="relative z-10 border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80 shrink-0"
      role="contentinfo"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Logo + tagline */}
          <div className="flex flex-col gap-1 sm:gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 w-fit shrink-0 rounded-lg opacity-95 hover:opacity-100 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              <Image
                src="/logo.png"
                alt="NUREA"
                width={28}
                height={28}
                className="h-7 w-7 rounded-lg object-contain"
              />
              <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                NUREA
              </span>
            </Link>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs">
              {isSpanish
                ? "Ley de Derechos y Deberes del Paciente."
                : "Patient Rights and Duties Law."}
            </p>
          </div>

          {/* Nav links */}
          <nav
            className="flex flex-wrap gap-x-6 gap-y-1 sm:gap-x-8"
            aria-label={isSpanish ? "Enlaces del sitio" : "Site links"}
          >
            <Link
              href="/legal/terms"
              className="text-sm font-medium text-slate-600 hover:text-teal-600 dark:text-slate-300 dark:hover:text-teal-400 transition-colors"
            >
              {isSpanish ? "Términos" : "Terms"}
            </Link>
            <Link
              href="/legal/privacy"
              className="text-sm font-medium text-slate-600 hover:text-teal-600 dark:text-slate-300 dark:hover:text-teal-400 transition-colors"
            >
              {isSpanish ? "Privacidad" : "Privacy"}
            </Link>
            <Link
              href="/support#faq"
              className="text-sm font-medium text-slate-600 hover:text-teal-600 dark:text-slate-300 dark:hover:text-teal-400 transition-colors"
            >
              FAQ
            </Link>
            <a
              href="mailto:contacto@nurea.cl"
              className="text-sm font-medium text-slate-600 hover:text-teal-600 dark:text-slate-300 dark:hover:text-teal-400 transition-colors"
            >
              Contacto
            </a>
          </nav>
        </div>

        {/* Copyright: contraste claro para que se lea bien */}
        <p className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400">
          © {new Date().getFullYear()} NUREA.{" "}
          {isSpanish ? "Todos los derechos reservados." : "All rights reserved."}
        </p>
      </div>
    </footer>
  )
}
