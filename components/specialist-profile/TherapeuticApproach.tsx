'use client'

import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TherapeuticApproachProps {
  approaches: string[]
  isSpanish?: boolean
  className?: string
}

/**
 * Therapeutic approach as tags/chips (CBT, Mindfulness, etc.).
 */
export function TherapeuticApproach({
  approaches,
  isSpanish = true,
  className,
}: TherapeuticApproachProps) {
  if (approaches.length === 0) return null

  return (
    <section
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50',
        className
      )}
      aria-labelledby="approach-heading"
    >
      <h2
        id="approach-heading"
        className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white"
      >
        <Sparkles className="h-5 w-5 text-teal-600" />
        {isSpanish ? 'Enfoque terapéutico' : 'Therapeutic approach'}
      </h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {approaches.map((approach) => (
          <span
            key={approach}
            className="rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-700 dark:border-teal-800 dark:bg-teal-900/30 dark:text-teal-300"
          >
            {approach}
          </span>
        ))}
      </div>
    </section>
  )
}
