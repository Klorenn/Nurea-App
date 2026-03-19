'use client'

import { Calendar, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SpecialistService } from '@/lib/specialist-profile-types'

export interface ServicesListProps {
  services: SpecialistService[]
  isSpanish?: boolean
  onReserve?: (service: SpecialistService) => void
  className?: string
}

/**
 * Services & prices: name, short description, price, CTA "Reservar".
 * Each card has clear price and primary action.
 */
export function ServicesList({
  services,
  isSpanish = true,
  onReserve,
  className,
}: ServicesListProps) {
  if (services.length === 0) return null

  return (
    <section
      className={cn('space-y-4', className)}
      aria-labelledby="services-heading"
    >
      <h2
        id="services-heading"
        className="text-lg font-semibold text-slate-900 dark:text-white"
      >
        {isSpanish ? 'Servicios y precios' : 'Services & prices'}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {services.map((service) => (
          <div
            key={service.id}
            className="flex flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
          >
            <div className="flex-1">
              <h3 className="font-medium text-slate-900 dark:text-white">
                {service.name}
              </h3>
              {service.description && (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {service.description}
                </p>
              )}
              <p className="mt-2 flex items-center gap-1.5 text-lg font-semibold text-slate-900 dark:text-white">
                <Wallet className="h-4 w-4 text-teal-600" />
                ${service.price.toLocaleString('es-CL')} {service.currency ?? 'CLP'}
                {service.durationMinutes && (
                  <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                    · {service.durationMinutes} min
                  </span>
                )}
              </p>
            </div>
            <Button
              onClick={() => onReserve?.(service)}
              className="mt-4 w-full rounded-xl bg-teal-600 hover:bg-teal-700"
            >
              <Calendar className="mr-2 h-4 w-4" />
              {isSpanish ? 'Reservar' : 'Book'}
            </Button>
          </div>
        ))}
      </div>
    </section>
  )
}
