'use client'

import Image from 'next/image'
import { MapPin, Star, Calendar, MessageCircle, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VerifiedBadge } from '@/components/verified-badge'
import { cn } from '@/lib/utils'

export interface ProfileHeaderProps {
  name: string
  specialty: string
  tagline?: string
  imageUrl: string
  location: string
  verified: boolean
  rating: number
  reviewsCount: number
  isSpanish?: boolean
  onBook: () => void
  onMessage?: () => void
}

/**
 * Above-the-fold header: builds trust and pushes primary CTA.
 * Design: large name, clear specialty, rating (clickable), trust microcopy, dual CTAs.
 */
export function ProfileHeader({
  name,
  specialty,
  tagline,
  imageUrl,
  location,
  verified,
  rating,
  reviewsCount,
  isSpanish = true,
  onBook,
  onMessage,
}: ProfileHeaderProps) {
  return (
    <header className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 md:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
        <div className="flex shrink-0 flex-col items-center sm:items-start">
          <div className="relative">
            <div className="h-28 w-28 overflow-hidden rounded-2xl border-2 border-slate-100 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 md:h-32 md:w-32 flex items-center justify-center">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={name}
                  width={128}
                  height={128}
                  className="h-full w-full object-cover"
                  priority
                  sizes="(max-width: 768px) 112px, 128px"
                />
              ) : (
                <span className="text-2xl font-semibold text-slate-500">
                  {name
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join('')
                    .toUpperCase()}
                </span>
              )}
            </div>
            {verified && (
              <div className="absolute -bottom-1 -right-1 rounded-full border-2 border-white bg-white dark:border-slate-900 dark:bg-slate-900 p-1 shadow">
                <ShieldCheck className="h-5 w-5 text-teal-600" aria-hidden />
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
              {name}
            </h1>
            <p className="mt-0.5 text-base text-slate-500 dark:text-slate-400">
              {specialty}
            </p>
            {location && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <MapPin className="h-4 w-4 shrink-0" />
                {location}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {verified && (
              <VerifiedBadge variant="inline" showLabel isSpanish={isSpanish} />
            )}
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-4 w-4',
                      i <= Math.round(rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200 dark:text-slate-600'
                    )}
                  />
                ))}
              </span>
              <span className="text-slate-600 dark:text-slate-400">
                {rating.toFixed(1)} ({reviewsCount} {isSpanish ? 'opiniones' : 'reviews'})
              </span>
            </button>
          </div>

          {tagline && (
            <p className="max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {tagline}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              onClick={onBook}
              className="h-11 rounded-xl bg-teal-600 px-6 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
            >
              <Calendar className="mr-2 h-4 w-4" />
              {isSpanish ? 'Agendar cita' : 'Book appointment'}
            </Button>
            {onMessage && (
              <Button
                variant="outline"
                onClick={onMessage}
                className="h-11 rounded-xl border-slate-200 bg-white px-6 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                {isSpanish ? 'Enviar mensaje' : 'Send message'}
              </Button>
            )}
          </div>

          <p className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
              {isSpanish ? 'Reserva segura' : 'Secure booking'}
            </span>
            <span>
              {isSpanish ? 'Puedes cancelar sin costo' : 'Free cancellation'}
            </span>
          </p>
        </div>
      </div>
    </header>
  )
}
