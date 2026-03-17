'use client'

import { Star, BadgeCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SpecialistReview } from '@/lib/specialist-profile-types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export interface ReviewsSectionProps {
  reviews: SpecialistReview[]
  averageRating: number
  totalCount: number
  isSpanish?: boolean
  className?: string
}

/**
 * Reviews: average, total, list with initials/name, date, comment, "Opinión verificada".
 * Handles empty state (no reviews).
 */
export function ReviewsSection({
  reviews,
  averageRating,
  totalCount,
  isSpanish = true,
  className,
}: ReviewsSectionProps) {
  return (
    <section
      id="reviews-section"
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50',
        className
      )}
      aria-labelledby="reviews-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2
          id="reviews-heading"
          className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white"
        >
          <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
          {isSpanish ? 'Opiniones' : 'Reviews'}
        </h2>
        {totalCount > 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {averageRating.toFixed(1)} · {totalCount} {isSpanish ? 'opiniones' : 'reviews'}
          </p>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          {isSpanish ? 'Aún no hay opiniones.' : 'No reviews yet.'}
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="border-b border-slate-100 pb-4 last:border-0 last:pb-0 dark:border-slate-800"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
                    {review.authorInitials}
                  </span>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {review.authorName}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={cn(
                              'h-3.5 w-3.5',
                              i <= review.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200 dark:text-slate-600'
                            )}
                          />
                        ))}
                      </span>
                      {review.verified && (
                        <span className="inline-flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          {isSpanish ? 'Opinión verificada' : 'Verified review'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <time
                  className="text-xs text-slate-500 dark:text-slate-400"
                  dateTime={review.createdAt}
                >
                  {format(new Date(review.createdAt), 'd MMM yyyy', {
                    locale: isSpanish ? es : undefined,
                  })}
                </time>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {review.comment}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
