"use client"

import { motion } from "framer-motion"

interface SpecialistCardSkeletonProps {
  index?: number
}

export function SpecialistCardSkeleton({ index = 0 }: SpecialistCardSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse shrink-0" />

          {/* Info skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2 animate-pulse" />
            <div className="flex gap-2 mt-2">
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-14 animate-pulse" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-16 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-md w-16 animate-pulse" />
          <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-md w-20 animate-pulse" />
        </div>
        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-2/3 animate-pulse" />
        <div className="space-y-2">
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full animate-pulse" />
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-4/5 animate-pulse" />
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-20 animate-pulse" />
            <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-24 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg w-24 animate-pulse" />
            <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg w-20 animate-pulse" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function SpecialistGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SpecialistCardSkeleton key={i} index={i} />
      ))}
    </div>
  )
}
