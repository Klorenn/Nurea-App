"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"

export interface MissingItem {
  label: string
  points: number
  onAdd?: () => void
}

interface ProfileCompletenessProps {
  /** Puntuación de 0 a 100 */
  score: number
  /** Texto cuando falta información */
  missingHint?: string
  /** Items que suman puntos si se completan (ej. Premios +1) */
  missingItems?: MissingItem[]
  className?: string
}

export function ProfileCompleteness({
  score,
  missingHint = "Agrega la información que falta",
  missingItems = [],
  className,
}: ProfileCompletenessProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 shadow-sm",
        className
      )}
    >
      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3">
        ¿Qué tan atractivo es tu perfil?
      </h3>
      <div className="flex items-center gap-4 mb-3">
        <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              score >= 80
                ? "bg-gradient-to-r from-teal-500 to-emerald-500"
                : score >= 50
                ? "bg-gradient-to-r from-amber-400 to-teal-400"
                : "bg-gradient-to-r from-red-400 to-amber-400"
            )}
            style={{ width: `${Math.min(100, score)}%` }}
          />
        </div>
        <span className="text-lg font-bold tabular-nums text-slate-900 dark:text-white shrink-0">
          {score} <span className="text-slate-500 dark:text-slate-400 font-normal text-sm">/ 100</span>
        </span>
      </div>
      {score < 100 && (
        <>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            {missingHint}
          </p>
          {missingItems.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {missingItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {item.label} <span className="text-teal-600 dark:text-teal-400 font-medium">(+{item.points})</span>
                  </span>
                  {item.onAdd && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={item.onAdd}
                      className="h-7 px-2 text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Agregar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {score >= 100 && (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          ¡Perfecto! Tu perfil está completo y listo para recibir pacientes.
        </p>
      )}
    </div>
  )
}
