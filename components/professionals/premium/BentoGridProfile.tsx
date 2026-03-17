"use client"

import { useState } from "react"
import { Stethoscope, GraduationCap, ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface BentoGridProfileProps {
  bio: string
  specialties: { icon?: string; name: string }[]
  trajectory: { year: string; institution: string; degree: string }[]
  media?: { type: 'video' | 'image'; url: string; thumbnail?: string }[]
}

export function BentoGridProfile({
  bio,
  specialties,
  trajectory,
}: BentoGridProfileProps) {
  const [isBioExpanded, setIsBioExpanded] = useState(false)

  const hasSpecialties = specialties.length > 0
  const hasTrajectory = trajectory.length > 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
      {/* 1. Bio */}
      <div className="md:col-span-2 bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
        <h2 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
          Experiencia
        </h2>
        <div className={cn(
          "relative overflow-hidden",
          isBioExpanded ? "max-h-none" : "max-h-16"
        )}>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug">
            {bio || "—"}
          </p>
          {!isBioExpanded && bio && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-slate-900 to-transparent" />
          )}
        </div>
        {bio && (
          <button
            type="button"
            onClick={() => setIsBioExpanded(!isBioExpanded)}
            className="mt-1.5 text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            {isBioExpanded ? "Leer menos" : "Leer más"}
            {isBioExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {/* 2. Especialidades - solo si hay datos */}
      {hasSpecialties && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Stethoscope className="h-3.5 w-3.5 text-teal-600" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Especialidades
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {specialties.map((s, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border-0 text-xs font-medium rounded-md py-0.5"
              >
                {s.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 3. Trayectoria - solo si hay datos */}
      {hasTrajectory && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="h-3.5 w-3.5 text-teal-600" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Formación
            </h3>
          </div>
          <div className="space-y-2">
            {trajectory.slice(0, 3).map((t, i) => (
              <div key={i}>
                <p className="text-xs font-medium text-slate-900 dark:text-white">{t.degree}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.institution} · {t.year}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
