"use client"

import { motion } from "framer-motion"
import { Star, MapPin, Video, Building2, BadgeCheck, Clock, GraduationCap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  index = 0
}: SpecialistCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(lang === "es" ? "es-CL" : "en-US", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0
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
  }

  const getModalityIcons = () => {
    const icons = []
    if (specialist.consultationType === "online" || specialist.consultationType === "both") {
      icons.push({ icon: Video, label: labels.online, color: "text-blue-500" })
    }
    if (specialist.consultationType === "in-person" || specialist.consultationType === "both") {
      icons.push({ icon: Building2, label: labels.inPerson, color: "text-emerald-500" })
    }
    return icons
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <div className={cn(
        "relative bg-card rounded-2xl border border-border/40 overflow-hidden",
        "shadow-sm hover:shadow-lg transition-all duration-300",
        "hover:border-teal-200 dark:hover:border-teal-800"
      )}>
        {/* Badge disponible hoy */}
        {specialist.isAvailableToday && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-emerald-500 text-white gap-1 shadow-sm">
              <Clock className="h-3 w-3" />
              {labels.availableToday}
            </Badge>
          </div>
        )}

        {/* Header con foto */}
        <div className="relative p-5 pb-0">
          <div className="flex gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-100 to-teal-50 dark:from-teal-900/30 dark:to-teal-800/20">
                {specialist.avatarUrl ? (
                  <img
                    src={specialist.avatarUrl}
                    alt={specialist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-teal-600">
                    {specialist.name.charAt(0)}
                  </div>
                )}
              </div>
              {specialist.verified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-card rounded-full flex items-center justify-center shadow-sm border border-border/40">
                  <BadgeCheck className="h-4 w-4 text-teal-500" />
                </div>
              )}
            </div>

            {/* Info básica */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-foreground truncate group-hover:text-teal-600 transition-colors">
                {specialist.name}
              </h3>
              
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm">{specialist.specialty}</span>
              </div>

              {/* Rating as Emoji */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-lg leading-none" role="img" aria-label="rating emoji">
                    {specialist.rating >= 4.5 ? "🤩" : 
                     specialist.rating >= 3.5 ? "🙂" : 
                     specialist.rating >= 2.5 ? "😐" : 
                     specialist.rating >= 1.5 ? "🙁" : "😡"}
                  </span>
                  <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{specialist.rating.toFixed(1)}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {specialist.reviewCount} {labels.reviews}
                </span>

                {/* Patient Favorite Badge */}
                {specialist.rating >= 4.8 && specialist.reviewCount >= 5 && (
                  <Badge className="bg-teal-500/10 text-teal-600 border-teal-500/20 text-[10px] font-black uppercase tracking-tighter px-2 h-5">
                    Favorito de los pacientes
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detalles */}
        <div className="p-5 pt-4 space-y-3">
          {/* Tags de especialidad y modalidades */}
          <div className="flex flex-wrap gap-2">
            {getModalityIcons().map(({ icon: Icon, label, color }) => (
              <Badge key={label} variant="secondary" className="gap-1 text-xs">
                <Icon className={cn("h-3 w-3", color)} />
                {label}
              </Badge>
            ))}
            {specialist.yearsExperience > 0 && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <GraduationCap className="h-3 w-3" />
                {specialist.yearsExperience} {labels.years}
              </Badge>
            )}
          </div>

          {/* Ubicación */}
          {specialist.location && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{specialist.location}</span>
            </div>
          )}

          {/* Bio (truncada) */}
          {specialist.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {specialist.bio}
            </p>
          )}

          {/* Precio y acciones */}
          <div className="pt-3 border-t border-border/40 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">
                {lang === "es" ? "Consulta desde" : "Starting at"}
              </p>
              <p className="text-xl font-bold text-teal-600">
                {formatPrice(specialist.price)}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onViewProfile}
                className="rounded-xl"
              >
                {labels.viewProfile}
              </Button>
              <Button
                size="sm"
                onClick={onBookAppointment}
                className="rounded-xl bg-teal-600 hover:bg-teal-700"
              >
                {labels.bookNow}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
