"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SpecialistCardSkeletonProps {
  index?: number
}

export function SpecialistCardSkeleton({ index = 0 }: SpecialistCardSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-card rounded-2xl border border-border/40 overflow-hidden"
    >
      <div className="p-5 pb-0">
        <div className="flex gap-4">
          {/* Avatar skeleton */}
          <div className="w-20 h-20 rounded-2xl bg-muted animate-pulse" />

          {/* Info skeleton */}
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-muted rounded-lg w-3/4 animate-pulse" />
            <div className="h-4 bg-muted rounded-lg w-1/2 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-4 bg-muted rounded-lg w-16 animate-pulse" />
              <div className="h-4 bg-muted rounded-lg w-20 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 pt-4 space-y-3">
        {/* Tags skeleton */}
        <div className="flex gap-2">
          <div className="h-6 bg-muted rounded-full w-20 animate-pulse" />
          <div className="h-6 bg-muted rounded-full w-24 animate-pulse" />
          <div className="h-6 bg-muted rounded-full w-16 animate-pulse" />
        </div>

        {/* Location skeleton */}
        <div className="h-4 bg-muted rounded-lg w-2/3 animate-pulse" />

        {/* Bio skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded-lg w-full animate-pulse" />
          <div className="h-4 bg-muted rounded-lg w-4/5 animate-pulse" />
        </div>

        {/* Footer skeleton */}
        <div className="pt-3 border-t border-border/40 flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-3 bg-muted rounded w-20 animate-pulse" />
            <div className="h-7 bg-muted rounded-lg w-24 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 bg-muted rounded-xl w-24 animate-pulse" />
            <div className="h-9 bg-muted rounded-xl w-20 animate-pulse" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function SpecialistGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SpecialistCardSkeleton key={i} index={i} />
      ))}
    </div>
  )
}
