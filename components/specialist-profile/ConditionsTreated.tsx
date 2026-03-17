'use client'

import { Stethoscope } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ConditionsTreatedProps {
  conditions: string[]
  isSpanish?: boolean
  className?: string
}

/**
 * Conditions treated as grid/tags (Ansiedad, Depresión, etc.).
 */
export function ConditionsTreated({
  conditions,
  isSpanish = true,
  className,
}: ConditionsTreatedProps) {
  if (conditions.length === 0) return null

  return (
    <section
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50',
        className
      )}
      aria-labelledby="conditions-heading"
    >
      <h2
        id="conditions-heading"
        className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white"
      >
        <Stethoscope className="h-5 w-5 text-teal-600" />
        {isSpanish ? 'Condiciones que trata' : 'Conditions treated'}
      </h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {conditions.map((condition) => (
          <span
            key={condition}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            {condition}
          </span>
        ))}
      </div>
    </section>
  )
}
