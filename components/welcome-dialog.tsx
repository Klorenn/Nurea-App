"use client"

import React from 'react'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

interface WelcomeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onContinue: () => void
}

export function WelcomeDialog({
  open,
  onOpenChange,
  onContinue,
}: WelcomeDialogProps) {
  const { language } = useLanguage()

  const handleContinue = () => {
    onContinue()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden" showCloseButton={false}>
        <DialogHeader className="p-0">
          <DialogBody className="py-8 px-6 text-center">
            {/* Welcome Icon */}
            <div className="mx-auto mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 dark:bg-primary/20">
              <Heart className="h-12 w-12 text-primary dark:text-primary" />
            </div>
            
            <DialogTitle className="mb-3 text-2xl font-bold text-foreground">
              {language === "es" ? "¡Qué bueno que quieras estar con nosotros!" : "We're so glad you want to join us!"}
            </DialogTitle>
            
            <DialogDescription className="mb-6 text-base text-muted-foreground leading-relaxed px-2">
              {language === "es" 
                ? "Estamos emocionados de tenerte como parte de nuestra comunidad. Completa tu registro para comenzar."
                : "We're excited to have you as part of our community. Complete your registration to get started."}
            </DialogDescription>
          </DialogBody>
        </DialogHeader>
        <DialogFooter className="px-6 pb-6 pt-0">
          <DialogClose asChild>
            <Button 
              onClick={handleContinue} 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 rounded-lg"
            >
              {language === "es" ? "Continuar" : "Continue"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

