'use client'

import { useState } from 'react'
import { ChevronDown, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AboutSectionProps {
  title?: string
  bio: string
  bioExtended?: string
  isSpanish?: boolean
  className?: string
}

const MAX_VISIBLE_CHARS = 380

/**
 * Humanized "Sobre mí" with readable paragraphs and "Ver más" for long text.
 * Max ~250 words visible before expand.
 */
export function AboutSection({
  title,
  bio,
  bioExtended,
  isSpanish = true,
  className,
}: AboutSectionProps) {
  const fullText = [bio, bioExtended].filter(Boolean).join('\n\n')
  const [expanded, setExpanded] = useState(false)
  const needsExpand = fullText.length > MAX_VISIBLE_CHARS
  const displayText = expanded || !needsExpand
    ? fullText
    : fullText.slice(0, MAX_VISIBLE_CHARS)

  return (
    <section
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50',
        className
      )}
      aria-labelledby="about-heading"
    >
      <h2
        id="about-heading"
        className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white"
      >
        <User className="h-5 w-5 text-teal-600" />
        {title ?? (isSpanish ? 'Sobre mí' : 'About me')}
      </h2>
      <div className="mt-4 space-y-3">
        {displayText.split(/\n\n+/).map((p, i) => (
          <p
            key={i}
            className="text-sm leading-relaxed text-slate-600 dark:text-slate-300"
          >
            {p}
          </p>
        ))}
      </div>
      {needsExpand && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:underline dark:text-teal-400"
        >
          {expanded
            ? (isSpanish ? 'Ver menos' : 'Show less')
            : (isSpanish ? 'Ver más' : 'Read more')}
          <ChevronDown
            className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')}
          />
        </button>
      )}
    </section>
  )
}
