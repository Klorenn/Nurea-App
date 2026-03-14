"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"

interface CancellationPolicyCheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  onPolicyClick?: () => void
  className?: string
  required?: boolean
}

export function CancellationPolicyCheckbox({
  checked,
  onCheckedChange,
  onPolicyClick,
  className,
  required = true,
}: CancellationPolicyCheckboxProps) {
  const { language } = useLanguage()
  const isSpanish = language === "es"

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border border-slate-800 bg-slate-900/50",
        className
      )}
    >
      <Checkbox
        id="cancellation-policy"
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        required={required}
        className="mt-0.5 border-slate-600 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
      />
      <label
        htmlFor="cancellation-policy"
        className="text-sm text-slate-300 leading-relaxed cursor-pointer select-none"
      >
        {isSpanish ? (
          <>
            Entiendo y acepto la{" "}
            <button
              type="button"
              onClick={onPolicyClick}
              className="text-teal-400 underline underline-offset-2 hover:text-teal-300 transition-colors font-medium"
            >
              política de cancelación
            </button>
            : No habrá devoluciones por inasistencia o cancelaciones con menos de 48 horas de anticipación.
          </>
        ) : (
          <>
            I understand and accept the{" "}
            <button
              type="button"
              onClick={onPolicyClick}
              className="text-teal-400 underline underline-offset-2 hover:text-teal-300 transition-colors font-medium"
            >
              cancellation policy
            </button>
            : No refunds will be issued for no-shows or cancellations made less than 48 hours in advance.
          </>
        )}
      </label>
    </div>
  )
}
