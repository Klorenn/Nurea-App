"use client"

import { Search, CalendarDays, MessageSquare, Star } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"

export function HowItWorks() {
  const { language } = useLanguage()
  const t = useTranslations(language)

  const steps = [
    {
      icon: Search,
      title: t.landing.howItWorks.step1,
      description: t.landing.howItWorks.step1Desc,
      img: "/search-professionals.jpg",
    },
    {
      icon: CalendarDays,
      title: t.landing.howItWorks.step2,
      description: t.landing.howItWorks.step2Desc,
      img: "/booking-calendar.jpg",
    },
    {
      icon: MessageSquare,
      title: t.landing.howItWorks.step3,
      description: t.landing.howItWorks.step3Desc,
      img: "/secure-chat.jpg",
    },
    {
      icon: Star,
      title: t.landing.howItWorks.step4,
      description: t.landing.howItWorks.step4Desc,
      img: "/professional-rating.jpg",
    },
  ]

  return (
    <section className="py-16 md:py-20 px-6 bg-transparent relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-12 md:mb-16">
          <p className="text-secondary font-bold text-sm uppercase tracking-widest">{t.landing.howItWorks.simpleProcess}</p>
          <h2 
            className="text-4xl lg:text-6xl text-foreground font-bold tracking-tight"
            dangerouslySetInnerHTML={{ __html: t.landing.howItWorks.title }}
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col gap-6">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-border shadow-md group">
                <img
                  src={step.img || "/placeholder.svg"}
                  alt={step.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent p-6 flex items-end">
                  <div className="w-12 h-12 rounded-xl bg-white/90 backdrop-blur shadow-lg flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-secondary" />
                  </div>
                </div>
              </div>
              <div className="space-y-3 px-2">
                <h3 className="text-2xl font-bold text-foreground">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
