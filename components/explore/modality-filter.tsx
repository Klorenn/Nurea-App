"use client"

import { motion } from "framer-motion"
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
    <div className="flex rounded-xl bg-accent/30 p-1 gap-1">
      {options.map((option) => {
        const isSelected = value === option.value
        const Icon = option.icon
        const label = lang === "es" ? option.labelEs : option.labelEn

        return (
          <motion.button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
              isSelected
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            whileTap={{ scale: 0.98 }}
          >
            {isSelected && (
              <motion.div
                layoutId="modality-pill"
                className="absolute inset-0 bg-background shadow-sm rounded-lg"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            <Icon className="relative z-10 h-4 w-4" />
            <span className="relative z-10 hidden sm:inline">{label}</span>
          </motion.button>
        )
      })}
    </div>
  )
}
