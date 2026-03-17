'use client'

import { cn } from '@/lib/utils'

/**
 * Skeleton for the specialist profile page. Use with React Suspense.
 */
export function ProfilePageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="h-48 rounded-2xl bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
            <div className="h-16 rounded-xl bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
            <div className="h-64 rounded-2xl bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
            <div className="h-48 rounded-2xl bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
            <div className="h-32 rounded-2xl bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
          </div>
          <div className="hidden lg:block">
            <div className="sticky top-24 h-[420px] rounded-2xl bg-slate-200/80 dark:bg-slate-800 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
