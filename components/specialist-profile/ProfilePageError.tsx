'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface ProfilePageErrorProps {
  title?: string
  message?: string
  isSpanish?: boolean
  onRetry?: () => void
}

/**
 * Error state for the specialist profile page. Use in error boundary or when fetch fails.
 */
export function ProfilePageError({
  title,
  message,
  isSpanish = true,
  onRetry,
}: ProfilePageErrorProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 max-w-md">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
          <AlertCircle className="h-7 w-7" />
        </span>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {title ?? (isSpanish ? 'No se pudo cargar el perfil' : 'Could not load profile')}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {message ?? (isSpanish ? 'Algo salió mal. Intenta de nuevo más tarde.' : 'Something went wrong. Please try again later.')}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="rounded-xl">
            {isSpanish ? 'Reintentar' : 'Retry'}
          </Button>
        )}
      </div>
    </div>
  )
}
