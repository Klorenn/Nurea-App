'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { trackBookingEvent } from '@/lib/analytics'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import {
  ProfileHeader,
  TrustBadges,
  AboutSection,
  ExperienceSection,
  TherapeuticApproach,
  ServiceSelector,
  ConditionsTreated,
  FormatsSection,
  ClinicGallerySection,
  PatientsSection,
  PaymentMethodsSection,
  ReviewsSection,
  FAQSection,
  BookingSidebar,
} from '@/components/specialist-profile'
import { mapApiProfessionalToSpecialist } from '@/lib/specialist-profile-mapper'
import { mockSpecialist } from '@/lib/specialist-profile-mock'
import type { Specialist, SpecialistService } from '@/lib/specialist-profile-types'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface SpecialistProfileConversionPageProps {
  professionalId: string
  /** API/Supabase professional object. If null, mock data is used. */
  initialProfessional: Record<string, unknown> | null
  /** API reviews array. If null, mock reviews or empty. */
  initialReviews: Array<{ id: string; name?: string; rating: number; comment?: string; createdAt?: string; created_at?: string; verified?: boolean }> | null
  /** When true, show no availability in sidebar */
  noAvailability?: boolean
}

/**
 * High-conversion specialist profile page.
 * Layout: 2-column desktop (content | sticky booking), stacked mobile with sticky bottom CTA.
 * Optimized for trust, clarity, and booking conversion.
 */
export function SpecialistProfileConversionPage({
  professionalId,
  initialProfessional,
  initialReviews,
  noAvailability = false,
}: SpecialistProfileConversionPageProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading: authLoading } = useAuth()
  const { language } = useLanguage()
  const isSpanish = language === 'es'

  const specialist: Specialist = initialProfessional
    ? mapApiProfessionalToSpecialist(
        initialProfessional as Parameters<typeof mapApiProfessionalToSpecialist>[0],
        initialReviews ?? []
      )
    : mockSpecialist

  const handleBook = () => {
    trackBookingEvent('click_agendar', { professionalId: specialist.id, source: 'profile_conversion' })
    if (!authLoading && !user) {
      const callbackUrl = pathname ? `${pathname}` : '/explore'
      router.push('/login?callbackUrl=' + encodeURIComponent(callbackUrl))
      return
    }
    router.push(`/dashboard/calendar?professionalId=${specialist.id}`)
  }

  const handleMessage = () => {
    router.push(`/dashboard/chat?professionalId=${specialist.id}`)
  }

  const trustBadges = [
    ...(specialist.patientsCount
      ? [{ icon: 'users' as const, label: `+${specialist.patientsCount} ${isSpanish ? 'pacientes atendidos' : 'patients seen'}` }]
      : []),
    ...(specialist.experienceYears
      ? [{ icon: 'briefcase' as const, label: `${specialist.experienceYears} ${isSpanish ? 'años de experiencia' : 'years of experience'}` }]
      : []),
    ...(specialist.certification
      ? [{ icon: 'award' as const, label: specialist.certification }]
      : []),
    ...(specialist.onlineAvailable
      ? [{ icon: 'video' as const, label: isSpanish ? 'Atención online disponible' : 'Online available' }]
      : []),
  ]

  // Si no hay datos reales, preferimos no inventar badges.

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar />

      <div className="flex-1 w-full pt-16 min-h-[calc(100vh-5rem)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] lg:gap-10 lg:items-start">
            {/* Left: content */}
            <div className="space-y-6">
              <ProfileHeader
                name={specialist.name}
                specialty={specialist.specialty}
                tagline={specialist.tagline}
                imageUrl={specialist.imageUrl}
                location={specialist.location}
                verified={specialist.verified}
                rating={specialist.rating}
                reviewsCount={specialist.reviewsCount}
                isSpanish={isSpanish}
                onBook={handleBook}
                onMessage={handleMessage}
              />

              <TrustBadges items={trustBadges} />

              <AboutSection
                bio={specialist.bio}
                bioExtended={specialist.bioExtended}
                isSpanish={isSpanish}
              />

              <ExperienceSection
                experienceYears={specialist.experienceYears || 0}
                education={specialist.education}
                certifications={specialist.certifications}
                acceptedInsurancesCount={specialist.insuranceOptions?.length}
                isSpanish={isSpanish}
              />

              {specialist.approaches.length > 0 && (
                <TherapeuticApproach approaches={specialist.approaches} isSpanish={isSpanish} />
              )}

              <ServiceSelector
                services={specialist.services}
                location={specialist.location}
                locationAddress={specialist.location}
                isSpanish={isSpanish}
                onSelectService={(service) => {
                  if (process.env.NODE_ENV === "development") {
                    console.debug("[NUREA Analytics] select_service", { 
                      professionalId: specialist.id, 
                      serviceId: service.id,
                      serviceName: service.name,
                      price: service.price,
                      modality: service.modality,
                      source: 'profile_conversion' 
                    })
                  }
                }}
                onBook={(service) => {
                  if (process.env.NODE_ENV === "development") {
                    console.debug("[NUREA Analytics] click_book_service", { 
                      professionalId: specialist.id, 
                      serviceId: service.id,
                      serviceName: service.name,
                      price: service.price,
                      modality: service.modality,
                      source: 'profile_conversion' 
                    })
                  }
                  if (!authLoading && !user) {
                    const callbackUrl = pathname ? `${pathname}` : '/explore'
                    router.push('/login?callbackUrl=' + encodeURIComponent(callbackUrl))
                    return
                  }
                  // Navegar con el servicio seleccionado
                  const params = new URLSearchParams()
                  params.set('professionalId', specialist.id)
                  if (service.modality) {
                    params.set('type', service.modality === 'both' ? 'online' : service.modality)
                  }
                  router.push(`/dashboard/calendar?${params.toString()}`)
                }}
              />

              <FormatsSection
                hasInPerson={specialist.consultationTypes.includes('in-person')}
                hasOnline={specialist.consultationTypes.includes('online')}
                locationLabel={specialist.location}
                isSpanish={isSpanish}
                onViewMap={() => {
                  // Por ahora, simplemente hacemos scroll a la cabecera (donde se ve la ciudad).
                  document.getElementById('experience-heading')?.scrollIntoView({ behavior: 'smooth' })
                }}
              />

              {specialist.conditions.length > 0 && (
                <ConditionsTreated conditions={specialist.conditions} isSpanish={isSpanish} />
              )}

              {specialist.clinicImages && specialist.clinicImages.length > 0 && (
                <ClinicGallerySection
                  images={specialist.clinicImages}
                  isSpanish={isSpanish}
                />
              )}

              {specialist.patientsGroups && specialist.patientsGroups.length > 0 && (
                <PatientsSection
                  groups={specialist.patientsGroups}
                  isSpanish={isSpanish}
                />
              )}

              {specialist.paymentMethods && specialist.paymentMethods.length > 0 && (
                <PaymentMethodsSection
                  methods={specialist.paymentMethods}
                  isSpanish={isSpanish}
                />
              )}

              <ReviewsSection
                reviews={specialist.reviews}
                averageRating={specialist.rating}
                totalCount={specialist.reviewsCount}
                isSpanish={isSpanish}
              />

              {specialist.faqs.length > 0 && (
                <FAQSection faqs={specialist.faqs} isSpanish={isSpanish} />
              )}
            </div>

            {/* Right: sticky booking sidebar (desktop) */}
            <div className="hidden lg:block">
              <BookingSidebar
                professionalId={professionalId}
                services={specialist.services}
                defaultPrice={specialist.consultationPrice}
                defaultDuration={specialist.slotDuration}
                hasOnline={specialist.consultationTypes.includes('online')}
                hasInPerson={specialist.consultationTypes.includes('in-person')}
                insuranceOptions={specialist.insuranceOptions}
                paymentMethods={specialist.paymentMethods}
                isSpanish={isSpanish}
                onBook={handleBook}
                noAvailability={noAvailability}
              />
            </div>
          </div>
        </div>

        {/* Mobile: sticky bottom CTA */}
        <div
          className={cn(
            'fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95 lg:hidden'
          )}
        >
          <Button
            onClick={handleBook}
            className="w-full h-12 rounded-xl bg-teal-600 text-base font-semibold text-white shadow-md hover:bg-teal-700"
          >
            <Calendar className="mr-2 h-5 w-5" />
            {isSpanish ? 'Agendar cita' : 'Book appointment'}
          </Button>
        </div>
      </div>

      <Footer />
    </main>
  )
}
