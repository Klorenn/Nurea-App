"use client"

import { Heart, ShieldCheck, Zap, Users } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"

export function FeaturesSection() {
  const { language } = useLanguage()
  const t = useTranslations(language)

  const benefits = [
    {
      icon: Heart,
      title: t.landing.features.humanConnection,
      description: t.landing.features.humanConnectionDesc,
      color: "bg-primary/10 text-primary",
    },
    {
      icon: ShieldCheck,
      title: t.landing.features.verifiedExcellence,
      description: t.landing.features.verifiedExcellenceDesc,
      color: "bg-secondary/10 text-secondary",
    },
    {
      icon: Zap,
      title: t.landing.features.instantBooking,
      description: t.landing.features.instantBookingDesc,
      color: "bg-accent/40 text-accent-foreground",
    },
    {
      icon: Users,
      title: t.landing.features.patientFirst,
      description: t.landing.features.patientFirstDesc,
      color: "bg-muted text-muted-foreground",
    },
  ]

  return (
    <section className="py-16 md:py-20 px-6 bg-transparent relative" id="how-it-works">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[450px_1fr] gap-12 md:gap-16 items-center">
          <div className="space-y-6 pl-6 md:pl-8">
            <p className="text-primary font-bold text-sm uppercase tracking-[0.2em]">{t.landing.features.whyChoose}</p>
            <h2 
              className="text-4xl lg:text-5xl text-foreground font-bold leading-[1.1] tracking-tight"
              dangerouslySetInnerHTML={{ __html: t.landing.features.title }}
            />
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t.landing.features.description}
            </p>
            <div className="pt-4">
              <div className="inline-flex items-center gap-4 p-4 rounded-2xl bg-accent/20 border border-accent/30">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted overflow-hidden">
                      <img
                        src={`/professional-.jpg?height=40&width=40&query=professional-${i}`}
                        alt="Professional"
                      />
                    </div>
                  ))}
                </div>
                <p 
                  className="text-sm font-medium"
                  dangerouslySetInnerHTML={{ __html: t.landing.features.joinSpecialists }}
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 pl-6 md:pl-8">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="group p-6 md:p-8 rounded-[2rem] bg-card border border-border hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${benefit.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <benefit.icon className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
