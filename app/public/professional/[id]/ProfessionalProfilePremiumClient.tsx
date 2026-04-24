"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProfileAuthorityHeader } from "@/components/professionals/premium/ProfileAuthorityHeader"
import { BentoGridProfile } from "@/components/professionals/premium/BentoGridProfile"
import { StickyReservationWidget } from "@/components/professionals/premium/StickyReservationWidget"
import { useLanguage } from "@/contexts/language-context"
import { trackBookingEvent } from "@/lib/analytics"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { genderizeSpecialtyLabel } from "@/lib/utils/genderize-specialty"

interface ProfessionalProfilePremiumClientProps {
  professionalId: string
  initialProfessional: any
  initialReviews: any[]
}

export default function ProfessionalProfilePremiumClient({
  professionalId,
  initialProfessional,
  initialReviews,
}: ProfessionalProfilePremiumClientProps) {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoaded: authLoading } = useUser()
  const [activeTab, setActiveTab] = useState("experiencia")

  const professional = initialProfessional
  const reviews = initialReviews

  const handleBook = () => {
    if (professional?.id) trackBookingEvent("click_agendar", { professionalId: professional.id, source: "profile" })
    if (!authLoading && !user) {
      const callbackUrl = pathname ? `/dashboard/calendar?professionalId=${professional?.id}` : "/explore"
      router.push("/login?callbackUrl=" + encodeURIComponent(callbackUrl))
      return
    }
    if (professional?.id) router.push(`/dashboard/calendar?professionalId=${professional.id}`)
  }

  const handleMessage = () => {
    if (professional?.id) router.push(`/dashboard/chat?professionalId=${professional.id}`)
  }

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-slate-950 flex flex-col">
      <Navbar />

      {/* Contenido con padding-top para la navbar fixed; altura mínima para que haya scroll y el footer no se vea "al tiro" */}
      <div className="flex-1 w-full pt-16 min-h-[calc(100vh-5rem)] max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
          {/* Columna izquierda: card header + tabs + contenido */}
          <div className="space-y-0">
            <ProfileAuthorityHeader
              name={professional.name}
              title={genderizeSpecialtyLabel(
                professional.specialty_data?.name || professional.specialty,
                professional.profile?.gender || professional.gender
              )}
              location={professional.city || professional.location}
              registrationNumber={professional.registration_number || professional.professionalRegistration?.number}
              rating={professional.rating || 4.9}
              reviewsCount={professional.reviewsCount || 0}
              imageUrl={professional.imageUrl}
              verified={professional.verified}
              yearsExperience={professional.yearsExperience}
              patientsCount={professional.patientsCount}
              isSpanish={isSpanish}
              onBook={handleBook}
              onMessage={handleMessage}
            />

            {/* Tabs estilo Doctoralia */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-slate-200 dark:border-slate-800 rounded-none">
                <TabsTrigger
                  value="experiencia"
                  className={cn(
                    "rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 data-[state=active]:shadow-none px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 data-[state=active]:bg-transparent"
                  )}
                >
                  {isSpanish ? "Experiencia" : "Experience"}
                </TabsTrigger>
                <TabsTrigger
                  value="servicios"
                  className={cn(
                    "rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 data-[state=active]:shadow-none px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 data-[state=active]:bg-transparent"
                  )}
                >
                  {isSpanish ? "Servicios y precios" : "Services & pricing"}
                </TabsTrigger>
                <TabsTrigger
                  value="opiniones"
                  className={cn(
                    "rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:text-teal-600 data-[state=active]:shadow-none px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 data-[state=active]:bg-transparent"
                  )}
                >
                  {isSpanish ? "Opiniones" : "Reviews"} ({reviews?.length ?? 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="experiencia" className="mt-4">
                <div className="space-y-0">
                  <BentoGridProfile
                    bio={professional.bio || professional.bio_extended || ""}
                    specialties={professional.services?.map((s: string) => ({ name: s })) || []}
                    trajectory={professional.education?.map((e: any) => ({
                      year: e.graduation_year || e.year,
                      institution: e.institution,
                      degree: e.degree || e.title
                    })) || []}
                  />
                </div>
              </TabsContent>

              <TabsContent value="servicios" className="mt-4">
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    {isSpanish ? "Consulta" : "Consultation"}
                  </h3>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                    ${(professional.consultationPrice || 35000).toLocaleString("es-CL")} CLP
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {professional.slotDuration || 60} {isSpanish ? "min" : "min"}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="opiniones" className="mt-4">
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                  {reviews?.length ? (
                    <ul className="space-y-4">
                      {reviews.slice(0, 5).map((r: any) => (
                        <li key={r.id} className="border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
                          <p className="text-sm text-slate-700 dark:text-slate-300">{r.comment}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{r.rating}/5</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {isSpanish ? "Aún no hay opiniones." : "No reviews yet."}
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Columna derecha: panel de reserva sticky */}
          <div className="lg:sticky lg:top-24">
            <StickyReservationWidget
              professionalId={professional.id}
              price={professional.consultationPrice || 35000}
              serviceLabel={genderizeSpecialtyLabel(
                professional.specialty_data?.name || professional.specialty,
                professional.profile?.gender || professional.gender
              )}
              durationMinutes={professional.slotDuration ?? 60}
              onBook={handleBook}
              hasTelemedicine={professional.consultationTypes?.includes("online")}
              hasInPerson={professional.consultationTypes?.includes("in-person")}
              isSpanish={isSpanish}
            />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
