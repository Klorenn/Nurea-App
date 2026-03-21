'use client'

import { MapPin, Video } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormatsSectionProps {
  hasInPerson: boolean
  hasOnline: boolean
  locationLabel?: string
  isSpanish?: boolean
  onViewMap?: () => void
  className?: string
}

/**
 * Formats of consultation: in-person / online, similar to Doctoralia's
 * "En persona · Ver ubicaciones" / "Videoconsulta · Ver calendario en línea".
 */
export function FormatsSection({
  hasInPerson,
  hasOnline,
  locationLabel,
  isSpanish = true,
  onViewMap,
  className,
}: FormatsSectionProps) {
  if (!hasInPerson && !hasOnline) return null

  return (
    <section
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50',
        className
      )}
      aria-labelledby="formats-heading"
    >
      <h2
        id="formats-heading"
        className="text-lg font-semibold text-slate-900 dark:text-white"
      >
        {isSpanish ? 'Formatos de consulta' : 'Consultation formats'}
      </h2>

      <div className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
        {hasInPerson && (
          <div className="flex items-start gap-2 px-2 py-1.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
            <div>
              <span className="font-medium">
                {isSpanish ? 'En persona' : 'In-person'}
              </span>
              {locationLabel && (
                <span className="ml-1 text-slate-500 dark:text-slate-400">
                  · {locationLabel}
                </span>
              )}
            </div>
          </div>
        )}

        {hasOnline && (
          <div className="flex items-start gap-2 px-2 py-1.5">
            <Video className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
            <div>
              <span className="font-medium">
                {isSpanish ? 'Videoconsulta' : 'Online consultation'}
              </span>
              <span className="ml-1 text-slate-500 dark:text-slate-400">
                · {isSpanish ? 'Desde donde estés, por videollamada' : 'From anywhere, via video call'}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

