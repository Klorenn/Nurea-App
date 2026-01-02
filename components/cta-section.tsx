import { LuminousCTAButton } from "@/components/luminous-cta-button"
import Image from "next/image"

export function CtaSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image src="/images/cta-bg.webp" alt="Peaceful landscape" fill className="object-cover" priority />
            {/* Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
          </div>

          {/* Content */}
          <div className="relative z-10 py-20 px-8 sm:px-12 lg:px-16 border-[0.5px] border-primary/20">
            <div className="max-w-2xl">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-medium text-primary mb-6 leading-tight">
                Begin your journey to inner peace today
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed">
                Join thousands of people who have transformed their lives through daily meditation. Start your free
                trial and experience the difference.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <LuminousCTAButton variant="navy" text="Start Your Free Trial" className="px-8 py-4 text-base" />
                <button className="px-8 py-4 text-primary font-medium border-2 border-primary rounded-full hover:bg-primary hover:text-background transition-colors duration-300">
                  Watch Demo
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                No credit card required • 7-day free trial • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
