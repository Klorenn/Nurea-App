"use client"

import { CalendarHeart, MessageCircle, Star, HeartHandshake, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface DoctorCardProps {
  id: string
  name: string
  specialty: string
  avatar?: string
  rating?: number
  patientsServed?: number
  isOnline?: boolean
  availableToday?: boolean
  availableUntil?: string
  location?: string
  consultationPrice?: number
  className?: string
}

export default function DoctorCard({
  id,
  name,
  specialty,
  avatar = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop",
  rating = 4.8,
  patientsServed = 231,
  isOnline = true,
  availableToday = true,
  availableUntil = "7:00 PM",
  location,
  consultationPrice,
  className,
}: DoctorCardProps) {
  const { language } = useLanguage()
  const router = useRouter()

  const handleBookAppointment = () => {
    router.push(`/professional/${id}`)
  }

  const handleViewMore = () => {
    router.push(`/professional/${id}`)
  }

  return (
    <div
      className={cn(
        "max-w-sm w-full mx-auto bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl",
        "border border-teal-200/30 dark:border-teal-800/30 rounded-2xl shadow-lg shadow-teal-500/10",
        "overflow-hidden relative transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/20 hover:scale-[1.02]",
        className
      )}
    >
      {/* Status Badge */}
      {isOnline && (
        <div className="absolute top-3 right-3 px-2.5 py-0.5 text-xs rounded-full bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-200 font-medium border border-teal-200 dark:border-teal-700">
          {language === "es" ? "En Línea" : "Online"}
        </div>
      )}

      {/* Header */}
      <div className="p-5 text-center border-b border-teal-200/20 dark:border-teal-800/20 bg-gradient-to-b from-teal-50/50 to-transparent dark:from-teal-950/20">
        <div className="relative mx-auto w-16 h-16 rounded-full overflow-hidden ring-4 ring-teal-200/50 dark:ring-teal-800/50">
          <Image
            src={avatar}
            width={64}
            height={64}
            alt={name}
            className="object-cover w-full h-full"
          />
        </div>
        <h2 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">{name}</h2>
        <p className="text-sm text-teal-600 dark:text-teal-400 font-medium">{specialty}</p>
      </div>

      {/* Details */}
      <div className="p-5 space-y-4">
        {/* Rating and Patients Served */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-semibold">{rating}</span>
            <span className="text-muted-foreground">
              {language === "es" ? "Calificación" : "Rating"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
            <HeartHandshake className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="font-semibold">{patientsServed}</span>
            <span className="text-muted-foreground">
              {language === "es" ? "Pacientes" : "Patients"}
            </span>
          </div>
        </div>

        {/* Availability */}
        {availableToday && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-teal-50/50 dark:bg-teal-950/20 rounded-lg p-2.5">
            <CalendarHeart className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>
              {language === "es" ? "Disponible Hoy" : "Available Today"}
              {availableUntil && (
                <span className="text-teal-600 dark:text-teal-400 font-medium">
                  {" "}
                  · {language === "es" ? "Hasta" : "Until"} {availableUntil}
                </span>
              )}
            </span>
          </div>
        )}

        {/* Location */}
        {location && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="truncate">{location}</span>
          </div>
        )}

        {/* Price */}
        {consultationPrice && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {language === "es" ? "Precio de Consulta" : "Consultation Price"}
            </span>
            <span className="text-lg font-bold text-teal-600 dark:text-teal-400">
              ${consultationPrice.toLocaleString()}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <Button
            onClick={handleBookAppointment}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500 dark:hover:bg-teal-600 text-sm h-10 shadow-lg shadow-teal-500/20 font-semibold"
          >
            {language === "es" ? "Agendar Consulta" : "Book Appointment"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleViewMore}
            className="w-full text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 h-9 text-sm font-medium"
          >
            {language === "es" ? "Ver Más" : "View More"}
          </Button>
        </div>
      </div>
    </div>
  )
}

