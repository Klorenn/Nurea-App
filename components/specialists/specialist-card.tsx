"use client"

import { MapPin, Video, Building2, BadgeCheck, Clock, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StarRating } from "@/components/specialists/star-rating"
import { cn } from "@/lib/utils"
import type { SpecialistCard as SpecialistCardType } from "@/types"

interface SpecialistCardProps {
  specialist: SpecialistCardType
  onViewProfile: () => void
  onBookAppointment: () => void
  lang?: string
  index?: number
}

export function SpecialistCard({
  specialist,
  onViewProfile,
  onBookAppointment,
  lang = "es",
}: SpecialistCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(lang === "es" ? "es-CL" : "en-US", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const labels = {
    viewProfile: lang === "es" ? "Ver perfil" : "View profile",
    bookNow: lang === "es" ? "Agendar" : "Book now",
    reviews: lang === "es" ? "reseñas" : "reviews",
    years: lang === "es" ? "años exp." : "yrs exp.",
    availableToday: lang === "es" ? "Disponible hoy" : "Available today",
    online: lang === "es" ? "Online" : "Online",
    inPerson: lang === "es" ? "Presencial" : "In-person",
    from: lang === "es" ? "Consulta desde" : "From",
  }

  const modalities: { icon: typeof Video; label: string }[] = []
  if (specialist.consultationType === "online" || specialist.consultationType === "both") {
    modalities.push({ icon: Video, label: labels.online })
  }
  if (specialist.consultationType === "in-person" || specialist.consultationType === "both") {
    modalities.push({ icon: Building2, label: labels.inPerson })
  }

  const isPatientFavorite = specialist.rating >= 4.8 && specialist.reviewCount >= 5

  return (
    <article
      className={cn(
        "relative flex flex-col bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden",
        "shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200"
      )}
    >
      {/* Disponible hoy */}
      {specialist.isAvailableToday && (
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-teal-600 text-white text-xs font-medium">
            <Clock className="h-3 w-3" />
            {labels.availableToday}
          </span>
        </div>
      )}

      <div className="p-4">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              {specialist.avatarUrl ? (
                <img
                  src={specialist.avatarUrl}
                  alt={specialist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-semibold text-slate-500 dark:text-slate-400">
                  {specialist.name.charAt(0)}
                </div>
              )}
            </div>
            {specialist.verified && (
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                <BadgeCheck className="h-3.5 w-3.5 text-teal-600" />
              </div>
            )}
          </div>

          {/* Nombre, especialidad, rating */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
              {specialist.name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {specialist.specialty}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
              <StarRating value={specialist.rating} size="sm" showValue />
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {specialist.reviewCount} {labels.reviews}
              </span>
              {isPatientFavorite && (
                <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                  Favorito de los pacientes
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Badges Online / Presencial + experiencia */}
        <div className="flex flex-wrap gap-2 mt-4">
          {modalities.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium"
            >
              <Icon className="h-3 w-3" />
              {label}
            </span>
          ))}
          {specialist.yearsExperience > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">
              <GraduationCap className="h-3 w-3" />
              {specialist.yearsExperience} {labels.years}
            </span>
          )}
        </div>

        {specialist.location && (
          <div className="flex items-center gap-1.5 mt-2 text-sm text-slate-500 dark:text-slate-400">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{specialist.location}</span>
          </div>
        )}

        {specialist.bio && (
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-2">
            {specialist.bio}
          </p>
        )}
      </div>

      {/* Precio y acciones — alineación clara */}
      <div className="mt-auto px-4 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{labels.from}</p>
          <p className="text-lg font-semibold text-teal-600 dark:text-teal-400">
            {formatPrice(specialist.price)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewProfile}
            className="rounded-lg border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {labels.viewProfile}
          </Button>
          <Button
            size="sm"
            onClick={onBookAppointment}
            className="rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium shadow-sm"
          >
            {labels.bookNow}
          </Button>
        </div>
      </div>
    </article>
  )
}
