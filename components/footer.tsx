"use client"

import Link from "next/link"
import Image from "next/image"
import { ShieldCheck } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          
          {/* Logo & Badge Area */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
              <Image
                src="/logo.png"
                alt="NUREA"
                width={32}
                height={32}
                className="h-8 w-8 rounded-lg grayscale invert brightness-200"
              />
              <span className="text-xl font-bold tracking-tight text-white">NUREA</span>
            </Link>
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-500" />
              Plataforma conforme a la Ley de Derechos y Deberes del Paciente
            </div>
          </div>

          {/* Links Area */}
          <div className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-4 text-sm font-medium">
            <Link href="/terms" className="hover:text-white transition-colors">Términos y Condiciones</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacidad</Link>
            <Link href="/faq" className="hover:text-white transition-colors">Preguntas Frecuentes</Link>
            <a href="mailto:contacto@nurea.cl" className="hover:text-white transition-colors">Contacto</a>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="mt-10 pt-8 border-t border-slate-900 flex flex-col items-center text-center gap-2 text-xs text-slate-500">
          <p>
            © 2026 NUREA. Todos los derechos reservados. Verificado por la Superintendencia de Salud.
          </p>
        </div>
      </div>
    </footer>
  )
}
