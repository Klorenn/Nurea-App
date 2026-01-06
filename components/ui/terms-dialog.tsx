"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import React, { useRef, useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { FileText } from "lucide-react"

interface TermsDialogProps {
  children: React.ReactNode
  onAccept?: () => void
  onOpenChange?: (open: boolean) => void
}

export function TermsDialog({ children, onAccept, onOpenChange }: TermsDialogProps) {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const [hasReadToBottom, setHasReadToBottom] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const dialogContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    
    let cleanup: (() => void) | undefined
    
    // Wait for ScrollArea to render
    const timeoutId = setTimeout(() => {
      const dialogContent = dialogContentRef.current
      if (!dialogContent) return

      const viewport = dialogContent.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement
      if (!viewport) return

      const handleScroll = () => {
        const scrollPercentage = viewport.scrollTop / (viewport.scrollHeight - viewport.clientHeight)
        if (scrollPercentage >= 0.99 && !hasReadToBottom) {
          setHasReadToBottom(true)
        }
      }

      viewport.addEventListener('scroll', handleScroll)
      
      // Store cleanup function
      cleanup = () => {
        viewport.removeEventListener('scroll', handleScroll)
      }
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      if (cleanup) cleanup()
    }
  }, [isOpen, hasReadToBottom])

  const handleAccept = () => {
    if (hasReadToBottom && onAccept) {
      onAccept()
    }
    setIsOpen(false)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (onOpenChange) {
      onOpenChange(open)
    }
    if (!open) {
      setHasReadToBottom(false)
      // Reset scroll when dialog closes
      setTimeout(() => {
        const dialogContent = dialogContentRef.current
        if (dialogContent) {
          const viewport = dialogContent.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement
          if (viewport) {
            viewport.scrollTop = 0
          }
        }
      }, 100)
    }
  }

  const termsContent = language === "es" ? (
    <div className="space-y-4 [&_strong]:font-semibold [&_strong]:text-foreground">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Bienvenido/a a <strong>NUREA</strong>. Gracias por confiar en nosotros.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            NUREA es una plataforma digital diseñada para facilitar el encuentro entre personas que buscan atención en salud y profesionales de la salud en Chile. Nuestro objetivo es hacer este proceso más humano, claro y accesible.
          </p>
        </div>

        <div className="space-y-2">
          <p><strong>1. ¿Qué es NUREA?</strong></p>
          <p className="text-muted-foreground leading-relaxed">
            NUREA es una <strong>plataforma tecnológica de intermediación</strong>. Esto significa que:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>No prestamos servicios médicos.</li>
            <li>No realizamos diagnósticos ni tratamientos.</li>
            <li>No reemplazamos la relación directa entre paciente y profesional de la salud.</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Nuestro rol es facilitar la búsqueda, comunicación y agendamiento de citas.
          </p>
        </div>

        <div className="space-y-2">
          <p><strong>2. ¿Quiénes pueden usar NUREA?</strong></p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Pacientes:</strong> Personas que buscan atención con profesionales de la salud.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Profesionales de la salud:</strong> Actualmente Psicólogas/os, Psiquiatras, Dentistas/Odontólogos, Kinesiólogas/os, Matronas/es, Nutricionistas. NUREA podrá incorporar nuevas especialidades en el futuro.
          </p>
        </div>

        <div className="space-y-2">
          <p><strong>3. Registro y uso de la cuenta</strong></p>
          <p className="text-muted-foreground leading-relaxed">
            Al crear una cuenta en NUREA, te comprometes a:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>Entregar información verdadera y actualizada.</li>
            <li>Usar la plataforma de forma responsable y respetuosa.</li>
            <li>Mantener la confidencialidad de tus accesos.</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            NUREA podrá suspender cuentas que incumplan estos principios.
          </p>
        </div>

        <div className="space-y-2">
          <p><strong>4. Reservas, cancelaciones y reprogramaciones</strong></p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>Las citas se reservan directamente con cada profesional.</li>
            <li>Cada profesional define su política de cancelación y reprogramación.</li>
            <li>NUREA muestra esta información para que puedas decidir con claridad.</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            NUREA no es responsable por cancelaciones, retrasos o cambios realizados por los profesionales.
          </p>
        </div>

        <div className="space-y-2">
          <p><strong>5. Consultas online y mensajería</strong></p>
          <p className="text-muted-foreground leading-relaxed">
            NUREA ofrece herramientas de mensajería y videollamada seguras. Es importante que sepas que:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>Estas herramientas no reemplazan una atención médica presencial cuando esta es necesaria.</li>
            <li>El contenido de las consultas es responsabilidad exclusiva del profesional.</li>
          </ul>
        </div>

        <div className="space-y-2">
          <p><strong>6. Pagos y suscripciones (profesionales)</strong></p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>Los planes para profesionales se pagan de forma mensual.</li>
            <li>No existen contratos de permanencia forzada.</li>
            <li>Puedes cancelar tu suscripción en cualquier momento.</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Los valores y condiciones pueden cambiar, lo que será informado oportunamente.
          </p>
        </div>

        <div className="space-y-2">
          <p><strong>7. Reseñas y contenido</strong></p>
          <p className="text-muted-foreground leading-relaxed">
            Las reseñas en NUREA buscan ayudar a la comunidad. Por eso:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>Deben ser reales y respetuosas.</li>
            <li>NUREA podrá moderar o eliminar contenido ofensivo, falso o inapropiado.</li>
          </ul>
        </div>

        <div className="space-y-2">
          <p><strong>8. Limitación de responsabilidad</strong></p>
          <p className="text-muted-foreground leading-relaxed">
            NUREA no es responsable por:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>Diagnósticos, tratamientos o decisiones clínicas.</li>
            <li>Resultados de la atención médica.</li>
            <li>Conflictos entre pacientes y profesionales.</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Cada profesional es responsable de la atención que brinda.
          </p>
        </div>

        <div className="space-y-2">
          <p><strong>9. Cambios en estos términos</strong></p>
          <p className="text-muted-foreground leading-relaxed">
            NUREA puede actualizar estos Términos de Uso. Cuando esto ocurra, lo informaremos de manera clara a los usuarios.
          </p>
        </div>

        <div className="space-y-2">
          <p><strong>10. Contacto</strong></p>
          <p className="text-muted-foreground leading-relaxed">
            Si tienes dudas sobre estos términos, puedes escribirnos a:{" "}
            <a href="mailto:soporte@nurea.app" className="text-primary hover:underline font-medium">
              soporte@nurea.app
            </a>
          </p>
        </div>

        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border/40">
          <p>© 2026 <strong>NUREA</strong>. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  ) : (
    <div className="space-y-4 [&_strong]:font-semibold [&_strong]:text-foreground">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Welcome to <strong>NUREA</strong>. Thank you for trusting us.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            NUREA is a digital platform designed to facilitate connections between people seeking healthcare and healthcare professionals in Chile. Our goal is to make this process more human, clear, and accessible.
          </p>
        </div>
        {/* English content would go here - simplified for now */}
        <p className="text-muted-foreground leading-relaxed">
          Please refer to the Spanish version for complete terms.
        </p>
      </div>
    </div>
  )

  // Clone children and add onClick handler to open dialog
  const triggerElement = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<any>, {
        onClick: (e: React.MouseEvent) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen(true)
        },
        type: 'button',
      })
    : children

  return (
    <>
      {triggerElement}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent ref={dialogContentRef} className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b border-border px-6 py-4 text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            {language === "es" ? "Términos de Uso" : "Terms of Service"}
          </DialogTitle>
          <ScrollArea className="max-h-[400px]">
            <DialogDescription asChild>
              <div className="px-6 py-4">
                {termsContent}
              </div>
            </DialogDescription>
          </ScrollArea>
        </DialogHeader>
        <DialogFooter className="border-t border-border px-6 py-4 sm:items-center">
          {!hasReadToBottom && (
            <span className="grow text-xs text-muted-foreground max-sm:text-center">
              {language === "es" ? "Lee todos los términos antes de aceptar." : "Read all terms before accepting."}
            </span>
          )}
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {language === "es" ? "Cancelar" : "Cancel"}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button" disabled={!hasReadToBottom} onClick={handleAccept}>
              {language === "es" ? "Acepto" : "I agree"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
      </Dialog>
    </>
  )
}

