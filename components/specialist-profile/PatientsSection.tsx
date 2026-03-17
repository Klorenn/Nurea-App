'use client'

import { Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PatientsSectionProps {
  groups: string[]
  isSpanish?: boolean
  className?: string
}

/**
 * "Pacientes que atiendo": lista simple de tipos de pacientes (Adultos, Niños, Parejas...)
 */
export function PatientsSection({
  groups,
  isSpanish = true,
  className,
}: PatientsSectionProps) {
  if (!groups || groups.length === 0) return null

  return (
    <section
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50',
        className
      )}
      aria-labelledby="patients-heading"
    >
      <h2
        id="patients-heading"
        className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white"
      >
        <Users className="h-5 w-5 text-teal-600" />
        {isSpanish ? 'Pacientes que atiendo' : 'Patients I see'}
      </h2>
      <ul className="mt-3 space-y-1 text-sm text-slate-700 dark:text-slate-300">
        {groups.map((g) => (
          <li key={g} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            {g}
          </li>
        ))}
      </ul>
    </section>
  )
}

