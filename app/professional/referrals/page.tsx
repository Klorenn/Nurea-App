"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ReferralProgram } from "@/components/ui/referral-program"

export default function ReferralsPage() {
  return (
    <DashboardLayout role="professional">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Programa de Referidos
          </h1>
          <p className="text-muted-foreground mt-1">
            Comparte tu código y obtén meses gratis de suscripción
          </p>
        </div>
        <ReferralProgram />
      </div>
    </DashboardLayout>
  )
}

