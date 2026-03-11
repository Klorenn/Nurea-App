import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { HowItWorks } from "@/components/how-it-works"
import { Testimonials } from "@/components/testimonials"
import { Pricing } from "@/components/pricing"
import { FaqSection } from "@/components/faq-section"
import { CtaSection } from "@/components/cta-section"
import { NureaDashboardPreview } from "@/components/dashboard/nurea-dashboard-preview"
import { StackedCircularFooter } from "@/components/ui/stacked-circular-footer"
import { PaperShaderBackground } from "@/components/ui/background-paper-shaders"

export default function Home() {
  return (
    <main className="min-h-screen relative" id="main-content">
      <PaperShaderBackground />
      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <NureaDashboardPreview />
        <FeaturesSection />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <FaqSection />
        <CtaSection />
        <StackedCircularFooter />
      </div>
    </main>
  )
}
