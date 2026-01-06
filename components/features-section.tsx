"use client"

import { useState, useEffect } from "react"
import { Heart, ShieldCheck, Zap, Users } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"

export function FeaturesSection() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const [professionalCount, setProfessionalCount] = useState<number | null>(null)
  const [professionalAvatars, setProfessionalAvatars] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load real professional count and avatars
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Add cache-busting timestamp to ensure fresh data
        const timestamp = new Date().getTime()
        const response = await fetch(`/api/professionals/count?t=${timestamp}`, {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        })
        
        console.log('FeaturesSection: Fetching professional count, status:', response.status)
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('FeaturesSection: Received data:', {
          count: data.count,
          avatarsCount: data.professionals?.length || 0,
          timestamp: data.timestamp
        })
        
        if (data.count !== undefined) {
          setProfessionalCount(data.count)
          console.log('FeaturesSection: Set professional count to:', data.count)
        } else {
          console.warn('FeaturesSection: No count in response, setting to 0')
          setProfessionalCount(0)
        }
        
        // Use avatars from the count endpoint if available
        if (data.professionals && Array.isArray(data.professionals) && data.professionals.length > 0) {
          setProfessionalAvatars(data.professionals)
          console.log('FeaturesSection: Set avatars:', data.professionals)
        } else {
          console.log('FeaturesSection: No avatars in response, using defaults')
          setProfessionalAvatars([])
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        console.error('FeaturesSection: Error loading professional data:', err)
        
        // Check if it's a network error (server not running)
        const isNetworkError = err instanceof TypeError && err.message.includes('fetch')
        if (isNetworkError) {
          console.warn('FeaturesSection: Server appears to be unavailable, showing fallback message')
          setError('server_unavailable')
        } else {
          setError(errorMessage)
        }
        
        // Set defaults on error - never show hardcoded 2,500+
        setProfessionalCount(null) // null means "show generic message"
        setProfessionalAvatars([])
      } finally {
        setLoading(false)
        console.log('FeaturesSection: Loading complete, count:', professionalCount)
      }
    }
    loadData()
  }, [])

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
              <div className="inline-flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border/40">
                <div className="flex -space-x-3">
                  {professionalAvatars.length > 0 ? (
                    // Mostrar avatares reales de los doctores (máximo 3)
                    professionalAvatars.slice(0, 3).map((avatar, i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted overflow-hidden">
                        <img
                          src={avatar}
                          alt="Professional"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback a imagen por defecto si hay error
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=40&h=40&fit=crop&auto=format'
                          }}
                        />
                      </div>
                    ))
                  ) : (
                    // Si no hay avatares, no mostrar nada (o mostrar placeholder solo si hay profesionales)
                    professionalCount !== null && professionalCount > 0 && (
                      <div className="w-10 h-10 rounded-full border-2 border-background bg-muted/50 flex items-center justify-center">
                        <Users className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )
                  )}
                </div>
                <p className="text-sm font-medium">
                  {loading ? (
                    <span className="text-muted-foreground">
                      {language === "es" ? "Cargando..." : "Loading..."}
                    </span>
                  ) : error || professionalCount === null ? (
                    // Always show generic message when error or null - NEVER show hardcoded 2,500+
                    <span>
                      {language === "es" ? "Únete a especialistas hoy" : "Join specialists today"}
                    </span>
                  ) : language === "es" ? (
                    // professionalCount is guaranteed to be a number here (not null)
                    professionalCount === 0 ? (
                      <>Sé el primero en unirte</>
                    ) : (
                      <>
                        Únete a{" "}
                        <span className="font-bold text-primary">
                          {professionalCount.toLocaleString('es-ES')}
                          {professionalCount > 0 ? "+" : ""}
                        </span>{" "}
                        especialistas hoy
                      </>
                    )
                  ) : (
                    // professionalCount is guaranteed to be a number here (not null)
                    professionalCount === 0 ? (
                      <>Be the first to join</>
                    ) : (
                      <>
                        Join{" "}
                        <span className="font-bold text-primary">
                          {professionalCount.toLocaleString('en-US')}
                          {professionalCount > 0 ? "+" : ""}
                        </span>{" "}
                        specialists today
                      </>
                    )
                  )}
                </p>
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
