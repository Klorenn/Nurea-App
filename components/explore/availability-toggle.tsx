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
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left",
        checked
          ? "border-teal-500/50 bg-teal-50/80 dark:bg-teal-950/20 dark:border-teal-800"
          : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
      )}
    >
      <div className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors",
        checked ? "bg-teal-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
      )}>
        <Clock className="h-4 w-4" />
      </div>
      <span className={cn(
        "text-sm font-medium flex-1",
        checked ? "text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-400"
      )}>
        {label}
      </span>
      <div className={cn(
        "w-9 h-5 rounded-full p-0.5 shrink-0 transition-colors",
        checked ? "bg-teal-600" : "bg-slate-200 dark:bg-slate-700"
      )}>
        <motion.div
          className="w-4 h-4 rounded-full bg-white shadow-sm"
          animate={{ x: checked ? 18 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  )
}
