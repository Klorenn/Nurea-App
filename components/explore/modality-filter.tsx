"use client"

import { Video, Building2, Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ConsultationType } from "@/types"

interface ModalityFilterProps {
  value: ConsultationType | "all"
  onChange: (value: ConsultationType | "all") => void
  lang?: string
}

const options = [
  {
    value: "all" as const,
    labelEs: "Todos",
    labelEn: "All",
    icon: Layers,
  },
  {
    value: "online" as const,
    labelEs: "Telemedicina",
    labelEn: "Telemedicine",
    icon: Video,
  },
  {
    value: "in-person" as const,
    labelEs: "Presencial",
    labelEn: "In-person",
    icon: Building2,
  },
]

export function ModalityFilter({ value, onChange, lang = "es" }: ModalityFilterProps) {
  return (
    <div className="flex flex-col rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {options.map((option) => {
        const isSelected = value === option.value
        const Icon = option.icon
        const label = lang === "es" ? option.labelEs : option.labelEn

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-left transition-colors border-b border-slate-100 dark:border-slate-800 last:border-b-0",
              isSelected
                ? "bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
