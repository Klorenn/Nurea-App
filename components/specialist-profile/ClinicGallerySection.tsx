'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ClinicGallerySectionProps {
  images: string[]
  isSpanish?: boolean
  className?: string
}

/**
 * Simple horizontal gallery for clinic photos, similar to Doctoralia's
 * "Fotos y videos". Uses only real image URLs from Supabase.
 */
export function ClinicGallerySection({
  images,
  isSpanish = true,
  className,
}: ClinicGallerySectionProps) {
  if (!images || images.length === 0) return null

  const visible = images.slice(0, 3)
  const remaining = images.length - visible.length

  return (
    <section
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50',
        className
      )}
      aria-labelledby="clinic-gallery-heading"
    >
      <h2
        id="clinic-gallery-heading"
        className="text-lg font-semibold text-slate-900 dark:text-white"
      >
        {isSpanish ? 'Fotos y videos' : 'Photos & videos'}
      </h2>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
        {visible.map((src, index) => (
          <div
            key={src + index}
            className="relative h-28 w-44 shrink-0 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100 dark:border-slate-800 dark:bg-slate-800"
          >
            <Image
              src={src}
              alt={isSpanish ? 'Foto de la consulta' : 'Clinic photo'}
              fill
              className="object-cover"
            />
          </div>
        ))}

        {remaining > 0 && (
          <div className="flex h-28 w-32 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-sm font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200">
            {isSpanish ? `+${remaining} fotos` : `+${remaining} photos`}
          </div>
        )}
      </div>
    </section>
  )
}

