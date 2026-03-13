"use client"

import { motion } from "framer-motion"
import { Calendar, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface AvailabilityToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  lang?: string
}

export function AvailabilityToggle({ checked, onChange, lang = "es" }: AvailabilityToggleProps) {
  const label = lang === "es" ? "Disponible hoy" : "Available today"

  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-xl border transition-all",
        checked
          ? "border-teal-500 bg-teal-50 dark:bg-teal-950/30"
          : "border-border/40 hover:border-border hover:bg-accent/20"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
        checked
          ? "bg-teal-500 text-white"
          : "bg-accent text-muted-foreground"
      )}>
        <Clock className="h-5 w-5" />
      </div>

      <div className="flex-1 text-left">
        <span className={cn(
          "text-sm font-medium transition-colors",
          checked ? "text-teal-700 dark:text-teal-300" : "text-foreground"
        )}>
          {label}
        </span>
      </div>

      <div className={cn(
        "w-10 h-6 rounded-full p-0.5 transition-colors",
        checked ? "bg-teal-500" : "bg-muted"
      )}>
        <motion.div
          className="w-5 h-5 rounded-full bg-white shadow-sm"
          animate={{ x: checked ? 16 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  )
}
