"use client"

import { cn } from "@/lib/utils"

export type Category = "all" | "medical" | "wellness" | "lab"

const categories: { id: Category; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "medical", label: "Médicos" },
  { id: "wellness", label: "Bienestar" },
  { id: "lab", label: "Laboratorios" },
]

interface CategoryChipsProps {
  value: Category
  onChange: (value: Category) => void
}

export function CategoryChips({ value, onChange }: CategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {categories.map((cat) => {
        const isActive = cat.id === value
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors flex-shrink-0",
              isActive
                ? "bg-teal-600 text-white shadow-sm dark:bg-teal-500"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            )}
          >
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}
