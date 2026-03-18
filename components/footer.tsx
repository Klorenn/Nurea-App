"use client"

import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/contexts/language-context"

export function Footer() {
  const { language } = useLanguage()
  const isSpanish = language === "es"

  return (
    <footer
      className="relative z-10 border-t border-slate-200 bg-slate-50/90 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80 shrink-0"
      role="contentinfo"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Logo + tagline */}
          <div className="flex flex-col gap-2">
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
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm">
              {isSpanish
                ? "Plataforma de salud digital que conecta pacientes con profesionales verificados y agendamiento 100% en línea."
                : "Digital health platform connecting patients with verified professionals and fully online booking."}
            </p>
          </div>

          {/* Columns */}
          <div className="grid grid-cols-2 gap-6 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-3">
            {/* Legal */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {isSpanish ? "Legal" : "Legal"}
              </p>
              <div className="flex flex-col gap-1.5">
                <Link
                  href="/legal/terms"
                  className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  {isSpanish ? "Términos y condiciones" : "Terms & conditions"}
                </Link>
                <Link
                  href="/legal/privacy"
                  className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  {isSpanish ? "Política de privacidad" : "Privacy policy"}
                </Link>
                <Link
                  href="/support#faq"
                  className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  FAQ
                </Link>
              </div>
            </div>

            {/* Para pacientes */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {isSpanish ? "Para pacientes" : "For patients"}
              </p>
              <div className="flex flex-col gap-1.5">
                <Link
                  href="/paciente/buscar"
                  className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  {isSpanish ? "Buscar especialista" : "Find specialist"}
                </Link>
                <Link
                  href="/paciente/citas"
                  className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  {isSpanish ? "Mis citas" : "My appointments"}
                </Link>
              </div>
            </div>

            {/* Para profesionales */}
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {isSpanish ? "Para profesionales" : "For professionals"}
              </p>
              <div className="flex flex-col gap-1.5">
                <Link
                  href="/profesionales"
                  className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  {isSpanish ? "Cómo funciona NUREA" : "How NUREA works"}
                </Link>
                <a
                  href="mailto:contacto@nurea.cl"
                  className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  {isSpanish ? "Habla con nuestro equipo" : "Talk to our team"}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            © {new Date().getFullYear()} NUREA.{" "}
            {isSpanish ? "Todos los derechos reservados." : "All rights reserved."}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            {isSpanish
              ? "NUREA no reemplaza una urgencia médica. En caso de emergencia, acude al servicio de urgencias más cercano."
              : "NUREA does not replace emergency care. In an emergency, contact your local emergency services."}
          </p>
        </div>
      </div>
    </footer>
  )
}
