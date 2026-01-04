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
import { CheckCircle } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import { useTranslations } from '@/lib/i18n'

interface SubscriptionSuccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planName?: string
  amount?: string
  nextBillingDate?: string
  onContinue?: () => void
}

export function SubscriptionSuccessDialog({
  open,
  onOpenChange,
  planName,
  amount,
  nextBillingDate,
  onContinue,
}: SubscriptionSuccessDialogProps) {
  const { language } = useLanguage()
  const t = useTranslations(language)

  const handleContinue = () => {
    if (onContinue) {
      onContinue()
    }
    onOpenChange(false)
  }

  // Calculate next billing date (30 days from now) if not provided
  const getNextBillingDate = () => {
    if (nextBillingDate) return nextBillingDate
    
    const date = new Date()
    date.setDate(date.getDate() + 30)
    return date.toLocaleDateString(language === "es" ? "es-CL" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden" showCloseButton={false}>
        <DialogHeader className="p-0">
          <DialogBody className="py-8 px-6 text-center">
            {/* Success Icon with Teal Background */}
            <div className="mx-auto mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 dark:bg-primary/20">
              <CheckCircle className="h-12 w-12 text-primary dark:text-primary" />
            </div>
            
            <DialogTitle className="mb-3 text-2xl font-bold text-foreground">
              {t.payments.subscriptionSuccess}
            </DialogTitle>
            
            <DialogDescription className="mb-6 text-base text-muted-foreground leading-relaxed px-2">
              {t.payments.subscriptionActivated}
            </DialogDescription>
            
            {/* Subscription Details Card */}
            <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 mb-6 rounded-xl p-5 space-y-3">
              {planName && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{t.payments.plan}</span>
                  <span className="font-semibold text-foreground">{planName}</span>
                </div>
              )}
              {amount && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{t.payments.amount}</span>
                  <span className="font-semibold text-primary">{amount}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm pt-2 border-t border-border/50">
                <span className="text-muted-foreground">{t.payments.nextBilling}</span>
                <span className="font-semibold text-foreground">{getNextBillingDate()}</span>
              </div>
            </div>
          </DialogBody>
        </DialogHeader>
        <DialogFooter className="px-6 pb-6 pt-0">
          <DialogClose asChild>
            <Button 
              onClick={handleContinue} 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 rounded-lg"
            >
              {t.payments.continue}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

