'use client'

import { useState } from 'react'
import { Calendar, Video, MapPin, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SpecialistService } from '@/lib/specialist-profile-types'

export interface ServiceSelectorProps {
  services: SpecialistService[]
  location?: string
  locationAddress?: string
  isSpanish?: boolean
  onSelectService?: (service: SpecialistService) => void
  onBook?: (service: SpecialistService) => void
  className?: string
}

function ModalityBadge({ modality, isSpanish }: { modality?: string; isSpanish: boolean }) {
  if (!modality || modality === 'both') return null
  const isOnline = modality === 'online'
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
      isOnline
        ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300'
        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
    )}>
      {isOnline ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
      {isOnline
        ? (isSpanish ? 'Online' : 'Online')
        : (isSpanish ? 'Presencial' : 'In-person')}
    </span>
  )
}

export function ServiceSelector({
  services,
  location,
  locationAddress,
  isSpanish = true,
  onBook,
  className,
}: ServiceSelectorProps) {
  const [showAll, setShowAll] = useState(false)

  if (services.length === 0) return null

  const displayed = showAll ? services : services.slice(0, 3)
  const hasMore = services.length > 3

  return (
    <section className={cn('space-y-3', className)} aria-labelledby="services-heading">
      <div className="flex items-center justify-between">
        <h2 id="services-heading" className="text-lg font-semibold text-slate-900 dark:text-white">
          {isSpanish ? 'Servicios y precios' : 'Services & prices'}
        </h2>
        {services.length > 1 && (
          <span className="text-sm text-slate-400">
            {services.length} {isSpanish ? 'opciones' : 'options'}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {displayed.map((service) => (
          <div
            key={service.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 dark:border-slate-800 dark:bg-slate-900/50"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {service.name}
                </p>
                <ModalityBadge modality={service.modality} isSpanish={isSpanish} />
              </div>
              {service.description && (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {service.description}
                </p>
              )}
              {service.durationMinutes && (
                <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="h-3 w-3" />
                  {service.durationMinutes} min
                </div>
              )}
            </div>

            <div className="ml-4 flex shrink-0 flex-col items-end gap-2">
              <div className="text-right">
                <p className="text-base font-bold text-slate-900 dark:text-white">
                  {service.price === 0
                    ? (isSpanish ? 'Gratis' : 'Free')
                    : `$${service.price.toLocaleString('es-CL')}`}
                </p>
                {service.price > 0 && (
                  <p className="text-[11px] text-slate-400">{service.currency ?? 'CLP'}</p>
                )}
              </div>
              {onBook && (
                <Button
                  size="sm"
                  className="h-8 rounded-xl bg-teal-600 px-3 text-xs font-semibold text-white hover:bg-teal-500"
                  onClick={() => onBook(service)}
                >
                  <Calendar className="mr-1 h-3 w-3" />
                  {isSpanish ? 'Reservar' : 'Book'}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full rounded-xl border border-dashed border-slate-200 py-2 text-sm text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400"
        >
          {showAll
            ? (isSpanish ? 'Ver menos' : 'Show less')
            : (isSpanish ? `Ver ${services.length - 3} más` : `See ${services.length - 3} more`)}
        </button>
      )}

      {/* Info de ubicación si hay servicios presenciales */}
      {services.some(s => s.modality === 'in-person' || s.modality === 'both') && locationAddress && (
        <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
          <div>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {isSpanish ? 'Ubicación' : 'Location'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{locationAddress}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs text-teal-600 hover:underline dark:text-teal-400"
            >
              Ver en Google Maps
            </a>
          </div>
        </div>
      )}
    </section>
  )
}
