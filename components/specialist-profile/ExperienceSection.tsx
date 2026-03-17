'use client'

import { GraduationCap, Award, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EducationItem } from '@/lib/specialist-profile-types'

export interface ExperienceSectionProps {
  experienceYears: number
  education: EducationItem[]
  certifications: string[]
  /** Previsiones/seguros aceptados del profesional (Fonasa, Isapres, etc.) */
  acceptedInsurancesCount?: number
  isSpanish?: boolean
  className?: string
}

/**
 * Experience & education: years, university, certifications, diplomas.
 * Timeline-style list with icons for clarity.
 */
export function ExperienceSection({
  experienceYears,
  education,
  certifications,
  acceptedInsurancesCount,
  isSpanish = true,
  className,
}: ExperienceSectionProps) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50',
        className
      )}
      aria-labelledby="experience-heading"
    >
      <h2
        id="experience-heading"
        className="text-lg font-semibold text-slate-900 dark:text-white"
      >
        {isSpanish ? 'Experiencia y formación' : 'Experience & education'}
      </h2>

      {/* Summary stats row (e.g. "10 Formación", "1 Seguros aceptados") */}
      <div className="mt-4 flex flex-wrap gap-6 text-sm text-slate-700 dark:text-slate-300">
        {education.length > 0 && (
          <div className="flex flex-col">
            <span className="text-xl font-semibold text-slate-900 dark:text-white">
              {education.length}
            </span>
            <button
              type="button"
              className="text-xs font-medium underline underline-offset-2 decoration-slate-300 dark:decoration-slate-600 hover:text-teal-700 dark:hover:text-teal-300"
            >
              {isSpanish ? 'Formación' : 'Training'}
            </button>
          </div>
        )}

        {typeof acceptedInsurancesCount === 'number' && acceptedInsurancesCount > 0 && (
          <div className="flex flex-col">
            <span className="text-xl font-semibold text-slate-900 dark:text-white">
              {acceptedInsurancesCount}
            </span>
            <button
              type="button"
              className="text-xs font-medium underline underline-offset-2 decoration-slate-300 dark:decoration-slate-600 hover:text-teal-700 dark:hover:text-teal-300"
            >
              {isSpanish ? 'Seguros aceptados' : 'Accepted plans'}
            </button>
          </div>
        )}
      </div>

      <div className="mt-5 space-y-5">
        {experienceYears > 0 && (
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
              <Briefcase className="h-5 w-5" />
            </span>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                {experienceYears} {isSpanish ? 'años de experiencia' : 'years of experience'}
              </p>
            </div>
          </div>
        )}

        {education.length > 0 && (
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
              <GraduationCap className="h-5 w-5" />
            </span>
            <ul className="space-y-2">
              {education.map((item, i) => (
                <li key={i}>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {item.degree}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.institution} · {item.year}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {certifications.length > 0 && (
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
              <Award className="h-5 w-5" />
            </span>
            <ul className="list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-300">
              {certifications.map((cert, i) => (
                <li key={i}>{cert}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
