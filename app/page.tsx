import dynamic from "next/dynamic"
import { Suspense } from "react"
import { NureaHeader } from "@/components/ui/nurea-header"
import { HeroSection } from "@/components/hero-section"
import { PaperShaderBackground } from "@/components/ui/background-paper-shaders"

const NureaDashboardPreview = dynamic(
  () => import("@/components/dashboard/nurea-dashboard-preview").then((m) => m.NureaDashboardPreview),
  { ssr: true, loading: () => <section className="min-h-[280px]" aria-hidden /> }
)
const FeaturesSection = dynamic(
  () => import("@/components/features-section").then((m) => m.FeaturesSection),
  { ssr: true, loading: () => <section className="min-h-[320px]" aria-hidden /> }
)
const HowItWorks = dynamic(
  () => import("@/components/how-it-works").then((m) => m.HowItWorks),
  { ssr: true, loading: () => <section className="min-h-[240px]" aria-hidden /> }
)
const Testimonials = dynamic(
  () => import("@/components/testimonials").then((m) => m.Testimonials),
  { ssr: true, loading: () => <section className="min-h-[320px]" aria-hidden /> }
)
const Pricing = dynamic(
  () => import("@/components/pricing").then((m) => m.Pricing),
  { ssr: true, loading: () => <section className="min-h-[400px]" aria-hidden /> }
)
const FaqSection = dynamic(
  () => import("@/components/faq-section").then((m) => m.FaqSection),
  { ssr: true, loading: () => <section className="min-h-[200px]" aria-hidden /> }
)
const CtaSection = dynamic(
  () => import("@/components/cta-section").then((m) => m.CtaSection),
  { ssr: true, loading: () => <section className="min-h-[200px]" aria-hidden /> }
)
const StackedCircularFooter = dynamic(
  () => import("@/components/ui/stacked-circular-footer").then((m) => m.StackedCircularFooter),
  { ssr: true, loading: () => <footer className="min-h-[120px]" aria-hidden /> }
)

export default function Home() {
  return (
    <main className="min-h-screen relative" id="main-content">
      <PaperShaderBackground />
      <div className="relative z-10" suppressHydrationWarning>
        <NureaHeader />
        <HeroSection />
        <Suspense fallback={null}>
          <NureaDashboardPreview />
          <FeaturesSection />
          <HowItWorks />
          <Testimonials />
          <Pricing />
          <FaqSection />
          <CtaSection />
          <StackedCircularFooter />
        </Suspense>
      </div>
    </main>
  )
}
