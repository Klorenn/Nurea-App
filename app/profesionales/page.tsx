export const dynamic = 'force-dynamic'

import { Navbar } from "@/components/navbar"
import { ProfessionalsHero } from "@/components/professionals/professionals-hero"
import { ProfessionalsBenefits } from "@/components/professionals/professionals-benefits"
import { ProfessionalsHowItWorks } from "@/components/professionals/professionals-how-it-works"
import { Pricing } from "@/components/pricing"
import { ProfessionalsLegal } from "@/components/professionals/professionals-legal"
import { ProfessionalsCTA } from "@/components/professionals/professionals-cta"
import { StackedCircularFooter } from "@/components/ui/stacked-circular-footer"
import { PaperShaderBackground } from "@/components/ui/background-paper-shaders"

export default function ProfesionalesPage() {
  return (
    <main className="min-h-screen relative">
      <PaperShaderBackground />
      <div className="relative z-10">
        <Navbar />
        <ProfessionalsHero />
        <ProfessionalsBenefits />
        <ProfessionalsHowItWorks />
        <Pricing />
        <ProfessionalsLegal />
        <ProfessionalsCTA />
        <StackedCircularFooter />
      </div>
    </main>
  )
}

