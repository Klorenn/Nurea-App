"use client"

import { cn } from "@/lib/utils"

export interface MissingItem {
  label: string
  points: number
  onAdd?: () => void
}

interface ProfileCompletenessProps {
  score: number
  missingItems?: MissingItem[]
  className?: string
}

export function ProfileCompleteness({
  score,
  missingItems = [],
  className,
}: ProfileCompletenessProps) {
  const hint = missingItems.length > 0
    ? `Agregar: ${missingItems.map((i) => i.label).join(", ")}`
    : score >= 100
    ? "¡Perfil completo!"
    : null

  return (
    <div
      className={cn("bg-white flex items-center gap-3.5 px-6 py-3", className)}
      style={{
        borderBottom: "1px solid #e2e8f0",
        borderTop: "1px solid #e2e8f0",
      }}
    >
      <span
        className="shrink-0 whitespace-nowrap"
        style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}
      >
        Completitud del perfil
      </span>

      <div
        className="flex-1 overflow-hidden"
        style={{ height: 5, background: "#e2e8f0", borderRadius: 99 }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(100, score)}%`,
            background: score >= 80
              ? "linear-gradient(90deg, #0d9488, #22c55e)"
              : "linear-gradient(90deg, #f97316, #eab308)",
            borderRadius: 99,
            transition: "width 0.5s ease",
          }}
        />
      </div>

      <span
        className="shrink-0 tabular-nums"
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: score >= 80 ? "#0d9488" : "#f97316",
        }}
      >
        {score} <span style={{ fontSize: 11, fontWeight: 500, color: "#94a3b8" }}>/ 100</span>
      </span>

      {hint && (
        <span className="shrink-0 hidden sm:block" style={{ fontSize: 11, color: "#94a3b8" }}>
          · {hint}
        </span>
      )}
    </div>
  )
}
