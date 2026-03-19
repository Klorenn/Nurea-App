"use client"

import { useMemo, useState } from "react"
import { SPECIALTY_CONDITIONS, type ConditionOption } from "@/lib/specialty-conditions"
import { cn } from "@/lib/utils"

const SPECIALTIES: { value: string; label: string }[] = [
  { value: "psicologia", label: "Psicología" },
  { value: "psiquiatria", label: "Psiquiatría" },
  { value: "medicina-general", label: "Medicina General" },
  { value: "nutricion", label: "Nutrición" },
  { value: "kinesiologia", label: "Kinesiología" },
  { value: "dermatologia", label: "Dermatología" },
  { value: "cardiologia", label: "Cardiología" },
  { value: "pediatria", label: "Pediatría" },
  { value: "ginecologia", label: "Ginecología" },
  { value: "neurologia", label: "Neurología" },
  { value: "traumatologia", label: "Traumatología" },
]

export interface SearchFiltersValue {
  specialty?: string
  conditions: string[]
}

interface SearchFiltersProps {
  className?: string
  value?: SearchFiltersValue
  onChange?: (value: SearchFiltersValue) => void
}

export function SearchFilters({ className, value, onChange }: SearchFiltersProps) {
  const [internalSpecialty, setInternalSpecialty] = useState<string | undefined>(value?.specialty)
  const [internalConditions, setInternalConditions] = useState<string[]>(value?.conditions ?? [])

  const specialty = value?.specialty ?? internalSpecialty
  const conditions = value?.conditions ?? internalConditions

  const availableConditions: ConditionOption[] = useMemo(
    () => (specialty ? SPECIALTY_CONDITIONS[specialty] ?? [] : []),
    [specialty]
  )

  const emitChange = (next: SearchFiltersValue) => {
    onChange?.(next)
  }

  const handleSpecialtyChange = (nextSpecialty: string | undefined) => {
    setInternalSpecialty(nextSpecialty)
    const resetConditions: string[] = []
    setInternalConditions(resetConditions)
    emitChange({ specialty: nextSpecialty, conditions: resetConditions })
  }

  const toggleCondition = (slug: string) => {
    const nextConditions = conditions.includes(slug)
      ? conditions.filter((c) => c !== slug)
      : [...conditions, slug]

    setInternalConditions(nextConditions)
    emitChange({ specialty, conditions: nextConditions })
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
          Especialidad
        </p>
        <select
          value={specialty ?? ""}
          onChange={(e) => handleSpecialtyChange(e.target.value || undefined)}
          className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        >
          <option value="">Todas</option>
          {SPECIALTIES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {availableConditions.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
            Condiciones que quieres tratar
          </p>
          <div className="flex flex-wrap gap-2">
            {availableConditions.map((cond) => {
              const active = conditions.includes(cond.slug)
              return (
                <button
                  key={cond.slug}
                  type="button"
                  onClick={() => toggleCondition(cond.slug)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    active
                      ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  )}
                >
                  {cond.name}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

