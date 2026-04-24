"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gift, Copy, CheckCircle2, AlertCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function ReferralProgram() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  // Solo profesionales verificados pueden acceder
  const isVerified = user?.user_metadata?.role === "professional" && user?.user_metadata?.verified === true
  const referralCode = user?.id ? `NUREA-${user.id.slice(0, 8).toUpperCase()}` : "NUREA-XXXXXXXX"
  const referralLink = `nurea.app/ref/${referralCode}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  if (!isVerified) {
    return (
      <Card className="border-primary/20 bg-linear-to-br from-primary/5 via-secondary/5 to-transparent rounded-[2.5rem] overflow-hidden">
        <CardHeader className="text-center p-8 bg-primary/5">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold mb-2">
            {language === "es" ? "Programa de Referidos" : "Referral Program"}
          </CardTitle>
          <CardDescription className="text-base">
            {language === "es"
              ? "Debes ser un profesional verificado para acceder al programa de referidos."
              : "You must be a verified professional to access the referral program."}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="border-primary/20 bg-linear-to-br from-primary/5 via-secondary/5 to-transparent rounded-[2.5rem] overflow-hidden">
      <CardHeader className="text-center p-8 bg-primary/5">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Gift className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold mb-2">
          {language === "es" ? "Programa de Referidos" : "Referral Program"}
        </CardTitle>
        <CardDescription className="text-base">
          {language === "es"
            ? "Refiere un profesional y obtén 1 mes de suscripción gratis"
            : "Refer a professional and get 1 month free subscription"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="font-bold text-lg">
              {language === "es" ? "Cómo funciona" : "How it works"}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">1.</span>
                <span>
                  {language === "es"
                    ? "Comparte tu código de referido único con un profesional de la salud"
                    : "Share your unique referral code with a healthcare professional"}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">2.</span>
                <span>
                  {language === "es"
                    ? "Se registran usando tu código y completan su perfil"
                    : "They sign up using your code and complete their profile"}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">3.</span>
                <span>
                  {language === "es"
                    ? "¡Ambos obtienen 1 mes de suscripción gratis!"
                    : "You both get 1 month free subscription!"}
                </span>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <div className="bg-card p-4 rounded-2xl border border-border/40">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                {language === "es" ? "Tu Código de Referido" : "Your Referral Code"}
              </p>
              <div className="flex gap-2">
                <code className="flex-1 bg-accent/20 px-3 py-2 rounded-xl text-xs font-mono text-center">
                  {referralCode}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="mt-3 flex gap-2">
                <code className="flex-1 bg-accent/20 px-3 py-2 rounded-xl text-xs font-mono text-center">
                  {referralLink}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {language === "es"
                ? "¡Referidos ilimitados! Cuantos más profesionales traigas, más meses gratis obtienes."
                : "Unlimited referrals! The more professionals you bring, the more free months you earn."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

