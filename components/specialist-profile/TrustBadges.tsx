'use client'

import {
  Users,
  Briefcase,
  Award,
  Video,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const iconMap: Record<string, LucideIcon> = {
  users: Users,
  briefcase: Briefcase,
  award: Award,
  video: Video,
}

export interface TrustBadgeItem {
  icon: string
  label: string
}

export interface TrustBadgesProps {
  items: TrustBadgeItem[]
  className?: string
}

/**
 * Horizontal strip of trust signals (patients count, experience, certifications, online).
 * Reduces friction by answering "why this specialist?" at a glance.
 */
export function TrustBadges({ items, className }: TrustBadgesProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-4 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/30',
        className
      )}
      role="list"
    >
      {items.map((item, i) => {
        const Icon = iconMap[item.icon] ?? Award
        return (
          <div
            key={i}
            className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
            role="listitem"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-teal-600 shadow-sm dark:bg-slate-800 dark:text-teal-400">
              <Icon className="h-4 w-4" />
            </span>
            <span className="font-medium">{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}
