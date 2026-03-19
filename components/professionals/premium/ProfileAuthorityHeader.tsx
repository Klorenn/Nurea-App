"use client"

import Image from "next/image"
import { BadgeCheck, Star, Calendar, MessageCircle, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProfileAuthorityHeaderProps {
  name: string
  title: string
  location?: string
  registrationNumber?: string
  rating: number
  reviewsCount: number
  imageUrl?: string
  verified?: boolean
  yearsExperience?: number
  patientsCount?: number
  isSpanish?: boolean
  onBook: () => void
  onMessage?: () => void
}

export function ProfileAuthorityHeader({
  name,
  title,
  location,
  registrationNumber,
  rating,
  reviewsCount,
  imageUrl,
  verified = true,
  yearsExperience,
  patientsCount,
  isSpanish = true,
  onBook,
  onMessage,
}: ProfileAuthorityHeaderProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Foto circular, pequeña */}
          <div className="flex sm:flex-col gap-3 sm:items-center">
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-slate-500">
                    {name
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                )}
              </div>
              {verified && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-slate-900 p-1 rounded-full border border-slate-200 dark:border-slate-700">
                  <BadgeCheck className="h-4 w-4 text-teal-600" />
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
                  {name}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  {title}
                  {isSpanish ? " – Ver más" : " – See more"}
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label={isSpanish ? "Guardar" : "Save"}
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>

            {(location || registrationNumber) && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                {location}
                {location && registrationNumber && " · "}
                {registrationNumber && (isSpanish ? `Núm. Colegiado: ${registrationNumber}` : `ID: ${registrationNumber}`)}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i <= Math.round(rating)
                        ? "fill-teal-500 text-teal-500"
                        : "text-slate-200 dark:text-slate-600"
                    )}
                  />
                ))}
              </div>
              <button type="button" className="text-sm text-slate-600 dark:text-slate-400 hover:underline">
                {reviewsCount} {isSpanish ? "opiniones" : "reviews"}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <Button
                size="sm"
                onClick={onBook}
                className="bg-teal-600 hover:bg-teal-700 text-white h-9 px-4 rounded-md text-sm font-medium"
              >
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                {isSpanish ? "Agendar cita" : "Book appointment"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onMessage}
                className="h-9 px-4 rounded-md text-sm border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                {isSpanish ? "Enviar mensaje" : "Send message"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
