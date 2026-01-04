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
import React, { useRef, useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { ShieldCheck } from "lucide-react"

interface PrivacyDialogProps {
  children: React.ReactNode
  onAccept?: () => void
  onOpenChange?: (open: boolean) => void
}

export function PrivacyDialog({ children, onAccept, onOpenChange }: PrivacyDialogProps) {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const [hasReadToBottom, setHasReadToBottom] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    const content = contentRef.current
    if (!content) return

    const scrollPercentage = content.scrollTop / (content.scrollHeight - content.clientHeight)
    if (scrollPercentage >= 0.99 && !hasReadToBottom) {
      setHasReadToBottom(true)
    }
  }

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
      if (contentRef.current) {
        contentRef.current.scrollTop = 0
      }
    }
  }

  const privacyContent = language === "es" ? (
    <div className="space-y-4 [&_strong]:font-semibold [&_strong]:text-foreground">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-lg text-muted-foreground leading-relaxed">
            En <strong>NUREA</strong>, tu privacidad es fundamental. Queremos que sepas, de forma clara, cómo cuidamos tu información.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Esta política se rige por la legislación chilena vigente, especialmente la <strong>Ley Nº 19.628 sobre Protección de la Vida Privada</strong>.
          </p>
        </div>

        <div className="space-y-2">
          <p><strong>1. Información que recopilamos</strong></p>
          <p className="text-muted-foreground leading-relaxed">
            Podemos recopilar:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>Nombre, correo electrónico y datos de contacto.</li>
            <li>Información necesaria para crear tu perfil.</li>
            <li>Datos para agendar citas.</li>
            <li>Información técnica básica (IP, navegador, dispositivo).</li>
          </ul>
        </div>

        <div className="space-y-2">
          <p><strong>2. Para qué usamos tu información</strong></p>
          <p className="text-muted-foreground leading-relaxed">
            Usamos tus datos para:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>Gestionar tu cuenta.</li>
            <li>Facilitar el agendamiento de citas.</li>
            <li>Permitir la comunicación entre pacientes y profesionales.</li>
            <li>Mejorar la experiencia y seguridad de la plataforma.</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Nunca usamos tus datos con fines distintos a estos.
          </p>
        </div>

        <div className="space-y-2">
          <p><strong>3. Datos de salud</strong></p>
          <p className="text-muted-foreground leading-relaxed">
            NUREA:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>No solicita historiales clínicos completos.</li>
            <li>No almacena diagnósticos detallados.</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            La información clínica compartida durante una atención es responsabilidad directa del profesional de la salud.
          </p>
        </div>

        <div className="space-y-2">
          <p><strong>4. Compartición de información</strong></p>
          <p className="text-muted-foreground leading-relaxed">
            Tu información solo se comparte:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>Entre paciente y profesional, cuando es necesario para la atención.</li>
            <li>Con proveedores tecnológicos indispensables para operar la plataforma.</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            NUREA <strong>no vende ni arrienda datos personales</strong> a terceros.
          </p>
        </div>

        <div className="space-y-2">
          <p><strong>5. Seguridad de la información</strong></p>
          <p className="text-muted-foreground leading-relaxed">
            Aplicamos medidas razonables para proteger tus datos:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>Accesos restringidos.</li>
            <li>Buenas prácticas de seguridad digital.</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Aun así, ningún sistema es 100% infalible, por lo que trabajamos constantemente en mejorar.
          </p>
        </div>

        <div className="space-y-2">
          <p><strong>6. Derechos de las personas usuarias</strong></p>
          <p className="text-muted-foreground leading-relaxed">
            Tienes derecho a:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>Acceder a tus datos.</li>
            <li>Rectificarlos.</li>
            <li>Solicitar su eliminación.</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Para ejercer estos derechos, escríbenos a:{" "}
            <a href="mailto:privacidad@nurea.app" className="text-primary hover:underline font-medium">
              privacidad@nurea.app
            </a>
          </p>
        </div>

        <div className="space-y-2">
          <p><strong>7. Cookies</strong></p>
          <p className="text-muted-foreground leading-relaxed">
            NUREA utiliza cookies básicas para el correcto funcionamiento del sitio. Puedes configurar tu navegador para rechazarlas si lo deseas.
          </p>
        </div>

        <div className="space-y-2">
          <p><strong>8. Cambios en esta política</strong></p>
          <p className="text-muted-foreground leading-relaxed">
            Si modificamos esta Política de Privacidad, lo informaremos de manera clara en la plataforma.
          </p>
        </div>

        <div className="space-y-2">
          <p><strong>9. Contacto</strong></p>
          <p className="text-muted-foreground leading-relaxed">
            Si tienes dudas sobre privacidad o uso de datos:{" "}
            <a href="mailto:privacidad@nurea.app" className="text-primary hover:underline font-medium">
              privacidad@nurea.app
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
            At <strong>NUREA</strong>, your privacy is fundamental. We want you to know, clearly, how we care for your information.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            This policy is governed by current Chilean legislation, especially <strong>Law No. 19.628 on Protection of Privacy</strong>.
          </p>
        </div>
        {/* English content would go here - simplified for now */}
        <p className="text-muted-foreground leading-relaxed">
          Please refer to the Spanish version for complete privacy policy.
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
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b border-border px-6 py-4 text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            {language === "es" ? "Política de Privacidad" : "Privacy Policy"}
          </DialogTitle>
          <div 
            ref={contentRef} 
            onScroll={handleScroll} 
            className="overflow-y-auto max-h-[400px]"
          >
            <DialogDescription asChild>
              <div className="px-6 py-4">
                {privacyContent}
              </div>
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="border-t border-border px-6 py-4 sm:items-center">
          {!hasReadToBottom && (
            <span className="grow text-xs text-muted-foreground max-sm:text-center">
              {language === "es" ? "Lee toda la política antes de aceptar." : "Read all policy before accepting."}
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

