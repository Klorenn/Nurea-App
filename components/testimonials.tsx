"use client"

import { AnimatedTestimonials } from "@/components/ui/animated-testimonials"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { useEffect, useState } from "react"

type Testimonial = {
  quote: string
  name: string
  designation: string
  src: string
}

export function Testimonials() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch("/api/reviews/public")
        const data = await response.json()

        if (data.reviews && data.reviews.length > 0) {
          setTestimonials(data.reviews)
        }
      } catch (error) {
        console.error("Error fetching reviews:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  // Don't show section if there are no reviews
  if (loading || testimonials.length === 0) {
    return null
  }

  return (
    <section className="py-16 md:py-20 px-4 bg-transparent relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-12 md:mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-medium text-primary">{t.landing.testimonials.title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t.landing.testimonials.subtitle}</p>
        </div>

        <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
      </div>
    </section>
  )
}
