import { Navbar } from "@/components/navbar"
import { PatientsHero } from "@/components/patients/patients-hero"
import { PatientsBenefits } from "@/components/patients/patients-benefits"
import { PatientsHowItWorks } from "@/components/patients/patients-how-it-works"
import { PatientsSecurity } from "@/components/patients/patients-security"
import { PatientsCTA } from "@/components/patients/patients-cta"
import { Testimonials } from "@/components/testimonials"
import { FaqSection } from "@/components/faq-section"
import { StackedCircularFooter } from "@/components/ui/stacked-circular-footer"
import { PaperShaderBackground } from "@/components/ui/background-paper-shaders"

export default function PacientesPage() {
  return (
    <main className="min-h-screen relative">
      <PaperShaderBackground />
      <div className="relative z-10">
        <Navbar />
        <PatientsHero />
        <PatientsBenefits />
        <PatientsHowItWorks />
        <PatientsSecurity />
        <Testimonials />
        <FaqSection />
        <PatientsCTA />
        <StackedCircularFooter />
      </div>
    </main>
  )
}

